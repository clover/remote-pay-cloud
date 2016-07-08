// Prototype.js required
var remotemessage = require("./remotemessage");

MethodToMessage = {};

MethodToMessage[remotemessage.Method.ACK] = AcknowledgementMessage;
MethodToMessage[remotemessage.Method.CLOSEOUT_RESPONSE] = CloseoutResponseMessage;
MethodToMessage[remotemessage.Method.CLOSEOUT_REQUEST] = CloseoutRequestMessage;
MethodToMessage[remotemessage.Method.CAPTURE_PREAUTH_RESPONSE] = CapturePreAuthResponseMessage;
MethodToMessage[remotemessage.Method.CAPTURE_PREAUTH] = CapturePreAuthMessage;
MethodToMessage[remotemessage.Method.LAST_MSG_REQUEST] = LastMessageRequestMessage;
MethodToMessage[remotemessage.Method.LAST_MSG_RESPONSE] = LastMessageResponseMessage;
MethodToMessage[remotemessage.Method.TIP_ADJUST] = TipAdjustMessage;
MethodToMessage[remotemessage.Method.TIP_ADJUST_RESPONSE] = TipAdjustResponseMessage;
MethodToMessage[remotemessage.Method.OPEN_CASH_DRAWER] = OpenCashDrawerMessage;
MethodToMessage[remotemessage.Method.SHOW_PAYMENT_RECEIPT_OPTIONS] = ShowPaymentReceiptOptionsMessage;
MethodToMessage[remotemessage.Method.REFUND_RESPONSE] = RefundResponseMessage;
MethodToMessage[remotemessage.Method.REFUND_REQUEST] = RefundRequestMessage;
MethodToMessage[remotemessage.Method.TX_START] = TxStartRequestMessage;
MethodToMessage[remotemessage.Method.TX_START_RESPONSE] = TxStartResponseMessage;
MethodToMessage[remotemessage.Method.KEY_PRESS] = KeyPressMessage;
MethodToMessage[remotemessage.Method.UI_STATE] = UiStateMessage;
MethodToMessage[remotemessage.Method.TX_STATE] = TxStateMessage;
MethodToMessage[remotemessage.Method.FINISH_OK] = FinishOkMessage;
MethodToMessage[remotemessage.Method.FINISH_CANCEL] = FinishCancelMessage;
MethodToMessage[remotemessage.Method.DISCOVERY_REQUEST] = DiscoveryRequestMessage;
MethodToMessage[remotemessage.Method.DISCOVERY_RESPONSE] = DiscoveryResponseMessage;
MethodToMessage[remotemessage.Method.TIP_ADDED] = TipAddedMessage;
MethodToMessage[remotemessage.Method.VERIFY_SIGNATURE] = VerifySignatureMessage;
MethodToMessage[remotemessage.Method.SIGNATURE_VERIFIED] = SignatureVerifiedMessage;
MethodToMessage[remotemessage.Method.PAYMENT_CONFIRMED] = PaymentConfirmedMessage;
MethodToMessage[remotemessage.Method.PAYMENT_REJECTED] = PaymentRejectedMessage;
MethodToMessage[remotemessage.Method.PAYMENT_VOIDED] = PaymentVoidedMessage;
//MethodToMessage[remotemessage.Method.//PRINT_PAYMENT] = ;
//MethodToMessage[remotemessage.Method.//REFUND_PRINT_PAYMENT] = ;
//MethodToMessage[remotemessage.Method.//PRINT_PAYMENT_MERCHANT_COPY] = ;
//MethodToMessage[remotemessage.Method.//PRINT_CREDIT] = ;
//MethodToMessage[remotemessage.Method.//PRINT_PAYMENT_DECLINE] = ;
//MethodToMessage[remotemessage.Method.//PRINT_CREDIT_DECLINE] = ;
MethodToMessage[remotemessage.Method.PRINT_TEXT] = TextPrintMessage;
MethodToMessage[remotemessage.Method.PRINT_IMAGE] = ImagePrintMessage;
MethodToMessage[remotemessage.Method.TERMINAL_MESSAGE] = TerminalMessage;
MethodToMessage[remotemessage.Method.SHOW_WELCOME_SCREEN] = WelcomeMessage;
MethodToMessage[remotemessage.Method.SHOW_THANK_YOU_SCREEN] = ThankYouMessage;
MethodToMessage[remotemessage.Method.SHOW_ORDER_SCREEN] = OrderUpdateMessage;
MethodToMessage[remotemessage.Method.BREAK] = BreakMessage;
MethodToMessage[remotemessage.Method.CASHBACK_SELECTED] = CashbackSelectedMessage;
MethodToMessage[remotemessage.Method.PARTIAL_AUTH] = PartialAuthMessage;
MethodToMessage[remotemessage.Method.VOID_PAYMENT] = VoidPaymentMessage;
MethodToMessage[remotemessage.Method.ORDER_ACTION_ADD_DISCOUNT] = OrderActionAddDiscountMessage;
MethodToMessage[remotemessage.Method.ORDER_ACTION_REMOVE_DISCOUNT] = OrderActionRemoveDiscountMessage;
MethodToMessage[remotemessage.Method.ORDER_ACTION_ADD_LINE_ITEM] = OrderActionAddLineItemMessage;
MethodToMessage[remotemessage.Method.ORDER_ACTION_REMOVE_LINE_ITEM] = OrderActionRemoveLineItemMessage;
MethodToMessage[remotemessage.Method.ORDER_ACTION_RESPONSE] = OrderActionResponseMessage;
MethodToMessage[remotemessage.Method.VAULT_CARD] = VaultCardMessage;
MethodToMessage[remotemessage.Method.VAULT_CARD_RESPONSE] = VaultCardResponseMessage;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = MethodToMessage;
}
