import * as sdk from 'remote-pay-cloud-api';

import {CardEntryMethods} from './CardEntryMethods';
import {CloverConnectorBroadcaster} from './CloverConnectorBroadcaster';
import {CloverDevice} from './device/CloverDevice';
import {CloverDeviceConfiguration} from './device/CloverDeviceConfiguration';
import {CloverDeviceFactory} from './device/CloverDeviceFactory';
import {CloverDeviceObserver} from './CloverDeviceObserver';
import {Logger} from './util/Logger';

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
        const indexOfListener = this.broadcaster.indexOf(connectorListener);
        if (indexOfListener != -1) {
            this.broadcaster.splice(indexOfListener, 1);
        }
    }

    public sale(request: sdk.remotepay.SaleRequest): void {
        if (!this.device || !this.isReady) {
            this.deviceObserver.onFinishCancelSale(sdk.remotepay.ResponseCode.ERROR,"Device Connection Error","In sale: SaleRequest - The Clover device is not connected.");
        } else if (request.getVaultedCard() && !this.merchantInfo.getSupportsVaultCards()) {
            this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.UNSUPPORTED, "Merchant Configuration Validation Error", `In sale: SaleRequest - Vault Card support is not enabled for the payment gateway. Original Request = ${request}`, CloverConnector.TxTypeRequestInfo.SALE_REQUEST);
        } else {
            if (request.getTipAmount() == null) {
                request.setTipAmount(0);
            }
            try {
                this.setupSaleRequest(request);
            } catch (e) {
                this.logger.debug("Error in sale", e);
                this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.ERROR, e, null, CloverConnector.TxTypeRequestInfo.SALE_REQUEST);
            }
        }
    }

    private setupPreauthRequest(request: sdk.remotepay.PreAuthRequest): void {
        this.setupBaseTransactionRequest(request, new sdk.payments.TransactionSettings(), new PayIntent.Builder(), CloverConnector.TxTypeRequestInfo.PREAUTH_REQUEST);
    }

    private setupAuthRequest(request: sdk.remotepay.AuthRequest): void {
        let transactionSettings = new sdk.payments.TransactionSettings();
        transactionSettings.setTipMode(sdk.payments.TipMode.ON_PAPER); // overriding TipMode, since it's an Auth request
        this.setupTransactionRequest(request, transactionSettings, new PayIntent.Builder(), CloverConnector.TxTypeRequestInfo.AUTH_REQUEST);
    }

    public setupSaleRequest(request: sdk.remotepay.SaleRequest) {
        let transactionSettings = new sdk.payments.TransactionSettings();
        if(request.getTipMode() != null) {
            transactionSettings.setTipMode(request.getTipMode());
        }

        let builder = new PayIntent.Builder();
        if(request.getTipAmount() != null) {
            builder.setTipAmount(request.getTipAmount());
        }
        this.setupTransactionRequest(request, transactionSettings, builder, CloverConnector.TxTypeRequestInfo.SALE_REQUEST);
    }

    private setupTransactionRequest(request: sdk.remotepay.TransactionRequest, transactionSettings: sdk.payments.TransactionSettings, builder: PayIntent.Builder, paymentRequestType: string): void {

        if(request.getSignatureEntryLocation() != null) {
            transactionSettings.setSignatureEntryLocation(request.getSignatureEntryLocation());
        }
        if(request.getSignatureThreshold() != null) {
            transactionSettings.setSignatureThreshold(request.getSignatureThreshold());
        }
        if(request.getAutoAcceptSignature() != null) {
            transactionSettings.setAutoAcceptSignature(request.getAutoAcceptSignature());
        }
        if(request.getDisableCashback() != null) {
            transactionSettings.setDisableCashBack(request.getDisableCashback());
        }
        if(request.getAllowOfflinePayment() != null) {
            transactionSettings.setAllowOfflinePayment(request.getAllowOfflinePayment());
        }
        if(request.getForceOfflinePayment() != null) {
            transactionSettings.setForceOfflinePayment(request.getForceOfflinePayment());
        }
        if(request.getApproveOfflinePaymentWithoutPrompt() != null) {
            transactionSettings.setApproveOfflinePaymentWithoutPrompt(request.getApproveOfflinePaymentWithoutPrompt());
        }
        if (request.getTaxAmount() != null) {
            builder.setTaxAmount(request.getTaxAmount());
        }
        if(request.getTippableAmount() != null) {
            transactionSettings.setTippableAmount(request.getTippableAmount());
        }
        if(request.getTipSuggestions() != null){
            transactionSettings.setTipSuggestions(request.getTipSuggestions());
        }

        this.setupBaseTransactionRequest(request, transactionSettings, builder, paymentRequestType);
    }

    private setupBaseTransactionRequest(request: sdk.remotepay.BaseTransactionRequest, transactionSettings: sdk.payments.TransactionSettings, builder: PayIntent.Builder, paymentRequestType: string) {
        if (this.device != null && this.isReady) {
            builder.setTransactionType(request.getType());
            builder.setAmount(request.getAmount());
            builder.setVaultedCard(request.getVaultedCard());
            builder.setExternalPaymentId(request.getExternalId() != null ? request.getExternalId().trim() : null);
            builder.setRequiresRemoteConfirmation(true);
            if (request.getCardNotPresent() != null) {
                builder.setCardNotPresent(request.getCardNotPresent());
            }
            transactionSettings.setCardEntryMethods(request.getCardEntryMethods() != null ? request.getCardEntryMethods() : this.cardEntryMethods);
            if (request.getDisablePrinting() != null) {
                transactionSettings.setCloverShouldHandleReceipts(!request.getDisablePrinting());
            }
            if (request.getDisableRestartTransactionOnFail() != null) {
                transactionSettings.setDisableRestartTransactionOnFailure(request.getDisableRestartTransactionOnFail());
            }
            if (request.getDisableReceiptSelection() != null) {
                transactionSettings.setDisableReceiptSelection(request.getDisableReceiptSelection());
            }
            if (request.getDisableDuplicateChecking() != null) {
                transactionSettings.setDisableDuplicateCheck(request.getDisableDuplicateChecking());
            }
            if (request.getAutoAcceptPaymentConfirmations() != null) {
                transactionSettings.setAutoAcceptPaymentConfirmations(request.getAutoAcceptPaymentConfirmations());
            }
            if (request.getRegionalExtras() != null) {
                transactionSettings.setRegionalExtras(request.getRegionalExtras());
            }
            if (request.getExtras() != null) {
                builder.setPassThroughValues(request.getExtras());
            }
            if (request.getExternalReferenceId() != null) {
                builder.setExternalReferenceId(request.getExternalReferenceId());
            }

            builder.setTransactionSettings(transactionSettings);

            let payIntent: sdk.remotemessage.PayIntent = builder.build();
            this.device.doTxStart(payIntent, null, paymentRequestType);
        }
    }

    public notifyDeviceNotConnected(message: string): void {
        this.notifyDeviceError(sdk.remotepay.ErrorType.COMMUNICATION,
            sdk.remotepay.DeviceErrorEventCode.NotConnected,
            null,
            message + ": Device is not connected.");
    }

    public notifyInvalidData(message: string): void {
        this.notifyDeviceError(sdk.remotepay.ErrorType.VALIDATION,
            sdk.remotepay.DeviceErrorEventCode.InvalidParam,
            null,
            message);
    }

    public notifyDeviceError(errorType: sdk.remotepay.ErrorType, errorCode: sdk.remotepay.DeviceErrorEventCode, cause: sdk.remotepay.PlatformError, message: string): void {
        let deviceErrorEvent: sdk.remotepay.CloverDeviceErrorEvent = new sdk.remotepay.CloverDeviceErrorEvent();
        deviceErrorEvent.setType(errorType);
        deviceErrorEvent.setCode(errorCode);
        deviceErrorEvent.setCause(cause);
        deviceErrorEvent.setMessage(message);
        this.broadcaster.notifyOnDeviceError(deviceErrorEvent);
    }

    public acceptSignature(request: sdk.remotepay.VerifySignatureRequest): void {
        let logLocation: string = "In acceptSignature";
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected(logLocation);
        } else if (request == null) {
            this.notifyInvalidData(logLocation + ": VerifySignatureRequest cannot be null.");
        } else if (request.getPayment() == null || request.getPayment().getId() == null) {
            this.notifyInvalidData(logLocation + ": VerifySignatureRequest. Payment must have an ID.");
        } else {
            this.device.doSignatureVerified(request.getPayment(), true);
        }
    }

    public rejectSignature(request: sdk.remotepay.VerifySignatureRequest): void {
        let logLocation: string = "In rejectSignature";
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected(logLocation);
        } else if (request == null) {
            this.notifyInvalidData(logLocation + ": VerifySignatureRequest cannot be null.");
        } else if (request.getPayment() == null || request.getPayment().getId() == null) {
            this.notifyInvalidData(logLocation + ": VerifySignatureRequest. Payment must have an ID.");
        } else {
            this.device.doSignatureVerified(request.getPayment(), false);
        }
    }

    public acceptPayment(payment: sdk.payments.Payment): void {
        let logLocation: string = "In acceptPayment";
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected(logLocation);
        } else if (payment == null) {
            this.notifyInvalidData(logLocation + ": Payment cannot be null.");
        } else if (payment.getId() == null) {
            this.notifyInvalidData(logLocation + ": Payment must have an ID.");
        } else {
            this.device.doAcceptPayment(payment);
        }
    }

    public rejectPayment(payment: sdk.payments.Payment, challenge: sdk.base.Challenge): void {
        let logLocation: string = "In rejectPayment";
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected(logLocation);
        } else if (payment == null) {
            this.notifyInvalidData(logLocation + ": Payment cannot be null.");
        } else if (payment.getId() == null) {
            this.notifyInvalidData(logLocation + ": Payment must have an ID.");
        } else if (challenge == null) {
            this.notifyInvalidData(logLocation + ": Challenge cannot be null.");
        } else {
            this.device.doRejectPayment(payment, challenge);
        }
    }

    public auth(request: sdk.remotepay.AuthRequest): void {
        if (!this.device || !this.isReady) {
            this.deviceObserver.onFinishCancelAuth(sdk.remotepay.ResponseCode.ERROR,"Device connection Error", "In auth: Auth Request - The Clover device is not connected.");
        } else if (!this.merchantInfo.getSupportsAuths()) {
            this.deviceObserver.onFinishCancelAuth(sdk.remotepay.ResponseCode.UNSUPPORTED,"Merchant Configuration Validation Error", `In auth: AuthRequest - Auths are not enabled for the payment gateway. Original Request = ${request}`);
        } else if (request.getVaultedCard() && !this.merchantInfo.getSupportsVaultCards()) {
            this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.UNSUPPORTED,"Merchant Configuration Validation Error", `In auth: AuthRequest - Vault Card support is not enabled for the payment gateway. Original Request = ${request}`, CloverConnector.TxTypeRequestInfo.AUTH_REQUEST);
        } else {
            try {
                this.setupAuthRequest(request);
            } catch (e) {
                this.logger.debug("Error in auth", e);
                this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.ERROR, e, null, CloverConnector.TxTypeRequestInfo.AUTH_REQUEST);
            }
        }
    }

    public preAuth(request: sdk.remotepay.PreAuthRequest): void {
        if (!this.device || !this.isReady) {
            this.deviceObserver.onFinishCancelPreAuth(sdk.remotepay.ResponseCode.ERROR,
                "Device connection Error", "In preAuth: PreAuthRequest - The Clover device is not connected.");
        } else if (!this.merchantInfo.getSupportsPreAuths()) {
            this.deviceObserver.onFinishCancelPreAuth(sdk.remotepay.ResponseCode.UNSUPPORTED,
                "Merchant Configuration Validation Error", "In preAuth: PreAuthRequest - " +
                "PreAuths are not enabled for the payment gateway. Original Request = " + request);
        } else if (request.getVaultedCard() && !this.merchantInfo.getSupportsVaultCards()) {
            this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.UNSUPPORTED,
                "Merchant Configuration Validation Error", "In preAuth: PreAuthRequest - " +
                "Vault Card support is not enabled for the payment gateway. Original Request = " + request, CloverConnector.TxTypeRequestInfo.PREAUTH_REQUEST);
        } else {
            try {
                this.setupPreauthRequest(request);
            } catch (e) {
                this.logger.debug("Error in preAuth", e);
                this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.ERROR, e, null, CloverConnector.TxTypeRequestInfo.PREAUTH_REQUEST);
            }
        }
    }

    public capturePreAuth(request: sdk.remotepay.CapturePreAuthRequest): void {
        if (!this.device || !this.isReady) {
            this.deviceObserver.onCapturePreAuthError(sdk.remotepay.ResponseCode.ERROR, "Device connection Error", "In capturePreAuth: CapturePreAuth - The Clover device is not connected.", request.getPaymentId());
        } else if (!this.merchantInfo.getSupportsPreAuths()) {
            this.deviceObserver.onCapturePreAuthError(sdk.remotepay.ResponseCode.UNSUPPORTED,"Merchant Configuration Validation Error", `In capturePreAuth: PreAuth Captures are not enabled for the payment gateway. Original Request = ${request}`, request.getPaymentId());
        } else {
            try {
                this.device.doCaptureAuth(request.getPaymentId(), request.getAmount(), request.getTipAmount());
            } catch (e) {
                let response: sdk.remotepay.CapturePreAuthResponse =  new sdk.remotepay.CapturePreAuthResponse();
                CloverConnector.populateBaseResponse(response, false, sdk.remotepay.ResponseCode.UNSUPPORTED,"Pre Auths unsupported","The currently configured merchant gateway does not support Capture Auth requests.");
                this.broadcaster.notifyOnCapturePreAuth(response);
            }
        }
    }

    public incrementPreAuth(request: sdk.remotepay.IncrementPreAuthRequest): void {
        if (!this.device || !this.isReady) {
            this.deviceObserver.onIncrementPreAuthError(sdk.remotepay.ResponseCode.ERROR, "Device connection Error", "In incrementPreAuth: IncrementPreAuth - The Clover device is not connected.");
        } else if (!this.merchantInfo.getSupportsPreAuths()) {
            this.deviceObserver.onIncrementPreAuthError(sdk.remotepay.ResponseCode.UNSUPPORTED,"Merchant Configuration Validation Error", `In incrementPreAuth: Pre Auths are not enabled for the payment gateway. Original Request = ${request}`);
        } else {
            try {
                this.device.doIncrementPreAuth(request.getPaymentId(), request.getAmount());
            } catch (e) {
                let response: sdk.remotepay.IncrementPreAuthResponse =  new sdk.remotepay.IncrementPreAuthResponse();
                CloverConnector.populateBaseResponse(response, false, sdk.remotepay.ResponseCode.UNSUPPORTED,"Pre Auths unsupported","The currently configured merchant gateway does not support Incremental Pre Auth requests.");
                this.broadcaster.notifyOnIncrementPreAuthResponse(response);
            }
        }
    }

    public tipAdjustAuth(request: sdk.remotepay.TipAdjustAuthRequest): void {
        const tarm: sdk.remotemessage.TipAdjustResponseMessage = new sdk.remotemessage.TipAdjustResponseMessage();
        if (!this.device || !this.isReady) {
            tarm.setReason("Device connection Error");
            tarm.setMessage("In tipAdjustAuth: TipAdjustAuthRequest - The Clover device is not connected.");
            this.deviceObserver.onAuthTipAdjusted(tarm, sdk.remotepay.ResponseCode.ERROR);
        } else if (!this.merchantInfo.getSupportsTipAdjust()) {
            tarm.setReason("Merchant Configuration Validation Error");
            tarm.setMessage(`In tipAdjustAuth: TipAdjustAuthRequest - Tip Adjustments are not enabled for the payment gateway. Original Request = ${request}`);
            this.deviceObserver.onAuthTipAdjusted(tarm, sdk.remotepay.ResponseCode.UNSUPPORTED);
        } else {
            this.device.doTipAdjustAuth(request.getOrderId(), request.getPaymentId(), request.getTipAmount());
        }
    }

    public vaultCard(cardEntryMethods: number): void {
        const shortCircuitVaultCardResponseMessage: sdk.remotemessage.VaultCardResponseMessage = new sdk.remotemessage.VaultCardResponseMessage();
        shortCircuitVaultCardResponseMessage.setCard(null);
        if (!this.device || !this.isReady) {
            shortCircuitVaultCardResponseMessage.setReason("Device connection Error");
            this.deviceObserver.onVaultCardResponse(shortCircuitVaultCardResponseMessage, sdk.remotepay.ResponseCode.ERROR, "In vaultCard: The Clover device is not connected.");
        } else if (!this.merchantInfo.getSupportsVaultCards()) {
            shortCircuitVaultCardResponseMessage.setReason("Merchant Configuration Validation Error");
            this.deviceObserver.onVaultCardResponse(shortCircuitVaultCardResponseMessage, sdk.remotepay.ResponseCode.UNSUPPORTED, "In vaultCard: VaultCard/Payment Tokens are not enabled for the payment gateway.");
        } else {
            this.device.doVaultCard(cardEntryMethods ? cardEntryMethods : this.getCardEntryMethods());
        }
    }

    public voidPayment(request: sdk.remotepay.VoidPaymentRequest): void {
        if (!this.device || !this.isReady) {
            this.deviceObserver.onPaymentVoided_responseCode(sdk.remotepay.ResponseCode.ERROR, "Device connection Error", "In voidPayment: VoidPaymentRequest - The Clover device is not connected.");
        } else {
            let payment: sdk.payments.Payment = new sdk.payments.Payment();
            payment.setId(request.getPaymentId());
            payment.setOrder(new sdk.base.Reference());
            payment.getOrder().setId(request.getOrderId());
            payment.setEmployee(new sdk.base.Reference());
            payment.getEmployee().setId(request.getEmployeeId());
            let reason: sdk.order.VoidReason = sdk.order.VoidReason[request.getVoidReason()];
            this.device.doVoidPayment(payment, reason, request.getDisablePrinting(), request.getDisableReceiptSelection(), request.getExtras());
        }
    }

    public refundPayment(request: sdk.remotepay.RefundPaymentRequest): void {
        if (!this.device || !this.isReady) {
            this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.CANCEL,"Device Connection Error","In refundPayment: RefundPaymentRequest - The Clover device is not connected.", CloverConnector.TxTypeRequestInfo.REFUND_REQUEST);
        } else {
            this.device.doPaymentRefundByRequest(request);
        }
    }

    public voidPaymentRefund(request: sdk.remotepay.VoidPaymentRefundRequest): void {
        this.deviceObserver.onPaymentRefundVoided(null, sdk.remotepay.ResponseCode.ERROR, "Cannot do Void Payment Refund", "This version of the SDK does not support voidPaymentRefunds");
    }

    public manualRefund(request: sdk.remotepay.ManualRefundRequest): void { // NakedRefund is a Transaction, with just negative amount
        let transactionSettings: sdk.payments.TransactionSettings = new sdk.payments.TransactionSettings();
        if (!this.device || !this.isReady) {
            this.deviceObserver.onFinishCancelManualRefund(sdk.remotepay.ResponseCode.ERROR, "Device connection Error", "In manualRefund: ManualRefundRequest - The Clover device is not connected.");
        } else if (!this.merchantInfo.getSupportsManualRefunds()) {
            this.deviceObserver.onFinishCancelManualRefund(sdk.remotepay.ResponseCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In manualRefund: ManualRefundRequest - Manual Refunds are not enabled for the payment gateway. Original Request = " + request);
        } else if (request.getVaultedCard() && !this.merchantInfo.getSupportsVaultCards()) {
            this.deviceObserver.onFinishCancel_rmm(sdk.remotepay.ResponseCode.UNSUPPORTED, "Merchant Configuration Validation Error", "In manualRefund: ManualRefundRequest - Vault Card support is not enabled for the payment gateway. Original Request = " + request, CloverConnector.TxTypeRequestInfo.CREDIT_REQUEST);
        } else {
            let builder: PayIntent.Builder = new PayIntent.Builder();
            builder.setAmount(-Math.abs(request.getAmount()))
                .setTransactionType(sdk.remotepay.TransactionType.CREDIT)
                .setVaultedCard(request.getVaultedCard())
                .setExternalPaymentId(request.getExternalId());

            transactionSettings.setCardEntryMethods(request.getCardEntryMethods() ? request.getCardEntryMethods() : this.cardEntryMethods);
            if (request.getDisablePrinting()) {
                transactionSettings.setCloverShouldHandleReceipts(!request.getDisablePrinting());
            }
            if (request.getDisableRestartTransactionOnFail()) {
                transactionSettings.setDisableRestartTransactionOnFailure(request.getDisableRestartTransactionOnFail());
            }
            if (request.getDisableReceiptSelection()) {
                transactionSettings.setDisableReceiptSelection(request.getDisableReceiptSelection());
            }
            if(request.getExtras() != null) {
                builder.setPassThroughValues(request.getExtras());
            }
            builder.setTransactionSettings(transactionSettings);
            let payIntent: sdk.remotemessage.PayIntent = builder.build();
            this.device.doTxStart(payIntent, null, CloverConnector.TxTypeRequestInfo.CREDIT_REQUEST);
        }
    }

    public retrievePendingPayments(): void {
        if (!this.device || !this.isReady) {
            this.deviceObserver.onPendingPaymentsResponse(false, null, "Device connection Error", "In retrievePendingPayments: The Clover device is not connected.");
        } else {
            this.device.doRetrievePendingPayments();
        }
    }

    public readCardData(request: sdk.remotepay.ReadCardDataRequest): void {
        if (!this.device || !this.isReady) {
            this.deviceObserver.onReadCardDataResponse(sdk.remotepay.ResponseCode.ERROR, "Device connection Error", "In readCardData: The Clover device is not connected.");
        } else if (request == null) {
            this.deviceObserver.onReadCardDataResponse(sdk.remotepay.ResponseCode.FAIL, "Invalid Argument.", "In readCardData: ReadCardDataRequest - The request that was passed in for processing is null.");
        } else {
            // create pay intent...
            let builder: PayIntent.Builder = new PayIntent.Builder();
            builder.setTransactionType(sdk.remotepay.TransactionType.DATA);
            builder.setCardEntryMethods(request.getCardEntryMethods() ? request.getCardEntryMethods() : this.cardEntryMethods);
            builder.setForceSwipePinEntry(request.getIsForceSwipePinEntry());
            let pi: sdk.remotemessage.PayIntent = builder.build();
            this.device.doReadCardData(pi);
        }
    }

    public sendMessageToActivity(request: sdk.remotepay.MessageToActivity): void {
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In sendMessageToActivity");
        } else if (request == null) {
            this.notifyInvalidData("In sendMessageToActivity: Invalid argument. Null is not allowed.");
        } else {
            this.device.doSendMessageToActivity(request.getAction(), request.getPayload());
        }
    }

    public retrievePayment(request: sdk.remotepay.RetrievePaymentRequest): void {
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In retrievePayment");
        } else {
            this.device.doRetrievePayment(request.getExternalPaymentId());
        }
    }

    public registerForCustomerProvidedData(request: sdk.remotepay.RegisterForCustomerProvidedDataRequest){
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In registerForCustomerProvidedData");
        } else{
            let dataProviderConfigs: Array<sdk.remotepay.DataProviderConfig> = request.getConfigurations();
            let configurations: Array<sdk.loyalty.LoyaltyDataConfig> = this.convertConfigurations(dataProviderConfigs);
            console.log(configurations);
            this.device.doRegisterForCustomerProvidedData(configurations);
        }
    }

    private convertConfigurations(dataProviderConfigs: Array<sdk.remotepay.DataProviderConfig>) : Array<sdk.loyalty.LoyaltyDataConfig> {
        // this is here so we have a buffer between the public api and the private one.
        let configs: Array<sdk.loyalty.LoyaltyDataConfig> = new Array<sdk.loyalty.LoyaltyDataConfig>();
        if (dataProviderConfigs!= null) {
            dataProviderConfigs.forEach((dataProviderConfig) => configs.push(this.convertConfiguration(dataProviderConfig)));
        }
        return configs;
    }

    private convertConfiguration(dataProviderConfig: sdk.remotepay.DataProviderConfig ): sdk.loyalty.LoyaltyDataConfig {
        let loyaltyDataConfig: sdk.loyalty.LoyaltyDataConfig = new sdk.loyalty.LoyaltyDataConfig();
        loyaltyDataConfig.setType(dataProviderConfig.getType());
        loyaltyDataConfig.setConfiguration(dataProviderConfig.getConfiguration());
        return loyaltyDataConfig;
    }

    public setCustomerInfo(request: sdk.remotepay.SetCustomerInfoRequest) {
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In setCustomerInfo: The Clover device is not connected.");
        } else {
            this.device.doSetCustomerInfo(request.getCustomerInfo());
        }
    }

    public retrievePrinters(request: sdk.remotepay.RetrievePrintersRequest): void {
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In retrievePrinters");
        } else if (!request) {
            this.notifyInvalidData("In retrievePrinters: Invalid argument. Null is not allowed.");
        } else {
            this.device.doRetrievePrinters(request.getCategory());
        }
    }

    public retrievePrintJobStatus(request: sdk.remotepay.PrintJobStatusRequest): void {
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In retrievePrintJobStatus");
        } else if (!request || !request.getPrintRequestId()) {
            this.notifyInvalidData("In retrievePrintJobStatus: Invalid argument. Null is not allowed.");
        } else {
            this.device.doRetrievePrintJobStatus(request.getPrintRequestId());
        }
    }

    public closeout(request: sdk.remotepay.CloseoutRequest): void {
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In closeout");
        } else {
            this.device.doCloseout(request.getAllowOpenTabs(), request.getBatchId());
        }
    }

    public print(request: sdk.remotepay.PrintRequest): void {
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In print");
        } else if (!request) {
            this.notifyInvalidData("In print: Invalid argument. Null is not allowed.");
        } else if (!this.validatePrintRequest(request)) {
            return;
        } else {
            const images = request.getImages();
            const urls = request.getImageUrls();
            if (images) {
                if (Array.isArray(images) && images.length > 1) {
                    this.notifyInvalidData("In print: Invalid argument. Only one image can be printed at a time in the current API.");
                }
                let singleOrArr: any = (Array.isArray(images) ? images[0] : images);
                this.device.doPrintImageObject(singleOrArr, request.getPrintRequestId(), request.getPrintDeviceId());
            } else if (request.getText()) {
                this.device.doPrintText(request.getText(), request.getPrintRequestId(), request.getPrintDeviceId());
            } else if (urls) {
                if (Array.isArray(urls) && urls.length > 1) {
                    this.notifyInvalidData("In print: Invalid argument. Only one imageUrl can be printed at a time in the current API.");
                }
                let singleOrArr: any = (Array.isArray(urls) ? urls[0] : urls);
                this.device.doPrintImageUrl(singleOrArr, request.getPrintRequestId(), request.getPrintDeviceId());
            } else {
                this.notifyInvalidData("In print: Invalid argument. PrintRequest element was not formatted correctly.");
            }
        }
    }

    public validatePrintRequest(request: sdk.remotepay.PrintRequest): boolean {
        if (!request.getImages() && !request.getText() && !request.getImageUrls()) {
            this.notifyInvalidData("In validatePrintRequest: There are no items to print.");
            return false;
        } else if ((request.getImages() && request.getText()) ||
            (request.getImages() && request.getImageUrls()) ||
            (request.getText() && request.getImageUrls())) {
            this.notifyInvalidData("In validatePrintRequest: There are too may different kinds of items to print.  Can only have one.");
            return false;
        } else {
            return true;
        }
    }

    public showMessage(message: string): void {
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In showMessage");
        } else if (message == null) {
            this.notifyInvalidData("In showMessage: Invalid argument.  Null is not allowed.");
        } else {
            this.device.doTerminalMessage(message);
        }
    }

    public sendDebugLog(message: string): void {
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In sendDebugLog");
        } else if (message == null) {
            this.notifyInvalidData("In showMessage: Invalid argument.  Null is not allowed.");
        } else {
            this.device.doSendDebugLog(message);
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

    public displayReceiptOptions(displayReceiptOptionsRequest: sdk.remotepay.DisplayReceiptOptionsRequest): void {
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In displayReceiptOptions");
        } else {
            this.device.doShowReceiptScreen(displayReceiptOptionsRequest.getOrderId(), displayReceiptOptionsRequest.getPaymentId(), displayReceiptOptionsRequest.getRefundId(), displayReceiptOptionsRequest.getCreditId(), displayReceiptOptionsRequest.getDisablePrinting());
        }
    }

    public openCashDrawer(request: sdk.remotepay.OpenCashDrawerRequest | string): void {
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In openCashDrawer");
        } else if (!request) {
            this.notifyInvalidData("In openCashDrawer: Invalid argument. The request cannot be null.");
        } else if (typeof request === "string") {
            this.device.doOpenCashDrawer(<string>request);
        } else {
            this.device.doOpenCashDrawer(request.getReason(), request.getDeviceId());
        }
    }

    public showDisplayOrder(order: sdk.order.DisplayOrder): void {
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In showDisplayOrder");
        } else if (order == null) {
            this.notifyInvalidData("In showDisplayOrder: Invalid argument.  The order cannot be null.");
        } else {
            this.device.doOrderUpdate(order, null);
        }
    }

    public removeDisplayOrder(order: sdk.order.DisplayOrder): void {
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In removeDisplayOrder");
        } else if (order == null) {
            this.notifyInvalidData("In removeDisplayOrder: Invalid argument.  The order cannot be null.");
        } else {
            let dao: sdk.order.operation.OrderDeletedOperation = new sdk.order.operation.OrderDeletedOperation();
            dao.setId(order.getId());
            this.device.doOrderUpdate(order, dao);
        }
    }

    // I spoke to Hammer about this, there are no plans to implement it.
    public discountAddedToDisplayOrder(discount: sdk.order.DisplayDiscount, order: sdk.order.DisplayOrder): void {
        this.notifyDeviceError(sdk.remotepay.ErrorType.EXCEPTION,
            sdk.remotepay.DeviceErrorEventCode.NotSupported,
            null,
            "discountAddedToDisplayOrder has not been implemented.");
    }

    // I spoke to Hammer about this, there are no plans to implement it.
    public discountRemovedFromDisplayOrder(discount: sdk.order.DisplayDiscount, order: sdk.order.DisplayOrder): void {
        this.notifyDeviceError(sdk.remotepay.ErrorType.EXCEPTION,
            sdk.remotepay.DeviceErrorEventCode.NotSupported,
            null,
            "discountRemovedFromDisplayOrder has not been implemented.");
    }

    // I spoke to Hammer about this, there are no plans to implement it.
    public lineItemAddedToDisplayOrder(lineItem: sdk.order.DisplayLineItem, order: sdk.order.DisplayOrder): void {
        this.notifyDeviceError(sdk.remotepay.ErrorType.EXCEPTION,
            sdk.remotepay.DeviceErrorEventCode.NotSupported,
            null,
            "lineItemAddedToDisplayOrder has not been implemented.");
    }

    // I spoke to Hammer about this, there are no plans to implement it.
    public lineItemRemovedFromDisplayOrder(lineItem: sdk.order.DisplayLineItem, order: sdk.order.DisplayOrder): void {
        this.notifyDeviceError(sdk.remotepay.ErrorType.EXCEPTION,
            sdk.remotepay.DeviceErrorEventCode.NotSupported,
            null,
            "lineItemRemovedFromDisplayOrder has not been implemented.");
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
        } else {
            this.device.doKeyPress(io.getKeyPress());
        }
    }

    public resetDevice(): void {
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In resetDevice");
        } else {
            this.device.doResetDevice();
        }
    }

    public retrieveDeviceStatus(request: sdk.remotepay.RetrieveDeviceStatusRequest): void {
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In retrieveDeviceStatus");
        } else {
            this.device.doRetrieveDeviceStatus(request);
        }
    }

    private getCardEntryMethods(): number {
        return this.cardEntryMethods;
    }

    public startCustomActivity(request: sdk.remotepay.CustomActivityRequest): void {
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In startCustomActivity");
        } else {
            this.device.doStartActivity(request.getAction(), request.getPayload(), request.getNonBlocking());
        }
    }

    public checkBalance(request: sdk.remotepay.CheckBalanceRequest): void {
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In checkBalance");
        } else {
            this.device.doCheckBalance(request.getCardEntryMethods());
        }
    }

    public requestSignature(request: sdk.remotepay.SignatureRequest): void {
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In requestSignature");
        } else {
            this.device.doCollectSignature(request.getAcknowledgementMessage());
        }
    }

    public requestTip(request: sdk.remotepay.TipRequest): void {
        if (!this.device || !this.isReady) {
            this.notifyDeviceNotConnected("In requestTip");
        } else {
            this.device.doRequestTip(request.getTippableAmount(), request.getTipSuggestions());
        }
    }

    static populateBaseResponse(response: sdk.remotepay.BaseResponse,
                                success: boolean,
                                responseCode: sdk.remotepay.ResponseCode,
                                reason?: string,
                                message?: string): void {
        response.setSuccess(success);
        response.setResult(responseCode);
        response.setReason(reason ? reason : responseCode ? responseCode.toString() : "No extended information provided.");
        response.setMessage(message ? message : "No extended information provided.");
        // See SSDK-549.  The setting of the response flags (isSale, etc.) is handled in each SDK.
        // The problem is that non-traditional payment responses (finishOk not called) may contain payment information.
        // To avoid the SDK of having to be aware of this we are inspecting the response and setting the flags if they
        // exist on the response and if a payment exists on the response.
        if (response["getPayment"]) {
            const payment: sdk.payments.Payment = response["getPayment"]();
            if (payment) {
                this.setResponseFlags(response, payment);
            }
        }
    }

    static populatePaymentResponse(response: sdk.remotepay.PaymentResponse,
                                   success: boolean,
                                   responseCode: sdk.remotepay.ResponseCode,
                                   payment: sdk.payments.Payment,
                                   signature?: sdk.base.Signature,
                                   reason?: string,
                                   message?: string): void {
        CloverConnector.populateBaseResponse(response, success, responseCode, reason, message);
        response.setPayment(payment);
        response.setSignature(signature);
        this.setResponseFlags(response, payment);
    }

    static setResponseFlags(response: any,  payment: sdk.payments.Payment) {
        if (response && payment) {
            const cardTransaction = payment.getCardTransaction();
            if (cardTransaction) {
                const transactionType: sdk.payments.CardTransactionType = cardTransaction.getType();
                if (response.setIsSale) {
                    response.setIsSale(
                        sdk.payments.CardTransactionType.AUTH == transactionType &&
                        sdk.payments.Result.SUCCESS == payment.getResult());
                }
                if (response.setIsAuth) {
                    response.setIsAuth(
                        sdk.payments.CardTransactionType.PREAUTH == transactionType &&
                        sdk.payments.Result.SUCCESS == payment.getResult());
                }
                if (response.setIsPreAuth) {
                    response.setIsPreAuth(
                        sdk.payments.CardTransactionType.PREAUTH == transactionType &&
                        sdk.payments.Result.AUTH == payment.getResult());
                }
            }
        }
    }

}

