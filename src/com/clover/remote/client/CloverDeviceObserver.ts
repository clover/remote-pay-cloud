import sdk = require('remote-pay-cloud-api');
import {CloverDevice} from './device/CloverDevice';

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
	onUiState(uiState: sdk.remotemessage.UiState, uiText: string, uiDirection: sdk.remotemessage.UiState.UiDirection, inputOptions: Array<sdk.remotemessage.InputOption>): void;

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
	onFinishOk(payment: sdk.payments.Payment, signature2: sdk.base.Signature): void;

	/**
	 * Finish Ok
	 * 
	 * @param {Credit} credit 
	 */
	onFinishOk(credit: sdk.payments.Credit): void;

	/**
	 * Finish Ok
	 * 
	 * @param {Refund} refund 
	 */
	onFinishOk(refund: sdk.payments.Refund): void;

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
	onVerifySignature(payment: sdk.payments.Payment, signature: sdk.base.Signature): void;

	/**
	 * Confirm Payment
	 * 
	 * @param {Payment} payment 
	 * @param {Challenge[]} challenges 
	 */
	onConfirmPayment(payment: sdk.payments.Payment, challenges: Array<sdk.base.Challenge>): void;

	/**
	 * Payment Voided
	 * 
	 * @param {Payment} payment 
	 * @param {VoidReason} voidReason 
	 * @param {ResultStatus} result 
	 * @param {string} reason 
	 * @param {string} message 
	 */
	onPaymentVoided(payment: sdk.payments.Payment, voidReason: sdk.order.VoidReason, result: sdk.remotemessage.ResultStatus, reason: string, message: string): void;

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
	onPaymentRefundResponse(orderId: string, paymentId: string, refund: sdk.payments.Refund, code: sdk.remotemessage.TxState): void;

	/**
	 * Vault Card Response
	 * 
	 * @param {VaultedCard} vaultedCard 
	 * @param {string} code 
	 * @param {string} reason 
	 */
	onVaultCardResponse(vaultedCard: sdk.payments.VaultedCard, code: string, reason: string): void;

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
	 * @param {ResultStatus} status base @param {string} reason 
	 * @param {Batch} batch 
	 */
	onCloseoutResponse(status: sdk.remotemessage.ResultStatus, reason: string, batch: sdk.payments.Batch): void;

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
	onPrintRefundPayment(payment: sdk.payments.Payment, order: sdk.order.Order, refund: sdk.payments.Refund): void;

	/**
	 * Print Merchant Receipt
	 * 
	 * @param {Payment} payment 
	 */
	onPrintMerchantReceipt(payment: sdk.payments.Payment): void;

	/**
	 * Print Payment Decline
	 * 
	 * @param {Payment} payment 
	 * @param {string} reason 
	 */
	onPrintPaymentDecline(payment: sdk.payments.Payment, reason: string): void;

	/**
	 * Print Payment
	 * 
	 * @param {Payment} payment 
	 * @param {Order} order 
	 */
	onPrintPayment(payment: sdk.payments.Payment, order: sdk.order.Order): void;

	/**
	 * Print Credit
	 * 
	 * @param {Credit} credit 
	 */
	onPrintCredit(credit: sdk.payments.Credit): void;

	/**
	 * Print Credit Decline
	 * 
	 * @param {Credit} credit 
	 * @param {string} reason 
	 */
	onPrintCreditDecline(credit: sdk.payments.Credit, reason: string): void;

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
	onPendingPaymentsResponse(success: boolean, payments: Array<sdk.base.PendingPaymentEntry>): void;

	/**
	 * Read Card Response
	 * 
	 * @param {ResultStatus} status 
	 * @param {string} reason 
	 * @param {CardData} cardData 
	 */
	onReadCardResponse(status: sdk.remotemessage.ResultStatus, reason: string, cardData: sdk.base.CardData): void;

	/**
	 * The result of an activity
	 *
	 * @param status
	 * @param action
	 * @param payload
     * @param reason
     */
	onActivityResponse(status:sdk.remotemessage.ResultStatus, action:string, payload:string, reason:string): void;

	/**
	 * A message sent to the sdk from a running custom activity
	 *
	 * @param actionId
	 * @param payload
     */
	onMessageFromActivity(actionId: string, payload: string): void;

	/**
	 * The result of a custom activity (after it has finished)
	 *
	 * @param status
	 * @param payload
	 * @param failReason
	 * @param actionId
     */
	onActivityResponse(status:sdk.remotemessage.ResultStatus, payload: string, failReason: string, actionId: string): void;

	/**
	 * The result of a request for device status
	 *
	 * @param result
	 * @param reason
	 * @param state
     * @param data
     */
	onDeviceStatusResponse(result:sdk.remotepay.ResponseCode, reason: string, state:sdk.remotemessage.ExternalDeviceState, data:sdk.remotemessage.ExternalDeviceStateData): void;

	/**
	 * The result of a request for the device to reset
	 *
	 * @param result
	 * @param reason
	 * @param state
     */
	onResetDeviceResponse(result:sdk.remotepay.ResponseCode, reason: string, state:sdk.remotemessage.ExternalDeviceState): void;

	/**
	 * The result of a request to get a single payment.
	 *
	 * @param result
	 * @param reason
	 * @param payment
     */
	 onGetPaymentResponse(result:sdk.remotepay.ResponseCode, reason: string, externalPaymentId: string, queryStatus:sdk.remotemessage.QueryStatus, payment:sdk.payments.Payment): void;
}
