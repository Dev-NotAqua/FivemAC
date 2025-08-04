# FivemAC Quick Start Guide

## 🚀 Quick Installation

1. **Copy the resource to your server:**
   ```bash
   cp -r resources/fivem-ac /path/to/your/fivem/server/resources/
   ```

2. **Configure the system:**
   Edit `resources/fivem-ac/config.json`:
   ```json
   {
       "discord": {
           "webhook": "https://discord.com/api/webhooks/YOUR_WEBHOOK_HERE"
       },
       "database": {
           "connectionString": "mysql://user:pass@localhost/fivemac"
       }
   }
   ```

3. **Add to server.cfg:**
   ```
   ensure oxmysql
   ensure fivem-ac
   add_ace group.admin fivemac.admin allow
   add_principal identifier.license:YOUR_LICENSE_HERE group.admin
   ```

4. **Start your server!**

## 🎮 Usage

### Admin Commands
- `/acpanel` - Open the admin interface
- `/acban <id> <reason>` - Ban a player
- `/acscore <id>` - Check player's score
- `/test_ac` - Test the system (client)
- `/test_ac_server` - Test the system (server)

### Admin Panel Features
- **Players Tab**: Real-time monitoring of all connected players
- **Logs Tab**: Detailed event history with filtering options
- **Settings Tab**: Adjust thresholds and system settings

### Detection Features
The system automatically detects:
- ✅ Aimbot (angle snap detection)
- ✅ Silent Aim (shot verification)
- ✅ Speed Hacking (movement validation)
- ✅ Teleporting (position jumping)
- ✅ Weapon Modifications
- ✅ Resource Injection
- ✅ ESP Usage (basic detection)
- ✅ Cheat Menus (signature detection)

### Punishment System
1. **Score 0-49**: Monitoring only
2. **Score 50+**: Automatic warnings
3. **Score 100+**: Automatic kicks
4. **Score 200+**: Temporary bans
5. **Score 500+**: Permanent bans

Scores automatically decay over time to prevent false positives.

## 🔧 Configuration

### Key Settings
```json
{
    "detection": {
        "aimbot": {
            "enabled": true,
            "threshold": 85,
            "maxAngleSnap": 15.0
        }
    },
    "scoring": {
        "warningThreshold": 50,
        "kickThreshold": 100,
        "tempBanThreshold": 200,
        "permBanThreshold": 500
    }
}
```

### Performance Tuning
For high-player servers, enable performance mode:
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

## 📊 Monitoring

### Discord Notifications
Receive real-time alerts in Discord with:
- Player information
- Event details
- Severity levels
- Evidence data

### Database Storage
All events are stored in MySQL for:
- Historical analysis
- Ban management
- Player tracking
- Evidence preservation

## 🛡️ Security Features

- **Client-side detection** with server validation
- **Rate limiting** to prevent spam
- **Performance optimization** for large servers
- **False positive mitigation** with smart thresholds
- **Encrypted data transmission**

## 🔍 Troubleshooting

### Common Issues

**Resource won't start:**
```bash
# Check dependencies
ensure oxmysql
ensure fivem-ac
```

**Database errors:**
- Verify MySQL connection string
- Check oxmysql is properly configured
- Ensure database exists and is accessible

**Admin panel won't open:**
- Verify permissions: `add_ace group.admin fivemac.admin allow`
- Check player is in admin group
- Try `/acpanel` command in-game

**No Discord notifications:**
- Verify webhook URL is correct
- Check Discord server permissions
- Test webhook manually

### Debug Mode
Enable debug mode in config.json:
```json
{
    "general": {
        "debug": true
    }
}
```

## 📈 Best Practices

1. **Start with low thresholds** and adjust based on false positives
2. **Monitor logs regularly** to tune detection sensitivity
3. **Keep the resource updated** for latest detection methods
4. **Use performance mode** on high-population servers
5. **Backup your database** regularly
6. **Test configuration changes** in a development environment

## 🆘 Support

- Check the README.md for detailed documentation
- Use the test commands to validate installation
- Run the validation script: `./validate_install.sh`
- Report issues on GitHub

---

**Note**: This anti-cheat system provides a strong deterrent against casual cheating but should be part of a comprehensive security strategy including regular server updates and community moderation.