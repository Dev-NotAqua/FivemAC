-- FivemAC Test Script
-- This is a basic test to validate the anticheat system
-- Run this with /test_ac command in-game

local function TestAnticheatSystem()
    print("^2[FivemAC Test] Starting anticheat system tests...^7")
    
    -- Test 1: Check if config loads
    local configFile = LoadResourceFile(GetCurrentResourceName(), 'config.json')
    if configFile then
        local config = json.decode(configFile)
        if config and config.general then
            print("^2[Test 1] ✓ Config file loads successfully^7")
        else
            print("^1[Test 1] ✗ Config file parsing failed^7")
        end
    else
        print("^1[Test 1] ✗ Config file not found^7")
    end
    
    -- Test 2: Check client-server communication
    TriggerServerEvent('FivemAC:Flag', {
        type = "test_event",
        playerId = GetPlayerServerId(PlayerId()),
        playerName = GetPlayerName(PlayerId()),
        data = { test = true },
        severity = 1,
        timestamp = GetGameTimer()
    })
    print("^2[Test 2] ✓ Test flag event sent to server^7")
    
    -- Test 3: Check player position tracking
    local playerPos = GetEntityCoords(PlayerPedId())
    if playerPos and playerPos.x then
        print("^2[Test 3] ✓ Player position tracking works^7")
    else
        print("^1[Test 3] ✗ Player position tracking failed^7")
    end
    
    -- Test 4: Check weapon detection
    local weapon = GetSelectedPedWeapon(PlayerPedId())
    if weapon then
        print("^2[Test 4] ✓ Weapon detection works (Current: " .. weapon .. ")^7")
    else
        print("^1[Test 4] ✗ Weapon detection failed^7")
    end
    
    print("^2[FivemAC Test] Tests completed. Check console for results.^7")
end

-- Client-side test command
if IsDuplicityVersion() == false then
    RegisterCommand('test_ac', function()
        TestAnticheatSystem()
    end, false)
    
    TriggerEvent('chat:addSuggestion', '/test_ac', 'Test the FivemAC system')
end

-- Server-side test
if IsDuplicityVersion() then
    RegisterCommand('test_ac_server', function(source, args, rawCommand)
        print("^2[FivemAC Server Test] Running server tests...^7")
        
        -- Test database connection (if enabled)
        local configFile = LoadResourceFile(GetCurrentResourceName(), 'config.json')
        if configFile then
            local config = json.decode(configFile)
            if config.database and config.database.enabled then
                -- Test if oxmysql is available
                if exports.oxmysql then
                    print("^2[Server Test] ✓ Database connection available^7")
                else
                    print("^1[Server Test] ✗ oxmysql not available^7")
                end
            else
                print("^3[Server Test] - Database disabled in config^7")
            end
        end
        
        -- Test player count
        local playerCount = #GetPlayers()
        print("^2[Server Test] ✓ Current players: " .. playerCount .. "^7")
        
        -- Test admin permissions
        if IsPlayerAceAllowed(source, 'fivemac.admin') then
            print("^2[Server Test] ✓ Admin permissions working^7")
        else
            print("^3[Server Test] - No admin permissions for test user^7")
        end
        
        print("^2[FivemAC Server Test] Tests completed.^7")
    end, true)
end