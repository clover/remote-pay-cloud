
/**
 * Enumeration of void reason codes
 *
 * @readonly
 * @enum {string}
 */
var VoidReason = {
    USER_CANCEL: "USER_CANCEL",
    TRANSPORT_ERROR: "TRANSPORT_ERROR",
    REJECT_SIGNATURE: "REJECT_SIGNATURE",
    REJECT_PARTIAL_AUTH: "REJECT_PARTIAL_AUTH",
    NOT_APPROVED: "NOT_APPROVED",
    FAILED: "FAILED",
    AUTH_CLOSED_NEW_CARD: "AUTH_CLOSED_NEW_CARD",
    REJECT_DUPLICATE: "REJECT_DUPLICATE"
};


//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = VoidReason;
}
