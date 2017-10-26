import {remotemessage} from 'remote-pay-cloud-api';

/**
 * Maps constant message types to specific message class types.
 *
 */
export class MethodToMessage {

    private static methodToType = null;

    static getType(method: string): any {
        if (MethodToMessage.methodToType == null) {
            MethodToMessage.initialize();
        }
        return MethodToMessage.methodToType[method];
    }

    static initialize(): any {
        MethodToMessage.methodToType = {};
        MethodToMessage.methodToType[remotemessage.Method.ACK] = remotemessage.AcknowledgementMessage;
        MethodToMessage.methodToType[remotemessage.Method.CLOSEOUT_RESPONSE] = remotemessage.CloseoutResponseMessage;
        MethodToMessage.methodToType[remotemessage.Method.CLOSEOUT_REQUEST] = remotemessage.CloseoutRequestMessage;
        MethodToMessage.methodToType[remotemessage.Method.CAPTURE_PREAUTH_RESPONSE] = remotemessage.CapturePreAuthResponseMessage;
        MethodToMessage.methodToType[remotemessage.Method.CAPTURE_PREAUTH] = remotemessage.CapturePreAuthMessage;
        MethodToMessage.methodToType[remotemessage.Method.CONFIRM_PAYMENT_MESSAGE] = remotemessage.ConfirmPaymentMessage;
        MethodToMessage.methodToType[remotemessage.Method.LAST_MSG_REQUEST] = remotemessage.LastMessageRequestMessage;
        MethodToMessage.methodToType[remotemessage.Method.LAST_MSG_RESPONSE] = remotemessage.LastMessageResponseMessage;
        MethodToMessage.methodToType[remotemessage.Method.TIP_ADJUST] = remotemessage.TipAdjustMessage;
        MethodToMessage.methodToType[remotemessage.Method.TIP_ADJUST_RESPONSE] = remotemessage.TipAdjustResponseMessage;
        MethodToMessage.methodToType[remotemessage.Method.OPEN_CASH_DRAWER] = remotemessage.OpenCashDrawerMessage;
        MethodToMessage.methodToType[remotemessage.Method.SHOW_PAYMENT_RECEIPT_OPTIONS] = remotemessage.ShowPaymentReceiptOptionsMessage;
        MethodToMessage.methodToType[remotemessage.Method.REFUND_RESPONSE] = remotemessage.RefundResponseMessage;
        MethodToMessage.methodToType[remotemessage.Method.REFUND_REQUEST] = remotemessage.RefundRequestMessage;
        MethodToMessage.methodToType[remotemessage.Method.TX_START] = remotemessage.TxStartRequestMessage;
        MethodToMessage.methodToType[remotemessage.Method.TX_START_RESPONSE] = remotemessage.TxStartResponseMessage;
        MethodToMessage.methodToType[remotemessage.Method.KEY_PRESS] = remotemessage.KeyPressMessage;
        MethodToMessage.methodToType[remotemessage.Method.UI_STATE] = remotemessage.UiStateMessage;
        MethodToMessage.methodToType[remotemessage.Method.TX_STATE] = remotemessage.TxStateMessage;
        MethodToMessage.methodToType[remotemessage.Method.FINISH_OK] = remotemessage.FinishOkMessage;
        MethodToMessage.methodToType[remotemessage.Method.FINISH_CANCEL] = remotemessage.FinishCancelMessage;
        MethodToMessage.methodToType[remotemessage.Method.DISCOVERY_REQUEST] = remotemessage.DiscoveryRequestMessage;
        MethodToMessage.methodToType[remotemessage.Method.DISCOVERY_RESPONSE] = remotemessage.DiscoveryResponseMessage;
        MethodToMessage.methodToType[remotemessage.Method.TIP_ADDED] = remotemessage.TipAddedMessage;
        MethodToMessage.methodToType[remotemessage.Method.VERIFY_SIGNATURE] = remotemessage.VerifySignatureMessage;
        MethodToMessage.methodToType[remotemessage.Method.SIGNATURE_VERIFIED] = remotemessage.SignatureVerifiedMessage;
        MethodToMessage.methodToType[remotemessage.Method.PAYMENT_CONFIRMED] = remotemessage.PaymentConfirmedMessage;
        MethodToMessage.methodToType[remotemessage.Method.PAYMENT_REJECTED] = remotemessage.PaymentRejectedMessage;
        MethodToMessage.methodToType[remotemessage.Method.PAYMENT_VOIDED] = remotemessage.PaymentVoidedMessage;
        //MethodToMessage.methodToType[remotemessage.Method.//PRINT_PAYMENT] = remotemessage.;
        //MethodToMessage.methodToType[remotemessage.Method.//REFUND_PRINT_PAYMENT] = remotemessage.;
        //MethodToMessage.methodToType[remotemessage.Method.//PRINT_PAYMENT_MERCHANT_COPY] = remotemessage.;
        //MethodToMessage.methodToType[remotemessage.Method.//PRINT_CREDIT] = remotemessage.;
        //MethodToMessage.methodToType[remotemessage.Method.//PRINT_PAYMENT_DECLINE] = remotemessage.;
        //MethodToMessage.methodToType[remotemessage.Method.//PRINT_CREDIT_DECLINE] = remotemessage.;
        MethodToMessage.methodToType[remotemessage.Method.PRINT_TEXT] = remotemessage.TextPrintMessage;
        MethodToMessage.methodToType[remotemessage.Method.PRINT_IMAGE] = remotemessage.ImagePrintMessage;
        MethodToMessage.methodToType[remotemessage.Method.TERMINAL_MESSAGE] = remotemessage.TerminalMessage;
        MethodToMessage.methodToType[remotemessage.Method.SHOW_WELCOME_SCREEN] = remotemessage.WelcomeMessage;
        MethodToMessage.methodToType[remotemessage.Method.SHOW_THANK_YOU_SCREEN] = remotemessage.ThankYouMessage;
        MethodToMessage.methodToType[remotemessage.Method.SHOW_ORDER_SCREEN] = remotemessage.OrderUpdateMessage;
        MethodToMessage.methodToType[remotemessage.Method.BREAK] = remotemessage.BreakMessage;
        MethodToMessage.methodToType[remotemessage.Method.CASHBACK_SELECTED] = remotemessage.CashbackSelectedMessage;
        MethodToMessage.methodToType[remotemessage.Method.PARTIAL_AUTH] = remotemessage.PartialAuthMessage;
        MethodToMessage.methodToType[remotemessage.Method.VOID_PAYMENT] = remotemessage.VoidPaymentMessage;
        MethodToMessage.methodToType[remotemessage.Method.ORDER_ACTION_ADD_DISCOUNT] = remotemessage.OrderActionAddDiscountMessage;
        MethodToMessage.methodToType[remotemessage.Method.ORDER_ACTION_REMOVE_DISCOUNT] = remotemessage.OrderActionRemoveDiscountMessage;
        MethodToMessage.methodToType[remotemessage.Method.ORDER_ACTION_ADD_LINE_ITEM] = remotemessage.OrderActionAddLineItemMessage;
        MethodToMessage.methodToType[remotemessage.Method.ORDER_ACTION_REMOVE_LINE_ITEM] = remotemessage.OrderActionRemoveLineItemMessage;
        MethodToMessage.methodToType[remotemessage.Method.ORDER_ACTION_RESPONSE] = remotemessage.OrderActionResponseMessage;
        MethodToMessage.methodToType[remotemessage.Method.VAULT_CARD] = remotemessage.VaultCardMessage;
        MethodToMessage.methodToType[remotemessage.Method.VAULT_CARD_RESPONSE] = remotemessage.VaultCardResponseMessage;
        MethodToMessage.methodToType[remotemessage.Method.LOG_MESSAGE] = remotemessage.LogMessage;
        MethodToMessage.methodToType[remotemessage.Method.RETRIEVE_PENDING_PAYMENTS] = remotemessage.RetrievePendingPaymentsMessage;
        MethodToMessage.methodToType[remotemessage.Method.RETRIEVE_PENDING_PAYMENTS_RESPONSE] = remotemessage.RetrievePendingPaymentsResponseMessage;
        MethodToMessage.methodToType[remotemessage.Method.CARD_DATA] = remotemessage.CardDataRequestMessage;
        MethodToMessage.methodToType[remotemessage.Method.CARD_DATA_RESPONSE] = remotemessage.CardDataResponseMessage;
        MethodToMessage.methodToType[remotemessage.Method.PAIRING_REQUEST] = remotemessage.PairingRequestMessage;
        MethodToMessage.methodToType[remotemessage.Method.PAIRING_RESPONSE] = remotemessage.PairingResponseMessage;
        MethodToMessage.methodToType[remotemessage.Method.PAIRING_CODE] = remotemessage.PairingCodeMessage;
        MethodToMessage.methodToType[remotemessage.Method.REMOTE_ERROR] = remotemessage.RemoteError;
        MethodToMessage.methodToType[remotemessage.Method.ACTIVITY_REQUEST] = remotemessage.ActivityRequest;
        MethodToMessage.methodToType[remotemessage.Method.ACTIVITY_RESPONSE] = remotemessage.ActivityResponseMessage;
        MethodToMessage.methodToType[remotemessage.Method.SHUTDOWN] = remotemessage.ShutDownMessage;
        MethodToMessage.methodToType[remotemessage.Method.RESET] = remotemessage.ResetMessage;
        MethodToMessage.methodToType[remotemessage.Method.FORCECONNECT] = remotemessage.ForceConnectMessage;
        MethodToMessage.methodToType[remotemessage.Method.RETRIEVE_DEVICE_STATUS_REQUEST] = remotemessage.RetrieveDeviceStatusRequestMessage;
        MethodToMessage.methodToType[remotemessage.Method.RETRIEVE_DEVICE_STATUS_RESPONSE] = remotemessage.RetrieveDeviceStatusResponseMessage;
        MethodToMessage.methodToType[remotemessage.Method.RESET_DEVICE_RESPONSE] = remotemessage.ResetDeviceResponseMessage;
        MethodToMessage.methodToType[remotemessage.Method.ACTIVITY_MESSAGE_TO_ACTIVITY] = remotemessage.ActivityMessageToActivity;
        MethodToMessage.methodToType[remotemessage.Method.ACTIVITY_MESSAGE_FROM_ACTIVITY] = remotemessage.ActivityMessageFromActivity;
        MethodToMessage.methodToType[remotemessage.Method.RETRIEVE_PAYMENT_RESPONSE] = remotemessage.RetrievePaymentResponseMessage;
        MethodToMessage.methodToType[remotemessage.Method.RETRIEVE_PAYMENT_REQUEST] = remotemessage.RetrievePaymentRequestMessage;
        MethodToMessage.methodToType[remotemessage.Method.GET_PRINTERS_REQUEST] = remotemessage.GetPrintersRequestMessage;
        MethodToMessage.methodToType[remotemessage.Method.GET_PRINTERS_RESPONSE] = remotemessage.GetPrintersResponseMessage;
        MethodToMessage.methodToType[remotemessage.Method.PRINT_JOB_STATUS_REQUEST] = remotemessage.PrintJobStatusRequestMessage;
        MethodToMessage.methodToType[remotemessage.Method.PRINT_JOB_STATUS_RESPONSE] = remotemessage.PrintJobStatusResponseMessage;
    }
}
