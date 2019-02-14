import * as sdk from 'remote-pay-cloud-api';
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
     * @param {TxStartResponseMessage} txStartResponseMessage
     */
    onTxStartResponse(txStartResponseMessage: sdk.remotemessage.TxStartResponseMessage): void;

    /**
     * UI State change
     *
     * @param {UiState} uiState
     * @param {string} uiText
     * @param {UiDirection} uiDirection
     * @param {InputOption[]} inputOptions
     */
    onUiState(uiState: sdk.remotemessage.UiState, uiText: string, uiDirection: sdk.remotemessage.UiDirection, inputOptions: Array<sdk.remotemessage.InputOption>): void;

    /**
     * Tip Added
     *
     * @param {number} tipAmount
     */
    onTipAdded(tipAmount: number): void;

    /**
     * Auth Tip Adjusted
     *
     * @param {TipAdjustResponseMessage} tipAdjustResponseMessage
     */
    onAuthTipAdjusted(tipAdjustResponseMessage: sdk.remotemessage.TipAdjustResponseMessage, result?: sdk.remotepay.ResponseCode): void;

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
     * @param {Signature} signature2
     * @param requestInfo
     */
    onFinishOk(payment: sdk.payments.Payment, signature2: sdk.base.Signature, requestInfo: string): void;

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
    onFinishCancel(requestInfo: string): void;

    /**
     * Verify Signature
     *
     * @param {Payment} payment
     * @param {Signature} signature
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
     * @param {VoidPaymentResponseMessage} voidPaymentResponseMessage
     */
    onPaymentVoided(voidPaymentResponseMessage: sdk.remotemessage.VoidPaymentResponseMessage): void;

    /**
     * Refund Voided
     *
     * @param {VoidPaymentRefundResponseMessage} voidPaymentRefundResponseMessage
     */
    onPaymentRefundVoidResponse(voidPaymentRefundResponseMessage: sdk.remotemessage.VoidPaymentRefundResponseMessage);

    /**
     * Key Pressed
     *
     * @param {KeyPress} keyPress
     */
    onKeyPressed(keyPress: sdk.remotemessage.KeyPress): void;

    /**
     * Payment Refund Response
     *
     * @param {RefundResponseMessage} refundResponseMessage
     */
    onPaymentRefundResponse(refundResponseMessage: sdk.remotemessage.RefundResponseMessage): void;

    /**
     * Vault Card Response
     *
     * @param {VaultCardResponseMessage} vaultCardResponseMessage
     * @param {ResponseCode} code
     * @param {string} message
     */
    onVaultCardResponse(vaultCardResponseMessage: sdk.remotemessage.VaultCardResponseMessage, code?: sdk.remotepay.ResponseCode, message?: string): void;

    /**
     * Capture Pre-Auth
     *
     * @param {CapturePreAuthResponseMessage} capturePreAuthResponseMessage
     */
    onCapturePreAuth(capturePreAuthResponseMessage: sdk.remotemessage.CapturePreAuthResponseMessage): void;

    /**
     * Closeout Response
     *
     * @param {ResultStatus} status base @param {string} reason
     * @param reason
     * @param {Batch} batch
     */
    onCloseoutResponse(status: sdk.remotemessage.ResultStatus, reason: string, batch: sdk.payments.Batch): void;

    /**
     * Device Disconnected
     *
     * @param {CloverDevice} device
     * @param message
     */
    onDeviceDisconnected(device: CloverDevice, message?: string): void;

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
    onDeviceError(errorEvent: sdk.remotepay.CloverDeviceErrorEvent): void;

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
    onActivityResponse(status: sdk.remotemessage.ResultStatus, action: string, payload: string, reason: string): void;

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
    onActivityResponse(status: sdk.remotemessage.ResultStatus, payload: string, failReason: string, actionId: string): void;

    /**
     * The result of a request for device status
     *
     * @param {RetrieveDeviceStatusResponseMessage} retrieveDeviceStatusResponseMessage
     */
    onDeviceStatusResponse(retrieveDeviceStatusResponseMessage: sdk.remotemessage.RetrieveDeviceStatusResponseMessage): void;

    /**
     * The result of a request for the device to reset
     *
     * @param result
     * @param reason
     * @param state
     */
    onResetDeviceResponse(result: sdk.remotepay.ResponseCode, reason: string, state: sdk.remotemessage.ExternalDeviceState): void;

    /**
     * The result of a request to get a single payment.
     *
     * @param {RetrievePaymentResponseMessage} retrievePaymentResponseMessage
     */
    onRetrievePaymentResponse(retrievePaymentResponseMessage: sdk.remotemessage.RetrievePaymentResponseMessage): void;

    /**
     * The result of a request to get printers attached to the device.
     *
     * @param result
     * @param printers
     */
    onRetrievePrintersResponse(result: sdk.remotepay.ResponseCode, printers: sdk.printer.Printer[]): void;

    /**
     * The status of the requested print job.
     *
     * @param result
     * @param externalPrintJobId
     * @param status
     */
    onPrintJobStatusResponse(result: sdk.remotepay.ResponseCode, externalPrintJobId: string, status: sdk.printer.PrintJobStatus): void;

    /**
     * The result of the customer provided data message
     *
     * @param status
     * @param eventId
     * @param config
     * @param data
     */
    onCustomerProvidedDataMessage(status: sdk.remotepay.ResponseCode, eventId: string, config: sdk.loyalty.LoyaltyDataConfig, data: string): void;

    onInvalidStateTransitionResponse(result: sdk.remotemessage.ResultStatus, reason: string, requestedTransition: string, state: sdk.remotepay.ExternalDeviceState, data: sdk.remotemessage.ExternalDeviceStateData);

    onDisplayReceiptOptionsResponse(result: sdk.remotemessage.ResultStatus, reason: string);

}
