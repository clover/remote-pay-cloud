var sdk = require("remote-pay-cloud-api");

var remotemessage = sdk.remotemessage;

MethodToMessage = {};

MethodToMessage[remotemessage.Method.ACK] = remotemessage.AcknowledgementMessage;
MethodToMessage[remotemessage.Method.CLOSEOUT_RESPONSE] = remotemessage.CloseoutResponseMessage;
MethodToMessage[remotemessage.Method.CLOSEOUT_REQUEST] = remotemessage.CloseoutRequestMessage;
MethodToMessage[remotemessage.Method.CAPTURE_PREAUTH_RESPONSE] = remotemessage.CapturePreAuthResponseMessage;
MethodToMessage[remotemessage.Method.CAPTURE_PREAUTH] = remotemessage.CapturePreAuthMessage;
MethodToMessage[remotemessage.Method.LAST_MSG_REQUEST] = remotemessage.LastMessageRequestMessage;
MethodToMessage[remotemessage.Method.LAST_MSG_RESPONSE] = remotemessage.LastMessageResponseMessage;
MethodToMessage[remotemessage.Method.TIP_ADJUST] = remotemessage.TipAdjustMessage;
MethodToMessage[remotemessage.Method.TIP_ADJUST_RESPONSE] = remotemessage.TipAdjustResponseMessage;
MethodToMessage[remotemessage.Method.OPEN_CASH_DRAWER] = remotemessage.OpenCashDrawerMessage;
MethodToMessage[remotemessage.Method.SHOW_PAYMENT_RECEIPT_OPTIONS] = remotemessage.ShowPaymentReceiptOptionsMessage;
MethodToMessage[remotemessage.Method.REFUND_RESPONSE] = remotemessage.RefundResponseMessage;
MethodToMessage[remotemessage.Method.REFUND_REQUEST] = remotemessage.RefundRequestMessage;
MethodToMessage[remotemessage.Method.TX_START] = remotemessage.TxStartRequestMessage;
MethodToMessage[remotemessage.Method.TX_START_RESPONSE] = remotemessage.TxStartResponseMessage;
MethodToMessage[remotemessage.Method.KEY_PRESS] = remotemessage.KeyPressMessage;
MethodToMessage[remotemessage.Method.UI_STATE] = remotemessage.UiStateMessage;
MethodToMessage[remotemessage.Method.TX_STATE] = remotemessage.TxStateMessage;
MethodToMessage[remotemessage.Method.FINISH_OK] = remotemessage.FinishOkMessage;
MethodToMessage[remotemessage.Method.FINISH_CANCEL] = remotemessage.FinishCancelMessage;
MethodToMessage[remotemessage.Method.DISCOVERY_REQUEST] = remotemessage.DiscoveryRequestMessage;
MethodToMessage[remotemessage.Method.DISCOVERY_RESPONSE] = remotemessage.DiscoveryResponseMessage;
MethodToMessage[remotemessage.Method.TIP_ADDED] = remotemessage.TipAddedMessage;
MethodToMessage[remotemessage.Method.VERIFY_SIGNATURE] = remotemessage.VerifySignatureMessage;
MethodToMessage[remotemessage.Method.SIGNATURE_VERIFIED] = remotemessage.SignatureVerifiedMessage;
MethodToMessage[remotemessage.Method.PAYMENT_CONFIRMED] = remotemessage.PaymentConfirmedMessage;
MethodToMessage[remotemessage.Method.PAYMENT_REJECTED] = remotemessage.PaymentRejectedMessage;
MethodToMessage[remotemessage.Method.PAYMENT_VOIDED] = remotemessage.PaymentVoidedMessage;
//MethodToMessage[remotemessage.Method.//PRINT_PAYMENT] = remotemessage.;
//MethodToMessage[remotemessage.Method.//REFUND_PRINT_PAYMENT] = remotemessage.;
//MethodToMessage[remotemessage.Method.//PRINT_PAYMENT_MERCHANT_COPY] = remotemessage.;
//MethodToMessage[remotemessage.Method.//PRINT_CREDIT] = remotemessage.;
//MethodToMessage[remotemessage.Method.//PRINT_PAYMENT_DECLINE] = remotemessage.;
//MethodToMessage[remotemessage.Method.//PRINT_CREDIT_DECLINE] = remotemessage.;
MethodToMessage[remotemessage.Method.PRINT_TEXT] = remotemessage.TextPrintMessage;
MethodToMessage[remotemessage.Method.PRINT_IMAGE] = remotemessage.ImagePrintMessage;
MethodToMessage[remotemessage.Method.TERMINAL_MESSAGE] = remotemessage.TerminalMessage;
MethodToMessage[remotemessage.Method.SHOW_WELCOME_SCREEN] = remotemessage.WelcomeMessage;
MethodToMessage[remotemessage.Method.SHOW_THANK_YOU_SCREEN] = remotemessage.ThankYouMessage;
MethodToMessage[remotemessage.Method.SHOW_ORDER_SCREEN] = remotemessage.OrderUpdateMessage;
MethodToMessage[remotemessage.Method.BREAK] = remotemessage.BreakMessage;
MethodToMessage[remotemessage.Method.CASHBACK_SELECTED] = remotemessage.CashbackSelectedMessage;
MethodToMessage[remotemessage.Method.PARTIAL_AUTH] = remotemessage.PartialAuthMessage;
MethodToMessage[remotemessage.Method.VOID_PAYMENT] = remotemessage.VoidPaymentMessage;
MethodToMessage[remotemessage.Method.ORDER_ACTION_ADD_DISCOUNT] = remotemessage.OrderActionAddDiscountMessage;
MethodToMessage[remotemessage.Method.ORDER_ACTION_REMOVE_DISCOUNT] = remotemessage.OrderActionRemoveDiscountMessage;
MethodToMessage[remotemessage.Method.ORDER_ACTION_ADD_LINE_ITEM] = remotemessage.OrderActionAddLineItemMessage;
MethodToMessage[remotemessage.Method.ORDER_ACTION_REMOVE_LINE_ITEM] = remotemessage.OrderActionRemoveLineItemMessage;
MethodToMessage[remotemessage.Method.ORDER_ACTION_RESPONSE] = remotemessage.OrderActionResponseMessage;
MethodToMessage[remotemessage.Method.VAULT_CARD] = remotemessage.VaultCardMessage;
MethodToMessage[remotemessage.Method.VAULT_CARD_RESPONSE] = remotemessage.VaultCardResponseMessage;
MethodToMessage[remotemessage.Method.RETRIEVE_PENDING_PAYMENTS] = remotemessage.RetrievePendingPaymentsMessage;
MethodToMessage[remotemessage.Method.RETRIEVE_PENDING_PAYMENTS_RESPONSE] = remotemessage.RetrievePendingPaymentsResponseMessage;
MethodToMessage[remotemessage.Method.CARD_DATA] = remotemessage.CardDataRequestMessage;
MethodToMessage[remotemessage.Method.CARD_DATA_RESPONSE] = remotemessage.CardDataResponseMessage;
//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = MethodToMessage;
}
