import * as sdk from 'remote-pay-cloud-api';
import {CloverTransport} from '../transport/CloverTransport';
import {CloverDeviceObserver} from '../CloverDeviceObserver';

/**
 * Clover Device
 *
 * Abstract clover device.
 */
export abstract class CloverDevice {
    protected deviceObservers: CloverDeviceObserver[];
    protected transport: CloverTransport;
    protected packageName: string;
    protected applicationId: string;
    protected supportsAck: boolean = false;
    protected supportsVoidPaymentResponse: boolean = false;

    /**
     * Constructor
     *
     * @param {string} packageName
     * @param {CloverTransport} transport
     * @param {string} applicationId
     */
    constructor(packageName: string, transport: CloverTransport, applicationId: string) {
        this.packageName = packageName;
        this.transport = transport;
        this.applicationId = applicationId;
        this.deviceObservers = [];
        this.supportsAck = false;
    }

    /**
     * Add a new observer to the list of observers
     *
     * @param {CloverDeviceObserver} observer - observer to add
     */
    public subscribe(observer: CloverDeviceObserver): void {
        this.deviceObservers.push(observer);
    }

    /**
     * Remove an observer from the list of observers
     *
     * @param {CloverDeviceObserver} observer - observer to remove
     */
    public unsubscribe(observer: CloverDeviceObserver): void {
        var indexOfObserver = this.deviceObservers.indexOf(observer);
        if (indexOfObserver !== -1) {
            this.deviceObservers.splice(indexOfObserver, 1);
        }
    }

    /**
     * Discovery request
     */
    public abstract doDiscoveryRequest(): void;

    /**
     * Transaction Start
     *
     * @param {sdk.remotemessage.PayIntent} payIntent
     * @param {sdk.order.Order} order
     * @param {string} requestInfo - request type.
     */
    public abstract doTxStart(payIntent: sdk.remotemessage.PayIntent, order: sdk.order.Order, requestInfo: string): void;

    /**
     * Key Press
     *
     * @param {sdk.remotemessage.KeyPress} keyPress
     */
    public abstract doKeyPress(keyPress: sdk.remotemessage.KeyPress): void;

    /**
     * Void Payment
     *
     * @param {sdk.payments.Payment} payment
     * @param {sdk.order.VoidReason} reason
     * @param {boolean} disablePrinting
     * @param {boolean} disableReceiptSelection
     * @param {object} extras
     */
    public abstract doVoidPayment(payment: sdk.payments.Payment, reason: sdk.order.VoidReason, disablePrinting: boolean, disableReceiptSelection: boolean, extras: object): void;

    /**
     * Void Payment Refund
     *
     * @param {string} orderId
     * @param {string} refundId
     * @param {boolean} disablePrinting
     * @param {boolean} disableReceiptSelection
     */
    public abstract doVoidPaymentRefund(orderId: string, refundId: string, disablePrinting: boolean, disableReceiptSelection: boolean, extras: object): void;

    /**
     * Capture Auth
     *
     * @param {string} paymentId
     * @param {number} amount
     * @param {number} tipAmount
     */
    public abstract doCaptureAuth(paymentId: string, amount: number, tipAmount: number): void;

    /**
     * Capture Auth
     *
     * @param {string} paymentId
     * @param {number} amount
     * @param {number} amount
     */
    public abstract doIncrementPreAuth(paymentId: string, amount: number): void;

    /**
     * Order Update
     *
     * @param {sdk.order.DisplayOrder} order
     * @param {Object} orderOperation
     */
    public abstract doOrderUpdate(order: sdk.order.DisplayOrder, orderOperation: Object): void;

    /**
     * Signature Verified
     *
     * @param {sdk.payments.Payment} payment
     * @param {boolean} verified
     */
    public abstract doSignatureVerified(payment: sdk.payments.Payment, verified: boolean): void;

    /**
     * Terminal Message
     *
     * @param {string} text
     */
    public abstract doTerminalMessage(text: string): void;

    /**
     * Payment Refund
     *
     * @param {string} orderId
     * @param {string} paymentId
     * @param {number} amount
     * @param {boolean} fullRefund
     * @param {boolean} disablePrinting
     * @param {boolean} disableReceiptSelection
     * @param {object} extras
     */
    public abstract doPaymentRefund(orderId: string, paymentId: string, amount: number, fullRefund: boolean, disablePrinting?: boolean, disableReceiptSelection?: boolean, extras?: object): void;

    /**
     * Payment Refund
     *
     * @param {sdk.remotepay.RefundPaymentRequest} request
     */
    public abstract doPaymentRefundByRequest(request: sdk.remotepay.RefundPaymentRequest): void;

    /**
     * Tip Adjust Auth
     *
     * @param {string} orderId
     * @param {string} paymentId
     * @param {number} amount
     */
    public abstract doTipAdjustAuth(orderId: string, paymentId: string, amount: number): void;

    /**
     * Print Text
     *
     * @param {Array<string>} textLines
     * @param {string} printRequestId - an optional id that will be used for the printjob.  This id will be used in notification calls about the status of the job.
     * @param {string} printDeviceId - the printer id to use when printing.  If left unset the default is used
     */
    public abstract doPrintText(textLines: Array<string>, printRequestId?: string, printDeviceId?: string): void;


