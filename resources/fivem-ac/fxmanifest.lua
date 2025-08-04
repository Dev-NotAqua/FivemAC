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