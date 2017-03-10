import sdk = require('remote-pay-cloud-api');
import {CloverConnectorBroadcaster} from './CloverConnectorBroadcaster';
import {CloverDevice} from './device/CloverDevice';
import {CloverDeviceConfiguration} from './device/CloverDeviceConfiguration';
import {CloverDeviceFactory} from './device/CloverDeviceFactory';
import {CloverDeviceObserver} from './CloverDeviceObserver';
import {Logger} from './util/Logger';
import {ResultCode} from './messages/ResultCode';

/**
 * Clover Connector
 * 
 * The clover connector implements the ICloverConnector interface. This is where
 * we define how the connector interacts with remote pay adapters.
 */
export class CloverConnector implements sdk.remotepay.ICloverConnector {
	private static KIOSK_CARD_ENTRY_METHODS: number			= 1 << 15;

	public static CARD_ENTRY_METHOD_MAG_STRIPE: number		= 0b0001 | 0b000100000000 | CloverConnector.KIOSK_CARD_ENTRY_METHODS; // 33026
	public static CARD_ENTRY_METHOD_ICC_CONTACT: number		= 0b0010 | 0b001000000000 | CloverConnector.KIOSK_CARD_ENTRY_METHODS; // 33282
	public static CARD_ENTRY_METHOD_NFC_CONTACTLESS: number	= 0b0100 | 0b010000000000 | CloverConnector.KIOSK_CARD_ENTRY_METHODS; // 33796
	public static CARD_ENTRY_METHOD_MANUAL: number			= 0b1000 | 0b100000000000 | CloverConnector.KIOSK_CARD_ENTRY_METHODS; // 34824

	public static CANCEL_INPUT_OPTION: sdk.remotemessage.InputOption;

	// manual is not enabled by default
	private cardEntryMethods: number = CloverConnector.CARD_ENTRY_METHOD_MAG_STRIPE | CloverConnector.CARD_ENTRY_METHOD_ICC_CONTACT | CloverConnector.CARD_ENTRY_METHOD_NFC_CONTACTLESS; // | CARD_ENTRY_METHOD_MANUAL;

	// Create a logger
	logger: Logger = Logger.create();

	// The device we are connected to
	device: CloverDevice;

	// Hold the current merchant info
	merchantInfo: sdk.remotepay.MerchantInfo;

	// The device observer for this connector
	deviceObserver: sdk.remotepay.ICloverConnectorListener;

	// List of listeners to broadcast notifications to
	broadcaster: CloverConnectorBroadcaster;

	// Device Configuration for this connector
	configuration: CloverDeviceConfiguration;

	// Flag indicating whether the device is ready or not
	isReady: boolean = false;

	// Hold the last request
	lastRequest: any;

	constructor(config: CloverDeviceConfiguration) {
		// Set the cancel input option
		CloverConnector.CANCEL_INPUT_OPTION = new sdk.remotemessage.InputOption(sdk.remotemessage.KeyPress.ESC, "Cancel");

		// Try to load the configuration.
		if (config) {
			try {
				// Make sure we do not change the passed object, make a copy.
				this.configuration = JSON.parse(JSON.stringify(config));
			}
			catch(e) {
				this.logger.error('Could not load configuration', e);
				throw e;
			}
		}
	}

	/**
	 * Initialize the connector with a new config
	 * 
	 * @param {CloverDeviceConfiguration} config - the configuration for the connector
	 */
	public initialize(config: CloverDeviceConfiguration): void {
		try {
			// Make sure we do not change the passed object, make a copy.
			this.configuration = JSON.parse(JSON.stringify(config));
		}
		catch(e) {
			this.logger.error('Could not load configuration', e);
			throw e;
		}
		this.deviceObserver = new CloverConnector.InnerDeviceObserver(this);

		// Get the device and subscribe to it.
		this.device = CloverDeviceFactory.get(config);
		if (this.device !== null) {
			this.device.subscribe(this.deviceObserver);
		}
	}

	public initializeConnection(): void {
		if (this.device === null) {
			this.initialize(this.configuration);
		}
	}

	/**
	 * Add new listener to receive broadcast notifications
	 * 
	 * @param {ICloverConnectorListener} connectorListener - the listener to add
	 */
	public addCloverConnectorListener(connectorListener: sdk.remotepay.ICloverConnectorListener): void {
		this.broadcaster.push(connectorListener);
	}

	/**
	 * Remove a listener
	 * 
	 * @param {ICloverConnectorListener} connectorListener - the listener to remove
	 */
	public removeCloverConnectorListener(connectorListener: sdk.remotepay.ICloverConnectorListener): void {
		var indexOfListener = this.broadcaster.indexOf(connectorListener);
		if (indexOfListener !== -1) {
			this.broadcaster.splice(indexOfListener, 1);
		}
	}

