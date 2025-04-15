const Wanipop = {};

Wanipop.ApiBridge = {

    /**
   * @type {String} Version of the Wanikani API to use.
   */
  API_VERSION: 'v2',

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
   * Make a request to the Wanikanii API.
   *
   * @param http_method {String} HTTP request method to use (e.g. 'POST')
   * @param path {String} Path to call.
   * @param params {dict} Parameters for API method; depends on method.
   * @param callback {Function(response: dict)} Callback on completion.
   *     status {Integer} HTTP status code of response.
   *     data {dict} Object representing response of API call, depends on
   *         method. Only available if response was a 200.
   *     errors {dict} Object containing a message, if there was a problem.
   * @param options {dict?}
   *     miss_cache {Boolean} Do not check cache before requesting
   */
  request: function(http_method, path, params, callback, options) {
    const me = this;
    http_method = http_method.toUpperCase();

    console.info('Server API Request', http_method, path, params);

    // Serve from cache first.
    if (options && !options.miss_cache && http_method === 'GET') {
      const data = me._readCache(path, new Date());
      if (data) {
        console.log('Serving request from cache', path);
        callback(data);
        return;
      }
    }

    // Be polite to Asana API and tell them who we are.
    const manifest = chrome.runtime.getManifest();
    const client_name = [
      'chrome-extension',
      chrome.i18n.getMessage('@@extension_id'),
      manifest.version,
      manifest.name
    ].join(':');

    let url = me.baseApiUrl() + path;
    let body_data;
    if (http_method === 'PUT' || http_method === 'POST') {
      // POST/PUT request, put params in body
      body_data = {
        data: params,
        options: { client_name: client_name }
      };
    } else {
      // GET/DELETE request, add params as URL parameters.
      Object.assign(params, {opt_client_name: client_name});
      url += '?' + Object.keys(params).map(key => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
      }).join('&');
    }

    console.log('Making request to API', http_method, url);

    chrome.cookies.get({
      url: url,
      name: 'ticket'
    }, function(cookie) {
      if (!cookie) {
        callback({
          status: 401,
          errors: [{message: 'Not Authorized'}]
        });
        return;
      }

      // Note that any URL fetched here must be matched by a permission in
      // the manifest.json file!
      const attrs = {
        method: http_method,
        timeout: 30000,   // 30 second timeout
        headers: {
          'Content-Type': 'application/json',
          'X-Allow-Asana-Client': '1'
        }
      };
      if (http_method === 'POST' || http_method === 'PUT') {
        attrs.body = JSON.stringify(body_data);
        attrs.dataType = 'json';
        attrs.processData = false;
      }

      fetch(url, attrs)
      .then(response => {
        if (!response.ok) {
          console.log('Response not ok', response.json());
        }
        return response.json();
      })
      .then(responseJson => {
        if (http_method === 'GET') {
          me._writeCache(responseJson.path, responseJson, new Date());
        }
        console.log('Successful response', responseJson);
        callback(responseJson);
      })
      .catch(response => {
        console.log('Failed response', response);
        try {
          callback(response.json());
        } catch (e) {
          callback({errors: [{message: 'Could not parse response from server' }]});
        }
      });
    });
  },

};