// FivemAC Logs Viewer JavaScript
// Author: Dev-NotAqua
// Version: 1.0.0

let logs = [];
let filteredLogs = [];

// Load logs data
function loadLogs() {
    const filters = getLogFilters();
    
    fetch(`https://${GetParentResourceName()}/getLogs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters)
    })
    .then(response => response.json())
    .then(data => {
        logs = data;
        filteredLogs = data;
        displayLogs(filteredLogs);
    })
    .catch(error => {
        console.error('Error loading logs:', error);
        showNotification('Error loading logs', 'error');
    });
}

// Get current log filters
function getLogFilters() {
    const playerSearch = document.getElementById('log-player-search').value.trim();
    const eventType = document.getElementById('event-type-filter').value;
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    
    const filters = {};
    
    if (playerSearch) {
        filters.playerName = playerSearch;
    }
    
    if (eventType) {
        filters.eventType = eventType;
    }
    
    if (startTime) {
        filters.startTime = new Date(startTime).getTime();
    }
    
    if (endTime) {
        filters.endTime = new Date(endTime).getTime();
    }
    
    return filters;
}

// Display logs in the table
function displayLogs(logsData) {
    const tbody = document.getElementById('logs-tbody');
    tbody.innerHTML = '';
    
    if (logsData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align: center; color: #adb5bd;">No logs found</td>';
        tbody.appendChild(row);
        return;
    }
    
    // Sort logs by timestamp (newest first)
    logsData.sort((a, b) => b.timestamp - a.timestamp);
    
    logsData.forEach(log => {
        const row = createLogRow(log);
        tbody.appendChild(row);
    });
}

// Create a log table row
function createLogRow(log) {
    const row = document.createElement('tr');
    
    const severityClass = getSeverityClass(log.severity);
    const severityLabel = getSeverityLabel(log.severity);
    const timestamp = formatTimestamp(log.timestamp);
    
    row.innerHTML = `
        <td>${timestamp}</td>
        <td>${escapeHtml(log.playerName)} (${log.playerId})</td>
        <td>${getEventTypeLabel(log.eventType)}</td>
        <td><span class="severity-badge ${severityClass}">${severityLabel}</span></td>
        <td>${log.totalScore}</td>
        <td>
            <button class="btn btn-info btn-sm" onclick="showLogDetails('${encodeURIComponent(JSON.stringify(log))}')">
                View Details
            </button>
        </td>
    `;
    
    return row;
}

// Get severity CSS class
function getSeverityClass(severity) {
    if (severity < 50) return 'severity-low';
    if (severity < 100) return 'severity-medium';
    if (severity < 200) return 'severity-high';
    return 'severity-critical';
}

// Get severity label
function getSeverityLabel(severity) {
    if (severity < 50) return 'Low';
    if (severity < 100) return 'Medium';
    if (severity < 200) return 'High';
    return 'Critical';
}

// Get event type display label
function getEventTypeLabel(eventType) {
    const labels = {
        'aimbot': 'Aimbot',
        'silentAim': 'Silent Aim',
        'esp': 'ESP',
        'speedhack_vehicle': 'Speed Hack (Vehicle)',
        'speedhack_foot': 'Speed Hack (Foot)',
        'teleport': 'Teleport',
        'weaponMods': 'Weapon Mods',
        'resourceInjection': 'Resource Injection',
        'menuDetection': 'Menu Detection'
    };
    
    return labels[eventType] || eventType;
}

// Show detailed log information
function showLogDetails(logJsonEncoded) {
    try {
        const log = JSON.parse(decodeURIComponent(logJsonEncoded));
        
        const modal = document.getElementById('log-details-modal');
        const content = document.getElementById('log-details-content');
        
        content.innerHTML = createLogDetailsContent(log);
        modal.classList.remove('hidden');
    } catch (error) {
        console.error('Error showing log details:', error);
        showNotification('Error displaying log details', 'error');
    }
}

// Create detailed log content
function createLogDetailsContent(log) {
    const timestamp = formatTimestamp(log.timestamp);
    const severityClass = getSeverityClass(log.severity);
    const severityLabel = getSeverityLabel(log.severity);
    
    let dataContent = '';
    if (log.data && typeof log.data === 'object') {
        dataContent = Object.entries(log.data).map(([key, value]) => {
            let displayValue = value;
            
            // Format specific data types
            if (key.includes('Pos') && typeof value === 'object' && value.x !== undefined) {
                displayValue = `X: ${value.x.toFixed(2)}, Y: ${value.y.toFixed(2)}, Z: ${value.z.toFixed(2)}`;
            } else if (typeof value === 'number') {
                displayValue = value.toFixed(2);
            } else if (typeof value === 'object') {
                displayValue = JSON.stringify(value, null, 2);
            }
            
            return `
                <div class="detail-item">
                    <strong>${formatKey(key)}:</strong>
                    <span>${escapeHtml(displayValue.toString())}</span>
                </div>
            `;
        }).join('');
    } else if (log.data) {
        dataContent = `<div class="detail-item"><span>${escapeHtml(log.data.toString())}</span></div>`;
    }
    
    return `
        <div class="log-details">
            <div class="detail-section">
                <h4>General Information</h4>
                <div class="detail-item">
                    <strong>Timestamp:</strong>
                    <span>${timestamp}</span>
                </div>
                <div class="detail-item">
                    <strong>Player:</strong>
                    <span>${escapeHtml(log.playerName)} (ID: ${log.playerId})</span>
                </div>
                <div class="detail-item">
                    <strong>License:</strong>
                    <span>${escapeHtml(log.playerLicense || 'Unknown')}</span>
                </div>
                <div class="detail-item">
                    <strong>Event Type:</strong>
                    <span>${getEventTypeLabel(log.eventType)}</span>
                </div>
                <div class="detail-item">
                    <strong>Severity:</strong>
                    <span class="severity-badge ${severityClass}">${severityLabel} (${log.severity})</span>
                </div>
                <div class="detail-item">
                    <strong>Total Score:</strong>
                    <span class="${log.totalScore > 100 ? 'status-danger' : log.totalScore > 50 ? 'status-warning' : 'status-online'}">${log.totalScore}</span>
                </div>
            </div>
            
            ${dataContent ? `
                <div class="detail-section">
                    <h4>Event Data</h4>
                    ${dataContent}
                </div>
            ` : ''}
            
            <div class="detail-section">
                <h4>Risk Assessment</h4>
                <div class="detail-item">
                    <strong>Risk Level:</strong>
                    <span class="risk-badge ${getRiskClass(log.totalScore)}">${getRiskLevel(log.totalScore)}</span>
                </div>
                <div class="detail-item">
                    <strong>Recommended Action:</strong>
                    <span>${getRecommendedAction(log.totalScore, log.severity)}</span>
                </div>
            </div>
        </div>
        
        <style>
            .log-details {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            .detail-section {
                margin-bottom: 1.5rem;
                padding: 1rem;
                background-color: var(--background-color);
                border-radius: 8px;
                border: 1px solid var(--border-color);
            }
            
            .detail-section h4 {
                margin: 0 0 1rem 0;
                color: var(--primary-color);
                font-size: 1rem;
                font-weight: 600;
            }
            
            .detail-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.75rem;
                padding: 0.5rem 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .detail-item:last-child {
                margin-bottom: 0;
                border-bottom: none;
            }
            
            .detail-item strong {
                color: var(--text-color);
                min-width: 120px;
                margin-right: 1rem;
            }
            
            .detail-item span {
                color: var(--text-muted);
                text-align: right;
                word-break: break-word;
                flex: 1;
            }
        </style>
    `;
}

// Format object keys for display
function formatKey(key) {
    return key.replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .trim();
}

// Get recommended action based on score and severity
function getRecommendedAction(totalScore, severity) {
    if (totalScore >= 500) {
        return 'Permanent Ban Recommended';
    } else if (totalScore >= 200) {
        return 'Temporary Ban Recommended';
    } else if (totalScore >= 100) {
        return 'Kick Recommended';
    } else if (totalScore >= 50) {
        return 'Warning Recommended';
    } else {
        return 'Monitor Closely';
    }
}

// Close log details modal
function closeLogDetailsModal() {
    document.getElementById('log-details-modal').classList.add('hidden');
}

// Filter logs based on current filter settings
function filterLogs() {
    const playerSearch = document.getElementById('log-player-search').value.toLowerCase().trim();
    const eventType = document.getElementById('event-type-filter').value;
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    
    filteredLogs = logs.filter(log => {
        // Player name/ID filter
        if (playerSearch) {
            const matchesPlayer = log.playerName.toLowerCase().includes(playerSearch) ||
                                 log.playerId.toString().includes(playerSearch);
            if (!matchesPlayer) return false;
        }
        
        // Event type filter
        if (eventType && log.eventType !== eventType) {
            return false;
        }
        
        // Time range filter
        if (startTime) {
            const startTimestamp = new Date(startTime).getTime();
            if (log.timestamp < startTimestamp) return false;
        }
        
        if (endTime) {
            const endTimestamp = new Date(endTime).getTime();
            if (log.timestamp > endTimestamp) return false;
        }
        
        return true;
    });
    
    displayLogs(filteredLogs);
}

// Export logs functionality
function exportLogs() {
    if (filteredLogs.length === 0) {
        showNotification('No logs to export', 'warning');
        return;
    }
    
    const csvContent = generateCSV(filteredLogs);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `fivemac_logs_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Logs exported successfully', 'success');
    } else {
        showNotification('Export not supported in this browser', 'error');
    }
}

// Generate CSV from logs data
function generateCSV(logsData) {
    const headers = ['Timestamp', 'Player Name', 'Player ID', 'Event Type', 'Severity', 'Total Score', 'Event Data'];
    const csvRows = [headers.join(',')];
    
    logsData.forEach(log => {
        const row = [
            formatTimestamp(log.timestamp),
            `"${log.playerName.replace(/"/g, '""')}"`,
            log.playerId,
            log.eventType,
            log.severity,
            log.totalScore,
            `"${JSON.stringify(log.data || {}).replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

// Setup logs-specific event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Log filtering
    document.getElementById('log-player-search').addEventListener('input', filterLogs);
    document.getElementById('event-type-filter').addEventListener('change', filterLogs);
    document.getElementById('filter-logs-btn').addEventListener('click', loadLogs);
    
    // Add export button if it doesn't exist
    const logsTab = document.getElementById('logs-tab');
    const controlsDiv = logsTab.querySelector('.controls');
    
    if (controlsDiv && !document.getElementById('export-logs-btn')) {
        const exportBtn = document.createElement('button');
        exportBtn.id = 'export-logs-btn';
        exportBtn.className = 'btn btn-success';
        exportBtn.innerHTML = '📊 Export CSV';
        exportBtn.addEventListener('click', exportLogs);
        controlsDiv.appendChild(exportBtn);
    }
});

// Global functions for HTML onclick handlers
window.showLogDetails = showLogDetails;
window.closeLogDetailsModal = closeLogDetailsModal;