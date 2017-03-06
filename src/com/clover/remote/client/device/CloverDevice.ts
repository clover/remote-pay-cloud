import sdk = require('remote-pay-cloud-api');
import CloverTransport from '../transport/CloverTransport';
import CloverDeviceObserver from '../CloverDeviceObserver';

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
		// This prevents developers from creating a new CloverDevice.
		// This class is abstract and needs to be extended with a custom
		// implementation.
		if (this.constructor === CloverDevice) {
			throw new TypeError('Abstract class "CloverDevice" cannot be instantiated directly.');
		}

		// Make sure the child class implements all abstract methods.
		if (this.doDiscoveryRequest === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doDiscoveryRequest" method.');
		}
		if (this.doTxStart === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doTxStart" method.');
		}
		if (this.doKeyPress === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doKeyPress" method.');
		}
		if (this.doVoidPayment === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doVoidPayment" method.');
		}
		if (this.doCaptureAuth === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doCaptureAuth" method.');
		}
		if (this.doOrderUpdate === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doOrderUpdate" method.');
		}
		if (this.doSignatureVerified === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doSignatureVerified" method.');
		}
		if (this.doTerminalMessage === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doTerminalMessage" method.');
		}
		if (this.doPaymentRefund === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doPaymentRefund" method.');
		}
		if (this.doTipAdjustAuth === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doTipAdjustAuth" method.');
		}
		if (this.doPrintText === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doPrintText" method.');
		}
		if (this.doShowWelcomeScreen === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doShowWelcomeScreen" method.');
		}
		if (this.doShowPaymentReceiptScreen === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doShowPaymentReceiptScreen" method.');
		}
		if (this.doShowThankYouScreen === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doShowThankYouScreen" method.');
		}
		if (this.doOpenCashDrawer === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doOpenCashDrawer" method.');
		}
		if (this.doPrintImage === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doPrintImage" method.');
		}
		if (this.doPrintImage === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doPrintImage" method.');
		}
		if (this.dispose === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "dispose" method.');
		}
		if (this.doCloseout === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doCloseout" method.');
		}
		if (this.doVaultCard === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doVaultCard" method.');
		}
		if (this.doResetDevice === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doResetDevice" method.');
		}
		if (this.doAcceptPayment === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doAcceptPayment" method.');
		}
		if (this.doRejectPayment === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doRejectPayment" method.');
		}
		if (this.doRetrievePendingPayments === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doRetrievePendingPayments" method.');
		}
		if (this.doReadCardData === undefined) {
			throw new TypeError('Classes extending this abstract class must implement the "doReadCardData" method.');
		}

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
	subscribe(observer: CloverDeviceObserver) {
		this.deviceObservers.push(observer);
	}

	/**
	 * Remove an observer from the list of observers
	 * 
	 * @param {CloverDeviceObserver} observer - observer to remove
	 */
	unsubscribe(observer: CloverDeviceObserver) {
		var indexOfObserver = this.deviceObservers.indexOf(observer);
		if (indexOfObserver !== -1) {
			this.deviceObservers.splice(indexOfObserver, 1);
		}
	}

	/**
	 * Discovery request
	 */
	doDiscoveryRequest(): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Transaction Start
	 * 
	 * @param {PayIntent} payIntent 
	 * @param {Order} order 
	 * @param {boolean} suppressTipScreen 
	 */
	doTxStart(payIntent: sdk.remote.PayIntent, order: sdk.remote.Order, suppressTipScreen: boolean): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Key Press
	 * 
	 * @param {KeyPress} keyPress 
	 */
	doKeyPress(keyPress: sdk.remote.KeyPress): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Void Payment
	 * 
	 * @param {Payment} payment 
	 * @param {VoidReason} reason 
	 */
	doVoidPayment(payment: sdk.remote.Payment, reason: sdk.remote.VoidReason): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Capture Auth
	 * 
	 * @param {string} paymentId 
	 * @param {number} amount 
	 * @param {number} tipAmount 
	 */
	doCaptureAuth(paymentId: string, amount: number, tipAmount: number): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Order Update
	 * 
	 * @param {DisplayOrder} order 
	 * @param {Object} orderOperation 
	 */
	doOrderUpdate(order: sdk.remote.DisplayOrder, orderOperation: Object): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Signature Verified
	 * 
	 * @param {Payment} payment 
	 * @param {boolean} verified 
	 */
	doSignatureVerified(payment: sdk.remote.Payment, verified: boolean): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Terminal Message
	 * 
	 * @param {string} text 
	 */
	doTerminalMessage(text: string): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Payment Refund
	 * 
	 * @param {string} orderId 
	 * @param {string} paymentId 
	 * @param {number} amount 
	 * @param {boolean} fullRefund 
	 */
	doPaymentRefund(orderId: string, paymentId: string, amount: number, fullRefund: boolean): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Tip Adjust Auth
	 * 
	 * @param {string} orderId 
	 * @param {string} paymentId 
	 * @param {number} amount 
	 */
	doTipAdjustAuth(orderId: string, paymentId: string, amount: number): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Print Text
	 * 
	 * @param {string[]} textLines 
	 */
	doPrintText(textLines: string[]): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Show Welcome Screen
	 */
	doShowWelcomeScreen(): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Show Payment Receipt Screen
	 * 
	 * @param {string} orderId 
	 * @param {string} paymentId 
	 */
	doShowPaymentReceiptScreen(orderId: string, paymentId: string): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Show Thank You Screen
	 */
	doShowThankYouScreen(): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Open Cash Drawer
	 * 
	 * @param {string} reason 
	 */
	doOpenCashDrawer(reason: string): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Print Image (Bitmap)
	 * 
	 * @param {byte[]} bitmap 
	 */
	doPrintImage(bitmap: number[]): void;
	/**
	 * Print Image (URL)
	 * 
	 * @param {string} url 
	 */
	doPrintImage(url: string): void;
	doPrintImage(value: number[] | string): void {
	    throw new Error('Method not implemented');
	}

	/**
	 * Dispose
	 */
	dispose(): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Closeout
	 * 
	 * @param {boolean} allowOpenTabs 
	 * @param {string} batchId 
	 */
	doCloseout(allowOpenTabs: boolean, batchId: string): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Vault Card
	 * 
	 * @param {number} cardEntryMethods 
	 */
	doVaultCard(cardEntryMethods: number): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Reset Device
	 */
	doResetDevice(): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Accept Payment
	 * 
	 * @param {Payment} payment 
	 */
	doAcceptPayment(payment: sdk.remote.Payment): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Reject Payment
	 * 
	 * @param {Payment} payment 
	 * @param {Challenge} challenge 
	 */
	doRejectPayment(payment: sdk.remote.Payment, challenge: sdk.remote.Challenge): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Retrieve Pending Payments
	 */
	doRetrievePendingPayments(): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Read Cart Data
	 * 
	 * @param {PayIntent} payment 
	 */
	doReadCardData(payment: sdk.remote.PayIntent): void {
        throw new Error('Method not implemented');
	}

	/**
	 * Supports Acknowledgements
	 * 
	 * @param {boolean} supportsAck 
	 */
	setSupportsAcks(supportsAck: boolean): void {
		this.supportsAck = supportsAck;
	}

	/**
	 * Get Supports Acknowledgements flag
     * 
     * @returns boolean - Flag indicating if this device supports acks
	 */
	supportsAcks(): boolean {
		return this.supportsAck;
	}
}

export default CloverDevice;
