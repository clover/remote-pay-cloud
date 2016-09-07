var Class = require("./Class.js");

/**
 * @constructor
 */
EndPointConfig = Class.create( {
    /**
     * Initialize the values for this.
     * @private
     */
    initialize: function (configuration) {
        this.setConfiguration(configuration);
    },
    getAccessToken: function () {
        return this.configuration.oauthToken;
    },
    /**
     * set the configuration on this object
     * @private
     */
    setConfiguration: function(configuration) {
        this.configuration = configuration;
    }
});

//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = EndPointConfig;
}
