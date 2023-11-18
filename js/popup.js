const CLASS_ACTIVE = 'active';
const CLASS_REPLACEMENT_ENTRY = 'replacement-entry';
const CLASS_ORIGINAL_TEXT = 'original-text';
const CLASS_REPLACEMENT_ARROW = 'replacement-arrow';
const CLASS_NEW_TEXT = 'new-text';
const CLASS_DELETE_BTN = 'btn delete-btn';
const ID_HOME_TAB = 'homeTab';
const ID_SETTINGS_TAB = 'settingsTab';
const ID_HOME_CONTENT = 'homeContent';
const ID_SETTINGS_CONTENT = 'settingsContent';
const ID_TOGGLE_REPLACEMENT = 'toggleReplacement';
const ID_CASE_SENSITIVE = 'caseSensitive';
const ID_MATCH_WHOLE_WORD = 'matchWholeWord';
const ID_ORIGINAL_TEXT_POPUP = 'originalTextPopup';
const ID_NEW_TEXT_POPUP = 'newTextPopup';
const ID_ERROR = 'error';
const ID_STATUS = 'status';
const ID_REPLACEMENTS_LIST = 'replacements-list';
const MESSAGE_NO_REPLACEMENTS = 'No replacements set.';
const MESSAGE_FIELDS_REQUIRED = 'Both fields are required.';
const MESSAGE_INVALID_INDEX = 'Invalid index for removal.';
const MESSAGE_ERROR_SAVING_SETTINGS = 'Error saving settings: ';
const MESSAGE_SETTINGS_SAVED = 'Settings saved successfully.';
const TIMEOUT_STATUS_MESSAGE = 3000;

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function showTemporaryMessage(elementId, message, timeout = TIMEOUT_STATUS_MESSAGE) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.style.display = 'block';
    setTimeout(() => {
      element.style.display = 'none';
    }, timeout);
  } else {
    console.error(`Element with ID ${elementId} not found.`);
  }
}

function initialize() {
  displaySavedReplacements();
  loadSettings();

  document.getElementById(ID_HOME_TAB).addEventListener('click', () => {
    switchTab('home');
  });

  document.getElementById(ID_SETTINGS_TAB).addEventListener('click', () => {
    switchTab('settings');
  });

  document.getElementById('saveSettings').addEventListener('click', saveSettingsFromDOM);

  document.getElementById('addButton').addEventListener('click', addReplacementPairFromDOM);
}

function addReplacementPairFromDOM() {
  const originalText = document.getElementById(ID_ORIGINAL_TEXT_POPUP).value.trim();
  const newText = document.getElementById(ID_NEW_TEXT_POPUP).value.trim();

  if (!originalText || !newText) {
    showTemporaryMessage(ID_ERROR, MESSAGE_FIELDS_REQUIRED);
    return;
  }

  const safeOriginalText = escapeHtml(originalText);
  const safeNewText = escapeHtml(newText);

  addReplacementPair(safeOriginalText, safeNewText);
}

function addReplacementPair(originalText, newText) {
  chrome.storage.sync.get({ replacements: [] }, function (data) {
    const replacements = data.replacements;
    replacements.push({ originalText, newText });
    chrome.storage.sync.set({ replacements }, function () {
      if (chrome.runtime.lastError) {
        showTemporaryMessage(ID_ERROR, chrome.runtime.lastError.message);
      } else {
        document.getElementById(ID_ORIGINAL_TEXT_POPUP).value = '';
        document.getElementById(ID_NEW_TEXT_POPUP).value = '';
        displaySavedReplacements();
      }
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
      showTemporaryMessage(ID_ERROR, MESSAGE_INVALID_INDEX);
    }
  });
}

function displaySavedReplacements() {
  const listElement = document.getElementById(ID_REPLACEMENTS_LIST);
  listElement.innerHTML = '';

  chrome.storage.sync.get({ replacements: [] }, function (data) {
    const replacements = data.replacements;

    if (replacements.length === 0) {
      listElement.textContent = MESSAGE_NO_REPLACEMENTS;
      return;
    }

    replacements.forEach((replacement, index) => {
      const entry = document.createElement('div');
      entry.className = CLASS_REPLACEMENT_ENTRY;

      const originalTextSpan = document.createElement('span');
      originalTextSpan.className = CLASS_ORIGINAL_TEXT;
      originalTextSpan.textContent = replacement.originalText;

      const arrowSpan = document.createElement('span');
      arrowSpan.className = CLASS_REPLACEMENT_ARROW;
      arrowSpan.textContent = '→';

      const newTextSpan = document.createElement('span');
      newTextSpan.className = CLASS_NEW_TEXT;
      newTextSpan.textContent = replacement.newText;

      const deleteButton = document.createElement('button');
      deleteButton.className = CLASS_DELETE_BTN;
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

function switchTab(tabName) {
  const homeContent = document.getElementById(ID_HOME_CONTENT);
  const settingsContent = document.getElementById(ID_SETTINGS_CONTENT);
  const homeTab = document.getElementById(ID_HOME_TAB);
  const settingsTab = document.getElementById(ID_SETTINGS_TAB);

  if (tabName === 'home') {
    homeContent.classList.add(CLASS_ACTIVE);
    settingsContent.classList.remove(CLASS_ACTIVE);
    homeTab.classList.add(CLASS_ACTIVE);
    settingsTab.classList.remove(CLASS_ACTIVE);
  } else if (tabName === 'settings') {
    homeContent.classList.remove(CLASS_ACTIVE);
    settingsContent.classList.add(CLASS_ACTIVE);
    homeTab.classList.remove(CLASS_ACTIVE);
    settingsTab.classList.add(CLASS_ACTIVE);
  }
}

function loadSettings() {
  chrome.storage.sync.get({
    isEnabled: true,
    isCaseSensitive: false,
    matchWholeWord: false
  }, function (data) {
    document.getElementById(ID_TOGGLE_REPLACEMENT).checked = data.isEnabled;
    document.getElementById(ID_CASE_SENSITIVE).checked = data.isCaseSensitive;
    document.getElementById(ID_MATCH_WHOLE_WORD).checked = data.matchWholeWord;
  });
}

function saveSettingsFromDOM() {
  const settings = {
    isEnabled: document.getElementById(ID_TOGGLE_REPLACEMENT).checked,
    isCaseSensitive: document.getElementById(ID_CASE_SENSITIVE).checked,
    matchWholeWord: document.getElementById(ID_MATCH_WHOLE_WORD).checked
  };
  saveSettings(settings);
}

function saveSettings(settings) {
  chrome.storage.sync.set(settings, function () {
    if (chrome.runtime.lastError) {
      showTemporaryMessage(ID_ERROR, MESSAGE_ERROR_SAVING_SETTINGS + chrome.runtime.lastError.message);
    } else {
      showTemporaryMessage(ID_STATUS, MESSAGE_SETTINGS_SAVED);
    }
  });
}

document.addEventListener('DOMContentLoaded', initialize);