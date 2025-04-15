document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('saveApiKey');
    const getButton = document.getElementById('getButton');
    const resultDisplay = document.getElementById('result');
  
    saveButton.addEventListener('click', function() {
      const apiKey = apiKeyInput.value;
      chrome.storage.local.set({ 'apiKey': apiKey }, function() {
        resultDisplay.textContent = 'API Key saved.';
      });
    });
  
    getButton.addEventListener('click', function() {
      chrome.storage.local.get('apiKey', function(data) {
        if (data.apiKey) {
          resultDisplay.textContent = 'API Key: ' + data.apiKey;
          console.log(apiKey);
        } else {
          resultDisplay.textContent = 'API Key not found.';
        }
      });
    });

    console.log(apiKey);
});