export namespace CloverConnector {
    export class TxTypeRequestInfo {
        public static SALE_REQUEST: string = "SALE";
        public static AUTH_REQUEST: string = "AUTH";
        public static PREAUTH_REQUEST: string = "PREAUTH";
        public static CREDIT_REQUEST: string = "CREDIT";
        public static REFUND_REQUEST: string = "REFUND";
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

        private resultSuccessToResponseCode(success: boolean) {
            return this.resultStatusToResponseCode(success ? sdk.remotemessage.ResultStatus.SUCCESS : sdk.remotemessage.ResultStatus.FAIL);
        }

        private resultStatusToResponseCode(resultStatus: sdk.remotemessage.ResultStatus) {
            return resultStatus == sdk.remotemessage.ResultStatus.SUCCESS ? sdk.remotepay.ResponseCode.SUCCESS : (resultStatus == sdk.remotemessage.ResultStatus.CANCEL ? sdk.remotepay.ResponseCode.CANCEL : sdk.remotepay.ResponseCode.FAIL);
        }

        public onTxStartResponse(txStartResponseMessage: sdk.remotemessage.TxStartResponseMessage): void {
            let reason = txStartResponseMessage.getReason();
            let result = txStartResponseMessage.getResult();
            if (result == sdk.remotemessage.TxStartResponseResult.SUCCESS) return;

            const duplicate: boolean = (result == sdk.remotemessage.TxStartResponseResult.DUPLICATE);
            const code: sdk.remotepay.ResponseCode = duplicate ? sdk.remotepay.ResponseCode.CANCEL : sdk.remotepay.ResponseCode.FAIL;
            const duplicateMessage: string = duplicate ? "The provided transaction id of " + txStartResponseMessage.getExternalPaymentId() + " has already been processed and cannot be resubmitted." : null;
            let messageToUse = duplicate ? duplicateMessage : txStartResponseMessage.getMessage();

            // Use the requestInfo if it exists, to determine the request type
            let requestInfo = txStartResponseMessage.getRequestInfo();
            if (requestInfo == TxTypeRequestInfo.PREAUTH_REQUEST) {
                const response: sdk.remotepay.PreAuthResponse = new sdk.remotepay.PreAuthResponse();
                CloverConnector.populateBaseResponse(response, false, code, reason, messageToUse);
                this.cloverConnector.broadcaster.notifyOnPreAuthResponse(response);
            } else if (requestInfo == TxTypeRequestInfo.AUTH_REQUEST) {
                const response: sdk.remotepay.AuthResponse = new sdk.remotepay.AuthResponse();
                CloverConnector.populateBaseResponse(response, false, code, reason, messageToUse);
                this.cloverConnector.broadcaster.notifyOnAuthResponse(response);
            } else if (requestInfo == TxTypeRequestInfo.SALE_REQUEST) {
                const response: sdk.remotepay.SaleResponse = new sdk.remotepay.SaleResponse();
                CloverConnector.populateBaseResponse(response, false, code, reason, messageToUse);
                this.cloverConnector.broadcaster.notifyOnSaleResponse(response);
            } else if (requestInfo == TxTypeRequestInfo.CREDIT_REQUEST) {
                const response: sdk.remotepay.ManualRefundResponse = new sdk.remotepay.ManualRefundResponse();
                CloverConnector.populateBaseResponse(response, false, code, reason, messageToUse);
                this.cloverConnector.broadcaster.notifyOnManualRefundResponse(response);
            } else {
                this.logger.error("Could not determine request type. requestInfo = " + requestInfo);
            }
        }

