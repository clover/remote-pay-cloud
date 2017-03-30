/**
 * Helper class
 */
export class DeviceContactInfo {

    public deviceId:string;
    public isSilent:boolean;

    constructor(deviceId:string, isSilent:boolean) {
        this.deviceId = deviceId;
        this.isSilent = isSilent
    }
}
