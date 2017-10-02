/**
 * Helper class.  Used when sending notifications to a device.
 */
export class DeviceContactInfo {

    public deviceId: string;
    public isSilent: boolean;

    constructor(deviceId: string, isSilent: boolean) {
        this.deviceId = deviceId;
        this.isSilent = isSilent
    }
}
