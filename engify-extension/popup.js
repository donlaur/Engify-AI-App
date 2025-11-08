// Popup script - handles UI and displays results

let isInspectMode = false;
let lastSourceInfo = null;

// DOM elements
const toggleButton = document.getElementById('toggle-button');
const copyButton = document.getElementById('copy-button');
const sendButton = document.getElementById('send-button');
const statusDiv = document.getElementById('status');
const statusText = document.getElementById('status-text');
const resultsDiv = document.getElementById('results');
const messageDiv = document.getElementById('message');

// Result elements
const resultFile = document.getElementById('result-file');
const resultLine = document.getElementById('result-line');
const resultColumn = document.getElementById('result-column');

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup loaded');
  
  // Check for stored results
  try {
    const storage = await chrome.storage.local.get(['lastSourceInfo', 'lastUpdate']);
    if (storage.lastSourceInfo && storage.lastUpdate) {
      // Only show results if they're recent (within 5 minutes)
      const age = Date.now() - storage.lastUpdate;
      if (age < 5 * 60 * 1000) {
        displayResults(storage.lastSourceInfo);
      }
    }
  } catch (error) {
    console.error('Error loading stored results:', error);
  }
  
  // Check current inspect mode state
  updateInspectModeUI();
});

// Toggle inspection mode
toggleButton.addEventListener('click', async () => {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      showError('No active tab found');
      return;
    }
    
    // Toggle inspect mode in content script
    const [response] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage({ type: 'toggle_inspect_mode' }, (response) => {
            resolve(response);
          });
        });
      }
    });
    
    if (response && response.success) {
      isInspectMode = response.mode === 'on';
      updateInspectModeUI();
    }
    
  } catch (error) {
    console.error('Error toggling inspect mode:', error);
    showError('Failed to toggle inspection mode');
  }
});

// Copy location to clipboard
copyButton.addEventListener('click', async () => {
  if (!lastSourceInfo) {
    showError('No source information available');
    return;
  }
  
  const location = `${lastSourceInfo.file}:${lastSourceInfo.line}:${lastSourceInfo.column}`;
  
  try {
    await navigator.clipboard.writeText(location);
    showSuccess('Location copied to clipboard!');
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    showError('Failed to copy to clipboard');
  }
});

// Send to IDE (MCP server)
sendButton.addEventListener('click', async () => {
  if (!lastSourceInfo) {
    showError('No source information available');
    return;
  }
  
  try {
    // Check if MCP server is running
    const response = await fetch('http://localhost:3001/health');
    if (!response.ok) {
      throw new Error('MCP server not running');
    }
    
    // Send to MCP server (already sent by background script, but we can send again)
    const mcpResponse = await fetch('http://localhost:3001/api/bug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: lastSourceInfo.file,
        line: lastSourceInfo.line,
        column: lastSourceInfo.column,
        action: 'open_in_ide',
        userId: 'chrome-extension-user'
      })
    });
    
    if (mcpResponse.ok) {
      showSuccess('Sent to IDE! Check your editor.');
    } else {
      throw new Error('Failed to send to IDE');
    }
    
  } catch (error) {
    console.error('Error sending to IDE:', error);
    showError('Failed to send to IDE. Is MCP server running?');
  }
});

// Update UI based on inspect mode
function updateInspectModeUI() {
  if (isInspectMode) {
    toggleButton.textContent = 'Stop Inspection Mode';
    toggleButton.classList.remove('primary');
    toggleButton.classList.add('secondary');
    statusDiv.classList.remove('inactive');
    statusDiv.classList.add('active');
    statusText.textContent = 'Inspection mode active - click an element';
  } else {
    toggleButton.textContent = 'Start Inspection Mode';
    toggleButton.classList.remove('secondary');
    toggleButton.classList.add('primary');
    statusDiv.classList.remove('active');
    statusDiv.classList.add('inactive');
    statusText.textContent = 'Click to activate inspection mode';
  }
}

// Display results in popup
function displayResults(sourceInfo) {
  lastSourceInfo = sourceInfo;
  
  // Update result fields
  resultFile.textContent = sourceInfo.file || 'unknown';
  resultLine.textContent = sourceInfo.line || 0;
  resultColumn.textContent = sourceInfo.column || 0;
  
  // Show results section
  resultsDiv.classList.add('show');
  
  // Enable buttons
  copyButton.disabled = false;
  sendButton.disabled = false;
  
  // Reset inspect mode
  isInspectMode = false;
  updateInspectModeUI();
  
  // Show success message
  if (sourceInfo.message) {
    showError(sourceInfo.message);
  } else {
    showSuccess('Element location found!');
  }
}

// Show error message
function showError(message) {
  messageDiv.innerHTML = `<div class="error">${message}</div>`;
  setTimeout(() => {
    messageDiv.innerHTML = '';
  }, 5000);
}

// Show success message
function showSuccess(message) {
  messageDiv.innerHTML = `<div class="success">${message}</div>`;
  setTimeout(() => {
    messageDiv.innerHTML = '';
  }, 3000);
}

// Listen for storage changes (from background script)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.lastSourceInfo) {
    displayResults(changes.lastSourceInfo.newValue);
  }
});

console.log('Popup script loaded');
