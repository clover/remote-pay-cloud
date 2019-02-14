export class LoyaltyDataTypes {

    static VAS_TYPE: string = "VAS";
    static EMAIL_TYPE: string = "EMAIL";
    static PHONE_TYPE: string = "PHONE";
    static CLEAR_TYPE: string = "CLEAR";

    static dataTypes: Array<string> = new Array<string>(3);

    public isSystemLimitedType(type: string): boolean {
        return (LoyaltyDataTypes.VAS_TYPE === type || LoyaltyDataTypes.EMAIL_TYPE === type || LoyaltyDataTypes.PHONE_TYPE === type || LoyaltyDataTypes.CLEAR_TYPE === type);
    }

    public isCustomListedType(type: string): boolean{
        return LoyaltyDataTypes.dataTypes.indexOf(type) != -1;
    }

    public isListedType(type: string): boolean {
        return this.isSystemLimitedType(type) ||this.isCustomListedType(type);
    }

    public addListedType(type: string): boolean {
        if(!this.isListedType(type)){
            LoyaltyDataTypes.dataTypes.push(type);
            return true;
        }
        return false;
    }

    public removeListedType(type: string): boolean {
        if(!this.isListedType(type)){
            LoyaltyDataTypes.dataTypes.splice(LoyaltyDataTypes.dataTypes.indexOf(type), 1 );
            return true;
        }
        return false;
    }

    static VAS_TYPE_KEYS  = class {
        static PUSH_URL: string = "PUSH_URL";
        static PROTOCOL_CONFIG: string = "PROTOCOL_CONFIG";
        static PROTOCOL_ID: string = "PROTOCOL_ID";
        static PROVIDER_PACKAGE: string = "PROVIDER_PACKAGE";
        static PUSH_TITLE: string = "PUSH_TITLE";
        static SUPPORTED_SERVICES: string = "SUPPORTED_SERVICES";
    }

}