fx_version 'cerulean'
game 'gta5'

name 'FivemAC'
description 'Advanced Anti-Cheat System for FiveM'
author 'Dev-NotAqua'
version '1.0.0'

-- Client Scripts
client_scripts {
    'client/client.lua',
    'test.lua'
}

-- Server Scripts
server_scripts {
    'server/server.lua',
    'test.lua'
}

-- Exported Functions
exports {
    'GetPlayerScore',       -- Get a player's current anti-cheat score
    'IsPlayerFlagged',      -- Check if player has concerning score levels
    'BanPlayer',            -- Ban a player with specified reason and duration
    'UnbanPlayer',          -- Remove a ban for a player
    'GetPlayerWarnings',    -- Get warning count for a player
    'AddPlayerScore',       -- Manually add score to a player
    'GetBanInfo',           -- Get ban information for a player
    'GetEventLogs'          -- Get detection event logs with filtering
}

-- NUI Assets
ui_page 'ui/index.html'

files {
    'ui/index.html',
    'ui/admin.js',
    'ui/logs.js',
    'ui/styles.css',
    'config.json'
}

-- Dependencies
dependencies {
    'oxmysql' -- For database operations
}

-- Shared data
shared_script 'config.json'