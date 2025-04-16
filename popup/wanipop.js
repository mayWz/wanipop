document.addEventListener("DOMContentLoaded", async function () {
  
  await isUserProfile();
  document.getElementById("saveApiKey").addEventListener("click", async () => {
    const apiKey = document.getElementById('apiKey').value;
    const response = chrome.runtime.sendMessage({action: 'wanipop.setApiKey', data: { apiKey }});
    if (response) {
      console.log("API key has set.");
      await isUserProfile();
    } else {
      console.error("Failed to set API Key. Please try again");
    }
  });

});

async function isUserProfile() {
  console.log("isUserProfile is call!");
  const apiBox = document.getElementById("apiKeyBox");
  const userProfileBox = document.getElementById("userProfile");
  const response = await chrome.runtime.sendMessage({action: 'wanipop.getUserProfile'});
  if (response) {
    apiBox.style.display = 'none';
    userProfileBox.textContent = `${response.username} - ${response.level}`;
  } else {
    console.error("Failed to fetch user profile. Please try again");
  }
}

async function updateReviewCount() {
  const response = await chrome.runtime.sendMessage({ action: 'getReviewCount' });
  document.getElementById('reviewCount').textContent = `Reviews: ${response.count}`;
}

async function displayReviews() {
  const response = await chrome.runtime.sendMessage({action: 'getNextReviews'});
  const reviews = response.reviews;
  const reviewList = document.getElementById('reviewList');
  reviewList.innerHTML = '';
  reviews.forEach(review => {
      const listItem = document.createElement('li');
      listItem.textContent = `Subject ID: ${review.data.subject_id}`;
      const input = document.createElement('input');
      const button = document.createElement('button');
      button.textContent = "Submit";
      button.onclick = async () => {
          const answer = input.value;
          const submitResponse = await chrome.runtime.sendMessage({action: 'submitReview', assignmentId: review.id, answer: answer});
          if(submitResponse.error){
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