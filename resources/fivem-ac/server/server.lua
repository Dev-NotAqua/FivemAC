-- FivemAC Server-Side System
-- Author: Dev-NotAqua
-- Version: 1.0.0

local config = json.decode(LoadResourceFile(GetCurrentResourceName(), 'config.json'))
local playerScores = {}
local playerWarnings = {}
local banList = {}
local eventLog = {}

local isDebug = config.general.debug or false

-- Utility Functions
local function Debug(message)
    if isDebug then
        print("[FivemAC Server Debug] " .. tostring(message))
    end
end

local function GetPlayerIdentifier(source)
    local identifiers = GetPlayerIdentifiers(source)
    for _, id in pairs(identifiers) do
        if string.find(id, "license:") then
            return id
        end
    end
    return nil
end

local function GetPlayerDiscordId(source)
    local identifiers = GetPlayerIdentifiers(source)
    for _, id in pairs(identifiers) do
        if string.find(id, "discord:") then
            return string.gsub(id, "discord:", "")
        end
    end
    return nil
end

-- Database Functions
local function InitializeDatabase()
    if not config.database.enabled then return end
    
    -- Create tables if they don't exist
    local queries = {
        string.format([[
            CREATE TABLE IF NOT EXISTS %s (
                id INT AUTO_INCREMENT PRIMARY KEY,
                player_license VARCHAR(255) NOT NULL,
                player_name VARCHAR(255) NOT NULL,
                event_type VARCHAR(100) NOT NULL,
                event_data JSON,
                severity INT NOT NULL,
                timestamp BIGINT NOT NULL,
                INDEX idx_player (player_license),
                INDEX idx_timestamp (timestamp),
                INDEX idx_event_type (event_type)
            )
        ]], config.database.tables.events),
        
        string.format([[
            CREATE TABLE IF NOT EXISTS %s (
                id INT AUTO_INCREMENT PRIMARY KEY,
                player_license VARCHAR(255) NOT NULL UNIQUE,
                player_name VARCHAR(255) NOT NULL,
                ban_reason TEXT,
                ban_type ENUM('warning', 'kick', 'temp', 'permanent') NOT NULL,
                ban_duration INT DEFAULT 0,
                banned_at BIGINT NOT NULL,
                expires_at BIGINT NULL,
                banned_by VARCHAR(255),
                active BOOLEAN DEFAULT TRUE,
                INDEX idx_player (player_license),
                INDEX idx_active (active),
                INDEX idx_expires (expires_at)
            )
        ]], config.database.tables.bans),
        
        string.format([[
            CREATE TABLE IF NOT EXISTS %s (
                player_license VARCHAR(255) PRIMARY KEY,
                player_name VARCHAR(255) NOT NULL,
                total_score INT DEFAULT 0,
                warning_count INT DEFAULT 0,
                kick_count INT DEFAULT 0,
                temp_ban_count INT DEFAULT 0,
                last_seen BIGINT NOT NULL,
                first_seen BIGINT NOT NULL,
                INDEX idx_score (total_score),
                INDEX idx_last_seen (last_seen)
            )
        ]], config.database.tables.players)
    }
    
    for _, query in ipairs(queries) do
        exports.oxmysql:execute(query)
    end
    
    Debug("Database initialized")
end

