// Enhanced popup script with three-tier mode support

console.log('Enhanced popup loaded');

// Check for stored selected element on popup open
const storedElement = sessionStorage.getItem('engifySelectedElement');
if (storedElement) {
  try {
    selectedElement = JSON.parse(storedElement);
    console.log('Found stored element:', selectedElement);
    
    // Show mode selection immediately
    modeSection.classList.add('show');
    statusDiv.textContent = `✅ Selected: ${selectedElement.tagName} element`;
    statusDiv.style.borderLeft = '4px solid #17a2b8';
    instructions.textContent = 'Choose how you want to handle this element';
    
    // Clear the stored element
    sessionStorage.removeItem('engifySelectedElement');
  } catch (error) {
    console.error('Error parsing stored element:', error);
  }
}

const toggleButton = document.getElementById('toggle-button');
const statusDiv = document.getElementById('status');
const modeSection = document.getElementById('mode-section');
const typeSection = document.getElementById('type-section');
const descriptionSection = document.getElementById('description-section');
const instructions = document.getElementById('instructions');
const submitButton = document.getElementById('submit-button');
const descriptionTextarea = document.getElementById('description');

let isInspectMode = false;
let selectedElement = null;
let selectedType = null;
let selectedMode = null;

// Mode selection
document.querySelectorAll('.mode-button').forEach(button => {
  button.addEventListener('click', () => {
    // Remove previous selection
    document.querySelectorAll('.mode-button').forEach(b => b.classList.remove('selected'));
    
    // Select this button
    button.classList.add('selected');
    selectedMode = button.dataset.mode;
    
    // Show type selection
    typeSection.classList.add('show');
    
    // Update submit button text based on mode
    updateSubmitButtonText();
  });
});

// Type selection
document.querySelectorAll('.type-button:not(.mode-button)').forEach(button => {
  button.addEventListener('click', () => {
    // Remove previous selection
    document.querySelectorAll('.type-button:not(.mode-button)').forEach(b => b.classList.remove('selected'));
    
    // Select this button
    button.classList.add('selected');
    selectedType = button.dataset.type;
    
    // Show description section
    descriptionSection.classList.add('show');
    
    // Focus textarea
    descriptionTextarea.focus();
  });
});

// Update submit button text based on mode
function updateSubmitButtonText() {
  const modeTexts = {
    'copy': '📋 Copy Report',
    'dashboard': '🌐 Send to Dashboard',
    'mcp': '🚀 Send to IDE via MCP'
  };
  submitButton.textContent = modeTexts[selectedMode] || 'Submit';
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
    
    // First, try to inject content script
    console.log('💉 Injecting content script...');
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content-enhanced.js']
      });
      console.log('✅ Content script injected');
    } catch (injectError) {
      console.log('⚠️ Content script already loaded or injection failed:', injectError.message);
    }
    
    // Wait for injection
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Send message to content script
    console.log('📤 Sending message to content script...');
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'toggle_inspect'
    });
    
    console.log('📥 Response from content script:', response);
    
    if (response && response.success) {
      isInspectMode = response.mode === 'on';
      updateUI();
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

// Submit based on selected mode
submitButton.addEventListener('click', async () => {
  if (!selectedElement || !selectedType || !selectedMode) {
    alert('Please complete all selections');
    return;
  }
  
  const description = descriptionTextarea.value.trim();
  if (!description) {
    alert('Please describe what needs to be done');
    return;
  }
  
  try {
    if (selectedMode === 'copy') {
      // Mode 1: Copy to clipboard (Free)
      await copyToClipboard();
    } else if (selectedMode === 'dashboard') {
      // Mode 2: Send to dashboard (Freemium)
      await sendToDashboard();
    } else if (selectedMode === 'mcp') {
      // Mode 3: Send via MCP (Pro)
      await sendViaMCP();
    }
    
  } catch (error) {
    console.error('Error submitting:', error);
    alert('Failed to submit: ' + error.message);
  }
});

// Mode 1: Copy to clipboard
async function copyToClipboard() {
  const report = generateReport();
  
  try {
    await navigator.clipboard.writeText(report);
    
    // Show success
    statusDiv.textContent = '✅ Report copied to clipboard!';
    statusDiv.style.borderLeft = '4px solid #28a745';
    
    // Reset after delay
    setTimeout(() => {
      resetUI();
      window.close();
    }, 1500);
    
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = report;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    statusDiv.textContent = '✅ Report copied to clipboard!';
  }
}

// Mode 2: Send to dashboard
async function sendToDashboard() {
  const report = generateReport();
  
  // TODO: Implement dashboard API
  // For now, just show it would be sent
  alert('Dashboard mode coming soon! For now, copying to clipboard.');
  await copyToClipboard();
}

// Mode 3: Send via MCP
async function sendViaMCP() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Send to background script for MCP server
  const response = await chrome.tabs.sendMessage(tab.id, {
    type: 'submit_to_ide',
    elementInfo: selectedElement,
    actionType: selectedType,
    description: descriptionTextarea.value.trim(),
    url: tab.url
  });
  
  if (response && response.success) {
    // Show success
    statusDiv.textContent = '✅ Sent to IDE via MCP!';
    statusDiv.style.borderLeft = '4px solid #28a745';
    
    // Close popup after delay
    setTimeout(() => {
      resetUI();
      window.close();
    }, 1500);
  }
}

