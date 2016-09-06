/**
 * Library to facilitate OAuth authentication.
 *
 * All of the Clover rest calls will require that the application has an oauth token.  This
 * object makes obtaining and using a token clearer.
 *
 * The constructor sets up the object, and may throw an error if the clientId is not present on the
 *      passed configuration.
 *
 * @constructor
 * @param {map} configuration - an object of the form
 *  {
 *      "clientId": the_id_for_your_clover_application, required
 *      "domain" : the clover server url. if unset, defaulted to CloverOAuth.defaultDomain
 *  }
 */
var EndPointConfig = require("./EndpointConfig.js");

/**
 * Initialize the values for this.
 * @constructor
 */
CloverOAuth2 = function(configuration) {
    EndPointConfig.call(this, configuration);
};

CloverOAuth2.prototype = Object.create(EndPointConfig.prototype);
CloverOAuth2.prototype.constructor = CloverOAuth2;

/**
 * Attempt to get the security token
 * This function attempts to extract an OAuth token from the
 * request/response.
 * It will create/set the userInfo object with associated keys.
 * @param {function} callback
 */
CloverOAuth2.prototype.getAccessToken = function(callback) {
    this.parseTokenFromURLHash();

    var token = null;
    if(this["userInfo"]) {
        token = this.userInfo[CloverOAuth2.accessTokenKey];
    }
    if (token == null) {
        // There is no token attempt to redirect
        this.redirect();
    } else if(callback) {
        // We have the token.  Do the callback immediately
        callback(token);
    }
    return token;
};
/**
 * Checks for access token without redirecting
 * @returns {boolean} true if the token has already been obtained
 */
CloverOAuth2.prototype.hasAccessToken = function() {
    this.parseTokenFromURLHash();

    var token = null;
    if(this["userInfo"]) {
        token = this.userInfo[CloverOAuth2.accessTokenKey];
    }
    return (token != null);
};
/**
 * When running inside a browser, we grab the access token from the hash
 */
CloverOAuth2.prototype.parseTokenFromURLHash = function() {
    if(!this["userInfo"]) {
        this.parseTokensFromHash(window.location.hash);
    }
};
/**
 * Parses tokens from the window location hash
 * @private
 * @param {string} theUrl
 */
CloverOAuth2.prototype.parseTokensFromHash = function(theUrl) {
    this.userInfo = {};
    var params = theUrl.split('&');
    var i = 0;
    while (param = params[i++]) {
        param = param.split("=");
        this.userInfo[param[0]] = param[1];
        // Make sure the access_token is mapped with the hash infront,
        // and without.
        if(param[0] === CloverOAuth2._accessTokenKey) {
            this.userInfo[CloverOAuth2.accessTokenKey] = param[1];
        }
    }
};
/**
 * Redirect the application to the proper site to do the oauth process.  Once
 * a security token has been obtained, the site will be reloaded with the oauth token set in the
 * request (as a hash parameter).
 * @private
 */
CloverOAuth2.prototype.redirect = function() {
    // Decide how to start the oauth.
    // We are in a browser, just redirect
    window.location.href = this.getOAuthURL();
};
/**
 * Build the oauth url
 * @param {string} [redirect] the url to redirect to after authentication.  Must be CORS acceptable.
 * @returns {string} the oauth url.
 */
CloverOAuth2.prototype.getOAuthURL = function(redirect) {
    if(!redirect) {
        // Determine the redirect url
        if(this.getRedirectUrl()) {
            redirect = this.getRedirectUrl().replace(window.location.hash, '');
        } else {
            redirect = window.location.href.replace(window.location.hash, '');
        }
    }
    // This is the oauth url
    var url = this.configuration.domain + CloverOAuth2.oauthTokenURLFragment_base;
    // Must have client id
    url += CloverOAuth2.oauthTokenURLFragment_clientId;
    url += this.configuration.clientId;
    // May have merchant id
    if (this.configuration.merchantId) {
        url += CloverOAuth2.oauthTokenURLFragment_merchantId;
        url += this.configuration.merchantId;
    }
    // will have redirect
    url += CloverOAuth2.oauthTokenURLFragment_redirectUri;
    url += encodeURIComponent(redirect);
    return url;
};

/**
 * @return {string|null} the redirect url or null if the existing window url should be used.
 */
CloverOAuth2.prototype.getRedirectUrl = function() {
    return this.redirectUrl;
};

/**
 *
 * @param {string|null} redirectUrl - the redirect url or null if the existing window url should be used.
 */
CloverOAuth2.prototype.setRedirectUrl = function(redirectUrl) {
    this.redirectUrl = redirectUrl;
};

/**
 * Get the url parameters from the proper url.
 *
 */
CloverOAuth2.prototype.getURLParams = function() {
    // we are in a browser, use the window location
    return this.getURLParamsFromURL(window.location);
};
/**
 * Grab the parameters from the url search string.
 */
CloverOAuth2.prototype.getURLParamsFromURL = function(theUrl) {
    var urlParamMap = {};
    var params = theUrl.search.substr(1).split('&');

    for (var i = 0; i < params.length; i++) {
        var p = params[i].split('=');
        urlParamMap[p[0]] = decodeURIComponent(p[1]);
    }
    return urlParamMap;
};
/**
 * set the configuration on this object
 * @private
 */
CloverOAuth2.prototype.setConfiguration = function(configuration) {
    // Check the configuration for completeness, default the domain if needed.
    if(!configuration) {
        configuration = {};
    }
    if(!configuration.clientId){
        configuration.clientId = this.getURLParams("client_id");
        if(!configuration.clientId) {
            var error = new Error("Configuration with clientId required for CloverOAuth creation.");
            throw error;
        }
    } else if(!configuration.domain){
        configuration.domain = CloverOAuth.defaultDomain;
    }
    // Not sure the following will work like I want...
    EndPointConfig.prototype.setConfiguration.call(this, configuration);
};

/** the default clover domain/url */
CloverOAuth2.defaultDomain = "http://www.clover.com/";
CloverOAuth2.oauthTokenURLFragment_base = 'oauth/authorize?response_type=token';
CloverOAuth2.oauthTokenURLFragment_clientId = '&client_id=';
CloverOAuth2.oauthTokenURLFragment_merchantId = '&merchant_id=';
CloverOAuth2.oauthTokenURLFragment_redirectUri = '&redirect_uri=';
CloverOAuth2._accessTokenKey = 'access_token';
CloverOAuth2.accessTokenKey = '#' + CloverOAuth2._accessTokenKey;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = CloverOAuth2;
}