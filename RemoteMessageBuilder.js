var LanMethod = require("./LanMethod.js");

/**
 * Builds messages to pass to the clover device.
 *
 *
 * @see com.clover.remote.protocol.RemoteMessage
 * @param {string} defaultPackageName -the packagename used in constructing the messages
 * @constructor
 */
function RemoteMessageBuilder(defaultPackageName) {

    this.defaultPackageName = defaultPackageName;

    /**
     * Build a message given the inputs
     *
     * @param {string} method - One of the LanMethod constants
     * @param {string} type - one of the RemoteMessageBuilder constants
     * @param {json} payload - the json object payload (not a string)
     * @param {string} packageName - an override of the package name (optional)
     * @returns {json} the constructed message - a json object
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
        if (type)lanMessage.type = type;
        // There is an 'id' in the java instance, but I do not see it being used right now.
        return lanMessage;
    };

    /**
     * Builds a transaction start message
     *
     * @param {json} payload - an order object
     * @returns {json} the constructed message
     */
    this.buildTxStart = function (payload) {
        payload.method = LanMethod.TX_START;
        return this.buildRemoteMessage(LanMethod.TX_START, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * Builds a discovery request message
     *
     * @returns {json} the constructed message
     */
    this.buildDiscoveryRequest = function () {
        return this.buildRemoteMessage(LanMethod.DISCOVERY_REQUEST);
    }

    /**
     * Builds a signature verified message
     *
     * @param {json} payload - the signature verified object
     * @returns {json} the constructed message
     */
    this.buildSignatureVerified = function (payload) {
        payload.method = LanMethod.SIGNATURE_VERIFIED;
        return this.buildRemoteMessage(LanMethod.SIGNATURE_VERIFIED, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * Builds a signature verified message
     *
     * @param {json} payload - the signature verified object
     * @returns {json} the constructed message
     */
    this.buildPaymentVoid = function (payload) {
        payload.method = LanMethod.PAYMENT_VOIDED;
        return this.buildRemoteMessage(LanMethod.PAYMENT_VOIDED, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * Builds a void payment message
     *
     * @param {json} payload - the signature verified object
     * @returns {json} the constructed message
     */
    this.buildVoidPayment = function (payload) {
        payload.method = LanMethod.VOID_PAYMENT;
        return this.buildRemoteMessage(LanMethod.VOID_PAYMENT, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * Builds a vault card message
     *
     * @param {json} payload - card entry types allowed
     * @returns {json} the constructed message
     */
    this.buildVaultCard = function (payload) {
        payload.method = LanMethod.VAULT_CARD;
        return this.buildRemoteMessage(LanMethod.VAULT_CARD, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * Builds a refund payment message
     *
     * @param {json} payload - the orderid and paymentid with optional amount
     * @returns {json} the constructed message
     */
    this.buildRefund = function (payload) {
        payload.method = LanMethod.REFUND_REQUEST;
        return this.buildRemoteMessage(LanMethod.REFUND_REQUEST, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * Builds a capture preauth message
     *
     * @param {json} payload - the orderid, paymentid, amount, with optional tipAmount
     * @returns {json} the constructed message
     */
    this.buildCapturePreAuth = function (payload) {
        payload.method = LanMethod.CAPTURE_PREAUTH;
        return this.buildRemoteMessage(LanMethod.CAPTURE_PREAUTH, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * Builds a closeout message
     *
     * @param {json} payload - optional allowOpenTabs and batchid
     * @returns {json} the constructed message
     */
    this.buildCloseout = function (payload) {
        payload.method = LanMethod.CLOSEOUT_REQUEST;
        return this.buildRemoteMessage(LanMethod.CLOSEOUT_REQUEST, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * Builds a tip adjust payment message
     *
     * @param {json} payload - the orderid and paymentid with amount
     * @returns {json} the constructed message
     */
    this.buildTipAdjust = function (payload) {
        payload.method = LanMethod.TIP_ADJUST;
        return this.buildRemoteMessage(LanMethod.TIP_ADJUST, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * Builds a message to show the receipt options screen for a payment
     *
     * @param {json} payload - the orderid and paymentid
     * @returns {json} the constructed message
     */
    this.buildShowPaymentReceiptOptions = function (payload) {
        payload.method = LanMethod.SHOW_PAYMENT_RECEIPT_OPTIONS;
        return this.buildRemoteMessage(LanMethod.SHOW_PAYMENT_RECEIPT_OPTIONS, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * Builds a message to open the cash drawer
     *
     * @param {json} payload - an empty map/object
     * @returns {json} the constructed message
     */
    this.buildOpenCashDrawer = function (payload) {
        payload.method = LanMethod.OPEN_CASH_DRAWER;
        return this.buildRemoteMessage(LanMethod.OPEN_CASH_DRAWER, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * Builds a message to get the last 'transactional' message from the device.
     *
     * @param {json} payload - an empty map/object
     * @returns {json} the constructed message
     */
    this.buildLastMessageRequest = function (payload) {
        payload.method = LanMethod.LAST_MSG_REQUEST;
        return this.buildRemoteMessage(LanMethod.LAST_MSG_REQUEST, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * Builds a terminal message (display message for device)
     *
     * @param {json} payload - the message
     * @returns {json} the constructed message
     */
    this.buildTerminalMessage = function (payload) {
        payload.method = LanMethod.TERMINAL_MESSAGE;
        return this.buildRemoteMessage(LanMethod.TERMINAL_MESSAGE, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * Builds a message to print passed text
     *
     * @param {json} payload - an object of the form {"textLines" : textLines}
     * @returns {json} the constructed message
     */
    this.buildPrintText = function (payload) {
        payload.method = LanMethod.PRINT_TEXT;
        return this.buildRemoteMessage(LanMethod.PRINT_TEXT, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * Builds a message to print the (small) passed image
     *
     * @param {json} payload - an object that has a single attribute;
     *  "png" : Base64 data.
     * @returns {json} the constructed message
     */
    this.buildPrintImage = function (payload) {
        payload.method = LanMethod.PRINT_IMAGE;
        return this.buildRemoteMessage(LanMethod.PRINT_IMAGE, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * Builds a message to send to the device to make it show the welcome screen
     *
     * @returns {json} the constructed message
     */
    this.buildShowWelcomeScreen = function () {
        return this.buildRemoteMessage(LanMethod.SHOW_WELCOME_SCREEN, RemoteMessageBuilder.COMMAND);
    }

    /**
     * Builds a message to indicate a cancel
     *
     * @returns {json} the constructed message
     */
    this.buildFinishCancel = function () {
        return this.buildRemoteMessage(LanMethod.FINISH_CANCEL, RemoteMessageBuilder.COMMAND);
    }

    /**
     * Builds a message to send to the device to make it show the 'Thank You' screen
     *
     * @returns {json} the constructed message
     */
    this.buildShowThankYouScreen = function () {
        return this.buildRemoteMessage(LanMethod.SHOW_THANK_YOU_SCREEN, RemoteMessageBuilder.COMMAND);
    }

    /**
     * Builds a message to drive the device to show an order on the screen
     *
     * @param {json} payload - an order object
     * @returns {json} the constructed message
     */
    this.buildShowOrderScreen = function (payload) {
        payload.method = LanMethod.SHOW_ORDER_SCREEN;
        return this.buildRemoteMessage(LanMethod.SHOW_ORDER_SCREEN, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * @private
     * @returns {json} the ping message
     */
    this.buildPing = function () {
        return this.buildRemoteMessage(null, RemoteMessageBuilder.PING);
    }

    /**
     * @private
     * @returns {json} a keypress message
     */
    this.buildKeyPress = function (payload) {
        payload.method = LanMethod.KEY_PRESS;
        return this.buildRemoteMessage(LanMethod.KEY_PRESS, RemoteMessageBuilder.COMMAND, payload);
    }

    /**
     * @private
     * @returns {json} the pong message
     */
    this.buildPong = function () {
        return this.buildRemoteMessage(null, RemoteMessageBuilder.PONG);
    }

    /**
     * Builds a message to ask the device to shutdown
     *
     * @returns {json} the constructed message
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
