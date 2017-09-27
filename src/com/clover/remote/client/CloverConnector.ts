import sdk = require('remote-pay-cloud-api');


import {CardEntryMethods} from './CardEntryMethods';
import {CloverConnectorBroadcaster} from './CloverConnectorBroadcaster';
import {CloverDevice} from './device/CloverDevice';
import {CloverDeviceConfiguration} from './device/CloverDeviceConfiguration';
import {CloverDeviceFactory} from './device/CloverDeviceFactory';
import {CloverDeviceObserver} from './CloverDeviceObserver';
import {Logger} from './util/Logger';
import {JSONToCustomObject} from '../../json/JSONToCustomObject';

import {PayIntent} from '../../util/PayIntent/Builder';


/**
 * Clover Connector
 * 
 * The clover connector implements the ICloverConnector interface. This is where
 * we define how the connector interacts with remote pay adapters.
 */
export class CloverConnector implements sdk.remotepay.ICloverConnector {

	public static CANCEL_INPUT_OPTION: sdk.remotemessage.InputOption;

	// manual is not enabled by default
	private cardEntryMethods: number = CardEntryMethods.DEFAULT;

	// Create a logger
	protected logger: Logger = Logger.create();

	// The device we are connected to
	public device: CloverDevice;

	// Hold the current merchant info
	public merchantInfo: sdk.remotepay.MerchantInfo;

	// The device observer for this connector
	private deviceObserver: CloverConnector.InnerDeviceObserver; //sdk.remotepay.ICloverConnectorListener;

	// List of listeners to broadcast notifications to
	public broadcaster: CloverConnectorBroadcaster = new CloverConnectorBroadcaster();

	// Device Configuration for this connector
	private configuration: CloverDeviceConfiguration;

	// Flag indicating whether the device is ready or not
	public isReady: boolean = false;

	public static MAX_PAYLOAD_SIZE: number = 10000000; // maximum size of the payload of a full message.  if the payload exceeds this, the message will not be sent.

	// Hold the last request
	public lastRequest: any;

	constructor(config: CloverDeviceConfiguration) {
		// Set the cancel input option
		CloverConnector.CANCEL_INPUT_OPTION = new sdk.remotemessage.InputOption();
        CloverConnector.CANCEL_INPUT_OPTION.setKeyPress(sdk.remotemessage.KeyPress.ESC);
        CloverConnector.CANCEL_INPUT_OPTION.setDescription("Cancel");


		// Try to load the configuration.
		if (config) {
			this.configuration = config;
		}
	}

	/**
	 * Initialize the connector with a new config
	 * 
	 * @param {CloverDeviceConfiguration} config - the configuration for the connector
	 */
	public initialize(config: CloverDeviceConfiguration): void {
		this.configuration = config;
		this.deviceObserver = new CloverConnector.InnerDeviceObserver(this);

		// Get the device and subscribe to it.
		this.device = CloverDeviceFactory.get(config);
		if (this.device) {
			this.device.subscribe(this.deviceObserver);
		}
	}

	public initializeConnection(): void {
		if (!this.device) {
			this.initialize(this.configuration);
		}
	}

	/**
	 * Add new listener to receive broadcast notifications
	 * 
	 * @param {sdk.remotepay.ICloverConnectorListener} connectorListener - the listener to add
	 */
	public addCloverConnectorListener(connectorListener: sdk.remotepay.ICloverConnectorListener): void {
		this.broadcaster.push(connectorListener);
	}

	/**
	 * Remove a listener
	 * 
	 * @param {sdk.remotepay.ICloverConnectorListener} connectorListener - the listener to remove
	 */
	public removeCloverConnectorListener(connectorListener: sdk.remotepay.ICloverConnectorListener): void {
		var indexOfListener = this.broadcaster.indexOf(connectorListener);
		if (indexOfListener != -1) {
			this.broadcaster.splice(indexOfListener, 1);
		}
	}