        public onUiState(uiState: sdk.remotemessage.UiState, uiText: string, uiDirection: sdk.remotemessage.UiDirection, inputOptions: Array<sdk.remotemessage.InputOption>): void {
            let deviceEvent: sdk.remotepay.CloverDeviceEvent = new sdk.remotepay.CloverDeviceEvent();
            deviceEvent.setInputOptions(inputOptions);
            deviceEvent.setEventState(sdk.remotepay.DeviceEventState[uiState.toString()]);
            deviceEvent.setMessage(uiText);
            if (uiDirection == sdk.remotemessage.UiDirection.ENTER) {
                this.cloverConnector.broadcaster.notifyOnDeviceActivityStart(deviceEvent);
            } else if (uiDirection == sdk.remotemessage.UiDirection.EXIT) {
                this.cloverConnector.broadcaster.notifyOnDeviceActivityEnd(deviceEvent);
                if (uiState.toString() == sdk.remotepay.DeviceEventState.RECEIPT_OPTIONS.toString()) {
                    this.cloverConnector.device.doShowWelcomeScreen();
                }
            }
        }

        public onTipAdded(tip: number): void {
            this.cloverConnector.broadcaster.notifyOnTipAdded(tip);
        }

        public onAuthTipAdjusted(tarm: sdk.remotemessage.TipAdjustResponseMessage, responseCode?: sdk.remotepay.ResponseCode): void {
            const response: sdk.remotepay.TipAdjustAuthResponse = new sdk.remotepay.TipAdjustAuthResponse();
            const success = tarm.getSuccess();
            if (!responseCode) {
                responseCode = this.resultSuccessToResponseCode(success);
            }
            CloverConnector.populateBaseResponse(response, success, responseCode, tarm.getReason(), tarm.getMessage());
            response.setPaymentId(tarm.getPaymentId());
            response.setTipAmount(tarm.getAmount());
            this.cloverConnector.broadcaster.notifyOnTipAdjustAuthResponse(response);
        }

