import sdk = require('remote-pay-cloud-api');
import {RemoteMessageParser} from '../../../json/RemoteMessageParser';
import {CloverDevice} from './CloverDevice';
import {CloverTransport} from '../transport/CloverTransport';
import {ObjectMessageSender} from '../transport/ObjectMessageSender';
import {CloverTransportObserver} from '../transport/CloverTransportObserver';
import {CloverDeviceConfiguration} from './CloverDeviceConfiguration';
import {IImageUtil} from '../../../util/IImageUtil';
import {Logger} from '../util/Logger';
import {Version} from '../../../Version';

/**
 * Default Clover Device
 * 
 * This is a default implementation of the clover device.
 */
export abstract class DefaultCloverDevice extends CloverDevice implements CloverTransportObserver, ObjectMessageSender {

    private static REMOTE_SDK: string = Version.CLOVER_CLOUD_SDK + ":" + Version.CLOVER_CLOUD_SDK_VERSION;

    protected logger: Logger = Logger.create();

    private static id: number = 0;

    protected messageParser: RemoteMessageParser = RemoteMessageParser.getDefaultInstance();

    private msgIdToTask: { [key: string]: Function; } = {};

    private imageUtil: IImageUtil;

    constructor(configuration: CloverDeviceConfiguration) {
        super(
            configuration.getMessagePackageName(),
            configuration.getCloverTransport(),
            configuration.getApplicationId());
        this.imageUtil = configuration.getImageUtil();
		this.transport.subscribe(this);
        this.transport.setObjectMessageSender(this);
	}

    /**
     * Device is there but not yet ready for use
     * 
     * @param {CloverTransport} transport - the transport holding the notifications
     */
    public onDeviceConnected(transport: CloverTransport): void {
        this.notifyObserversConnected(transport);
    }

    /**
     * Device is there and ready for use
     * 
     * @param {CloverTransport} transport - the transport holding the notifications
     */
    public onDeviceReady(transport: CloverTransport): void {
        this.doDiscoveryRequest();
    }

    /**
     * Device is not there anymore
     * 
     * @param {CloverTransport} transport - the transport holding the notifications
     */
    public onDeviceDisconnected(transport: CloverTransport): void {
        this.notifyObserversDisconnected(transport);
    }

    public getApplicationId(): string {
        return this.applicationId;
    }

    protected handleRemoteMessagePING(rMessage: sdk.remotemessage.RemoteMessage) {
        this.sendPong(rMessage);
    }

    protected handleRemoteMessagePONG(rMessage: sdk.remotemessage.RemoteMessage) {
        // no-op
    }

