document.addEventListener("DOMContentLoaded", function () {
  const reviewCountElement = document.getElementById("reviewCount");
  const apiKeyInput = document.getElementById("apiKey");
  const saveButton = document.getElementById("saveApiKey");
  const getReviewButton = document.getElementById("getReviewButton");
  const resultDisplay = document.getElementById("result");
  let apiKey = "";

  saveButton.addEventListener("click", function () {
    const apiKey = apiKeyInput.value;
    chrome.storage.local.set({ apiKey: apiKey }, function () {
      resultDisplay.textContent = "API Key saved.";
    });
  });
  
});