        public onCashbackSelected(cashbackAmount: number): void {
            //TODO: For future use
        }

        public onPartialAuth(partialAmount: number): void {
            //TODO: For future use
        }

        public onFinishOkPayment(payment: sdk.payments.Payment, signature: sdk.base.Signature, requestInfo: string): void {
            try {
                this.cloverConnector.device.doShowThankYouScreen(); //need to do this first, so Listener implementation can replace the screen as desired

                if (requestInfo == TxTypeRequestInfo.PREAUTH_REQUEST) {
                    let response: sdk.remotepay.PreAuthResponse = new sdk.remotepay.PreAuthResponse();
                    CloverConnector.populatePaymentResponse(response, true, sdk.remotepay.ResponseCode.SUCCESS, payment, signature);
                    this.cloverConnector.broadcaster.notifyOnPreAuthResponse(response);
                } else if (requestInfo == TxTypeRequestInfo.AUTH_REQUEST) {
                    let response: sdk.remotepay.AuthResponse = new sdk.remotepay.AuthResponse();
                    CloverConnector.populatePaymentResponse(response, true, sdk.remotepay.ResponseCode.SUCCESS, payment, signature);
                    this.cloverConnector.broadcaster.notifyOnAuthResponse(response);
                } else if (requestInfo == TxTypeRequestInfo.SALE_REQUEST) {
                    let response: sdk.remotepay.SaleResponse = new sdk.remotepay.SaleResponse();
                    CloverConnector.populatePaymentResponse(response, true, sdk.remotepay.ResponseCode.SUCCESS, payment, signature);
                    this.cloverConnector.broadcaster.notifyOnSaleResponse(response);
                } else {
                    this.logger.error("Failed to pair this response: " + payment);
                }
            } finally {
                // do nothing for now...
            }
        }

