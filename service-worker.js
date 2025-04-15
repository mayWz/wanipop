const Wanipop = {};

Wanipop.ApiBridge = {

    /**
   * @type {String} Version of the Wanikani API to use.
   */
  API_VERSION: 'v2',

  /**
   * @type {String} Revision of the Wanikani API 
   */

  REVISION: '20170710',

  /**
   * @type {Integer} How long an entry stays in the cache.
   */
  CACHE_TTL_MS: 15 * 60 * 1000,

  /**
   * @type {dict} Map from API path to cache entry for recent GET requests.
   *     date {Date} When cache entry was last refreshed
   *     response {*} Cached request.
   */
  _cache: {},

  /**
   * @return {String} The base URL to use for API requests.
   */
  baseApiUrl: function() {
    return 'https://api.wanikani.com/' + this.API_VERSION;
  },

  

  /**
   * 
   * @param {String} method 
   * @param {String} path 
   * @param {Object} params
   */
  request: function(method, path, params) {

  }
};