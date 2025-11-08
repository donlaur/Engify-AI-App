// Simple content script for testing

let isInspectMode = false;
let highlight = null;

console.log('Engify content script loaded');

// Create highlight element
function createHighlight() {
  highlight = document.createElement('div');
  highlight.id = 'engify-highlight';
  highlight.style.cssText = `
    position: absolute;
    pointer-events: none;
    border: 2px solid #ff6b6b;
    background-color: rgba(255, 107, 107, 0.1);
    z-index: 10000;
  `;
  document.body.appendChild(highlight);
}

// Update highlight position
function updateHighlight(element) {
  if (!highlight) createHighlight();
  
  const rect = element.getBoundingClientRect();
  highlight.style.left = `${rect.left + window.scrollX}px`;
  highlight.style.top = `${rect.top + window.scrollY}px`;
  highlight.style.width = `${rect.width}px`;
  highlight.style.height = `${rect.height}px`;
}

// Remove highlight
function removeHighlight() {
  if (highlight) {
    highlight.remove();
    highlight = null;
  }
}

// Handle element click
function handleClick(event) {
  if (!isInspectMode) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  const element = event.target;
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  const parent = element.parentElement;
  
  console.log('Clicked element:', element);
  
  // Capture potential UI issues
  const issues = [];
  
  // Check for common visual problems
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
  
  if (styles.zIndex && parseInt(styles.zIndex) > 1000) {
    issues.push('Very high z-index might cause layering issues');
  }
  
  // Check if element is off-screen
  if (rect.right < 0 || rect.left > window.innerWidth) {
    issues.push('Element is positioned off-screen horizontally');
  }
  if (rect.bottom < 0 || rect.top > window.innerHeight) {
    issues.push('Element is positioned off-screen vertically');
  }
  
  // Send to background script with enhanced context
  chrome.runtime.sendMessage({
    type: 'element_clicked',
    element: {
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      textContent: element.textContent?.substring(0, 50),
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
        zIndex: styles.zIndex
      }
    }
  }, (response) => {
    console.log('Background script response:', response);
    
    // Show enhanced alert with results
    if (response && response.success) {
      let message = `✅ Found: ${response.file}:${response.line}:${response.column}`;
      
      if (issues.length > 0) {
        message += `\n\n⚠️ Potential Issues:\n${issues.join('\n')}`;
      }
      
      if (response.mcpResult) {
        message += `\n\n📡 Sent to MCP server!`;
      } else if (response.mcpError) {
        message += `\n\n⚠️ MCP server error: ${response.mcpError}`;
      }
      
      alert(message);
    }
    
    // Turn off inspect mode
    isInspectMode = false;
    document.body.style.cursor = 'default';
    removeHighlight();
  });
}

// Handle mouse move for hover effect
function handleMouseMove(event) {
  if (!isInspectMode) return;
  updateHighlight(event.target);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('🔥 Content script received message:', message);
  
  if (message.type === 'toggle_inspect') {
    isInspectMode = !isInspectMode;
    
    if (isInspectMode) {
      document.body.style.cursor = 'crosshair';
      console.log('✅ Inspect mode ON - cursor changed to crosshair');
      alert('Inspect mode ON! Now click any element to find its source.');
    } else {
      document.body.style.cursor = 'default';
      removeHighlight();
      console.log('❌ Inspect mode OFF');
    }
    
    sendResponse({ success: true, mode: isInspectMode ? 'on' : 'off' });
  }
  
  if (message.type === 'get_state') {
    sendResponse({ 
      success: true, 
      isInspectMode: isInspectMode 
    });
  }
  
  return true; // Keep message channel open
});

// Add event listeners
document.addEventListener('click', handleClick, true);
document.addEventListener('mousemove', handleMouseMove, true);

console.log('Content script event listeners added');
