const Wanipop = {
  /**
   * Wanikani URL
   */
  API_URL: "https://api.wanikani.com/v2",

  /**
   * setWanipopApiKey
   * @param {String} apiKey wanikani API Key for call API
   * @returns {boolean}
   */
  async setWanipopApiKey(apiKey) {
    chrome.storage.local.set({ wanikaniApiKey: apiKey });
    return true;
  },

  /**
   * getWanipopApiKey
   * @returns {Object} Local storage
   */
  async getWanipopApiKey() {
    return chrome.storage.local.get(["wanikaniApiKey"]);
  },

  /**
   *
   * @param {String} endpoint url path for calling wanikani api
   * @returns {Object, boolean}
   */
  async fetchWanikaniApi(endpoint) {
    console.log("fetchWanikaniApi was call!");
    const apiKey = await this.getWanipopApiKey();
    if (!apiKey) {
      console.error(
        "API key not found. Please set your API key in the extension options."
      );
      return false;
    }

    const response = await fetch(`${this.API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${apiKey.wanikaniApiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        `WaniKani API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
      return false;
    }

    return response.json();
  },

  /**
   *
   * @returns {Object}
   */
  async getWanipopUserProfile() {
    console.log("getWanipopUserProfile was call!");
    try {
      const data = await this.fetchWanikaniApi("/user");
      return data.data;
    } catch (error) {
      return {};
    }
  },

  /**
   *
   * @returns
   */
  async getReviewCount() {
    try {
      const data = await this.fetchWanikaniApi("/summary");
      const reviewCount = data.data[0]?.data?.reviews[0]?.available || 0;
      return reviewCount;
    } catch (error) {
      console.error("Error fetching review count:", error);
      return false;
    }
  },

  /**
   *
   * @returns
   */
  async getNextReviews() {
    try {
      const data = await this.fetchWanikaniApi(
        "/assignments?immediately_available_for_review"
      );
      return data.data;
    } catch (error) {
      console.error("Error fetching next reviews:", error);
      return [];
    }
  },

  /**
   *
   * @param {String} assignmentId
   * @param {String} answer
   * @returns
   */
  async submitReview(assignmentId, answer) {
    try {
      const data = await this.fetchWanikaniApi(
        `/assignments/${assignmentId}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            review: {
              answer: answer,
            },
          }),
        }
      );
      return data;
    } catch (error) {
      console.error("Error submitting review:", error);
      return false;
    }
  },

  async updateBadge() {
    const count = await this.getReviewCount();
    chrome.action.setBadgeText({ text: count > 0 ? count.toString() : "" });
    chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
  },
};

const wrapAsyncFunction = (listener) => (request, sender, sendResponse) => {
  Promise.resolve(listener(request, sender)).then(sendResponse);
  return true; 
};

chrome.runtime.onMessage.addListener(
  wrapAsyncFunction(async (request, sender) => {
    const action = request.action;
    const data = request.data;

    switch (action) {
      case "wanipop.setApiKey":
        return Wanipop.setWanipopApiKey(data.apiKey);
      case "wanipop.getUserProfile":
        return await Wanipop.getWanipopUserProfile();
      case "wanipop.getReviewCount":
        return Wanipop.getReviewCount();
      case "wanipop.getNextReviews":
        return Wanipop.getNextReviews();
      case "wanipop.submitReview":
        return Wanipop.submitReview(data);
      default:
        console.error("Unexpected action:", action);
        return false;
    }
    })
);

// chrome.runtime.onMessage.addListener((message) => {
//   const action = message.action;
//   const data = message.data;

//   switch (action) {
//     case "wanipop.setApiKey":
//       return Wanipop.setWanipopApiKey(data.apiKey);
//     case "wanipop.getUserProfile":
//       return Wanipop.getWanipopUserProfile();
//     case "wanipop.getReviewCount":
//       return Wanipop.getReviewCount();
//     case "wanipop.getNextReviews":
//       return Wanipop.getNextReviews();
//     case "wanipop.submitReview":
//       return Wanipop.submitReview(data);
//     default:
//       console.error("Unexpected action:", action);
//       return false;
//   }
// });
