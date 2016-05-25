var LanMethod = require("./LanMethod.js");
var DiscoveryRequestMessage = require("./remotemessage/DiscoveryRequestMessage");
var RemoteMessage = require("./remotemessage/RemoteMessage");

/**
 * Builds messages to pass to the clover device.
 *
 *
 * @param {string} defaultPackageName -the packagename used in constructing the messages
 * @param {string} remoteSourceSDK - the name of the sdk in use. Used for metrics.
 * @param {string} remoteApplicationID - the semi-integrated application using the sdk.
 * @param {string} messageCount - the initial count ot use in message id's
 * @constructor
 */
function RemoteMessageBuilder(defaultPackageName, remoteSourceSDK, remoteApplicationID, messageCount) {

    this.defaultPackageName = defaultPackageName;
    this.remoteSourceSDK = remoteSourceSDK;
    this.remoteApplicationID = remoteApplicationID;
    this.messageCount = isNaN(parseInt(messageCount)) ?
      0 : parseInt(messageCount);

    /**
     * @private
     * @returns {string}
     */
    this.getNextMessageId = function() {
        return "s" + this.messageCount++;
    };

    /**
     * @param {Message} protocolMessage
     * @return {RemoteMessage}
     */
    this.buildRemoteMessageObject = function(protocolMessage) {
        var remoteMessage = new RemoteMessage();
        remoteMessage.setId(this.getNextMessageId());
        remoteMessage.setMethod(protocolMessage.getMethod());
        remoteMessage.setPackageName(this.defaultPackageName);
        remoteMessage.setPayload(JSON.stringify(protocolMessage));
        remoteMessage.setType(RemoteMessageType.COMMAND);
        remoteMessage.setRemoteSourceSDK(this.remoteSourceSDK);
        remoteMessage.setRemoteApplicationID(this.remoteApplicationID);
        return remoteMessage;
    };

    /**
     * Builds a discovery request message
     *
     * @returns {RemoteMessage} the constructed message
     */
    this.buildDiscoveryRequestObject = function (supportsOrderModification) {
        var protocolMessage = new DiscoveryRequestMessage();
        protocolMessage.setSupportsOrderModification(supportsOrderModification);
        return this.buildRemoteMessageObject(protocolMessage);
    };

    /**
     * Build a message given the inputs
     *
     * @param {string} method - One of the LanMethod constants
     * @param {string} type - one of the RemoteMessageBuilder constants
     * @param {string} payload - the json object payload (not a string)
     * @param {string} packageName - an override of the package name (optional)
     * @returns {string} the constructed message - a json object
     */
    this.buildRemoteMessage = function (method, type, payload, packageName) {
        var lanMessage = {};
        if (method) lanMessage.method = method;
        lanMessage.packageName = this.defaultPackageName; //"com.clover.remote.protocol.websocket";
        if (packageName)lanMessage.packageName = packageName;
        // This is how they are doing the payload...
        if (!payload)payload = {"method": method};
        lanMessage.payload = JSON.stringify(payload);
        lanMessage.type = RemoteMessageBuilder.COMMAND;

        lanMessage.remoteSourceSDK = this.remoteSourceSDK;
        lanMessage.remoteApplicationID = this.remoteApplicationID;

        if (type)lanMessage.type = type;
        // There is an 'id' in the java instance, but I do not see it being used right now.
        return lanMessage;
    };

    /**
     * Builds a transaction start message
     *
     * @param {string} payload - an order object
     * @returns {string} the constructed message
     */
    this.buildTxStart = function (payload) {
        payload.method = LanMethod.TX_START;
        return this.buildRemoteMessage(LanMethod.TX_START, RemoteMessageBuilder.COMMAND, payload);
    };

    /**
     * Builds a discovery request message
     *
     * @returns {string} the constructed message
     */
    this.buildDiscoveryRequest = function () {
        return this.buildRemoteMessage(LanMethod.DISCOVERY_REQUEST);
    };

    /**
     * Builds a signature verified message
     *
     * @param {string} payload - the signature verified object
     * @returns {string} the constructed message
     */
    this.buildSignatureVerified = function (payload) {
        payload.method = LanMethod.SIGNATURE_VERIFIED;
        return this.buildRemoteMessage(LanMethod.SIGNATURE_VERIFIED, RemoteMessageBuilder.COMMAND, payload);
    };

    /**
     * Builds a signature verified message
     *
     * @param {string} payload - the signature verified object
     * @returns {string} the constructed message
     */
    this.buildPaymentVoid = function (payload) {
        payload.method = LanMethod.PAYMENT_VOIDED;
        return this.buildRemoteMessage(LanMethod.PAYMENT_VOIDED, RemoteMessageBuilder.COMMAND, payload);
    };

    /**
     * Builds a void payment message
     *
     * @param {string} payload - the signature verified object
     * @returns {string} the constructed message
     */
    this.buildVoidPayment = function (payload) {
        payload.method = LanMethod.VOID_PAYMENT;
        return this.buildRemoteMessage(LanMethod.VOID_PAYMENT, RemoteMessageBuilder.COMMAND, payload);
    };

    /**
     * Builds a vault card message
     *
     * @param {string} payload - card entry types allowed
     * @returns {string} the constructed message
     */
    this.buildVaultCard = function (payload) {
        payload.method = LanMethod.VAULT_CARD;
        return this.buildRemoteMessage(LanMethod.VAULT_CARD, RemoteMessageBuilder.COMMAND, payload);
    };

    /**
     * Builds a refund payment message
     *
     * @param {string} payload - the orderid and paymentid with optional amount
     * @returns {string} the constructed message
     */
    this.buildRefund = function (payload) {
        payload.method = LanMethod.REFUND_REQUEST;
        return this.buildRemoteMessage(LanMethod.REFUND_REQUEST, RemoteMessageBuilder.COMMAND, payload);
    };

    /**
     * Builds a capture preauth message
     *
     * @param {string} payload - the orderid, paymentid, amount, with optional tipAmount
     * @returns {string} the constructed message
     */
    this.buildCapturePreAuth = function (payload) {
        payload.method = LanMethod.CAPTURE_PREAUTH;
        return this.buildRemoteMessage(LanMethod.CAPTURE_PREAUTH, RemoteMessageBuilder.COMMAND, payload);
    };;

    /**
     * Builds a closeout message
     *
     * @param {string} payload - optional allowOpenTabs and batchid
     * @returns {string} the constructed message
     */
    this.buildCloseout = function (payload) {
        payload.method = LanMethod.CLOSEOUT_REQUEST;
        return this.buildRemoteMessage(LanMethod.CLOSEOUT_REQUEST, RemoteMessageBuilder.COMMAND, payload);
    };

    /**
     * Builds a tip adjust payment message
     *
     * @param {string} payload - the orderid and paymentid with amount
     * @returns {string} the constructed message
     */
    this.buildTipAdjust = function (payload) {
        payload.method = LanMethod.TIP_ADJUST;
        return this.buildRemoteMessage(LanMethod.TIP_ADJUST, RemoteMessageBuilder.COMMAND, payload);
    };

    /**
     * Builds a message to show the receipt options screen for a payment
     *
     * @param {string} payload - the orderid and paymentid
     * @returns {string} the constructed message
     */
    this.buildShowPaymentReceiptOptions = function (payload) {
        payload.method = LanMethod.SHOW_PAYMENT_RECEIPT_OPTIONS;
        return this.buildRemoteMessage(LanMethod.SHOW_PAYMENT_RECEIPT_OPTIONS, RemoteMessageBuilder.COMMAND, payload);
    };

    /**
     * Builds a message to open the cash drawer
     *
     * @param {string} payload - an empty map/object
     * @returns {string} the constructed message
     */
    this.buildOpenCashDrawer = function (payload) {
        payload.method = LanMethod.OPEN_CASH_DRAWER;
        return this.buildRemoteMessage(LanMethod.OPEN_CASH_DRAWER, RemoteMessageBuilder.COMMAND, payload);
    };

    /**
     * Builds a message to get the last 'transactional' message from the device.
     *
     * @param {string} payload - an empty map/object
     * @returns {string} the constructed message
     */
    this.buildLastMessageRequest = function (payload) {
        payload.method = LanMethod.LAST_MSG_REQUEST;
        return this.buildRemoteMessage(LanMethod.LAST_MSG_REQUEST, RemoteMessageBuilder.COMMAND, payload);
    };

    /**
     * Builds a terminal message (display message for device)
     *
     * @param {string} payload - the message
     * @returns {string} the constructed message
     */
    this.buildTerminalMessage = function (payload) {
        payload.method = LanMethod.TERMINAL_MESSAGE;
        return this.buildRemoteMessage(LanMethod.TERMINAL_MESSAGE, RemoteMessageBuilder.COMMAND, payload);
    };

    /**
     * Builds a message to print passed text
     *
     * @param {string} payload - an object of the form {"textLines" : textLines}
     * @returns {string} the constructed message
     */
    this.buildPrintText = function (payload) {
        payload.method = LanMethod.PRINT_TEXT;
        return this.buildRemoteMessage(LanMethod.PRINT_TEXT, RemoteMessageBuilder.COMMAND, payload);
    };

    /**
     * Builds a message to print the (small) passed image
     *
     * @param {string} payload - an object that has a single attribute;
     *  "png" : Base64 data.
     * @returns {string} the constructed message
     */
    this.buildPrintImage = function (payload) {
        payload.method = LanMethod.PRINT_IMAGE;
        return this.buildRemoteMessage(LanMethod.PRINT_IMAGE, RemoteMessageBuilder.COMMAND, payload);
    };

    /**
     * Builds a message to send to the device to make it show the welcome screen
     *
     * @returns {string} the constructed message
     */
    this.buildShowWelcomeScreen = function () {
        return this.buildRemoteMessage(LanMethod.SHOW_WELCOME_SCREEN, RemoteMessageBuilder.COMMAND);
    };

    /**
     * Builds a message to indicate a cancel
     *
     * @returns {string} the constructed message
     */
    this.buildFinishCancel = function () {
        return this.buildRemoteMessage(LanMethod.FINISH_CANCEL, RemoteMessageBuilder.COMMAND);
    };

    /**
     * Builds a message to send to the device to make it show the 'Thank You' screen
     *
     * @returns {string} the constructed message
     */
    this.buildShowThankYouScreen = function () {
        return this.buildRemoteMessage(LanMethod.SHOW_THANK_YOU_SCREEN, RemoteMessageBuilder.COMMAND);
    };

    /**
     * Builds a message to drive the device to show an order on the screen
     *
     * @param {string} payload - an order object
     * @returns {string} the constructed message
     */
    this.buildShowOrderScreen = function (payload) {
        payload.method = LanMethod.SHOW_ORDER_SCREEN;
        return this.buildRemoteMessage(LanMethod.SHOW_ORDER_SCREEN, RemoteMessageBuilder.COMMAND, payload);
    };

    /**
     * @private
     * @returns {string} the ping message
     */
    this.buildPing = function () {
        return this.buildRemoteMessage(null, RemoteMessageBuilder.PING);
    };

    /**
     * @private
     * @returns {string} a keypress message
     */
    this.buildKeyPress = function (payload) {
        payload.method = LanMethod.KEY_PRESS;
        return this.buildRemoteMessage(LanMethod.KEY_PRESS, RemoteMessageBuilder.COMMAND, payload);
    };


    /**
     * @private
     * @returns {string} a break message
     */
     this.buildBreak = function (payload) {
         payload.method = LanMethod.BREAK;
         return this.buildRemoteMessage(LanMethod.BREAK, RemoteMessageBuilder.COMMAND, payload);
     };
     

    /**
     * @private
     * @returns {string} the pong message
     */
    this.buildPong = function () {
        return this.buildRemoteMessage(null, RemoteMessageBuilder.PONG);
    };

    /**
     * Builds a message to ask the device to shutdown
     *
     * @returns {string} the constructed message
     */
    this.buildShutdown = function () {
        return this.buildRemoteMessage(LanMethod.SHUTDOWN, RemoteMessageBuilder.COMMAND);
    }
}
RemoteMessageBuilder.COMMAND = "COMMAND";
RemoteMessageBuilder.QUERY = "QUERY";
RemoteMessageBuilder.EVENT = "EVENT";
RemoteMessageBuilder.PING = "PING";
RemoteMessageBuilder.PONG = "PONG";
RemoteMessageBuilder.FORCE = "forceConnect";

//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = RemoteMessageBuilder;
}
