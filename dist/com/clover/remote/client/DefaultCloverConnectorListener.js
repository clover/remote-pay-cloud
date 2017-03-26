"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DefaultCloverConnectorListener = (function () {
    function DefaultCloverConnectorListener(cloverConnector) {
        this.ready = false;
        this.cloverConnector = cloverConnector;
    }
    DefaultCloverConnectorListener.prototype.isReady = function () {
        return this.ready;
    };
    DefaultCloverConnectorListener.prototype.onDeviceDisconnected = function () {
        this.ready = false;
    };
    DefaultCloverConnectorListener.prototype.onDeviceConnected = function () {
        this.ready = false;
    };
    DefaultCloverConnectorListener.prototype.onDeviceReady = function (merchantInfo) {
        this.ready = true;
        this.merchantInfo = merchantInfo;
    };
    DefaultCloverConnectorListener.prototype.onDeviceActivityStart = function (deviceEvent) {
    };
    DefaultCloverConnectorListener.prototype.onDeviceActivityEnd = function (deviceEvent) {
    };
    DefaultCloverConnectorListener.prototype.onDeviceError = function (deviceErrorEvent) {
    };
    DefaultCloverConnectorListener.prototype.onAuthResponse = function (response) {
    };
    DefaultCloverConnectorListener.prototype.onTipAdjustAuthResponse = function (response) {
    };
    DefaultCloverConnectorListener.prototype.onCapturePreAuthResponse = function (response) {
    };
    DefaultCloverConnectorListener.prototype.onVerifySignatureRequest = function (request) {
        if (this.cloverConnector !== null) {
            this.cloverConnector.acceptSignature(request);
        }
    };
    DefaultCloverConnectorListener.prototype.onCloseoutResponse = function (response) {
    };
    DefaultCloverConnectorListener.prototype.onSaleResponse = function (response) {
    };
    DefaultCloverConnectorListener.prototype.onPreAuthResponse = function (response) {
    };
    DefaultCloverConnectorListener.prototype.onManualRefundResponse = function (response) {
    };
    DefaultCloverConnectorListener.prototype.onRefundPaymentResponse = function (response) {
    };
    DefaultCloverConnectorListener.prototype.onTipAdded = function (message) {
    };
    DefaultCloverConnectorListener.prototype.onVoidPaymentResponse = function (response) {
    };
    DefaultCloverConnectorListener.prototype.onVaultCardResponse = function (response) {
    };
    // TODO: These print messages need to be created in the api
    /*
    public onPrintManualRefundReceipt(pcm: PrintManualRefundReceiptMessage): void {

    }

    public onPrintManualRefundDeclineReceipt(pcdrm: PrintManualRefundDeclineReceiptMessage): void {

    }

    public onPrintPaymentReceipt(pprm: PrintPaymentReceiptMessage): void {

    }

    public onPrintPaymentDeclineReceipt(ppdrm: PrintPaymentDeclineReceiptMessage): void {

    }

    public onPrintPaymentMerchantCopyReceipt(ppmcrm: PrintPaymentMerchantCopyReceiptMessage): void {

    }

    public onPrintRefundPaymentReceipt(pprrm: PrintRefundPaymentReceiptMessage): void {

    }
    */
    DefaultCloverConnectorListener.prototype.onRetrievePendingPaymentsResponse = function (retrievePendingPaymentResponse) {
    };
    DefaultCloverConnectorListener.prototype.onReadCardDataResponse = function (response) {
    };
    return DefaultCloverConnectorListener;
}());
exports.DefaultCloverConnectorListener = DefaultCloverConnectorListener;

//# sourceMappingURL=../../../../maps/com/clover/remote/client/DefaultCloverConnectorListener.js.map
