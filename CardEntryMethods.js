/**
 * Method of card entry
 * @constructor
 */
// com.clover.common2.payments.CardEntryMethods
function CardEntryMethods() {}

CardEntryMethods.KIOSK_CARD_ENTRY_METHODS = 1 << 15;

// Note - the 'parseInt' here is used to help clarify the values in use.
// See the com.clover.common2.payments.CardEntryMethods for details
CardEntryMethods.MAG_STRIPE =       parseInt("0001",2) | parseInt("000100000000",2) | CardEntryMethods.KIOSK_CARD_ENTRY_METHODS;
CardEntryMethods.ICC_CONTACT =      parseInt("0010",2) | parseInt("001000000000",2) | CardEntryMethods.KIOSK_CARD_ENTRY_METHODS;
CardEntryMethods.NFC_CONTACTLESS =  parseInt("0100",2) | parseInt("010000000000",2) | CardEntryMethods.KIOSK_CARD_ENTRY_METHODS;
CardEntryMethods.MANUAL =           parseInt("1000",2) | parseInt("100000000000",2) | CardEntryMethods.KIOSK_CARD_ENTRY_METHODS;

CardEntryMethods.DEFAULT = (
  CardEntryMethods.ICC_CONTACT |
  CardEntryMethods.MAG_STRIPE |
  CardEntryMethods.NFC_CONTACTLESS
);

CardEntryMethods.ALL = (
  CardEntryMethods.ICC_CONTACT |
  CardEntryMethods.MAG_STRIPE |
  CardEntryMethods.NFC_CONTACTLESS |
  CardEntryMethods.MANUAL
);

//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = CardEntryMethods;
}