	public sale(request: sdk.remotepay.SaleRequest): void {
		this.lastRequest = request;
		if (this.device == null || !this.isReady) {
			this.deviceObserver.onFinishCancel(ResultCode.ERROR, "Device Connection Error", "In sale: SaleRequest - The Clover device is not connected.");
		}
		else if (request == null) {
			this.deviceObserver.onFinishCancel(ResultCode.FAIL, "Invalid Argument.", "In sale: SaleRequest - The request that was passed in for processing is null.");
		}
		else if (request.getAmount() <= 0) {
			this.deviceObserver.onFinishCancel(ResultCode.FAIL, "Request Validation Error", "In sale: SaleRequest - The request amount cannot be zero. Original Request = " + request);
		}
		else if (request.getTipAmount() !== null && request.getTipAmount() < 0) {
			this.deviceObserver.onFinishCancel(ResultCode.FAIL, "Request Validation Error", "In sale: SaleRequest - The tip amount cannot be less than zero. Original Request = " + request);
		}
		else if (request.getExternalId() == null || request.getExternalId().trim().length() == 0 || request.getExternalId().trim().length() > 32){
			this.deviceObserver.onFinishCancel(ResultCode.FAIL, "Invalid Argument.", "In sale: SaleRequest - The externalId is required and the max length is 32 characters. Original Request = " + request);
		}
		else if (request.getVaultedCard() !== null && !this.merchantInfo.supportsVaultCards) {
			this.deviceObserver.onFinishCancel(ResultCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In sale: SaleRequest - Vault Card support is not enabled for the payment gateway. Original Request = " + request);
		} else {
			if (request.getTipAmount() == null) {
				request.setTipAmount(0);
			}
			try {
				this.saleAuth(request, false);
			}
			catch(e) {
				this.deviceObserver.onFinishCancel(ResultCode.ERROR, e, null);
			}
		}
	}

	/**
	 * A common PayIntent builder method for Sale, Auth and PreAuth
	 *
	 * @param request
	 */
	private saleAuth(request: sdk.remotepay.TransactionRequest, suppressTipScreen: boolean): void {
		if (this.device !== null && this.isReady) {
			this.lastRequest = request;

			let builder: sdk.remotemessage.PayIntent.Builder = new sdk.remotemessage.PayIntent.Builder();
			builder.transactionType(request.getType()); // difference between sale, auth and auth(preAuth)
			builder.amount(request.getAmount());
			builder.cardEntryMethods(request.getCardEntryMethods() !== null ? request.getCardEntryMethods() : this.cardEntryMethods);
			if (request.getDisablePrinting() !== null) {
				builder.remotePrint(request.getDisablePrinting());
			}
			if (request.getCardNotPresent() !== null) {
				builder.cardNotPresent(request.getCardNotPresent());
			}
			if (request.getDisableRestartTransactionOnFail() !== null) {
				builder.disableRestartTransactionWhenFailed(request.getDisableRestartTransactionOnFail());
			}
			builder.vaultedCard(request.getVaultedCard());
			builder.externalPaymentId(request.getExternalId().trim());
			builder.requiresRemoteConfirmation(true);

			if (request instanceof sdk.remotepay.PreAuthRequest) {
				// nothing extra as of now
			}
			else if (request instanceof sdk.remotepay.AuthRequest) {
				let req: sdk.remotepay.AuthRequest = request;
				if (req.getTippableAmount() !== null) {
					builder.tippableAmount(req.getTippableAmount());
				}
				if (req.getAllowOfflinePayment() !== null) {
					builder.allowOfflinePayment(req.getAllowOfflinePayment());
				}
				if (req.getApproveOfflinePaymentWithoutPrompt() !== null) {
					builder.approveOfflinePaymentWithoutPrompt(req.getApproveOfflinePaymentWithoutPrompt());
				}
				if (req.getDisableCashback() !== null) {
					builder.disableCashback(req.getDisableCashback());
				}
				if (req.getTaxAmount() !== null) {
					builder.taxAmount(req.getTaxAmount());
				}
			}
			else if (request instanceof sdk.remotepay.SaleRequest) {
				let req: sdk.remotepay.SaleRequest = request;
				// shared with AuthRequest
				if (req.getAllowOfflinePayment() !== null) {
					builder.allowOfflinePayment(req.getAllowOfflinePayment());
				}
				if (req.getApproveOfflinePaymentWithoutPrompt() !== null) {
					builder.approveOfflinePaymentWithoutPrompt(req.getApproveOfflinePaymentWithoutPrompt());
				}
				if (req.getDisableCashback() !== null) {
					builder.disableCashback(req.getDisableCashback());
				}
				if (req.getTaxAmount() !== null) {
					builder.taxAmount(req.getTaxAmount());
				}
				// SaleRequest
				if (req.getTippableAmount() !== null) {
					builder.tippableAmount(req.getTippableAmount());
				}
				if (req.getTipAmount() !== null) {
					builder.tipAmount(req.getTipAmount());
				}

				// sale could pass in the tipAmount and not override on the screen,
				// but that is the exceptional case
				if (req.getDisableTipOnScreen() !== null) {
					suppressTipScreen = req.getDisableTipOnScreen();
				}
			}

			let payIntent: sdk.remotemessage.PayIntent = builder.build();
			this.device.doTxStart(payIntent, null, suppressTipScreen); //
		}
	}

	public acceptSignature(request: sdk.remotepay.VerifySignatureRequest): void {
		if (this.device == null || !this.isReady) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In acceptSignature: Device is not connected."));
		} else if(request == null) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In acceptSignature: VerifySignatureRequest cannot be null."));
		} else if(request.getPayment() == null || request.getPayment().getId() == null) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In acceptSignature: VerifySignatureRequest. Payment must have anID."));
		} else {
			this.device.doSignatureVerified(request.getPayment(), true);
		}
	}

	public rejectSignature(request: sdk.remotepay.VerifySignatureRequest): void {
		if (this.device == null || !this.isReady) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In rejectSignature: Device is not connected."));
		} else if(request == null) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In rejectSignature: VerifySignatureRequest cannot be null."));
		} else if(request.getPayment() == null || request.getPayment().getId() == null) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In rejectSignature: VerifySignatureRequest.Payment must have an ID."));
		} else {
			this.device.doSignatureVerified(request.getPayment(), false);
		}
	}

	public acceptPayment(payment: sdk.payments.Payment): void {
		if (this.device == null || !this.isReady) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In acceptPayment: Device is not connected."));
		} else if(payment == null) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In acceptPayment: Payment cannot be null."));
		} else if(payment.getId() == null) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In acceptPayment: Payment must have an ID."));
		} else {
			this.device.doAcceptPayment(payment);
		}
	}

	public rejectPayment(payment: sdk.payments.Payment, challenge: sdk.base.Challenge): void {
		if (this.device == null || !this.isReady) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In rejectPayment: Device is not connected."));
		} else if(payment == null) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In rejectPayment: Payment cannot be null."));
		} else if(payment.getId() == null) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In rejectPayment: Payment must have an ID."));
		} else if(challenge == null) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In rejectPayment: Challenge cannot be null."));
		} else {
			this.device.doRejectPayment(payment, challenge);
		}
	}

	public auth(request: sdk.remotepay.AuthRequest): void {
		this.lastRequest = request;
		if (this.device == null || !this.isReady) {
			this.deviceObserver.onFinishCancel(ResultCode.ERROR, "Device connection Error", "In auth: Auth Request - The Clover device is not connected.");
		} else if (!this.merchantInfo.supportsAuths) {
			this.deviceObserver.onFinishCancel(ResultCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In auth: AuthRequest - Auths are not enabled for the payment gateway. Original Request = " + request);
		} else if(request == null) {
			this.deviceObserver.onFinishCancel(ResultCode.FAIL, "Invalid Argument.", "In auth: AuthRequest - The request that was passed in for processing is null.");
		} else if(request.getAmount() <= 0) {
			this.deviceObserver.onFinishCancel(
			ResultCode.FAIL, "Request Validation Error", "In auth: AuthRequest - The request amount cannot be zero. Original Request = " + request);
		} else if (request.getExternalId() == null || request.getExternalId().trim().length() == 0 || request.getExternalId().trim().length() > 32){
			this.deviceObserver.onFinishCancel(ResultCode.FAIL, "Invalid Argument.", "In auth: AuthRequest - The externalId is invalid. It is required and the max length is 32. Original Request = " + request);
		} else if (request.getVaultedCard() !== null && !this.merchantInfo.supportsVaultCards) {
			this.deviceObserver.onFinishCancel(ResultCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In auth: AuthRequest - Vault Card support is not enabled for the payment gateway. Original Request = " + request);
		} else {
			try {
				this.saleAuth(request, true);
			}
			catch(e) {
				this.deviceObserver.onFinishCancel(ResultCode.ERROR, e, null);
			}
		}
	}

	public preAuth(request: sdk.remotepay.PreAuthRequest): void {
		this.lastRequest = request;
		if (this.device == null || !this.isReady) {
			this.deviceObserver.onFinishCancel(ResultCode.ERROR, "Device connection Error", "In preAuth: PreAuthRequest - The Clover device is not connected.");
		}
		else if (!this.merchantInfo.supportsPreAuths) {
			this.deviceObserver.onFinishCancel(ResultCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In preAuth: PreAuthRequest - PreAuths are not enabled for the payment gateway. Original Request = " + request);
		}
		else if (request == null) {
			this.deviceObserver.onFinishCancel(ResultCode.FAIL, "Invalid Argument.", "In preAuth: PreAuthRequest - The request that was passed in for processing is null.");
		}
		else if (request.getAmount() <= 0) {
			this.deviceObserver.onFinishCancel(ResultCode.FAIL, "Request Validation Error", "In preAuth: PreAuthRequest - The request amount cannot be zero. Original Request = " + request);
		}
		else if (request.getExternalId() == null || request.getExternalId().trim().length() == 0 || request.getExternalId().trim().length() > 32){
			this.deviceObserver.onFinishCancel(ResultCode.FAIL, "Invalid Argument.", "In preAuth: PreAuthRequest - The externalId is invalid. It is required and the max length is 32. Original Request = " + request);
		}
		else if (request.getVaultedCard() !== null && !this.merchantInfo.supportsVaultCards) {
			this.deviceObserver.onFinishCancel(ResultCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In preAuth: PreAuthRequest - Vault Card support is not enabled for the payment gateway. Original Request = " + request);
		}
		else {
			try {
				this.saleAuth(request, true);
			}
			catch(e) {
				this.lastRequest = null;
				this.deviceObserver.onFinishCancel(ResultCode.ERROR, e, null);
			}
		}
	}

	public capturePreAuth(request: sdk.remotepay.CapturePreAuthRequest): void {
		if (this.device == null || !this.isReady) {
			this.deviceObserver.onCapturePreAuth(ResultCode.ERROR, "Device connection Error", "In capturePreAuth: CapturePreAuth - The Clover device is not connected.", null, null);
		}
		else if (!this.merchantInfo.supportsPreAuths) {
			this.deviceObserver.onCapturePreAuth(ResultCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In capturePreAuth: PreAuth Captures are not enabled for the payment gateway. Original Request = " + request, null, null);
		}
		else if (request == null) {
			this.deviceObserver.onCapturePreAuth(ResultCode.FAIL, "Invalid Argument.", "In capturePreAuth: CapturePreAuth - The request that was passed in for processing is null.", null, null);
		}
		else if (request.getAmount() < 0 || request.getTipAmount() < 0) {
			this.deviceObserver.onCapturePreAuth(ResultCode.FAIL, "Request Validation Error", "In capturePreAuth: CapturePreAuth - The request amount must be greater than zero and the tip must be greater than or equal to zero. Original Request = " + request, null, null);
		}
		else {
			try {
				this.device.doCaptureAuth(request.paymentID, request.amount, request.tipAmount);
			}
			catch(e) {
				let response: sdk.remotepay.CapturePreAuthResponse = new sdk.remotepay.CapturePreAuthResponse(false, ResultCode.UNSUPPORTED);
				response.setReason("Pre Auths unsupported");
				response.setMessage("The currently configured merchant gateway does not support Capture Auth requests.");
				this.broadcaster.notifyOnCapturePreAuth(response);
			}
		}
	}

	public tipAdjustAuth(request: sdk.remotepay.TipAdjustAuthRequest): void {
		if (this.device == null || !this.isReady) {
			this.deviceObserver.onAuthTipAdjusted(ResultCode.ERROR, "Device connection Error", "In tipAdjustAuth: TipAdjustAuthRequest - The Clover device is not connected.");
		}
		else if (!this.merchantInfo.supportsTipAdjust) {
			this.deviceObserver.onAuthTipAdjusted(ResultCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In tipAdjustAuth: TipAdjustAuthRequest - Tip Adjustments are not enabled for the payment gateway. Original Request = " + request);
		}
		else if (request == null) {
			this.deviceObserver.onAuthTipAdjusted(ResultCode.FAIL, "Invalid Argument.", "In tipAdjustAuth: TipAdjustAuthRequest - The request that was passed in for processing is null.");
		}
		else if (request.getPaymentId() == null) {
			this.deviceObserver.onAuthTipAdjusted(ResultCode.FAIL, "Invalid Argument.", "In tipAdjustAuth: TipAdjustAuthRequest - The paymentId is required.");
		}
		else if (request.getTipAmount() < 0) {
			this.deviceObserver.onAuthTipAdjusted(ResultCode.FAIL, "Request Validation Error", "In tipAdjustAuth: TipAdjustAuthRequest - The request amount cannot be less than zero. Original Request = " + request);
		}
		else {
			this.device.doTipAdjustAuth(request.getOrderId(), request.getPaymentId(), request.getTipAmount());
		}
	}

	public vaultCard(cardEntryMethods: number): void {
		if (this.device == null || !this.isReady) {
			this.deviceObserver.onVaultCardResponse(false, ResultCode.ERROR, "Device connection Error", "In vaultCard: The Clover device is not connected.", null);
		}
		else if (!this.merchantInfo.supportsVaultCards) {
			this.deviceObserver.onVaultCardResponse(false, ResultCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In vaultCard: VaultCard/Payment Tokens are not enabled for the payment gateway.", null);
		}
		else {
			this.device.doVaultCard(cardEntryMethods !== null ? cardEntryMethods : this.getCardEntryMethods());
		}
	}

	public voidPayment(request: sdk.remotepay.VoidPaymentRequest): void {
		if (this.device == null || !this.isReady) {
			this.deviceObserver.onPaymentVoided(ResultCode.ERROR, "Device connection Error", "In voidPayment: VoidPaymentRequest - The Clover device is not connected.");
		}
		else if (request == null) {
			this.deviceObserver.onPaymentVoided(ResultCode.FAIL, "Invalid Argument.", "In voidPayment: VoidPaymentRequest - The request that was passed in for processing is null.");
		}
		else if (request.getPaymentId() == null) {
			this.deviceObserver.onPaymentVoided(ResultCode.FAIL, "Invalid Argument.", "In voidPayment: VoidPaymentRequest - The paymentId is required.");
		}
		else {
			let payment: sdk.payments.Payment = new sdk.payments.Payment();
			payment.setId(request.getPaymentId());
			payment.setOrder(new sdk.base.Reference());
			payment.getOrder().setId(request.getOrderId());
			payment.setEmployee(new sdk.base.Reference());
			payment.getEmployee().setId(request.getEmployeeId());
			let reason: sdk.order.VoidReason = sdk.order.VoidReason[request.getVoidReason()];
			this.device.doVoidPayment(payment, reason);
		}
	}

	public refundPayment(request: sdk.remotepay.RefundPaymentRequest): void {
		if (this.device == null || !this.isReady) {
			let prr: sdk.remotepay.RefundPaymentResponse = new sdk.remotepay.RefundPaymentResponse(false, ResultCode.ERROR);
			prr.setRefund(null);
			prr.setReason("Device Connection Error");
			prr.setMessage("In refundPayment: RefundPaymentRequest - The Clover device is not connected.");
			this.deviceObserver.lastPRR = prr;
			this.deviceObserver.onFinishCancel();
		}
		else if (request == null) {
			let prr: sdk.remotepay.RefundPaymentResponse = new sdk.remotepay.RefundPaymentResponse(false, ResultCode.FAIL);
			prr.setRefund(null);
			prr.setReason("Request Validation Error");
			prr.setMessage("In refundPayment: RefundPaymentRequest - The request that was passed in for processing is empty.");
			this.deviceObserver.lastPRR = prr;
			this.deviceObserver.onFinishCancel();
		}
		else if (request.getPaymentId() == null) {
			let prr: sdk.remotepay.RefundPaymentResponse = new sdk.remotepay.RefundPaymentResponse(false, ResultCode.FAIL);
			prr.setRefund(null);
			prr.setReason("Request Validation Error");
			prr.setMessage("In refundPayment: RefundPaymentRequest PaymentID cannot be empty. " + request);
			this.deviceObserver.lastPRR = prr;
			this.deviceObserver.onFinishCancel();
		}
		else if (request.getAmount() <= 0 && !request.isFullRefund()) {
			let prr: sdk.remotepay.RefundPaymentResponse = new sdk.remotepay.RefundPaymentResponse(false, ResultCode.FAIL);
			prr.setRefund(null);
			prr.setReason("Request Validation Error");
			prr.setMessage("In refundPayment: RefundPaymentRequest Amount must be greater than zero when FullRefund is set to false. " + request);
			this.deviceObserver.lastPRR = prr;
			this.deviceObserver.onFinishCancel();
		}
		else {
			this.device.doPaymentRefund(request.getOrderId(), request.getPaymentId(), request.getAmount(), request.isFullRefund());
		}
	}

	public manualRefund(request: sdk.remotepay.ManualRefundRequest): void { // NakedRefund is a Transaction, with just negative amount
		this.lastRequest = request;
		if (this.device == null || !this.isReady) {
			this.deviceObserver.onFinishCancel(ResultCode.ERROR, "Device connection Error", "In manualRefund: ManualRefundRequest - The Clover device is not connected.");
		}
		else if (!this.merchantInfo.supportsManualRefunds) {
			this.deviceObserver.onFinishCancel(ResultCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In manualRefund: ManualRefundRequest - Manual Refunds are not enabled for the payment gateway. Original Request = " + request);
		}
		else if (request == null) {
			this.deviceObserver.onFinishCancel(ResultCode.FAIL, "Invalid Argument.", "In manualRefund: ManualRefundRequest - The request that was passed in for processing is null.");
		}
		else if (request.getAmount() <= 0) {
			this.deviceObserver.onFinishCancel(ResultCode.FAIL, "Request Validation Error", "In manualRefund: ManualRefundRequest - The request amount cannot be zero. Original Request = " + request);
		}
		else if (request.getExternalId() == null || request.getExternalId().trim().length() == 0 || request.getExternalId().trim().length() > 32) {
			this.deviceObserver.onFinishCancel(ResultCode.FAIL, "Invalid Argument.", "In manualRefund: ManualRefundRequest - The externalId is invalid. It is required and the max length is 32. Original Request = " + request);
		}
		else if (request.getVaultedCard() !== null && !this.merchantInfo.supportsVaultCards) {
			this.deviceObserver.onFinishCancel(ResultCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In manualRefund: ManualRefundRequest - Vault Card support is not enabled for the payment gateway. Original Request = " + request);
		}
		else {
			let builder: sdk.remotepay.PayIntent.Builder = new sdk.remotepay.PayIntent.Builder();
			builder.amount(-Math.abs(request.getAmount()))
				.cardEntryMethods(request.getCardEntryMethods() !== null ? request.getCardEntryMethods() : this.cardEntryMethods)
				.transactionType(sdk.remotepay.PayIntent.TransactionType.PAYMENT.CREDIT)
				.vaultedCard(request.getVaultedCard())
				.externalPaymentId(request.getExternalId());

			if (request.getDisablePrinting() !== null) {
				builder.remotePrint(request.getDisablePrinting());
			}

			if (request.getDisableRestartTransactionOnFail() !== null) {
				builder.disableRestartTransactionWhenFailed(request.getDisableRestartTransactionOnFail());
			}

			let payIntent: sdk.remotepay.PayIntent = builder.build();
			this.device.doTxStart(payIntent, null, true);
		}
	}

	public retrievePendingPayments(): void {
		if (this.device == null || !this.isReady) {
			this.deviceObserver.onPendingPaymentsResponse(ResultCode.ERROR, "Device connection Error", "In retrievePendingPayments: The Clover device is not connected.");
		}
		else {
			this.device.doRetrievePendingPayments();
		}
	}

	public readCardData(request: sdk.remotepay.ReadCardDataRequest): void {
		if (this.device == null || !this.isReady) {
			this.deviceObserver.onReadCardDataResponse(ResultCode.ERROR, "Device connection Error", "In readCardData: The Clover device is not connected.");
		}
		else if (request == null) {
			this.deviceObserver.onFinishCancel(ResultCode.FAIL, "Invalid Argument.", "In readCardData: ReadCardDataRequest - The request that was passed in for processing is null.");
		}
		else {
			// create pay intent...
			let builder: sdk.remotemessage.PayIntent.Builder = new sdk.remotemessage.PayIntent.Builder();
			builder.transactionType(sdk.remotepay.PayIntent.TransactionType.DATA);
			builder.cardEntryMethods(request.getCardEntryMethods() !== null ? request.getCardEntryMethods() : this.cardEntryMethods);
			builder.forceSwipePinEntry(request.isForceSwipePinEntry());

			let pi: sdk.remotepay.PayIntent = builder.build();
			this.device.doReadCardData(pi);
		}
	}

	public closeout(request: sdk.remotepay.CloseoutRequest): void {
		if (this.device == null || !this.isReady) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In closeout: CloseoutRequest - The Clover device is not connected."));
		}
		else {
			this.device.doCloseout(request.isAllowOpenTabs(), request.getBatchId());
		}
	}

	public cancel(): void {
		if (this.device == null || !this.isReady) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In cancel: The Clover device is not connected."));
		}
		else {
			this.invokeInputOption(CloverConnector.CANCEL_INPUT_OPTION);
		}
	}

	public printText(messages: Array<string>): void {
		if (this.device == null || !this.isReady) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In printText: The Clover device is not connected."));
		} else if(messages == null) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In printText: Invalid argument. Null is not allowed."));
		} else {
			this.device.doPrintText(messages);
		}
	}

	public printImage(bitmap: number[]): void { //Bitmap img
		if (this.device == null || !this.isReady) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In printImage: The Clover device is not connected."));
		}
		else if (bitmap == null) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In printImage: Invalid argument.  Null is not allowed."));
		}
		else {
			this.device.doPrintImage(bitmap);
		}
	}

	public printImageFromURL(url: string): void {
		if (this.device == null || !this.isReady) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In printImageFromURL: The Clover device is not connected."));
		}
		else if (url == null) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In printImageFromURL: Invalid argument.  Null is not allowed."));
		}
		else {
			this.device.doPrintImage(url);
		}
	}

	public showMessage(message: string): void {
		if (this.device == null || !this.isReady) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In showMessage: The Clover device is not connected."));
		}
		else if (message == null) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In showMessage: Invalid argument.  Null is not allowed."));
		}
		else {
			this.device.doTerminalMessage(message);
		}
	}

	public showWelcomeScreen(): void {
		if (this.device == null || !this.isReady) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In showWelcomeScreen: The Clover device is not connected."));
		} else {
			this.device.doShowWelcomeScreen();
		}
	}

	public showThankYouScreen(): void {
		if (this.device == null || !this.isReady) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In showThankYouScreen: The Clover device is not connected."));
		} else {
			this.device.doShowThankYouScreen();
		}
	}

	public displayPaymentReceiptOptions(orderId: string, paymentId: string): void {
		if (this.device == null || !this.isReady) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In displayPaymentReceiptOptions: The Clover device is not connected."));
		}
		else if (orderId == null) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In displayPaymentReceiptOptions: Invalid argument.  The orderId cannot be null."));
		}
		else if (paymentId == null) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In displayPaymentReceiptOptions: Invalid argument.  The paymentId cannot be null."));
		}
		else {
			this.device.doShowPaymentReceiptScreen(orderId, paymentId);
		}
	}

	public openCashDrawer(reason: string): void {
		if (this.device == null || !this.isReady) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In displayPaymentReceiptOptions: The Clover device is not connected."));
		}
		else {
			this.device.doOpenCashDrawer(reason);
		}
	}

	public showDisplayOrder(order: sdk.order.DisplayOrder): void {
		if (this.device == null || !this.isReady) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In showDisplayOrder: The Clover device is not connected."));
		}
		else if (order == null) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In showDisplayOrder: Invalid argument.  The order cannot be null."));
		}
		else {
			this.device.doOrderUpdate(order, null);
		}
	}

	public removeDisplayOrder(order: sdk.order.DisplayOrder): void {
		if (this.device == null || !this.isReady) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In removeDisplayOrder: The Clover device is not connected."));
		}
		else if (order == null) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.VALIDATION_ERROR, 0, "In removeDisplayOrder: Invalid argument.  The order cannot be null."));
		}
		else {
			let dao: sdk.order.operation.OrderDeletedOperation = new sdk.order.operation.OrderDeletedOperation();
			dao.setId(order.getId());
			this.device.doOrderUpdate(order, dao);
		}
	}

	public dispose(): void {
		this.broadcaster.clear();
		if (this.device !== null) {
			this.device.dispose();
		}
	}

	public invokeInputOption(io: sdk.remotemessage.InputOption): void {
		if (this.device == null || !this.isReady) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In invokeInputOption: The Clover device is not connected."));
		}
		else {
			this.device.doKeyPress(io.keyPress);
		}
	}

	public resetDevice(): void {
		if (this.device == null || !this.isReady) {
			this.broadcaster.notifyOnDeviceError(new sdk.remotepay.CloverDeviceErrorEvent(sdk.remotepay.CloverDeviceErrorEvent.CloverDeviceErrorType.COMMUNICATION_ERROR, 0, "In resetDevice: The Clover device is not connected."));
		}
		else {
			this.device.doResetDevice();
		}
	}

	private getCardEntryMethods(): number {
		return this.cardEntryMethods;
	}
}

