import * as exchangeConstants from "./ExchangeConstants";
import TestContext from "./TestContext";
import {LogLevel, Logger} from "./util/Logger";

const create = (cloverConnector) => {

    const responseMethods = exchangeConstants.create().responseMethods;

    return {

        onDeviceActivityStart: function (event) {
            Logger.log(LogLevel.INFO, `onDeviceActivityStart: ${event}`);
            getCurrentTestExecutor().processDeviceActivityStart(event);
        },

        onDeviceActivityEnd: function (event) {
            Logger.log(LogLevel.INFO, `onDeviceActivityEnd: ${event}`);
            getCurrentTestExecutor().processDeviceActivityEnd(event);
        },

        onDeviceError: function (event) {
            Logger.log(LogLevel.ERROR, event);
        },

        onPreAuthResponse: function (response) {
            getCurrentTestExecutor().processResult(responseMethods.onPreAuthResponse, response);
        },

        onAuthResponse: function (response) {
            getCurrentTestExecutor().processResult(responseMethods.onAuthResponse, response);
        },

        onTipAdjustAuthResponse: function (response) {
            getCurrentTestExecutor().processResult(responseMethods.onTipAdjustAuthResponse, response);
        },

        onCapturePreAuthResponse: function (response) {
            getCurrentTestExecutor().processResult(responseMethods.onCapturePreAuthResponse, response);
        },

        onVerifySignatureRequest: function (request) {
            if (getCurrentTestExecutor().acceptSignature()) {
                cloverConnector.acceptSignature(request);
            } else {
                cloverConnector.rejectSignature(request);
            }
        },

        onConfirmPaymentRequest: function (request) {
            request.challenges.forEach((challenge) => {
                if (!getCurrentTestExecutor().confirmPaymentChallenge(challenge.type)) {
                    cloverConnector.rejectPayment(request.getPayment(), challenge);
                }
            });
            // accept by default
            cloverConnector.acceptPayment(request.getPayment());
        },

        onCloseoutResponse: function (response) {
            getCurrentTestExecutor().processResult(responseMethods.onCloseoutResponse, response);
        },

        onSaleResponse: function (response) {
            getCurrentTestExecutor().processResult(responseMethods.onSaleResponse, response);
        },

        onManualRefundResponse: function (response) {
            getCurrentTestExecutor().processResult(responseMethods.onManualRefundResponse, response);
        },


        onRefundPaymentResponse: function (response) {
            getCurrentTestExecutor().processResult(responseMethods.onRefundPaymentResponse, response);
        },

        onTipAdded: function (message) {
            getCurrentTestExecutor().processResult(responseMethods.onTipAdded, message);
        },

        onVoidPaymentResponse: function (response) {
            getCurrentTestExecutor().processResult(responseMethods.onVoidPaymentResponse, response);
        },

        onDeviceDisconnected: function () {
        },

        onDeviceConnected: function () {
        },

        onVaultCardResponse: function (response) {
            getCurrentTestExecutor().processResult(responseMethods.onVaultCardResponse, response);
        },

        onPrintJobStatusResponse: function (response) {
            getCurrentTestExecutor().processResult(responseMethods.onPrintJobStatusResponse, response);
        },

        onRetrievePrintersResponse: function (response) {
            getCurrentTestExecutor().processResult(responseMethods.onRetrievePrintersResponse, response);
        },

        onPrintManualRefundReceipt: function (message) {
            getCurrentTestExecutor().processResult(responseMethods.onPrintManualRefundReceipt, message);
        },

        onPrintManualRefundDeclineReceipt: function (message) {
            getCurrentTestExecutor().processResult(responseMethods.onPrintManualRefundDeclineReceipt, message);
        },

        onPrintPaymentReceipt: function (message) {
            getCurrentTestExecutor().processResult(responseMethods.onPrintPaymentReceipt, message);
        },

        onPrintPaymentDeclineReceipt: function (message) {
            getCurrentTestExecutor().processResult(responseMethods.onPrintPaymentDeclineReceipt, message);
        },

        onPrintPaymentMerchantCopyReceipt: function (message) {
            getCurrentTestExecutor().processResult(responseMethods.onPrintPaymentMerchantCopyReceipt, message);
        },

        onPrintRefundPaymentReceipt: function (message) {
            getCurrentTestExecutor().processResult(responseMethods.onPrintRefundPaymentReceipt, message);
        },

        onRetrievePendingPaymentsResponse: function (response) {
            getCurrentTestExecutor().processResult(responseMethods.onRetrievePendingPaymentsResponse, response);
        },

        onReadCardDataResponse: function (response) {
            getCurrentTestExecutor().processResult(responseMethods.onReadCardDataResponse, response);
        },

        onMessageFromActivity: function (message) {
            getCurrentTestExecutor().processResult(responseMethods.onMessageFromActivity, message);
        },

        onCustomActivityResponse: function (response) {
            getCurrentTestExecutor().processResult(responseMethods.onCustomActivityResponse, response);
        },

        onRetrieveDeviceStatusResponse: function (response) {
            getCurrentTestExecutor().processResult(responseMethods.onRetrieveDeviceStatusResponse, response);
        },

        onResetDeviceResponse: function (response) {
            getCurrentTestExecutor().processResult(responseMethods.onResetDeviceResponse, response);
        },

        onRetrievePaymentResponse: function (response) {
            getCurrentTestExecutor().processResult(responseMethods.onRetrievePaymentResponse, response);
        }
    }
    
    function getCurrentTestExecutor() {
        Logger.log(LogLevel.info, JSON.stringify(TestContext.getCurrentTestExecutor()));
        let currentTestExecutor = TestContext.getCurrentTestExecutor();
        if (!currentTestExecutor) {
            const message = "A device response has been received before a test executor has been set.";
            currentTestExecutor = {
                processResult: function(result) {
                    Logger.log(LogLevel.info, message);
                },
                processDeviceActivityStart: function(result) {
                    Logger.log(LogLevel.info, message);
                },
                processDeviceActivityEnd: function(result) {
                    Logger.log(LogLevel.info, message);
                }
            }
        }
        return currentTestExecutor;
    }

};

export {create}