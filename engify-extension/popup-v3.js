// Popup v3 - Better UX flow: Intent → Element → Form

let selectedIntent = null;
let selectedElement = null;
let selectedMode = null;

// Screen navigation
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

// Screen 1: Intent Selection
document.querySelectorAll('.intent-card').forEach(card => {
  card.addEventListener('click', async () => {
    selectedIntent = card.dataset.intent;
    console.log('Selected intent:', selectedIntent);
    
    // Move to element selection
    showScreen('screen-select');
    
    // Tell content script to start selection mode
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { type: 'toggle_inspect' }, (response) => {
      console.log('Selection mode activated:', response);
    });
  });
});

// Screen 2: Cancel selection
document.getElementById('cancel-select').addEventListener('click', () => {
  // Turn off selection mode
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { type: 'toggle_inspect' });
  });
  
  // Go back to intent selection
  showScreen('screen-intent');
  selectedIntent = null;
});

// Listen for element selection from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Popup received message:', message);
  
  if (message.type === 'element_selected') {
    selectedElement = message.element;
    console.log('Element selected in popup:', selectedElement);
    
    // Show form screen
    showScreen('screen-form');
    
    // Update element preview
    const preview = document.getElementById('element-preview');
    preview.textContent = `${selectedElement.tagName}${selectedElement.id ? '#' + selectedElement.id : ''}${selectedElement.className ? '.' + selectedElement.className.split(' ')[0] : ''}`;
    
    sendResponse({ success: true });
  }
  
  return true;
});

// Check if element was already selected (from sessionStorage)
window.addEventListener('load', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Execute script to get sessionStorage
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const data = sessionStorage.getItem('engifySelectedElement');
      return data ? JSON.parse(data) : null;
    }
  });
  
  if (results && results[0] && results[0].result) {
    selectedElement = results[0].result;
    console.log('Found selected element in sessionStorage:', selectedElement);
    
    // Show form screen
    showScreen('screen-form');
    
    // Update element preview
    const preview = document.getElementById('element-preview');
    preview.textContent = `${selectedElement.tagName}${selectedElement.id ? '#' + selectedElement.id : ''}${selectedElement.className ? '.' + selectedElement.className.split(' ')[0] : ''}`;
    
    // Clear sessionStorage so it doesn't persist
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        sessionStorage.removeItem('engifySelectedElement');
      }
    });
  }
});

// Screen 3: Mode selection
document.querySelectorAll('.mode-option').forEach(option => {
  option.addEventListener('click', () => {
    // Remove previous selection
    document.querySelectorAll('.mode-option').forEach(o => o.classList.remove('selected'));
    
    // Select this one
    option.classList.add('selected');
    selectedMode = option.dataset.mode;
    console.log('Selected mode:', selectedMode);
  });
});

// Screen 3: Submit
document.getElementById('submit-btn').addEventListener('click', async () => {
  const description = document.getElementById('description').value.trim();
  
  if (!description) {
    alert('Please add a description');
    return;
  }
  
  if (!selectedMode) {
    alert('Please select where to send this');
    return;
  }
  
  console.log('Submitting:', { intent: selectedIntent, element: selectedElement, description, mode: selectedMode });
  
  if (selectedMode === 'clipboard') {
    // Copy to clipboard
    const report = formatReport(selectedIntent, selectedElement, description);
    await navigator.clipboard.writeText(report);
    alert('✅ Copied to clipboard!');
    window.close();
  } else if (selectedMode === 'dashboard') {
    // Send to dashboard API
    try {
      const response = await fetch('https://engify.ai/api/bugs/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth token
        },
        body: JSON.stringify({
          intent: selectedIntent,
          description,
          element: selectedElement,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        alert('✅ Sent to dashboard!');
        window.close();
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      console.error('Error sending to dashboard:', error);
      alert('❌ Failed to send. Copying to clipboard instead...');
      const report = formatReport(selectedIntent, selectedElement, description);
      await navigator.clipboard.writeText(report);
    }
  } else if (selectedMode === 'ide') {
    // Send to IDE via MCP
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, {
      type: 'submit_to_ide',
      elementInfo: selectedElement,
      intent: selectedIntent,
      description,
      url: tab.url
    }, (response) => {
      if (response && response.success) {
        alert('✅ Sent to IDE!');
        window.close();
      } else {
        alert('❌ Failed to send to IDE');
      }
    });
  }
});

// Screen 3: Back button
document.getElementById('back-btn').addEventListener('click', () => {
  showScreen('screen-intent');
  selectedIntent = null;
  selectedElement = null;
  selectedMode = null;
  document.getElementById('description').value = '';
  document.querySelectorAll('.mode-option').forEach(o => o.classList.remove('selected'));
});

// Format report for clipboard
function formatReport(intent, element, description) {
  const intentEmoji = {
    bug: '🐛',
    learn: '💡',
    debug: '📊',
    design: '🎨'
  };
  
  return `${intentEmoji[intent]} ${intent.toUpperCase()} REPORT

Description:
${description}

Element:
${element.tagName}${element.id ? '#' + element.id : ''}${element.className ? '.' + element.className.split(' ')[0] : ''}

Selector:
${element.selector}

Page:
${element.pageUrl}

Timestamp:
${new Date().toISOString()}

${element.issues && element.issues.length > 0 ? `\nIssues Detected:\n${element.issues.map(i => `- ${i}`).join('\n')}` : ''}
`;
}