export namespace CloverConnector {
	export class InnerDeviceObserver implements CloverDeviceObserver {
		// Create a logger
		logger: Logger = Logger.create();

		// Clover connector we are using
		cloverConnector: CloverConnector;

		// Hold the last Payment Refund Response
		lastPRR: sdk.remotepay.RefundPaymentResponse;

		constructor(cc: CloverConnector) {
			this.cloverConnector = cc;
		}

		public onTxState(txState: sdk.remotemessage.TxState): void {
		}

		public onTxStartResponse(result: sdk.remotemessage.TxStartResponseResult, externalId: string): void {
			if (result == sdk.remotemessage.TxStartResponseResult.SUCCESS) return;

			let duplicate: boolean = (result == sdk.remotemessage.TxStartResponseResult.DUPLICATE);
			let code: ResultCode = duplicate ? ResultCode.CANCEL : ResultCode.FAIL;
			let message: string = duplicate ? "The provided transaction id of " + externalId + " has already been processed and cannot be resubmitted." : null;
			try {
				if (this.cloverConnector.lastRequest instanceof sdk.remotepay.PreAuthRequest) {
					let response: sdk.remotepay.PreAuthResponse = new sdk.remotepay.PreAuthResponse(false, code);
					response.setReason(result.toString());
					response.setMessage(message);
					this.cloverConnector.broadcaster.notifyOnPreAuthResponse(response);
				}
				else if (this.cloverConnector.lastRequest instanceof sdk.remotepay.AuthRequest) {
					let response: sdk.remotepay.AuthResponse = new sdk.remotepay.AuthResponse(false, code);
					response.setReason(result.toString());
					response.setMessage(message);
					this.cloverConnector.broadcaster.notifyOnAuthResponse(response);
				}
				else if (this.cloverConnector.lastRequest instanceof sdk.remotepay.SaleRequest) {
					let response: sdk.remotepay.SaleResponse = new sdk.remotepay.SaleResponse(false, code);
					response.setReason(result.toString());
					response.setMessage(message);
					this.cloverConnector.broadcaster.notifyOnSaleResponse(response);
				}
				else if (this.cloverConnector.lastRequest instanceof sdk.remotepay.ManualRefundRequest) {
					let response: sdk.remotepay.ManualRefundResponse = new sdk.remotepay.ManualRefundResponse(false, code);
					response.setReason(result.toString());
					response.setMessage(message);
					this.cloverConnector.broadcaster.notifyOnManualRefundResponse(response);
				}
			}
			finally {
				this.cloverConnector.lastRequest = null;
			}
		}

