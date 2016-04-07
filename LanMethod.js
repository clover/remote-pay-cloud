
/**
 * The set of messages understood by the clover device
 *
 * @see com.clover.remote.protocol.LanMethod (java API)
 * @constructor
 */
function LanMethod() {
}
/** The transaction start method type */
LanMethod.TX_START = "TX_START";
/** The key pressed method type */
LanMethod.KEY_PRESS = "KEY_PRESS";
/** The user interface state change method type */
LanMethod.UI_STATE = "UI_STATE";
/** The transaction state change method type */
LanMethod.TX_STATE = "TX_STATE";
/** The finish ok method type */
LanMethod.FINISH_OK = "FINISH_OK";
/** The finish cancel method type */
LanMethod.FINISH_CANCEL = "FINISH_CANCEL";
/** The discovery request method type */
LanMethod.DISCOVERY_REQUEST = "DISCOVERY_REQUEST";
/** The discovery response method type */
LanMethod.DISCOVERY_RESPONSE = "DISCOVERY_RESPONSE";
/** The tip added method type */
LanMethod.TIP_ADDED = "TIP_ADDED";
/** The verify signature request method type */
LanMethod.VERIFY_SIGNATURE = "VERIFY_SIGNATURE";
/** The signature verification result method type */
LanMethod.SIGNATURE_VERIFIED = "SIGNATURE_VERIFIED";
/** The payment voided method type */
LanMethod.PAYMENT_VOIDED = "PAYMENT_VOIDED";
/** The print payment request method type */
LanMethod.PRINT_PAYMENT = "PRINT_PAYMENT";
/** The print merchant payment copy method type */
LanMethod.PRINT_PAYMENT_MERCHANT_COPY = "PRINT_PAYMENT_MERCHANT_COPY";
/** The print credit method type */
LanMethod.PRINT_CREDIT = "PRINT_CREDIT";
/** The print payment declined method type */
LanMethod.PRINT_PAYMENT_DECLINE = "PRINT_PAYMENT_DECLINE";
/** The print credit declined method type */
LanMethod.PRINT_CREDIT_DECLINE = "PRINT_CREDIT_DECLINE";
/** The print text method type */
LanMethod.PRINT_TEXT = "PRINT_TEXT";
/** The print image method type */
LanMethod.PRINT_IMAGE = "PRINT_IMAGE";
/** The terminal message method type */
LanMethod.TERMINAL_MESSAGE = "TERMINAL_MESSAGE";
/** The show welcome screen method type */
LanMethod.SHOW_WELCOME_SCREEN = "SHOW_WELCOME_SCREEN";
/** The show thank you screen method type */
LanMethod.SHOW_THANK_YOU_SCREEN = "SHOW_THANK_YOU_SCREEN";
/** The show order screen method type */
LanMethod.SHOW_ORDER_SCREEN = "SHOW_ORDER_SCREEN";
/** The break method type */
LanMethod.BREAK = "BREAK";
/** The void payment method type */
LanMethod.VOID_PAYMENT = "VOID_PAYMENT";
/** The refund request method type */
LanMethod.REFUND_REQUEST = "REFUND_REQUEST";
/** The refund response method type */
LanMethod.REFUND_RESPONSE = "REFUND_RESPONSE";
/** THE OPTIONTYPE TO SHOW THE PAYMENT RECEIPT SCREEN */
LanMethod.SHOW_PAYMENT_RECEIPT_OPTIONS = "SHOW_PAYMENT_RECEIPT_OPTIONS";
/** The type to open the cash drawer */
LanMethod.OPEN_CASH_DRAWER = "OPEN_CASH_DRAWER";
/** The tip adjust request method type */
LanMethod.TIP_ADJUST = "TIP_ADJUST";
/** The tip adjust request method type */
LanMethod.TIP_ADJUST_RESPONSE = "TIP_ADJUST_RESPONSE";
/** The message type for a refund print message */
LanMethod.REFUND_PRINT_PAYMENT = "REFUND_PRINT_PAYMENT";
/** Message returned when request for last message is sent */
LanMethod.LAST_MSG_RESPONSE = "LAST_MSG_RESPONSE";
/** Message type to get the last message sent/received to/from the device */
LanMethod.LAST_MSG_REQUEST = "LAST_MSG_REQUEST";
/** Message type to capture a pre auth payment */
LanMethod.CAPTURE_PREAUTH = "CAPTURE_PREAUTH";
/** Message type returned to capture a pre auth payment */
LanMethod.CAPTURE_PREAUTH_RESPONSE = "CAPTURE_PREAUTH_RESPONSE";
/** Message type to Request to capture card info */
LanMethod.VAULT_CARD = "VAULT_CARD";
/** Message type to respond to capture card info request */
LanMethod.VAULT_CARD_RESPONSE = "VAULT_CARD_RESPONSE";
/** Message type to request closeout*/
LanMethod.CLOSEOUT_REQUEST = "CLOSEOUT_REQUEST";
/** Message type to respond to closeout request */
LanMethod.CLOSEOUT_RESPONSE = "CLOSEOUT_RESPONSE";

/**
 * The shutdown method type
 * This is a special type only present in the cloud adaptor.
 */
LanMethod.SHUTDOWN = "SHUTDOWN";

/**
 * The acknowledgement method type
 * This is a special type only present in the cloud adaptor.
 */
LanMethod.ACK = "ACK";

/**
 * The acknowledgement method type
 * This is a special type only present in the cloud adaptor.
 */
LanMethod.ERROR = "ERROR";


//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = LanMethod;
}
