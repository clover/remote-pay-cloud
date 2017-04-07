/**
 * For connections that require a pairing flow, this interface is used.
 */
export interface PairingDeviceConfiguration {

    /**
     * Called when a pairing code is sent.  Typically, this would be displayed to the user, and
     * they would enter this code into the device screen.
     * @param pairingCode - the string code to be displayed.
     */
    onPairingCode(pairingCode: string): void;

    /**
     * When the pairing process is complete, a authentication token is sent that be reused.
     *
     * @param authToken - the authentication code that can be reused to avoid redisplay of a pairing code.
     */
    onPairingSuccess(authToken: string): void;
}