		public onUiState(uiState: sdk.remotemessage.UiState, uiText: string, uiDirection: sdk.remotemessage.UiState.UiDirection, inputOptions: Array<sdk.remotemessage.InputOption>): void {
			let deviceEvent: sdk.remotepay.CloverDeviceEvent = new sdk.remotepay.CloverDeviceEvent();
			deviceEvent.setInputOptions(inputOptions);
			deviceEvent.setEventState(sdk.remotepay.DeviceEventState[uiState.toString()]);
			deviceEvent.setMessage(uiText);
			if (uiDirection == sdk.remotemessage.UiState.UiDirection.ENTER) {
				this.cloverConnector.broadcaster.notifyOnDeviceActivityStart(deviceEvent);
			}
			else if (uiDirection == sdk.remotemessage.UiState.UiDirection.EXIT) {
				this.cloverConnector.broadcaster.notifyOnDeviceActivityEnd(deviceEvent);
				if (uiState.toString() == sdk.remotepay.DeviceEventState.RECEIPT_OPTIONS.toString()) {
					this.cloverConnector.device.doShowWelcomeScreen();
				}
			}
		}

		public onTipAdded(tip: number): void {
			this.cloverConnector.broadcaster.notifyOnTipAdded(tip);
		}

		public onAuthTipAdjusted(paymentId: string, tipAmount: number, success: boolean): void;
		public onAuthTipAdjusted(result: ResultCode, reason: string, message: string): void;
		public onAuthTipAdjusted(status: sdk.remotemessage.ResultStatus, reason: string, message: string): void;
		public onAuthTipAdjusted(resultStatusOrPaymentId: any, reasonOrTipAmount: any, messageOrSuccess: any): void {
			if (typeof resultStatusOrPaymentId == 'string') {
				if (messageOrSuccess) {
					this.onAuthTipAdjustedHandler(resultStatusOrPaymentId, reasonOrTipAmount, messageOrSuccess, ResultCode.SUCCESS, null, null);
				}
				else {
					this.onAuthTipAdjustedHandler(resultStatusOrPaymentId, reasonOrTipAmount, messageOrSuccess, ResultCode.FAIL, 'Failure', 'TipAdjustAuth failed to process for payment ID: ' + resultStatusOrPaymentId);
				}
			}
			else if (resultStatusOrPaymentId instanceof sdk.remotemessage.ResultStatus) {
				this.onAuthTipAdjusted(resultStatusOrPaymentId == sdk.remotemessage.ResultStatus.SUCCESS ? ResultCode.SUCCESS : ResultCode.FAIL, reasonOrTipAmount, messageOrSuccess);
			}
			else {
				this.onAuthTipAdjustedHandler(null, 0, false, resultStatusOrPaymentId, reasonOrTipAmount, messageOrSuccess);
			}
		}
		private onAuthTipAdjustedHandler(paymentId: string, tipAmount: number, success: boolean, result: ResultCode, reason: string, message: string): void {
			let taar: sdk.remotepay.TipAdjustAuthResponse = new sdk.remotepay.TipAdjustAuthResponse(success, result);
			taar.setPaymentId(paymentId);
			taar.setTipAmount(tipAmount);
			taar.setSuccess(success);
			taar.setResult(result);
			taar.setReason(reason);
			taar.setMessage(message);
			this.cloverConnector.broadcaster.notifyOnTipAdjustAuthResponse(taar);
		}