    protected handleRemoteMessageCOMMAND(rMessage: sdk.remotemessage.RemoteMessage) {
        let method: sdk.remotemessage.Method = sdk.remotemessage.Method[rMessage.method];
        if (method == null) {
            this.logger.error('Unsupported method type: ' + rMessage.method);
        }
        else {
            var sdkMessage: sdk.remotemessage.Message = this.messageParser.parseMessageFromRemoteMessageObj(rMessage);
            if (sdkMessage == null) {
                this.logger.error('Error parsing message: ' + JSON.stringify(rMessage));
            }
            switch(method) {
                case sdk.remotemessage.Method.BREAK:
                    break;
                case sdk.remotemessage.Method.CASHBACK_SELECTED:
                    this.notifyObserversCashbackSelected(sdkMessage);
                    break;
                case sdk.remotemessage.Method.ACK:
                    this.notifyObserverAck(sdkMessage);
                    break;
                case sdk.remotemessage.Method.DISCOVERY_RESPONSE:
                    this.logger.debug('Got a Discovery Response');
                    this.notifyObserversReady(this.transport, sdkMessage);
                    break;
                case sdk.remotemessage.Method.CONFIRM_PAYMENT_MESSAGE:
                    this.notifyObserversConfirmPayment(sdkMessage);
                    break;
                case sdk.remotemessage.Method.FINISH_CANCEL:
                    this.notifyObserversFinishCancel(sdkMessage);
                    break;
                case sdk.remotemessage.Method.FINISH_OK:
                    this.notifyObserversFinishOk(sdkMessage);
                    break;
                case sdk.remotemessage.Method.KEY_PRESS:
                    this.notifyObserversKeyPressed(sdkMessage);
                    break;
                case sdk.remotemessage.Method.ORDER_ACTION_RESPONSE:
                    break;
                case sdk.remotemessage.Method.PARTIAL_AUTH:
                    this.notifyObserversPartialAuth(sdkMessage);
                    break;
                case sdk.remotemessage.Method.PAYMENT_VOIDED:
                    // currently this only gets called during a TX, so falls outside our current process flow
                    //PaymentVoidedMessage vpMessage = (PaymentVoidedMessage) Message.fromJsonString(rMessage.payload);
                    //this.notifyObserversPaymentVoided(vpMessage.payment, vpMessage.voidReason, ResultStatus.SUCCESS, null, null);
                    break;
                case sdk.remotemessage.Method.TIP_ADDED:
                    this.notifyObserversTipAdded(sdkMessage);
                    break;
                case sdk.remotemessage.Method.TX_START_RESPONSE:
                    this.notifyObserverTxStart(sdkMessage);
                    break;
                case sdk.remotemessage.Method.TX_STATE:
                    this.notifyObserversTxState(sdkMessage);
                    break;
                case sdk.remotemessage.Method.UI_STATE:
                    this.notifyObserversUiState(sdkMessage);
                    break;
                case sdk.remotemessage.Method.VERIFY_SIGNATURE:
                    this.notifyObserversVerifySignature(sdkMessage);
                    break;
                case sdk.remotemessage.Method.REFUND_RESPONSE:
                    this.notifyObserversPaymentRefundResponse(sdkMessage);
                    break;
                case sdk.remotemessage.Method.REFUND_REQUEST:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.TIP_ADJUST_RESPONSE:
                    this.notifyObserversTipAdjusted(sdkMessage);
                    break;
                case sdk.remotemessage.Method.VAULT_CARD_RESPONSE:
                    this.notifyObserverVaultCardResponse(sdkMessage);
                    break;
                case sdk.remotemessage.Method.CAPTURE_PREAUTH_RESPONSE:
                    this.notifyObserversCapturePreAuth(sdkMessage);
                    break;
                case sdk.remotemessage.Method.CLOSEOUT_RESPONSE:
                    this.notifyObserversCloseout(sdkMessage);
                    break;
                case sdk.remotemessage.Method.RETRIEVE_PENDING_PAYMENTS_RESPONSE:
                    this.notifyObserversPendingPaymentsResponse(sdkMessage);
                    break;
                case sdk.remotemessage.Method.CARD_DATA_RESPONSE:
                    this.notifyObserversReadCardData(sdkMessage);
                    break;
                case sdk.remotemessage.Method.ACTIVITY_MESSAGE_FROM_ACTIVITY:
                    this.notifyObserverActivityMessage(sdkMessage);
                    break;
                case sdk.remotemessage.Method.DISCOVERY_REQUEST:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.ORDER_ACTION_ADD_DISCOUNT:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.ORDER_ACTION_ADD_LINE_ITEM:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.ORDER_ACTION_REMOVE_LINE_ITEM:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.ORDER_ACTION_REMOVE_DISCOUNT:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.PRINT_IMAGE:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.PRINT_TEXT:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.PRINT_CREDIT:
                    this.notifyObserversPrintCredit(sdkMessage);
                    break;
                case sdk.remotemessage.Method.PRINT_CREDIT_DECLINE:
                    this.notifyObserversPrintCreditDecline(sdkMessage);
                    break;
                case sdk.remotemessage.Method.PRINT_PAYMENT:
                    this.notifyObserversPrintPayment(sdkMessage);
                    break;
                case sdk.remotemessage.Method.PRINT_PAYMENT_DECLINE:
                    this.notifyObserversPrintPaymentDecline(sdkMessage);
                    break;
                case sdk.remotemessage.Method.PRINT_PAYMENT_MERCHANT_COPY:
                    this.notifyObserversPrintMerchantCopy(sdkMessage);
                    break;
                case sdk.remotemessage.Method.REFUND_PRINT_PAYMENT:
                    this.notifyObserversPrintMessage(sdkMessage);
                    break;
                case sdk.remotemessage.Method.ACTIVITY_RESPONSE:
                    this.notifyObserversActivityResponse(sdkMessage);
                    break;
                case sdk.remotemessage.Method.REMOTE_ERROR:
                    this.notifyObserversRemoteError(sdkMessage);
                    break;
                case sdk.remotemessage.Method.RETRIEVE_DEVICE_STATUS_RESPONSE:
                    this.notifyObserversRetrieveDeviceStatusResponse(sdkMessage);
                    break;
                case sdk.remotemessage.Method.RESET_DEVICE_RESPONSE:
                    this.notifyObserversResetDeviceResponse(sdkMessage);
                    break;
                case sdk.remotemessage.Method.RETRIEVE_PAYMENT_RESPONSE:
                    this.notifyObserversRetrievePaymentResponse(sdkMessage);
                    break;
                case sdk.remotemessage.Method.SHOW_ORDER_SCREEN:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.SHOW_THANK_YOU_SCREEN:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.SHOW_WELCOME_SCREEN:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.SIGNATURE_VERIFIED:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.TERMINAL_MESSAGE:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.TX_START:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.VOID_PAYMENT:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.CAPTURE_PREAUTH:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.LAST_MSG_REQUEST:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.LAST_MSG_RESPONSE:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.TIP_ADJUST:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.OPEN_CASH_DRAWER:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.SHOW_PAYMENT_RECEIPT_OPTIONS:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.VAULT_CARD:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.CLOSEOUT_REQUEST:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.ACTIVITY_REQUEST:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.RETRIEVE_PAYMENT_REQUEST:
                    //Outbound no-op
                    break;
                default:
                    this.logger.error('COMMAND not supported with method: ' + rMessage.method);
                    break;
            }
        }
    }