local function LogEvent(playerLicense, playerName, eventType, eventData, severity)
    if not config.database.enabled then return end
    
    local query = string.format([[
        INSERT INTO %s (player_license, player_name, event_type, event_data, severity, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    ]], config.database.tables.events)
    
    exports.oxmysql:execute(query, {
        playerLicense,
        playerName,
        eventType,
        json.encode(eventData),
        severity,
        os.time() * 1000
    })
end

local function UpdatePlayerStats(playerLicense, playerName)
    if not config.database.enabled then return end
    
    local score = playerScores[playerLicense] or 0
    local warnings = playerWarnings[playerLicense] or 0
    
    local query = string.format([[
        INSERT INTO %s (player_license, player_name, total_score, warning_count, last_seen, first_seen)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        player_name = VALUES(player_name),
        total_score = VALUES(total_score),
        warning_count = VALUES(warning_count),
        last_seen = VALUES(last_seen)
    ]], config.database.tables.players)
    
    local timestamp = os.time() * 1000
    exports.oxmysql:execute(query, {
        playerLicense,
        playerName,
        score,
        warnings,
        timestamp,
        timestamp
    })
end

local function AddBan(playerLicense, playerName, banType, reason, duration, bannedBy)
    if not config.database.enabled then return end
    
    local timestamp = os.time() * 1000
    local expiresAt = nil
    
    if banType == "temp" and duration > 0 then
        expiresAt = timestamp + (duration * 1000)
    end
    
    local query = string.format([[
        INSERT INTO %s (player_license, player_name, ban_reason, ban_type, ban_duration, banned_at, expires_at, banned_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        ban_reason = VALUES(ban_reason),
        ban_type = VALUES(ban_type),
        ban_duration = VALUES(ban_duration),
        banned_at = VALUES(banned_at),
        expires_at = VALUES(expires_at),
        banned_by = VALUES(banned_by),
        active = TRUE
    ]], config.database.tables.bans)
    
    exports.oxmysql:execute(query, {
        playerLicense,
        playerName,
        reason,
        banType,
        duration,
        timestamp,
        expiresAt,
        bannedBy or "SYSTEM"
    })
end

-- Discord Integration
local function SendDiscordWebhook(eventType, playerName, playerId, data, severity)
    if not config.discord.enabled then return end
    
    local color = config.discord.colors.warning
    local title = "⚠️ Anticheat Alert"
    
    if severity >= config.scoring.permBanThreshold then
        color = config.discord.colors.permBan
        title = "🔨 Permanent Ban Issued"
    elseif severity >= config.scoring.tempBanThreshold then
        color = config.discord.colors.tempBan
        title = "⏰ Temporary Ban Issued"
    elseif severity >= config.scoring.kickThreshold then
        color = config.discord.colors.kick
        title = "👢 Player Kicked"
    end
    
    local embed = {
        title = title,
        color = color,
        timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ"),
        fields = {
            {
                name = "Player",
                value = string.format("%s (ID: %s)", playerName, playerId),
                inline = true
            },
            {
                name = "Event Type",
                value = eventType,
                inline = true
            },
            {
                name = "Severity",
                value = tostring(severity),
                inline = true
            },
            {
                name = "Data",
                value = "```json\n" .. json.encode(data, {indent = true}) .. "\n```",
                inline = false
            }
        },
        footer = {
            text = "FivemAC v" .. config.general.version
        }
    }
    
    local payload = {
        embeds = {embed}
    }
    
    PerformHttpRequest(config.discord.webhook, function(err, text, headers)
        if err ~= 200 then
            Debug("Discord webhook failed: " .. tostring(err))
        end
    end, 'POST', json.encode(payload), {['Content-Type'] = 'application/json'})
end

-- Scoring and Punishment System
local function AddScore(source, eventType, severity, data)
    local playerLicense = GetPlayerIdentifier(source)
    local playerName = GetPlayerName(source)
    
    if not playerLicense then return end
    
    if not playerScores[playerLicense] then
        playerScores[playerLicense] = 0
        playerWarnings[playerLicense] = 0
    end
    
    playerScores[playerLicense] = playerScores[playerLicense] + severity
    
    -- Log the event
    LogEvent(playerLicense, playerName, eventType, data, severity)
    UpdatePlayerStats(playerLicense, playerName)
    
    -- Add to event log for UI
    table.insert(eventLog, {
        timestamp = os.time() * 1000,
        playerId = source,
        playerName = playerName,
        playerLicense = playerLicense,
        eventType = eventType,
        severity = severity,
        data = data,
        totalScore = playerScores[playerLicense]
    })
    
    -- Keep only last 1000 events
    if #eventLog > config.ui.maxLogEntries then
        table.remove(eventLog, 1)
    end
    
    -- Send Discord notification
    SendDiscordWebhook(eventType, playerName, source, data, severity)
    
    -- Check for punishment thresholds
    local currentScore = playerScores[playerLicense]
    
    if currentScore >= config.scoring.permBanThreshold and config.punishments.enablePermBans then
        local reason = string.format("Anticheat violation: %s (Score: %d)", eventType, currentScore)
        AddBan(playerLicense, playerName, "permanent", reason, 0, "SYSTEM")
        DropPlayer(source, reason)
        Debug("Permanent ban issued for " .. playerName .. " (Score: " .. currentScore .. ")")
        
    elseif currentScore >= config.scoring.tempBanThreshold and config.punishments.enableTempBans then
        local reason = string.format("Anticheat violation: %s (Score: %d)", eventType, currentScore)
        AddBan(playerLicense, playerName, "temp", reason, config.punishments.tempBanDuration, "SYSTEM")
        DropPlayer(source, reason .. " - Temporary ban for " .. config.punishments.tempBanDuration .. " seconds")
        Debug("Temporary ban issued for " .. playerName .. " (Score: " .. currentScore .. ")")
        
    elseif currentScore >= config.scoring.kickThreshold and config.punishments.enableKicks then
        local reason = string.format("Anticheat violation: %s (Score: %d)", eventType, currentScore)
        DropPlayer(source, reason)
        Debug("Kick issued for " .. playerName .. " (Score: " .. currentScore .. ")")
        
    elseif currentScore >= config.scoring.warningThreshold and config.punishments.enableWarnings then
        playerWarnings[playerLicense] = playerWarnings[playerLicense] + 1
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 255, 0},
            multiline = true,
            args = {"[ANTICHEAT]", string.format("Warning %d/%d: Suspicious activity detected (%s)", 
                playerWarnings[playerLicense], config.punishments.maxWarnings, eventType)}
        })
        Debug("Warning issued for " .. playerName .. " (Score: " .. currentScore .. ")")
    end
