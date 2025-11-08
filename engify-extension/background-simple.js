// Simple background script for testing

console.log('Engify background script loaded');

// Listen for extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  console.log('Extension icon clicked on tab:', tab.id);
  
  try {
    // Send message to content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'toggle_inspect'
    });
    
    console.log('Content script response:', response);
  } catch (error) {
    console.error('Error sending message to content script:', error);
    
    // Try to inject content script
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      // Try again after injection
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'toggle_inspect'
      });
      
      console.log('Content script response after injection:', response);
    } catch (injectError) {
      console.error('Failed to inject content script:', injectError);
    }
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  
  if (message.type === 'element_clicked') {
    console.log('Element was clicked:', message.element);
    
    // Send to MCP server
    fetch('http://localhost:3001/api/bug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: 'test.css',
        line: 42,
        column: 0,
        description: `Clicked element: ${message.element.tagName}`
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log('✅ Sent to MCP server:', result);
      sendResponse({
        success: true,
        message: `Clicked: ${message.element.tagName}`,
        file: 'test.css',
        line: 42,
        column: 0,
        mcpResult: result
      });
    })
    .catch(error => {
      console.error('❌ MCP server error:', error);
      sendResponse({
        success: true,
        message: `Clicked: ${message.element.tagName}`,
        file: 'test.css',
        line: 42,
        column: 0,
        mcpError: error.message
      });
    });
    
    return true; // Keep message channel open for async response
  }
  
  return true;
});

console.log('Background script setup complete');