	public sale(request: sdk.remotepay.SaleRequest): void {
		this.lastRequest = request;
		if (!this.device || !this.isReady) {
			this.deviceObserver.onFinishCancelSale(sdk.remotepay.ResponseCode.ERROR,
                "Device Connection Error",
                "In sale: SaleRequest - The Clover device is not connected.");
		}
		else if (request == null) {
            this.deviceObserver.onFinishCancelSale(sdk.remotepay.ResponseCode.FAIL, "Invalid Argument.", "In sale: SaleRequest - The request that was passed in for processing is null.");
		}
		else if (request.getAmount() <= 0) {
			this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.FAIL, "Request Validation Error", "In sale: SaleRequest - The request amount cannot be zero. Original Request = " + request, CloverConnector.TxTypeRequestInfo.SALE_REQUEST);
		}
		else if (request.getTipAmount() && request.getTipAmount() < 0) {
			this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.FAIL, "Request Validation Error", "In sale: SaleRequest - The tip amount cannot be less than zero. Original Request = " + request, CloverConnector.TxTypeRequestInfo.SALE_REQUEST);
		}
		else if (request.getExternalId() == null || request.getExternalId().trim().length == 0 || request.getExternalId().trim().length > 32){
			this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.FAIL, "Invalid Argument.", "In sale: SaleRequest - The externalId is required and the max length is 32 characters. Original Request = " + request, CloverConnector.TxTypeRequestInfo.SALE_REQUEST);
		}
		else if (request.getVaultedCard() && !this.merchantInfo.supportsVaultCards) {
			this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In sale: SaleRequest - Vault Card support is not enabled for the payment gateway. Original Request = " + request, CloverConnector.TxTypeRequestInfo.SALE_REQUEST);
		} else {
			if (request.getTipAmount() == null) {
				request.setTipAmount(0);
			}
			try {
				this.saleAuth(request, false);
			}
			catch(e) {
                this.logger.debug("Error in sale", e);
				this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.ERROR, e, null, CloverConnector.TxTypeRequestInfo.SALE_REQUEST);
			}
		}
	}

	/**
	 * A common PayIntent builder method for Sale, Auth and PreAuth
	 *
	 * @param request
     * @param suppressTipScreen
	 */
	private saleAuth(request: sdk.remotepay.TransactionRequest, suppressTipScreen: boolean): void {
		if (this.device && this.isReady) {
			this.lastRequest = request;

			let builder: PayIntent.Builder = new PayIntent.Builder();
			let transactionSettings:sdk.payments.TransactionSettings = new sdk.payments.TransactionSettings();

			builder.setTransactionType(request.getType()); // difference between sale, auth and auth(preAuth)
			builder.setAmount(request.getAmount());
			builder.setVaultedCard(request.getVaultedCard());
			builder.setExternalPaymentId(request.getExternalId().trim());
			builder.setRequiresRemoteConfirmation(true);
			if (request.getCardNotPresent()) {
				builder.setCardNotPresent(request.getCardNotPresent());
			}
			transactionSettings.setCardEntryMethods(request.getCardEntryMethods() ? request.getCardEntryMethods() : this.cardEntryMethods);
			if (request.getDisablePrinting()) {
				transactionSettings.setCloverShouldHandleReceipts(!request.getDisablePrinting());
			}
			if (request.getDisableRestartTransactionOnFail()) {
				transactionSettings.setDisableRestartTransactionOnFailure(request.getDisableRestartTransactionOnFail());
			}
			transactionSettings.setSignatureEntryLocation(request.getSignatureEntryLocation());
			transactionSettings.setSignatureThreshold(request.getSignatureThreshold());
			transactionSettings.setDisableReceiptSelection(request.getDisableReceiptSelection());
			transactionSettings.setDisableDuplicateCheck(request.getDisableDuplicateChecking());
			transactionSettings.setAutoAcceptPaymentConfirmations(request.getAutoAcceptPaymentConfirmations());
			transactionSettings.setAutoAcceptSignature(request.getAutoAcceptSignature());

			if (request instanceof sdk.remotepay.PreAuthRequest) {
				// nothing extra as of now
			}
			else if (request instanceof sdk.remotepay.AuthRequest) {
				let req: sdk.remotepay.AuthRequest = request;
				if (req.getTaxAmount()) {
					builder.setTaxAmount(req.getTaxAmount());
				}

				if (req.getTippableAmount()) {
					transactionSettings.setTippableAmount(req.getTippableAmount());
				}
				if (req.getAllowOfflinePayment()) {
					transactionSettings.setAllowOfflinePayment(req.getAllowOfflinePayment());
				}
				if (req.getApproveOfflinePaymentWithoutPrompt()) {
					transactionSettings.setApproveOfflinePaymentWithoutPrompt(req.getApproveOfflinePaymentWithoutPrompt());
				}
				if (req.getDisableCashback()) {
					transactionSettings.setDisableCashBack(req.getDisableCashback());
				}
				transactionSettings.setTipMode(sdk.payments.TipMode.ON_PAPER); // overriding TipMode, since it's an Auth request
			}
			else if (request instanceof sdk.remotepay.SaleRequest) {
				let req: sdk.remotepay.SaleRequest = request;
				// shared with AuthRequest
				if (req.getAllowOfflinePayment()) {
					transactionSettings.setAllowOfflinePayment(req.getAllowOfflinePayment());
				}
				if (req.getApproveOfflinePaymentWithoutPrompt()) {
					transactionSettings.setApproveOfflinePaymentWithoutPrompt(req.getApproveOfflinePaymentWithoutPrompt());
				}
				if (req.getDisableCashback()) {
					transactionSettings.setDisableCashBack(req.getDisableCashback());
				}
				if (req.getTaxAmount()) {
					builder.setTaxAmount(req.getTaxAmount());
				}
				// SaleRequest
				if (req.getTippableAmount()) {
					transactionSettings.setTippableAmount(req.getTippableAmount());
				}
				if (req.getTipAmount() !== undefined) { // In javascript, 0 is false.  We must test for undefined explicitly. SEMI-864
					builder.setTipAmount(req.getTipAmount());
				}
				if (req.getTipMode()) {
					transactionSettings.setTipMode(CloverConnector.getV3TipModeFromRequestTipMode(req.getTipMode()));
				}
			}

			builder.setTransactionSettings(transactionSettings);
			let payIntent: sdk.remotemessage.PayIntent = builder.build();
			this.device.doTxStart(payIntent, null); //
		}
	}

	private static getV3TipModeFromRequestTipMode(saleTipMode: sdk.payments.TipMode): sdk.payments.TipMode {
		let allowedTipModes:Array<sdk.payments.TipMode> = [
			sdk.payments.TipMode.TIP_PROVIDED,
			sdk.payments.TipMode.ON_SCREEN_BEFORE_PAYMENT,
			sdk.payments.TipMode.NO_TIP];
		if(allowedTipModes.indexOf(saleTipMode) > -1) {
			return saleTipMode;
		}
		return null;
	}

    public notifyDeviceNotConnected(message: string): void {
        this.notifyDeviceError(sdk.remotepay.ErrorType.COMMUNICATION,
            sdk.remotepay.DeviceErrorEventCode.NotConnected,
            message + ": Device is not connected.");
    }

    public notifyInvalidData(message: string): void {
        this.notifyDeviceError(sdk.remotepay.ErrorType.VALIDATION,
            sdk.remotepay.DeviceErrorEventCode.InvalidParam,
            message);
    }

    public notifyDeviceError(errorType: sdk.remotepay.ErrorType, errorCode:sdk.remotepay.DeviceErrorEventCode, message: string): void {
        let deviceErrorEvent:sdk.remotepay.CloverDeviceErrorEvent = new sdk.remotepay.CloverDeviceErrorEvent();
        deviceErrorEvent.setType(errorType);
        deviceErrorEvent.setCode(errorCode);
        deviceErrorEvent.setMessage( message );
        this.broadcaster.notifyOnDeviceError(deviceErrorEvent);
    }

    public acceptSignature(request: sdk.remotepay.VerifySignatureRequest): void {
        let logLocation:string = "In acceptSignature";
		if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected(logLocation);
		} else if(request == null) {
            this.notifyInvalidData(logLocation + ": VerifySignatureRequest cannot be null.");
		} else if(request.getPayment() == null || request.getPayment().getId() == null) {
            this.notifyInvalidData(logLocation + ": VerifySignatureRequest. Payment must have an ID.");
		} else {
			this.device.doSignatureVerified(request.getPayment(), true);
		}
	}

	public rejectSignature(request: sdk.remotepay.VerifySignatureRequest): void {
        let logLocation:string = "In rejectSignature";
		if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected(logLocation);
		} else if(request == null) {
            this.notifyInvalidData(logLocation + ": VerifySignatureRequest cannot be null.");
		} else if(request.getPayment() == null || request.getPayment().getId() == null) {
            this.notifyInvalidData(logLocation + ": VerifySignatureRequest. Payment must have an ID.");
		} else {
			this.device.doSignatureVerified(request.getPayment(), false);
		}
	}

	public acceptPayment(payment: sdk.payments.Payment): void {
        let logLocation:string = "In acceptPayment";
		if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected(logLocation);
		} else if(payment == null) {
            this.notifyInvalidData(logLocation + ": Payment cannot be null.");
		} else if(payment.getId() == null) {
            this.notifyInvalidData(logLocation + ": Payment must have an ID.");
		} else {
			this.device.doAcceptPayment(payment);
		}
	}

	public rejectPayment(payment: sdk.payments.Payment, challenge: sdk.base.Challenge): void {
        let logLocation:string = "In rejectPayment";
		if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected(logLocation);
		} else if(payment == null) {
            this.notifyInvalidData(logLocation + ": Payment cannot be null.");
		} else if(payment.getId() == null) {
            this.notifyInvalidData(logLocation + ": Payment must have an ID.");
		} else if(challenge == null) {
            this.notifyInvalidData(logLocation + ": Challenge cannot be null.");
		} else {
			this.device.doRejectPayment(payment, challenge);
		}
	}

	public auth(request: sdk.remotepay.AuthRequest): void {
		this.lastRequest = request;
		if (!this.device || !this.isReady) {
			this.deviceObserver.onFinishCancelAuth(sdk.remotepay.ResponseCode.ERROR,
                "Device connection Error", "In auth: Auth Request - The Clover device is not connected.");
		} else if (!this.merchantInfo.supportsAuths) {
			this.deviceObserver.onFinishCancelAuth(sdk.remotepay.ResponseCode.UNSUPPORTED,
                "Merchant Configuration Validation Error", "In auth: AuthRequest - " +
                "Auths are not enabled for the payment gateway. Original Request = " + request);
		} else if(request == null) {
            this.deviceObserver.onFinishCancelAuth(sdk.remotepay.ResponseCode.FAIL,
                "Invalid Argument.", "In auth: AuthRequest - The request that was passed in for processing is null.");
		} else if(request.getAmount() == null || request.getAmount() <= 0) {
			this.deviceObserver.onFinishCancel_rmm(
                sdk.remotepay.ResponseCode.FAIL, "Request Validation Error", "In auth: AuthRequest - " +
                "The request amount cannot be zero. Original Request = " + request, CloverConnector.TxTypeRequestInfo.AUTH_REQUEST);
		} else if (request.getExternalId() == null || request.getExternalId().trim().length == 0 || 
            request.getExternalId().trim().length > 32){
			this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.FAIL,
                "Invalid Argument.", "In auth: AuthRequest - The externalId is invalid. It is " +
                "required and the max length is 32. Original Request = " + request, CloverConnector.TxTypeRequestInfo.AUTH_REQUEST);
		} else if (request.getVaultedCard() && !this.merchantInfo.supportsVaultCards) {
			this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.UNSUPPORTED,
                "Merchant Configuration Validation Error", "In auth: AuthRequest - " +
                "Vault Card support is not enabled for the payment gateway. Original Request = " + request, CloverConnector.TxTypeRequestInfo.AUTH_REQUEST);
		} else {
			try {
				this.saleAuth(request, true);
			}
			catch(e) {
                this.logger.debug("Error in auth", e);
                this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.ERROR, e, null, CloverConnector.TxTypeRequestInfo.AUTH_REQUEST);
			}
		}
	}

	public preAuth(request: sdk.remotepay.PreAuthRequest): void {
		this.lastRequest = request;
		if (!this.device || !this.isReady) {
			this.deviceObserver.onFinishCancelPreAuth(sdk.remotepay.ResponseCode.ERROR,
                "Device connection Error", "In preAuth: PreAuthRequest - The Clover device is not connected.");
		}
		else if (!this.merchantInfo.supportsPreAuths) {
			this.deviceObserver.onFinishCancelPreAuth(sdk.remotepay.ResponseCode.UNSUPPORTED,
                "Merchant Configuration Validation Error", "In preAuth: PreAuthRequest - " +
                "PreAuths are not enabled for the payment gateway. Original Request = " + request);
		}
		else if (request == null) {
            this.deviceObserver.onFinishCancelPreAuth(sdk.remotepay.ResponseCode.FAIL,
               "Invalid Argument.", "In preAuth: PreAuthRequest - " +
               "The request that was passed in for processing is null.");
		}
		else if (request.getAmount() <= 0) {
			this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.FAIL,
                "Request Validation Error", "In preAuth: PreAuthRequest - " +
                "The request amount cannot be zero. Original Request = " + request, CloverConnector.TxTypeRequestInfo.PREAUTH_REQUEST);
		}
		else if (request.getExternalId() == null || request.getExternalId().trim().length == 0 || 
            request.getExternalId().trim().length > 32){
			this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.FAIL,
                "Invalid Argument.", "In preAuth: PreAuthRequest - The externalId is invalid. " +
                "It is required and the max length is 32. Original Request = " + request, CloverConnector.TxTypeRequestInfo.PREAUTH_REQUEST);
		}
		else if (request.getVaultedCard() && !this.merchantInfo.supportsVaultCards) {
			this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.UNSUPPORTED,
                "Merchant Configuration Validation Error", "In preAuth: PreAuthRequest - " +
                "Vault Card support is not enabled for the payment gateway. Original Request = " + request, CloverConnector.TxTypeRequestInfo.PREAUTH_REQUEST);
		}
		else {
			try {
				this.saleAuth(request, true);
			}
			catch(e) {
				this.lastRequest = null;
                this.logger.debug("Error in preAuth", e);
				this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.ERROR, e, null, CloverConnector.TxTypeRequestInfo.PREAUTH_REQUEST);
			}
		}
	}

	public capturePreAuth(request: sdk.remotepay.CapturePreAuthRequest): void {
		if (!this.device || !this.isReady) {
			this.deviceObserver.onCapturePreAuth(sdk.remotepay.ResponseCode.ERROR, 
                "Device connection Error", 
                "In capturePreAuth: CapturePreAuth - The Clover device is not connected.", null, null);
		}
		else if (!this.merchantInfo.supportsPreAuths) {
			this.deviceObserver.onCapturePreAuth(sdk.remotepay.ResponseCode.UNSUPPORTED, 
                "Merchant Configuration Validation Error", 
                "In capturePreAuth: PreAuth Captures are not enabled for the payment gateway. Original Request = " + 
                request, null, null);
		}
		else if (request == null) {
			this.deviceObserver.onCapturePreAuth(sdk.remotepay.ResponseCode.FAIL,
                "Invalid Argument.", "In capturePreAuth: CapturePreAuth - " +
                "The request that was passed in for processing is null.", null, null);
		}
        else if (request.getAmount() < 0 || request.getTipAmount() < 0) {
            this.deviceObserver.onCapturePreAuth(sdk.remotepay.ResponseCode.FAIL,
                "Request Validation Error", "In capturePreAuth: CapturePreAuth - " +
                "The request amount must be greater than zero and the tip must be greater " +
                "than or equal to zero. Original Request = " + request, null, null);
        }
        else if (!request.paymentId) {
            this.deviceObserver.onCapturePreAuth(sdk.remotepay.ResponseCode.FAIL,
                "Request Validation Error", "In capturePreAuth: CapturePreAuth - " +
                "The paymentId is null. Original Request = " + request, null, null);
        }
		else {
			try {
				this.device.doCaptureAuth(request.paymentId, request.amount, request.tipAmount);
			}
			catch(e) {
				let response: sdk.remotepay.CapturePreAuthResponse = 
                    new sdk.remotepay.CapturePreAuthResponse();
                CloverConnector.populateBaseResponse(response, false, sdk.remotepay.ResponseCode.UNSUPPORTED,
                    "Pre Auths unsupported",
                    "The currently configured merchant gateway does not support Capture Auth requests.");
				this.broadcaster.notifyOnCapturePreAuth(response);
			}
		}
	}

	public tipAdjustAuth(request: sdk.remotepay.TipAdjustAuthRequest): void {
		if (!this.device || !this.isReady) {
			this.deviceObserver.onAuthTipAdjusted(sdk.remotepay.ResponseCode.ERROR, "Device connection Error", "In tipAdjustAuth: TipAdjustAuthRequest - The Clover device is not connected.");
		}
		else if (!this.merchantInfo.supportsTipAdjust) {
			this.deviceObserver.onAuthTipAdjusted(sdk.remotepay.ResponseCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In tipAdjustAuth: TipAdjustAuthRequest - Tip Adjustments are not enabled for the payment gateway. Original Request = " + request);
		}
		else if (request == null) {
			this.deviceObserver.onAuthTipAdjusted(sdk.remotepay.ResponseCode.FAIL, "Invalid Argument.", "In tipAdjustAuth: TipAdjustAuthRequest - The request that was passed in for processing is null.");
		}
		else if (request.getPaymentId() == null) {
			this.deviceObserver.onAuthTipAdjusted(sdk.remotepay.ResponseCode.FAIL, "Invalid Argument.", "In tipAdjustAuth: TipAdjustAuthRequest - The paymentId is required.");
		}
		else if (request.getTipAmount() < 0) {
			this.deviceObserver.onAuthTipAdjusted(sdk.remotepay.ResponseCode.FAIL, "Request Validation Error", "In tipAdjustAuth: TipAdjustAuthRequest - The request amount cannot be less than zero. Original Request = " + request);
		}
		else {
			this.device.doTipAdjustAuth(request.getOrderId(), request.getPaymentId(), request.getTipAmount());
		}
	}

	public vaultCard(cardEntryMethods: number): void {
		if (!this.device || !this.isReady) {
			this.deviceObserver.onVaultCardResponse(false, sdk.remotepay.ResponseCode.ERROR, "Device connection Error", "In vaultCard: The Clover device is not connected.", null);
		}
		else if (!this.merchantInfo.supportsVaultCards) {
			this.deviceObserver.onVaultCardResponse(false, sdk.remotepay.ResponseCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In vaultCard: VaultCard/Payment Tokens are not enabled for the payment gateway.", null);
		}
		else {
			this.device.doVaultCard(cardEntryMethods ? cardEntryMethods : this.getCardEntryMethods());
		}
	}

	public voidPayment(request: sdk.remotepay.VoidPaymentRequest): void {
		if (!this.device || !this.isReady) {
			this.deviceObserver.onPaymentVoided_responseCode(sdk.remotepay.ResponseCode.ERROR, "Device connection Error", "In voidPayment: VoidPaymentRequest - The Clover device is not connected.");
		}
		else if (request == null) {
			this.deviceObserver.onPaymentVoided_responseCode(sdk.remotepay.ResponseCode.FAIL, "Invalid Argument.", "In voidPayment: VoidPaymentRequest - The request that was passed in for processing is null.");
		}
		else if (request.getPaymentId() == null) {
			this.deviceObserver.onPaymentVoided_responseCode(sdk.remotepay.ResponseCode.FAIL, "Invalid Argument.", "In voidPayment: VoidPaymentRequest - The paymentId is required.");
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
		if (!this.device || !this.isReady) {
			this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.CANCEL,
			    "Device Connection Error",
			    "In refundPayment: RefundPaymentRequest - The Clover device is not connected.",
			    CloverConnector.TxTypeRequestInfo.REFUND_REQUEST);
		}
		else if (request == null) {
			this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.CANCEL,
			    "Request Validation Error",
			    "In refundPayment: RefundPaymentRequest - The request that was passed in for processing is empty.",
			    CloverConnector.TxTypeRequestInfo.REFUND_REQUEST);
		}
		else if (request.getPaymentId() == null) {
			this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.CANCEL,
			    "Request Validation Error",
                "In refundPayment: RefundPaymentRequest PaymentID cannot be empty. " + request,
			    CloverConnector.TxTypeRequestInfo.REFUND_REQUEST);
		}
		else if (request.getAmount() <= 0 && !request.getFullRefund()) {
			this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.CANCEL,
			    "Request Validation Error",
                "In refundPayment: RefundPaymentRequest Amount must be greater than zero when FullRefund is set to false. " + request,
			    CloverConnector.TxTypeRequestInfo.REFUND_REQUEST);
		}
		else {
			this.device.doPaymentRefund(request.getOrderId(), request.getPaymentId(), request.getAmount(), request.getFullRefund());
		}
	}

	public manualRefund(request: sdk.remotepay.ManualRefundRequest): void { // NakedRefund is a Transaction, with just negative amount
		let transactionSettings:sdk.payments.TransactionSettings = new sdk.payments.TransactionSettings();
		this.lastRequest = request;
		if (!this.device || !this.isReady) {
			this.deviceObserver.onFinishCancelManualRefund(sdk.remotepay.ResponseCode.ERROR, "Device connection Error", "In manualRefund: ManualRefundRequest - The Clover device is not connected.");
		}
		else if (!this.merchantInfo.supportsManualRefunds) {
			this.deviceObserver.onFinishCancelManualRefund(sdk.remotepay.ResponseCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In manualRefund: ManualRefundRequest - Manual Refunds are not enabled for the payment gateway. Original Request = " + request);
		}
		else if (request == null) {
            this.deviceObserver.onFinishCancelManualRefund(sdk.remotepay.ResponseCode.FAIL, "Invalid Argument.", "In manualRefund: ManualRefundRequest - The request that was passed in for processing is null.");
		}
		else if (request.getAmount() <= 0) {
			this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.FAIL, "Request Validation Error", "In manualRefund: ManualRefundRequest - The request amount cannot be zero. Original Request = " + request, CloverConnector.TxTypeRequestInfo.CREDIT_REQUEST);
		}
		else if (request.getExternalId() == null || request.getExternalId().trim().length == 0 || request.getExternalId().trim().length > 32) {
			this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.FAIL, "Invalid Argument.", "In manualRefund: ManualRefundRequest - The externalId is invalid. It is required and the max length is 32. Original Request = " + request, CloverConnector.TxTypeRequestInfo.CREDIT_REQUEST);
		}
		else if (request.getVaultedCard() && !this.merchantInfo.supportsVaultCards) {
			this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In manualRefund: ManualRefundRequest - Vault Card support is not enabled for the payment gateway. Original Request = " + request, CloverConnector.TxTypeRequestInfo.CREDIT_REQUEST);
		}
		else {
			let builder: PayIntent.Builder = new PayIntent.Builder();
			builder.setAmount(-Math.abs(request.getAmount()))
				.setTransactionType(sdk.remotepay.TransactionType.CREDIT)
				.setVaultedCard(request.getVaultedCard())
				.setExternalPaymentId(request.getExternalId());

			transactionSettings.setCardEntryMethods(request.getCardEntryMethods() ? request.getCardEntryMethods() : this.cardEntryMethods);
			if (request.getDisablePrinting()) {
				transactionSettings.setCloverShouldHandleReceipts(request.getDisablePrinting());
			}

			if (request.getDisableRestartTransactionOnFail()) {
				transactionSettings.setDisableRestartTransactionOnFailure(request.getDisableRestartTransactionOnFail());
			}
			if(request.getSignatureEntryLocation()) {
				transactionSettings.setSignatureEntryLocation(request.getSignatureEntryLocation());
			}
			if(request.getSignatureThreshold()) {
				transactionSettings.setSignatureThreshold(request.getSignatureThreshold());
			}
			if(request.getDisableReceiptSelection()) {
				transactionSettings.setDisableReceiptSelection(request.getDisableReceiptSelection());
			}
			builder.setTransactionSettings(transactionSettings);

			let payIntent: sdk.remotepay.PayIntent = builder.build();
			this.device.doTxStart(payIntent, null);
		}
	}

	public retrievePendingPayments(): void {
		if (!this.device || !this.isReady) {
			this.deviceObserver.onPendingPaymentsResponse(sdk.remotepay.ResponseCode.ERROR, "Device connection Error", "In retrievePendingPayments: The Clover device is not connected.");
		}
		else {
			this.device.doRetrievePendingPayments();
		}
	}

	public readCardData(request: sdk.remotepay.ReadCardDataRequest): void {
		if (!this.device || !this.isReady) {
			this.deviceObserver.onReadCardDataResponse(sdk.remotepay.ResponseCode.ERROR, "Device connection Error", "In readCardData: The Clover device is not connected.");
		}
		else if (request == null) {
			this.deviceObserver.onReadCardDataResponse(sdk.remotepay.ResponseCode.FAIL, "Invalid Argument.", "In readCardData: ReadCardDataRequest - The request that was passed in for processing is null.");
		}
		else {
			// create pay intent...
			let builder: PayIntent.Builder = new PayIntent.Builder();
			builder.setTransactionType(sdk.remotepay.TransactionType.DATA);
			builder.setCardEntryMethods(request.getCardEntryMethods() ? request.getCardEntryMethods() : this.cardEntryMethods);
			builder.setForceSwipePinEntry(request.getIsForceSwipePinEntry());

			let pi: sdk.remotepay.PayIntent = builder.build();
			this.device.doReadCardData(pi);
		}
	}

	public sendMessageToActivity(request: sdk.remotepay.MessageToActivity):void {
		if (!this.device || !this.isReady) {
			this.notifyDeviceNotConnected("In sendMessageToActivity");
		} else if (request == null) {
			this.notifyInvalidData("In sendMessageToActivity: Invalid argument. Null is not allowed.");
		}
		else {
			this.device.doSendMessageToActivity(request.getAction(), request.getPayload());
		}
	}

	public retrievePayment(request: sdk.remotepay.RetrievePaymentRequest): void {
		if (!this.device || !this.isReady) {
			this.notifyDeviceNotConnected("In retrievePayment");
		} else if (request == null) {
			this.notifyInvalidData("In retrievePayment: Invalid argument. Null is not allowed.");
		} else if (!request.getExternalPaymentId()) {
			this.notifyInvalidData("In retrievePayment: RetrievePaymentRequest - The externalPaymentId is null.  It must be set.");
		}
		else {
			this.device.doRetrievePayment(request.getExternalPaymentId());
		}
	}

	public retrievePrinters(request: sdk.remotepay.RetrievePrintersRequest): void {
	    if (!this.device || !this.isReady) {
	        this.notifyDeviceNotConnected("In retrievePrinters");
	    } else if (!request) {
	        this.notifyInvalidData("In retrievePrinters: Invalid argument. Null is not allowed.");
	    } else {
	        this.device.doRetrievePrinters(request.category);
	    }
	}

	public retrievePrintJobStatus(request: sdk.remotepay.PrintJobStatusRequest): void {
	    if (!this.device || !this.isReady) {
	        this.notifyDeviceNotConnected("In retrievePrintJobStatus");
	    } else if (!request || !request.printRequestId) {
	        this.notifyInvalidData("In retrievePrintJobStatus: Invalid argument. Null is not allowed.");
	    } else {
	        this.device.doRetrievePrintJobStatus(request.printRequestId);
	    }
	}

	public closeout(request: sdk.remotepay.CloseoutRequest): void {
		if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In closeout");
		}
		else {
			this.device.doCloseout(request.getAllowOpenTabs(), request.getBatchId());
		}
	}

	public cancel(): void {
		if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In cancel");
		}
		else {
			this.invokeInputOption(CloverConnector.CANCEL_INPUT_OPTION);
		}
	}

	public printText(messages: Array<string>): void {
		if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In printText");
		} else if(messages == null) {
            this.notifyInvalidData("In printText: Invalid argument. Null is not allowed.");
		} else {
			this.device.doPrintText(messages);
		}
	}

	public printImage(bitmap: HTMLImageElement): void { //Bitmap img
		if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In printImage");
		}
		else if (bitmap == null) {
            this.notifyInvalidData("In printImage: Invalid argument.  Null is not allowed.");
		}
		else {
			this.device.doPrintImageObject(bitmap);
		}
	}

	public printImageFromURL(url: string): void {
		if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In printImageFromURL");
		}
		else if (url == null) {
            this.notifyInvalidData("In printImageFromURL: Invalid argument.  Null is not allowed.");
		}
		else {
			this.device.doPrintImageUrl(url);
		}
	}

	public print(request: sdk.remotepay.PrintRequest): void {
	    if (!this.device || !this.isReady) {
	        this.notifyDeviceNotConnected("In print");
	    } else if (!request) {
	        this.notifyInvalidData("In print: Invalid argument. Null is not allowed.");
	    } else if (!this.validatePrintRequest(request)) {
            this.notifyInvalidData("In print: Invalid argument. PrintRequest was not formatted correctly.");
	    } else {
	        if (request.image && request.image.length == 1) {
                this.device.doPrintImageObject(request.image[0], request.printRequestId, request.printDeviceId);
	        } else if (request.text) {
                this.device.doPrintText(request.text, request.printRequestId, request.printDeviceId);
	        } else if (request.imageUrl && request.imageUrl.length == 1) {
	            this.device.doPrintImageUrl(request.imageUrl[0], request.printRequestId, request.printDeviceId);
	        } else {
	            this.notifyInvalidData("In print: Invalid argument. PrintRequest element was not formatted correctly.");
	        }
	    }
	}

	public validatePrintRequest(request: sdk.remotepay.PrintRequest): boolean {
	    if (!request.image && !request.text && !request.imageUrl) {
	        this.notifyInvalidData("In validatePrintRequest: There are no items to print.");
	        return false;
	    } else if ((request.image && request.text) ||
	                (request.image && request.imageUrl) ||
	                (request.text && request.imageUrl)) {
	        this.notifyInvalidData("In validatePrintRequest: There are too may different kinds of items to print.  Can only have one.");
	        return false;
	    } else {
	        return true;
	    }
	}

	public showMessage(message: string): void {
		if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In showMessage");
		}
		else if (message == null) {
            this.notifyInvalidData("In showMessage: Invalid argument.  Null is not allowed.");
		}
		else {
			this.device.doTerminalMessage(message);
		}
	}

	public showWelcomeScreen(): void {
		if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In showWelcomeScreen");
		} else {
			this.device.doShowWelcomeScreen();
		}
	}

	public showThankYouScreen(): void {
		if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In showThankYouScreen");
		} else {
			this.device.doShowThankYouScreen();
		}
	}

    /**
     * Incompatibility between sdks!  Old cloud had this.
     *
     * @deprecated
     *
     * @param orderId
     * @param paymentId
     */
    public showPaymentReceiptOptions(orderId: string, paymentId: string): void {
        this.displayPaymentReceiptOptions(orderId, paymentId);
    }

	public displayPaymentReceiptOptions(orderId: string, paymentId: string): void {
		if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In displayPaymentReceiptOptions");
		}
		else if (orderId == null) {
            this.notifyInvalidData("In displayPaymentReceiptOptions: Invalid argument.  The orderId cannot be null.");
		}
		else if (paymentId == null) {
            this.notifyInvalidData("In displayPaymentReceiptOptions: Invalid argument.  The paymentId cannot be null.");
		}
		else {
			this.device.doShowPaymentReceiptScreen(orderId, paymentId);
		}
	}

	public openCashDrawer(request: sdk.remotepay.OpenCashDrawerRequest | string): void {
		if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In openCashDrawer");
		}
		else if (!request) {
		    this.notifyInvalidData("In openCashDrawer: Invalid argument. The request cannot be null.");
		} else if (typeof request === "string") {
		    this.device.doOpenCashDrawer(request);
		} else {
			this.device.doOpenCashDrawer(request.reason, null);
			//TODO: CAPS- per SEMI-1130, this process will not handle the printer ID yet, so passing null.  Once fixed, the second parameter should be 'request.deviceId'
		}
	}

	public showDisplayOrder(order: sdk.order.DisplayOrder): void {
		if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In showDisplayOrder");
		}
		else if (order == null) {
            this.notifyInvalidData("In showDisplayOrder: Invalid argument.  The order cannot be null.");
		}
		else {
			this.device.doOrderUpdate(order, null);
		}
	}

	public removeDisplayOrder(order: sdk.order.DisplayOrder): void {
		if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In removeDisplayOrder");
		}
		else if (order == null) {
            this.notifyInvalidData("In removeDisplayOrder: Invalid argument.  The order cannot be null.");
		}
		else {
			let dao: sdk.order.operation.OrderDeletedOperation = new sdk.order.operation.OrderDeletedOperation();
			dao.setId(order.getId());
			this.device.doOrderUpdate(order, dao);
		}
	}

	public dispose(): void {
		this.broadcaster.clear();
		if (this.device) {
			this.device.dispose();
		}
	}

	public invokeInputOption(io: sdk.remotepay.InputOption): void {
		if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In invokeInputOption");
		}
		else {
			this.device.doKeyPress(io.keyPress);
		}
	}

	public resetDevice(): void {
		if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In resetDevice");
		}
		else {
			this.device.doResetDevice();
		}
	}

	public retrieveDeviceStatus(request: sdk.remotepay.DeviceStatusRequest): void {
		if (!this.device || !this.isReady) {
			this.notifyDeviceNotConnected("In retrieveDeviceStatus");
		}
		else {
			this.device.doRetrieveDeviceStatus(request);
		}
	}

	private getCardEntryMethods(): number {
		return this.cardEntryMethods;
	}

	public startCustomActivity(request: sdk.remotepay.CustomActivityRequest): void {
		if (!this.device || !this.isReady) {
			this.notifyDeviceNotConnected("In invokeInputOption");
		}
		else {
			this.device.doStartActivity(request.getAction(), request.getPayload(), request.getNonBlocking());
		}
	}


	static populateBaseResponse(response: sdk.remotepay.BaseResponse,
                                 success: boolean,
                                 result: sdk.remotepay.ResponseCode,
                                 reason?: string,
                                 message?: string) : void {
        response.setSuccess(success);
        response.setResult(result);
        response.setReason(reason);
        response.setMessage(message);

    }
    static populatePaymentResponse(response: sdk.remotepay.PaymentResponse,
                                    success: boolean,
                                    result: sdk.remotepay.ResponseCode,
                                    payment: sdk.payments.Payment,
                                    signature?: sdk.base.Signature,
                                    reason?: string,
                                    message?: string) : void {
        CloverConnector.populateBaseResponse(response, success, result, reason, message);
        response.setPayment(payment);
        response.setSignature(signature);
        response.setIsSale(
            sdk.payments.CardTransactionType.AUTH == payment.getCardTransaction().getType() &&
            sdk.payments.Result.SUCCESS == payment.getResult() );
        response.setIsAuth(
            sdk.payments.CardTransactionType.PREAUTH == payment.getCardTransaction().getType() &&
            sdk.payments.Result.SUCCESS == payment.getResult() );
        response.setIsPreAuth(
            sdk.payments.CardTransactionType.PREAUTH == payment.getCardTransaction().getType() &&
            sdk.payments.Result.AUTH == payment.getResult() );
    }
}

