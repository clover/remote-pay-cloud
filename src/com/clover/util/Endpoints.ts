/**
 * Utility to centralize endpoints.
 *
 * This simplifies building urls to contact services.  If there is a need to add
 * a call to a service on the server, it should be added here.
 *
 */
export class Endpoints {

    static ACCESS_TOKEN_KEY:string = "axsTkn";
    static ACCESS_TOKEN_SUFFIX:string = "?access_token={"+Endpoints.ACCESS_TOKEN_KEY+"}";

    static ACCOUNT_V3_KEY:string = "acntId";
    static ACCOUNT_V3_PATH:string = "v3/accounts/{"+Endpoints.ACCOUNT_V3_KEY+"}";
    static DEVELOPER_V3_KEY:string = "dId";
    static DEVELOPER_V3_PATH:string = "v3/developers/{"+Endpoints.DEVELOPER_V3_KEY+"}";
    static RESELLER_V3_KEY:string = "rId";
    static RESELLER_V3_PATH:string = "v3/resellers/{"+Endpoints.RESELLER_V3_KEY+"}";

    static MERCHANT_V2_KEY:string = "mId";
    static MERCHANT_V2_PATH:string = "v2/merchant/{"+Endpoints.MERCHANT_V2_KEY +"}";
    static MERCHANT_V3_KEY:string = "mId";
    static MERCHANT_V3_PATH:string = "v3/merchants/{"+Endpoints.MERCHANT_V3_KEY +"}";
    static APPS_V3_KEY:string = "appId";
    static APPS_V3_PATH:string = "v3/apps/{"+Endpoints.APPS_V3_KEY+"}";

    static ORDER_PATH:string = Endpoints.MERCHANT_V3_PATH + "/orders";
    static ORDER_ID_KEY:string = "appId";
    static ORDER_ID_PATH:string = Endpoints.ORDER_PATH + "/{"+Endpoints.ORDER_ID_KEY+"}";

    static LINE_ITEM_PATH:string = Endpoints.ORDER_ID_PATH + "/line_items";
    static LINE_ITEM_ID_KEY:string = "lniId";
    static LINE_ITEM_ID_PATH:string = Endpoints.LINE_ITEM_PATH + "/{"+Endpoints.LINE_ITEM_ID_KEY+"}";

    static DEVICE_PATH:string = Endpoints.MERCHANT_V3_PATH + "/devices";
    static DEVICE_ID_KEY:string = "devId";
    static DEVICE_ID_PATH:string = Endpoints.DEVICE_PATH + "/{"+Endpoints.DEVICE_ID_KEY+"}";

    static REMOTE_PAY_PATH:string = Endpoints.MERCHANT_V2_PATH + "/remote_pay";

    static WEBSOCKET_PATH:string = "support/remote_pay/cs";
    static WEBSOCKET_TOKEN_KEY:string = "wsTkn";
    static WEBSOCKET_TOKEN_SUFFIX:string = "?token={"+Endpoints.WEBSOCKET_TOKEN_KEY+"}";
    static WEBSOCKET_FRIENDLY_ID_KEY:string = "wsFriendlyId";
    static WEBSOCKET_FRIENDLY_ID_SUFFIX = "&friendlyId={"+Endpoints.WEBSOCKET_FRIENDLY_ID_KEY+"}";
    static WEBSOCKET_FORCE_CONNECT_ID_KEY:string = "wsForceConnect";
    static WEBSOCKET_FORCE_CONNECT_ID_SUFFIX = "&forceConnect={"+Endpoints.WEBSOCKET_FORCE_CONNECT_ID_KEY+"}";