		public onCashbackSelected(cashbackAmount: number): void {
			//TODO: For future use
		}

		public onPartialAuth(partialAmount: number): void {
			//TODO: For future use
		}

		public onFinishOk(payment: sdk.payments.Payment, signature: sdk.base.Signature): void;
		public onFinishOk(credit: sdk.payments.Credit): void;
		public onFinishOk(refund: sdk.payments.Refund): void;
		public onFinishOk(paymentCreditOrRefund: any, signature?: sdk.base.Signature): void {
			if (paymentCreditOrRefund instanceof sdk.payments.Payment && signature) {
				try {
					this.cloverConnector.device.doShowThankYouScreen(); //need to do this first, so Listener implementation can replace the screen as desired
					if (this.cloverConnector.lastRequest instanceof sdk.remotepay.PreAuthRequest) {
						let response: sdk.remotepay.PreAuthResponse = new sdk.remotepay.PreAuthResponse(true, ResultCode.SUCCESS);
						response.setPayment(paymentCreditOrRefund);
						response.setSignature(signature);
						this.cloverConnector.broadcaster.notifyOnPreAuthResponse(response);
						this.cloverConnector.lastRequest = null;
					}
					else if (this.cloverConnector.lastRequest instanceof sdk.remotepay.AuthRequest) {
						let response: sdk.remotepay.AuthResponse = new sdk.remotepay.AuthResponse(true, ResultCode.SUCCESS);
						response.setPayment(paymentCreditOrRefund);
						response.setSignature(signature);
						this.cloverConnector.broadcaster.notifyOnAuthResponse(response);
						this.cloverConnector.lastRequest = null;
					}
					else if (this.cloverConnector.lastRequest instanceof sdk.remotepay.SaleRequest) {
						let response: sdk.remotepay.SaleResponse = new sdk.remotepay.SaleResponse(true, ResultCode.SUCCESS);
						response.setPayment(paymentCreditOrRefund);
						response.setSignature(signature);
						this.cloverConnector.broadcaster.notifyOnSaleResponse(response);
						this.cloverConnector.lastRequest = null;
					}
					else if (this.cloverConnector.lastRequest == null) {
						this.cloverConnector.device.doShowWelcomeScreen();
					}
					else {
						this.logger.error("Failed to pair this response: " + paymentCreditOrRefund);
					}
				}
				finally {
					// do nothing for now...
				}
			}
			else if (paymentCreditOrRefund instanceof sdk.payments.Credit) {
				try {
					this.cloverConnector.device.doShowWelcomeScreen();
					this.cloverConnector.lastRequest = null;
					let response: sdk.remotepay.ManualRefundResponse = new sdk.remotepay.ManualRefundResponse(true, ResultCode.SUCCESS);
					response.setCredit(paymentCreditOrRefund);
					this.cloverConnector.broadcaster.notifyOnManualRefundResponse(response);
				}
				finally {}
			}
			else {
				try {
					this.cloverConnector.device.doShowWelcomeScreen();
					this.cloverConnector.lastRequest = null;
					let lastRefundResponse: sdk.remotepay.RefundPaymentResponse = this.lastPRR;
					this.lastPRR = null;

					// Since finishOk is the more appropriate/consistent location in the "flow" to
					// publish the RefundResponse (like SaleResponse, AuthResponse, etc., rather
					// than after the server call, which calls onPaymetRefund),
					// we will hold on to the response from
					// onRefundResponse (Which has more information than just the refund) and publish it here
					if (lastRefundResponse !== null) {
						if (lastRefundResponse.getRefund().getId() == paymentCreditOrRefund.getId()) {
							this.cloverConnector.broadcaster.notifyOnRefundPaymentResponse(lastRefundResponse);
						}
						else {
							this.logger.error("The last PaymentRefundResponse has a different refund than this refund in finishOk");
						}
					}
					else {
						this.logger.error("Shouldn't get an onFinishOk with having gotten an onPaymentRefund!");
					}
				}
				finally {}
			}
		}

