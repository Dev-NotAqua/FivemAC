# FivemAC Anti-Cheat Documentation

## Overview

FivemAC is a comprehensive, production-ready anti-cheat system designed specifically for FiveM servers. It provides real-time detection of various cheating methods, automated punishment systems, Discord integration, and a powerful admin interface.

### Key Features

- **Multi-layered Detection**: Aimbot, Silent Aim, ESP, Speed Hacks, Teleportation, Weapon Modifications, Resource Injection, and Menu Detection
- **Intelligent Scoring System**: Score-based flagging with automatic decay and configurable thresholds
- **Tiered Response System**: Automatic warnings, kicks, temporary bans, and permanent bans
- **Evidence Collection**: Detailed logging with timestamps, player data, and detection specifics
- **Admin Interface**: Real-time monitoring dashboard with logs and manual controls
- **Discord Integration**: Rich webhook notifications with severity-based colors
- **Database Support**: Persistent storage via MySQL with automatic table creation

## Installation Instructions

### Prerequisites

- FiveM Server (ESX, QBCore, or standalone compatible)
- oxmysql resource (for database operations)
- MySQL Database (optional, for persistent storage)
- Discord Webhook URL (optional, for notifications)

### Step 1: Download and Setup

```bash
# Clone the repository
git clone https://github.com/Dev-NotAqua/FivemAC.git

# Copy to your server's resources folder
cp -r FivemAC/resources/fivem-ac /path/to/your/server/resources/
```

### Step 2: Database Configuration (Optional)

If using persistent storage, create a MySQL database:

```sql
CREATE DATABASE fivemac;
CREATE USER 'fivemac_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON fivemac.* TO 'fivemac_user'@'localhost';
FLUSH PRIVILEGES;
```

Tables will be created automatically on first startup.

### Step 3: Resource Configuration

Edit `resources/fivem-ac/config.json` with your settings:

```json
{
    "database": {
        "enabled": true,
        "connectionString": "mysql://fivemac_user:your_password@localhost/fivemac"
    },
    "discord": {
        "enabled": true,
        "webhook": "https://discord.com/api/webhooks/YOUR_WEBHOOK_URL"
    }
}
```

### Step 4: Server Startup

Add to your `server.cfg`:

```bash
# Ensure dependencies are loaded first
ensure oxmysql

# Start FivemAC
ensure fivem-ac
```

### Step 5: Admin Permissions

Configure admin access in `server.cfg`:

```bash
# Grant admin permissions
add_ace group.admin fivemac.admin allow
add_principal identifier.license:YOUR_LICENSE_HERE group.admin
```

## Configuration Details

### Detection Settings

Configure detection thresholds and behavior in `config.json`:

#### Aimbot Detection
```json
"aimbot": {
    "enabled": true,
    "threshold": 85,        // Sensitivity (0-100, higher = less sensitive)
    "samplingRate": 0.1,    // Percentage of shots to analyze (performance)
    "maxAngleSnap": 15.0    // Maximum degrees of angle change allowed
}
```

#### Speed Hack Detection
```json
"speedhack": {
    "enabled": true,
    "threshold": 90,
    "maxSpeed": 150.0,      // Maximum speed in units/second
    "checkInterval": 1000   // Check frequency in milliseconds
}
```

#### Teleport Detection
```json
"teleport": {
    "enabled": true,
    "threshold": 95,
    "maxDistance": 100.0,   // Maximum instant movement distance
    "timeWindow": 2000      // Time window for detection in milliseconds
}
```

### Scoring and Punishment System

#### Score Thresholds
```json
"scoring": {
    "warningThreshold": 50,     // Score that triggers warnings
    "kickThreshold": 100,       // Score that triggers kicks
    "tempBanThreshold": 200,    // Score that triggers temporary bans
    "permBanThreshold": 500,    // Score that triggers permanent bans
    "decayRate": 0.1,           // Points reduced per interval
    "decayInterval": 60000      // Decay check interval (ms)
}
```

#### Punishment Settings
```json
"punishments": {
    "enableWarnings": true,
    "enableKicks": true,
    "enableTempBans": true,
    "enablePermBans": true,
    "tempBanDuration": 86400,   // Temporary ban duration in seconds
    "maxWarnings": 3            // Maximum warnings before escalation
}
```

### Discord Integration