    public abstract doSendDebugLog(message: string): void;

    /**
     * Show Welcome Screen
     */
    public abstract doShowWelcomeScreen(): void;

    /**
     * Show Payment Receipt Screen
     *
     * @param {string} orderId
     * @param {string} paymentId
     * @param {string} refundId
     * @param {string} creditId
     * @param {boolean} disablePrinting
     */
    public abstract doShowReceiptScreen(orderId: string, paymentId: string, refundId: string, creditId: string, disablePrinting: boolean): void;

    /**
     * Show Thank You Screen
     */
    public abstract doShowThankYouScreen(): void;

    /**
     * Open Cash Drawer
     *
     * @param {string} reason
     * @param {string} deviceId (optional)
     */
    public abstract doOpenCashDrawer(reason: string, deviceId?: string): void;

    /**
     * Print Image (Bitmap)
     *
     * @param {any} bitmap
     * @param printRequestId
     * @param printDeviceId
     */
    public abstract doPrintImageObject(bitmap: any, printRequestId?: string, printDeviceId?: string): void;

    /**
     * Print Image (URL)
     *
     * @param {string} url
     * @param printRequestId
     * @param printDeviceId
     */
    public abstract doPrintImageUrl(url: string, printRequestId?: string, printDeviceId?: string): void;

    /**
     * Dispose
     */
    public abstract dispose(): void;

    /**
     * Closeout
     *
     * @param {boolean} allowOpenTabs
     * @param {string} batchId
     */
    public abstract doCloseout(allowOpenTabs: boolean, batchId: string): void;

    /**
     * Vault Card
     *
     * @param {number} cardEntryMethods
     */
    public abstract doVaultCard(cardEntryMethods: number): void;

    /**
     * Reset Device
     */
    public abstract doResetDevice(): void;

    /**
     * Accept Payment
     *
     * @param {sdk.payments.Payment} payment
     */
    public abstract doAcceptPayment(payment: sdk.payments.Payment): void;

    /**
     * Reject Payment
     *
     * @param {sdk.payments.Payment} payment
     * @param {sdk.base.Challenge} challenge
     */
    public abstract doRejectPayment(payment: sdk.payments.Payment, challenge: sdk.base.Challenge): void;

    /**
     * Retrieve Pending Payments
     */
    public abstract doRetrievePendingPayments(): void;

    /**
     * Read Card Data
     *
     * @param {sdk.remotemessage.PayIntent} payment
     */
    public abstract doReadCardData(payment: sdk.remotemessage.PayIntent): void;

    /**
     * Send a message to a running custom activity
     *
     * @param {string} actionId - the id used when the custom action was started
     * @param {string} payload - the message content, unrestricted format
     */
    public abstract doSendMessageToActivity(actionId: string, payload: string): void;

    /**
     * Start a custom Activity
     *
     * @param action - the id to use when starting the activity
     * @param payload - information to pass to the activity when it is started
     * @param nonBlocking - if true, the activity may be finished externally
     */
    public abstract doStartActivity(action: string, payload: string, nonBlocking: boolean): void;

    /**
     * Get the status of the device.
     *
     * @param {sdk.remotepay.RetrieveDeviceStatusRequest} request - the status request
     */
    public abstract doRetrieveDeviceStatus(request: sdk.remotepay.RetrieveDeviceStatusRequest): void;

    /**
     * Get a payment that was taken on this device in the last 24 hours.
     *
     * @param {string} externalPaymentId
     */
    public abstract doRetrievePayment(externalPaymentId: string): void;

    public abstract doRegisterForCustomerProvidedData(configurations: Array<sdk.loyalty.LoyaltyDataConfig>);

    public abstract doSetCustomerInfo (customerInfo: sdk.remotepay.CustomerInfo);

    /**
     * Get printers attached to this device.
     */
    public abstract doRetrievePrinters(category?: sdk.printer.PrintCategory): void;

    /**
     * Get the status of a specific print job.
     */
    public abstract doRetrievePrintJobStatus(printRequestId: string): void;

    /**
     * Supports Acknowledgements
     *
     * @param {boolean} supportsAck
     */
    public setSupportsAck(supportsAck: boolean): void {
        this.supportsAck = supportsAck;
    }

    /**
     * Get Supports Acknowledgements flag
     *
     * @returns boolean - Flag indicating if this device supports acks
     */
    public getSupportsAck(): boolean {
        return this.supportsAck;
    }

    public setSupportsVoidPaymentResponse(supportsVoidPaymentResponse: boolean): void {
        this.supportsVoidPaymentResponse = supportsVoidPaymentResponse;
    }

    public getSupportsVoidPaymentResponse(): boolean {
        return this.supportsVoidPaymentResponse;
    }

    public abstract doCheckBalance(cardEntryMethods: number): void;

    public abstract doCollectSignature(acknowledgementMessage: string): void;

    public abstract doRequestTip(tippableAmount: number, suggestions: Array<sdk.merchant.TipSuggestion>): void;
}
