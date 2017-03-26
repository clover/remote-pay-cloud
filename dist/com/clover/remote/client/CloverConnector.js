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
var CloverConnectorBroadcaster_1 = require("./CloverConnectorBroadcaster");
var CloverDeviceFactory_1 = require("./device/CloverDeviceFactory");
var Logger_1 = require("./util/Logger");
var ResultCode_1 = require("./messages/ResultCode");
/**
 * Clover Connector
 *
 * The clover connector implements the ICloverConnector interface. This is where
 * we define how the connector interacts with remote pay adapters.
 */
var CloverConnector = (function () {
    function CloverConnector(config) {
        // manual is not enabled by default
        this.cardEntryMethods = CloverConnector.CARD_ENTRY_METHOD_MAG_STRIPE | CloverConnector.CARD_ENTRY_METHOD_ICC_CONTACT | CloverConnector.CARD_ENTRY_METHOD_NFC_CONTACTLESS; // | CARD_ENTRY_METHOD_MANUAL;
        // Create a logger
        this.logger = Logger_1.Logger.create();
        // List of listeners to broadcast notifications to
        this.broadcaster = new CloverConnectorBroadcaster_1.CloverConnectorBroadcaster();
        // Flag indicating whether the device is ready or not
        this.isReady = false;
        // Set the cancel input option
        CloverConnector.CANCEL_INPUT_OPTION = new sdk.remotemessage.InputOption(sdk.remotemessage.KeyPress.ESC, "Cancel");
        // Try to load the configuration.
        if (config) {
            try {
                // Make sure we do not change the passed object, make a copy.
                this.configuration = JSON.parse(JSON.stringify(config));
            }
            catch (e) {
                this.logger.error('Could not load configuration', e);
                throw e;
            }
        }
    }
    /**
     * Initialize the connector with a new config
     *
     * @param {CloverDeviceConfiguration} config - the configuration for the connector
     */
    CloverConnector.prototype.initialize = function (config) {
        try {
            // Make sure we do not change the passed object, make a copy.
            this.configuration = JSON.parse(JSON.stringify(config));
        }
        catch (e) {
            this.logger.error('Could not load configuration', e);
            throw e;
        }
        this.deviceObserver = new CloverConnector.InnerDeviceObserver(this);
        // Get the device and subscribe to it.
        this.device = CloverDeviceFactory_1.CloverDeviceFactory.get(config);
        if (this.device != null) {
            this.device.subscribe(this.deviceObserver);
        }
    };
    CloverConnector.prototype.initializeConnection = function () {
        if (this.device == null) {
            this.initialize(this.configuration);
        }
    };
    /**
     * Add new listener to receive broadcast notifications
     *
     * @param {ICloverConnectorListener} connectorListener - the listener to add
     */
    CloverConnector.prototype.addCloverConnectorListener = function (connectorListener) {
        this.broadcaster.push(connectorListener);
    };
    /**
     * Remove a listener
     *
     * @param {ICloverConnectorListener} connectorListener - the listener to remove
     */
    CloverConnector.prototype.removeCloverConnectorListener = function (connectorListener) {
        var indexOfListener = this.broadcaster.indexOf(connectorListener);
        if (indexOfListener != -1) {
            this.broadcaster.splice(indexOfListener, 1);
        }
    };
    CloverConnector.prototype.sale = function (request) {
        this.lastRequest = request;
        if (this.device == null || !this.isReady) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.ERROR, "Device Connection Error", "In sale: SaleRequest - The Clover device is not connected.");
        }
        else if (request == null) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.FAIL, "Invalid Argument.", "In sale: SaleRequest - The request that was passed in for processing is null.");
        }
        else if (request.getAmount() <= 0) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.FAIL, "Request Validation Error", "In sale: SaleRequest - The request amount cannot be zero. Original Request = " + request);
        }
        else if (request.getTipAmount() !== null && request.getTipAmount() < 0) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.FAIL, "Request Validation Error", "In sale: SaleRequest - The tip amount cannot be less than zero. Original Request = " + request);
        }
        else if (request.getExternalId() == null || request.getExternalId().trim().length() == 0 || request.getExternalId().trim().length() > 32) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.FAIL, "Invalid Argument.", "In sale: SaleRequest - The externalId is required and the max length is 32 characters. Original Request = " + request);
        }
        else if (request.getVaultedCard() !== null && !this.merchantInfo.supportsVaultCards) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In sale: SaleRequest - Vault Card support is not enabled for the payment gateway. Original Request = " + request);
        }
        else {
            if (request.getTipAmount() == null) {
                request.setTipAmount(0);
            }
            try {
                this.saleAuth(request, false);
            }
            catch (e) {
                this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.ERROR, e, null);
            }
        }
    };
    /**
     * A common PayIntent builder method for Sale, Auth and PreAuth
     *
     * @param request
     */
    CloverConnector.prototype.saleAuth = function (request, suppressTipScreen) {
        if (this.device !== null && this.isReady) {
            this.lastRequest = request;
            var builder = new sdk.remotemessage.PayIntent.Builder();
            builder.transactionType(request.getType()); // difference between sale, auth and auth(preAuth)
            builder.amount(request.getAmount());
            builder.cardEntryMethods(request.getCardEntryMethods() !== null ? request.getCardEntryMethods() : this.cardEntryMethods);
            if (request.getDisablePrinting() !== null) {
                builder.remotePrint(request.getDisablePrinting());
            }
            if (request.getCardNotPresent() !== null) {
                builder.cardNotPresent(request.getCardNotPresent());
            }
            if (request.getDisableRestartTransactionOnFail() !== null) {
                builder.disableRestartTransactionWhenFailed(request.getDisableRestartTransactionOnFail());
            }
            builder.vaultedCard(request.getVaultedCard());
            builder.externalPaymentId(request.getExternalId().trim());
            builder.requiresRemoteConfirmation(true);
            if (request instanceof sdk.remotepay.PreAuthRequest) {
                // nothing extra as of now
            }
            else if (request instanceof sdk.remotepay.AuthRequest) {
                var req = request;
                if (req.getTippableAmount() !== null) {
                    builder.tippableAmount(req.getTippableAmount());
                }
                if (req.getAllowOfflinePayment() !== null) {
                    builder.allowOfflinePayment(req.getAllowOfflinePayment());
                }
                if (req.getApproveOfflinePaymentWithoutPrompt() !== null) {
                    builder.approveOfflinePaymentWithoutPrompt(req.getApproveOfflinePaymentWithoutPrompt());
                }
                if (req.getDisableCashback() !== null) {
                    builder.disableCashback(req.getDisableCashback());
                }
                if (req.getTaxAmount() !== null) {
                    builder.taxAmount(req.getTaxAmount());
                }
            }
            else if (request instanceof sdk.remotepay.SaleRequest) {
                var req = request;
                // shared with AuthRequest
                if (req.getAllowOfflinePayment() !== null) {
                    builder.allowOfflinePayment(req.getAllowOfflinePayment());
                }
                if (req.getApproveOfflinePaymentWithoutPrompt() !== null) {
                    builder.approveOfflinePaymentWithoutPrompt(req.getApproveOfflinePaymentWithoutPrompt());
                }
                if (req.getDisableCashback() !== null) {
                    builder.disableCashback(req.getDisableCashback());
                }
                if (req.getTaxAmount() !== null) {
                    builder.taxAmount(req.getTaxAmount());
                }
                // SaleRequest
                if (req.getTippableAmount() !== null) {
                    builder.tippableAmount(req.getTippableAmount());
                }
                if (req.getTipAmount() !== null) {
                    builder.tipAmount(req.getTipAmount());
                }
                // sale could pass in the tipAmount and not override on the screen,
                // but that is the exceptional case
                if (req.getDisableTipOnScreen() !== null) {
                    suppressTipScreen = req.getDisableTipOnScreen();
                }
            }
            var payIntent = builder.build();
            this.device.doTxStart(payIntent, null, suppressTipScreen); //
        }
    };
    CloverConnector.prototype.acceptSignature = function (request) {
        if (this.device == null || !this.isReady) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In acceptSignature: Device is not connected."));
        }
        else if (request == null) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In acceptSignature: VerifySignatureRequest cannot be null."));
        }
        else if (request.getPayment() == null || request.getPayment().getId() == null) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In acceptSignature: VerifySignatureRequest. Payment must have anID."));
        }
        else {
            this.device.doSignatureVerified(request.getPayment(), true);
        }
    };
    CloverConnector.prototype.rejectSignature = function (request) {
        if (this.device == null || !this.isReady) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In rejectSignature: Device is not connected."));
        }
        else if (request == null) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In rejectSignature: VerifySignatureRequest cannot be null."));
        }
        else if (request.getPayment() == null || request.getPayment().getId() == null) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In rejectSignature: VerifySignatureRequest.Payment must have an ID."));
        }
        else {
            this.device.doSignatureVerified(request.getPayment(), false);
        }
    };
    CloverConnector.prototype.acceptPayment = function (payment) {
        if (this.device == null || !this.isReady) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In acceptPayment: Device is not connected."));
        }
        else if (payment == null) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In acceptPayment: Payment cannot be null."));
        }
        else if (payment.getId() == null) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In acceptPayment: Payment must have an ID."));
        }
        else {
            this.device.doAcceptPayment(payment);
        }
    };
    CloverConnector.prototype.rejectPayment = function (payment, challenge) {
        if (this.device == null || !this.isReady) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In rejectPayment: Device is not connected."));
        }
        else if (payment == null) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In rejectPayment: Payment cannot be null."));
        }
        else if (payment.getId() == null) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In rejectPayment: Payment must have an ID."));
        }
        else if (challenge == null) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In rejectPayment: Challenge cannot be null."));
        }
        else {
            this.device.doRejectPayment(payment, challenge);
        }
    };
    CloverConnector.prototype.auth = function (request) {
        this.lastRequest = request;
        if (this.device == null || !this.isReady) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.ERROR, "Device connection Error", "In auth: Auth Request - The Clover device is not connected.");
        }
        else if (!this.merchantInfo.supportsAuths) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In auth: AuthRequest - Auths are not enabled for the payment gateway. Original Request = " + request);
        }
        else if (request == null) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.FAIL, "Invalid Argument.", "In auth: AuthRequest - The request that was passed in for processing is null.");
        }
        else if (request.getAmount() <= 0) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.FAIL, "Request Validation Error", "In auth: AuthRequest - The request amount cannot be zero. Original Request = " + request);
        }
        else if (request.getExternalId() == null || request.getExternalId().trim().length() == 0 || request.getExternalId().trim().length() > 32) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.FAIL, "Invalid Argument.", "In auth: AuthRequest - The externalId is invalid. It is required and the max length is 32. Original Request = " + request);
        }
        else if (request.getVaultedCard() !== null && !this.merchantInfo.supportsVaultCards) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In auth: AuthRequest - Vault Card support is not enabled for the payment gateway. Original Request = " + request);
        }
        else {
            try {
                this.saleAuth(request, true);
            }
            catch (e) {
                this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.ERROR, e, null);
            }
        }
    };
    CloverConnector.prototype.preAuth = function (request) {
        this.lastRequest = request;
        if (this.device == null || !this.isReady) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.ERROR, "Device connection Error", "In preAuth: PreAuthRequest - The Clover device is not connected.");
        }
        else if (!this.merchantInfo.supportsPreAuths) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In preAuth: PreAuthRequest - PreAuths are not enabled for the payment gateway. Original Request = " + request);
        }
        else if (request == null) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.FAIL, "Invalid Argument.", "In preAuth: PreAuthRequest - The request that was passed in for processing is null.");
        }
        else if (request.getAmount() <= 0) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.FAIL, "Request Validation Error", "In preAuth: PreAuthRequest - The request amount cannot be zero. Original Request = " + request);
        }
        else if (request.getExternalId() == null || request.getExternalId().trim().length() == 0 || request.getExternalId().trim().length() > 32) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.FAIL, "Invalid Argument.", "In preAuth: PreAuthRequest - The externalId is invalid. It is required and the max length is 32. Original Request = " + request);
        }
        else if (request.getVaultedCard() !== null && !this.merchantInfo.supportsVaultCards) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In preAuth: PreAuthRequest - Vault Card support is not enabled for the payment gateway. Original Request = " + request);
        }
        else {
            try {
                this.saleAuth(request, true);
            }
            catch (e) {
                this.lastRequest = null;
                this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.ERROR, e, null);
            }
        }
    };
    CloverConnector.prototype.capturePreAuth = function (request) {
        if (this.device == null || !this.isReady) {
            this.deviceObserver.onCapturePreAuth(ResultCode_1.ResultCode.ERROR, "Device connection Error", "In capturePreAuth: CapturePreAuth - The Clover device is not connected.", null, null);
        }
        else if (!this.merchantInfo.supportsPreAuths) {
            this.deviceObserver.onCapturePreAuth(ResultCode_1.ResultCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In capturePreAuth: PreAuth Captures are not enabled for the payment gateway. Original Request = " + request, null, null);
        }
        else if (request == null) {
            this.deviceObserver.onCapturePreAuth(ResultCode_1.ResultCode.FAIL, "Invalid Argument.", "In capturePreAuth: CapturePreAuth - The request that was passed in for processing is null.", null, null);
        }
        else if (request.getAmount() < 0 || request.getTipAmount() < 0) {
            this.deviceObserver.onCapturePreAuth(ResultCode_1.ResultCode.FAIL, "Request Validation Error", "In capturePreAuth: CapturePreAuth - The request amount must be greater than zero and the tip must be greater than or equal to zero. Original Request = " + request, null, null);
        }
        else {
            try {
                this.device.doCaptureAuth(request.paymentID, request.amount, request.tipAmount);
            }
            catch (e) {
                var response = new sdk.remotepay.CapturePreAuthResponse(false, ResultCode_1.ResultCode.UNSUPPORTED);
                response.setReason("Pre Auths unsupported");
                response.setMessage("The currently configured merchant gateway does not support Capture Auth requests.");
                this.broadcaster.notifyOnCapturePreAuth(response);
            }
        }
    };
    CloverConnector.prototype.tipAdjustAuth = function (request) {
        if (this.device == null || !this.isReady) {
            this.deviceObserver.onAuthTipAdjusted(ResultCode_1.ResultCode.ERROR, "Device connection Error", "In tipAdjustAuth: TipAdjustAuthRequest - The Clover device is not connected.");
        }
        else if (!this.merchantInfo.supportsTipAdjust) {
            this.deviceObserver.onAuthTipAdjusted(ResultCode_1.ResultCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In tipAdjustAuth: TipAdjustAuthRequest - Tip Adjustments are not enabled for the payment gateway. Original Request = " + request);
        }
        else if (request == null) {
            this.deviceObserver.onAuthTipAdjusted(ResultCode_1.ResultCode.FAIL, "Invalid Argument.", "In tipAdjustAuth: TipAdjustAuthRequest - The request that was passed in for processing is null.");
        }
        else if (request.getPaymentId() == null) {
            this.deviceObserver.onAuthTipAdjusted(ResultCode_1.ResultCode.FAIL, "Invalid Argument.", "In tipAdjustAuth: TipAdjustAuthRequest - The paymentId is required.");
        }
        else if (request.getTipAmount() < 0) {
            this.deviceObserver.onAuthTipAdjusted(ResultCode_1.ResultCode.FAIL, "Request Validation Error", "In tipAdjustAuth: TipAdjustAuthRequest - The request amount cannot be less than zero. Original Request = " + request);
        }
        else {
            this.device.doTipAdjustAuth(request.getOrderId(), request.getPaymentId(), request.getTipAmount());
        }
    };
    CloverConnector.prototype.vaultCard = function (cardEntryMethods) {
        if (this.device == null || !this.isReady) {
            this.deviceObserver.onVaultCardResponse(false, ResultCode_1.ResultCode.ERROR, "Device connection Error", "In vaultCard: The Clover device is not connected.", null);
        }
        else if (!this.merchantInfo.supportsVaultCards) {
            this.deviceObserver.onVaultCardResponse(false, ResultCode_1.ResultCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In vaultCard: VaultCard/Payment Tokens are not enabled for the payment gateway.", null);
        }
        else {
            this.device.doVaultCard(cardEntryMethods !== null ? cardEntryMethods : this.getCardEntryMethods());
        }
    };
    CloverConnector.prototype.voidPayment = function (request) {
        if (this.device == null || !this.isReady) {
            this.deviceObserver.onPaymentVoided(ResultCode_1.ResultCode.ERROR, "Device connection Error", "In voidPayment: VoidPaymentRequest - The Clover device is not connected.");
        }
        else if (request == null) {
            this.deviceObserver.onPaymentVoided(ResultCode_1.ResultCode.FAIL, "Invalid Argument.", "In voidPayment: VoidPaymentRequest - The request that was passed in for processing is null.");
        }
        else if (request.getPaymentId() == null) {
            this.deviceObserver.onPaymentVoided(ResultCode_1.ResultCode.FAIL, "Invalid Argument.", "In voidPayment: VoidPaymentRequest - The paymentId is required.");
        }
        else {
            var payment = new sdk.payments.Payment();
            payment.setId(request.getPaymentId());
            payment.setOrder(new sdk.base.Reference());
            payment.getOrder().setId(request.getOrderId());
            payment.setEmployee(new sdk.base.Reference());
            payment.getEmployee().setId(request.getEmployeeId());
            var reason = sdk.order.VoidReason[request.getVoidReason()];
            this.device.doVoidPayment(payment, reason);
        }
    };
    CloverConnector.prototype.refundPayment = function (request) {
        if (this.device == null || !this.isReady) {
            var prr = new sdk.remotepay.RefundPaymentResponse(false, ResultCode_1.ResultCode.ERROR);
            prr.setRefund(null);
            prr.setReason("Device Connection Error");
            prr.setMessage("In refundPayment: RefundPaymentRequest - The Clover device is not connected.");
            this.deviceObserver.lastPRR = prr;
            this.deviceObserver.onFinishCancel();
        }
        else if (request == null) {
            var prr = new sdk.remotepay.RefundPaymentResponse(false, ResultCode_1.ResultCode.FAIL);
            prr.setRefund(null);
            prr.setReason("Request Validation Error");
            prr.setMessage("In refundPayment: RefundPaymentRequest - The request that was passed in for processing is empty.");
            this.deviceObserver.lastPRR = prr;
            this.deviceObserver.onFinishCancel();
        }
        else if (request.getPaymentId() == null) {
            var prr = new sdk.remotepay.RefundPaymentResponse(false, ResultCode_1.ResultCode.FAIL);
            prr.setRefund(null);
            prr.setReason("Request Validation Error");
            prr.setMessage("In refundPayment: RefundPaymentRequest PaymentID cannot be empty. " + request);
            this.deviceObserver.lastPRR = prr;
            this.deviceObserver.onFinishCancel();
        }
        else if (request.getAmount() <= 0 && !request.isFullRefund()) {
            var prr = new sdk.remotepay.RefundPaymentResponse(false, ResultCode_1.ResultCode.FAIL);
            prr.setRefund(null);
            prr.setReason("Request Validation Error");
            prr.setMessage("In refundPayment: RefundPaymentRequest Amount must be greater than zero when FullRefund is set to false. " + request);
            this.deviceObserver.lastPRR = prr;
            this.deviceObserver.onFinishCancel();
        }
        else {
            this.device.doPaymentRefund(request.getOrderId(), request.getPaymentId(), request.getAmount(), request.isFullRefund());
        }
    };
    CloverConnector.prototype.manualRefund = function (request) {
        this.lastRequest = request;
        if (this.device == null || !this.isReady) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.ERROR, "Device connection Error", "In manualRefund: ManualRefundRequest - The Clover device is not connected.");
        }
        else if (!this.merchantInfo.supportsManualRefunds) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In manualRefund: ManualRefundRequest - Manual Refunds are not enabled for the payment gateway. Original Request = " + request);
        }
        else if (request == null) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.FAIL, "Invalid Argument.", "In manualRefund: ManualRefundRequest - The request that was passed in for processing is null.");
        }
        else if (request.getAmount() <= 0) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.FAIL, "Request Validation Error", "In manualRefund: ManualRefundRequest - The request amount cannot be zero. Original Request = " + request);
        }
        else if (request.getExternalId() == null || request.getExternalId().trim().length() == 0 || request.getExternalId().trim().length() > 32) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.FAIL, "Invalid Argument.", "In manualRefund: ManualRefundRequest - The externalId is invalid. It is required and the max length is 32. Original Request = " + request);
        }
        else if (request.getVaultedCard() !== null && !this.merchantInfo.supportsVaultCards) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In manualRefund: ManualRefundRequest - Vault Card support is not enabled for the payment gateway. Original Request = " + request);
        }
        else {
            var builder = new sdk.remotepay.PayIntent.Builder();
            builder.amount(-Math.abs(request.getAmount()))
                .cardEntryMethods(request.getCardEntryMethods() !== null ? request.getCardEntryMethods() : this.cardEntryMethods)
                .transactionType(sdk.remotepay.PayIntent.TransactionType.PAYMENT.CREDIT)
                .vaultedCard(request.getVaultedCard())
                .externalPaymentId(request.getExternalId());
            if (request.getDisablePrinting() !== null) {
                builder.remotePrint(request.getDisablePrinting());
            }
            if (request.getDisableRestartTransactionOnFail() !== null) {
                builder.disableRestartTransactionWhenFailed(request.getDisableRestartTransactionOnFail());
            }
            var payIntent = builder.build();
            this.device.doTxStart(payIntent, null, true);
        }
    };
    CloverConnector.prototype.retrievePendingPayments = function () {
        if (this.device == null || !this.isReady) {
            this.deviceObserver.onPendingPaymentsResponse(ResultCode_1.ResultCode.ERROR, "Device connection Error", "In retrievePendingPayments: The Clover device is not connected.");
        }
        else {
            this.device.doRetrievePendingPayments();
        }
    };
    CloverConnector.prototype.readCardData = function (request) {
        if (this.device == null || !this.isReady) {
            this.deviceObserver.onReadCardDataResponse(ResultCode_1.ResultCode.ERROR, "Device connection Error", "In readCardData: The Clover device is not connected.");
        }
        else if (request == null) {
            this.deviceObserver.onFinishCancel(ResultCode_1.ResultCode.FAIL, "Invalid Argument.", "In readCardData: ReadCardDataRequest - The request that was passed in for processing is null.");
        }
        else {
            // create pay intent...
            var builder = new sdk.remotemessage.PayIntent.Builder();
            builder.transactionType(sdk.remotepay.PayIntent.TransactionType.DATA);
            builder.cardEntryMethods(request.getCardEntryMethods() !== null ? request.getCardEntryMethods() : this.cardEntryMethods);
            builder.forceSwipePinEntry(request.isForceSwipePinEntry());
            var pi = builder.build();
            this.device.doReadCardData(pi);
        }
    };
    CloverConnector.prototype.closeout = function (request) {
        if (this.device == null || !this.isReady) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In closeout: CloseoutRequest - The Clover device is not connected."));
        }
        else {
            this.device.doCloseout(request.isAllowOpenTabs(), request.getBatchId());
        }
    };
    CloverConnector.prototype.cancel = function () {
        if (this.device == null || !this.isReady) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In cancel: The Clover device is not connected."));
        }
        else {
            this.invokeInputOption(CloverConnector.CANCEL_INPUT_OPTION);
        }
    };
    CloverConnector.prototype.printText = function (messages) {
        if (this.device == null || !this.isReady) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In printText: The Clover device is not connected."));
        }
        else if (messages == null) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In printText: Invalid argument. Null is not allowed."));
        }
        else {
            this.device.doPrintText(messages);
        }
    };
    CloverConnector.prototype.printImage = function (bitmap) {
        if (this.device == null || !this.isReady) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In printImage: The Clover device is not connected."));
        }
        else if (bitmap == null) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In printImage: Invalid argument.  Null is not allowed."));
        }
        else {
            this.device.doPrintImage(bitmap);
        }
    };
    CloverConnector.prototype.printImageFromURL = function (url) {
        if (this.device == null || !this.isReady) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In printImageFromURL: The Clover device is not connected."));
        }
        else if (url == null) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In printImageFromURL: Invalid argument.  Null is not allowed."));
        }
        else {
            this.device.doPrintImage(url);
        }
    };
    CloverConnector.prototype.showMessage = function (message) {
        if (this.device == null || !this.isReady) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In showMessage: The Clover device is not connected."));
        }
        else if (message == null) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In showMessage: Invalid argument.  Null is not allowed."));
        }
        else {
            this.device.doTerminalMessage(message);
        }
    };
    CloverConnector.prototype.showWelcomeScreen = function () {
        if (this.device == null || !this.isReady) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In showWelcomeScreen: The Clover device is not connected."));
        }
        else {
            this.device.doShowWelcomeScreen();
        }
    };
    CloverConnector.prototype.showThankYouScreen = function () {
        if (this.device == null || !this.isReady) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In showThankYouScreen: The Clover device is not connected."));
        }
        else {
            this.device.doShowThankYouScreen();
        }
    };
    CloverConnector.prototype.displayPaymentReceiptOptions = function (orderId, paymentId) {
        if (this.device == null || !this.isReady) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In displayPaymentReceiptOptions: The Clover device is not connected."));
        }
        else if (orderId == null) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In displayPaymentReceiptOptions: Invalid argument.  The orderId cannot be null."));
        }
        else if (paymentId == null) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In displayPaymentReceiptOptions: Invalid argument.  The paymentId cannot be null."));
        }
        else {
            this.device.doShowPaymentReceiptScreen(orderId, paymentId);
        }
    };
    CloverConnector.prototype.openCashDrawer = function (reason) {
        if (this.device == null || !this.isReady) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In displayPaymentReceiptOptions: The Clover device is not connected."));
        }
        else {
            this.device.doOpenCashDrawer(reason);
        }
    };
    CloverConnector.prototype.showDisplayOrder = function (order) {
        if (this.device == null || !this.isReady) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In showDisplayOrder: The Clover device is not connected."));
        }
        else if (order == null) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In showDisplayOrder: Invalid argument.  The order cannot be null."));
        }
        else {
            this.device.doOrderUpdate(order, null);
        }
    };
    CloverConnector.prototype.removeDisplayOrder = function (order) {
        if (this.device == null || !this.isReady) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In removeDisplayOrder: The Clover device is not connected."));
        }
        else if (order == null) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In removeDisplayOrder: Invalid argument.  The order cannot be null."));
        }
        else {
            var dao = new sdk.order.operation.OrderDeletedOperation();
            dao.setId(order.getId());
            this.device.doOrderUpdate(order, dao);
        }
    };
    CloverConnector.prototype.dispose = function () {
        this.broadcaster.clear();
        if (this.device !== null) {
            this.device.dispose();
        }
    };
    CloverConnector.prototype.invokeInputOption = function (io) {
        if (this.device == null || !this.isReady) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In invokeInputOption: The Clover device is not connected."));
        }
        else {
            this.device.doKeyPress(io.keyPress);
        }
    };
    CloverConnector.prototype.resetDevice = function () {
        if (this.device == null || !this.isReady) {
            this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In resetDevice: The Clover device is not connected."));
        }
        else {
            this.device.doResetDevice();
        }
    };
    CloverConnector.prototype.getCardEntryMethods = function () {
        return this.cardEntryMethods;
    };
    return CloverConnector;
}());
CloverConnector.KIOSK_CARD_ENTRY_METHODS = 1 << 15;
CloverConnector.CARD_ENTRY_METHOD_MAG_STRIPE = 1 | 256 | CloverConnector.KIOSK_CARD_ENTRY_METHODS; // 33026
CloverConnector.CARD_ENTRY_METHOD_ICC_CONTACT = 2 | 512 | CloverConnector.KIOSK_CARD_ENTRY_METHODS; // 33282
CloverConnector.CARD_ENTRY_METHOD_NFC_CONTACTLESS = 4 | 1024 | CloverConnector.KIOSK_CARD_ENTRY_METHODS; // 33796
CloverConnector.CARD_ENTRY_METHOD_MANUAL = 8 | 2048 | CloverConnector.KIOSK_CARD_ENTRY_METHODS; // 34824
exports.CloverConnector = CloverConnector;
(function (CloverConnector) {
    var InnerDeviceObserver = (function () {
        function InnerDeviceObserver(cc) {
            // Create a logger
            this.logger = Logger_1.Logger.create();
            this.cloverConnector = cc;
        }
        InnerDeviceObserver.prototype.onTxState = function (txState) {
        };
        InnerDeviceObserver.prototype.onTxStartResponse = function (result, externalId) {
            if (result == sdk.remotemessage.TxStartResponseResult.SUCCESS)
                return;
            var duplicate = (result == sdk.remotemessage.TxStartResponseResult.DUPLICATE);
            var code = duplicate ? ResultCode_1.ResultCode.CANCEL : ResultCode_1.ResultCode.FAIL;
            var message = duplicate ? "The provided transaction id of " + externalId + " has already been processed and cannot be resubmitted." : null;
            try {
                if (this.cloverConnector.lastRequest instanceof sdk.remotepay.PreAuthRequest) {
                    var response = new sdk.remotepay.PreAuthResponse(false, code);
                    response.setReason(result.toString());
                    response.setMessage(message);
                    this.cloverConnector.broadcaster.notifyOnPreAuthResponse(response);
                }
                else if (this.cloverConnector.lastRequest instanceof sdk.remotepay.AuthRequest) {
                    var response = new sdk.remotepay.AuthResponse(false, code);
                    response.setReason(result.toString());
                    response.setMessage(message);
                    this.cloverConnector.broadcaster.notifyOnAuthResponse(response);
                }
                else if (this.cloverConnector.lastRequest instanceof sdk.remotepay.SaleRequest) {
                    var response = new sdk.remotepay.SaleResponse(false, code);
                    response.setReason(result.toString());
                    response.setMessage(message);
                    this.cloverConnector.broadcaster.notifyOnSaleResponse(response);
                }
                else if (this.cloverConnector.lastRequest instanceof sdk.remotepay.ManualRefundRequest) {
                    var response = new sdk.remotepay.ManualRefundResponse(false, code);
                    response.setReason(result.toString());
                    response.setMessage(message);
                    this.cloverConnector.broadcaster.notifyOnManualRefundResponse(response);
                }
            }
            finally {
                this.cloverConnector.lastRequest = null;
            }
        };
        InnerDeviceObserver.prototype.onUiState = function (uiState, uiText, uiDirection, inputOptions) {
            var deviceEvent = new sdk.remotepay.CloverDeviceEvent();
            deviceEvent.setInputOptions(inputOptions);
            deviceEvent.setEventState(sdk.remotepay.DeviceEventState[uiState.toString()]);
            deviceEvent.setMessage(uiText);
            if (uiDirection == sdk.remotemessage.UiState.UiDirection.ENTER) {
                this.cloverConnector.broadcaster.notifyOnDeviceActivityStart(deviceEvent);
            }
            else if (uiDirection == sdk.remotemessage.UiState.UiDirection.EXIT) {
                this.cloverConnector.broadcaster.notifyOnDeviceActivityEnd(deviceEvent);
                if (uiState.toString() == sdk.remotepay.DeviceEventState.RECEIPT_OPTIONS.toString()) {
                    this.cloverConnector.device.doShowWelcomeScreen();
                }
            }
        };
        InnerDeviceObserver.prototype.onTipAdded = function (tip) {
            this.cloverConnector.broadcaster.notifyOnTipAdded(tip);
        };
        InnerDeviceObserver.prototype.onAuthTipAdjusted = function (resultStatusOrPaymentId, reasonOrTipAmount, messageOrSuccess) {
            if (typeof resultStatusOrPaymentId == 'string') {
                if (messageOrSuccess) {
                    this.onAuthTipAdjustedHandler(resultStatusOrPaymentId, reasonOrTipAmount, messageOrSuccess, ResultCode_1.ResultCode.SUCCESS, null, null);
                }
                else {
                    this.onAuthTipAdjustedHandler(resultStatusOrPaymentId, reasonOrTipAmount, messageOrSuccess, ResultCode_1.ResultCode.FAIL, 'Failure', 'TipAdjustAuth failed to process for payment ID: ' + resultStatusOrPaymentId);
                }
            }
            else if (resultStatusOrPaymentId instanceof sdk.remotemessage.ResultStatus) {
                this.onAuthTipAdjusted(resultStatusOrPaymentId == sdk.remotemessage.ResultStatus.SUCCESS ? ResultCode_1.ResultCode.SUCCESS : ResultCode_1.ResultCode.FAIL, reasonOrTipAmount, messageOrSuccess);
            }
            else {
                this.onAuthTipAdjustedHandler(null, 0, false, resultStatusOrPaymentId, reasonOrTipAmount, messageOrSuccess);
            }
        };
        InnerDeviceObserver.prototype.onAuthTipAdjustedHandler = function (paymentId, tipAmount, success, result, reason, message) {
            var taar = new sdk.remotepay.TipAdjustAuthResponse(success, result);
            taar.setPaymentId(paymentId);
            taar.setTipAmount(tipAmount);
            taar.setSuccess(success);
            taar.setResult(result);
            taar.setReason(reason);
            taar.setMessage(message);
            this.cloverConnector.broadcaster.notifyOnTipAdjustAuthResponse(taar);
        };
        InnerDeviceObserver.prototype.onCashbackSelected = function (cashbackAmount) {
            //TODO: For future use
        };
        InnerDeviceObserver.prototype.onPartialAuth = function (partialAmount) {
            //TODO: For future use
        };
        InnerDeviceObserver.prototype.onFinishOk = function (paymentCreditOrRefund, signature) {
            if (paymentCreditOrRefund instanceof sdk.payments.Payment && signature) {
                try {
                    this.cloverConnector.device.doShowThankYouScreen(); //need to do this first, so Listener implementation can replace the screen as desired
                    if (this.cloverConnector.lastRequest instanceof sdk.remotepay.PreAuthRequest) {
                        var response = new sdk.remotepay.PreAuthResponse(true, ResultCode_1.ResultCode.SUCCESS);
                        response.setPayment(paymentCreditOrRefund);
                        response.setSignature(signature);
                        this.cloverConnector.broadcaster.notifyOnPreAuthResponse(response);
                        this.cloverConnector.lastRequest = null;
                    }
                    else if (this.cloverConnector.lastRequest instanceof sdk.remotepay.AuthRequest) {
                        var response = new sdk.remotepay.AuthResponse(true, ResultCode_1.ResultCode.SUCCESS);
                        response.setPayment(paymentCreditOrRefund);
                        response.setSignature(signature);
                        this.cloverConnector.broadcaster.notifyOnAuthResponse(response);
                        this.cloverConnector.lastRequest = null;
                    }
                    else if (this.cloverConnector.lastRequest instanceof sdk.remotepay.SaleRequest) {
                        var response = new sdk.remotepay.SaleResponse(true, ResultCode_1.ResultCode.SUCCESS);
                        response.setPayment(paymentCreditOrRefund);
                        response.setSignature(signature);
                        this.cloverConnector.broadcaster.notifyOnSaleResponse(response);
                        this.cloverConnector.lastRequest = null;
                    }
                    else if (this.cloverConnector.lastRequest == null) {
                        this.cloverConnector.device.doShowWelcomeScreen();
                    }
                    else {
                        this.logger.error("Failed to pair this response: " + paymentCreditOrRefund);
                    }
                }
                finally {
                    // do nothing for now...
                }
            }
            else if (paymentCreditOrRefund instanceof sdk.payments.Credit) {
                try {
                    this.cloverConnector.device.doShowWelcomeScreen();
                    this.cloverConnector.lastRequest = null;
                    var response = new sdk.remotepay.ManualRefundResponse(true, ResultCode_1.ResultCode.SUCCESS);
                    response.setCredit(paymentCreditOrRefund);
                    this.cloverConnector.broadcaster.notifyOnManualRefundResponse(response);
                }
                finally { }
            }
            else {
                try {
                    this.cloverConnector.device.doShowWelcomeScreen();
                    this.cloverConnector.lastRequest = null;
                    var lastRefundResponse = this.lastPRR;
                    this.lastPRR = null;
                    // Since finishOk is the more appropriate/consistent location in the "flow" to
                    // publish the RefundResponse (like SaleResponse, AuthResponse, etc., rather
                    // than after the server call, which calls onPaymetRefund),
                    // we will hold on to the response from
                    // onRefundResponse (Which has more information than just the refund) and publish it here
                    if (lastRefundResponse !== null) {
                        if (lastRefundResponse.getRefund().getId() == paymentCreditOrRefund.getId()) {
                            this.cloverConnector.broadcaster.notifyOnRefundPaymentResponse(lastRefundResponse);
                        }
                        else {
                            this.logger.error("The last PaymentRefundResponse has a different refund than this refund in finishOk");
                        }
                    }
                    else {
                        this.logger.error("Shouldn't get an onFinishOk with having gotten an onPaymentRefund!");
                    }
                }
                finally { }
            }
        };
        InnerDeviceObserver.prototype.onFinishCancel = function (result, reason, message) {
            if (!result) {
                this.onFinishCancel(ResultCode_1.ResultCode.CANCEL, null, null);
                return;
            }
            try {
                this.cloverConnector.device.doShowWelcomeScreen();
                var lastReq = this.cloverConnector.lastRequest;
                this.cloverConnector.lastRequest = null;
                if (lastReq instanceof sdk.remotepay.PreAuthRequest) {
                    var preAuthResponse = new sdk.remotepay.PreAuthResponse(false, result);
                    preAuthResponse.setReason(reason !== null ? reason : "Request Canceled");
                    preAuthResponse.setMessage(message !== null ? message : "The PreAuth Request was canceled.");
                    preAuthResponse.setPayment(null);
                    this.cloverConnector.broadcaster.notifyOnPreAuthResponse(preAuthResponse);
                }
                else if (lastReq instanceof sdk.remotepay.SaleRequest) {
                    var saleResponse = new sdk.remotepay.SaleResponse(false, result);
                    saleResponse.setReason(reason !== null ? reason : "Request Canceled");
                    saleResponse.setMessage(message !== null ? message : "The Sale Request was canceled.");
                    saleResponse.setPayment(null);
                    this.cloverConnector.broadcaster.notifyOnSaleResponse(saleResponse);
                }
                else if (lastReq instanceof sdk.remotepay.AuthRequest) {
                    var authResponse = new sdk.remotepay.AuthResponse(false, result);
                    authResponse.setReason(reason !== null ? reason : "Request Canceled");
                    authResponse.setMessage(message !== null ? message : "The Auth Request was canceled.");
                    authResponse.setPayment(null);
                    this.cloverConnector.broadcaster.notifyOnAuthResponse(authResponse);
                }
                else if (lastReq instanceof sdk.remotepay.ManualRefundRequest) {
                    var refundResponse = new sdk.remotepay.ManualRefundResponse(false, result);
                    refundResponse.setReason(reason !== null ? reason : "Request Canceled");
                    refundResponse.setMessage(message !== null ? message : "The Manual Refund Request was canceled.");
                    refundResponse.setCredit(null);
                    this.cloverConnector.broadcaster.notifyOnManualRefundResponse(refundResponse);
                }
                else if (this.lastPRR instanceof sdk.remotepay.RefundPaymentResponse) {
                    this.cloverConnector.broadcaster.notifyOnRefundPaymentResponse(this.lastPRR);
                    this.lastPRR = null;
                }
            }
            finally {
                // do nothing
            }
        };
        InnerDeviceObserver.prototype.onVerifySignature = function (payment, signature) {
            var request = new InnerDeviceObserver.SVR(this.cloverConnector.device);
            request.setSignature(signature);
            request.setPayment(payment);
            this.cloverConnector.broadcaster.notifyOnVerifySignatureRequest(request);
        };
        InnerDeviceObserver.prototype.onConfirmPayment = function (payment, challenges) {
            var cpr = new sdk.remotepay.ConfirmPaymentRequest();
            cpr.setPayment(payment);
            cpr.setChallenges(challenges);
            this.cloverConnector.broadcaster.notifyOnConfirmPaymentRequest(cpr);
        };
        InnerDeviceObserver.prototype.onPaymentVoided = function (resultStatusOrPayment, reasonOrVoidReason, message) {
            if (resultStatusOrPayment instanceof sdk.remotepay.Payment) {
                this.onPaymentVoidedHandler(resultStatusOrPayment, reasonOrVoidReason, ResultCode_1.ResultCode.SUCCESS, reasonOrVoidReason.toString(), null);
            }
            else if (resultStatusOrPayment instanceof sdk.remotemessage.ResultStatus) {
                this.onPaymentVoided(status == sdk.remotemessage.ResultStatus.SUCCESS ? ResultCode_1.ResultCode.SUCCESS : ResultCode_1.ResultCode.FAIL, reasonOrVoidReason, message);
            }
            else {
                this.onPaymentVoidedHandler(null, reasonOrVoidReason.FAILED, resultStatusOrPayment, reasonOrVoidReason !== null ? reasonOrVoidReason : resultStatusOrPayment.toString(), message !== null ? message : "No extended information provided.");
            }
        };
        InnerDeviceObserver.prototype.onPaymentVoidedHandler = function (payment, voidReason, result, reason, message) {
            var success = (result == ResultCode_1.ResultCode.SUCCESS);
            var response = new sdk.remotepay.VoidPaymentResponse(success, result);
            response.setPaymentId(payment !== null ? payment.getId() : null);
            response.setReason(reason);
            response.setMessage(message);
            this.cloverConnector.broadcaster.notifyOnVoidPaymentResponse(response);
        };
        InnerDeviceObserver.prototype.onKeyPressed = function (keyPress) {
            //TODO: For future use
        };
        InnerDeviceObserver.prototype.onPaymentRefundResponse = function (orderId, paymentId, refund, code) {
            // hold the response for finishOk for the refund. See comments in onFinishOk(Refund)
            var success = (code == sdk.remotemessage.TxState.SUCCESS);
            var prr = new sdk.remotepay.RefundPaymentResponse(success, success ? ResultCode_1.ResultCode.SUCCESS : ResultCode_1.ResultCode.FAIL);
            prr.setOrderId(orderId);
            prr.setPaymentId(paymentId);
            prr.setRefund(refund);
            this.lastPRR = prr; // set this so we have the appropriate information for when onFinish(Refund) is called
        };
        InnerDeviceObserver.prototype.onVaultCardResponse = function (vaultedCardOrSuccess, code, reason, message, vaultedCard) {
            if (vaultedCardOrSuccess instanceof sdk.payments.VaultedCard) {
                var success = (code == ResultCode_1.ResultCode.SUCCESS);
                this.onVaultCardResponse(success, success ? ResultCode_1.ResultCode.SUCCESS : ResultCode_1.ResultCode.FAIL, null, null, vaultedCard);
            }
            else {
                this.cloverConnector.device.doShowWelcomeScreen();
                var vcr = new sdk.remotepay.VaultCardResponse(vaultedCardOrSuccess, code, vaultedCard !== null ? vaultedCard : null);
                vcr.setReason(reason);
                vcr.setMessage(message);
                this.cloverConnector.broadcaster.notifyOnVaultCardRespose(vcr);
            }
        };
        InnerDeviceObserver.prototype.onCapturePreAuth = function (statusOrCode, reason, paymentId, amount, tipAmount) {
            if (statusOrCode instanceof sdk.remotemessage.ResultStatus) {
                var success = (sdk.remotemessage.ResultStatus.SUCCESS == statusOrCode);
                var response = new sdk.remotepay.CapturePreAuthResponse(success, success ? ResultCode_1.ResultCode.SUCCESS : ResultCode_1.ResultCode.FAIL);
                response.setReason(reason);
                response.setPaymentID(paymentId);
                response.setAmount(amount);
                response.setTipAmount(tipAmount);
                this.cloverConnector.broadcaster.notifyOnCapturePreAuth(response);
            }
            else {
                var success = (ResultCode_1.ResultCode.SUCCESS == statusOrCode);
                var response = new sdk.remotepay.CapturePreAuthResponse(success, statusOrCode);
                response.setReason(reason);
                response.setPaymentID(paymentId);
                if (amount !== null) {
                    response.setAmount(amount);
                }
                if (tipAmount !== null) {
                    response.setTipAmount(tipAmount);
                }
                this.cloverConnector.broadcaster.notifyOnCapturePreAuth(response);
            }
        };
        InnerDeviceObserver.prototype.onCloseoutResponse = function (statusOrResult, reason, batchOrMessage) {
            if (statusOrResult instanceof sdk.remotemessage.ResultStatus) {
                this.onCloseoutResponseHandler(batchOrMessage, statusOrResult == sdk.remotemessage.ResultStatus.SUCCESS ? ResultCode_1.ResultCode.SUCCESS : ResultCode_1.ResultCode.FAIL, reason, null);
            }
            else {
                this.onCloseoutResponseHandler(null, statusOrResult, reason, batchOrMessage);
            }
        };
        InnerDeviceObserver.prototype.onCloseoutResponseHandler = function (batch, result, reason, message) {
            var success = (result == ResultCode_1.ResultCode.SUCCESS);
            var cr = new sdk.remotepay.CloseoutResponse(success, result);
            cr.setBatch(batch);
            cr.setReason(reason);
            cr.setMessage(message);
            this.cloverConnector.broadcaster.notifyCloseout(cr);
        };
        InnerDeviceObserver.prototype.onDeviceDisconnected = function () {
            this.logger.debug('Disconnected');
            this.cloverConnector.isReady = false;
            this.cloverConnector.broadcaster.notifyOnDisconnect();
        };
        InnerDeviceObserver.prototype.onDeviceConnected = function () {
            this.logger.debug('Connected');
            this.cloverConnector.isReady = false;
            this.cloverConnector.broadcaster.notifyOnConnect();
        };
        InnerDeviceObserver.prototype.onDeviceReady = function (device, drm) {
            this.logger.debug('Ready');
            this.cloverConnector.isReady = drm.ready;
            var merchantInfo = new sdk.remotepay.MerchantInfo(drm);
            this.cloverConnector.merchantInfo = merchantInfo;
            this.cloverConnector.device.setSupportsAcks(merchantInfo.deviceInfo.supportsAcks);
            if (drm.ready) {
                this.cloverConnector.device.doShowWelcomeScreen();
                this.cloverConnector.broadcaster.notifyOnReady(merchantInfo);
            }
            else {
                this.cloverConnector.broadcaster.notifyOnConnect();
            }
        };
        InnerDeviceObserver.prototype.onDeviceError = function (errorEvent) {
            this.cloverConnector.broadcaster.notifyOnDeviceError(errorEvent);
        };
        // TODO: The Print Message objects are missing from the api
        InnerDeviceObserver.prototype.onPrintRefundPayment = function (payment, order, refund) {
            // this.cloverConnector.broadcaster.notifyOnPrintRefundPaymentReceipt(new PrintRefundPaymentReceiptMessage(payment, order, refund));
        };
        InnerDeviceObserver.prototype.onPrintMerchantReceipt = function (payment) {
            // this.cloverConnector.broadcaster.notifyOnPrintPaymentMerchantCopyReceipt(new PrintPaymentMerchantCopyReceiptMessage(payment));
        };
        InnerDeviceObserver.prototype.onPrintPaymentDecline = function (payment, reason) {
            // this.cloverConnector.broadcaster.notifyOnPrintPaymentDeclineReceipt(new PrintPaymentDeclineReceiptMessage(payment, reason));
        };
        InnerDeviceObserver.prototype.onPrintPayment = function (payment, order) {
            // this.cloverConnector.broadcaster.notifyOnPrintPaymentReceipt(new PrintPaymentReceiptMessage(payment, order));
        };
        InnerDeviceObserver.prototype.onPrintCredit = function (credit) {
            // this.cloverConnector.broadcaster.notifyOnPrintCreditReceipt(new PrintManualRefundReceiptMessage(credit));
        };
        InnerDeviceObserver.prototype.onPrintCreditDecline = function (credit, reason) {
            // this.cloverConnector.broadcaster.notifyOnPrintCreditDeclineReceipt(new PrintManualRefundDeclineReceiptMessage(credit, reason));
        };
        InnerDeviceObserver.prototype.onMessageAck = function (messageId) {
            // TODO: for future use
        };
        InnerDeviceObserver.prototype.onPendingPaymentsResponse = function (resultStatusOrSuccess, pendingPaymentsOrReason, message) {
            if (typeof resultStatusOrSuccess == 'boolean') {
                this.onPendingPaymentsResponseHandler(resultStatusOrSuccess, pendingPaymentsOrReason, ResultCode_1.ResultCode.SUCCESS, null, null);
            }
            else if (resultStatusOrSuccess instanceof sdk.remotemessage.ResultStatus) {
                this.onPendingPaymentsResponse(resultStatusOrSuccess == sdk.remotemessage.ResultStatus.SUCCESS ? ResultCode_1.ResultCode.SUCCESS : ResultCode_1.ResultCode.FAIL, pendingPaymentsOrReason, message);
            }
            else {
                this.cloverConnector.device.doShowWelcomeScreen();
                this.onPendingPaymentsResponseHandler(false, null, resultStatusOrSuccess, pendingPaymentsOrReason, message);
            }
        };
        InnerDeviceObserver.prototype.onPendingPaymentsResponseHandler = function (success, pendingPayments, result, reason, message) {
            var rppr = new sdk.remotepay.RetrievePendingPaymentsResponse(result, message, pendingPayments);
            rppr.setSuccess(success);
            rppr.setReason(reason);
            this.cloverConnector.broadcaster.notifyOnRetrievePendingPaymentResponse(rppr);
        };
        InnerDeviceObserver.prototype.onReadCardResponse = function (status, reason, cardData) {
            var success = (status == sdk.remotemessage.ResultStatus.SUCCESS);
            if (success) {
                var rcdr = new sdk.remotepay.ReadCardDataResponse(success, success ? ResultCode_1.ResultCode.SUCCESS : ResultCode_1.ResultCode.FAIL);
                rcdr.setCardData(cardData);
                this.cloverConnector.device.doShowWelcomeScreen();
                this.cloverConnector.broadcaster.notifyOnReadCardDataResponse(rcdr);
            }
            else if (status == sdk.remotemessage.ResultStatus.CANCEL) {
                this.onReadCardDataResponse(ResultCode_1.ResultCode.CANCEL, reason, '');
            }
            else {
                this.onReadCardDataResponse(ResultCode_1.ResultCode.FAIL, reason, '');
            }
        };
        InnerDeviceObserver.prototype.onReadCardDataResponse = function (result, reason, message) {
            var success = (result == ResultCode_1.ResultCode.SUCCESS);
            this.cloverConnector.device.doShowWelcomeScreen();
            var rcdr = new sdk.remotepay.ReadCardDataResponse(success, result);
            rcdr.setReason(reason);
            rcdr.setMessage(message);
            this.cloverConnector.broadcaster.notifyOnReadCardDataResponse(rcdr);
        };
        return InnerDeviceObserver;
    }());
    CloverConnector.InnerDeviceObserver = InnerDeviceObserver;
    (function (InnerDeviceObserver) {
        var SVR = (function (_super) {
            __extends(SVR, _super);
            function SVR(device) {
                var _this = _super.call(this) || this;
                _this.cloverDevice = device;
                return _this;
            }
            SVR.prototype.accept = function () {
                this.cloverDevice.doSignatureVerified(_super.prototype.getPayment.call(this), true);
            };
            SVR.prototype.reject = function () {
                this.cloverDevice.doSignatureVerified(_super.prototype.getPayment.call(this), false);
            };
            SVR.prototype.setSignature = function (signature) {
                _super.prototype.setSignature.call(this, signature);
            };
            SVR.prototype.setPayment = function (payment) {
                _super.prototype.setPayment.call(this, payment);
            };
            return SVR;
        }(sdk.remotepay.VerifySignatureRequest));
        InnerDeviceObserver.SVR = SVR;
    })(InnerDeviceObserver = CloverConnector.InnerDeviceObserver || (CloverConnector.InnerDeviceObserver = {}));
})(CloverConnector = exports.CloverConnector || (exports.CloverConnector = {}));
exports.CloverConnector = CloverConnector;

//# sourceMappingURL=../../../../maps/com/clover/remote/client/CloverConnector.js.map
