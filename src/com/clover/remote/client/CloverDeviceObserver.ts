import sdk from 'remote-pay-cloud-api';
import CloverDevice from './device/CloverDevice';

/**
 * Clover Device Observer
 * 
 * The device observer listens for notifications and handles them.
 * 
 * @interface
 */
export interface CloverDeviceObserver {
	/**
	 * Transaction State
	 * 
	 * @param {TxState} txState 
	 */
	onTxState(txState: sdk.remotemessage.TxState): void;

	/**
	 * Transaction Start Response
	 * 
	 * @param {TxStartResponseResult} result 
	 * @param {string} externalId 
	 */
	onTxStartResponse(result: sdk.remotemessage.TxStartResponseResult, externalId: string): void;

	/**
	 * UI State change
	 * 
	 * @param {UiState} uiState 
	 * @param {string} uiText 
	 * @param {UiState.UiDirection} uiDirection 
	 * @param {InputOption[]} inputOptions 
	 */
	onUiState(uiState: sdk.remotemessage.UiState, uiText: string, uiDirection: sdk.remotemessage.UiState.UiDirection, inputOptions: sdk.remotemessage.InputOption[]): void;

	/**
	 * Tip Added
	 * 
	 * @param {number} tipAmount 
	 */
	onTipAdded(tipAmount: number): void;

	/**
	 * Auth Tip Adjusted
	 * 
	 * @param {string} paymentId 
	 * @param {number} amount 
	 * @param {boolean} success 
	 */
	onAuthTipAdjusted(paymentId: string, amount: number, success: boolean): void;

	/**
	 * Cashback Selected
	 * 
	 * @param {number} cashbackAmount 
	 */
	onCashbackSelected(cashbackAmount: number): void;

	/**
	 * Partial Auth
	 * 
	 * @param {number} partialAuthAmount 
	 */
	onPartialAuth(partialAuthAmount: number): void;

	/**
	 * Finish Ok
	 * 
	 * @param {Payment} payment 
	 * @param {Signature2} signature2 
	 */
	onFinishOk(payment: sdk.remotemessage.Payment, signature2: sdk.remotemessage.Signature2): void;

	/**
	 * Finish Ok
	 * 
	 * @param {Credit} credit 
	 */
	onFinishOk(credit: sdk.remotemessage.Credit): void;

	/**
	 * Finish Ok
	 * 
	 * @param {Refund} refund 
	 */
	onFinishOk(refund: sdk.remotemessage.Refund): void;

	/**
	 * Finish Cancel
	 */
	onFinishCancel(): void;

	/**
	 * Verify Signature
	 * 
	 * @param {Payment} payment 
	 * @param {Signature2} signature 
	 */
	onVerifySignature(payment: sdk.remotemessage.Payment, signature: sdk.remotemessage.Signature2): void;

	/**
	 * Confirm Payment
	 * 
	 * @param {Payment} payment 
	 * @param {Challenge[]} challenges 
	 */
	onConfirmPayment(payment: sdk.remotemessage.Payment, challenges: sdk.remotemessage.Challenge[]): void;

	/**
	 * Payment Voided
	 * 
	 * @param {Payment} payment 
	 * @param {VoidReason} voidReason 
	 * @param {ResultStatus} result 
	 * @param {string} reason 
	 * @param {string} message 
	 */
	onPaymentVoided(payment: sdk.remotemessage.Payment, voidReason: sdk.remotemessage.VoidReason, result: sdk.remotemessage.ResultStatus, reason: string, message: string): void;

	/**
	 * Key Pressed
	 * 
	 * @param {KeyPress} keyPress 
	 */
	onKeyPressed(keyPress: sdk.remotemessage.KeyPress): void;

	/**
	 * Payment Refund Response
	 * 
	 * @param {string} orderId 
	 * @param {string} paymentId 
	 * @param {Refund} refund 
	 * @param {TxState} code 
	 */
	onPaymentRefundResponse(orderId: string, paymentId: string, refund: sdk.remotemessage.Refund, code: sdk.remotemessage.TxState): void;

