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
	 * @param {PayIntent} payIntent 
	 * @param {Order} order 
	 * @param {boolean} suppressTipScreen 
	 */
	public abstract doTxStart(payIntent: sdk.remote.PayIntent, order: sdk.remote.Order, suppressTipScreen: boolean): void;

	/**
	 * Key Press
	 * 
	 * @param {KeyPress} keyPress 
	 */
	public abstract doKeyPress(keyPress: sdk.remote.KeyPress): void;

	/**
	 * Void Payment
	 * 
	 * @param {Payment} payment 
	 * @param {VoidReason} reason 
	 */
	public abstract doVoidPayment(payment: sdk.remote.Payment, reason: sdk.remote.VoidReason): void;

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
	 * @param {DisplayOrder} order 
	 * @param {Object} orderOperation 
	 */
	public abstract doOrderUpdate(order: sdk.remote.DisplayOrder, orderOperation: Object): void;

	/**
	 * Signature Verified
	 * 
	 * @param {Payment} payment 
	 * @param {boolean} verified 
	 */
	public abstract doSignatureVerified(payment: sdk.remote.Payment, verified: boolean): void;

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
	 * @param {byte[]} bitmap 
	 */
	public abstract doPrintImage(bitmap: number[]): void;
	/**
	 * Print Image (URL)
	 * 
	 * @param {string} url 
	 */
	public abstract doPrintImage(url: string): void;
	public abstract doPrintImage(value: number[] | string): void;

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
	 * @param {Payment} payment 
	 */
	public abstract doAcceptPayment(payment: sdk.remote.Payment): void;

	/**
	 * Reject Payment
	 * 
	 * @param {Payment} payment 
	 * @param {Challenge} challenge 
	 */
	public abstract doRejectPayment(payment: sdk.remote.Payment, challenge: sdk.remote.Challenge): void;

	/**
	 * Retrieve Pending Payments
	 */
	public abstract doRetrievePendingPayments(): void;

	/**
	 * Read Cart Data
	 * 
	 * @param {PayIntent} payment 
	 */
	public abstract doReadCardData(payment: sdk.remote.PayIntent): void;

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
