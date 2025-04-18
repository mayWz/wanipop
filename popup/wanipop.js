document.addEventListener("DOMContentLoaded", async function () {
  
  const apiKey = await chrome.storage.local.get(["wanikaniApiKey"]);
  if (apiKey) {
    console.log(apiKey);
    document.getElementById("apiKey").value = apiKey.wanikaniApiKey;
  }

  await isUserProfile();

  document.getElementById("saveApiKey").addEventListener("click", async () => {
    const apiKey = document.getElementById("apiKey").value;
    const response = chrome.runtime.sendMessage({
      action: "wanipop.setApiKey",
      data: { apiKey },
    });
    if (response) {
      console.log("API key has set.");
      await isUserProfile();
    } else {
      console.error("Failed to set API Key. Please try again");
    }
  });

  document
    .getElementById("wanipopSetting")
    .addEventListener("click", async (e) => {
      e.preventDefault();
      showWanipopSetting();
    });
});

function hideWanipopSetting() {
  const apiBox = document.getElementById("apiKeyBox");
  const reviewBox = document.getElementById("wanipopReview");
  apiBox.style.display = "none";
  reviewBox.style.display = "block";

}

function showWanipopSetting() {
  const apiBox = document.getElementById("apiKeyBox");
  const reviewBox = document.getElementById("wanipopReview");
  apiBox.style.display = "block";
  reviewBox.style.display = "none";
}

async function isUserProfile() {
  console.log("isUserProfile is call!");
  const userProfileBox = document.getElementById("userProfile");
  const response = await chrome.runtime.sendMessage({
    action: "wanipop.getUserProfile",
  });
  if (response) {
    hideWanipopSetting();
    userProfileBox.textContent = `${response.username} - lv: ${response.level}`;
    updateReviewCount();
  } else {
    console.error("Failed to fetch user profile. Please try again");
  }
}

async function updateReviewCount() {
  const response = await chrome.runtime.sendMessage({
    action: "wanipop.getReviewCount",
  });
  document.getElementById(
    "reviewCount"
  ).textContent = `Reviews: ${response.count}`;
  
}

async function displayReviews() {
  const response = await chrome.runtime.sendMessage({
    action: "getNextReviews",
  });
  const reviews = response.reviews;
  const reviewList = document.getElementById("reviewList");
  reviewList.innerHTML = "";
  reviews.forEach((review) => {
    const listItem = document.createElement("li");
    listItem.textContent = `Subject ID: ${review.data.subject_id}`;
    const input = document.createElement("input");
    const button = document.createElement("button");
    button.textContent = "Submit";
    button.onclick = async () => {
      const answer = input.value;
      const submitResponse = await chrome.runtime.sendMessage({
        action: "submitReview",
        assignmentId: review.id,
        answer: answer,
      });
      if (submitResponse.error) {
        alert(submitResponse.error);
      } else {
        alert("Review submitted");
        updateReviewCount();
        displayReviews();
      }
    };

    listItem.appendChild(input);
    listItem.appendChild(button);
    reviewList.appendChild(listItem);
  });
}
