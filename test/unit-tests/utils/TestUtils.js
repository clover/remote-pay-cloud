const cloudApi = require("remote-pay-cloud-api").remotepay;

const WebSocketPairedCloverDeviceConfiguration = require("../../../dist/com/clover/remote/client/device/WebSocketPairedCloverDeviceConfiguration").WebSocketPairedCloverDeviceConfiguration;
const BrowserWebSocketImpl = require("../../../dist/com/clover/websocket/BrowserWebSocketImpl").BrowserWebSocketImpl;
const ImageUtil = require("../../../dist/com/clover/util/ImageUtil").ImageUtil;
const WebsocketCloudCloverDevice = require("../../../dist/com/clover/remote/client/device/WebsocketCloudCloverDevice").WebsocketCloudCloverDevice;

(function (module) {


    let testUtils = module.exports;

    testUtils.buildCloverConnectionListener = function () {
        return Object.assign({}, cloudApi.ICloverConnectorListener.prototype, {
            onDeviceReady: function (merchantInfo) {
                console.log({message: "Device Ready to process requests!", merchantInfo: merchantInfo});
            },

            onDeviceDisconnected: function () {
                console.log({message: "Disconnected"});
            },

            onDeviceConnected: function () {
                console.log({message: "Connected, but not available to process requests"});
            }
        });
    };

    testUtils.getWSDeviceConfig = function(remoteApplicationID = "remote-pay-cloud-test") {
        return new WebSocketPairedCloverDeviceConfiguration("unknown", remoteApplicationID, "unknown", "unknown", null, BrowserWebSocketImpl.createInstance, new ImageUtil());
    };

    testUtils.getWSDevice = function(remoteAppId) {
        // Because we aren't making a valid WebSocket connection remote-pay-cloud will log errors to the console
        // upon device instantiation. Store console.log and then set it to an no-op function to
        // prevent these errors from being logged.
        const log = console.log;
        console.log = () => {
            // no-op, prevents WS connection errors, etc. from being logged to the console.
        };
        let device =  new WebsocketCloudCloverDevice(this.getWSDeviceConfig(remoteAppId));
        console.log = log;
        return device;
    };

})(module);


