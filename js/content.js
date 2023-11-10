// content.js
function replaceTextOnPage(replacements) {
  const bodyText = document.body.innerHTML;
  let modifiedText = bodyText;

  replacements.forEach((replacement) => {
    const { originalText, newText } = replacement;
    const escapedOriginalText = originalText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedOriginalText, 'gi');
    modifiedText = modifiedText.replace(regex, newText);
  });

  document.body.innerHTML = modifiedText;
}

// Named function for handling storage retrieval
function handleStorageData(data) {
  if (data.isEnabled && data.replacements.length > 0) {
    replaceTextOnPage(data.replacements);
  }
}

// Use the named function as the callback
chrome.storage.sync.get({ replacements: [], isEnabled: true }, handleStorageData);