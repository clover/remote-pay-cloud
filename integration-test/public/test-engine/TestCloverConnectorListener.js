import * as exchangeConstants from "./ExchangeConstants";
import {LogLevel, Logger} from "./util/Logger";

const create = (cloverConnector) => {

    const responseMethods = exchangeConstants.create().responseMethods;
    let actionExecutor = null;

    return {
        setTestExecutor: function (testExecutorIn) {
            actionExecutor = testExecutorIn;
        },

        onDeviceActivityStart: function (event) {
            Logger.log(LogLevel.INFO, `onDeviceActivityStart: ${event}`);
            actionExecutor.processDeviceActivityStart(event);
        },

        onDeviceActivityEnd: function (event) {
            Logger.log(LogLevel.INFO, `onDeviceActivityEnd: ${event}`);
            actionExecutor.processDeviceActivityEnd(event);
        },

        onDeviceError: function (event) {
            Logger.log(LogLevel.ERROR, event);
        },

        onPreAuthResponse: function (response) {
            actionExecutor.processResult(responseMethods.onPreAuthResponse, response);
        },

        onAuthResponse: function (response) {
            actionExecutor.processResult(responseMethods.onAuthResponse, response);
        },

        onTipAdjustAuthResponse: function (response) {
            actionExecutor.processResult(responseMethods.onTipAdjustAuthResponse, response);
        },

        onCapturePreAuthResponse: function (response) {
            actionExecutor.processResult(responseMethods.onCapturePreAuthResponse, response);
        },

        onVerifySignatureRequest: function (request) {
            if (actionExecutor.acceptSignature()) {
                cloverConnector.acceptSignature(request);
            } else {
                cloverConnector.rejectSignature(request);
            }
        },

        onConfirmPaymentRequest: function (request) {
            request.challenges.forEach((challenge) => {
                if (!actionExecutor.confirmPaymentChallenge(challenge.type)) {
                    cloverConnector.rejectPayment(request.getPayment(), challenge);
                }
            });
            // accept by default
            cloverConnector.acceptPayment(request.getPayment());
        },

        onCloseoutResponse: function (response) {
            actionExecutor.processResult(responseMethods.onCloseoutResponse, response);
        },

        onSaleResponse: function (response) {
            actionExecutor.processResult(responseMethods.onSaleResponse, response);
        },

        onManualRefundResponse: function (response) {
            actionExecutor.processResult(responseMethods.onManualRefundResponse, response);
        },


        onRefundPaymentResponse: function (response) {
            actionExecutor.processResult(responseMethods.onRefundPaymentResponse, response);
        },

        onTipAdded: function (message) {
            actionExecutor.processResult(responseMethods.onTipAdded, message);
        },

        onVoidPaymentResponse: function (response) {
            actionExecutor.processResult(responseMethods.onVoidPaymentResponse, response);
        },

        onDeviceDisconnected: function () {
        },

        onDeviceConnected: function () {
        },

        onVaultCardResponse: function (response) {
            actionExecutor.processResult(responseMethods.onVaultCardResponse, response);
        },

        onPrintJobStatusResponse: function (response) {
            actionExecutor.processResult(responseMethods.onPrintJobStatusResponse, response);
        },

        onRetrievePrintersResponse: function (response) {
            actionExecutor.processResult(responseMethods.onRetrievePrintersResponse, response);
        },

        onPrintManualRefundReceipt: function (message) {
            actionExecutor.processResult(responseMethods.onPrintManualRefundReceipt, message);
        },

        onPrintManualRefundDeclineReceipt: function (message) {
            actionExecutor.processResult(responseMethods.onPrintManualRefundDeclineReceipt, message);
        },

        onPrintPaymentReceipt: function (message) {
            actionExecutor.processResult(responseMethods.onPrintPaymentReceipt, message);
        },

        onPrintPaymentDeclineReceipt: function (message) {
            actionExecutor.processResult(responseMethods.onPrintPaymentDeclineReceipt, message);
        },

        onPrintPaymentMerchantCopyReceipt: function (message) {
            actionExecutor.processResult(responseMethods.onPrintPaymentMerchantCopyReceipt, message);
        },

        onPrintRefundPaymentReceipt: function (message) {
            actionExecutor.processResult(responseMethods.onPrintRefundPaymentReceipt, message);
        },

        onRetrievePendingPaymentsResponse: function (response) {
            actionExecutor.processResult(responseMethods.onRetrievePendingPaymentsResponse, response);
        },

        onReadCardDataResponse: function (response) {
            actionExecutor.processResult(responseMethods.onReadCardDataResponse, response);
        },

        onMessageFromActivity: function (message) {
            actionExecutor.processResult(responseMethods.onMessageFromActivity, message);
        },

        onCustomActivityResponse: function (response) {
            actionExecutor.processResult(responseMethods.onCustomActivityResponse, response);
        },

        onRetrieveDeviceStatusResponse: function (response) {
            actionExecutor.processResult(responseMethods.onRetrieveDeviceStatusResponse, response);
        },

        onResetDeviceResponse: function (response) {
            actionExecutor.processResult(responseMethods.onResetDeviceResponse, response);
        },

        onRetrievePaymentResponse: function (response) {
            actionExecutor.processResult(responseMethods.onRetrievePaymentResponse, response);
        }
    }

};

export {create}