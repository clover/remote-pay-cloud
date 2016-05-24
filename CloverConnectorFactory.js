require("prototype");

var CloverConnectorImpl = require("./CloverConnectorImpl.js");


CloverConnectorFactory = Class.create({
    /**
     * Initialize the values for this.
     * @private
     */
    initialize: function (configuration) {
        // For now, there is a single impl, so no config will be passed to the factory
        // during construction of the factory.
    },

    /**
     *
     * @param {Object} configuration a map of configuration values for the connector instance.
     * @return {ICloverConnector} a clover connector implementation
     */
    createICloverConnector: function(configuration) {
        var connector = new CloverConnectorImpl(configuration);
        return connector;
    }
});



//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = CloverConnectorFactory;
}
