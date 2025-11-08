// Background script v2 - handles Chrome DevTools Protocol and MCP communication

console.log('🚀 Engify background script v2 loaded');

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
        files: ['content-simple.js']
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
  console.log('📨 Received message:', message);
  
  if (message.type === 'element_clicked') {
    console.log('🎯 Element was clicked:', message.element);
    
    // Send to MCP server with enhanced context
    fetch('http://localhost:3001/api/bug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: 'test.css',
        line: 42,
        column: 0,
        description: `Clicked element: ${message.element.tagName}`,
        issues: message.element.issues || [],
        dimensions: message.element.dimensions || {},
        styles: message.element.styles || {},
        elementInfo: {
          tagName: message.element.tagName,
          id: message.element.id,
          className: message.element.className,
          textContent: message.element.textContent
        }
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
  
  if (message.type === 'element_submitted') {
    console.log('🎯 Element submitted to IDE:', message);
    
    // Send to MCP server with enhanced context
    fetch('http://localhost:3001/api/bug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: 'test.css', // Will be replaced with real CSS source later
        line: 42,
        column: 0,
        description: message.description,
        actionType: message.actionType || 'other',
        issues: message.elementInfo.issues || [],
        dimensions: message.elementInfo.dimensions || {},
        styles: message.elementInfo.styles || {},
        elementInfo: {
          tagName: message.elementInfo.tagName,
          id: message.elementInfo.id,
          className: message.elementInfo.className,
          textContent: message.elementInfo.textContent,
          selector: message.elementInfo.selector
        },
        screenshot: message.elementInfo.screenshot,
        pageUrl: message.elementInfo.pageUrl,
        pageTitle: message.elementInfo.pageTitle,
        timestamp: message.elementInfo.timestamp,
        url: message.url || 'unknown',
        source: 'chrome-extension'
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log('✅ Sent to MCP server:', result);
      sendResponse({
        success: true,
        message: 'Submitted to IDE successfully',
        mcpResult: result
      });
    })
    .catch(error => {
      console.error('❌ MCP server error:', error);
      sendResponse({
        success: false,
        message: 'Failed to submit to IDE',
        error: error.message
      });
    });
    
    return true; // Keep message channel open for async response
  }
  
  return true;
});

console.log('✅ Background script v2 setup complete');
