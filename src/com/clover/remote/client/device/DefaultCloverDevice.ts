import * as sdk from 'remote-pay-cloud-api';
import {RemoteMessageParser} from '../../../json/RemoteMessageParser';
import {CloverDevice} from './CloverDevice';
import {CloverConnector} from '../CloverConnector';
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

    protected logger: Logger = Logger.create();
    protected messageParser: RemoteMessageParser = RemoteMessageParser.getDefaultInstance();

    // Remote message version and message version are not the same.  Remote message version is used for high-level
    // feature detection - e.g. is message fragmentation supported or not?
    private static DEFAULT_REMOTE_MESSAGE_VERSION: number = 1;
    private remoteMessageVersion: number = DefaultCloverDevice.DEFAULT_REMOTE_MESSAGE_VERSION;

    private static REMOTE_SDK: string = Version.CLOVER_CLOUD_SDK + ":" + Version.CLOVER_CLOUD_SDK_VERSION;
    private static BASE64: string = "BASE64";
    private static BASE64_ATTACHMENT: string = DefaultCloverDevice.BASE64 + ".ATTACHMENT";

    private static id: number = 0;

    private msgIdToTask: { [key: string]: Function; } = {};
    private imageUtil: IImageUtil;
    private maxMessageSizeInChars: number;

    constructor(configuration: CloverDeviceConfiguration) {
        super(
            configuration.getMessagePackageName(),
            configuration.getCloverTransport(),
            configuration.getApplicationId());
        this.imageUtil = configuration.getImageUtil();
        this.maxMessageSizeInChars = Math.max(1000, configuration.getMaxMessageCharacters());
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
    public onDeviceDisconnected(transport: CloverTransport, message?: string): void {
        this.notifyObserversDisconnected(transport, message);
    }

    public onDeviceError(deviceError: sdk.remotepay.CloverDeviceErrorEvent): void {
        this.notifyObserversDeviceError(deviceError);
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
        this.remoteMessageVersion = Math.max(this.remoteMessageVersion, typeof rMessage["getVersion"] === "function" ? rMessage.getVersion() : DefaultCloverDevice.DEFAULT_REMOTE_MESSAGE_VERSION);
        let method: sdk.remotemessage.Method = sdk.remotemessage.Method[rMessage.getMethod()];
        if (method == null) {
            this.logger.error('Unsupported method type: ' + rMessage.getMethod());
        }
        else {
            var sdkMessage: sdk.remotemessage.Message = this.messageParser.parseMessageFromRemoteMessageObj(rMessage);
            if (sdkMessage == null) {
                this.logger.error('Error parsing message: ' + JSON.stringify(rMessage));
            }
            switch (method) {
                case sdk.remotemessage.Method.BREAK:
                    break;
                case sdk.remotemessage.Method.CASHBACK_SELECTED:
                    this.notifyObserversCashbackSelected(<sdk.remotemessage.CashbackSelectedMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.ACK:
                    this.notifyObserverAck(<sdk.remotemessage.AcknowledgementMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.DISCOVERY_RESPONSE:
                    this.logger.debug('Got a Discovery Response');
                    this.notifyObserversReady(this.transport, <sdk.remotemessage.DiscoveryResponseMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.CONFIRM_PAYMENT_MESSAGE:
                    this.notifyObserversConfirmPayment(<sdk.remotemessage.ConfirmPaymentMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.FINISH_CANCEL:
                    this.notifyObserversFinishCancel(<sdk.remotemessage.FinishCancelMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.FINISH_OK:
                    this.notifyObserversFinishOk(<sdk.remotemessage.FinishOkMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.KEY_PRESS:
                    this.notifyObserversKeyPressed(<sdk.remotemessage.KeyPressMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.ORDER_ACTION_RESPONSE:
                    break;
                case sdk.remotemessage.Method.PARTIAL_AUTH:
                    this.notifyObserversPartialAuth(<sdk.remotemessage.PartialAuthMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.PAYMENT_VOIDED:
                    // currently this only gets called during a TX, so falls outside our current process flow
                    //PaymentVoidedMessage vpMessage = (PaymentVoidedMessage) Message.fromJsonString(rMessage.payload);
                    //this.notifyObserversPaymentVoided(vpMessage.payment, vpMessage.voidReason, ResultStatus.SUCCESS, null, null);
                    break;
                case sdk.remotemessage.Method.TIP_ADDED:
                    this.notifyObserversTipAdded(<sdk.remotemessage.TipAddedMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.TX_START_RESPONSE:
                    this.notifyObserverTxStart(<sdk.remotemessage.TxStartResponseMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.TX_STATE:
                    this.notifyObserversTxState(<sdk.remotemessage.TxStateMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.UI_STATE:
                    this.notifyObserversUiState(<sdk.remotemessage.UiStateMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.VERIFY_SIGNATURE:
                    this.notifyObserversVerifySignature(<sdk.remotemessage.VerifySignatureMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.REFUND_RESPONSE:
                    this.notifyObserversPaymentRefundResponse(<sdk.remotemessage.RefundResponseMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.REFUND_REQUEST:
                    //Outbound no-op
                    break;
                case sdk.remotemessage.Method.TIP_ADJUST_RESPONSE:
                    this.notifyObserversTipAdjusted(<sdk.remotemessage.TipAdjustResponseMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.VAULT_CARD_RESPONSE:
                    this.notifyObserverVaultCardResponse(<sdk.remotemessage.VaultCardResponseMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.CAPTURE_PREAUTH_RESPONSE:
                    this.notifyObserversCapturePreAuth(<sdk.remotemessage.CapturePreAuthResponseMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.CLOSEOUT_RESPONSE:
                    this.notifyObserversCloseout(<sdk.remotemessage.CloseoutResponseMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.RETRIEVE_PENDING_PAYMENTS_RESPONSE:
                    this.notifyObserversPendingPaymentsResponse(<sdk.remotemessage.RetrievePendingPaymentsResponseMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.CARD_DATA_RESPONSE:
                    this.notifyObserversReadCardData(<sdk.remotemessage.CardDataResponseMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.ACTIVITY_MESSAGE_FROM_ACTIVITY:
                    this.notifyObserverActivityMessage(<sdk.remotemessage.ActivityMessageFromActivity> sdkMessage);
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
                case sdk.remotemessage.Method.ACTIVITY_RESPONSE:
                    this.notifyObserversActivityResponse(<sdk.remotemessage.ActivityResponseMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.REMOTE_ERROR:
                    this.notifyObserversRemoteError(sdkMessage);
                    break;
                case sdk.remotemessage.Method.RETRIEVE_DEVICE_STATUS_RESPONSE:
                    this.notifyObserversRetrieveDeviceStatusResponse(<sdk.remotemessage.RetrieveDeviceStatusResponseMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.RESET_DEVICE_RESPONSE:
                    this.notifyObserversResetDeviceResponse(<sdk.remotemessage.ResetDeviceResponseMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.RETRIEVE_PAYMENT_RESPONSE:
                    this.notifyObserversRetrievePaymentResponse(<sdk.remotemessage.RetrievePaymentResponseMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.GET_PRINTERS_RESPONSE:
                    this.notifyObserversRetrievePrintersResponse(<sdk.remotemessage.GetPrintersResponseMessage> sdkMessage);
                    break;
                case sdk.remotemessage.Method.PRINT_JOB_STATUS_RESPONSE:
                    this.notifyObserversPrintJobStatusResponse(<sdk.remotemessage.PrintJobStatusResponseMessage> sdkMessage);
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
                    this.logger.error('COMMAND not supported with method: ' + rMessage.getMethod());
                    break;
            }
        }
    }

    protected handleRemoteMessageQUERY(rMessage: sdk.remotemessage.RemoteMessage) {
        // no-op
    }

    protected handleRemoteMessageEVENT(rMessage: sdk.remotemessage.RemoteMessage) {
        // no-op
    }

    protected handleRemoteMessage(rMessage: sdk.remotemessage.RemoteMessage) {
        try {
            let msgType: sdk.remotemessage.RemoteMessageType = rMessage.getType();
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
                this.logger.error('Unsupported message type: ' + rMessage.getType().toString());
            }
        }
        catch (eM) {
            this.logger.error('Error processing message: ' + rMessage.getPayload(), eM);
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
        catch (e) {
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
    private notifyObserversDisconnected(transport: CloverTransport, message?: string): void {
        this.deviceObservers.forEach((obs) => {
            obs.onDeviceDisconnected(this, message);
        });
    }

    /**
     * Notify the observers that the transport failed.
     *
     * @param transport
     */
    private notifyObserversDeviceError(errorEvent: sdk.remotepay.CloverDeviceErrorEvent): void {
        this.deviceObservers.forEach((obs) => {
            obs.onDeviceError(errorEvent);
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
        let ackTask = this.msgIdToTask[ackMessage.getSourceMessageId()];
        if (ackTask) {
            delete this.msgIdToTask[ackMessage.getSourceMessageId()];
            ackTask.call(null);
        }
        // go ahead and notify listeners of the ACK
        this.deviceObservers.forEach((obs) => {
            obs.onMessageAck(ackMessage.getSourceMessageId());
        });
    }

    private notifyObserverActivityMessage(message: sdk.remotemessage.ActivityMessageFromActivity): void {
        this.deviceObservers.forEach((obs) => {
            obs.onMessageFromActivity(message.getAction(), message.getPayload());
        });
    }

    private notifyObserversActivityResponse(arm: sdk.remotemessage.ActivityResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            let status: sdk.remotemessage.ResultStatus = arm.getResultCode() == -1 ?
                sdk.remotemessage.ResultStatus.SUCCESS :
                sdk.remotemessage.ResultStatus.CANCEL;
            obs.onActivityResponse(status, arm.getPayload(), arm.getFailReason(), arm.getAction());
        });
    }

    private notifyObserversReadCardData(rcdrm: sdk.remotemessage.CardDataResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onReadCardResponse(rcdrm.getStatus(), rcdrm.getReason(), rcdrm.getCardData());
        });
    }

    private notifyObserversRetrieveDeviceStatusResponse(message: sdk.remotemessage.RetrieveDeviceStatusResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onDeviceStatusResponse(sdk.remotepay.ResponseCode.SUCCESS, message.getReason(), message.getState(), message.getData());
        });
    }

    private notifyObserversRetrievePaymentResponse(message: sdk.remotemessage.RetrievePaymentResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onRetrievePaymentResponse(sdk.remotepay.ResponseCode.SUCCESS, message.getReason(), message.getExternalPaymentId(), message.getQueryStatus(), message.getPayment());
        });
    }

    private notifyObserversRetrievePrintersResponse(message: sdk.remotemessage.GetPrintersResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onRetrievePrintersResponse(sdk.remotepay.ResponseCode.SUCCESS, message.getPrinters());
        });
    }

    private notifyObserversPrintJobStatusResponse(message: sdk.remotemessage.PrintJobStatusResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onPrintJobStatusResponse(sdk.remotepay.ResponseCode.SUCCESS, message.getExternalPrintJobId(), message.getStatus());
        });
    }

    private notifyObserversResetDeviceResponse(message: sdk.remotemessage.ResetDeviceResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onResetDeviceResponse(sdk.remotepay.ResponseCode.SUCCESS, message.getReason(), message.getState());
        });
    }

    private notifyObserversRemoteError(message: sdk.remotemessage.RemoteError): void {
        this.deviceObservers.forEach((obs) => {
            // todo:  Add remote error
            let deviceErrorEvent: sdk.remotepay.CloverDeviceErrorEvent = new sdk.remotepay.CloverDeviceErrorEvent();
            deviceErrorEvent.setCode(sdk.remotepay.DeviceErrorEventCode.UnknownError);
            deviceErrorEvent.setMessage(JSON.stringify(message));
            deviceErrorEvent.setType(sdk.remotepay.ErrorType.EXCEPTION);
            obs.onDeviceError(deviceErrorEvent);
        });
    }

    public notifyObserversPaymentRefundResponse(rrm: sdk.remotemessage.RefundResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onPaymentRefundResponse(rrm.getOrderId(), rrm.getPaymentId(), rrm.getRefund(), rrm.getCode(), rrm.getReason(), rrm.getMessage());
        });
    }

    public notifyObserversKeyPressed(keyPress: sdk.remotemessage.KeyPressMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onKeyPressed(keyPress.getKeyPress());
        });
    }

    public notifyObserversCashbackSelected(cbSelected: sdk.remotemessage.CashbackSelectedMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onCashbackSelected(cbSelected.getCashbackAmount());
        });
    }

    public notifyObserversTipAdded(tipAdded: sdk.remotemessage.TipAddedMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onTipAdded(tipAdded.getTipAmount());
        });
    }

    public notifyObserverTxStart(txsrm: sdk.remotemessage.TxStartResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onTxStartResponse(txsrm.getResult(), txsrm.getExternalPaymentId(), txsrm.getRequestInfo());
        });
    }

    public notifyObserversTipAdjusted(tarm: sdk.remotemessage.TipAdjustResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onAuthTipAdjusted(tarm.getPaymentId(), tarm.getAmount(), tarm.getSuccess());
        });
    }

    public notifyObserversPartialAuth(partialAuth: sdk.remotemessage.PartialAuthMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onPartialAuth(partialAuth.getPartialAuthAmount());
        });
    }

    public notifyObserversPaymentVoided(payment: sdk.payments.Payment, voidReason: sdk.order.VoidReason, result: sdk.remotemessage.ResultStatus, reason: string, message: string): void {
        this.deviceObservers.forEach((obs) => {
            obs.onPaymentVoided(payment, voidReason, result, reason, message);
        });
    }

    public notifyObserversVerifySignature(verifySigMsg: sdk.remotemessage.VerifySignatureMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onVerifySignature(verifySigMsg.getPayment(), verifySigMsg.getSignature());
        });
    }

    public notifyObserversConfirmPayment(confirmPaymentMessage: sdk.remotemessage.ConfirmPaymentMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onConfirmPayment(confirmPaymentMessage.getPayment(), confirmPaymentMessage.getChallenges());
        });
    }

    public notifyObserverVaultCardResponse(vaultCardResponseMessage: sdk.remotemessage.VaultCardResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onVaultCardResponse(vaultCardResponseMessage.getCard(), vaultCardResponseMessage.getStatus().toString(), vaultCardResponseMessage.getReason());
        });
    }

    public notifyObserversUiState(uiStateMsg: sdk.remotemessage.UiStateMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onUiState(uiStateMsg.getUiState(), uiStateMsg.getUiText(), uiStateMsg.getUiDirection(), uiStateMsg.getInputOptions());
        });
    }

    public notifyObserversCapturePreAuth(cparm: sdk.remotemessage.CapturePreAuthResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onCapturePreAuth(cparm.getStatus(), cparm.getReason(), cparm.getPaymentId(), cparm.getAmount(), cparm.getTipAmount());
        });
    }

    public notifyObserversCloseout(crm: sdk.remotemessage.CloseoutResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onCloseoutResponse(crm.getStatus(), crm.getReason(), crm.getBatch());
        });
    }

    public notifyObserversPendingPaymentsResponse(rpprm: sdk.remotemessage.RetrievePendingPaymentsResponseMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onPendingPaymentsResponse(rpprm.getStatus() == sdk.remotemessage.ResultStatus.SUCCESS, rpprm.getPendingPaymentEntries());
        });
    }

    public notifyObserversTxState(txStateMsg: sdk.remotemessage.TxStateMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onTxState(txStateMsg.getTxState());
        });
    }

    public notifyObserversFinishCancel(msg: sdk.remotemessage.FinishCancelMessage): void {
        this.deviceObservers.forEach((obs) => {
            obs.onFinishCancel(msg.getRequestInfo());
        });
    }

    public notifyObserversFinishOk(msg: sdk.remotemessage.FinishOkMessage): void {
        this.deviceObservers.forEach((obs) => {
            if (msg.getPayment()) {
                obs.onFinishOk(msg.getPayment(), msg.getSignature(), msg.getRequestInfo());
            } else if (msg.getCredit()) {
                obs.onFinishOk(msg.getCredit());
            } else if (msg.getRefund()) {
                obs.onFinishOk(msg.getRefund());
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
        const message: sdk.remotemessage.ShowPaymentReceiptOptionsMessage = new sdk.remotemessage.ShowPaymentReceiptOptionsMessage();
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
        const message: sdk.remotemessage.ThankYouMessage = new sdk.remotemessage.ThankYouMessage();
        this.sendObjectMessage(message);

    }

    /**
     * Show Welcome Screen
     */
    public doShowWelcomeScreen(): void {
        const message: sdk.remotemessage.WelcomeMessage = new sdk.remotemessage.WelcomeMessage();
        this.sendObjectMessage(message);
    }

    /**
     * Signature Verified
     *
     * @param {sdk.payments.Payment} payment
     * @param {boolean} verified
     */
    public doSignatureVerified(payment: sdk.payments.Payment, verified: boolean): void {
        const message: sdk.remotemessage.SignatureVerifiedMessage = new sdk.remotemessage.SignatureVerifiedMessage();
        message.setPayment(payment);
        message.setVerified(verified);
        this.sendObjectMessage(message);
    }

    /**
     * Retrieve Pending Payments
     */
    public doRetrievePendingPayments(): void {
        const message: sdk.remotemessage.RetrievePendingPaymentsMessage = new sdk.remotemessage.RetrievePendingPaymentsMessage();
        this.sendObjectMessage(message);
    }

    /**
     * Terminal Message
     *
     * @param {string} text
     */
    public doTerminalMessage(text: string): void {
        const message: sdk.remotemessage.TerminalMessage = new sdk.remotemessage.TerminalMessage();
        message.setText(text);
        this.sendObjectMessage(message);
    }

    /**
     * Open Cash Drawer
     *
     * @param {string} reason
     * @param {string} deviceId (optional)
     */
    public doOpenCashDrawer(reason: string, deviceId?: string): void {
        const message: sdk.remotemessage.OpenCashDrawerMessage = new sdk.remotemessage.OpenCashDrawerMessage();
        message.setReason(reason);
        if (deviceId) {
            let ptr: sdk.printer.Printer = new sdk.printer.Printer();
            ptr.setId(deviceId);
            message.setPrinter(ptr);
        }
        this.sendObjectMessage(message);
    }

    /**
     * Closeout
     *
     * @param {boolean} allowOpenTabs
     * @param {string} batchId
     */
    public doCloseout(allowOpenTabs: boolean, batchId: string): void {
        const message: sdk.remotemessage.CloseoutRequestMessage = new sdk.remotemessage.CloseoutRequestMessage();
        message.setAllowOpenTabs(allowOpenTabs);
        message.setBatchId(batchId);
        this.sendObjectMessage(message);
    }

    /**
     * Transaction Start
     *
     * @param {sdk.remotemessage.PayIntent} payIntent
     * @param {sdk.remotemessage.Order} order
     * @param {string} requestInfo - request type.
     */
    public doTxStart(payIntent: sdk.remotemessage.PayIntent, order: sdk.order.Order, requestInfo: string): void {
        const message: sdk.remotemessage.TxStartRequestMessage = new sdk.remotemessage.TxStartRequestMessage();
        message.setPayIntent(payIntent);
        message.setOrder(order);
        message.setRequestInfo(requestInfo);
        message.setVersion(2);
        this.sendObjectMessage_opt_version(message);
    }

    /**
     * Tip Adjust Auth
     *
     * @param {string} orderId
     * @param {string} paymentId
     * @param {number} amount
     */
    public doTipAdjustAuth(orderId: string, paymentId: string, amount: number): void {
        const message: sdk.remotemessage.TipAdjustMessage = new sdk.remotemessage.TipAdjustMessage();
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
        const message: sdk.remotemessage.CardDataRequestMessage = new sdk.remotemessage.CardDataRequestMessage();
        message.setPayIntent(payIntent);
        this.sendObjectMessage(message);
    }

    /**
     * Send a message to a running custom activity
     *
     * @param {string} actionId - the id used when the custom action was started
     * @param {string} payload - the message content, unrestricted format
     */
    public doSendMessageToActivity(actionId: string, payload: string): void {
        const message: sdk.remotemessage.ActivityMessageToActivity = new sdk.remotemessage.ActivityMessageToActivity();
        message.setAction(actionId);
        message.setPayload(payload);
        this.sendObjectMessage(message);
    }

    /**
     * Print Text
     *
     * @param {Array<string>} textLines
     */
    public doPrintText(textLines: Array<string>, printRequestId?: string, printDeviceId?: string): void {
        const message: sdk.remotemessage.TextPrintMessage = new sdk.remotemessage.TextPrintMessage();
        message.setTextLines(textLines);
        if (printRequestId) {
            message.setExternalPrintJobId(printRequestId);
        }
        if (printDeviceId) {
            let ptr: sdk.printer.Printer = new sdk.printer.Printer();
            ptr.setId(printDeviceId);
            message.setPrinter(ptr);
        }
        this.sendObjectMessage(message);
    }

    /**
     * Print Image (Bitmap)
     *
     * @param {any} bitmap
     */
    public doPrintImageObject(bitmap: any, printRequestId?: string, printDeviceId?: string): void {
        const message: sdk.remotemessage.ImagePrintMessage = new sdk.remotemessage.ImagePrintMessage();
        // bitmap - HTMLImageElement
        this.imageUtil.getBase64Image(bitmap, (imageString) => {
            message.setPng(imageString);
            if (printRequestId) {
                message.setExternalPrintJobId(printRequestId);
            }
            if (printDeviceId) {
                let ptr: sdk.printer.Printer = new sdk.printer.Printer();
                ptr.setId(printDeviceId);
                message.setPrinter(ptr);
            }
            if (this.isFragmentationSupported(this.remoteMessageVersion)) {
                // We need to be putting this in the attachment instead of the payload (for the remoteMessage)
                let base64Png: string = message.getPng();
                message.setPng(null);
                this.sendObjectMessage_opt_version(message, this.remoteMessageVersion,
                    base64Png, DefaultCloverDevice.BASE64);
            } else {
                this.sendObjectMessage(message);
            }
        });
    }

    /**
     * Printing images from a url from the device is problematic.
     * See - https://jira.dev.clover.com/browse/SEMI-1352
     * and - https://jira.dev.clover.com/browse/SEMI-1377
     *
     * Instead of relying on the device, we can retrieve the image from the URL
     * and call doPrintImageObject instead of doPrintImageUrl. The doPrintImageObject
     * method is more robust (can handle large images via chunking, etc.).
     *
     * @param {string} url
     */
    public doPrintImageUrl(url: string, printRequestId?: string, printDeviceId?: string): void {
        this.imageUtil.loadImageFromURL(url, (image) => {
            this.doPrintImageObject(image, printRequestId, printDeviceId);
        }, (errorMessage) => {
            let deviceErrorEvent: sdk.remotepay.CloverDeviceErrorEvent = new sdk.remotepay.CloverDeviceErrorEvent();
            deviceErrorEvent.setCode(sdk.remotepay.DeviceErrorEventCode.UnknownError);
            deviceErrorEvent.setMessage(errorMessage);
            deviceErrorEvent.setType(sdk.remotepay.ErrorType.EXCEPTION);
            this.notifyObserversDeviceError(deviceErrorEvent);
        });
    }

    public doStartActivity(action: string, payload: string, nonBlocking: boolean): void {
        const request: sdk.remotemessage.ActivityRequest = new sdk.remotemessage.ActivityRequest();
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
        const message: sdk.remotemessage.RefundRequestMessage = new sdk.remotemessage.RefundRequestMessage();
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
        const message: sdk.remotemessage.VaultCardMessage = new sdk.remotemessage.VaultCardMessage();
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
        const message: sdk.remotemessage.CapturePreAuthMessage = new sdk.remotemessage.CapturePreAuthMessage();
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
        const message: sdk.remotemessage.PaymentConfirmedMessage = new sdk.remotemessage.PaymentConfirmedMessage();
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
        const message: sdk.remotemessage.PaymentRejectedMessage = new sdk.remotemessage.PaymentRejectedMessage();
        message.setPayment(payment);
        message.setReason(challenge.getReason());
        this.sendObjectMessage(message);
    }

    /**
     * Discovery request
     */
    public doDiscoveryRequest(): void {
        const drm: sdk.remotemessage.DiscoveryRequestMessage = new sdk.remotemessage.DiscoveryRequestMessage();
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
        const message: sdk.remotemessage.OrderUpdateMessage = new sdk.remotemessage.OrderUpdateMessage();
        message.setOrder(order);

        if (orderOperation) {
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
        const message: sdk.remotemessage.BreakMessage = new sdk.remotemessage.BreakMessage();
        this.sendObjectMessage(message);
    }

    public doRetrieveDeviceStatus(request: sdk.remotepay.RetrieveDeviceStatusRequest): void {
        const message: sdk.remotemessage.RetrieveDeviceStatusRequestMessage = new sdk.remotemessage.RetrieveDeviceStatusRequestMessage();
        message.setSendLastMessage(request.getSendLastMessage());
        this.sendObjectMessage(message);
    }

    public doRetrievePayment(externalPaymentId: string): void {
        const message: sdk.remotemessage.RetrievePaymentRequestMessage = new sdk.remotemessage.RetrievePaymentRequestMessage();
        message.setExternalPaymentId(externalPaymentId);
        this.sendObjectMessage(message);
    }

    public doRetrievePrinters(category?: sdk.printer.PrintCategory): void {
        const message: sdk.remotemessage.GetPrintersRequestMessage = new sdk.remotemessage.GetPrintersRequestMessage();
        if (category) {
            message.setCategory(category);
        }
        this.sendObjectMessage(message);
    }

    public doRetrievePrintJobStatus(printRequestId: string): void {
        const message: sdk.remotemessage.PrintJobStatusRequestMessage = new sdk.remotemessage.PrintJobStatusRequestMessage();
        message.setExternalPrintJobId(printRequestId);
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
    public sendObjectMessage(remoteMessage: sdk.remotemessage.Message): string {
        return this.sendObjectMessage_opt_version(remoteMessage);
    }

    private sendObjectMessage_opt_version(remoteMessage: sdk.remotemessage.Message, remoteMessageVersion?: number, attachment?: string, attachmentEncoding?: string): string {
        return this.buildRemoteMessages(remoteMessage, remoteMessageVersion, attachment, attachmentEncoding); // this now sends the messages and returns the ID
    }

    private buildBaseRemoteMessage(remoteMessage: sdk.remotemessage.Message, remoteMessageVersion?: number): sdk.remotemessage.RemoteMessage {
        remoteMessageVersion = this.getRemoteMessageVersion(remoteMessage, remoteMessageVersion);

        // Make sure the message is not null
        if (remoteMessage == null) {
            this.logger.debug('Message is null');
            return null;
        }

        // Check the message method
        this.logger.info(remoteMessage.toString());
        if (remoteMessage.getMethod() == null) {
            this.logger.error('Invalid Message', new Error('Invalid Message: ' + remoteMessage.toString()));
            return null;
        }

        // Check the application id
        if (this.applicationId == null) {
            this.logger.error('Invalid ApplicationID: ' + this.applicationId);
            throw new Error('Invalid applicationId');
        }

        const messageId: string = (++DefaultCloverDevice.id) + '';
        const remoteMessageToReturn: sdk.remotemessage.RemoteMessage = new sdk.remotemessage.RemoteMessage();
        remoteMessageToReturn.setId(messageId);
        remoteMessageToReturn.setType(sdk.remotemessage.RemoteMessageType.COMMAND);
        remoteMessageToReturn.setPackageName(this.packageName);
        remoteMessageToReturn.setMethod(remoteMessage.getMethod().toString());
        remoteMessageToReturn.setVersion(remoteMessageVersion);
        return remoteMessageToReturn;
    }

    private getRemoteMessageVersion(remoteMessage: sdk.remotemessage.Message, remoteMessageVersion?: number) {
        return remoteMessageVersion || remoteMessage.getVersion() || DefaultCloverDevice.DEFAULT_REMOTE_MESSAGE_VERSION;
    }

    /**
     * Special serialization handling
     * The top level elements should not have the "elements" wrapper on collections (arrays).
     * sdk.remotemessage.Message instances are the only ones this needs to happen for.  This
     * is the result of the manner in which the serialization/deserialization happens in the
     * Android code.  The top level objects are not (de)serialized by a
     * com.clover.sdk.GenericClient#extractListOther
     * (in the Clover common repo).  The GenericClient is the tool that adds the elements
     * wrapper.  The top level objects are (de)serialized by themselves
     * com.clover.remote.message.Message#fromJsonString
     */
    private addSuppressElementsWrapper(message: sdk.remotemessage.Message): sdk.remotemessage.Message {
        for (var fieldKey in message) {
            var metaInfo = message.getMetaInfo(fieldKey);
            if (metaInfo && (metaInfo.type == Array)) {
                message[fieldKey].suppressElementsWrapper = true;
            }
        }
        return message;
    }

    protected buildRemoteMessageToSend(message: sdk.remotemessage.Message, remoteMessageVersion?: number): sdk.remotemessage.RemoteMessage {
        const remoteMessage: sdk.remotemessage.RemoteMessage = this.buildBaseRemoteMessage(message, remoteMessageVersion);
        message = this.addSuppressElementsWrapper(message);
        remoteMessage.setPayload(JSON.stringify(message, DefaultCloverDevice.stringifyClover));
        return remoteMessage;
    }

    protected buildRemoteMessages(message: sdk.remotemessage.Message, remoteMessageVersion?: number, attachment?: string, attachmentEncoding?: string): string {
        const remoteMessage: sdk.remotemessage.RemoteMessage = this.buildBaseRemoteMessage(message, remoteMessageVersion);
        message = this.addSuppressElementsWrapper(message);
        if (attachmentEncoding) {
            remoteMessage.setAttachmentEncoding(attachmentEncoding);
        }
        let messagePayload = JSON.stringify(message, DefaultCloverDevice.stringifyClover);

        if (this.isFragmentationSupported(remoteMessageVersion)) {
            // fragmenting is possible
            const payloadTooLarge = (messagePayload ? messagePayload.length : 0) > this.maxMessageSizeInChars;
            if (payloadTooLarge || attachment) { // need to fragment
                if (attachment && attachment.length > CloverConnector.MAX_PAYLOAD_SIZE) {
                    this.logger.error('Error sending message - payload size is greater than the maximum allowed.');
                    return null;
                }
                let fragmentIndex: number = 0;
                // fragmenting loop for payload
                while (messagePayload.length > 0) {
                    remoteMessage.setLastFragment(false);
                    if (messagePayload.length <= this.maxMessageSizeInChars) {
                        remoteMessage.setPayload(messagePayload);
                        messagePayload = "";
                        // If the attachment is null at this point, then this is the last fragment
                        remoteMessage.setLastFragment(attachment == null);
                    } else {
                        remoteMessage.setPayload(messagePayload.substr(0, this.maxMessageSizeInChars));
                        messagePayload = messagePayload.substr(this.maxMessageSizeInChars);
                    }
                    remoteMessage.setFragmentIndex(fragmentIndex++);
                    this.sendRemoteMessage(remoteMessage);
                } //end fragment payload loop
                remoteMessage.setPayload(null);
                if (attachment) {
                    //fragmenting loop for attachment
                    if (attachmentEncoding == DefaultCloverDevice.BASE64) {
                        remoteMessage.setAttachmentEncoding(DefaultCloverDevice.BASE64_ATTACHMENT);
                        while (attachment.length > 0) {
                            remoteMessage.setLastFragment(false);
                            if (attachment.length <= this.maxMessageSizeInChars) {
                                remoteMessage.setAttachment(attachment);
                                attachment = "";
                                remoteMessage.setLastFragment(true);
                            } else {
                                remoteMessage.setAttachment(attachment.substr(0, this.maxMessageSizeInChars));
                                attachment = attachment.substr(this.maxMessageSizeInChars);
                            }
                            remoteMessage.setFragmentIndex(fragmentIndex++);
                            this.sendRemoteMessage(remoteMessage);
                        } //end fragment attachment loop
                    } else {
                        // We got an attachment, but no encoding, complain.
                        this.logger.error('Attachment on message, but no encoding specified.  No idea how to send it.');
                        // TODO:  Probably a good idea to throw here, but  then we need to handle that in the top level.  Leave for later.
                    }
                }
            } else { // no need to fragment
                remoteMessage.setPayload(messagePayload);
                if (attachment) {
                    remoteMessage.setAttachment(attachment);
                }
                this.sendRemoteMessage(remoteMessage);
            }
        } else {
            // fragmenting is not possible, just send as is
            remoteMessage.setPayload(messagePayload);
            this.sendRemoteMessage(remoteMessage);
        }
        return remoteMessage.getId();
    }

    protected static stringifyClover(key: string, value: any): any {
        // If the element is an array, and it does NOT have the suppressElementsWrapper property,
        // and the key is NOT "elements", then add the elements wrapper object
        if (Array.isArray(value) &&
            !value.hasOwnProperty("suppressElementsWrapper") &&
            (key != "elements")) {
            //converts array into the format that clover devices expect
            //from) foo : []
            //to) foo : {elements : []}
            return {elements: value};
        }
        return value;
    }

    protected sendRemoteMessage(remoteMessage: sdk.remotemessage.RemoteMessage): void {
        const message = JSON.stringify(remoteMessage);
        if (this.transport) {
            this.logger.debug(`Sending: ${message}`);
            this.transport.sendMessage(message);
        } else {
            this.logger.error(`Cannot send message, transport is null: ${message}`);
        }
    }

    /**
     * If the remote message version is 2, fragmentation is supported.
     *
     * @param {number} version
     * @returns {boolean}
     */
    private isFragmentationSupported(remoteMessageVersion: number) {
        return remoteMessageVersion > 1;
    }
}