export namespace CloverConnector {
	export class TxTypeRequestInfo {
		public static SALE_REQUEST:string = "SALE";
		public static AUTH_REQUEST:string = "AUTH";
		public static PREAUTH_REQUEST:string = "PREAUTH";
		public static CREDIT_REQUEST:string = "CREDIT";
		public static REFUND_REQUEST:string = "REFUND";
	}

	export class InnerDeviceObserver implements CloverDeviceObserver {
		// Create a logger
		logger: Logger = Logger.create();

		// Clover connector we are using
		cloverConnector: CloverConnector;

		// Hold the last Payment Refund Response
		lastPRR: sdk.remotepay.RefundPaymentResponse; //still in use until orderRef is populated on refund objects

		constructor(cc: CloverConnector) {
			this.cloverConnector = cc;
		}

		public onTxState(txState: sdk.remotemessage.TxState): void {
		}

		private getMessageTypeFromLastRequest(lastRequest: any): string {
			if (lastRequest instanceof sdk.remotepay.PreAuthRequest) {
				return TxTypeRequestInfo.PREAUTH_REQUEST;
			}
			else if (lastRequest instanceof sdk.remotepay.AuthRequest) {
				return TxTypeRequestInfo.AUTH_REQUEST;
			}
			else if (lastRequest instanceof sdk.remotepay.SaleRequest) {
				return TxTypeRequestInfo.SALE_REQUEST;
			}
			else if (lastRequest instanceof sdk.remotepay.ManualRefundRequest) {
				return TxTypeRequestInfo.CREDIT_REQUEST;
			}
			return null;
		}

