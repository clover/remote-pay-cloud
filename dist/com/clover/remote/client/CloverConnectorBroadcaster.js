"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var sdk = require("remote-pay-cloud-api");
var Logger_1 = require("./util/Logger");
var CloverConnectorBroadcaster = (function (_super) {
    __extends(CloverConnectorBroadcaster, _super);
    function CloverConnectorBroadcaster() {
        var _this = _super.call(this) || this;
        _this.logger = Logger_1.Logger.create();
        return _this;
    }
    CloverConnectorBroadcaster.prototype.clear = function () {
        this.splice(0, this.length);
    };
    CloverConnectorBroadcaster.prototype.notifyOnTipAdded = function (tip) {
        var _this = this;
        this.logger.debug('Sending TipAdded notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onTipAdded(new sdk.remotemessages.TipAddedMessage(tip));
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnRefundPaymentResponse = function (refundPaymentResponse) {
        var _this = this;
        this.logger.debug('Sending RefundPaymentResponse notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onRefundPaymentResponse(refundPaymentResponse);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyCloseout = function (closeoutResponse) {
        var _this = this;
        this.logger.debug('Sending Closeout notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onCloseoutResponse(closeoutResponse);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnDeviceActivityStart = function (deviceEvent) {
        var _this = this;
        this.logger.debug('Sending DeviceActivityStart notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onDeviceActivityStart(deviceEvent);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnDeviceActivityEnd = function (deviceEvent) {
        var _this = this;
        this.logger.debug('Sending DeviceActivityEnd notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onDeviceActivityEnd(deviceEvent);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnSaleResponse = function (response) {
        var _this = this;
        this.logger.debug('Sending SaleResponse notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onSaleResponse(response);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnAuthResponse = function (response) {
        var _this = this;
        this.logger.debug('Sending AuthResponse notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onAuthResponse(response);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnManualRefundResponse = function (response) {
        var _this = this;
        this.logger.debug('Sending ManualRefundResponse notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onManualRefundResponse(response);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnVerifySignatureRequest = function (request) {
        var _this = this;
        this.logger.debug('Sending VerifySignatureRequest notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onVerifySignatureRequest(request);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnVoidPaymentResponse = function (response) {
        var _this = this;
        this.logger.debug('Sending VoidPaymentResponse notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onVoidPaymentResponse(response);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnConnect = function () {
        var _this = this;
        this.logger.debug('Sending Connect notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onDeviceConnected();
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnDisconnect = function () {
        var _this = this;
        this.logger.debug('Sending Disconnect notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onDeviceDisconnected();
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnReady = function (merchantInfo) {
        var _this = this;
        this.logger.debug('Sending Ready notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onDeviceReady(merchantInfo);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnTipAdjustAuthResponse = function (response) {
        var _this = this;
        this.logger.debug('Sending TipAdjustAuthResponse notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onTipAdjustAuthResponse(response);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnVaultCardRespose = function (ccr) {
        var _this = this;
        this.logger.debug('Sending VaultCardResponse notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onVaultCardResponse(ccr);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnPreAuthResponse = function (response) {
        var _this = this;
        this.logger.debug('Sending PreAuthResponse notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onPreAuthResponse(response);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnCapturePreAuth = function (response) {
        var _this = this;
        this.logger.debug('Sending CapturePreAuth notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onCapturePreAuthResponse(response);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnDeviceError = function (errorEvent) {
        var _this = this;
        this.logger.debug('Sending DeviceError notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onDeviceError(errorEvent);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnPrintRefundPaymentReceipt = function (printRefundPaymentReceiptMessage) {
        var _this = this;
        this.logger.debug('Sending PrintRefundPaymentReceipt notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onPrintRefundPaymentReceipt(printRefundPaymentReceiptMessage);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnPrintPaymentMerchantCopyReceipt = function (printPaymentMerchantCopyReceiptMessage) {
        var _this = this;
        this.logger.debug('Sending PrintPaymentMerchantCopyReceipt notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onPrintPaymentMerchantCopyReceipt(printPaymentMerchantCopyReceiptMessage);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnPrintPaymentDeclineReceipt = function (printPaymentDeclineReceiptMessage) {
        var _this = this;
        this.logger.debug('Sending PrintPaymentDeclineReceipt notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onPrintPaymentDeclineReceipt(printPaymentDeclineReceiptMessage);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnPrintPaymentReceipt = function (printPaymentReceiptMessage) {
        var _this = this;
        this.logger.debug('Sending PrintPaymentReceipt notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onPrintPaymentReceipt(printPaymentReceiptMessage);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnPrintCreditReceipt = function (printManualRefundReceiptMessage) {
        var _this = this;
        this.logger.debug('Sending PrintCreditReceipt notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onPrintManualRefundReceipt(printManualRefundReceiptMessage);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnPrintCreditDeclineReceipt = function (printManualRefundDeclineReceiptMessage) {
        var _this = this;
        this.logger.debug('Sending PrintCreditDeclineReceipt notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onPrintManualRefundDeclineReceipt(printManualRefundDeclineReceiptMessage);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnConfirmPaymentRequest = function (confirmPaymentRequest) {
        var _this = this;
        this.logger.debug('Sending ConfirmPaymentRequest notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onConfirmPaymentRequest(confirmPaymentRequest);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnRetrievePendingPaymentResponse = function (rppr) {
        var _this = this;
        this.logger.debug('Sending RetrievePendingPaymentResponse notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onRetrievePendingPaymentsResponse(rppr);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    CloverConnectorBroadcaster.prototype.notifyOnReadCardDataResponse = function (rcdr) {
        var _this = this;
        this.logger.debug('Sending ReadCardDataResponse notification to listeners');
        this.forEach(function (listener) {
            try {
                listener.onReadCardDataResponse(rcdr);
            }
            catch (e) {
                _this.logger.error(e);
            }
        });
    };
    return CloverConnectorBroadcaster;
}(Array));
exports.CloverConnectorBroadcaster = CloverConnectorBroadcaster;

//# sourceMappingURL=../../../../maps/com/clover/remote/client/CloverConnectorBroadcaster.js.map
