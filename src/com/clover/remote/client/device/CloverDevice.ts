import sdk = require('remote-pay-cloud-api');
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
	 */
	public abstract doTxStart(payIntent: sdk.remotemessage.PayIntent, order: sdk.order.Order): void;

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
	 */
	public abstract doVoidPayment(payment: sdk.payments.Payment, reason: sdk.order.VoidReason): void;

	/**
	 * Capture Auth
	 * 
	 * @param {string} paymentId 
	 * @param {number} amount 
	 * @param {number} tipAmount 
	 */
	public abstract doCaptureAuth(paymentId: string, amount: number, tipAmount: number): void;

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
	 */
	public abstract doPaymentRefund(orderId: string, paymentId: string, amount: number, fullRefund: boolean): void;

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
	 */
	public abstract doPrintText(textLines: Array<string>): void;

	/**
	 * Show Welcome Screen
	 */
	public abstract doShowWelcomeScreen(): void;

	/**
	 * Show Payment Receipt Screen
	 * 
	 * @param {string} orderId 
	 * @param {string} paymentId 
	 */
	public abstract doShowPaymentReceiptScreen(orderId: string, paymentId: string): void;

	/**
	 * Show Thank You Screen
	 */
	public abstract doShowThankYouScreen(): void;

	/**
	 * Open Cash Drawer
	 * 
	 * @param {string} reason 
	 */
	public abstract doOpenCashDrawer(reason: string): void;

	/**
	 * Print Image (Bitmap)
	 * 
	 * @param {any} bitmap
	 */
	public abstract doPrintImageObject(bitmap: any): void;

	/**
	 * Print Image (URL)
	 * 
	 * @param {string} url 
	 */
	public abstract doPrintImageUrl(url: string): void;

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
	public abstract doRejectPayment(payment: sdk.remotepay.Payment, challenge: sdk.base.Challenge): void;

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
	public abstract doSendMessageToActivity(actionId:string, payload:string): void;

	/**
	 * Start a custom Activity
	 *
	 * @param action - the id to use when starting the activity
	 * @param payload - information to pass to the activity when it is started
	 * @param nonBlocking - if true, the activity may be finished externally
     */
	public abstract doStartActivity(action:string, payload:string, nonBlocking:boolean): void;

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
	public abstract doGetPayment(externalPaymentId: string): void;

	/**
	 * Supports Acknowledgements
	 * 
	 * @param {boolean} supportsAck
	 */
	public setSupportsAcks(supportsAck: boolean): void {
		this.supportsAck = supportsAck;
	}

	/**
	 * Get Supports Acknowledgements flag
     * 
     * @returns boolean - Flag indicating if this device supports acks
	 */
	public supportsAcks(): boolean {
		return this.supportsAck;
	}
}
