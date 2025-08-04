// FivemAC Admin Panel JavaScript
// Author: Dev-NotAqua
// Version: 1.0.0

let players = [];
let refreshInterval;
let autoRefreshEnabled = true;

// Initialize the admin panel
document.addEventListener('DOMContentLoaded', function() {
    initializeUI();
    loadPlayers();
    setupEventListeners();
    startAutoRefresh();
});

// Initialize UI components
function initializeUI() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            button.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
            
            // Load data for the active tab
            if (targetTab === 'logs') {
                loadLogs();
            }
        });
    });

    // Ban type change handler
    const banTypeSelect = document.getElementById('ban-type');
    const durationGroup = document.getElementById('ban-duration-group');
    
    banTypeSelect.addEventListener('change', () => {
        if (banTypeSelect.value === 'temporary') {
            durationGroup.style.display = 'block';
        } else {
            durationGroup.style.display = 'none';
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Header controls
    document.getElementById('refresh-btn').addEventListener('click', () => {
        loadPlayers();
        if (document.getElementById('logs-tab').classList.contains('active')) {
            loadLogs();
        }
        showNotification('Data refreshed', 'success');
    });

    document.getElementById('close-btn').addEventListener('click', closeAdminPanel);

    // Player search and filtering
    document.getElementById('player-search').addEventListener('input', filterPlayers);
    document.getElementById('score-filter').addEventListener('change', filterPlayers);

    // Settings
    document.getElementById('auto-refresh').addEventListener('change', (e) => {
        autoRefreshEnabled = e.target.checked;
        if (autoRefreshEnabled) {
            startAutoRefresh();
        } else {
            stopAutoRefresh();
        }
    });

    document.getElementById('refresh-interval').addEventListener('change', (e) => {
        if (autoRefreshEnabled) {
            stopAutoRefresh();
            startAutoRefresh();
        }
    });

    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
    document.getElementById('reset-settings-btn').addEventListener('click', resetSettings);

    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// Load players data
function loadPlayers() {
    fetch(`https://${GetParentResourceName()}/getPlayers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        players = data;
        displayPlayers(players);
    })
    .catch(error => {
        console.error('Error loading players:', error);
        showNotification('Error loading players', 'error');
    });
}

// Display players in the table
function displayPlayers(playersData) {
    const tbody = document.getElementById('players-tbody');
    tbody.innerHTML = '';

    playersData.forEach(player => {
        const row = createPlayerRow(player);
        tbody.appendChild(row);
    });
}

// Create a player table row
function createPlayerRow(player) {
    const row = document.createElement('tr');
    
    const riskLevel = getRiskLevel(player.score);
    const riskClass = getRiskClass(player.score);
    
    row.innerHTML = `
        <td>${player.id}</td>
        <td>${escapeHtml(player.name)}</td>
        <td>${player.score}</td>
        <td>${player.warnings}</td>
        <td><span class="risk-badge ${riskClass}">${riskLevel}</span></td>
        <td>
            <button class="btn btn-info btn-sm" onclick="viewPlayerDetails(${player.id})">View</button>
            <button class="btn btn-warning btn-sm" onclick="warnPlayer(${player.id})">Warn</button>
            <button class="btn btn-danger btn-sm" onclick="openBanModal(${player.id}, '${escapeHtml(player.name)}')">Ban</button>
        </td>
    `;
    
    return row;
}

// Get risk level based on score
function getRiskLevel(score) {
    if (score < 50) return 'Low';
    if (score < 100) return 'Medium';
    if (score < 200) return 'High';
    return 'Critical';
}

// Get risk CSS class based on score
function getRiskClass(score) {
    if (score < 50) return 'risk-low';
    if (score < 100) return 'risk-medium';
    if (score < 200) return 'risk-high';
    return 'risk-critical';
}

// Filter players based on search and filters
function filterPlayers() {
    const searchTerm = document.getElementById('player-search').value.toLowerCase();
    const scoreFilter = document.getElementById('score-filter').value;
    
    let filteredPlayers = players.filter(player => {
        const matchesSearch = player.name.toLowerCase().includes(searchTerm) || 
                             player.id.toString().includes(searchTerm);
        
        let matchesScore = true;
        if (scoreFilter === 'low') {
            matchesScore = player.score < 50;
        } else if (scoreFilter === 'medium') {
            matchesScore = player.score >= 50 && player.score < 100;
        } else if (scoreFilter === 'high') {
            matchesScore = player.score >= 100;
        }
        
        return matchesSearch && matchesScore;
    });
    
    displayPlayers(filteredPlayers);
}

// Player actions
function viewPlayerDetails(playerId) {
    const player = players.find(p => p.id == playerId);
    if (!player) return;
    
    alert(`Player Details:\nID: ${player.id}\nName: ${player.name}\nScore: ${player.score}\nWarnings: ${player.warnings}\nLicense: ${player.license}`);
}

function warnPlayer(playerId) {
    const player = players.find(p => p.id == playerId);
    if (!player) return;
    
    if (confirm(`Warn player ${player.name}?`)) {
        // TODO: Implement warn player functionality
        showNotification(`Warning sent to ${player.name}`, 'warning');
    }
}

// Ban modal functions
function openBanModal(playerId, playerName) {
    document.getElementById('ban-player-id').value = playerId;
    document.getElementById('ban-player-name').value = playerName;
    document.getElementById('ban-reason').value = '';
    document.getElementById('ban-type').value = 'permanent';
    document.getElementById('ban-duration-group').style.display = 'none';
    document.getElementById('ban-modal').classList.remove('hidden');
}

function closeBanModal() {
    document.getElementById('ban-modal').classList.add('hidden');
}

function confirmBan() {
    const playerId = document.getElementById('ban-player-id').value;
    const reason = document.getElementById('ban-reason').value.trim();
    const banType = document.getElementById('ban-type').value;
    const duration = banType === 'temporary' ? parseInt(document.getElementById('ban-duration').value) : 0;
    
    if (!reason) {
        showNotification('Please enter a ban reason', 'error');
        return;
    }
    
    const banData = {
        playerId: parseInt(playerId),
        reason: reason,
        duration: duration
    };
    
    fetch(`https://${GetParentResourceName()}/banPlayer`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(banData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Player banned successfully', 'success');
            closeBanModal();
            loadPlayers(); // Refresh player list
        } else {
            showNotification('Error banning player: ' + (data.error || 'Unknown error'), 'error');
        }
    })
    .catch(error => {
        console.error('Error banning player:', error);
        showNotification('Error banning player', 'error');
    });
}

// Settings functions
function saveSettings() {
    const settings = {
        warningThreshold: parseInt(document.getElementById('warning-threshold').value),
        kickThreshold: parseInt(document.getElementById('kick-threshold').value),
        tempbanThreshold: parseInt(document.getElementById('tempban-threshold').value),
        permbanThreshold: parseInt(document.getElementById('permban-threshold').value),
        autoRefresh: document.getElementById('auto-refresh').checked,
        refreshInterval: parseInt(document.getElementById('refresh-interval').value),
        maxLogs: parseInt(document.getElementById('max-logs').value)
    };
    
    // Store settings in localStorage
    localStorage.setItem('fivemac-settings', JSON.stringify(settings));
    
    // TODO: Send settings to server
    showNotification('Settings saved successfully', 'success');
}

function resetSettings() {
    if (confirm('Reset all settings to default values?')) {
        document.getElementById('warning-threshold').value = 50;
        document.getElementById('kick-threshold').value = 100;
        document.getElementById('tempban-threshold').value = 200;
        document.getElementById('permban-threshold').value = 500;
        document.getElementById('auto-refresh').checked = true;
        document.getElementById('refresh-interval').value = 5;
        document.getElementById('max-logs').value = 1000;
        
        // Remove from localStorage
        localStorage.removeItem('fivemac-settings');
        
        showNotification('Settings reset to default', 'success');
    }
}

function loadSettings() {
    const savedSettings = localStorage.getItem('fivemac-settings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        document.getElementById('warning-threshold').value = settings.warningThreshold || 50;
        document.getElementById('kick-threshold').value = settings.kickThreshold || 100;
        document.getElementById('tempban-threshold').value = settings.tempbanThreshold || 200;
        document.getElementById('permban-threshold').value = settings.permbanThreshold || 500;
        document.getElementById('auto-refresh').checked = settings.autoRefresh !== false;
        document.getElementById('refresh-interval').value = settings.refreshInterval || 5;
        document.getElementById('max-logs').value = settings.maxLogs || 1000;
        
        autoRefreshEnabled = settings.autoRefresh !== false;
    }
}

// Auto refresh functionality
function startAutoRefresh() {
    if (!autoRefreshEnabled) return;
    
    const interval = parseInt(document.getElementById('refresh-interval').value) * 1000;
    
    refreshInterval = setInterval(() => {
        if (autoRefreshEnabled) {
            loadPlayers();
            if (document.getElementById('logs-tab').classList.contains('active')) {
                loadLogs();
            }
        }
    }, interval);
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

// Utility functions
function closeAdminPanel() {
    stopAutoRefresh();
    document.getElementById('app').classList.add('hidden');
    
    // Send close message to FiveM
    fetch(`https://${GetParentResourceName()}/closeUI`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    });
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ffc107';
            notification.style.color = '#212529';
            break;
        default:
            notification.style.backgroundColor = '#17a2b8';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
}

// Global functions for HTML onclick handlers
window.openBanModal = openBanModal;
window.closeBanModal = closeBanModal;
window.confirmBan = confirmBan;
window.viewPlayerDetails = viewPlayerDetails;
window.warnPlayer = warnPlayer;

// FiveM NUI callbacks
window.addEventListener('message', function(event) {
    if (event.data.type === 'openUI') {
        document.getElementById('app').classList.remove('hidden');
        loadSettings();
        loadPlayers();
        startAutoRefresh();
    } else if (event.data.type === 'closeUI') {
        closeAdminPanel();
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);