        public onFinishOkCredit(credit: sdk.payments.Credit): void {
            this.cloverConnector.device.doShowWelcomeScreen();
            let response: sdk.remotepay.ManualRefundResponse = new sdk.remotepay.ManualRefundResponse();
            CloverConnector.populateBaseResponse(response, true, sdk.remotepay.ResponseCode.SUCCESS);
            response.setCredit(credit);
            this.cloverConnector.broadcaster.notifyOnManualRefundResponse(response);
        }

        public onFinishOkRefund(refund: sdk.payments.Refund): void {
            this.cloverConnector.device.doShowWelcomeScreen();
            // NOTE: these two lines can eventually be removed (once refunds have the orderRef populated correctly):
            let lastRefundResponse: sdk.remotepay.RefundPaymentResponse = this.lastPRR; //only needed for the order ID
            this.lastPRR = null;
            if (refund.getOrderRef() != null) {
                let success: boolean = true;
                let response: sdk.remotepay.RefundPaymentResponse = new sdk.remotepay.RefundPaymentResponse();
                CloverConnector.populateBaseResponse(response, success, this.resultSuccessToResponseCode(success));
                response.setOrderId(refund.getOrderRef().getId());
                if (refund.getPayment()) {
                    response.setPaymentId(refund.getPayment().getId());
                }
                response.setRefund(refund);
                this.cloverConnector.broadcaster.notifyOnRefundPaymentResponse(response);
            } else {
                if (lastRefundResponse && lastRefundResponse.getRefund().getId() == refund.getId()) { //need to make sure it's the same refund before sending
                    this.cloverConnector.broadcaster.notifyOnRefundPaymentResponse(lastRefundResponse);
                } else {
                    let success: boolean = true;
                    let response: sdk.remotepay.RefundPaymentResponse = new sdk.remotepay.RefundPaymentResponse();
                    CloverConnector.populateBaseResponse(response, success, this.resultSuccessToResponseCode(success));
                    if (refund.getPayment()) {
                        response.setPaymentId(refund.getPayment().getId());
                    }
                    response.setRefund(refund);
                    this.cloverConnector.broadcaster.notifyOnRefundPaymentResponse(response);
                }
            }
        }

