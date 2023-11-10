// contentScript.js

// Function to safely escape regular expression special characters
function escapeRegExp(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// Function to recursively replace text within text nodes
function findAndReplaceText(node, replacements) {
  if (node.nodeType === Node.TEXT_NODE) {
    let text = node.nodeValue;
    replacements.forEach((replacement) => {
      const escapedOriginalText = escapeRegExp(replacement.originalText);
      const regex = new RegExp(escapedOriginalText, 'gi');
      text = text.replace(regex, replacement.newText);
    });
    node.nodeValue = text;
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    node.childNodes.forEach((childNode) => findAndReplaceText(childNode, replacements));
  }
}

// Start the replacement process
function replaceTextOnPage(replacements) {
  findAndReplaceText(document.body, replacements);
}

// Named function for handling storage retrieval
function handleStorageData(data) {
  if (data.isEnabled && data.replacements && data.replacements.length > 0) {
    replaceTextOnPage(data.replacements);
  }
}

// Use the named function as the callback for chrome.storage.sync.get
chrome.storage.sync.get({ replacements: [], isEnabled: true }, handleStorageData);