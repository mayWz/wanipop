document.addEventListener("DOMContentLoaded", () => {
  const reviewCountElement = document.getElementById("reviewCount");
  const apiKeyInput = document.getElementById("apiKey");
  const saveApiKeyButton = document.getElementById("saveApiKey");

  // Load API key from storage
  chrome.storage.local.get(["wanikaniApiKey"], (result) => {
    if (result.wanikaniApiKey) {
      apiKeyInput.value = result.wanikaniApiKey;
      fetchReviewCount(result.wanikaniApiKey);
    }
  });

  // Save API key to storage
  saveApiKeyButton.addEventListener("click", () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      chrome.storage.local.set({ wanikaniApiKey: apiKey }, () => {
        console.log("API key saved.");
        fetchReviewCount(apiKey);
      });
    } else {
      alert("Please enter your WaniKani API key.");
    }
  });

  function fetchReviewCount(apiKey) {
    const apiUrl = "https://api.wanikani.com/v2/reviews";

    fetch(apiUrl, {
      headers: {
        Authorization: `Token token=${apiKey}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const availableCount = data.total_count; // Assuming 'total_count' represents available reviews
        if (reviewCountElement) {
          reviewCountElement.textContent = `Reviews Available: ${availableCount}`;
        }
      })
      .catch((error) => {
        console.error("Error fetching reviews:", error);
        if (reviewCountElement) {
          reviewCountElement.textContent = "Error fetching review count.";
        }
      });
  }
});
