
/**
 * Utility to centralize endpoints.
 *
 * @constructor
 * @param {CloverOAuth} cloverOAuth - used to obtain the access token and the domain for building the endpoints. If
 *  we change this to load endpoints, the access token will still be needed, and the initial endpoint will
 *  still need a domain/url to use as well.
 */
function Endpoints(cloverOAuth) {

    /**
     * The object that provides the access token and the configurtion with the domain.
     */
    this.cloverOAuth = cloverOAuth;

    /**
     * The endpoint used to obtain a merchant
     *
     * @param {string} merchantId - the id of the merchant to use when getting the merchant.
     * @returns {string} endpoint - the url to use to retrieve the merchant
     */
    this.getMerchantEndpoint = function(merchantId) {
        var variables = {};
        variables[Endpoints.MERCHANT_V3_KEY] = merchantId;
        variables[Endpoints.ACCESS_TOKEN_KEY] = this.cloverOAuth.getAccessToken();
        return this.cloverOAuth.configuration.domain +
          this.setVariables(Endpoints.MERCHANT_V3_PATH + Endpoints.ACCESS_TOKEN_SUFFIX, variables);
    };

    /**
     * The endpoint used to obtain a list of devices
     *
     * @param {string} merchantId - the id of the merchant to use when getting the device list.
     * @returns {string} endpoint - the url to use to retreive the devices
     */
    this.getDevicesEndpoint = function(merchantId) {
        var variables = {};
        variables[Endpoints.MERCHANT_V3_KEY] = merchantId;
        variables[Endpoints.ACCESS_TOKEN_KEY] = this.cloverOAuth.getAccessToken();
        return this.cloverOAuth.configuration.domain +
            this.setVariables(Endpoints.DEVICE_PATH + Endpoints.ACCESS_TOKEN_SUFFIX, variables);
    };

    /**
     * Builds the endpoint to send the message to the server to let the device know we want to talk to it.
     * @param {string} merchantId - the id of the merchant to use when getting the device list.
     * @returns {string} endpoint - the url to use alert a device that we want to communicate with it
     */
    this.getAlertDeviceEndpoint = function(merchantId) {
        var variables = {};
        variables[Endpoints.MERCHANT_V3_KEY] = merchantId;
        variables[Endpoints.ACCESS_TOKEN_KEY] = this.cloverOAuth.getAccessToken();
        return this.cloverOAuth.configuration.domain +
            this.setVariables(Endpoints.REMOTE_PAY_PATH + Endpoints.ACCESS_TOKEN_SUFFIX, variables);
    };

    /**
     * Does variable replacement on a template
     *
     * @private
     * @param {string} template - a template string that will have tags replaced
     * @param {map} variableMap - a named map of tag to value for the replacement process
     * @returns {string}
     */
    this.setVariables = function(template, variableMap) {
        for( var key in variableMap) {
            if(variableMap.hasOwnProperty(key)) {
                var bracedKey = new RegExp(this.escapeRegExp("{" + key + "}"), "g");
                template = template.replace(bracedKey, variableMap[key]);
            }
        }
        return template;
    };

    /**
     *
     * Does simple escaping to facilitate string replacement in a url
     * @param {string} stringToGoIntoTheRegex - the unescaped regex
     * @returns {XML|string|void} - the escaped regex
     * @private
     */
    this.escapeRegExp = function(stringToGoIntoTheRegex) {
        return stringToGoIntoTheRegex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
}

/*
Definitions of the endpoint templates and keys are below.  They are relative.
 */
Endpoints.ACCESS_TOKEN_KEY = "axsTkn";
Endpoints.ACCESS_TOKEN_SUFFIX = "?access_token={"+Endpoints.ACCESS_TOKEN_KEY+"}";

Endpoints.ACCOUNT_V3_KEY = "acntId";
Endpoints.ACCOUNT_V3_PATH = "v3/accounts/{"+Endpoints.ACCOUNT_V3_KEY+"}";
Endpoints.DEVELOPER_V3_KEY = "dId";
Endpoints.DEVELOPER_V3_PATH = "v3/developers/{"+Endpoints.DEVELOPER_V3_KEY+"}";
Endpoints.RESELLER_V3_KEY = "rId";
Endpoints.RESELLER_V3_PATH = "v3/resellers/{"+Endpoints.RESELLER_V3_KEY+"}";

Endpoints.MERCHANT_V2_KEY = "mId";
Endpoints.MERCHANT_V2_PATH = "v2/merchant/{"+Endpoints.MERCHANT_V2_KEY +"}";
Endpoints.MERCHANT_V3_KEY = "mId";
Endpoints.MERCHANT_V3_PATH = "v3/merchants/{"+Endpoints.MERCHANT_V3_KEY +"}";
Endpoints.APPS_V3_KEY = "appId";
Endpoints.APPS_V3_PATH = "v3/apps/{"+Endpoints.APPS_V3_KEY+"}";

Endpoints.ORDER_PATH = Endpoints.MERCHANT_V3_PATH + "/orders";
Endpoints.ORDER_ID_KEY = "appId";
Endpoints.ORDER_ID_PATH = Endpoints.ORDER_PATH + "/{"+Endpoints.ORDER_ID_KEY+"}";

Endpoints.LINE_ITEM_PATH = Endpoints.ORDER_ID_PATH + "/line_items";
Endpoints.LINE_ITEM_ID_KEY = "lniId";
Endpoints.LINE_ITEM_ID_PATH = Endpoints.LINE_ITEM_PATH + "/{"+Endpoints.LINE_ITEM_ID_KEY+"}";

Endpoints.DEVICE_PATH = Endpoints.MERCHANT_V3_PATH + "/devices";
Endpoints.DEVICE_ID_KEY = "devId";
Endpoints.DEVICE_ID_PATH = Endpoints.DEVICE_PATH + "/{"+Endpoints.DEVICE_ID_KEY+"}";

Endpoints.REMOTE_PAY_PATH = Endpoints.MERCHANT_V2_PATH + "/remote_pay";

Endpoints.WEBSOCKET_PATH = "/support/remote_pay/cs";


//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = Endpoints;
}
