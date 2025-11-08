// Simple popup script - no storage or scripting dependencies

console.log('Simple popup loaded');

const toggleButton = document.getElementById('toggle-button');
const statusDiv = document.getElementById('status');

// Update button text
function updateButton(isActive) {
  if (isActive) {
    toggleButton.textContent = 'Stop Inspection Mode';
    statusDiv.textContent = 'Inspection mode active - click an element';
    statusDiv.style.borderLeft = '4px solid #28a745';
  } else {
    toggleButton.textContent = 'Start Inspection Mode';
    statusDiv.textContent = 'Click the button below, then click any element on the page';
    statusDiv.style.borderLeft = '4px solid #6c757d';
  }
}

// Toggle inspection mode
toggleButton.addEventListener('click', async () => {
  console.log('🔥 Popup button clicked!');
  
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('📋 Current tab:', tab);
    
    if (!tab) {
      statusDiv.textContent = 'Error: No active tab found';
      return;
    }
    
    // First, try to inject content script to ensure it's loaded
    console.log('💉 Injecting content script...');
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content-simple.js']
      });
      console.log('✅ Content script injected');
    } catch (injectError) {
      console.log('⚠️ Content script already loaded or injection failed:', injectError.message);
    }
    
    // Wait a bit for injection to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Send message to content script
    console.log('📤 Sending message to content script...');
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'toggle_inspect'
    });
    
    console.log('📥 Response from content script:', response);
    
    if (response && response.success) {
      updateButton(response.mode === 'on');
      statusDiv.textContent = response.mode === 'on' 
        ? '✅ Inspection mode active!' 
        : '❌ Inspection mode off';
    } else {
      statusDiv.textContent = '❌ Content script not responding - try refreshing the page';
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
    
    if (error.message.includes('Receiving end does not exist')) {
      statusDiv.textContent = '❌ Content script not loaded - refresh the page and try again';
    } else {
      statusDiv.textContent = 'Error: ' + error.message;
    }
  }
});

// Check current state when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      // Try to get current state
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'get_state'
      });
      
      if (response && response.success) {
        updateButton(response.isInspectMode);
      }
    }
  } catch (error) {
    // Content script might not be loaded yet
    console.log('Content script not loaded yet');
  }
});

console.log('Simple popup script ready');