		public onFinishCancel(): void;
		public onFinishCancel(result: ResultCode, reason: string, message: string): void;
		public onFinishCancel(result?: ResultCode, reason?: string, message?: string): void {
			if (!result) {
				this.onFinishCancel(ResultCode.CANCEL, null, null);
				return;
			}

			try {
				this.cloverConnector.device.doShowWelcomeScreen();
				let lastReq: any = this.cloverConnector.lastRequest;
				this.cloverConnector.lastRequest = null;
				if (lastReq instanceof sdk.remotepay.PreAuthRequest) {
					let preAuthResponse: sdk.remotepay.PreAuthResponse = new sdk.remotepay.PreAuthResponse(false, result);
					preAuthResponse.setReason(reason !== null ? reason : "Request Canceled");
					preAuthResponse.setMessage(message !== null ? message : "The PreAuth Request was canceled.");
					preAuthResponse.setPayment(null);
					this.cloverConnector.broadcaster.notifyOnPreAuthResponse(preAuthResponse);
				}
				else if (lastReq instanceof sdk.remotepay.SaleRequest) {
					let saleResponse: sdk.remotepay.SaleResponse = new sdk.remotepay.SaleResponse(false, result);
					saleResponse.setReason(reason !== null ? reason : "Request Canceled");
					saleResponse.setMessage(message !== null ? message : "The Sale Request was canceled.");
					saleResponse.setPayment(null);
					this.cloverConnector.broadcaster.notifyOnSaleResponse(saleResponse);
				}
				else if (lastReq instanceof sdk.remotepay.AuthRequest) {
					let authResponse: sdk.remotepay.AuthResponse = new sdk.remotepay.AuthResponse(false, result);
					authResponse.setReason(reason !== null ? reason : "Request Canceled");
					authResponse.setMessage(message !== null ? message : "The Auth Request was canceled.");
					authResponse.setPayment(null);
					this.cloverConnector.broadcaster.notifyOnAuthResponse(authResponse);
				}
				else if (lastReq instanceof sdk.remotepay.ManualRefundRequest) {
					let refundResponse: sdk.remotepay.ManualRefundResponse = new sdk.remotepay.ManualRefundResponse(false, result);
					refundResponse.setReason(reason !== null ? reason : "Request Canceled");
					refundResponse.setMessage(message !== null ? message : "The Manual Refund Request was canceled.");
					refundResponse.setCredit(null);
					this.cloverConnector.broadcaster.notifyOnManualRefundResponse(refundResponse);
				}
				else if (this.lastPRR instanceof sdk.remotepay.RefundPaymentResponse) {
					this.cloverConnector.broadcaster.notifyOnRefundPaymentResponse(this.lastPRR);
					this.lastPRR = null;
				}
			}
			finally {
				// do nothing
			}
		}

