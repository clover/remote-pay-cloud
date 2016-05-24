require("prototype");
var log = require('./Logger.js').create();
var ICloverConnectorListener = require("./remotepay/ICloverConnectorListener.js");

/**
 *  Interface to the Clover remote-pay API.
 *
 *  Defines the interface used to interact with remote pay
 *  adapters.
 */

DebugCloverConnectorListener = Class.create(ICloverConnectorListener, {

    /**
     *
     */
    initialize: function () {
        log.enabled = true;
    },

    /**
     * @return void
     */
    onDisconnected: function () {
        log.debug("onDisconnected()");
    },

    /**
     * @return void
     */
    onConnected: function () {
        log.debug("onConnected()");
    },

    /**
     * @param {MerchantInfo} merchantInfo
     * @return void
     */
    onReady: function (merchantInfo) {
        log.debug("onReady(" + merchantInfo + ")");
    },

    /**
     * @param {CloverDeviceEvent} deviceEvent
     * @return void
     */
    onDeviceActivityStart: function (deviceEvent) {
        log.debug("onDeviceActivityStart(" + deviceEvent + ")");
    },

    /**
     * @param {CloverDeviceEvent} deviceEvent
     * @return void
     */
    onDeviceActivityEnd: function (deviceEvent) {
        log.debug("onDeviceActivityEnd(" + deviceEvent + ")");
    },

    /**
     * @param {CloverDeviceErrorEvent} deviceErrorEvent
     * @return void
     */
    onDeviceError: function (deviceErrorEvent) {
        log.debug("onDeviceError(" + deviceErrorEvent + ")");
    },

    /**
     * @param {AuthResponse} response
     * @return void
     */
    onAuthResponse: function (response) {
        log.debug("OnAuthResponse(" + response + ")");
    },

    /**
     * @param {TipAdjustAuthResponse} response
     * @return void
     */
    onTipAdjustAuthResponse: function (response) {
        log.debug("onTipAdjustAuthResponse(" + response + ")");
    },

    /**
     * @param {CapturePreAuthResponse} response
     * @return void
     */
    onCapturePreAuthResponse: function (response) {
        log.debug("onCapturePreAuthResponse(" + response + ")");
    },

    /**
     * @param {VerifySignatureRequest} request
     * @return void
     */
    onVerifySignatureRequest: function (request) {
        log.debug("onVerifySignatureRequest(" + request + ")");
    },

    /**
     * @param {CloseoutResponse} response
     * @return void
     */
    onCloseoutResponse: function (response) {
        log.debug("onCloseoutResponse(" + response + ")");
    },

    /**
     * @param {SaleResponse} response
     * @return void
     */
    onSaleResponse: function (response) {
        log.debug("onSaleResponse(" + response + ")");
    },

    /**
     * @param {ManualRefundResponse} response
     * @return void
     */
    onManualRefundResponse: function (response) {
        log.debug("onManualRefundResponse(" + response + ")");
    },

    /**
     * @param {RefundPaymentResponse} response
     * @return void
     */
    onRefundPaymentResponse: function (response) {
        log.debug("onRefundPaymentResponse(" + response + ")");
    },

    /**
     * @param {TipAdded} tipAdded
     * @return void
     */
    onTipAdded: function (tipAdded) {
        log.debug("onTipAdded(" + tipAdded + ")");
    },

    /**
     * @param {VoidPaymentResponse} response
     * @return void
     */
    onVoidPaymentResponse: function (response) {
        log.debug("onVoidPaymentResponse(" + response + ")");
    },

    /**
     * @param {VaultCardResponse} response
     * @return void
     */
    onVaultCardResponse: function (response) {
        log.debug("onVaultCardResponse(" + response + ")");
    },

    /**
     * @param {ConfigErrorResponse} response
     * @return void
     */
    onConfigErrorResponse: function (response) {
        log.debug("onConfigErrorResponse(" + response + ")");
    },

    /**
     * @param {PreAuthResponse} response
     * @return void
     */
    onPreAuthResponse: function (response) {
        log.debug("onPreAuthResponse(" + response + ")");
    },

    /**
     * @param {BaseResponse} response
     * @return void
     */
    onLastTransactionResponse: function (response) {
        log.debug("onLastTransactionResponse(" + response + ")");
    }
});

//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = DebugCloverConnectorListener;
}