    protected handleRemoteMessageQUERY(rMessage: sdk.remotemessage.RemoteMessage){
        // no-op
    }

    protected handleRemoteMessageEVENT(rMessage: sdk.remotemessage.RemoteMessage){
        // no-op
    }

    protected handleRemoteMessage(rMessage: sdk.remotemessage.RemoteMessage){
        try {
            let msgType: sdk.remotemessage.RemoteMessageType = rMessage.type;
            if (msgType == sdk.remotemessage.RemoteMessageType.PING) {
                this.handleRemoteMessagePING(rMessage);
            }
            else if (msgType == sdk.remotemessage.RemoteMessageType.PONG) {
                this.handleRemoteMessagePONG(rMessage);
            }
            else if (msgType == sdk.remotemessage.RemoteMessageType.COMMAND) {
                this.handleRemoteMessageCOMMAND(rMessage);
            }
            else if (msgType == sdk.remotemessage.RemoteMessageType.QUERY) {
                this.handleRemoteMessageQUERY(rMessage);
            }
            else if (msgType == sdk.remotemessage.RemoteMessageType.EVENT) {
                this.handleRemoteMessageEVENT(rMessage);
            }
            else {
                this.logger.error('Unsupported message type: ' + rMessage.type.toString());
            }
        }
        catch(eM) {
            this.logger.error('Error processing message: ' + rMessage.payload, eM);
        }
    }

    /**
     * Called when a raw message is received from the device
     * 
     * @param {string} message - the raw message from the device
     */
    public onMessage(message: string): void {
        this.logger.debug('onMessage: ' + message);
        try {
            // Parse the message
            let rMessage: sdk.remotemessage.RemoteMessage = this.messageParser.parseToRemoteMessage(message);
            this.handleRemoteMessage(rMessage);
        }
        catch(e) {
            this.logger.error(e);
        }
    }

    /**
     * Send a PONG response
     * 
     * @param pingMessage 
     */
    private sendPong(pingMessage: sdk.remotemessage.RemoteMessage): void {
        let remoteMessage: sdk.remotemessage.RemoteMessage = new sdk.remotemessage.RemoteMessage();
        remoteMessage.setType(sdk.remotemessage.RemoteMessageType.PONG);
        remoteMessage.setPackageName(this.packageName);
        remoteMessage.setRemoteSourceSDK(DefaultCloverDevice.REMOTE_SDK);
        remoteMessage.setRemoteApplicationID(this.applicationId);
        this.logger.debug('Sending PONG...');
        this.sendRemoteMessage(remoteMessage);
    }

    /**
     * Notify the observers that the device is connected
     * 
     * @param transport 
     */
    private notifyObserversConnected(transport: CloverTransport): void {
		this.deviceObservers.forEach((obs) => {
			obs.onDeviceConnected(this);
		});
    }

    /**
     * Notify the observers that the device has disconnected
     * 
     * @param transport 
     */
    private notifyObserversDisconnected(transport: CloverTransport): void {
		this.deviceObservers.forEach((obs) => {
			obs.onDeviceDisconnected(this);
		});
    }

    /**
     * Notify the observers that the device is ready
     * 
     * @param transport
     * @param drm
     */
    private notifyObserversReady(transport: CloverTransport, drm: sdk.remotemessage.DiscoveryResponseMessage): void {
		this.deviceObservers.forEach((obs) => {
			obs.onDeviceReady(this, drm);
		});
    }

    private notifyObserverAck(ackMessage: sdk.remotemessage.AcknowledgementMessage): void {
        let ackTask = this.msgIdToTask[ackMessage.sourceMessageId];
        if (ackTask) {
            delete this.msgIdToTask[ackMessage.sourceMessageId];
            ackTask.call(null);
        }
        // go ahead and notify listeners of the ACK
        this.deviceObservers.forEach((obs) => {
            obs.onMessageAck(ackMessage.sourceMessageId);
        });
    }