		public onTxStartResponse(result: sdk.remotemessage.TxStartResponseResult, externalId: string, requestInfo:string): void {
			if (result == sdk.remotemessage.TxStartResponseResult.SUCCESS) return;

			let duplicate: boolean = (result == sdk.remotemessage.TxStartResponseResult.DUPLICATE);
			let code: sdk.remotepay.ResponseCode = duplicate ? sdk.remotepay.ResponseCode.CANCEL : sdk.remotepay.ResponseCode.FAIL;
			let message: string = duplicate ? "The provided transaction id of " + externalId + " has already been processed and cannot be resubmitted." : null;
			try {
				// The old (deprecated) way to get the type.  Here for backwards compatibility
				if (requestInfo == null) {
					requestInfo = this.getMessageTypeFromLastRequest(this.cloverConnector.lastRequest);
				}
				// Use the requestInfo if it exists, to determine the request type
				if (requestInfo == TxTypeRequestInfo.PREAUTH_REQUEST) {
					let response: sdk.remotepay.PreAuthResponse = new sdk.remotepay.PreAuthResponse();
                    CloverConnector.populateBaseResponse(response, false, code, result, message);
					this.cloverConnector.broadcaster.notifyOnPreAuthResponse(response);
				}
				else if (requestInfo == TxTypeRequestInfo.AUTH_REQUEST) {
					let response: sdk.remotepay.AuthResponse = new sdk.remotepay.AuthResponse();
                    CloverConnector.populateBaseResponse(response, false, code, result, message);
					this.cloverConnector.broadcaster.notifyOnAuthResponse(response);
				}
				else if (requestInfo == TxTypeRequestInfo.SALE_REQUEST) {
					let response: sdk.remotepay.SaleResponse = new sdk.remotepay.SaleResponse();
                    CloverConnector.populateBaseResponse(response, false, code, result, message);
					this.cloverConnector.broadcaster.notifyOnSaleResponse(response);
				}
				else if (requestInfo == TxTypeRequestInfo.CREDIT_REQUEST) {
					let response: sdk.remotepay.ManualRefundResponse = new sdk.remotepay.ManualRefundResponse();
                    CloverConnector.populateBaseResponse(response, false, code, result, message);
					this.cloverConnector.broadcaster.notifyOnManualRefundResponse(response);
				} else {
					this.logger.error("Could not determine request type. requestInfo = " + requestInfo + " lastRequest = " + this.cloverConnector.lastRequest);
				}
			}
			finally {
				this.cloverConnector.lastRequest = null;
			}
		}

