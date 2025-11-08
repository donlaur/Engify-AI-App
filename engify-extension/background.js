// Background service worker - handles Chrome DevTools Protocol and MCP communication

let currentTabId = null;
let isDebugging = false;
let lastDebuggedTab = null;

// Listen for extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  currentTabId = tab.id;
  
  try {
    // Toggle inspect mode
    const [response] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Send message to content script
        return new Promise((resolve) => {
          chrome.runtime.sendMessage({ type: 'toggle_inspect_mode' }, (response) => {
            resolve(response);
          });
        });
      }
    });
    
    console.log('Inspect mode toggled:', response);
  } catch (error) {
    console.error('Error toggling inspect mode:', error);
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'element_clicked') {
    console.log('Element clicked:', message.element);
    
    // Get the tab that sent the message
    const tab = sender.tab;
    if (!tab) {
      sendResponse({ success: false, message: 'No tab found' });
      return;
    }
    
    try {
      // Attach debugger to get CSS source info
      await attachDebugger(tab.id);
      
      // Get the DOM node for the clicked element
      const nodeId = await getNodeId(tab.id, message.element);
      
      if (nodeId) {
        // Get CSS source information
        const sourceInfo = await getCSSSourceInfo(tab.id, nodeId);
        
        // Send to MCP server
        await sendToMCPServer({
          ...sourceInfo,
          element: message.element,
          url: tab.url,
          timestamp: new Date().toISOString()
        });
        
        // Update popup with results
        await updatePopup(sourceInfo);
        
        sendResponse({ success: true, sourceInfo });
      } else {
        sendResponse({ success: false, message: 'Could not find element node' });
      }
      
      // Detach debugger
      await detachDebugger(tab.id);
      
    } catch (error) {
      console.error('Error processing element click:', error);
      sendResponse({ success: false, message: error.message });
      await detachDebugger(tab.id);
    }
  }
});

// Attach debugger to tab
async function attachDebugger(tabId) {
  if (isDebugging && lastDebuggedTab === tabId) {
    return; // Already debugging this tab
  }
  
  try {
    await chrome.debugger.attach({ tabId }, '1.3');
    isDebugging = true;
    lastDebuggedTab = tabId;
    console.log('Debugger attached to tab:', tabId);
  } catch (error) {
    console.error('Failed to attach debugger:', error);
    throw error;
  }
}

// Detach debugger from tab
async function detachDebugger(tabId) {
  try {
    await chrome.debugger.detach({ tabId });
    isDebugging = false;
    lastDebuggedTab = null;
    console.log('Debugger detached from tab:', tabId);
  } catch (error) {
    console.error('Failed to detach debugger:', error);
    // Don't throw here, as detaching can fail if already detached
  }
}

// Get node ID for element
async function getNodeId(tabId, elementInfo) {
  try {
    const result = await chrome.debugger.sendCommand(
      { tabId },
      'DOM.getDocument',
      {}
    );
    
    const rootNode = result.root;
    
    // For now, we'll use a simple approach - in a real implementation,
    // we'd need to traverse the DOM to find the specific element
    // This is a simplified version that gets the document root
    return rootNode.nodeId;
    
  } catch (error) {
    console.error('Error getting node ID:', error);
    return null;
  }
}

// Get CSS source information for node
async function getCSSSourceInfo(tabId, nodeId) {
  try {
    const result = await chrome.debugger.sendCommand(
      { tabId },
      'CSS.getMatchedStylesForNode',
      { nodeId }
    );
    
    // Find the most specific user-defined rule
    const userRules = result.matchedCSSRules?.filter(rule => 
      rule.rule && rule.rule.origin !== 'user-agent'
    ) || [];
    
    if (userRules.length > 0) {
      const rule = userRules[0];
      const styleSheetId = rule.rule.styleSheetId;
      
      // Get stylesheet info
      const stylesheetResult = await chrome.debugger.sendCommand(
        { tabId },
        'CSS.getStyleSheetText',
        { styleSheetId }
      );
      
      // Get stylesheet source
      const sourceResult = await chrome.debugger.sendCommand(
        { tabId },
        'CSS.setStyleSheetText',
        { styleSheetId, text: stylesheetResult.text }
      );
      
      return {
        file: rule.rule.sourceURL || 'unknown',
        line: rule.rule.range?.startLine || 0,
        column: rule.rule.range?.startColumn || 0,
        endLine: rule.rule.range?.endLine || 0,
        endColumn: rule.rule.range?.endColumn || 0,
        styleSheetId,
        cssText: stylesheetResult.text
      };
    }
    
    return {
      file: 'unknown',
      line: 0,
      column: 0,
      message: 'No user-defined CSS rules found'
    };
    
  } catch (error) {
    console.error('Error getting CSS source info:', error);
    return {
      file: 'error',
      line: 0,
      column: 0,
      message: error.message
    };
  }
}

// Send data to MCP server
async function sendToMCPServer(data) {
  try {
    const response = await fetch('http://localhost:3001/api/bug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: data.file,
        line: data.line,
        column: data.column,
        screenshot: '', // TODO: Capture screenshot
        description: `Clicked element: ${data.element?.tagName}`,
        url: data.url,
        userId: 'chrome-extension-user'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Data sent to MCP server:', result);
    return result;
    
  } catch (error) {
    console.error('Error sending to MCP server:', error);
    // Don't throw here - the extension should still work even if MCP server is down
    return null;
  }
}

// Update popup with results
async function updatePopup(sourceInfo) {
  try {
    // Store results in chrome.storage for popup to access
    await chrome.storage.local.set({
      lastSourceInfo: sourceInfo,
      lastUpdate: Date.now()
    });
  } catch (error) {
    console.error('Error updating popup:', error);
  }
}

// Handle debugger detach events
chrome.debugger.onDetach.addListener((source, reason) => {
  console.log('Debugger detached:', source, reason);
  isDebugging = false;
  lastDebuggedTab = null;
});

// Handle extension install/update
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Engify extension installed/updated:', details);
  
  if (details.reason === 'install') {
    // First time install
    chrome.tabs.create({
      url: chrome.runtime.getURL('popup.html')
    });
  }
});

console.log('Engify background script loaded');