    private notifyObserverActivityMessage(message: sdk.remotemessage.ActivityMessageFromActivity): void {
        this.deviceObservers.forEach((obs) => {
            obs.onMessageFromActivity(message.action, message.payload);
        });
    }

    private notifyObserversActivityResponse(arm: sdk.remotemessage.ActivityResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            let status:sdk.remotemessage.ResultStatus = arm.resultCode == -1 ?
                sdk.remotemessage.ResultStatus.SUCCESS :
                sdk.remotemessage.ResultStatus.CANCEL;
            obs.onActivityResponse(status, arm.payload, arm.failReason, arm.action);
        });
    }

    private notifyObserversReadCardData(rcdrm: sdk.remotemessage.CardDataResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onReadCardResponse(rcdrm.status, rcdrm.reason, rcdrm.cardData);
        });
    }

    private notifyObserversPrintMessage(rppm: sdk.remotemessage.RefundPaymentPrintMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onPrintRefundPayment(rppm.payment, rppm.order, rppm.refund);
        });
    }

    private notifyObserversRetrieveDeviceStatusResponse(message: sdk.remotemessage.RetrieveDeviceStatusResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onDeviceStatusResponse(sdk.remotepay.ResponseCode.SUCCESS, message.reason, message.state, message.data);
        });
    }

    private notifyObserversRetrievePaymentResponse(message: sdk.remotemessage.RetrievePaymentResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onRetrievePaymentResponse(sdk.remotepay.ResponseCode.SUCCESS, message.reason, message.externalPaymentId, message.queryStatus, message.payment);
        });
    }

    private notifyObserversResetDeviceResponse(message: sdk.remotemessage.ResetDeviceResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onResetDeviceResponse(sdk.remotepay.ResponseCode.SUCCESS, message.reason, message.state);
        });
    }

    private notifyObserversRemoteError(message: sdk.remotemessage.RemoteError): void {
        this.deviceObservers.forEach((obs) => {
            // todo:  Add remote error
            let deviceErrorEvent:sdk.remotepay.CloverDeviceErrorEvent = new sdk.remotepay.CloverDeviceErrorEvent();
            deviceErrorEvent.setCode(sdk.remotepay.DeviceErrorEventCode.UnknownError);
            deviceErrorEvent.setMessage(JSON.stringify(message));
            deviceErrorEvent.setType(sdk.remotepay.ErrorType.EXCEPTION);
            obs.onDeviceError(deviceErrorEvent);
        });
    }

    private notifyObserversPrintMerchantCopy(ppmcm: sdk.remotemessage.PaymentPrintMerchantCopyMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onPrintMerchantReceipt(ppmcm.payment);
        });
    }

    private notifyObserversPrintPaymentDecline(dppm: sdk.remotemessage.DeclinePaymentPrintMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onPrintPaymentDecline(dppm.payment, dppm.reason);
        });
    }

    private notifyObserversPrintPayment(ppm: sdk.remotemessage.PaymentPrintMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onPrintPayment(ppm.payment, ppm.order);
        });
    }

    private notifyObserversPrintCredit(cpm: sdk.remotemessage.CreditPrintMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onPrintCredit(cpm.credit);
        });
    }

    private notifyObserversPrintCreditDecline(dcpm: sdk.remotemessage.DeclineCreditPrintMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onPrintCreditDecline(dcpm.credit, dcpm.reason);
        });
    }

    //---------------------------------------------------
    /// <summary>
    /// this is for a payment refund
    /// </summary>
    /// <param name="rrm"></param>
    public notifyObserversPaymentRefundResponse(rrm: sdk.remotemessage.RefundResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onPaymentRefundResponse(rrm.orderId, rrm.paymentId, rrm.refund, rrm.code);
        });
    }

    public notifyObserversKeyPressed(keyPress: sdk.remotemessage.KeyPressMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onKeyPressed(keyPress.keyPress);
        });
    }

    public notifyObserversCashbackSelected(cbSelected: sdk.remotemessage.CashbackSelectedMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onCashbackSelected(cbSelected.cashbackAmount);
        });
    }

    public notifyObserversTipAdded(tipAdded: sdk.remotemessage.TipAddedMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onTipAdded(tipAdded.tipAmount);
        });
    }

    public notifyObserverTxStart(txsrm: sdk.remotemessage.TxStartResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onTxStartResponse(txsrm.result, txsrm.externalPaymentId, txsrm.requestInfo);
        });
    }

    public notifyObserversTipAdjusted(tarm: sdk.remotemessage.TipAdjustResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onAuthTipAdjusted(tarm.paymentId, tarm.amount, tarm.success);
        });
    }

    public notifyObserversPartialAuth(partialAuth: sdk.remotemessage.PartialAuthMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onPartialAuth(partialAuth.partialAuthAmount);
        });
    }

    public notifyObserversPaymentVoided(payment: sdk.payments.Payment, voidReason: sdk.order.VoidReason, result: sdk.remotemessage.ResultStatus, reason: string, message: string): void {
        this.deviceObservers.forEach((obs) => {
            obs.onPaymentVoided(payment, voidReason, result, reason, message);
        });
    }

    public notifyObserversVerifySignature(verifySigMsg: sdk.remotemessage.VerifySignatureMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onVerifySignature(verifySigMsg.payment, verifySigMsg.signature);
        });
    }

    public notifyObserversConfirmPayment(confirmPaymentMessage: sdk.remotemessage.ConfirmPaymentMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onConfirmPayment(confirmPaymentMessage.payment, confirmPaymentMessage.challenges);
        });
    }

    public notifyObserverVaultCardResponse(vaultCardResponseMessage: sdk.remotemessage.VaultCardResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onVaultCardResponse(vaultCardResponseMessage.card, vaultCardResponseMessage.status.toString(), vaultCardResponseMessage.reason);
        });
    }

    public notifyObserversUiState(uiStateMsg: sdk.remotemessage.UiStateMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onUiState(uiStateMsg.uiState, uiStateMsg.uiText, uiStateMsg.uiDirection, uiStateMsg.inputOptions);
        });
    }

    public notifyObserversCapturePreAuth(cparm: sdk.remotemessage.CapturePreAuthResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onCapturePreAuth(cparm.status, cparm.reason, cparm.paymentId, cparm.amount, cparm.tipAmount);
        });
    }

    public notifyObserversCloseout(crm: sdk.remotemessage.CloseoutResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onCloseoutResponse(crm.status, crm.reason, crm.batch);
        });
    }

    public notifyObserversPendingPaymentsResponse(rpprm: sdk.remotemessage.RetrievePendingPaymentsResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onPendingPaymentsResponse(rpprm.status == sdk.remotemessage.ResultStatus.SUCCESS, rpprm.pendingPaymentEntries);
        });
    }

    public notifyObserversTxState(txStateMsg: sdk.remotemessage.TxStateMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onTxState(txStateMsg.txState);
        });
    }

    public notifyObserversFinishCancel(msg: sdk.remotemessage.FinishCancelMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onFinishCancel(msg.requestInfo);
        });
    }

    public notifyObserversFinishOk(msg: sdk.remotemessage.FinishOkMessage): void {
        this.deviceObservers.forEach((obs) => {
            if (msg.payment) {
                obs.onFinishOk(msg.payment, msg.signature, msg.requestInfo);
            } else if (msg.credit) {
                obs.onFinishOk(msg.credit);
            } else if (msg.refund) {
                obs.onFinishOk(msg.refund);
            }
        });
    }

	/**
	 * Show Payment Receipt Screen
	 * 
	 * @param {string} orderId 
	 * @param {string} paymentId 
	 */
	public doShowPaymentReceiptScreen(orderId: string, paymentId: string): void {
        let message: sdk.remotemessage.ShowPaymentReceiptOptionsMessage = new sdk.remotemessage.ShowPaymentReceiptOptionsMessage();
        message.setOrderId(orderId);
        message.setPaymentId(paymentId);
        message.setVersion(2);
        this.sendObjectMessage(message);
    }

	/**
	 * Key Press
	 * 
	 * @param {sdk.remotemessage.KeyPress} keyPress
	 */
	public doKeyPress(keyPress: sdk.remotemessage.KeyPress): void {
        let message: sdk.remotemessage.KeyPressMessage = new sdk.remotemessage.KeyPressMessage();
        message.setKeyPress(keyPress);
        this.sendObjectMessage(message);
    }

	/**
	 * Show Thank You Screen
	 */
	public doShowThankYouScreen(): void {
        let message: sdk.remotemessage.ThankYouMessage = new sdk.remotemessage.ThankYouMessage();
        this.sendObjectMessage(message);

    }

	/**
	 * Show Welcome Screen
	 */
	public doShowWelcomeScreen(): void {
        let message: sdk.remotemessage.WelcomeMessage = new sdk.remotemessage.WelcomeMessage();
        this.sendObjectMessage(message);
    }

	/**
	 * Signature Verified
	 * 
	 * @param {sdk.payments.Payment} payment
	 * @param {boolean} verified 
	 */
	public doSignatureVerified(payment: sdk.payments.Payment, verified: boolean): void {
        let message: sdk.remotemessage.SignatureVerifiedMessage = new sdk.remotemessage.SignatureVerifiedMessage();
        message.setPayment(payment);
        message.setVerified(verified);
        this.sendObjectMessage(message);
    }

	/**
	 * Retrieve Pending Payments
	 */
	public doRetrievePendingPayments(): void {
        let message: sdk.remotemessage.RetrievePendingPaymentsMessage = new sdk.remotemessage.RetrievePendingPaymentsMessage();
        this.sendObjectMessage(message);
    }

	/**
	 * Terminal Message
	 * 
	 * @param {string} text 
	 */
	public doTerminalMessage(text: string): void {
        let message: sdk.remotemessage.TerminalMessage = new sdk.remotemessage.TerminalMessage();
        message.setText(text);
        this.sendObjectMessage(message);
    }

	/**
	 * Open Cash Drawer
	 * 
	 * @param {string} reason 
	 */
	public doOpenCashDrawer(reason: string): void {
        let message: sdk.remotemessage.OpenCashDrawerMessage = new sdk.remotemessage.OpenCashDrawerMessage();
        message.setReason(reason);
        this.sendObjectMessage(message);
    }

	/**
	 * Closeout
	 * 
	 * @param {boolean} allowOpenTabs 
	 * @param {string} batchId 
	 */
	public doCloseout(allowOpenTabs: boolean, batchId: string): void {
        let message: sdk.remotemessage.CloseoutRequestMessage = new sdk.remotemessage.CloseoutRequestMessage();
        message.setAllowOpenTabs(allowOpenTabs);
        message.setBatchId(batchId);
        this.sendObjectMessage(message);
    }

	/**
	 * Transaction Start
	 * 
	 * @param {sdk.remotemessage.PayIntent} payIntent
	 * @param {sdk.remotemessage.Order} order
	 */
	public doTxStart(payIntent: sdk.remotemessage.PayIntent, order: sdk.order.Order): void {
        let message: sdk.remotemessage.TxStartRequestMessage = new sdk.remotemessage.TxStartRequestMessage();
        message.setPayIntent(payIntent);
        message.setOrder(order);
        this.sendObjectMessage(message);
    }

	/**
	 * Tip Adjust Auth
	 * 
	 * @param {string} orderId 
	 * @param {string} paymentId 
	 * @param {number} amount 
	 */
	public doTipAdjustAuth(orderId: string, paymentId: string, amount: number): void {
        let message: sdk.remotemessage.TipAdjustMessage = new sdk.remotemessage.TipAdjustMessage();
        message.setOrderId(orderId);
        message.setPaymentId(paymentId);
        message.setTipAmount(amount);
        this.sendObjectMessage(message);
    }

	/**
	 * Read Cart Data
	 * 
	 * @param {PayIntent} payIntent
	 */
	public doReadCardData(payIntent: sdk.remotemessage.PayIntent): void {
        let message: sdk.remotemessage.CardDataRequestMessage = new sdk.remotemessage.CardDataRequestMessage();
        message.setPayIntent(payIntent);
        this.sendObjectMessage(message);
    }

    /**
     * Send a message to a running custom activity
     *
     * @param {string} actionId - the id used when the custom action was started
     * @param {string} payload - the message content, unrestricted format
     */
    public doSendMessageToActivity(actionId:string, payload:string):void {
        let message:sdk.remotemessage.ActivityMessageToActivity = new sdk.remotemessage.ActivityMessageToActivity();
        message.setAction(actionId);
        message.setPayload(payload);
        this.sendObjectMessage(message);
    }

    /**
     * Print Text
     *
     * @param {Array<string>} textLines
     */
    public doPrintText(textLines:Array<string>):void {
        let message:sdk.remotemessage.TextPrintMessage = new sdk.remotemessage.TextPrintMessage();
        message.setTextLines(textLines);
        this.sendObjectMessage(message);
    }

	/**
	 * Print Image (Bitmap)
	 * 
	 * @param {any} bitmap
	 */
	public doPrintImageObject(bitmap: any): void {
        let message: sdk.remotemessage.ImagePrintMessage = new sdk.remotemessage.ImagePrintMessage();
        // bitmap - HTMLImageElement
        message.setPng(this.imageUtil.getBase64Image(bitmap));
        this.sendObjectMessage(message);
    }

	/**
	 * Print Image (URL)
	 * 
	 * @param {string} url 
	 */
	public doPrintImageUrl(url: string): void {
        let message: sdk.remotemessage.ImagePrintMessage = new sdk.remotemessage.ImagePrintMessage();
        message.setUrlString(url);
        this.sendObjectMessage(message);
    }

    public doStartActivity(action:string, payload:string, nonBlocking:boolean):void {
        let request:sdk.remotemessage.ActivityRequest = new sdk.remotemessage.ActivityRequest();
        request.setAction(action);
        request.setPayload(payload);
        request.setNonBlocking(nonBlocking);
        request.setForceLaunch(false);
        this.sendObjectMessage(request);
    }

    /**
	 * Void Payment
	 * 
	 * @param {sdk.payments.Payment} payment
	 * @param {sdk.order.VoidReason} reason
	 */
	public doVoidPayment(payment: sdk.payments.Payment, reason: sdk.order.VoidReason): void {
        let message: sdk.remotemessage.VoidPaymentMessage = new sdk.remotemessage.VoidPaymentMessage();
        message.setPayment(payment);
        message.setVoidReason(reason);

        let remoteMessage: sdk.remotemessage.RemoteMessage = this.buildRemoteMessageToSend(message);
        let msgId: string = remoteMessage.getId();

        if (!this.supportsAcks()) {
            this.sendRemoteMessage(remoteMessage);
            this.notifyObserversPaymentVoided(payment, reason, sdk.remotemessage.ResultStatus.SUCCESS, null, null);
        }
        else {
            // we will send back response after we get an ack
            this.addTaskForAck(msgId, () => {
                this.notifyObserversPaymentVoided(payment, reason, sdk.remotemessage.ResultStatus.SUCCESS, null, null);
            });
            //this.msgIdToTask[msgId] = () => {
            //    this.notifyObserversPaymentVoided(payment, reason, sdk.remotemessage.ResultStatus.SUCCESS, null, null);
            //};
            this.sendRemoteMessage(remoteMessage);
        }
    }

    protected addTaskForAck(msgId: string, task: Function) {
        this.msgIdToTask[msgId] = task;
    }

	/**
	 * Payment Refund
	 * 
	 * @param {string} orderId 
	 * @param {string} paymentId 
	 * @param {number} amount 
	 * @param {boolean} fullRefund 
	 */
	public doPaymentRefund(orderId: string, paymentId: string, amount: number, fullRefund: boolean): void {
        let message: sdk.remotemessage.RefundRequestMessage = new sdk.remotemessage.RefundRequestMessage();
        message.setOrderId(orderId);
        message.setPaymentId(paymentId);
        message.setAmount(amount);
        message.setFullRefund(fullRefund);
        this.sendObjectMessage_opt_version(message, 2);
    }

	/**
	 * Vault Card
	 * 
	 * @param {number} cardEntryMethods 
	 */
	public doVaultCard(cardEntryMethods: number): void {
        let message: sdk.remotemessage.VaultCardMessage = new sdk.remotemessage.VaultCardMessage();
        message.setCardEntryMethods(cardEntryMethods);
        this.sendObjectMessage(message);
    }

	/**
	 * Capture Auth
	 * 
	 * @param {string} paymentId 
	 * @param {number} amount 
	 * @param {number} tipAmount 
	 */
	public doCaptureAuth(paymentId: string, amount: number, tipAmount: number): void {
        let message: sdk.remotemessage.CapturePreAuthMessage = new sdk.remotemessage.CapturePreAuthMessage();
        message.setPaymentId(paymentId);
        message.setAmount(amount);
        message.setTipAmount(tipAmount);
        this.sendObjectMessage(message);
    }

	/**
	 * Accept Payment
	 * 
	 * @param {Payment} payment 
	 */
	public doAcceptPayment(payment: sdk.payments.Payment): void {
        let message: sdk.remotemessage.PaymentConfirmedMessage = new sdk.remotemessage.PaymentConfirmedMessage();
        message.setPayment(payment);
        this.sendObjectMessage(message);
    }

	/**
	 * Reject Payment
	 * 
	 * @param {Payment} payment 
	 * @param {Challenge} challenge 
	 */
	public doRejectPayment(payment: sdk.payments.Payment, challenge: sdk.base.Challenge): void {
        let message: sdk.remotemessage.PaymentRejectedMessage = new sdk.remotemessage.PaymentRejectedMessage();
        message.setPayment(payment);
        message.setVoidReason(challenge.reason);
        this.sendObjectMessage(message);
    }

	/**
	 * Discovery request
	 */
	public doDiscoveryRequest(): void {
        let drm:sdk.remotemessage.DiscoveryRequestMessage = new sdk.remotemessage.DiscoveryRequestMessage();
        drm.setSupportsOrderModification(false);
        this.sendObjectMessage(drm);
    }

	/**
	 * Order Update
	 * 
	 * @param {DisplayOrder} order 
	 * @param {any} orderOperation 
	 */
	public doOrderUpdate(order: sdk.order.DisplayOrder, orderOperation: any): void {
        let message: sdk.remotemessage.OrderUpdateMessage = new sdk.remotemessage.OrderUpdateMessage();
        message.setOrder(order);

        if(orderOperation) {
            if (orderOperation instanceof sdk.order.operation.DiscountsAddedOperation) {
                message.setDiscountsAddedOperation(orderOperation);
            } else if (orderOperation instanceof sdk.order.operation.DiscountsDeletedOperation) {
                message.setDiscountsDeletedOperation(orderOperation);
            } else if (orderOperation instanceof sdk.order.operation.LineItemsAddedOperation) {
                message.setLineItemsAddedOperation(orderOperation);
            } else if (orderOperation instanceof sdk.order.operation.LineItemsDeletedOperation) {
                message.setLineItemsDeletedOperation(orderOperation);
            } else if (orderOperation instanceof sdk.order.operation.OrderDeletedOperation) {
                message.setOrderDeletedOperation(orderOperation);
            }
        }
        this.sendObjectMessage(message);
    }

	/**
	 * Reset Device
	 */
	public doResetDevice(): void {
        let message: sdk.remotemessage.BreakMessage = new sdk.remotemessage.BreakMessage();
        this.sendObjectMessage(message);
    }

    public doRetrieveDeviceStatus(request: sdk.remotepay.RetrieveDeviceStatusRequest): void {
        let message: sdk.remotemessage.RetrieveDeviceStatusRequestMessage = new sdk.remotemessage.RetrieveDeviceStatusRequestMessage();
        message.setSendLastMessage(request.getSendLastMessage());
        this.sendObjectMessage(message);
    }

    public doRetrievePayment(externalPaymentId: string): void {
        let message: sdk.remotemessage.RetrievePaymentRequestMessage = new sdk.remotemessage.RetrievePaymentRequestMessage();
        message.setExternalPaymentId(externalPaymentId);
        this.sendObjectMessage(message);
    }

    /**
	 * Dispose
	 */
	public dispose(): void {
        this.deviceObservers.splice(0, this.deviceObservers.length);
        if (this.transport) {
            this.transport.dispose();
            this.transport = null;
        }
    }

    /**
     * Send the message to the device using the transport
     * 
     * @param {sdk.remotemessage.Message} message
     */
    public sendObjectMessage(message: sdk.remotemessage.Message): string {
        return this.sendObjectMessage_opt_version(message);
    }

    private sendObjectMessage_opt_version(message: sdk.remotemessage.Message, version?: number): string {
        let remoteMessage: sdk.remotemessage.RemoteMessage = this.buildRemoteMessageToSend(message, version);
        this.sendRemoteMessage(remoteMessage);
        return remoteMessage.getId();
    }

    protected buildRemoteMessageToSend(message: sdk.remotemessage.Message, version?: number): sdk.remotemessage.RemoteMessage {
        // Default to version 1
        if (version == null) version = 1;

        // Make sure the message is not null
        if (message == null) {
            this.logger.debug('Message is null');
            return null;
        }

        // Check the message method
        this.logger.info(message.toString());
        if (message.method == null) {
            this.logger.error('Invalid Message', new Error('Invalid Message: ' + message.toString()));
            return null;
        }

        // Check the application id
        if (this.applicationId == null) {
            this.logger.error('Invalid ApplicationID: ' + this.applicationId);
            throw new Error('Invalid applicationId');
        }

        let messageId: string = (++DefaultCloverDevice.id) + '';
        let remoteMessage: sdk.remotemessage.RemoteMessage = new sdk.remotemessage.RemoteMessage();
        remoteMessage.setId(messageId);
        remoteMessage.setType(sdk.remotemessage.RemoteMessageType.COMMAND);
        remoteMessage.setPackageName(this.packageName);
        remoteMessage.setMethod(message.method.toString());
        remoteMessage.setPayload(JSON.stringify(message));
        remoteMessage.setRemoteSourceSDK(DefaultCloverDevice.REMOTE_SDK);
        remoteMessage.setRemoteApplicationID(this.applicationId);

        return remoteMessage;
    }

    protected sendRemoteMessage(remoteMessage: sdk.remotemessage.RemoteMessage): void {
        let msg = JSON.stringify(remoteMessage);
        if(this.transport) {
            this.logger.debug('Sending: ' + msg);
            this.transport.sendMessage(msg);
        } else {
            this.logger.error('Cannot send message, transport is null: ' + msg);
        }
    }
}