// Generate formatted report
function generateReport() {
  const typeLabels = {
    'bug': '🐛 Bug Report',
    'remove': '🗑️ Remove Element',
    'add': '➕ Add Something',
    'move': '↔️ Move/Reposition',
    'style': '🎨 Style Change',
    'text': '📝 Text Change',
    'improve': '💡 Improvement',
    'other': '⚙️ Other'
  };
  
  let report = `=== ${typeLabels[selectedType]} ===\n\n`;
  report += `Description: ${descriptionTextarea.value.trim()}\n\n`;
  
  // Element information
  report += `Element: ${selectedElement.tagName}\n`;
  if (selectedElement.id) report += `ID: #${selectedElement.id}\n`;
  if (selectedElement.className) report += `Class: .${selectedElement.className.split(' ').join('.')}\n`;
  report += `Selector: ${selectedElement.selector}\n\n`;
  
  // Visual information
  report += `Visual Info:\n`;
  report += `- Size: ${selectedElement.dimensions?.width || 0}x${selectedElement.dimensions?.height || 0}px\n`;
  report += `- Position: (${selectedElement.dimensions?.x || 0}, ${selectedElement.dimensions?.y || 0})\n`;
  report += `- Color: ${selectedElement.styles?.color || 'unknown'}\n`;
  report += `- Background: ${selectedElement.styles?.backgroundColor || 'unknown'}\n\n`;
  
  // Issues detected
  if (selectedElement.issues && selectedElement.issues.length > 0) {
    report += `Detected Issues:\n`;
    selectedElement.issues.forEach(issue => {
      report += `- ${issue}\n`;
    });
    report += '\n';
  }
  
  // Page context
  report += `Page Context:\n`;
  report += `- URL: ${selectedElement.pageUrl || window.location.href}\n`;
  report += `- Title: ${selectedElement.pageTitle || document.title}\n`;
  report += `- Timestamp: ${selectedElement.timestamp || new Date().toISOString()}\n\n`;
  
  report += `Generated by: Engify Visual Bug Reporter\n`;
  
  // Add screenshot reference if available
  if (selectedElement.screenshot) {
    report += `\n[Screenshot captured - available in MCP/Dashboard modes]`;
  }
  
  return report;
}

// Update UI based on state
function updateUI() {
  if (isInspectMode) {
    toggleButton.textContent = 'Stop Element Selection';
    toggleButton.classList.remove('primary');
    toggleButton.classList.add('secondary');
    statusDiv.textContent = '🎯 Element selection active - click any element';
    statusDiv.style.borderLeft = '4px solid #ffc107';
    modeSection.classList.remove('show');
    typeSection.classList.remove('show');
    descriptionSection.classList.remove('show');
    instructions.textContent = 'Click any element on the page to select it';
  } else {
    toggleButton.textContent = 'Start Element Selection';
    toggleButton.classList.remove('secondary');
    toggleButton.classList.add('primary');
    statusDiv.textContent = 'Click the button below, then click any element on the page';
    statusDiv.style.borderLeft = '4px solid #6c757d';
    modeSection.classList.remove('show');
    typeSection.classList.remove('show');
    descriptionSection.classList.remove('show');
    instructions.innerHTML = '1. Click "Start Element Selection"<br>2. Click any element on the page<br>3. Choose how to handle it<br>4. Add description and submit';
  }
}

// Reset UI after submission
function resetUI() {
  selectedElement = null;
  selectedType = null;
  selectedMode = null;
  descriptionTextarea.value = '';
  document.querySelectorAll('.type-button').forEach(b => b.classList.remove('selected'));
  isInspectMode = false;
  updateUI();
}

// Listen for element selection from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'element_selected') {
    selectedElement = message.element;
    
    // Show mode selection
    modeSection.classList.add('show');
    statusDiv.textContent = `✅ Selected: ${message.element.tagName} element`;
    statusDiv.style.borderLeft = '4px solid #17a2b8';
    
    // Turn off inspect mode
    isInspectMode = false;
    toggleButton.textContent = 'Start Element Selection';
    toggleButton.classList.remove('secondary');
    toggleButton.classList.add('primary');
    
    instructions.textContent = 'Choose how you want to handle this element';
  }
});

console.log('Enhanced popup script ready');
