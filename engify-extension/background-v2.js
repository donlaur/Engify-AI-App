// Background script v2 - handles Chrome DevTools Protocol and MCP communication

console.log('🚀 Engify background script v2 loaded');

// Listen for extension icon click - show overlay instead of popup
chrome.action.onClicked.addListener(async (tab) => {
  console.log('Extension icon clicked on tab:', tab.id);
  
  try {
    // Send message to show overlay
    await chrome.tabs.sendMessage(tab.id, {
      type: 'show_overlay'
    });
    
    console.log('Overlay shown');
  } catch (error) {
    // Silently fail - content script will handle it
    console.log('Content script not ready yet, overlay will show on page load');
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Received message:', message);
  
  // Auto-open popup when element is selected
  if (message.type === 'element_selected' && message.openPopup) {
    console.log('🎯 Element selected, opening popup...');
    chrome.action.openPopup();
    sendResponse({ success: true });
    return true;
  }
  
  if (message.type === 'element_clicked') {
    console.log('🎯 Element was clicked:', message.element);
    
    // Send to MCP server with MVP schema
    fetch('http://localhost:3001/api/bug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Core fields
        title: `Element clicked: ${message.element.tagName}${message.element.id ? '#' + message.element.id : ''}`,
        intent: 'design_feedback', // Element clicks are design feedback
        url: message.element.pageUrl || window.location.href,
        description: `Clicked element: ${message.element.tagName}`,
        
        // Captured data
        capturedData: {
          domSnapshot: message.element.selector || '',
          computedStyles: message.element.styles || {},
          screenshot: message.element.screenshot || null,
          consoleLogs: [], // Will be captured separately
          networkRequests: [] // Will be captured separately
        },
        
        // Browser context
        browserInfo: {
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        },
        
        // Additional context
        notes: message.element.issues?.join(', ') || '',
        tags: ['element-click', message.element.tagName.toLowerCase()]
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log('✅ Sent to MCP server:', result);
      sendResponse({
        success: true,
        message: `Clicked: ${message.element.tagName}`,
        bugId: result.id,
        mcpResult: result
      });
    })
    .catch(error => {
      console.error('❌ MCP server error:', error);
      sendResponse({
        success: false,
        message: `Failed to capture: ${error.message}`,
        mcpError: error.message
      });
    });
    
    return true; // Keep message channel open for async response
  }
  
  if (message.type === 'element_submitted') {
    console.log('🎯 Element submitted to IDE:', message);
    
    // Determine intent based on action type
    const intentMap = {
      'bug': 'bug_report',
      'explain': 'explain_code',
      'debug': 'debug_technical',
      'design': 'design_feedback'
    };
    const intent = intentMap[message.actionType] || 'bug_report';
    
    // Send to MCP server with MVP schema
    fetch('http://localhost:3001/api/bug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Core fields
        title: message.description || `${message.actionType}: ${message.elementInfo.tagName}`,
        intent: intent,
        url: message.elementInfo.pageUrl || message.url || window.location.href,
        description: message.description,
        
        // Location context (optional for design feedback)
        file: message.file || null,
        line: message.line || null,
        column: message.column || null,
        
        // Captured data
        capturedData: {
          domSnapshot: message.elementInfo.selector || '',
          computedStyles: message.elementInfo.styles || {},
          screenshot: message.elementInfo.screenshot || null,
          consoleLogs: [], // TODO: Capture from DevTools
          networkRequests: [] // TODO: Capture from DevTools
        },
        
        // Browser context
        browserInfo: {
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        },
        
        // Additional context
        notes: message.elementInfo.issues?.join(', ') || '',
        tags: [
          message.actionType || 'other',
          message.elementInfo.tagName?.toLowerCase() || 'unknown'
        ],
        
        // Mark for IDE if submitted
        markedForIDE: true,
        status: 'new'
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log('✅ Sent to MCP server:', result);
      sendResponse({
        success: true,
        message: 'Submitted to IDE successfully',
        bugId: result.id,
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