end

local function DecayScores()
    for playerLicense, score in pairs(playerScores) do
        if score > 0 then
            playerScores[playerLicense] = math.max(0, score - (score * config.scoring.decayRate))
            if playerScores[playerLicense] == 0 then
                playerScores[playerLicense] = nil
            end
        end
    end
end

-- Ban Management
local function CheckPlayerBan(source)
    local playerLicense = GetPlayerIdentifier(source)
    if not playerLicense or not config.database.enabled then return false end
    
    local query = string.format([[
        SELECT * FROM %s 
        WHERE player_license = ? AND active = TRUE 
        AND (expires_at IS NULL OR expires_at > ?)
        LIMIT 1
    ]], config.database.tables.bans)
    
    local result = exports.oxmysql:executeSync(query, {playerLicense, os.time() * 1000})
    
    if result and #result > 0 then
        local ban = result[1]
        local reason = ban.ban_reason or "Anticheat violation"
        
        if ban.ban_type == "permanent" then
            DropPlayer(source, "You are permanently banned: " .. reason)
            return true
        elseif ban.ban_type == "temp" and ban.expires_at then
            local timeLeft = math.ceil((ban.expires_at - (os.time() * 1000)) / 1000)
            if timeLeft > 0 then
                DropPlayer(source, string.format("You are temporarily banned for %d seconds: %s", timeLeft, reason))
                return true
            else
                -- Ban expired, deactivate it
                local updateQuery = string.format("UPDATE %s SET active = FALSE WHERE id = ?", config.database.tables.bans)
                exports.oxmysql:execute(updateQuery, {ban.id})
            end
        end
    end
    
    return false
end

-- Event Handlers
RegisterNetEvent('FivemAC:Flag')
AddEventHandler('FivemAC:Flag', function(eventData)
    local source = source
    Debug("Received flag from player " .. source .. ": " .. eventData.type)
    AddScore(source, eventData.type, eventData.severity, eventData.data)
end)

RegisterNetEvent('FivemAC:PlayerConnected')
AddEventHandler('FivemAC:PlayerConnected', function()
    local source = source
    Debug("Player " .. source .. " connected to anticheat system")
end)

RegisterNetEvent('FivemAC:PlayerInfo')
AddEventHandler('FivemAC:PlayerInfo', function(playerInfo)
    local source = source
    Debug("Received player info from " .. source)
    -- TODO: Process player info for additional validation
end)

