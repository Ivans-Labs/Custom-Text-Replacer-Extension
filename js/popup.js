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
      const isCaseSensitive = document.getElementById('caseSensitive').checked;
      const matchWholeWord = document.getElementById('matchWholeWord').checked;
      saveSettings({ isEnabled, isCaseSensitive, matchWholeWord });
  });

  document.getElementById('addButton').addEventListener('click', () => {
      const originalText = document.getElementById('originalTextPopup').value.trim();
      const newText = document.getElementById('newTextPopup').value.trim();

      if (!originalText || !newText) {
          showError('Both fields are required.');
          return;
      }

      const safeOriginalText = escapeHtml(originalText);
      const safeNewText = escapeHtml(newText);

      addReplacementPair(safeOriginalText, safeNewText);
  });
});

function displaySavedReplacements() {
  const listElement = document.getElementById('replacements-list');
  listElement.innerHTML = ''; // Clear the list

  chrome.storage.sync.get({ replacements: [] }, function (data) {
      const replacements = data.replacements;

      if (replacements.length === 0) {
          listElement.textContent = 'No replacements set.';
          return;
      }

      replacements.forEach((replacement, index) => {
          const entry = document.createElement('div');
          entry.className = 'replacement-entry';

          const originalTextSpan = document.createElement('span');
          originalTextSpan.className = 'original-text';
          originalTextSpan.textContent = replacement.originalText;

          const arrowSpan = document.createElement('span');
          arrowSpan.className = 'replacement-arrow';
          arrowSpan.textContent = '→';

          const newTextSpan = document.createElement('span');
          newTextSpan.className = 'new-text';
          newTextSpan.textContent = replacement.newText;

          const deleteButton = document.createElement('button');
          deleteButton.className = 'btn delete-btn';
          deleteButton.textContent = 'Remove';
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
      if (index >= 0 && index < replacements.length) {
          replacements.splice(index, 1);
          chrome.storage.sync.set({ replacements }, displaySavedReplacements);
      } else {
          showError('Invalid index for removal.');
      }
  });
}

function showError(message) {
  const errorDiv = document.getElementById('error');
  if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      setTimeout(() => {
          errorDiv.style.display = 'none';
      }, 3000);
  } else {
      alert(message); // Fallback in case errorDiv is not found
  }
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
  chrome.storage.sync.get({
    isEnabled: true,
    isCaseSensitive: false,
    matchWholeWord: false
  }, function (data) {
    document.getElementById('toggleReplacement').checked = data.isEnabled;
    document.getElementById('caseSensitive').checked = data.isCaseSensitive;
    document.getElementById('matchWholeWord').checked = data.matchWholeWord;
  });
}

function saveSettings(settings) {
  chrome.storage.sync.set(settings, function () {
      if (chrome.runtime.lastError) {
          showError('Error saving settings: ' + chrome.runtime.lastError.message);
      } else {
          showStatus('Settings saved successfully.');
      }
  });
}

function showStatus(message) {
  const statusDiv = document.getElementById('status');
  if (statusDiv) {
      statusDiv.textContent = message;
      statusDiv.style.display = 'block';
      setTimeout(() => {
          statusDiv.style.display = 'none';
      }, 3000);
  } else {
      console.log(message); // Fallback in case statusDiv is not found
  }
}

function escapeHtml(text) {
  const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}