        public onFinishOk(payment: sdk.payments.Payment, signature: sdk.base.Signature, requestInfo: string): void;
        public onFinishOk(credit: sdk.payments.Credit): void;
        public onFinishOk(refund: sdk.payments.Refund): void;
        // Weird mechanism to overload via TypeScript - https://blog.mariusschulz.com/2016/08/18/function-overloads-in-typescript
        public onFinishOk(paymentCreditOrRefund: any, signature?: sdk.base.Signature, requestInfo?: string): void {
            if (paymentCreditOrRefund instanceof sdk.payments.Payment) {
                this.onFinishOkPayment(paymentCreditOrRefund, signature, requestInfo);
            } else if (paymentCreditOrRefund instanceof sdk.payments.Credit) {
                this.onFinishOkCredit(paymentCreditOrRefund);
            } else {
                this.onFinishOkRefund(paymentCreditOrRefund);
            }
        }

        public onFinishCancel_rmm(result: sdk.remotepay.ResponseCode, reason: string, message: string, requestInfo: string) {
            try {
                if (this.cloverConnector.device) {
                    this.cloverConnector.device.doShowWelcomeScreen();
                }

                if (requestInfo == TxTypeRequestInfo.PREAUTH_REQUEST) {
                    this.onFinishCancelPreAuth(result, reason, message);
                } else if (requestInfo == TxTypeRequestInfo.SALE_REQUEST) {
                    this.onFinishCancelSale(result, reason, message);
                } else if (requestInfo == TxTypeRequestInfo.AUTH_REQUEST) {
                    this.onFinishCancelAuth(result, reason, message);
                } else if (requestInfo == TxTypeRequestInfo.CREDIT_REQUEST) {
                    this.onFinishCancelManualRefund(result, reason, message);
                } else if (requestInfo == TxTypeRequestInfo.REFUND_REQUEST) {
                    if (this.lastPRR) {
                        this.cloverConnector.broadcaster.notifyOnRefundPaymentResponse(this.lastPRR);
                    } else {
                        this.onFinishCancelRefund(result, reason, message);
                    }
                } else {
                    // Complete any un-resolved payment refund requests.
                    if (this.lastPRR) {
                        this.cloverConnector.broadcaster.notifyOnRefundPaymentResponse(this.lastPRR);
                        this.lastPRR = null;
                    } else {
                        if (!requestInfo) {
                            this.logger.error('onFinishCancel called, requestInfo was null, and ' +
                                'could not determine the type of the message from the last request',
                                arguments);
                        } else {
                            this.logger.error('onFinishCancel called, but could not determine how to respond!', arguments);
                        }
                    }
                }
            } finally {
                // do nothing
            }
        }

        public onFinishCancel(requestInfo: string): void {
            this.onFinishCancel_rmm(sdk.remotepay.ResponseCode.CANCEL, null, null, requestInfo);
        }