		public onVerifySignature(payment: sdk.remotepay.Payment, signature: sdk.base.Signature): void {
			let request: InnerDeviceObserver.SVR = new InnerDeviceObserver.SVR(this.cloverConnector.device);
			request.setSignature(signature);
			request.setPayment(payment);
			this.cloverConnector.broadcaster.notifyOnVerifySignatureRequest(request);
		}

		public onConfirmPayment(payment: sdk.payments.Payment, challenges: sdk.base.Challenge[]): void {
			let cpr: sdk.remotepay.ConfirmPaymentRequest = new sdk.remotepay.ConfirmPaymentRequest();
			cpr.setPayment(payment);
			cpr.setChallenges(challenges);
			this.cloverConnector.broadcaster.notifyOnConfirmPaymentRequest(cpr);
		}

		public onPaymentVoided(payment: sdk.remotepay.Payment, voidReason: sdk.order.VoidReason): void;
		public onPaymentVoided(result: ResultCode, reason: string, message: string): void;
		public onPaymentVoided(status: sdk.remotemessage.ResultStatus, reason: string, message: string): void;
		public onPaymentVoided(resultStatusOrPayment: any, reasonOrVoidReason: any, message?: string): void {
			if (resultStatusOrPayment instanceof sdk.remotepay.Payment) {
				this.onPaymentVoidedHandler(resultStatusOrPayment, reasonOrVoidReason, ResultCode.SUCCESS, reasonOrVoidReason.toString(), null);
			}
			else if (resultStatusOrPayment instanceof sdk.remotemessage.ResultStatus) {
				this.onPaymentVoided(status == sdk.remotemessage.ResultStatus.SUCCESS ? ResultCode.SUCCESS : ResultCode.FAIL, reasonOrVoidReason, message);
			}
			else {
				this.onPaymentVoidedHandler(null, reasonOrVoidReason.FAILED, resultStatusOrPayment, reasonOrVoidReason !== null ? reasonOrVoidReason : resultStatusOrPayment.toString(), message !== null ? message : "No extended information provided.");
			}
		}
		private onPaymentVoidedHandler(payment: sdk.payments.Payment, voidReason: sdk.order.VoidReason, result: ResultCode, reason: string, message: string): void {
			let success: boolean = (result == ResultCode.SUCCESS);
			let response: sdk.remotepay.VoidPaymentResponse = new sdk.remotepay.VoidPaymentResponse(success, result);
			response.setPaymentId(payment !== null ? payment.getId() : null);
			response.setReason(reason);
			response.setMessage(message);
			this.cloverConnector.broadcaster.notifyOnVoidPaymentResponse(response);
		}

		public onKeyPressed(keyPress: sdk.remotemessage.KeyPress): void {
			//TODO: For future use
		}

		public onPaymentRefundResponse(orderId: string, paymentId: string, refund: sdk.payments.Refund, code: sdk.remotemessage.TxState): void {
			// hold the response for finishOk for the refund. See comments in onFinishOk(Refund)
			let success: boolean = (code == sdk.remotemessage.TxState.SUCCESS);
			let prr: sdk.remotepay.RefundPaymentResponse = new sdk.remotepay.RefundPaymentResponse(success, success ? ResultCode.SUCCESS : ResultCode.FAIL);
			prr.setOrderId(orderId);
			prr.setPaymentId(paymentId);
			prr.setRefund(refund);
			this.lastPRR = prr; // set this so we have the appropriate information for when onFinish(Refund) is called
		}

		public onVaultCardResponse(vaultedCard: sdk.payments.VaultedCard, code: string, reason: string): void;
	    public onVaultCardResponse(success: boolean, code: ResultCode, reason: string, message: string, vaultedCard: sdk.payments.VaultedCard): void;
		public onVaultCardResponse(vaultedCardOrSuccess: any, code: any, reason: string, message?: string, vaultedCard?: sdk.payments.VaultedCard): void {
			if (vaultedCardOrSuccess instanceof sdk.payments.VaultedCard) {
				let success: boolean = (code == ResultCode.SUCCESS);
				this.onVaultCardResponse(success, success ? ResultCode.SUCCESS : ResultCode.FAIL, null, null, vaultedCard);
			}
			else {
				this.cloverConnector.device.doShowWelcomeScreen();
				let vcr: sdk.remotepay.VaultCardResponse = new sdk.remotepay.VaultCardResponse(vaultedCardOrSuccess, code, vaultedCard !== null ? vaultedCard : null);
				vcr.setReason(reason);
				vcr.setMessage(message);
				this.cloverConnector.broadcaster.notifyOnVaultCardRespose(vcr);
			}
		}

		public onCapturePreAuth(status: sdk.remotemessage.ResultStatus, reason: string, paymentId: string, amount: number, tipAmount: number): void;
		public onCapturePreAuth(code: ResultCode, reason: string, paymentId: string, amount: number, tipAmount: number): void;
		public onCapturePreAuth(statusOrCode: any, reason: string, paymentId: string, amount: number, tipAmount: number): void {
			if (statusOrCode instanceof sdk.remotemessage.ResultStatus) {
				let success: boolean = (sdk.remotemessage.ResultStatus.SUCCESS == statusOrCode);
				let response: sdk.remotepay.CapturePreAuthResponse = new sdk.remotepay.CapturePreAuthResponse(success, success ? ResultCode.SUCCESS : ResultCode.FAIL);
				response.setReason(reason);
				response.setPaymentID(paymentId);
				response.setAmount(amount);
				response.setTipAmount(tipAmount);
				this.cloverConnector.broadcaster.notifyOnCapturePreAuth(response);
			}
			else {
				let success: boolean = (ResultCode.SUCCESS == statusOrCode);
				let response: sdk.remotepay.CapturePreAuthResponse = new sdk.remotepay.CapturePreAuthResponse(success, statusOrCode);
				response.setReason(reason);
				response.setPaymentID(paymentId);
				if (amount !== null) {
					response.setAmount(amount);
				}
				if (tipAmount !== null) {
					response.setTipAmount(tipAmount);
				}
				this.cloverConnector.broadcaster.notifyOnCapturePreAuth(response);
			}
		}

		public onCloseoutResponse(status: sdk.remotemessage.ResultStatus, reason: string, batch: sdk.payments.Batch): void;
		public onCloseoutResponse(result: ResultCode, reason: string, message: string): void;
		public onCloseoutResponse(statusOrResult: any, reason: string, batchOrMessage: any): void {
			if (statusOrResult instanceof sdk.remotemessage.ResultStatus) {
				this.onCloseoutResponseHandler(batchOrMessage, statusOrResult == sdk.remotemessage.ResultStatus.SUCCESS ? ResultCode.SUCCESS : ResultCode.FAIL, reason, null);
			}
			else {
				this.onCloseoutResponseHandler(null, statusOrResult, reason, batchOrMessage);
			}
		}
		private onCloseoutResponseHandler(batch: sdk.payments.Batch, result: ResultCode, reason: string, message: string): void {
			let success: boolean = (result == ResultCode.SUCCESS);
			let cr: sdk.remotepay.CloseoutResponse = new sdk.remotepay.CloseoutResponse(success, result);
			cr.setBatch(batch);
			cr.setReason(reason);
			cr.setMessage(message);
			this.cloverConnector.broadcaster.notifyCloseout(cr);
		}