    static OAUTH_PATH:string = "oauth/authorize?response_type=token";
    static OAUTH_CLIENT_ID_KEY = "client_id";
    static OAUTH_CLIENT_ID_SUFFIX = "&client_id={"+Endpoints.OAUTH_CLIENT_ID_KEY+"}";
    static OAUTH_MERCHANT_ID_KEY = "merchant_id";
    static OAUTH_MERCHANT_ID_SUFFIX = "&merchant_id={"+Endpoints.OAUTH_MERCHANT_ID_KEY+"}";
    static OAUTH_REDIRECT_URI_KEY = "redirect_uri";
    static OAUTH_REDIRECT_URI_SUFFIX = "&redirect_uri={"+Endpoints.OAUTH_REDIRECT_URI_KEY+"}";

    static DOMAIN_KEY:string = "server_url";
    static DOMAIN_PATH:string = "{server_url}";

    /**
     * Builds the OAuth url to get an OAuth token.
     *
     * @param {string} domain - the clover server.  EX: https://www.clover.com, http://localhost:9000
     * @param {string} clientId - the clover application uuid
     * @param {string} [merchantId] - the clover merchant id
     * @param {string} [redirectUri] - the url to redirect to after authentication
     * @returns {string}
     */
    public static getOAuthURL(domain:string, clientId:string, merchantId?:string, redirectUri?:string): string {
        var variables = {};
        variables[Endpoints.DOMAIN_KEY] = domain;
        variables[Endpoints.OAUTH_CLIENT_ID_KEY] = clientId;
        let oauthEndpointPath: string = Endpoints.DOMAIN_PATH + Endpoints.OAUTH_PATH + Endpoints.OAUTH_CLIENT_ID_SUFFIX;
        if(merchantId) {
            variables[Endpoints.OAUTH_MERCHANT_ID_KEY] = merchantId;
            oauthEndpointPath += Endpoints.OAUTH_MERCHANT_ID_SUFFIX;
        }
        if(redirectUri) {
            variables[Endpoints.OAUTH_REDIRECT_URI_KEY] = encodeURIComponent(redirectUri);
            oauthEndpointPath += Endpoints.OAUTH_REDIRECT_URI_SUFFIX;
        }
        return Endpoints.setVariables(oauthEndpointPath, variables);
    }

    /**
     * The endpoint used to connect to a websocket on the server that will proxy to a device.  Used by
     * remote-pay cloud connectors.
     *
     * @param {string} domain - the clover server.  EX: https://www.clover.com, http://localhost:9000
     * @param {string} wsToken - the token used to contact the device.
     * @param {string} friendlyId - an id used to identify the POS.
     * @param {boolean} forceConnect - if true, then the attempt will overtake any existing connection
     * @returns {string} The endpoint used to connect to a websocket on the server that will proxy to a device
     */
    public static getDeviceWebSocketEndpoint(domain:string, wsToken:string, friendlyId:string, forceConnect:boolean): string {
        var variables = {};
        variables[Endpoints.WEBSOCKET_TOKEN_KEY] = wsToken;
        variables[Endpoints.DOMAIN_KEY] = domain;
        variables[Endpoints.WEBSOCKET_FRIENDLY_ID_KEY] = friendlyId;
        variables[Endpoints.WEBSOCKET_FORCE_CONNECT_ID_KEY] = forceConnect;

        let merchantEndpointPath: string = Endpoints.DOMAIN_PATH + Endpoints.WEBSOCKET_PATH +
            Endpoints.WEBSOCKET_TOKEN_SUFFIX +
            Endpoints.WEBSOCKET_FRIENDLY_ID_SUFFIX +
            Endpoints.WEBSOCKET_FORCE_CONNECT_ID_SUFFIX;

        return Endpoints.setVariables(merchantEndpointPath, variables);
    }