        public onFinishCancelPreAuth(result: sdk.remotepay.ResponseCode, reason?: string, message?: string): void {
            let response: sdk.remotepay.PreAuthResponse = new sdk.remotepay.PreAuthResponse();
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

        public onVerifySignature(payment: sdk.payments.Payment, signature: sdk.base.Signature): void {
            let request: sdk.remotepay.VerifySignatureRequest = new sdk.remotepay.VerifySignatureRequest();
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

        public onPaymentVoided(voidPaymentResponseMessage: sdk.remotemessage.VoidPaymentResponseMessage): void {
            this.cloverConnector.showWelcomeScreen();
            let success: boolean = voidPaymentResponseMessage.getStatus() == sdk.remotemessage.ResultStatus.SUCCESS;
            let result: sdk.remotepay.ResponseCode = this.resultStatusToResponseCode(voidPaymentResponseMessage.getStatus());
            let response: sdk.remotepay.VoidPaymentResponse = new sdk.remotepay.VoidPaymentResponse();
            const payment = voidPaymentResponseMessage.getPayment();
            response.setPayment(payment);
            response.setPaymentId(payment != null ? payment.getId() : null);
            CloverConnector.populateBaseResponse(response, success, result, voidPaymentResponseMessage.getReason(), voidPaymentResponseMessage.getMessage());
            this.cloverConnector.broadcaster.notifyOnVoidPaymentResponse(response);
        }

        public onPaymentVoided_responseCode(code: sdk.remotepay.ResponseCode, reason: string, message: string): void {
            let success: boolean = (code == sdk.remotepay.ResponseCode.SUCCESS);
            let response: sdk.remotepay.VoidPaymentResponse = new sdk.remotepay.VoidPaymentResponse();
            CloverConnector.populateBaseResponse(response, success, code, reason, message);
            this.cloverConnector.broadcaster.notifyOnVoidPaymentResponse(response);
        }

        public onPaymentRefundVoided(refund: sdk.payments.Refund, code: sdk.remotepay.ResponseCode, reason: string, message: string): void {
            const response:sdk.remotepay.VoidPaymentRefundResponse  = new sdk.remotepay.VoidPaymentRefundResponse();
            response.setSuccess(code == sdk.remotepay.ResponseCode.SUCCESS);
            response.setReason(reason != null ? reason : code.toString());
            response.setMessage(message != null ? message : "No extended information provided.");
            response.setRefund(refund);
            this.cloverConnector.broadcaster.notifyOnVoidPaymentRefundResponse(response);
        }

        public onKeyPressed(keyPress: sdk.remotemessage.KeyPress): void {
            //TODO: For future use
        }

        public onPaymentRefundResponse(refundResponseMessage: sdk.remotemessage.RefundResponseMessage): void {
            // hold the response for finishOk for the refund. See comments in onFinishOk(Refund)
            let success: boolean = refundResponseMessage.getCode() == sdk.remotemessage.TxState.SUCCESS;
            let response: sdk.remotepay.RefundPaymentResponse = new sdk.remotepay.RefundPaymentResponse();
            let reason: string = refundResponseMessage.getReason();
            CloverConnector.populateBaseResponse(response, success, this.resultSuccessToResponseCode(success), reason, refundResponseMessage.getMessage());
            response.setOrderId(refundResponseMessage.getOrderId());
            response.setPaymentId(refundResponseMessage.getPaymentId());
            response.setRefund(refundResponseMessage.getRefund());

            // NOTE: While this is currently needed, we are attempting to move away from this requirement
            this.lastPRR = response; // set this so we have the appropriate information for when onFinish(Refund) is called
        }

        public onPaymentRefundVoidResponse(voidPaymentRefundResponseMessage: sdk.remotemessage.VoidPaymentRefundResponseMessage): void {
            let success: boolean = (sdk.remotemessage.ResultStatus.SUCCESS == status);
            let response: sdk.remotepay.VoidPaymentRefundResponse = new sdk.remotepay.VoidPaymentRefundResponse();
            let reason = voidPaymentRefundResponseMessage.getReason();
            CloverConnector.populateBaseResponse(response, success, this.resultSuccessToResponseCode(success), reason, voidPaymentRefundResponseMessage.getMessage());
            response.setRefundId(voidPaymentRefundResponseMessage.getRefund() ? voidPaymentRefundResponseMessage.getRefund().getId() : null);
            response.setReason(voidPaymentRefundResponseMessage.getReason());

        }

        public onVaultCardResponse(vaultCardResponseMessage: sdk.remotemessage.VaultCardResponseMessage, code?: sdk.remotepay.ResponseCode, message?: string): void {
            let success: boolean = (sdk.remotemessage.ResultStatus.SUCCESS == vaultCardResponseMessage.getStatus());
            this.cloverConnector.device.doShowWelcomeScreen();
            let response: sdk.remotepay.VaultCardResponse = new sdk.remotepay.VaultCardResponse();
            response.setCard(vaultCardResponseMessage.getCard());
            CloverConnector.populateBaseResponse(response, success, code || this.resultSuccessToResponseCode(success), vaultCardResponseMessage.getReason(), message);
            this.cloverConnector.broadcaster.notifyOnVaultCardRespose(response);
        }

        public onCapturePreAuthError(result: sdk.remotepay.ResponseCode, reason: string, message: string, paymentId: string): void {
            const response: sdk.remotepay.CapturePreAuthResponse = new sdk.remotepay.CapturePreAuthResponse();
            CloverConnector.populateBaseResponse(response, false, result, reason, message);
            response.setPaymentId(paymentId);
            response.setTipAmount(0);
            this.cloverConnector.broadcaster.notifyOnTipAdjustAuthResponse(response);
        }

        public onCapturePreAuth(capturePreAuthResponseMessage: sdk.remotemessage.CapturePreAuthResponseMessage): void {
            let success: boolean = (sdk.remotemessage.ResultStatus.SUCCESS == capturePreAuthResponseMessage.getStatus());
            let response: sdk.remotepay.CapturePreAuthResponse = new sdk.remotepay.CapturePreAuthResponse();
            CloverConnector.populateBaseResponse(response, success, this.resultStatusToResponseCode(capturePreAuthResponseMessage.getStatus()), capturePreAuthResponseMessage.getReason(), capturePreAuthResponseMessage.getMessage());
            response.setPaymentId(capturePreAuthResponseMessage.getPaymentId());
            response.setAmount(capturePreAuthResponseMessage.getAmount());
            response.setTipAmount(capturePreAuthResponseMessage.getTipAmount());
            this.cloverConnector.broadcaster.notifyOnCapturePreAuth(response);
        }

        public onIncrementPreAuthError(result: sdk.remotepay.ResponseCode, reason: string, message: string) {
            const response: sdk.remotepay.IncrementPreAuthResponse = new sdk.remotepay.IncrementPreAuthResponse();
            CloverConnector.populateBaseResponse(response, false, result, reason, message);
            this.cloverConnector.broadcaster.notifyOnIncrementPreAuthResponse(response);
        }

        public onIncrementPreAuthResponse(responseMsg: sdk.remotemessage.IncrementPreAuthResponseMessage) {
            let success: boolean = (sdk.remotemessage.ResultStatus.SUCCESS == responseMsg.getStatus());
            const response: sdk.remotepay.IncrementPreAuthResponse = new sdk.remotepay.IncrementPreAuthResponse();
            CloverConnector.populateBaseResponse(response, success, this.resultStatusToResponseCode(responseMsg.getStatus()), responseMsg.getReason(), null);
            response.setAuthorization(responseMsg.getAuthorization());
            this.cloverConnector.broadcaster.notifyOnIncrementPreAuthResponse(response);
        }

        public onCloseoutResponse(status: sdk.remotemessage.ResultStatus, reason: string, batch: sdk.payments.Batch): void {
            let success: boolean = (status == sdk.remotemessage.ResultStatus.SUCCESS);
            let response: sdk.remotepay.CloseoutResponse = new sdk.remotepay.CloseoutResponse();
            CloverConnector.populateBaseResponse(response, success, this.resultSuccessToResponseCode(success), reason, null);
            response.setBatch(batch);
            this.cloverConnector.broadcaster.notifyCloseout(response);
        }

        public onDeviceDisconnected(device: CloverDevice, message?: string): void {
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
            this.cloverConnector.isReady = drm.getReady();

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

            merchantInfo.setSupportsPreAuths(drm.getSupportsPreAuth());
            merchantInfo.setSupportsManualRefunds(drm.getSupportsManualRefund());
            merchantInfo.setSupportsTipAdjust(drm.getSupportsTipAdjust());
            merchantInfo.setSupportsAuths(drm.getSupportsAuth());
            merchantInfo.setSupportsVaultCards(drm.getSupportsVaultCard());

            this.cloverConnector.merchantInfo = merchantInfo;
            this.cloverConnector.device.setSupportsAck(drm.getSupportsAcknowledgement());
            this.cloverConnector.device.setSupportsVoidPaymentResponse(drm.getSupportsVoidPaymentResponse());

            if (drm.getReady()) {
                this.cloverConnector.broadcaster.notifyOnReady(merchantInfo);
            } else {
                this.cloverConnector.broadcaster.notifyOnConnect();
            }
        }

        public onDeviceError(errorEvent: sdk.remotepay.CloverDeviceErrorEvent): void {
            this.cloverConnector.broadcaster.notifyOnDeviceError(errorEvent);
        }

        public onPrintRefundPayment(payment: sdk.payments.Payment, order: sdk.order.Order, refund: sdk.payments.Refund): void {
            let response: sdk.remotepay.PrintRefundPaymentReceiptResponse = new sdk.remotepay.PrintRefundPaymentReceiptResponse();
            response.setPayment(payment);
            response.setOrder(order);
            response.setRefund(refund);
            this.cloverConnector.broadcaster.notifyOnPrintRefundPaymentReceipt(response);
        }

        public onPrintMerchantReceipt(payment: sdk.payments.Payment): void {
            const message = new sdk.remotepay.PrintPaymentMerchantCopyReceiptMessage();
            message.setPayment(payment);
            this.cloverConnector.broadcaster.notifyOnPrintPaymentMerchantCopyReceipt(message);
        }

        public onPrintPaymentDecline(payment: sdk.payments.Payment, reason: string): void {
            const message = new sdk.remotepay.PrintPaymentDeclineReceiptMessage();
            message.setPayment(payment);
            message.setReason(reason);
            this.cloverConnector.broadcaster.notifyOnPrintPaymentDeclineReceipt(message);
        }

        public onPrintPayment(payment: sdk.payments.Payment, order: sdk.order.Order): void {
            const message = new sdk.remotepay.PrintPaymentReceiptMessage();
            message.setPayment(payment);
            message.setOrder(order);
            this.cloverConnector.broadcaster.notifyOnPrintPaymentReceipt(message);
        }

        public onPrintCredit(credit: sdk.payments.Credit): void {
            const message = new sdk.remotepay.PrintManualRefundReceiptMessage();
            message.setCredit(credit);
            this.cloverConnector.broadcaster.notifyOnPrintCreditReceipt(message);
        }

        public onPrintCreditDecline(credit: sdk.payments.Credit, reason: string): void {
            const message = new sdk.remotepay.PrintManualRefundDeclineReceiptMessage();
            message.setCredit(credit);
            message.setReason(reason);
            this.cloverConnector.broadcaster.notifyOnPrintCreditDeclineReceipt(message);
        }

        public onMessageAck(messageId: string): void {
            // TODO: for future use
        }

        public onPendingPaymentsResponse(success: boolean, pendingPayments: Array<sdk.base.PendingPaymentEntry>, reason?: string, message?: string): void {
            let result: sdk.remotepay.ResponseCode = success ? sdk.remotepay.ResponseCode.SUCCESS : sdk.remotepay.ResponseCode.ERROR;
            let response: sdk.remotepay.RetrievePendingPaymentsResponse = new sdk.remotepay.RetrievePendingPaymentsResponse();
            CloverConnector.populateBaseResponse(response, success, result, reason, message);
            if (pendingPayments) {
                response.setPendingPaymentEntries(pendingPayments);
            } else {
                this.cloverConnector.device.doShowWelcomeScreen();
            }
            this.cloverConnector.broadcaster.notifyOnRetrievePendingPaymentResponse(response);
        }

        public onReadCardResponse(status: sdk.remotemessage.ResultStatus, reason: string, cardData: sdk.base.CardData): void {
            let success: boolean = (status == sdk.remotemessage.ResultStatus.SUCCESS);
            if (success) {
                let response: sdk.remotepay.ReadCardDataResponse = new sdk.remotepay.ReadCardDataResponse();
                CloverConnector.populateBaseResponse(response, success, this.resultSuccessToResponseCode(success), reason);
                response.setCardData(cardData);
                this.cloverConnector.device.doShowWelcomeScreen();
                this.cloverConnector.broadcaster.notifyOnReadCardDataResponse(response);
            } else if (status == sdk.remotemessage.ResultStatus.CANCEL) {
                this.onReadCardDataResponse(sdk.remotepay.ResponseCode.CANCEL, reason, '');
            } else {
                this.onReadCardDataResponse(sdk.remotepay.ResponseCode.FAIL, reason, '');
            }
        }

        public onMessageFromActivity(actionId: string, payload: string): void {
            let message: sdk.remotepay.MessageFromActivity = new sdk.remotepay.MessageFromActivity();
            message.setAction(actionId);
            message.setPayload(payload);
            this.cloverConnector.broadcaster.notifyOnActivityMessage(message);
        }

        public onReadCardDataResponse(result: sdk.remotepay.ResponseCode, reason: string, message: string): void {
            let success: boolean = (result == sdk.remotepay.ResponseCode.SUCCESS);
            this.cloverConnector.device.doShowWelcomeScreen();
            let response: sdk.remotepay.ReadCardDataResponse = new sdk.remotepay.ReadCardDataResponse();
            CloverConnector.populateBaseResponse(response, success, result, reason, message);
            this.cloverConnector.broadcaster.notifyOnReadCardDataResponse(response);
        }

        public onActivityResponse(status: sdk.remotemessage.ResultStatus, payload: string, reason: string, actionId: string): void {
            let success: boolean = (status == sdk.remotemessage.ResultStatus.SUCCESS);
            let result: sdk.remotepay.ResponseCode = success ? sdk.remotepay.ResponseCode.SUCCESS : sdk.remotepay.ResponseCode.CANCEL;
            let response: sdk.remotepay.CustomActivityResponse = new sdk.remotepay.CustomActivityResponse();
            CloverConnector.populateBaseResponse(response, success, result, reason);
            response.setPayload(payload);
            response.setAction(actionId);
            this.cloverConnector.broadcaster.notifyOnActivityResponse(response);
        }

        public onDeviceStatusResponse(retrieveDeviceStatusResponseMessage: sdk.remotemessage.RetrieveDeviceStatusResponseMessage): void {
            let success: boolean = retrieveDeviceStatusResponseMessage.getStatus() ? retrieveDeviceStatusResponseMessage.getStatus() == sdk.remotemessage.ResultStatus.SUCCESS : true;
            let response: sdk.remotepay.RetrieveDeviceStatusResponse = new sdk.remotepay.RetrieveDeviceStatusResponse();
            CloverConnector.populateBaseResponse(response, success, this.resultStatusToResponseCode(retrieveDeviceStatusResponseMessage.getStatus()), retrieveDeviceStatusResponseMessage.getReason());
            response.setState(retrieveDeviceStatusResponseMessage.getState());
            response.setData(retrieveDeviceStatusResponseMessage.getData());
            this.cloverConnector.broadcaster.notifyOnRetrieveDeviceStatusResponse(response);
        }

        public onInvalidStateTransitionResponse(status: sdk.remotemessage.ResultStatus, reason: string, requestedTransition: string, state: sdk.remotemessage.ExternalDeviceState, data: sdk.remotemessage.ExternalDeviceStateData): void {
            let success: boolean = (status == sdk.remotemessage.ResultStatus.SUCCESS);
            let response: sdk.remotepay.InvalidStateTransitionResponse = new sdk.remotepay.InvalidStateTransitionResponse();
            const responseCode: sdk.remotepay.ResponseCode = this.resultStatusToResponseCode(status);
            CloverConnector.populateBaseResponse(response, success, responseCode, reason);
            response.setRequestedTransition(requestedTransition);
            response.setState(state);
            response.setData(data);
            this.cloverConnector.broadcaster.notifyOnInvalidStateTransitionResponse(response);
        }

        public onResetDeviceResponse(result: sdk.remotepay.ResponseCode, reason: string, state: sdk.remotemessage.ExternalDeviceState): void {
            let success: boolean = (result == sdk.remotepay.ResponseCode.SUCCESS);
            let response: sdk.remotepay.ResetDeviceResponse = new sdk.remotepay.ResetDeviceResponse();
            CloverConnector.populateBaseResponse(response, success, result, reason);
            response.setState(state);
            this.cloverConnector.broadcaster.notifyOnResetDeviceResponse(response);
        }

        public onRetrievePaymentResponse(retrievePaymentResponseMessage: sdk.remotemessage.RetrievePaymentResponseMessage): void {
            let success: boolean = (retrievePaymentResponseMessage.getStatus() == sdk.remotemessage.ResultStatus.SUCCESS);
            let response: sdk.remotepay.RetrievePaymentResponse = new sdk.remotepay.RetrievePaymentResponse();
            const responseCode: sdk.remotepay.ResponseCode = this.resultStatusToResponseCode(retrievePaymentResponseMessage.getStatus());
            CloverConnector.populateBaseResponse(response, success, responseCode, retrievePaymentResponseMessage.getReason(), retrievePaymentResponseMessage.getMessage());
            response.setExternalPaymentId(retrievePaymentResponseMessage.getExternalPaymentId());
            response.setQueryStatus(retrievePaymentResponseMessage.getQueryStatus());
            response.setPayment(retrievePaymentResponseMessage.getPayment());
            this.cloverConnector.broadcaster.notifyOnRetrievePaymentResponse(response);
        }

        public onRetrievePrintersResponse(result: sdk.remotepay.ResponseCode, printers: Array<sdk.printer.Printer>): void {
            let success: boolean = (result == sdk.remotepay.ResponseCode.SUCCESS);
            let response: sdk.remotepay.RetrievePrintersResponse = new sdk.remotepay.RetrievePrintersResponse();
            CloverConnector.populateBaseResponse(response, success, result, null);
            response.setPrinters(printers);
            this.cloverConnector.broadcaster.notifyOnRetrievePrintersResponse(response);
        }

        public onPrintJobStatusResponse(result: sdk.remotepay.ResponseCode, printRequestId: string, printStatus: sdk.printer.PrintJobStatus): void {
            let success: boolean = (result == sdk.remotepay.ResponseCode.SUCCESS);
            let response: sdk.remotepay.PrintJobStatusResponse = new sdk.remotepay.PrintJobStatusResponse();
            CloverConnector.populateBaseResponse(response, success, result, <any>printStatus);
            response.setStatus(printStatus);
            response.setPrintRequestId(printRequestId);
            this.cloverConnector.broadcaster.notifyOnPrintJobStatusResponse(response);
        }

        public onCustomerProvidedDataMessage(result: sdk.remotepay.ResponseCode, eventId: string, config: sdk.loyalty.LoyaltyDataConfig, data: string): void {
            let event: sdk.remotepay.CustomerProvidedDataEvent = new sdk.remotepay.CustomerProvidedDataEvent();
            event.setResult(result);
            event.setSuccess(result === sdk.remotepay.ResponseCode.SUCCESS);
            event.setEventId(eventId);
            let dataProviderConfig: sdk.remotepay.DataProviderConfig = new sdk.remotepay.DataProviderConfig();
            dataProviderConfig.setType(config.getType());
            dataProviderConfig.setConfiguration(config.getConfiguration());
            event.setConfig(dataProviderConfig);
            event.setData(data);
            this.cloverConnector.broadcaster.notifyOnCustomerProvidedDataEvent(event);
        }

        public onDisplayReceiptOptionsResponse(status: sdk.remotemessage.ResultStatus, reason: string): void {
            let response = new sdk.remotepay.DisplayReceiptOptionsResponse();
            const responseCode: sdk.remotepay.ResponseCode = this.resultStatusToResponseCode(status);

            response.setReason(reason);
            response.setResult(responseCode);
            response.setSuccess(response.getResult() == sdk.remotepay.ResponseCode.SUCCESS);
            this.cloverConnector.broadcaster.notifyOnDisplayReceiptOptionsResponse(response);
        }

        public onSignatureCollected(signatureResponseMessage: sdk.remotemessage.SignatureResponseMessage): void {
            let response: sdk.remotepay.SignatureResponse = new sdk.remotepay.SignatureResponse();
            const responseCode: sdk.remotepay.ResponseCode = this.resultStatusToResponseCode(signatureResponseMessage.getStatus());
            response.setReason(signatureResponseMessage.getReason());
            response.setResult(responseCode);
            response.setSuccess(response.getResult() == sdk.remotepay.ResponseCode.SUCCESS);
            response.setSignature(signatureResponseMessage.getSignature());
            this.cloverConnector.broadcaster.notifyOnSignatureCollected(response);
        }

        public onBalanceInquiryResponse(balanceInquiryResponseMessage: sdk.remotemessage.BalanceInquiryResponseMessage): void {
            let response: sdk.remotepay.CheckBalanceResponse = new sdk.remotepay.CheckBalanceResponse();
            const responseCode: sdk.remotepay.ResponseCode = this.resultStatusToResponseCode(balanceInquiryResponseMessage.getStatus());
            response.setReason(balanceInquiryResponseMessage.getReason());
            response.setResult(responseCode);
            response.setSuccess(response.getResult() == sdk.remotepay.ResponseCode.SUCCESS);
            let payment = balanceInquiryResponseMessage.getPayment();
            if (payment) {
                response.setAmount(payment.getAmount());
            }
            this.cloverConnector.broadcaster.notifyOnCheckBalanceResponse(response);
        }

        public onRequestTipResponse(requestTipResponseMessage: sdk.remotemessage.RequestTipResponseMessage): void {
            let response: sdk.remotepay.TipResponse = new sdk.remotepay.TipResponse();
            const responseCode: sdk.remotepay.ResponseCode = this.resultStatusToResponseCode(requestTipResponseMessage.getStatus());
            response.setReason(requestTipResponseMessage.getReason());
            response.setResult(responseCode);
            response.setSuccess(response.getResult() == sdk.remotepay.ResponseCode.SUCCESS);
            response.setTipAmount(requestTipResponseMessage.getAmount());
            this.cloverConnector.broadcaster.notifyOnTipResponse(response);
        }
    }
}
