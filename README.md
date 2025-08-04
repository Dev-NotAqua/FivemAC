# FivemAC - Advanced Anti-Cheat System for FiveM

[![GitHub release](https://img.shields.io/github/v/release/Dev-NotAqua/FivemAC)](https://github.com/Dev-NotAqua/FivemAC/releases)
[![License](https://img.shields.io/github/license/Dev-NotAqua/FivemAC)](LICENSE)
[![FiveM](https://img.shields.io/badge/FiveM-Compatible-blue)](https://fivem.net/)
[![Discord](https://img.shields.io/badge/Discord-Integration-7289da)](https://discord.com/)

A comprehensive, production-ready anti-cheat system designed specifically for FiveM servers. FivemAC provides real-time detection of various cheating methods, automated punishment systems, Discord integration, and a powerful admin interface.

📖 **[Complete Documentation](docs/ANTICHEAT.md)** | 🚀 **[Quick Start Guide](#-installation)**

## 🚀 Features

- **Multi-layered Detection**: Aimbot, Silent Aim, ESP, Speed Hacks, Teleportation, Weapon Mods, Resource Injection, Menu Detection
- **Intelligent Scoring**: Score-based flagging with automatic decay and configurable thresholds  
- **Tiered Punishment**: Automatic warnings, kicks, temporary bans, and permanent bans
- **Evidence Collection**: Detailed logging with timestamps and detection specifics
- **Admin Dashboard**: Real-time monitoring interface with logs and manual controls
- **Discord Integration**: Rich webhook notifications with severity-based alerts
- **Database Support**: Persistent storage via MySQL with automatic setup

📖 **[View Complete Feature List & Documentation](docs/ANTICHEAT.md)**

## 📋 Requirements

- **FiveM Server** - ESX, QBCore, or standalone
- **oxmysql** - For database operations (if using MySQL)
- **MySQL Database** - For persistent storage (optional)
- **Discord Webhook** - For notifications (optional)

## 🛠️ Installation

### Quick Setup

1. **Download**: Clone or download this repository
2. **Copy**: Place `resources/fivem-ac` in your server's resources folder  
3. **Configure**: Edit `config.json` with your database and Discord settings
4. **Start**: Add `ensure fivem-ac` to your `server.cfg`
5. **Permissions**: Grant admin access with `fivemac.admin` ace permission

### Basic Configuration

```json
{
    "database": {
        "enabled": true,
        "connectionString": "mysql://user:password@localhost/fivemac"
    },
    "discord": {
        "enabled": true,
        "webhook": "YOUR_DISCORD_WEBHOOK_URL"
    }
}
```

📋 **[Detailed Installation Guide](docs/ANTICHEAT.md#installation-instructions)**

## ⚙️ Usage

### Admin Commands
- `/acban <player_id> <reason>` - Ban a player permanently
- `/acscore <player_id>` - Check a player's current score  
- `/acpanel` - Open the admin dashboard

### Exported Functions

Access FivemAC functionality from other resources:

```lua
-- Get player's current anti-cheat score
local score = exports['fivem-ac']:GetPlayerScore(playerId)

-- Check if player is flagged as suspicious  
local isFlagged = exports['fivem-ac']:IsPlayerFlagged(playerId)

-- Ban a player programmatically
exports['fivem-ac']:BanPlayer(playerId, reason, duration, bannedBy)

-- Remove a ban
exports['fivem-ac']:UnbanPlayer(license, unbannedBy)
```

📖 **[Complete API Reference](docs/ANTICHEAT.md#usage-examples)**

## 🚨 Support

- **📖 Documentation**: [Complete Guide](docs/ANTICHEAT.md)
- **🐛 Issues**: [GitHub Issues](https://github.com/Dev-NotAqua/FivemAC/issues)
- **💬 Discord**: Join our support community
- **📚 Wiki**: Detailed configuration guides

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**⚠️ Security Notice**: This anti-cheat system deters casual cheaters but determined attackers may find workarounds. Always keep your server and resources updated.

**💡 Pro Tip**: Start with conservative thresholds and adjust based on your server's false positive rates.