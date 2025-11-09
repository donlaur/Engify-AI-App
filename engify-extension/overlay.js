// In-page overlay for Engify - stays open while selecting elements

let overlayContainer = null;
let selectedIntent = null;
let selectedElement = null;
let selectedMode = null;

// Create overlay
function createOverlay() {
  if (overlayContainer) return;
  
  overlayContainer = document.createElement('div');
  overlayContainer.id = 'engify-overlay';
  overlayContainer.innerHTML = `
    <style>
      #engify-overlay {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 380px;
        max-height: calc(100vh - 40px);
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      
      #engify-overlay.minimized {
        width: 200px;
        height: 60px;
      }
      
      #engify-overlay.dragging {
        cursor: move;
      }
      
      .engify-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        user-select: none;
      }
      
      .engify-title {
        font-size: 16px;
        font-weight: 600;
      }
      
      .engify-controls {
        display: flex;
        gap: 8px;
      }
      
      .engify-btn-small {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
      }
      
      .engify-btn-small:hover {
        background: rgba(255,255,255,0.3);
      }
      
      .engify-content {
        padding: 16px;
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
      }
      
      .engify-content::-webkit-scrollbar {
        width: 8px;
      }
      
      .engify-content::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }
      
      .engify-content::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }
      
      .engify-content::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
      
      #engify-overlay.minimized .engify-content {
        display: none;
      }
      
      .engify-screen {
        display: none;
      }
      
      .engify-screen.active {
        display: block;
      }
      
      .engify-intent-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      
      .engify-intent-card {
        background: #f8f9fa;
        border: 2px solid #e9ecef;
        border-radius: 12px;
        padding: 20px;
        cursor: pointer;
        text-align: center;
        transition: all 0.2s;
      }
      
      .engify-intent-card:hover {
        border-color: #667eea;
        background: #f0f4ff;
        transform: translateY(-2px);
      }
      
      .engify-intent-icon {
        font-size: 32px;
        margin-bottom: 8px;
      }
      
      .engify-intent-title {
        font-size: 14px;
        font-weight: 600;
        color: #212529;
      }
      
      .engify-status-box {
        background: #f0f4ff;
        border: 2px solid #667eea;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        margin-bottom: 16px;
      }
      
      .engify-status-icon {
        font-size: 48px;
        margin-bottom: 8px;
      }
      
      .engify-form-group {
        margin-bottom: 16px;
      }
      
      .engify-label {
        font-size: 13px;
        font-weight: 600;
        color: #212529;
        margin-bottom: 8px;
        display: block;
      }
      
      .engify-input {
        width: 100%;
        padding: 10px;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        font-size: 13px;
        font-family: inherit;
        box-sizing: border-box;
      }
      
      .engify-textarea {
        min-height: 60px;
        max-height: 120px;
        resize: vertical;
      }
      
      .engify-mode-option {
        padding: 12px;
        border: 2px solid #e9ecef;
        border-radius: 6px;
        cursor: pointer;
        margin-bottom: 8px;
        transition: all 0.2s;
        font-size: 13px;
        color: #212529;
      }
      
      .engify-mode-option:hover {
        border-color: #667eea;
        background: #f0f4ff;
      }
      
      .engify-mode-option.selected {
        border-color: #667eea;
        background: #667eea;
        color: white;
      }
      
      .engify-btn {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        margin-bottom: 8px;
      }
      
      .engify-btn-primary {
        background: #667eea;
        color: white;
      }
      
      .engify-btn-primary:hover {
        background: #5568d3;
      }
      
      .engify-btn-secondary {
        background: #6c757d;
        color: white;
      }
      
      .engify-btn-secondary:hover {
        background: #5a6268;
      }
      
      .engify-element-preview {
        background: #f8f9fa;
        border-radius: 6px;
        padding: 12px;
        font-size: 12px;
        color: #495057;
        font-family: 'Monaco', 'Courier New', monospace;
      }
    </style>
    
    <div class="engify-header" id="engify-drag-handle">
      <div class="engify-title">Engify</div>
      <div class="engify-controls">
        <button class="engify-btn-small" id="engify-minimize">Minimize</button>
        <button class="engify-btn-small" id="engify-close">✕</button>
      </div>
    </div>
    
    <div class="engify-content">
      <!-- Screen 1: Intent -->
      <div class="engify-screen active" id="engify-screen-intent">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; text-align: center;">What do you want to do?</h3>
        <div class="engify-intent-grid">
          <div class="engify-intent-card" data-intent="bug">
            <div class="engify-intent-icon">🐛</div>
            <div class="engify-intent-title">Report Bug</div>
          </div>
          <div class="engify-intent-card" data-intent="learn">
            <div class="engify-intent-icon">💡</div>
            <div class="engify-intent-title">Learn Code</div>
          </div>
          <div class="engify-intent-card" data-intent="debug">
            <div class="engify-intent-icon">📊</div>
            <div class="engify-intent-title">Debug Issue</div>
          </div>
          <div class="engify-intent-card" data-intent="design">
            <div class="engify-intent-icon">🎨</div>
            <div class="engify-intent-title">Design Feedback</div>
          </div>
        </div>
      </div>
      
      <!-- Screen 2: Select Element -->
      <div class="engify-screen" id="engify-screen-select">
        <div class="engify-status-box">
          <div class="engify-status-icon">🎯</div>
          <div style="font-size: 14px; margin-bottom: 4px;">Click any element on the page</div>
          <div style="font-size: 12px; color: #6c757d;">The element will be highlighted as you hover</div>
        </div>
        <button class="engify-btn engify-btn-secondary" id="engify-cancel">Cancel</button>
      </div>
      
      <!-- Screen 3: Form -->
      <div class="engify-screen" id="engify-screen-form">
        <div class="engify-form-group">
          <label class="engify-label">Selected Element:</label>
          <div class="engify-element-preview" id="engify-element-preview">No element</div>
        </div>
        
        <div class="engify-form-group">
          <label class="engify-label">Description:</label>
          <textarea class="engify-input engify-textarea" id="engify-description" placeholder="Describe what needs to be done..."></textarea>
        </div>
        
        <div class="engify-form-group">
          <label class="engify-label">Where to send?</label>
          <div class="engify-mode-option" data-mode="clipboard">📋 Copy to Clipboard (Free)</div>
          <div class="engify-mode-option" data-mode="dashboard">🌐 Send to Dashboard</div>
          <div class="engify-mode-option" data-mode="ide">🚀 Send to IDE (Pro)</div>
        </div>
        
        <button class="engify-btn engify-btn-primary" id="engify-submit">Submit</button>
        <button class="engify-btn engify-btn-secondary" id="engify-back">Back</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlayContainer);
  
  // Make draggable
  makeDraggable();
  
  // Add event listeners
  setupEventListeners();
}

// Make overlay draggable
function makeDraggable() {
  const header = document.getElementById('engify-drag-handle');
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  
  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    initialX = e.clientX - overlayContainer.offsetLeft;
    initialY = e.clientY - overlayContainer.offsetTop;
    overlayContainer.classList.add('dragging');
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      overlayContainer.style.left = currentX + 'px';
      overlayContainer.style.top = currentY + 'px';
      overlayContainer.style.right = 'auto';
    }
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
    overlayContainer.classList.remove('dragging');
  });
}

// Setup event listeners
function setupEventListeners() {
  // Minimize
  document.getElementById('engify-minimize').addEventListener('click', () => {
    overlayContainer.classList.toggle('minimized');
    document.getElementById('engify-minimize').textContent = 
      overlayContainer.classList.contains('minimized') ? 'Restore' : 'Minimize';
  });
  
  // Close
  document.getElementById('engify-close').addEventListener('click', () => {
    overlayContainer.remove();
    overlayContainer = null;
    // Turn off selection mode
    chrome.runtime.sendMessage({ type: 'toggle_inspect' });
  });
  
  // Intent selection
  document.querySelectorAll('.engify-intent-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedIntent = card.dataset.intent;
      showScreen('engify-screen-select');
      // Tell content script to start selection mode
      window.postMessage({ type: 'engify_toggle_inspect' }, '*');
    });
  });
  
  // Cancel
  document.getElementById('engify-cancel').addEventListener('click', () => {
    showScreen('engify-screen-intent');
    // Turn off selection mode
    window.postMessage({ type: 'engify_toggle_inspect' }, '*');
  });
  
  // Mode selection
  document.querySelectorAll('.engify-mode-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.engify-mode-option').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      selectedMode = option.dataset.mode;
    });
  });
  
  // Submit
  document.getElementById('engify-submit').addEventListener('click', handleSubmit);
  
  // Back
  document.getElementById('engify-back').addEventListener('click', () => {
    showScreen('engify-screen-intent');
    selectedIntent = null;
    selectedElement = null;
    selectedMode = null;
  });
}

// Show screen
function showScreen(screenId) {
  document.querySelectorAll('.engify-screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

// Handle element selection
function handleElementSelected(element) {
  selectedElement = element;
  
  // Show success briefly
  const statusBox = document.querySelector('#engify-screen-select .engify-status-box');
  statusBox.innerHTML = `
    <div class="engify-status-icon">✅</div>
    <div style="font-size: 14px;">Element selected!</div>
  `;
  
  setTimeout(() => {
    showScreen('engify-screen-form');
    const preview = document.getElementById('engify-element-preview');
    preview.textContent = `${element.tagName}${element.id ? '#' + element.id : ''}${element.className ? '.' + element.className.split(' ')[0] : ''}`;
  }, 500);
}

// Handle submit
async function handleSubmit() {
  const description = document.getElementById('engify-description').value.trim();
  
  if (!description) {
    alert('Please add a description');
    return;
  }
  
  if (!selectedMode) {
    alert('Please select where to send');
    return;
  }
  
  if (selectedMode === 'clipboard') {
    const report = formatReport();
    await navigator.clipboard.writeText(report);
    alert('✅ Copied to clipboard!');
    overlayContainer.remove();
    overlayContainer = null;
  }
  // TODO: Add dashboard and IDE modes
}

// Format report
function formatReport() {
  const intentEmoji = { bug: '🐛', learn: '💡', debug: '📊', design: '🎨' };
  return `${intentEmoji[selectedIntent]} ${selectedIntent.toUpperCase()} REPORT

Description:
${document.getElementById('engify-description').value}

Element:
${selectedElement.tagName}${selectedElement.id ? '#' + selectedElement.id : ''}

Page: ${window.location.href}
Timestamp: ${new Date().toISOString()}`;
}

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'show_overlay') {
    createOverlay();
    sendResponse({ success: true });
  }
  
  if (message.type === 'element_selected') {
    handleElementSelected(message.element);
    sendResponse({ success: true });
  }
  
  return true;
});

// Export for content script
window.engifyOverlay = {
  create: createOverlay,
  handleElementSelected: handleElementSelected
};