	/**
	 * Vault Card Response
	 * 
	 * @param {VaultedCard} vaultedCard 
	 * @param {string} code 
	 * @param {string} reason 
	 */
	onVaultCardResponse(vaultedCard: sdk.remotemessage.VaultedCard, code: string, reason: string): void;

	/**
	 * Capture Pre-Auth
	 * 
	 * @param {ResultStatus} status 
	 * @param {string} reason 
	 * @param {string} paymentId 
	 * @param {number} amount 
	 * @param {number} tipAmount 
	 */
	onCapturePreAuth(status: sdk.remotemessage.ResultStatus, reason: string, paymentId: string, amount: number, tipAmount: number): void;

	/**
	 * Closeout Response
	 * 
	 * @param {ResultStatus} status 
	 * @param {string} reason 
	 * @param {Batch} batch 
	 */
	onCloseoutResponse(status: sdk.remotemessage.ResultStatus, reason: string, batch: sdk.remotemessage.Batch): void;

	/**
	 * Device Disconnected
	 * 
	 * @param {CloverDevice} device 
	 */
	onDeviceDisconnected(device: CloverDevice): void;

	/**
	 * Device Connected
	 * 
	 * @param {CloverDevice} device 
	 */
	onDeviceConnected(device: CloverDevice): void;

	/**
	 * Device Ready
	 * 
	 * @param {CloverDevice} device 
	 * @param {DiscoveryResponseMessage} drm 
	 */
	onDeviceReady(device: CloverDevice, drm: sdk.remotemessage.DiscoveryResponseMessage): void;

	/**
	 * Device Error
	 * 
	 * @param {CloverDeviceErrorEvent} errorEvent 
	 */
	onDeviceError(errorEvent: sdk.remotemessage.CloverDeviceErrorEvent): void;

	/**
	 * Print Refund Payment
	 * 
	 * @param {Payment} payment 
	 * @param {Order} order 
	 * @param {Refund} refund 
	 */
	onPrintRefundPayment(payment: sdk.remotemessage.Payment, order: sdk.remotemessage.Order, refund: sdk.remotemessage.Refund): void;

	/**
	 * Print Merchant Receipt
	 * 
	 * @param {Payment} payment 
	 */
	onPrintMerchantReceipt(payment: sdk.remotemessage.Payment): void;

	/**
	 * Print Payment Decline
	 * 
	 * @param {Payment} payment 
	 * @param {string} reason 
	 */
	onPrintPaymentDecline(payment: sdk.remotemessage.Payment, reason: string): void;

	/**
	 * Print Payment
	 * 
	 * @param {Payment} payment 
	 * @param {Order} order 
	 */
	onPrintPayment(payment: sdk.remotemessage.Payment, order: sdk.remotemessage.Order): void;

	/**
	 * Print Credit
	 * 
	 * @param {Credit} credit 
	 */
	onPrintCredit(credit: sdk.remotemessage.Credit): void;

	/**
	 * Print Credit Decline
	 * 
	 * @param {Credit} credit 
	 * @param {string} reason 
	 */
	onPrintCreditDecline(credit: sdk.remotemessage.Credit, reason: string): void;

	/**
	 * Message Acknowledgement
	 * 
	 * @param {string} sourceMessageId 
	 */
	onMessageAck(sourceMessageId: string): void;

	/**
	 * Pending Payments Response
	 * 
	 * @param {boolean} success 
	 * @param {PendingPaymentEntry[]} payments 
	 */
	onPendingPaymentsResponse(success: boolean, payments: sdk.remotemessage.PendingPaymentEntry[]): void;

	/**
	 * Read Card Response
	 * 
	 * @param {ResultStatus} status 
	 * @param {string} reason 
	 * @param {CardData} cardData 
	 */
	onReadCardResponse(status: sdk.remotemessage.ResultStatus, reason: string, cardData: sdk.remotemessage.CardData): void;
}

export default CloverDeviceObserver;
