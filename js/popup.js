// popup.js
document.addEventListener('DOMContentLoaded', () => {
  displaySavedReplacements();
  loadSettings();

  document.getElementById('homeTab').addEventListener('click', () => {
      switchTab('home');
  });

  document.getElementById('settingsTab').addEventListener('click', () => {
      switchTab('settings');
  });

  document.getElementById('saveSettings').addEventListener('click', () => {
      const isEnabled = document.getElementById('toggleReplacement').checked;
      saveSettings({ isEnabled });
  });

  document.getElementById('addButton').addEventListener('click', () => {
      const originalText = document.getElementById('originalTextPopup').value.trim();
      const newText = document.getElementById('newTextPopup').value.trim();

      if (!originalText || !newText) {
          showError('Both fields are required.');
          return;
      }

      addReplacementPair(originalText, newText);
  });
});

function displaySavedReplacements() {
  const listElement = document.getElementById('replacements-list');
  listElement.innerText = ''; // Clear the list using innerText for safety

  chrome.storage.sync.get({ replacements: [] }, function (data) {
      const replacements = data.replacements;

      if (replacements.length === 0) {
          listElement.innerText = 'No replacements set.';
          return;
      }

      replacements.forEach((replacement, index) => {
          const entry = document.createElement('div');
          entry.className = 'replacement-entry';

          const originalTextSpan = document.createElement('span');
          originalTextSpan.className = 'original-text';
          originalTextSpan.innerText = replacement.originalText; // Use innerText

          const arrowSpan = document.createElement('span');
          arrowSpan.className = 'replacement-arrow';
          arrowSpan.innerText = '→'; // Use innerText

          const newTextSpan = document.createElement('span');
          newTextSpan.className = 'new-text';
          newTextSpan.innerText = replacement.newText; // Use innerText

          const deleteButton = document.createElement('button');
          deleteButton.className = 'btn delete-btn';
          deleteButton.innerText = 'Remove'; // Use innerText
          deleteButton.dataset.index = index;
          deleteButton.addEventListener('click', function () {
              removeReplacementPair(index);
          });

          entry.appendChild(originalTextSpan);
          entry.appendChild(arrowSpan);
          entry.appendChild(newTextSpan);
          entry.appendChild(deleteButton);

          listElement.appendChild(entry);
      });
  });
}

function addReplacementPair(originalText, newText) {
  // Data validation/sanitization should be performed here
  // For example, escape special characters to prevent XSS
  // originalText = escapeHtml(originalText);
  // newText = escapeHtml(newText);

  chrome.storage.sync.get({ replacements: [] }, function (data) {
      const replacements = data.replacements;
      replacements.push({ originalText, newText });
      chrome.storage.sync.set({ replacements }, function () {
          document.getElementById('originalTextPopup').value = '';
          document.getElementById('newTextPopup').value = '';
          displaySavedReplacements(); // Update the list
      });
  });
}

function removeReplacementPair(index) {
  chrome.storage.sync.get({ replacements: [] }, function (data) {
      const replacements = data.replacements;
      replacements.splice(index, 1);
      chrome.storage.sync.set({ replacements }, displaySavedReplacements);
  });
}

function showError(message) {
  // Implement a user-friendly error display, such as a notification area in the popup
  console.error(message);
}

function switchTab(tabName) {
  const homeContent = document.getElementById('homeContent');
  const settingsContent = document.getElementById('settingsContent');
  const homeTab = document.getElementById('homeTab');
  const settingsTab = document.getElementById('settingsTab');

  if (tabName === 'home') {
      homeContent.classList.add('active');
      settingsContent.classList.remove('active');
      homeTab.classList.add('active');
      settingsTab.classList.remove('active');
  } else if (tabName === 'settings') {
      homeContent.classList.remove('active');
      settingsContent.classList.add('active');
      homeTab.classList.remove('active');
      settingsTab.classList.add('active');
  }
}

function loadSettings() {
  chrome.storage.sync.get({ isEnabled: true }, function (data) {
      document.getElementById('toggleReplacement').checked = data.isEnabled;
  });
}

function saveSettings(settings) {
  chrome.storage.sync.set(settings, function () {
      console.log('Settings saved');
  });
}

// A simple function to escape HTML (if needed)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}