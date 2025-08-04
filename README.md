# FivemAC - Advanced Anti-Cheat System for FiveM

A comprehensive, production-ready anti-cheat system designed specifically for FiveM servers. FivemAC provides real-time detection of various cheating methods, automated punishment systems, Discord integration, and a powerful admin interface.

## 🚀 Features

### Detection Systems
- **Aimbot Detection** - Advanced angle-snap detection with configurable thresholds
- **Silent Aim Detection** - Monitors shots hitting targets outside aim cone
- **ESP Detection** - Detects unusual entity enumeration patterns
- **Speed Hack Detection** - Monitors player movement speeds for both vehicles and on-foot
- **Teleport Detection** - Catches instant position changes
- **Weapon Modification Detection** - Validates weapon components and damage values
- **Resource Injection Detection** - Monitors for unauthorized resource loading
- **Menu Detection** - Identifies known cheat menu signatures

### Punishment System
- **Tiered Response** - Automatic warnings, kicks, temporary bans, and permanent bans
- **Score-Based System** - Accumulates violation scores with automatic decay over time
- **Configurable Thresholds** - Customize punishment levels for your server
- **Ban Management** - Comprehensive ban system with MySQL/Redis support

### Admin Interface
- **Real-Time Monitoring** - Live player scores and risk assessment
- **Event Logging** - Detailed logs with filtering and export capabilities
- **Manual Actions** - Admin commands for manual bans and warnings
- **Settings Management** - Runtime configuration changes

### Integrations
- **Discord Webhooks** - Rich embed notifications with severity-based colors
- **Database Support** - MySQL integration via oxmysql for persistent data
- **Redis Support** - Alternative storage backend option

## 📋 Requirements

- **FiveM Server** - ESX, QBCore, or standalone
- **oxmysql** - For database operations (if using MySQL)
- **MySQL Database** - For persistent storage (optional)
- **Discord Webhook** - For notifications (optional)

## 🛠️ Installation

### 1. Download and Extract
```bash
# Download the resource
git clone https://github.com/Dev-NotAqua/FivemAC.git
cd FivemAC

# Copy to your resources folder
cp -r resources/fivem-ac /path/to/your/server/resources/
```

### 2. Database Setup (Optional)

If you want persistent storage, create a MySQL database and configure the connection:

```sql
CREATE DATABASE fivemac;
```

The tables will be created automatically on first run.

### 3. Configuration

Edit `resources/fivem-ac/config.json`:

```json
{
    "discord": {
        "enabled": true,
        "webhook": "YOUR_DISCORD_WEBHOOK_URL_HERE"
    },
    "database": {
        "enabled": true,
        "connectionString": "mysql://username:password@localhost/fivemac"
    }
}
```

### 4. Server Configuration

Add to your `server.cfg`:

```bash
# Ensure oxmysql is started first (if using database)
ensure oxmysql

# Start FivemAC
ensure fivem-ac
```

### 5. Permissions

Add admin permissions to your `server.cfg`:

```bash
# Give admin access to FivemAC
add_ace group.admin fivemac.admin allow
add_principal identifier.license:YOUR_LICENSE_HERE group.admin
```

## ⚙️ Configuration

### Detection Settings

```json
{
    "detection": {
        "aimbot": {
            "enabled": true,
            "threshold": 85,
            "samplingRate": 0.1,
            "maxAngleSnap": 15.0
        },
        "speedhack": {
            "enabled": true,
            "threshold": 90,
            "maxSpeed": 150.0,
            "checkInterval": 1000
        }
    }
}
```

### Scoring System

```json
{
    "scoring": {
        "warningThreshold": 50,
        "kickThreshold": 100,
        "tempBanThreshold": 200,
        "permBanThreshold": 500,
        "decayRate": 0.1,
        "decayInterval": 60000
    }
}
```

### Discord Integration

```json
{
    "discord": {
        "enabled": true,
        "webhook": "https://discord.com/api/webhooks/...",
        "enableEmbeds": true,
        "colors": {
            "warning": 16776960,
            "kick": 16753920,
            "tempBan": 16711680,
            "permBan": 8388608
        }
    }
}
```

## 🎮 Usage

### Admin Commands

- `/acban <player_id> <reason>` - Permanently ban a player
- `/acscore <player_id>` - Check a player's current score

### Admin Panel

Access the admin panel in-game with the appropriate permissions:

1. **Players Tab** - View connected players, scores, and risk levels
2. **Logs Tab** - Browse detection events with filtering options
3. **Settings Tab** - Adjust thresholds and system settings

### Client Events

The system automatically monitors players and sends events to the server when suspicious activity is detected.

## 🔧 API Reference

### Server Events

#### `FivemAC:Flag`
Triggered when the client detects suspicious activity.

```lua
-- Example event data
{
    type = "aimbot",
    playerId = 1,
    playerName = "PlayerName",
    data = {
        avgAngleChange = 25.5,
        distance = 150.0,
        threshold = 15.0
    },
    severity = 85,
    timestamp = 1234567890
}
```

### NUI Callbacks

#### `getPlayers`
Returns list of connected players with scores.

#### `getLogs`
Returns filtered event logs.

#### `banPlayer`
Bans a player with specified reason and duration.

## 🛡️ Security Features

- **Client-side validation** with server-side verification
- **Encrypted communication** between client and server
- **Rate limiting** to prevent spam
- **Performance optimization** with sampling rates
- **False positive mitigation** with intelligent thresholds

## 🚨 Troubleshooting

### Common Issues

**Resource not starting:**
- Check that oxmysql is installed and started first
- Verify the resource name matches exactly: `fivem-ac`
- Check server console for error messages

**Database connection failed:**
- Verify MySQL credentials in config.json
- Ensure the database exists and is accessible
- Check oxmysql resource is properly configured

**Discord notifications not working:**
- Verify webhook URL is correct and active
- Check Discord server permissions
- Ensure webhook has permission to send embeds

**Admin panel not opening:**
- Verify player has `fivemac.admin` permission
- Check browser console for JavaScript errors
- Ensure NUI is enabled in FiveM settings

### Performance Optimization

For high-player-count servers:

```json
{
    "general": {
        "performanceMode": true
    },
    "detection": {
        "aimbot": {
            "samplingRate": 0.05
        }
    }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Discord**: Join our support Discord
- **Issues**: Report bugs on GitHub Issues
- **Documentation**: Check the Wiki for detailed guides

## 🔄 Updates

### Version 1.0.0
- Initial release
- Complete detection system
- Admin interface
- Discord integration
- Database support

---

**⚠️ Important:** This anti-cheat system is designed to deter casual cheaters. Determined attackers may find ways around any detection system. Always keep your server and resources updated.

**💡 Tip:** Start with lower thresholds and gradually increase them based on your server's needs and false positive rates.