    /**
     * The endpoint used to obtain a merchant
     *
     * @param {string} domain - the clover server.  EX: https://www.clover.com, http://localhost:9000
     * @param {string} merchantId - the id of the merchant to use when getting the merchant.
     * @param {string} accessToken - the OAuth token used when accessing the server
     * @returns {string} endpoint - the url to use to retrieve the merchant
     */
    public static getMerchantEndpoint(domain:string, merchantId:string, accessToken:string): string {
        var variables = {};
        variables[Endpoints.MERCHANT_V3_KEY] = merchantId;
        variables[Endpoints.ACCESS_TOKEN_KEY] = accessToken;
        variables[Endpoints.DOMAIN_KEY] = domain;

        let merchantEndpointPath: string = Endpoints.DOMAIN_PATH + Endpoints.MERCHANT_V3_PATH + Endpoints.ACCESS_TOKEN_SUFFIX;
        return Endpoints.setVariables(merchantEndpointPath, variables);
    }

    /**
     * The endpoint used to obtain a list of devices
     *
     * @param {string} domain - the clover server.  EX: https://www.clover.com, http://localhost:9000
     * @param {string} merchantId - the id of the merchant to use when getting the merchant.
     * @param {string} accessToken - the OAuth token used when accessing the server
     * @returns {string}
     */
    public static getDevicesEndpoint(domain:string, merchantId:string, accessToken:string):string {
        var variables = {};
        variables[Endpoints.MERCHANT_V3_KEY] = merchantId;
        variables[Endpoints.ACCESS_TOKEN_KEY] = accessToken;
        variables[Endpoints.DOMAIN_KEY] = domain;

        let devicesEndpointPath: string = Endpoints.DOMAIN_PATH + Endpoints.DEVICE_PATH + Endpoints.ACCESS_TOKEN_SUFFIX;
        return Endpoints.setVariables(devicesEndpointPath, variables);
    }

    /**
     * Builds the endpoint to send the message to the server to let the device know we want to talk to it.
     * @param {string} domain - the clover server.  EX: https://www.clover.com, http://localhost:9000
     * @param {string} merchantId - the id of the merchant to use when getting the merchant.
     * @param {string} accessToken - the OAuth token used when accessing the server
     * @returns {string} endpoint - the url to use alert a device that we want to communicate with it
     */
    public static getAlertDeviceEndpoint(domain:string, merchantId:string, accessToken:string):string {
        var variables = {};
        variables[Endpoints.MERCHANT_V3_KEY] = merchantId;
        variables[Endpoints.ACCESS_TOKEN_KEY] = accessToken;
        variables[Endpoints.DOMAIN_KEY] = domain;

        let alertDeviceEndpointPath: string = Endpoints.DOMAIN_PATH + Endpoints.REMOTE_PAY_PATH + Endpoints.ACCESS_TOKEN_SUFFIX;
        return Endpoints.setVariables(alertDeviceEndpointPath, variables);
    }

    /**
     * Does variable replacement on a template
     *
     * @private
     * @param {string} template - a template string that will have tags replaced
     * @param {map} variableMap - a named map of tag to value for the replacement process
     * @returns {string}
     */
    public static setVariables(template:string, variableMap:any):string {
        for( var key in variableMap) {
            if(variableMap.hasOwnProperty(key)) {
                var bracedKey = new RegExp(this.escapeRegExp("{" + key + "}"), "g");
                // If the value of DOMAIN_KEY does not have a trailing slash, add one.
                if (key === Endpoints.DOMAIN_KEY) {
                    variableMap[key] = Endpoints.appendTrailingSlashToDomain(variableMap[key]);
                }
                template = template.replace(bracedKey, variableMap[key]);
            }
        }
        return template;
    };

    private static appendTrailingSlashToDomain(domain: string): string {
        if(domain && domain.charAt(domain.length - 1) !== '/') {
            return `${domain}/`;
        }
        return domain;
    }

    /**
     *
     * Does simple escaping to facilitate string replacement in a url
     * @param {string} stringToGoIntoTheRegex - the unescaped regex
     * @returns {XML|string|void} - the escaped regex
     * @private
     */
    private static escapeRegExp(stringToGoIntoTheRegex:string):string {
        return stringToGoIntoTheRegex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
}