```json
"discord": {
    "enabled": true,
    "webhook": "https://discord.com/api/webhooks/...",
    "enableEmbeds": true,
    "colors": {
        "warning": 16776960,    // Yellow
        "kick": 16753920,       // Orange  
        "tempBan": 16711680,    // Red
        "permBan": 8388608      // Dark Red
    }
}
```

## Usage Examples

### Admin Commands

Access these commands in-game with admin permissions:

#### Ban Player
```
/acban <player_id> <reason>
```
Example: `/acban 5 Using aimbot`

#### Check Player Score
```
/acscore <player_id>
```
Example: `/acscore 5`

#### Open Admin Panel
```
/acpanel
```

### Exported Functions

FivemAC provides several exported functions for integration with other resources:

#### Get Player Score
```lua
-- Get current anti-cheat score for a player
local score = exports['fivem-ac']:GetPlayerScore(playerId)
```

#### Check if Player is Flagged
```lua
-- Check if player has concerning score levels
local isFlagged = exports['fivem-ac']:IsPlayerFlagged(playerId)
```

#### Ban Player Programmatically
```lua
-- Ban a player from another resource
exports['fivem-ac']:BanPlayer(playerId, reason, duration, bannedBy)
-- duration: 0 = permanent, > 0 = temporary ban in seconds
```

#### Unban Player
```lua
-- Remove ban for a player
exports['fivem-ac']:UnbanPlayer(license, unbannedBy)
```

#### Get Player Warnings
```lua
-- Get warning count for a player
local warnings = exports['fivem-ac']:GetPlayerWarnings(playerId)
```

#### Add Score to Player
```lua
-- Manually add score to a player (for custom detections)
exports['fivem-ac']:AddPlayerScore(playerId, score, reason)
```

## Admin & Logs UI Instructions

### Accessing the Admin Panel

1. Ensure you have `fivemac.admin` permission
2. Use `/acpanel` command in-game
3. The UI will open automatically

### Players Tab

- **Real-time Player List**: Shows all connected players
- **Score Display**: Current anti-cheat scores with color coding
  - Green (0-49): Safe
  - Yellow (50-99): Caution  
  - Orange (100-199): Warning
  - Red (200+): High Risk
- **Warning Count**: Number of warnings issued
- **Quick Actions**: Ban, warn, or kick players directly

### Logs Tab

- **Event Filtering**: Filter by player, event type, or time range
- **Event Types**:
  - `aimbot_detected`: Aimbot angle-snap detection
  - `silent_aim_detected`: Silent aim cone violation
  - `esp_detected`: Entity enumeration anomaly
  - `speedhack_detected`: Movement speed violation
  - `teleport_detected`: Instant position change
  - `weapon_mod_detected`: Unauthorized weapon modification
  - `resource_injection`: Unauthorized resource loading
  - `menu_detected`: Cheat menu signatures found
- **Evidence Data**: Click entries to view detailed detection data
- **Export Options**: Download logs as CSV or JSON

### Settings Tab

- **Real-time Configuration**: Modify detection thresholds without restart
- **Toggle Detection Modules**: Enable/disable specific detection types
- **Punishment Settings**: Adjust score thresholds and punishment types
- **Performance Tuning**: Modify sampling rates and check intervals

## Tiered Response and Evidence Collection

### Scoring System Workflow

1. **Detection Event**: Client detects suspicious activity
2. **Score Assignment**: Event receives severity score (0-100)
3. **Score Accumulation**: Added to player's total score
4. **Threshold Evaluation**: System checks against punishment thresholds
5. **Action Execution**: Appropriate punishment applied automatically
6. **Evidence Logging**: All data stored for admin review

### Evidence Collection

Each detection event captures:

- **Player Information**: ID, name, license, Discord ID
- **Detection Data**: Specific metrics that triggered the flag
- **Context**: Game state, position, weapon, vehicle status
- **Timing**: Precise timestamp and duration
- **Severity**: Calculated risk score for the event

#### Example Evidence Data

```json
{
    "eventType": "aimbot_detected",
    "playerId": 5,
    "playerName": "SuspiciousPlayer",
    "timestamp": 1671234567890,
    "data": {
        "avgAngleChange": 45.7,
        "maxAngleSnap": 15.0,
        "distance": 127.3,
        "weapon": "WEAPON_ASSAULTRIFLE",
        "shots": 12,
        "hits": 11
    },
    "severity": 95,
    "coordinates": [-1200.5, 500.2, 69.1]
}
```

