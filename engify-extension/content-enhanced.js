// Enhanced content script - supports element selection and type capture

// Prevent multiple injections
if (window.engifyContentScriptLoaded) {
  console.log('Engify content script already loaded');
} else {
  window.engifyContentScriptLoaded = true;
  
  let isInspectMode = false;
  let highlightedElement = null;

  console.log('🚀 Enhanced content script loaded');

// Create visual indicator
function createHighlight() {
  const highlight = document.createElement('div');
  highlight.id = 'engify-highlight';
  highlight.style.cssText = `
    position: absolute;
    pointer-events: none;
    border: 2px solid #17a2b8;
    background-color: rgba(23, 162, 184, 0.1);
    z-index: 10000;
    transition: all 0.1s ease;
  `;
  document.body.appendChild(highlight);
  return highlight;
}

// Update highlight position
function updateHighlight(element) {
  const highlight = document.getElementById('engify-highlight') || createHighlight();
  const rect = element.getBoundingClientRect();
  
  highlight.style.left = `${rect.left + window.scrollX}px`;
  highlight.style.top = `${rect.top + window.scrollY}px`;
  highlight.style.width = `${rect.width}px`;
  highlight.style.height = `${rect.height}px`;
}

// Remove highlight
function removeHighlight() {
  const highlight = document.getElementById('engify-highlight');
  if (highlight) {
    highlight.remove();
  }
}

// Capture element information
function captureElementInfo(element) {
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  
  // Detect potential issues
  const issues = [];
  
  if (styles.color === styles.backgroundColor) {
    issues.push('Text color matches background (invisible text)');
  }
  
  if (parseFloat(styles.opacity) < 0.5) {
    issues.push('Element is very transparent');
  }
  
  if (rect.width < 50 || rect.height < 20) {
    issues.push('Element might be too small');
  }
  
  if (element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight) {
    issues.push('Content is overflowing/hidden');
  }
  
  if (styles.position === 'absolute' || styles.position === 'fixed') {
    issues.push('Absolutely positioned element');
  }
  
  if (element.textContent && element.textContent.trim().length === 0) {
    issues.push('Element has no visible text content');
  }
  
  return {
    tagName: element.tagName,
    id: element.id || '',
    className: element.className || '',
    textContent: element.textContent?.substring(0, 100) || '',
    issues: issues,
    dimensions: {
      width: rect.width,
      height: rect.height,
      x: rect.x,
      y: rect.y
    },
    styles: {
      color: styles.color,
      backgroundColor: styles.backgroundColor,
      opacity: styles.opacity,
      position: styles.position,
      zIndex: styles.zIndex,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight
    },
    selector: generateSelector(element),
    screenshot: captureElementScreenshot(element, rect),
    pageUrl: window.location.href,
    pageTitle: document.title,
    timestamp: new Date().toISOString()
  };
}

// Capture screenshot of element
function captureElementScreenshot(element, rect) {
  try {
    // Use Chrome's captureVisibleTab API through background script
    chrome.runtime.sendMessage({
      type: 'capture_screenshot',
      elementRect: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      }
    }, (response) => {
      if (response && response.screenshot) {
        return response.screenshot;
      }
    });
    return null; // Will be filled asynchronously
  } catch (error) {
    console.log('Screenshot capture not available:', error);
    return null;
  }
}

// Generate CSS selector for element
function generateSelector(element) {
  if (element.id) {
    return `#${element.id}`;
  }
  
  let selector = element.tagName.toLowerCase();
  
  if (element.className) {
    const classes = element.className.split(' ').filter(c => c.trim());
    if (classes.length > 0) {
      selector += '.' + classes.join('.');
    }
  }
  
  // Add nth-child if needed for uniqueness
  const parent = element.parentElement;
  if (parent) {
    const siblings = Array.from(parent.children).filter(child => child.tagName === element.tagName);
    if (siblings.length > 1) {
      const index = siblings.indexOf(element) + 1;
      selector += `:nth-child(${index})`;
    }
  }
  
  return selector;
}

// Show notification to user
function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    z-index: 10001;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 300);
  }, 3000);
}

// Clean up old storage to prevent quota issues
function cleanupStorage() {
  try {
    // Clear any old Engify data that might be accumulating
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('engify') && key !== 'engifySelectedElement') {
        sessionStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.log('Storage cleanup failed:', error);
  }
}

// Initialize and cleanup
cleanupStorage();

// Handle element click for selection
function handleSelectionClick(event) {
  if (!isInspectMode) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  const element = event.target;
  const elementInfo = captureElementInfo(element);
  
  console.log('🎯 Element selected:', elementInfo);
  
  // Store selected element in session storage for popup to retrieve
  // Only store essential data to avoid storage quota issues
  const compactElementInfo = {
    tagName: elementInfo.tagName,
    id: elementInfo.id,
    className: elementInfo.className,
    textContent: elementInfo.textContent,
    selector: elementInfo.selector,
    dimensions: elementInfo.dimensions,
    styles: elementInfo.styles,
    issues: elementInfo.issues,
    pageUrl: elementInfo.pageUrl,
    pageTitle: elementInfo.pageTitle,
    timestamp: elementInfo.timestamp
    // Exclude screenshot to avoid storage issues
  };
  sessionStorage.setItem('engifySelectedElement', JSON.stringify(compactElementInfo));
  
  // Send to overlay
  if (window.engifyOverlay) {
    window.engifyOverlay.handleElementSelected(compactElementInfo);
  }
  
  // Also send to background
  chrome.runtime.sendMessage({
    type: 'element_selected',
    element: elementInfo
  });
  
  // Turn off inspect mode
  isInspectMode = false;
  document.body.style.cursor = 'default';
  removeHighlight();
  
  console.log('✅ Element selected, sent to overlay');
}

// Handle mouse move for hover effect
function handleMouseMove(event) {
  if (!isInspectMode) return;
  updateHighlight(event.target);
}

// Listen for messages from overlay via postMessage
window.addEventListener('message', (event) => {
  if (event.data.type === 'engify_toggle_inspect') {
    isInspectMode = !isInspectMode;
    
    if (isInspectMode) {
      document.body.style.cursor = 'crosshair';
      console.log('✅ Element selection mode ON');
    } else {
      document.body.style.cursor = 'default';
      removeHighlight();
      console.log('❌ Element selection mode OFF');
    }
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('🔥 Enhanced content script received message:', message);
  
  if (message.type === 'toggle_inspect') {
    isInspectMode = !isInspectMode;
    
    if (isInspectMode) {
      document.body.style.cursor = 'crosshair';
      console.log('✅ Element selection mode ON');
    } else {
      document.body.style.cursor = 'default';
      removeHighlight();
      console.log('❌ Element selection mode OFF');
    }
    
    sendResponse({ success: true, mode: isInspectMode ? 'on' : 'off' });
  }
  
  if (message.type === 'get_state') {
    sendResponse({ 
      success: true, 
      isInspectMode: isInspectMode 
    });
  }
  
  if (message.type === 'submit_to_ide') {
    // Send to background script for MCP server
    chrome.runtime.sendMessage({
      type: 'element_submitted',
      elementInfo: message.elementInfo,
      actionType: message.type,
      description: message.description,
      url: message.url
    }, (response) => {
      sendResponse(response);
    });
    
    return true; // Keep message channel open
  }
  
  return true;
});

// Add event listeners
document.addEventListener('click', handleSelectionClick, true);
document.addEventListener('mousemove', handleMouseMove, true);

console.log('✅ Enhanced content script event listeners added');

} // Close the injection check
