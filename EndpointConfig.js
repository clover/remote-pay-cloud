/**
 * @constructor
 */
var EndPointConfig = function (configuration) {
    this.setConfiguration(configuration);
};
EndPointConfig.prototype.getAccessToken = function () {
    return this.configuration.oauthToken;
}
/**
 * set the configuration on this object
 * @private
 */
EndPointConfig.prototype.setConfiguration = function(configuration) {
    this.configuration = configuration;
};

//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = EndPointConfig;
}