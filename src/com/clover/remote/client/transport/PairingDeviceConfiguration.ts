export interface PairingDeviceConfiguration {
    onPairingCode(pairingCode: string): void;
    onPairingSuccess(authToken: string): void;
}
