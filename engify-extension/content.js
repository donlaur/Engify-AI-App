// Content script - handles element clicking and visual feedback

let isInspectMode = false;
let highlightedElement = null;

// Create visual indicator
function createHighlight() {
  const highlight = document.createElement('div');
  highlight.id = 'engify-highlight';
  highlight.style.cssText = `
    position: absolute;
    pointer-events: none;
    border: 2px solid #ff6b6b;
    background-color: rgba(255, 107, 107, 0.1);
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

// Get element path for identification
function getElementPath(element) {
  const path = [];
  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let selector = element.nodeName.toLowerCase();
    if (element.id) {
      selector += `#${element.id}`;
    } else if (element.className) {
      selector += `.${element.className.split(' ').join('.')}`;
    }
    path.unshift(selector);
    element = element.parentNode;
  }
  return path.join(' > ');
}

// Handle element click
function handleElementClick(event) {
  if (!isInspectMode) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  const element = event.target;
  highlightedElement = element;
  
  // Update highlight
  updateHighlight(element);
  
  // Send element info to background script
  chrome.runtime.sendMessage({
    type: 'element_clicked',
    element: {
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      textContent: element.textContent?.substring(0, 100),
      path: getElementPath(element)
    }
  });
  
  // Exit inspect mode after click
  isInspectMode = false;
  document.body.style.cursor = 'default';
}

// Mouse move for hover effect
function handleMouseMove(event) {
  if (!isInspectMode) return;
  
  const element = event.target;
  updateHighlight(element);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'toggle_inspect_mode') {
    isInspectMode = !isInspectMode;
    
    if (isInspectMode) {
      document.body.style.cursor = 'crosshair';
      sendResponse({ success: true, mode: 'on' });
    } else {
      document.body.style.cursor = 'default';
      removeHighlight();
      sendResponse({ success: true, mode: 'off' });
    }
  }
  
  if (message.type === 'get_element_info') {
    if (highlightedElement) {
      sendResponse({
        success: true,
        element: {
          tagName: highlightedElement.tagName,
          id: highlightedElement.id,
          className: highlightedElement.className,
          textContent: highlightedElement.textContent?.substring(0, 100),
          path: getElementPath(highlightedElement)
        }
      });
    } else {
      sendResponse({ success: false, message: 'No element selected' });
    }
  }
});

// Add event listeners
document.addEventListener('click', handleElementClick, true);
document.addEventListener('mousemove', handleMouseMove, true);

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  removeHighlight();
});

console.log('Engify content script loaded');