		public onDeviceDisconnected(): void {
			this.logger.debug('Disconnected');
			this.cloverConnector.isReady = false;
			this.cloverConnector.broadcaster.notifyOnDisconnect();
		}

		public onDeviceConnected(): void {
			this.logger.debug('Connected');
			this.cloverConnector.isReady = false;
			this.cloverConnector.broadcaster.notifyOnConnect();
		}

		public onDeviceReady(device: CloverDevice, drm: sdk.remotemessage.DiscoveryResponseMessage): void {
			this.logger.debug('Ready');
			this.cloverConnector.isReady = drm.ready;

			let merchantInfo: sdk.remotepay.MerchantInfo = new sdk.remotepay.MerchantInfo(drm);
			this.cloverConnector.merchantInfo = merchantInfo;
			this.cloverConnector.device.setSupportsAcks(merchantInfo.deviceInfo.supportsAcks);

			if (drm.ready) {
				this.cloverConnector.device.doShowWelcomeScreen();
				this.cloverConnector.broadcaster.notifyOnReady(merchantInfo);
			}
			else {
				this.cloverConnector.broadcaster.notifyOnConnect();
			}
		}

		public onDeviceError(errorEvent: sdk.remotepay.CloverDeviceErrorEvent): void {
			this.cloverConnector.broadcaster.notifyOnDeviceError(errorEvent);
		}

		// TODO: The Print Message objects are missing from the api
		public onPrintRefundPayment(payment: sdk.remotepay.Payment, order: sdk.order.Order, refund: sdk.payments.Refund): void {
			// this.cloverConnector.broadcaster.notifyOnPrintRefundPaymentReceipt(new PrintRefundPaymentReceiptMessage(payment, order, refund));
		}
		public onPrintMerchantReceipt(payment: sdk.remotepay.Payment): void {
			// this.cloverConnector.broadcaster.notifyOnPrintPaymentMerchantCopyReceipt(new PrintPaymentMerchantCopyReceiptMessage(payment));
		}
		public onPrintPaymentDecline(payment: sdk.remotepay.Payment, reason: string): void {
			// this.cloverConnector.broadcaster.notifyOnPrintPaymentDeclineReceipt(new PrintPaymentDeclineReceiptMessage(payment, reason));
		}
		public onPrintPayment(payment: sdk.remotepay.Payment, order: sdk.order.Order): void {
			// this.cloverConnector.broadcaster.notifyOnPrintPaymentReceipt(new PrintPaymentReceiptMessage(payment, order));
		}
		public onPrintCredit(credit: sdk.remotepay.Credit): void {
			// this.cloverConnector.broadcaster.notifyOnPrintCreditReceipt(new PrintManualRefundReceiptMessage(credit));
		}
		public onPrintCreditDecline(credit: sdk.remotepay.Credit, reason: string): void {
			// this.cloverConnector.broadcaster.notifyOnPrintCreditDeclineReceipt(new PrintManualRefundDeclineReceiptMessage(credit, reason));
		}

		public onMessageAck(messageId: string): void {
			// TODO: for future use
		}

		public onPendingPaymentsResponse(success: boolean, pendingPayments: Array<sdk.base.PendingPaymentEntry>): void;
		public onPendingPaymentsResponse(result: ResultCode, reason: string, message: string): void;
		public onPendingPaymentsResponse(status: sdk.remotemessage.ResultStatus, reason: string, message: string): void;
		public onPendingPaymentsResponse(resultStatusOrSuccess: any, pendingPaymentsOrReason: any, message?: string): void {
			if (typeof resultStatusOrSuccess == 'boolean') {
				this.onPendingPaymentsResponseHandler(resultStatusOrSuccess, pendingPaymentsOrReason, ResultCode.SUCCESS, null, null);
			}
			else if (resultStatusOrSuccess instanceof sdk.remotemessage.ResultStatus) {
				this.onPendingPaymentsResponse(resultStatusOrSuccess == sdk.remotemessage.ResultStatus.SUCCESS ? ResultCode.SUCCESS : ResultCode.FAIL, pendingPaymentsOrReason, message);
			}
			else {
				this.cloverConnector.device.doShowWelcomeScreen();
				this.onPendingPaymentsResponseHandler(false, null, resultStatusOrSuccess, pendingPaymentsOrReason, message);
			}
		}
		private onPendingPaymentsResponseHandler(success: boolean, pendingPayments: Array<sdk.base.PendingPaymentEntry>, result: ResultCode, reason: string, message: string): void {
			let rppr: sdk.remotepay.RetrievePendingPaymentsResponse = new sdk.remotepay.RetrievePendingPaymentsResponse(result, message, pendingPayments);
			rppr.setSuccess(success);
			rppr.setReason(reason);
			this.cloverConnector.broadcaster.notifyOnRetrievePendingPaymentResponse(rppr);
		}

		public onReadCardResponse(status: sdk.remotemessage.ResultStatus, reason: string, cardData: sdk.base.CardData): void {
			let success: boolean = (status == sdk.remotemessage.ResultStatus.SUCCESS);
			if (success) {
				let rcdr: sdk.remotepay.ReadCardDataResponse = new sdk.remotepay.ReadCardDataResponse(success, success ? ResultCode.SUCCESS : ResultCode.FAIL);
				rcdr.setCardData(cardData);
				this.cloverConnector.device.doShowWelcomeScreen();
				this.cloverConnector.broadcaster.notifyOnReadCardDataResponse(rcdr);
			}
			else if (status == sdk.remotemessage.ResultStatus.CANCEL) {
				this.onReadCardDataResponse(ResultCode.CANCEL, reason, '');
			}
			else {
				this.onReadCardDataResponse(ResultCode.FAIL, reason, '');
			}
		}
		public onReadCardDataResponse(result: ResultCode, reason: string, message: string): void {
			let success: boolean = (result == ResultCode.SUCCESS);
			this.cloverConnector.device.doShowWelcomeScreen();
			let rcdr: sdk.remotepay.ReadCardDataResponse = new sdk.remotepay.ReadCardDataResponse(success, result);
			rcdr.setReason(reason);
			rcdr.setMessage(message);
			this.cloverConnector.broadcaster.notifyOnReadCardDataResponse(rcdr);
		}
	}

	export namespace InnerDeviceObserver {
		export class SVR extends sdk.remotepay.VerifySignatureRequest {
			cloverDevice: CloverDevice;

			constructor(device: CloverDevice) {
				super();
				this.cloverDevice = device;
			}

			public accept(): void {
				this.cloverDevice.doSignatureVerified(super.getPayment(), true);
			}

			public reject(): void {
				this.cloverDevice.doSignatureVerified(super.getPayment(), false);
			}

			public setSignature(signature: sdk.base.Signature): void {
				super.setSignature(signature);
			}

			public setPayment(payment: sdk.payments.Payment): void {
				super.setPayment(payment);
			}
		}
	}
}
