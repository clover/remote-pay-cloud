import sdk = require('remote-pay-cloud-api');
import {Logger} from './util/Logger';

export class CloverConnectorBroadcaster
	// The following causes type issues.
	//	extends Array<sdk.remotepay.ICloverConnectorListener>
{

	private listeners: Array<sdk.remotepay.ICloverConnectorListener>;

	private logger: Logger = Logger.create();

	constructor() {
		this.listeners = new Array<sdk.remotepay.ICloverConnectorListener>();
	}

	public clear(): void {
		this.listeners.splice(0, this.listeners.length);
	}

	public push(...items: sdk.remotepay.ICloverConnectorListener[]) : number {
		if (items.length == 1) {
			return this.listeners.push(items[0]);
		} else {
			return this.listeners.push(items);
		}
	}

	public indexOf(searchElement: sdk.remotepay.ICloverConnectorListener, fromIndex?: number): number {
		return this.listeners.indexOf(searchElement, fromIndex);
	}

	public splice(start: number, deleteCount: number, ...items: sdk.remotepay.ICloverConnectorListener[]): sdk.remotepay.ICloverConnectorListener[] {
		return this.listeners.splice(start, deleteCount, items);
	}

	public notifyOnTipAdded(tip: number): void {
		this.logger.debug('Sending TipAdded notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onTipAdded(new sdk.remotemessages.TipAddedMessage(tip));
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnRefundPaymentResponse(refundPaymentResponse: sdk.remotemessages.RefundPaymentResponse): void {
		this.logger.debug('Sending RefundPaymentResponse notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onRefundPaymentResponse(refundPaymentResponse);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyCloseout(closeoutResponse: sdk.remotemessages.CloseoutResponse): void {
		this.logger.debug('Sending Closeout notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onCloseoutResponse(closeoutResponse);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnDeviceActivityStart(deviceEvent: sdk.remotemessages.CloverDeviceEvent): void {
		this.logger.debug('Sending DeviceActivityStart notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onDeviceActivityStart(deviceEvent);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnDeviceActivityEnd(deviceEvent: sdk.remotemessages.CloverDeviceEvent): void {
		this.logger.debug('Sending DeviceActivityEnd notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onDeviceActivityEnd(deviceEvent);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnSaleResponse(response: sdk.remotemessages.SaleResponse): void {
		this.logger.debug('Sending SaleResponse notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onSaleResponse(response);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnAuthResponse(response: sdk.remotemessages.AuthResponse): void {
		this.logger.debug('Sending AuthResponse notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onAuthResponse(response);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnManualRefundResponse(response: sdk.remotemessages.ManualRefundResponse): void {
		this.logger.debug('Sending ManualRefundResponse notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onManualRefundResponse(response);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnVerifySignatureRequest(request: sdk.remotemessages.VerifySignatureRequest): void {
		this.logger.debug('Sending VerifySignatureRequest notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onVerifySignatureRequest(request);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnVoidPaymentResponse(response: sdk.remotemessages.VoidPaymentResponse): void {
		this.logger.debug('Sending VoidPaymentResponse notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onVoidPaymentResponse(response);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnConnect(): void {
		this.logger.debug('Sending Connect notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				// listener.onDeviceConnected();  changed the name in 1.3
				listener.onConnected();
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnDisconnect(): void {
		this.logger.debug('Sending Disconnect notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				// listener.onDeviceDisconnected();  changed the name in 1.3
				listener.onDisconnected();
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnReady(merchantInfo: sdk.remotemessages.MerchantInfo): void {
		this.logger.debug('Sending Ready notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				// listener.onDeviceReady(merchantInfo);
				listener.onReady(merchantInfo);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnTipAdjustAuthResponse(response: sdk.remotemessages.TipAdjustAuthResponse): void {
		this.logger.debug('Sending TipAdjustAuthResponse notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onTipAdjustAuthResponse(response);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnVaultCardRespose(ccr: sdk.remotemessages.VaultCardResponse): void {
		this.logger.debug('Sending VaultCardResponse notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onVaultCardResponse(ccr);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnPreAuthResponse(response: sdk.remotemessages.PreAuthResponse): void {
		this.logger.debug('Sending PreAuthResponse notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onPreAuthResponse(response);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnCapturePreAuth(response: sdk.remotemessages.CapturePreAuthResponse): void {
		this.logger.debug('Sending CapturePreAuth notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onCapturePreAuthResponse(response);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnDeviceError(errorEvent: sdk.remotemessages.CloverDeviceErrorEvent): void {
		this.logger.debug('Sending DeviceError notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onDeviceError(errorEvent);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnPrintRefundPaymentReceipt(printRefundPaymentReceiptMessage: sdk.remotemessages.PrintRefundPaymentReceiptMessage): void {
		this.logger.debug('Sending PrintRefundPaymentReceipt notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onPrintRefundPaymentReceipt(printRefundPaymentReceiptMessage);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnPrintPaymentMerchantCopyReceipt(printPaymentMerchantCopyReceiptMessage: sdk.remotemessages.PrintPaymentMerchantCopyReceiptMessage): void {
		this.logger.debug('Sending PrintPaymentMerchantCopyReceipt notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onPrintPaymentMerchantCopyReceipt(printPaymentMerchantCopyReceiptMessage);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnPrintPaymentDeclineReceipt(printPaymentDeclineReceiptMessage: sdk.remotemessages.PrintPaymentDeclineReceiptMessage): void {
		this.logger.debug('Sending PrintPaymentDeclineReceipt notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onPrintPaymentDeclineReceipt(printPaymentDeclineReceiptMessage);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnPrintPaymentReceipt(printPaymentReceiptMessage: sdk.remotemessages.PrintPaymentReceiptMessage): void {
		this.logger.debug('Sending PrintPaymentReceipt notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onPrintPaymentReceipt(printPaymentReceiptMessage);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnPrintCreditReceipt(printManualRefundReceiptMessage: sdk.remotemessages.PrintManualRefundReceiptMessage): void {
		this.logger.debug('Sending PrintCreditReceipt notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onPrintManualRefundReceipt(printManualRefundReceiptMessage);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnPrintCreditDeclineReceipt(printManualRefundDeclineReceiptMessage: sdk.remotemessages.PrintManualRefundDeclineReceiptMessage): void {
		this.logger.debug('Sending PrintCreditDeclineReceipt notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onPrintManualRefundDeclineReceipt(printManualRefundDeclineReceiptMessage);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnConfirmPaymentRequest(confirmPaymentRequest: sdk.remotemessages.ConfirmPaymentRequest): void {
		this.logger.debug('Sending ConfirmPaymentRequest notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onConfirmPaymentRequest(confirmPaymentRequest);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnRetrievePendingPaymentResponse(rppr: sdk.remotemessages.RetrievePendingPaymentsResponse): void {
		this.logger.debug('Sending RetrievePendingPaymentResponse notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onRetrievePendingPaymentsResponse(rppr);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}

	public notifyOnReadCardDataResponse(rcdr: sdk.remotemessages.ReadCardDataResponse): void {
		this.logger.debug('Sending ReadCardDataResponse notification to listeners');
		this.listeners.forEach((listener: sdk.remotepay.ICloverConnectorListener) => {
			try {
				listener.onReadCardDataResponse(rcdr);
			}
			catch(e) {
				this.logger.error(e);
			}
		});
	}
}
