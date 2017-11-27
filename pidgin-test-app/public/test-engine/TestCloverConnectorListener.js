import * as exchangeConstants from "./ExchangeConstants";

const create = (cloverConnector) => {

    var cloverConnector = cloverConnector;
    var testExecutor = null;
    var responseMethods = exchangeConstants.create().responseMethods;
    
    return {
        setTestExecutor: function (testExecutorIn) {
            testExecutor = testExecutorIn;
        },

        onDeviceActivityStart: function (event) {
            testExecutor.processDeviceEvent(event);
            testExecutor.processResult(responseMethods.onDeviceActivityStart, event);
        },

        onDeviceActivityEnd: function (event) {
            testExecutor.processResult(responseMethods.onDeviceActivityEnd, event);
        },

        onDeviceError: function (event) {
            testExecutor.processResult(responseMethods.onDeviceError, event);
        },

        onPreAuthResponse: function (response) {
            testExecutor.processResult(responseMethods.onPreAuthResponse, response);
        },

        onAuthResponse: function (response) {
            testExecutor.processResult(responseMethods.onAuthResponse, response);
        },

        onTipAdjustAuthResponse: function (response) {
            testExecutor.processResult(responseMethods.onTipAdjustAuthResponse, response);
        },

        onCapturePreAuthResponse: function (response) {
            testExecutor.processResult(responseMethods.onCapturePreAuthResponse, response);
        },

        onVerifySignatureRequest: function (request) {
            if (testExecutor.acceptSignature()) {
                cloverConnector.acceptSignature(request);
            } else {
                cloverConnector.rejectSignature(request);
            }
        },

        onConfirmPaymentRequest: function (request) {
            request.challenges.forEach((challenge) => {
                if (!testExecutor.confirmPaymentChallenge(challenge.type)) {
                    cloverConnector.rejectPayment(request.getPayment(), challenge);
                    return;
                }
            });
            // accept by default
            cloverConnector.acceptPayment(request.getPayment());
        },

        onCloseoutResponse: function (response) {
            testExecutor.processResult(responseMethods.onCloseoutResponse, response);
        },

        onSaleResponse: function (response) {
            testExecutor.processResult(responseMethods.onSaleResponse, response);
        },

        onManualRefundResponse: function (response) {
            testExecutor.processResult(responseMethods.onManualRefundResponse, response);
        },


        onRefundPaymentResponse: function (response) {
            testExecutor.processResult(responseMethods.onRefundPaymentResponse, response);
        },

        onTipAdded: function (message) {
            testExecutor.processResult(responseMethods.onTipAdded, message);
        },

        onVoidPaymentResponse: function (response) {
            testExecutor.processResult(responseMethods.onVoidPaymentResponse, response);
        },

        onDeviceDisconnected: function () {
        },

        onDeviceConnected: function () {
        },

        onDeviceReady: function (merchantInfo) {
        },

        onVaultCardResponse: function (response) {
            testExecutor.processResult(responseMethods.onVaultCardResponse, response);
        },

        onPrintJobStatusResponse: function (response) {
            testExecutor.processResult(responseMethods.onPrintJobStatusResponse, response);
        },

        onRetrievePrintersResponse: function (response) {
            testExecutor.processResult(responseMethods.onRetrievePrintersResponse, response);
        },

        onPrintManualRefundReceipt: function (message) {
            testExecutor.processResult(responseMethods.onPrintManualRefundReceipt, message);
        },

        onPrintManualRefundDeclineReceipt: function (message) {
            testExecutor.processResult(responseMethods.onPrintManualRefundDeclineReceipt, message);
        },

        onPrintPaymentReceipt: function (message) {
            testExecutor.processResult(responseMethods.onPrintPaymentReceipt, message);
        },

        onPrintPaymentDeclineReceipt: function (message) {
            testExecutor.processResult(responseMethods.onPrintPaymentDeclineReceipt, message);
        },

        onPrintPaymentMerchantCopyReceipt: function (message) {
            testExecutor.processResult(responseMethods.onPrintPaymentMerchantCopyReceipt, message);
        },

        onPrintRefundPaymentReceipt: function (message) {
            testExecutor.processResult(responseMethods.onPrintRefundPaymentReceipt, message);
        },

        onRetrievePendingPaymentsResponse: function (response) {
            testExecutor.processResult(responseMethods.onRetrievePendingPaymentsResponse, response);
        },

        onReadCardDataResponse: function (response) {
            testExecutor.processResult(responseMethods.onReadCardDataResponse, response);
        },

        onMessageFromActivity: function (message) {
            testExecutor.processResult(responseMethods.onMessageFromActivity, message);
        },

        onCustomActivityResponse: function (response) {
            testExecutor.processResult(responseMethods.onCustomActivityResponse, response);
        },

        onRetrieveDeviceStatusResponse: function (response) {
            testExecutor.processResult(responseMethods.onRetrieveDeviceStatusResponse, response);
        },

        onResetDeviceResponse: function (response) {
            testExecutor.processResult(responseMethods.onResetDeviceResponse, response);
        },

        onRetrievePaymentResponse: function (response) {
            testExecutor.processResult(responseMethods.onRetrievePaymentResponse, response);
        }
    }
};

export {create}