		public onUiState(uiState: sdk.remotemessage.UiState, uiText: string, uiDirection: sdk.remotemessage.UiDirection, inputOptions: Array<sdk.remotemessage.InputOption>): void {
			let deviceEvent: sdk.remotepay.CloverDeviceEvent = new sdk.remotepay.CloverDeviceEvent();
			deviceEvent.setInputOptions(inputOptions);
			deviceEvent.setEventState(sdk.remotepay.DeviceEventState[uiState.toString()]);
			deviceEvent.setMessage(uiText);
			if (uiDirection == sdk.remotemessage.UiDirection.ENTER) {
				this.cloverConnector.broadcaster.notifyOnDeviceActivityStart(deviceEvent);
			}
			else if (uiDirection == sdk.remotemessage.UiDirection.EXIT) {
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
		public onAuthTipAdjusted(result: sdk.remotepay.ResponseCode, reason: string, message: string): void;
		public onAuthTipAdjusted(resultStatusOrPaymentId: any, reasonOrTipAmount: any, messageOrSuccess: any): void {
			if (typeof resultStatusOrPaymentId == 'string') {
				if (messageOrSuccess) {
					this.onAuthTipAdjustedHandler(resultStatusOrPaymentId, reasonOrTipAmount, messageOrSuccess, sdk.remotepay.ResponseCode.SUCCESS, null, null);
				}
				else {
					this.onAuthTipAdjustedHandler(resultStatusOrPaymentId, reasonOrTipAmount, messageOrSuccess, sdk.remotepay.ResponseCode.FAIL, 'Failure', 'TipAdjustAuth failed to process for payment ID: ' + resultStatusOrPaymentId);
				}
			}  else {
				this.onAuthTipAdjustedHandler(null, 0, false, resultStatusOrPaymentId, reasonOrTipAmount, messageOrSuccess);
			}
		}
		private onAuthTipAdjustedHandler(paymentId: string, tipAmount: number, success: boolean, result: sdk.remotepay.ResponseCode, reason: string, message: string): void {
			let response: sdk.remotepay.TipAdjustAuthResponse = new sdk.remotepay.TipAdjustAuthResponse(success, result);
			response.setPaymentId(paymentId);
			response.setTipAmount(tipAmount);
            CloverConnector.populateBaseResponse(response, success, result, reason, message);
			this.cloverConnector.broadcaster.notifyOnTipAdjustAuthResponse(response);
		}

		public onCashbackSelected(cashbackAmount: number): void {
			//TODO: For future use
		}

		public onPartialAuth(partialAmount: number): void {
			//TODO: For future use
		}

		public onFinishOkPayment(payment: sdk.payments.Payment, signature: sdk.base.Signature, requestInfo:string): void {
			try {
				this.cloverConnector.device.doShowThankYouScreen(); //need to do this first, so Listener implementation can replace the screen as desired
				let lastRequest:any = this.cloverConnector.lastRequest;
				this.cloverConnector.lastRequest = null;
				if (!requestInfo) {
					// This is deprecated logic and should be removed at some point in the future
					// when we are comfortable that there are no longer any backward compatibility issues
					requestInfo = this.getMessageTypeFromLastRequest(lastRequest);
				}
				if (requestInfo == TxTypeRequestInfo.PREAUTH_REQUEST) {
					let response: sdk.remotepay.PreAuthResponse = new sdk.remotepay.PreAuthResponse();
					CloverConnector.populatePaymentResponse(response, true, sdk.remotepay.ResponseCode.SUCCESS, payment, signature);
					this.cloverConnector.broadcaster.notifyOnPreAuthResponse(response);
					this.cloverConnector.lastRequest = null;
				}
				else if (requestInfo == TxTypeRequestInfo.AUTH_REQUEST) {
					let response: sdk.remotepay.AuthResponse = new sdk.remotepay.AuthResponse();
					CloverConnector.populatePaymentResponse(response, true, sdk.remotepay.ResponseCode.SUCCESS, payment, signature);
					this.cloverConnector.broadcaster.notifyOnAuthResponse(response);
					this.cloverConnector.lastRequest = null;
				}
				else if (requestInfo == TxTypeRequestInfo.SALE_REQUEST) {
					let response: sdk.remotepay.SaleResponse = new sdk.remotepay.SaleResponse();
					CloverConnector.populatePaymentResponse(response, true, sdk.remotepay.ResponseCode.SUCCESS, payment, signature);
					this.cloverConnector.broadcaster.notifyOnSaleResponse(response);
					this.cloverConnector.lastRequest = null;
				}
				else {
					this.logger.error("Failed to pair this response: " + payment);
				}
			}
			finally {
				// do nothing for now...
			}
		}

		public onFinishOkCredit(credit: sdk.payments.Credit): void {
			try {
				this.cloverConnector.device.doShowWelcomeScreen();
				this.cloverConnector.lastRequest = null;
				let response: sdk.remotepay.ManualRefundResponse = new sdk.remotepay.ManualRefundResponse();
				CloverConnector.populateBaseResponse(response, true, sdk.remotepay.ResponseCode.SUCCESS);
				response.setCredit(credit);
				this.cloverConnector.broadcaster.notifyOnManualRefundResponse(response);
			}
			finally {}
		}

		public onFinishOkRefund(refund: sdk.payments.Refund): void {
			try {
				this.cloverConnector.device.doShowWelcomeScreen();
				this.cloverConnector.lastRequest = null;
				//NOTE: these two lines can eventually be removed (once refunds have the orderRef populated correctly):
                let lastRefundResponse: sdk.remotepay.RefundPaymentResponse = this.lastPRR; //only needed for the order ID
                this.lastPRR = null;
				if (refund.getOrderRef() != null) {
				    let success: boolean = true;
                    let response: sdk.remotepay.RefundPaymentResponse = new sdk.remotepay.RefundPaymentResponse();
                    CloverConnector.populateBaseResponse(response, success,
                        success ? sdk.remotepay.ResponseCode.SUCCESS : sdk.remotepay.ResponseCode.FAIL);
                    response.setOrderId(refund.getOrderRef());
                    response.setPaymentId(refund.getPaymentId());
                    response.setRefund(refund);
                    this.cloverConnector.broadcaster.notifyOnRefundPaymentResponse(response);
				} else {
                    if (lastRefundResponse && lastRefundResponse.getRefund().getId() == refund.getId()) { //need to make sure it's the same refund before sending
                        this.cloverConnector.broadcaster.notifyOnRefundPaymentResponse(lastRefundResponse);
                    } else {
                        let success: boolean = true;
                        let response: sdk.remotepay.RefundPaymentResponse = new sdk.remotepay.RefundPaymentResponse();
                        CloverConnector.populateBaseResponse(response, success,
                            success ? sdk.remotepay.ResponseCode.SUCCESS : sdk.remotepay.ResponseCode.FAIL);
                        response.setPaymentId(refund.getPaymentId());
                        response.setRefund(refund);
                        this.cloverConnector.broadcaster.notifyOnRefundPaymentResponse(response);
                    }
				}
			}
			finally {}
		}

		public onFinishOk(payment: sdk.payments.Payment, signature: sdk.base.Signature, requestInfo:string): void;
		public onFinishOk(credit: sdk.payments.Credit): void;
		public onFinishOk(refund: sdk.payments.Refund): void;
		public onFinishOk(paymentCreditOrRefund: any, signature?: sdk.base.Signature, requestInfo?:string): void {
			if (paymentCreditOrRefund instanceof sdk.payments.Payment /* && signature */) {
				this.onFinishOkPayment(paymentCreditOrRefund, signature, requestInfo);
			}
			else if (paymentCreditOrRefund instanceof sdk.payments.Credit) {
				this.onFinishOkCredit(paymentCreditOrRefund);
			}
			else {
				this.onFinishOkRefund(paymentCreditOrRefund);
			}
		}

		public onFinishCancel_rmm(result: sdk.remotepay.ResponseCode, reason: string, message: string, requestInfo:string) {
			try {
				if(this.cloverConnector.device) {
					this.cloverConnector.device.doShowWelcomeScreen();
				}
				let lastReq: any = this.cloverConnector.lastRequest;
				this.cloverConnector.lastRequest = null;
				if (!requestInfo) {
					requestInfo = this.getMessageTypeFromLastRequest(lastReq);
					if (!requestInfo) {
						this.logger.error('onFinishCancel called, requestInfo was null, and ' +
							'could not determine the type of the message from the last request',
							arguments);
					}
				}
				if (requestInfo == TxTypeRequestInfo.PREAUTH_REQUEST) {
					this.onFinishCancelPreAuth(result, reason, message);
				}
				else if (requestInfo == TxTypeRequestInfo.SALE_REQUEST) {
					this.onFinishCancelSale(result, reason, message);
				}
				else if (requestInfo == TxTypeRequestInfo.AUTH_REQUEST) {
					this.onFinishCancelAuth(result, reason, message);
				}
				else if (requestInfo == TxTypeRequestInfo.CREDIT_REQUEST) {
					this.onFinishCancelManualRefund(result, reason, message);
				}
				else if (requestInfo == TxTypeRequestInfo.REFUND_REQUEST) {
					this.onFinishCancelRefund(result, reason, message);
				} else {
					this.logger.error('onFinishCancel called, but could not determine how to respond!', arguments);
				}
			}
			finally {
				// do nothing
			}
		}

		public onFinishCancel(requestInfo:string): void {
			this.onFinishCancel_rmm(sdk.remotepay.ResponseCode.CANCEL, null, null, requestInfo);
		}

        public onFinishCancelPreAuth(result: sdk.remotepay.ResponseCode, reason?: string, message?: string): void {
            let response:sdk.remotepay.PreAuthResponse = new sdk.remotepay.PreAuthResponse();
            CloverConnector.populateBaseResponse(response, false, result,
                reason ? reason : "Request Canceled",
                message ? message : "The PreAuth Request was canceled.");
            this.cloverConnector.broadcaster.notifyOnPreAuthResponse(response);
        }

        public onFinishCancelSale(result: sdk.remotepay.ResponseCode, reason?: string, message?: string): void {
            let response: sdk.remotepay.SaleResponse = new sdk.remotepay.SaleResponse();
            CloverConnector.populateBaseResponse(response, false, result,
                reason ? reason : "Request Canceled",
                message ? message : "The Sale Request was canceled.");
            this.cloverConnector.broadcaster.notifyOnSaleResponse(response);
        }

        public onFinishCancelAuth(result: sdk.remotepay.ResponseCode, reason?: string, message?: string): void {
            let response: sdk.remotepay.AuthResponse = new sdk.remotepay.AuthResponse();
            CloverConnector.populateBaseResponse(response, false, result,
                reason ? reason : "Request Canceled",
                message ? message : "The Auth Request was canceled.");
            this.cloverConnector.broadcaster.notifyOnAuthResponse(response);
        }

        public onFinishCancelManualRefund(result: sdk.remotepay.ResponseCode, reason?: string, message?: string): void {
            let response: sdk.remotepay.ManualRefundResponse = new sdk.remotepay.ManualRefundResponse();
            CloverConnector.populateBaseResponse(response, false, result,
                reason ? reason : "Request Canceled",
                message ? message : "The Manual Refund Request was canceled.");
            this.cloverConnector.broadcaster.notifyOnManualRefundResponse(response);
        }

        public onFinishCancelRefund(result: sdk.remotepay.ResponseCode, reason?: string, message?: string): void {
            let response: sdk.remotepay.RefundPaymentResponse = new sdk.remotepay.RefundPaymentResponse();
            CloverConnector.populateBaseResponse(response, false, result,
                reason ? reason : "Request Canceled",
                message ? message : "The Refund Request was canceled.");
            this.cloverConnector.broadcaster.notifyOnRefundPaymentResponse(response);
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

        public onPaymentVoided(payment: sdk.payments.Payment, voidReason: sdk.order.VoidReason,
                               resultStatus: sdk.remotemessage.ResultStatus, reason: string, message: string): void {
            let success: boolean = (resultStatus == sdk.remotemessage.ResultStatus.SUCCESS);
            let result: sdk.remotepay.ResponseCode = (success ? sdk.remotepay.ResponseCode.SUCCESS : sdk.remotepay.ResponseCode.FAIL);
            reason = reason != null ? reason : result.toString();
            message = message ? message : "No extended information provided.";

            let response: sdk.remotepay.VoidPaymentResponse = new sdk.remotepay.VoidPaymentResponse();
            response.setPaymentId(payment != null ? payment.getId() : null);
            CloverConnector.populateBaseResponse(response, success, result, reason, message);
            this.cloverConnector.broadcaster.notifyOnVoidPaymentResponse(response);
        }

        public onPaymentVoided_responseCode(code: sdk.remotepay.ResponseCode, reason: string, message: string): void {
            let success: boolean = (code == sdk.remotepay.ResponseCode.SUCCESS);
            reason = reason ? reason : code.toString();
            message = message ? message : "No extended information provided.";

            let response: sdk.remotepay.VoidPaymentResponse = new sdk.remotepay.VoidPaymentResponse();
            CloverConnector.populateBaseResponse(response, success, code, reason, message);
            this.cloverConnector.broadcaster.notifyOnVoidPaymentResponse(response);
        }

		public onKeyPressed(keyPress: sdk.remotemessage.KeyPress): void {
			//TODO: For future use
		}

		public onPaymentRefundResponse(orderId: string, paymentId: string, refund: sdk.payments.Refund, code: sdk.remotemessage.TxState): void {
			// hold the response for finishOk for the refund. See comments in onFinishOk(Refund)
			let success: boolean = (code == sdk.remotemessage.TxState.SUCCESS);
			let response: sdk.remotepay.RefundPaymentResponse = new sdk.remotepay.RefundPaymentResponse();
            CloverConnector.populateBaseResponse(response, success,
                success ? sdk.remotepay.ResponseCode.SUCCESS : sdk.remotepay.ResponseCode.FAIL);
			response.setOrderId(orderId);
			response.setPaymentId(paymentId);
			response.setRefund(refund);
			//NOTE: While this is currently needed, we are attempting to move away from this requirement
			this.lastPRR = response; // set this so we have the appropriate information for when onFinish(Refund) is called
		}

		public onVaultCardResponse(vaultedCard: sdk.payments.VaultedCard, code: string, reason: string): void;
	    public onVaultCardResponse(success: boolean, code: sdk.remotepay.ResponseCode, reason: string, message: string, vaultedCard: sdk.payments.VaultedCard): void;
		public onVaultCardResponse(vaultedCardOrSuccess: any, code: any, reason: string, message?: string, vaultedCard?: sdk.payments.VaultedCard): void {
			if (vaultedCardOrSuccess instanceof sdk.payments.VaultedCard) {
				let success: boolean = (code == sdk.remotepay.ResponseCode.SUCCESS);
				this.onVaultCardResponse(success, success ? sdk.remotepay.ResponseCode.SUCCESS : sdk.remotepay.ResponseCode.FAIL, null, null, vaultedCardOrSuccess);
			}
			else {
				this.cloverConnector.device.doShowWelcomeScreen();
				let response: sdk.remotepay.VaultCardResponse = new sdk.remotepay.VaultCardResponse();
				response.setCard(vaultedCard);
                CloverConnector.populateBaseResponse(response, vaultedCardOrSuccess, code, reason, message);
				this.cloverConnector.broadcaster.notifyOnVaultCardRespose(response);
			}
		}

		public onCapturePreAuth(statusOrCode: any,
                                reason: string,
                                paymentId: string, amount: number, tipAmount: number): void {
            let success: boolean = (sdk.remotemessage.ResultStatus.SUCCESS == statusOrCode);
            let response: sdk.remotepay.CapturePreAuthResponse = new sdk.remotepay.CapturePreAuthResponse();
            CloverConnector.populateBaseResponse(response, success, statusOrCode, reason);
            response.setPaymentId(paymentId);
            response.setAmount(amount);
            response.setTipAmount(tipAmount);
            this.cloverConnector.broadcaster.notifyOnCapturePreAuth(response);
		}

		public onCloseoutResponse(status: sdk.remotemessage.ResultStatus, reason: string, batch: sdk.payments.Batch): void;
		public onCloseoutResponse(result: sdk.remotepay.ResponseCode, reason: string, message: string): void;
		public onCloseoutResponse(statusOrResult: any, reason: string, batchOrMessage: any): void {
			if (statusOrResult instanceof sdk.remotemessage.ResultStatus) {
				this.onCloseoutResponseHandler(batchOrMessage, statusOrResult == sdk.remotemessage.ResultStatus.SUCCESS ? sdk.remotepay.ResponseCode.SUCCESS : sdk.remotepay.ResponseCode.FAIL, reason, null);
			}
			else {
				this.onCloseoutResponseHandler(null, statusOrResult, reason, batchOrMessage);
			}
		}
		private onCloseoutResponseHandler(batch: sdk.payments.Batch, result: sdk.remotepay.ResponseCode, reason: string, message: string): void {
			let success: boolean = (result == sdk.remotepay.ResponseCode.SUCCESS);
			let response: sdk.remotepay.CloseoutResponse = new sdk.remotepay.CloseoutResponse();
            CloverConnector.populateBaseResponse(response, success, result, reason, message);
            response.setBatch(batch);
			this.cloverConnector.broadcaster.notifyCloseout(response);
		}

		public onDeviceDisconnected(device: CloverDevice, message?:string): void {
			this.logger.debug('Disconnected ', message);
			this.cloverConnector.isReady = false;
			this.cloverConnector.broadcaster.notifyOnDisconnect(message);
		}

		public onDeviceConnected(): void {
			this.logger.debug('Connected');
			this.cloverConnector.isReady = false;
			this.cloverConnector.broadcaster.notifyOnConnect();
		}

		public onDeviceReady(device: CloverDevice, drm: sdk.remotemessage.DiscoveryResponseMessage): void {
			this.logger.debug('Ready');
			this.cloverConnector.isReady = drm.ready;

            // Build merchant info from the discoveryrequest
			let merchantInfo: sdk.remotepay.MerchantInfo = new sdk.remotepay.MerchantInfo();
            merchantInfo.setMerchantID(drm.getMerchantId());
            merchantInfo.setMerchantMID(drm.getMerchantMId());
            merchantInfo.setMerchantName(drm.getMerchantName());
            let deviceInfo: sdk.remotepay.DeviceInfo = new sdk.remotepay.DeviceInfo();
            merchantInfo.setDeviceInfo(deviceInfo);
            deviceInfo.setName(drm.getName());
            deviceInfo.setModel(drm.getModel());
            deviceInfo.setSerial(drm.getSerial());
			deviceInfo.setSupportsAcks(drm.getSupportsAcknowledgement());
            merchantInfo.setSupportsPreAuths(drm.getSupportsTipAdjust());
            merchantInfo.setSupportsManualRefunds(drm.getSupportsManualRefund());
            merchantInfo.setSupportsTipAdjust(drm.getSupportsTipAdjust());
            merchantInfo.setSupportsAuths(drm.getSupportsTipAdjust());
            merchantInfo.setSupportsVaultCards(drm.getSupportsManualRefund());

			this.cloverConnector.merchantInfo = merchantInfo;
			this.cloverConnector.device.setSupportsAcks(merchantInfo.deviceInfo.getSupportsAcks());

			if (drm.ready) {
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
		public onPendingPaymentsResponse(result: sdk.remotepay.ResponseCode, reason: string, message: string): void;
		public onPendingPaymentsResponse(status: sdk.remotemessage.ResultStatus, reason: string, message: string): void;
		public onPendingPaymentsResponse(resultStatusOrSuccess: any, pendingPaymentsOrReason: any, message?: string): void {
			if (typeof resultStatusOrSuccess == 'boolean') {
				this.onPendingPaymentsResponseHandler(resultStatusOrSuccess, pendingPaymentsOrReason, sdk.remotepay.ResponseCode.SUCCESS, null, null);
			}
			else if (resultStatusOrSuccess instanceof sdk.remotemessage.ResultStatus) {
				this.onPendingPaymentsResponse(resultStatusOrSuccess == sdk.remotemessage.ResultStatus.SUCCESS ? sdk.remotepay.ResponseCode.SUCCESS : sdk.remotepay.ResponseCode.FAIL, pendingPaymentsOrReason, message);
			}
			else {
				this.cloverConnector.device.doShowWelcomeScreen();
				this.onPendingPaymentsResponseHandler(false, null, resultStatusOrSuccess, pendingPaymentsOrReason, message);
			}
		}
		private onPendingPaymentsResponseHandler(success: boolean, pendingPayments: Array<sdk.base.PendingPaymentEntry>, result: sdk.remotepay.ResponseCode, reason: string, message: string): void {
			let response: sdk.remotepay.RetrievePendingPaymentsResponse = new sdk.remotepay.RetrievePendingPaymentsResponse();
            CloverConnector.populateBaseResponse(response, success, result, reason, message);
            response.setPendingPaymentEntries(pendingPayments);
			this.cloverConnector.broadcaster.notifyOnRetrievePendingPaymentResponse(response);
		}

		public onReadCardResponse(status: sdk.remotemessage.ResultStatus, reason: string, cardData: sdk.base.CardData): void {
			let success: boolean = (status == sdk.remotemessage.ResultStatus.SUCCESS);
			if (success) {
				let response: sdk.remotepay.ReadCardDataResponse = new sdk.remotepay.ReadCardDataResponse();
                CloverConnector.populateBaseResponse(response, success,
                    success ? sdk.remotepay.ResponseCode.SUCCESS : sdk.remotepay.ResponseCode.FAIL,
                    reason);
                response.setCardData(cardData);
				this.cloverConnector.device.doShowWelcomeScreen();
				this.cloverConnector.broadcaster.notifyOnReadCardDataResponse(response);
			}
			else if (status == sdk.remotemessage.ResultStatus.CANCEL) {
				this.onReadCardDataResponse(sdk.remotepay.ResponseCode.CANCEL, reason, '');
			}
			else {
				this.onReadCardDataResponse(sdk.remotepay.ResponseCode.FAIL, reason, '');
			}
		}
		public onMessageFromActivity(actionId:string, payload:string): void{
			let message: sdk.remotepay.MessageFromActivity = new sdk.remotepay.MessageFromActivity();
			message.setAction(actionId);
			message.setPayload(payload);
			this.cloverConnector.broadcaster.notifyOnActivityMessage(message);
		}

		public onReadCardDataResponse(result: sdk.remotepay.ResponseCode, reason: string, message: string): void {
			let success: boolean = (result == sdk.remotepay.ResponseCode.SUCCESS);
			this.cloverConnector.device.doShowWelcomeScreen();
			let response: sdk.remotepay.ReadCardDataResponse = new sdk.remotepay.ReadCardDataResponse();
			CloverConnector.populateBaseResponse(response, success, result,
				reason, message);
			this.cloverConnector.broadcaster.notifyOnReadCardDataResponse(response);
		}

		public onActivityResponse(status:sdk.remotemessage.ResultStatus, payload:string, reason:string, actionId:string): void {
			let success: boolean = (status == sdk.remotemessage.ResultStatus.SUCCESS);
			let result:sdk.remotepay.ResponseCode = success ? sdk.remotepay.ResponseCode.SUCCESS : sdk.remotepay.ResponseCode.CANCEL;
			let response:sdk.remotepay.CustomActivityResponse = new sdk.remotepay.CustomActivityResponse();
			CloverConnector.populateBaseResponse(response, success, result,
				reason);
			response.setPayload(payload);
			response.setAction(actionId);
			this.cloverConnector.broadcaster.notifyOnActivityResponse(response);
		}

		public onDeviceStatusResponse(result:sdk.remotepay.ResponseCode, reason: string, state:sdk.remotemessage.ExternalDeviceState, data:sdk.remotemessage.ExternalDeviceStateData): void {
			let success: boolean = (result == sdk.remotemessage.ResultStatus.SUCCESS);

			let response:sdk.remotepay.RetrieveDeviceStatusResponse  = new sdk.remotepay.RetrieveDeviceStatusResponse();
			CloverConnector.populateBaseResponse(response, success, result,
				reason);
			response.setState(state);
			response.setData(data);
			this.cloverConnector.broadcaster.notifyOnRetrieveDeviceStatusResponse(response);
		}

		public onResetDeviceResponse(result:sdk.remotepay.ResponseCode, reason: string, state:sdk.remotemessage.ExternalDeviceState): void {
			let success: boolean = (result == sdk.remotepay.ResponseCode.SUCCESS);

			let response:sdk.remotepay.ResetDeviceResponse  = new sdk.remotepay.ResetDeviceResponse();
			CloverConnector.populateBaseResponse(response, success, result,
				reason);
			response.setState(state);
			this.cloverConnector.broadcaster.notifyOnResetDeviceResponse(response);
		}

		public onRetrievePaymentResponse(result:sdk.remotepay.ResponseCode, reason: string, externalPaymentId: string, queryStatus:sdk.remotemessage.QueryStatus, payment:sdk.payments.Payment): void {
			let success: boolean = (result == sdk.remotepay.ResponseCode.SUCCESS);

			let response:sdk.remotepay.RetrievePaymentResponse  = new sdk.remotepay.RetrievePaymentResponse();
			CloverConnector.populateBaseResponse(response, success, result,
				reason);
			response.setExternalPaymentId(externalPaymentId);
			response.setQueryStatus(queryStatus);
			response.setPayment(payment);
			this.cloverConnector.broadcaster.notifyOnRetrievePaymentResponse(response);
		}

		public onRetrievePrintersResponse(result:sdk.remotepay.ResponseCode, reason: string, printers:sdk.printers.Printers[]): void {
            let success: boolean = (result == sdk.remotepay.ResponseCode.SUCCESS);
		    let response:sdk.remotepay.RetrievePrintersResponse = new sdk.remotepay.RetrievePrintersResponse();
		    CloverConnector.populateBaseResponse(response, success, result, reason);
		    response.setPrinters(printers);
		    this.cloverConnector.broadcaster.notifyOnRetrievePrintersResponse(response);
		}

		public onPrintJobStatusResponse(result: sdk.remotepay.ResponseCode, reason: string, printRequestId: string, printStatus: sdk.remotepay.PrintJobStatusResponse.Status): void {
		    let success: boolean = (result == sdk.remotepay.ResponseCode.SUCCESS);
		    let response: sdk.remotepay.PrintJobStatusResponse = new sdk.remotepay.PrintJobStatusResponse();
		    CloverConnector.populateBaseResponse(response, success, result, reason);
		    response.setStatus(printStatus);
			response.setPrintRequestId(printRequestId);
		    this.cloverConnector.broadcaster.notifyOnPrintJobStatusResponse(response);
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