### Punishment Escalation

1. **Warning Phase** (Score: 50-99)
   - In-game warning message
   - Discord notification (if enabled)
   - Warning counter incremented

2. **Kick Phase** (Score: 100-199)
   - Player disconnected from server
   - Reason provided in kick message
   - Event logged for admin review

3. **Temporary Ban** (Score: 200-499)
   - Player banned for configured duration
   - Database entry created
   - Discord notification with ban details

4. **Permanent Ban** (Score: 500+)
   - Permanent server exclusion
   - License-based ban (survives character changes)
   - Full evidence package retained

### False Positive Mitigation

- **Score Decay**: Scores naturally decrease over time
- **Threshold Tuning**: Adjustable sensitivity per detection type
- **Sampling Rates**: Performance optimization reduces false triggers
- **Admin Override**: Manual review and ban reversal capabilities
- **Whitelist System**: Exempt specific players from detection

## Troubleshooting

### Common Issues

#### Resource Won't Start
- **Check Dependencies**: Ensure `oxmysql` is installed and started first
- **Verify Name**: Resource folder must be exactly `fivem-ac`
- **Console Errors**: Check server console for specific error messages
- **File Permissions**: Ensure server can read all resource files

#### Database Connection Failed
- **Credentials**: Verify username, password, and database name
- **Connection String**: Check format: `mysql://user:pass@host/database`
- **Database Exists**: Ensure target database was created
- **oxmysql Configuration**: Verify oxmysql resource is properly set up

#### Admin Panel Not Opening
- **Permissions**: Verify player has `fivemac.admin` ace permission
- **NUI Enabled**: Check FiveM settings allow NUI interactions
- **Browser Console**: F12 to check for JavaScript errors
- **Resource State**: Ensure fivem-ac is running and responsive

#### Discord Notifications Failing
- **Webhook URL**: Verify webhook is active and URL is correct
- **Permissions**: Check webhook has permission to send embeds
- **Rate Limiting**: Discord may throttle high-frequency messages
- **JSON Format**: Verify webhook payload structure is valid

### Performance Optimization

For servers with 100+ players:

```json
{
    "general": {
        "performanceMode": true
    },
    "detection": {
        "aimbot": {
            "samplingRate": 0.05    // Check 5% of shots instead of 10%
        },
        "speedhack": {
            "checkInterval": 2000   // Check every 2 seconds instead of 1
        },
        "esp": {
            "checkInterval": 10000  // Check every 10 seconds instead of 5
        }
    }
}
```

### Debug Mode

Enable debug logging for troubleshooting:

```json
{
    "general": {
        "debug": true
    }
}
```

Debug output appears in server console with `[FivemAC Server Debug]` prefix.

## Advanced Configuration

### Custom Detection Integration

Add custom detections by triggering the FivemAC event system:

```lua
-- From another resource
TriggerEvent('FivemAC:Flag', {
    type = 'custom_detection',
    playerId = playerId,
    playerName = GetPlayerName(playerId),
    data = {
        custom_field = 'violation_data'
    },
    severity = 75,
    timestamp = os.time() * 1000
})
```

### Webhook Customization

Override default webhook messages:

```lua
-- Custom webhook data
local webhookData = {
    username = "Custom AntiCheat",
    avatar_url = "https://example.com/avatar.png",
    embeds = {{
        title = "Custom Detection",
        description = "Player flagged for custom violation",
        color = 16711680,
        timestamp = os.date("!%Y-%m-%dT%H:%M:%S.000Z")
    }}
}
```

### Database Schema

Tables created automatically:

#### ac_events
- `id` (Primary Key)
- `player_license` (Player identifier)
- `player_name` (Display name)
- `event_type` (Detection type)
- `event_data` (JSON evidence)
- `severity` (Score value)
- `timestamp` (Event time)

#### ac_bans  
- `id` (Primary Key)
- `player_license` (Player identifier)
- `player_name` (Display name)  
- `ban_type` (permanent/temporary)
- `reason` (Ban reason)
- `banned_at` (Ban timestamp)
- `expires_at` (Expiration time)
- `banned_by` (Admin name)
- `active` (Ban status)

#### ac_players
- `license` (Primary Key)
- `name` (Latest name)
- `score` (Current score)
- `warnings` (Warning count)
- `last_seen` (Last connection)

---

For additional support and updates, visit the [GitHub repository](https://github.com/Dev-NotAqua/FivemAC).