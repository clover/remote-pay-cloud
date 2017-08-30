import sdk = require('remote-pay-cloud-api');

/**
 * A default implementation of the ICloverConnectorListener interface.  It
 * can be used to aid in development of a full listener.
 */
export abstract class DefaultCloverConnectorListener implements sdk.remotepay.ICloverConnectorListener {
    protected cloverConnector:sdk.remotepay.ICloverConnector;
    protected merchantInfo:sdk.remotepay.MerchantInfo;
    private ready:boolean = false;

    constructor(cloverConnector:sdk.remotepay.ICloverConnector) {
        this.cloverConnector = cloverConnector;
    }

    public isReady():boolean {
        return this.ready;
    }

    public onDeviceDisconnected():void {
        this.ready = false;
    }

    public onDeviceConnected():void {
        this.ready = false;
    }

    public onDeviceReady(merchantInfo:sdk.remotepay.MerchantInfo):void {
        this.ready = true;
        this.merchantInfo = merchantInfo;
    }

    public onDeviceActivityStart(deviceEvent:sdk.remotepay.CloverDeviceEvent):void {
    }

    public onDeviceActivityEnd(deviceEvent:sdk.remotepay.CloverDeviceEvent):void {
    }

    public onDeviceError(deviceErrorEvent:sdk.remotepay.CloverDeviceErrorEvent):void {
    }

    public onAuthResponse(response:sdk.remotepay.AuthResponse):void {
    }

    public onTipAdjustAuthResponse(response:sdk.remotepay.TipAdjustAuthResponse):void {
    }

    public onCapturePreAuthResponse(response:sdk.remotepay.CapturePreAuthResponse):void {
    }

    public onVerifySignatureRequest(request:sdk.remotepay.VerifySignatureRequest):void {
        if (this.cloverConnector !== null) {
            this.cloverConnector.acceptSignature(request);
        }
    }

    public abstract onConfirmPaymentRequest(request:sdk.remotepay.ConfirmPaymentRequest):void;

    public onCloseoutResponse(response:sdk.remotepay.CloseoutResponse):void {
    }

    public onSaleResponse(response:sdk.remotepay.SaleResponse):void {
    }

    public onPreAuthResponse(response:sdk.remotepay.PreAuthResponse):void {
    }

    public onManualRefundResponse(response:sdk.remotepay.ManualRefundResponse):void {
    }

    public onRefundPaymentResponse(response:sdk.remotepay.RefundPaymentResponse):void {
    }

    public onTipAdded(message:sdk.remotemessage.TipAddedMessage):void {
    }

    public onVoidPaymentResponse(response:sdk.remotepay.VoidPaymentResponse):void {
    }

    public onVaultCardResponse(response:sdk.remotepay.VaultCardResponse):void {
    }

    // TODO: These print messages need to be created in the api
    /*
     public onPrintManualRefundReceipt(pcm: PrintManualRefundReceiptMessage): void {

     }

     public onPrintManualRefundDeclineReceipt(pcdrm: PrintManualRefundDeclineReceiptMessage): void {

     }

     public onPrintPaymentReceipt(pprm: PrintPaymentReceiptMessage): void {

     }

     public onPrintPaymentDeclineReceipt(ppdrm: PrintPaymentDeclineReceiptMessage): void {

     }

     public onPrintPaymentMerchantCopyReceipt(ppmcrm: PrintPaymentMerchantCopyReceiptMessage): void {

     }

     public onPrintRefundPaymentReceipt(pprrm: PrintRefundPaymentReceiptMessage): void {

     }
     */

    public onRetrievePendingPaymentsResponse(response:sdk.remotepay.RetrievePendingPaymentsResponse):void {
    }

    public onReadCardDataResponse(response:sdk.remotepay.ReadCardDataResponse):void {
    }

    public onMessageFromActivity(response:sdk.remotepay.MessageFromActivity):void {
    }

    public onCustomActivityResponse(response:sdk.remotepay.CustomActivityResponse):void {
    }

    public onRetrieveDeviceStatusResponse(response:sdk.remotepay.RetrieveDeviceStatusResponse):void {
    }

    public onResetDeviceResponse(response:sdk.remotepay.ResetDeviceResponse):void {
    }

    public onRetrievePaymentResponse(response:sdk.remotepay.RetrievePaymentResponse):void {
    }

    public onRetrievePrintersResponse(response:sdk.remotepay.RetrievePrintersResponse):void {
    }

    public onPrintJobStatusResponse(response:sdk.remotepay.PrintJobStatusResponse):void {
    }
}