-- Admin Commands
RegisterCommand('acban', function(source, args, rawCommand)
    if not IsPlayerAceAllowed(source, config.ui.adminPermission) then
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 0, 0},
            args = {"[ANTICHEAT]", "Access denied"}
        })
        return
    end
    
    if #args < 2 then
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 255, 0},
            args = {"[ANTICHEAT]", "Usage: /acban <player_id> <reason>"}
        })
        return
    end
    
    local targetId = tonumber(args[1])
    local reason = table.concat(args, " ", 2)
    
    if not targetId or not GetPlayerName(targetId) then
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 0, 0},
            args = {"[ANTICHEAT]", "Invalid player ID"}
        })
        return
    end
    
    local targetLicense = GetPlayerIdentifier(targetId)
    local targetName = GetPlayerName(targetId)
    local adminName = GetPlayerName(source)
    
    if targetLicense then
        AddBan(targetLicense, targetName, "permanent", reason, 0, adminName)
        DropPlayer(targetId, "Banned by admin: " .. reason)
        
        TriggerClientEvent('chat:addMessage', source, {
            color = {0, 255, 0},
            args = {"[ANTICHEAT]", "Player " .. targetName .. " has been banned"}
        })
    end
end, false)

RegisterCommand('acscore', function(source, args, rawCommand)
    if not IsPlayerAceAllowed(source, config.ui.adminPermission) then return end
    
    if #args < 1 then
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 255, 0},
            args = {"[ANTICHEAT]", "Usage: /acscore <player_id>"}
        })
        return
    end
    
    local targetId = tonumber(args[1])
    if not targetId or not GetPlayerName(targetId) then
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 0, 0},
            args = {"[ANTICHEAT]", "Invalid player ID"}
        })
        return
    end
    
    local targetLicense = GetPlayerIdentifier(targetId)
    local score = playerScores[targetLicense] or 0
    local warnings = playerWarnings[targetLicense] or 0
    
    TriggerClientEvent('chat:addMessage', source, {
        color = {0, 255, 255},
        args = {"[ANTICHEAT]", string.format("Player %s - Score: %d, Warnings: %d", 
            GetPlayerName(targetId), score, warnings)}
    })
end, false)

-- NUI Callbacks
RegisterNUICallback('getPlayers', function(data, cb)
    local players = {}
    
    for _, playerId in ipairs(GetPlayers()) do
        local playerLicense = GetPlayerIdentifier(playerId)
        if playerLicense then
            players[#players + 1] = {
                id = playerId,
                name = GetPlayerName(playerId),
                license = playerLicense,
                score = playerScores[playerLicense] or 0,
                warnings = playerWarnings[playerLicense] or 0
            }
        end
    end
    
    cb(players)
end)

RegisterNUICallback('getLogs', function(data, cb)
    local filteredLogs = {}
    
    for _, log in ipairs(eventLog) do
        local include = true
        
        if data.playerId and log.playerId ~= tonumber(data.playerId) then
            include = false
        end
        
        if data.eventType and log.eventType ~= data.eventType then
            include = false
        end
        
        if data.startTime and log.timestamp < data.startTime then
            include = false
        end
        
        if data.endTime and log.timestamp > data.endTime then
            include = false
        end
        
        if include then
            filteredLogs[#filteredLogs + 1] = log
        end
    end
    
    cb(filteredLogs)
end)

RegisterNUICallback('banPlayer', function(data, cb)
    if not data.playerId or not data.reason then
        cb({success = false, error = "Missing required data"})
        return
    end
    
    local targetLicense = GetPlayerIdentifier(data.playerId)
    local targetName = GetPlayerName(data.playerId)
    
    if targetLicense then
        local banType = data.duration and data.duration > 0 and "temp" or "permanent"
        AddBan(targetLicense, targetName, banType, data.reason, data.duration or 0, "ADMIN")
        DropPlayer(data.playerId, "Banned by admin: " .. data.reason)
        cb({success = true})
    else
        cb({success = false, error = "Player not found"})
    end
end)

-- Player Events
AddEventHandler('playerConnecting', function(name, setKickReason, deferrals)
    local source = source
    deferrals.defer()
    
    Citizen.Wait(0)
    
    if CheckPlayerBan(source) then
        deferrals.done("You are banned from this server")
        return
    end
    
    deferrals.done()
end)

AddEventHandler('playerDropped', function(reason)
    local source = source
    local playerLicense = GetPlayerIdentifier(source)
    
    if playerLicense then
        UpdatePlayerStats(playerLicense, GetPlayerName(source))
        Debug("Player " .. GetPlayerName(source) .. " disconnected")
    end
end)

-- Score Decay Timer
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(config.scoring.decayInterval)
        DecayScores()
    end
end)

-- Initialize
Citizen.CreateThread(function()
    Citizen.Wait(1000) -- Wait for other resources to load
    InitializeDatabase()
    Debug("FivemAC Server initialized")
end)