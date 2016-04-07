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

// Following may be used at a later time
// var log = require('./Logger.js').create();

function CloverOAuth(configuration) {

    /**
     * Attempt to get the security token
     * This function attempts to extract an OAuth token from the
     * request/response.
     * It will create/set the userInfo object with associated keys.
     */
    this.getAccessToken = function(callback) {
        this.parseTokenFromURLHash();

        var token = null;
        if(this["userInfo"]) {
            token = this.userInfo[CloverOAuth.accessTokenKey];
        }
        if (token == null) {
            // There is no token attempt to redirect
            this.redirect();
        } else if(callback) {
            // We have the token.  Do the callback immediately
            callback(token);
        }
        return token;
    }

    /**
     * Attempt to get the security token
     * This function attempts to extract an OAuth token from the
     * request/response.
     * It will create/set the userInfo object with associated keys.
     */
    this.hasAccessToken = function() {
        this.parseTokenFromURLHash();

        var token = null;
        if(this["userInfo"]) {
            token = this.userInfo[CloverOAuth.accessTokenKey];
        }
        return (token != null);
    }

    /**
     * When running inside a browser, we grab the access token from the hash
     *
     */
    this.parseTokenFromURLHash = function() {
        if(!this["userInfo"]) {
            this.parseTokensFromHash(window.location.hash);
        }
    }

    /**
     * Parses tokens from the window location hash
     * @private
     */
    this.parseTokensFromHash = function(theUrl) {
        this.userInfo = {};
        var params = theUrl.split('&');
        var i = 0;
        while (param = params[i++]) {
            param = param.split("=");
            this.userInfo[param[0]] = param[1];
            // Make sure the access_token is mapped with the hash infront,
            // and without.
            if(param[0] === CloverOAuth._accessTokenKey) {
                this.userInfo[CloverOAuth.accessTokenKey] = param[1];
            }
        }
    }

    /**
     * Redirect the application to the proper site to do the oauth process.  Once
     * a security token has been obtained, the site will be reloaded with the oauth token set in the
     * request (as a hash parameter).
     * @private
     */
    this.redirect = function() {
        // Decide how to start the oauth.
        // We are in a browser, just redirect
        window.location.href = this.getOAuthURL();
    }

    /**
     * Build the oauth url
     * @param {string} [redirect] the url to redirect to after authentication.  Must be CORS acceptable.
     * @returns {string} the oauth url.
     */
    this.getOAuthURL = function(redirect) {
        if(!redirect) {
            // Determine the redirect url
            redirect = window.location.href.replace(window.location.hash, '');
        }

        // This is the oauth url
        var url = this.configuration.domain +
            CloverOAuth.oauthTokenURLFragment_0 + this.configuration.clientId +
            CloverOAuth.oauthTokenURLFragment_1 + encodeURIComponent(redirect);
        return url;
    }

    /**
     * Get the url parameters from the proper url.
     *
     */
    this.getURLParams = function() {
        // we are in a browser, use the window location
        return this.getURLParamsFromURL(window.location);
    }

    /**
     * Grab the parameters from the url search string.
     */
    this.getURLParamsFromURL = function(theUrl) {
        var urlParamMap = {};
        var params = theUrl.search.substr(1).split('&');

        for (var i = 0; i < params.length; i++) {
            var p = params[i].split('=');
            urlParamMap[p[0]] = decodeURIComponent(p[1]);
        }
        return urlParamMap;
    }

    /**
     * set the configuration on this object
     * @private
     */
    this.setConfiguration = function(configuration) {
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
        this.configuration = configuration;
    }

    this.setConfiguration(configuration);
}
/** the default clover domain/url */
CloverOAuth.defaultDomain = "http://www.clover.com/";
CloverOAuth.oauthTokenURLFragment_0 = 'oauth/authorize?response_type=token&client_id=';
CloverOAuth.oauthTokenURLFragment_1 = '&redirect_uri=';
CloverOAuth._accessTokenKey = 'access_token';
CloverOAuth.accessTokenKey = '#' + CloverOAuth._accessTokenKey;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = CloverOAuth;
}