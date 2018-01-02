import * as sdk from "remote-pay-cloud-api";

const create = () => {

    return {
        responseMethods: {
            onDeviceActivityStart: "onDeviceActivityStart",
            onDeviceActivityEnd: "onDeviceActivityEnd",
            onDeviceError: "onDeviceError",
            onPreAuthResponse: "onPreAuthResponse",
            onAuthResponse: "onAuthResponse",
            onTipAdjustAuthResponse: "onTipAdjustAuthResponse",
            onCapturePreAuthResponse: "onCapturePreAuthResponse",
            onCloseoutResponse: "onCloseoutResponse",
            onSaleResponse: "onSaleResponse",
            onManualRefundResponse: "onManualRefundResponse",
            onRefundPaymentResponse: "onRefundPaymentResponse",
            onTipAdded: "onTipAdded",
            onVoidPaymentResponse: "onVoidPaymentResponse",
            onVaultCardResponse: "onVaultCardResponse",
            onPrintJobStatusResponse: "onPrintJobStatusResponse",
            onRetrievePrintersResponse: "onRetrievePrintersResponse",
            onPrintManualRefundReceipt: "onPrintManualRefundReceipt",
            onPrintManualRefundDeclineReceipt: "onPrintManualRefundDeclineReceipt",
            onPrintPaymentReceipt: "onPrintPaymentReceipt",
            onPrintPaymentDeclineReceipt: "onPrintPaymentDeclineReceipt",
            onPrintPaymentMerchantCopyReceipt: "onPrintPaymentMerchantCopyReceipt",
            onPrintRefundPaymentReceipt: "onPrintRefundPaymentReceipt",
            onRetrievePendingPaymentsResponse: "onRetrievePendingPaymentsResponse",
            onReadCardDataResponse: "onReadCardDataResponse",
            onMessageFromActivity: "onMessageFromActivity",
            onCustomActivityResponse: "onCustomActivityResponse",
            onRetrieveDeviceStatusResponse: "onRetrieveDeviceStatusResponse",
            onResetDeviceResponse: "onResetDeviceResponse",
            onRetrievePaymentResponse: "onRetrievePaymentResponse"
        },

        testActionToRemoteCall: {
            "SALE": {
                method: "sale",
                payloadResolver: {
                    type: sdk.remotepay.SaleRequest
                }
            },
            "ACCEPT_SIGNATURE": {
                method: "acceptSignature",
                payloadResolver: {
                    type: sdk.remotepay.VerifySignatureRequest
                }
            },
            "REJECT_SIGNATURE": {
                method: "rejectSignature",
                payloadResolver: {
                    type: sdk.remotepay.VerifySignatureRequest
                }
            },
            "ACCEPT_PAYMENT": {
                method: "acceptPayment",
                payloadResolver: {
                    type: sdk.remotepay.Payment
                }
            },
            "REJECT_PAYMENT": {
                method: "rejectPayment",
                payloadResolver: [{
                    type: sdk.remotepay.Payment,
                    key: "payment"
                }, {
                    type: sdk.base.Challenge,
                    key: "challenge"
                }]
            },
            "AUTH": {
                method: "auth",
                payloadResolver: {
                    type: sdk.remotepay.AuthRequest
                }
            },
            "PREAUTH": {
                method: "preAuth",
                payloadResolver: {
                    type: sdk.remotepay.PreAuthRequest
                }
            },
            "CAPTURE_PREAUTH": {
                method: "capturePreAuth",
                payloadResolver: {
                    type: sdk.remotepay.CapturePreAuthRequest
                }
            },
            "TIP_ADJUST": {
                method: "tipAdjustAuth",
                payloadResolver: {
                    type: sdk.remotepay.TipAdjustAuthRequest
                }
            },
            "VOID_PAYMENT": {
                method: "voidPayment",
                payloadResolver: {
                    type: sdk.remotepay.VoidPaymentRequest
                }
            },
            "REFUND_PAYMENT": {
                method: "refundPayment",
                payloadResolver: {
                    type: sdk.remotepay.RefundPaymentRequest
                }
            },
            "MANUAL_REFUND": {
                method: "manualRefund",
                payloadResolver: {
                    type: sdk.remotepay.ManualRefundRequest
                }
            },
            "VAULT_CARD": {
                method: "vaultCard",
                payloadResolver: {
                    key: "cardEntryMethods"
                }
            },
            "CANCEL": {
                method: "cancel"
            },
            "CLOSEOUT": {
                method: "closeout",
                payloadResolver: {
                    type: sdk.remotepay.CloseoutRequest
                }
            },
            "DISPLAY_RECEIPT_OPTIONS": {
                method: "displayPaymentReceiptOptions"
            },
            "PRINT": {
                method: "print"
            },
            "RETRIEVE_PRINTERS": {
                method: "retrievePrinters",
                payloadResolver: {
                    type: sdk.remotepay.RetrievePrintersRequest
                }
            },
            "RETRIEVE_PRINT_JOB_STATUS": {
                method: "retrievePrintJobStatus",
                payloadResolver: {
                    type: sdk.remotepay.PrintJobStatusRequest
                }
            },
            "OPEN_CASH_DRAWER": {
                method: "openCashDrawer",
                payloadResolver: {
                    type: sdk.remotepay.OpenCashDrawerRequest
                }
            },
            "PRINT_TEXT": {
                method: "printText",
                payloadResolver: (payload) => {
                    return payload["text"] || [];
                }
            },
            "PRINT_IMAGE_URL": {
                method: "printImageFromURL"
            },
            "SHOW_MESSAGE": {
                method: "showMessage"
            },
            "SHOW_WELCOME_SCREEN": {
                method: "showWelcomeScreen"
            },
            "SHOW_THANK_YOU_SCREEN": {
                method: "showThankYouScreen"
            },
            "SHOW_DISPLAY_ORDER": {
                method: "showDisplayOrder",
                payloadResolver: {
                  type: sdk.order.DisplayOrder
                }
            },
            "REMOVE_DISPLAY_ORDER": {
                method: "removeDisplayOrder"
            },
            "INVOKE_INPUT_OPTION": {
                method: "invokeInputOption"
            },
            "RESET": {
                method: "resetDevice"
            },
            "RETRIEVE_PENDING_PAYMENTS": {
                method: "retrievePendingPayments"
            },
            "READ_CARD_DATA": {
                method: "readCardData",
                payloadResolver: {
                    type: sdk.remotepay.ReadCardDataRequest
                }
            },
            "SEND_ACTIVITY_MESSAGE": {
                method: "sendMessageToActivity"
            },
            "START_ACTIVITY": {
                method: "startCustomActivity"
            },
            "DEVICE_STATUS": {
                method: "retrieveDeviceStatus",
                payloadResolver: {
                    type: sdk.remotepay.RetrieveDeviceStatusRequest
                }
            },
            "RETRIEVE_PAYMENT": {
                method: "retrievePayment",
                payloadResolver: {
                    type: sdk.remotepay.RetrievePaymentRequest
                }
            }
        }
    }
};

export {create}