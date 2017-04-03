
export class CardEntryMethods {
    private static KIOSK_CARD_ENTRY_METHODS: number			= 1 << 15;

    public static CARD_ENTRY_METHOD_MAG_STRIPE: number		= 0b0001 | 0b000100000000 | CardEntryMethods.KIOSK_CARD_ENTRY_METHODS; // 33026
    public static CARD_ENTRY_METHOD_ICC_CONTACT: number		= 0b0010 | 0b001000000000 | CardEntryMethods.KIOSK_CARD_ENTRY_METHODS; // 33282
    public static CARD_ENTRY_METHOD_NFC_CONTACTLESS: number	= 0b0100 | 0b010000000000 | CardEntryMethods.KIOSK_CARD_ENTRY_METHODS; // 33796
    public static CARD_ENTRY_METHOD_MANUAL: number			= 0b1000 | 0b100000000000 | CardEntryMethods.KIOSK_CARD_ENTRY_METHODS; // 34824

    public static DEFAULT: number =
        CardEntryMethods.CARD_ENTRY_METHOD_MAG_STRIPE |
        CardEntryMethods.CARD_ENTRY_METHOD_ICC_CONTACT |
        CardEntryMethods.CARD_ENTRY_METHOD_NFC_CONTACTLESS; // | CARD_ENTRY_METHOD_MANUAL;

    public static ALL: number =
        CardEntryMethods.CARD_ENTRY_METHOD_MAG_STRIPE |
        CardEntryMethods.CARD_ENTRY_METHOD_ICC_CONTACT |
        CardEntryMethods.CARD_ENTRY_METHOD_NFC_CONTACTLESS |
        CardEntryMethods.CARD_ENTRY_METHOD_MANUAL;
}