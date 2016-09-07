var log = require('./Logger.js').create();
var sdk = require("remote-pay-cloud-api");

var ICloverConnectorListener = sdk.remotepay.ICloverConnectorListener;

/**
 *  Interface to the Clover remote-pay API.
 *
 *  Defines the interface used to interact with remote pay
 *  adapters.
 */

var DebugCloverConnectorListener = function() {
    ICloverConnectorListener.call(this);
    log.enabled = true;
};

DebugCloverConnectorListener.prototype = Object.create(ICloverConnectorListener.prototype);
DebugCloverConnectorListener.prototype.constructor = DebugCloverConnectorListener;

/**
 * @return void
 */
DebugCloverConnectorListener.prototype.onDisconnected = function () {
    log.debug("onDisconnected()");
};


/**
 * @return void
 */
DebugCloverConnectorListener.prototype.onConnected = function () {
    log.debug("onConnected()");
};

/**
 * @param {MerchantInfo} merchantInfo
 * @return void
 */
DebugCloverConnectorListener.prototype.onReady = function (merchantInfo) {
    log.debug("onReady(" + merchantInfo + ")");
};

/**
 * @param {CloverDeviceEvent} deviceEvent
 * @return void
 */
DebugCloverConnectorListener.prototype.onDeviceActivityStart = function (deviceEvent) {
    log.debug("onDeviceActivityStart(" + deviceEvent + ")");
};

/**
 * @param {CloverDeviceEvent} deviceEvent
 * @return void
 */
DebugCloverConnectorListener.prototype.onDeviceActivityEnd = function (deviceEvent) {
    log.debug("onDeviceActivityEnd(" + deviceEvent + ")");
};

/**
 * @param {CloverDeviceErrorEvent} deviceErrorEvent
 * @return void
 */
DebugCloverConnectorListener.prototype.onDeviceError = function (deviceErrorEvent) {
    log.debug("onDeviceError(" + deviceErrorEvent + ")");
};

/**
 * @param {AuthResponse} response
 * @return void
 */
DebugCloverConnectorListener.prototype.onAuthResponse = function (response) {
    log.debug("OnAuthResponse(" + response + ")");
};

/**
 * @param {TipAdjustAuthResponse} response
 * @return void
 */
DebugCloverConnectorListener.prototype.onTipAdjustAuthResponse = function (response) {
    log.debug("onTipAdjustAuthResponse(" + response + ")");
};

/**
 * @param {CapturePreAuthResponse} response
 * @return void
 */
DebugCloverConnectorListener.prototype.onCapturePreAuthResponse = function (response) {
    log.debug("onCapturePreAuthResponse(" + response + ")");
};

/**
 * @param {VerifySignatureRequest} request
 * @return void
 */
DebugCloverConnectorListener.prototype.onVerifySignatureRequest = function (request) {
    log.debug("onVerifySignatureRequest(" + request + ")");
};

/**
 * @param {CloseoutResponse} response
 * @return void
 */
DebugCloverConnectorListener.prototype.onCloseoutResponse = function (response) {
    log.debug("onCloseoutResponse(" + response + ")");
};

/**
 * @param {SaleResponse} response
 * @return void
 */
DebugCloverConnectorListener.prototype.onSaleResponse = function (response) {
    log.debug("onSaleResponse(" + response + ")");
};

/**
 * @param {ManualRefundResponse} response
 * @return void
 */
DebugCloverConnectorListener.prototype.onManualRefundResponse = function (response) {
    log.debug("onManualRefundResponse(" + response + ")");
};

/**
 * @param {RefundPaymentResponse} response
 * @return void
 */
DebugCloverConnectorListener.prototype.onRefundPaymentResponse = function (response) {
    log.debug("onRefundPaymentResponse(" + response + ")");
};

/**
 * @param {TipAdded} tipAdded
 * @return void
 */
DebugCloverConnectorListener.prototype.onTipAdded = function (tipAdded) {
    log.debug("onTipAdded(" + tipAdded + ")");
};

/**
 * @param {VoidPaymentResponse} response
 * @return void
 */
DebugCloverConnectorListener.prototype.onVoidPaymentResponse = function (response) {
    log.debug("onVoidPaymentResponse(" + response + ")");
};

/**
 * @param {VaultCardResponse} response
 * @return void
 */
DebugCloverConnectorListener.prototype.onVaultCardResponse = function (response) {
    log.debug("onVaultCardResponse(" + response + ")");
};

/**
 * @param {ConfigErrorResponse} response
 * @return void
 */
DebugCloverConnectorListener.prototype.onConfigErrorResponse = function (response) {
    log.debug("onConfigErrorResponse(" + response + ")");
};

/**
 * @param {PreAuthResponse} response
 * @return void
 */
DebugCloverConnectorListener.prototype.onPreAuthResponse = function (response) {
    log.debug("onPreAuthResponse(" + response + ")");
};

/**
 * @param {BaseResponse} response
 * @return void
 */
DebugCloverConnectorListener.prototype.onLastTransactionResponse = function (response) {
    log.debug("onLastTransactionResponse(" + response + ")");
};

//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = DebugCloverConnectorListener;
}

