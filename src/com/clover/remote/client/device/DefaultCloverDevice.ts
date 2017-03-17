import sdk = require('remote-pay-cloud-api');
import {CloverDevice} from './CloverDevice';
import {CloverTransport} from '../transport/CloverTransport';
import {ObjectMessageSender} from '../transport/ObjectMessageSender';
import {CloverTransportObserver} from '../transport/CloverTransportObserver';
import {CloverDeviceConfiguration} from './CloverDeviceConfiguration';
import { Logger } from '../util/Logger';

/**
 * Default Clover Device
 * 
 * This is a default implementation of the clover device.
 */
export class DefaultCloverDevice extends CloverDevice implements CloverTransportObserver, ObjectMessageSender {
    private static REMOTE_SDK: string = 'com.clover.cloverconnector.java:1.1.1.B';

    private logger: Logger = Logger.create();

    private static id: number = 0;

    private msgIdToTask: { [key: string]: Function; } = {};

    constructor(configuration: CloverDeviceConfiguration);
	constructor(packageName: string, transport: CloverTransport, applicationId: string);
    constructor(configOrPackageName: any, transport?: CloverTransport, applicationId?: string) {
        super(
            typeof(configOrPackageName) == 'string' ?
                configOrPackageName :
                configOrPackageName.getMessagePackageName(),
            typeof(configOrPackageName) == 'string' ?
                transport :
                configOrPackageName.getCloverTransport(),
            typeof(configOrPackageName) == 'string' ?
                applicationId :
                configOrPackageName.getApplicationId());
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

    /**
     * Called when a raw message is received from the device
     * 
     * @param {string} message - the raw message from the device
     */
    public onMessage(message: string): void {
        this.logger.debug('onMessage: ' + message);
        try {
            // Parse the message
            let rMessage: sdk.remotemessage.RemoteMessage = JSON.parse(message);
            let method: sdk.remotemessage.Method = null;
            try {
                let msgType: sdk.remotemessage.RemoteMessage.Type = rMessage.type;
                if (msgType == sdk.remotemessage.RemoteMessage.Type.PING) {
                    this.sendPong(rMessage);
                }
                else if (msgType == sdk.remotemessage.RemoteMessage.Type.COMMAND) {
                    method = sdk.remotemessage.Method[rMessage.method];
                    if (method == null) {
                        this.logger.error('Unsupported method type: ' + rMessage.method);
                    }
                    else {
                        switch(method) {
                            case sdk.remotemessage.Method.BREAK:
                                break;
                            case sdk.remotemessage.Method.CASHBACK_SELECTED:
                                this.notifyObserversCashbackSelected(<sdk.remotemessage.CashBackSelectedMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.ACK:
                                this.notifyObserverAck(<sdk.remotemessage.AcknowledgementMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.DISCOVERY_RESPONSE:
                                this.logger.debug('Got a Discovery Response');
                                this.notifyObserversReady(this.transport, <sdk.remotemessage.DiscoveryResponseMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.CONFIRM_PAYMENT_MESSAGE:
                                this.notifyObserversConfirmPayment(<sdk.remotemessage.ConfirmPaymentMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.FINISH_CANCEL:
                                this.notifyObserversFinishCancel();
                                break;
                            case sdk.remotemessage.Method.FINISH_OK:
                                this.notifyObserversFinishOk(<sdk.remotemessage.FinishOkMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.KEY_PRESS:
                                this.notifyObserversKeyPressed(<sdk.remotemessage.KeyPressMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.ORDER_ACTION_RESPONSE:
                                break;
                            case sdk.remotemessage.Method.PARTIAL_AUTH:
                                this.notifyObserversPartialAuth(<sdk.remotemessage.PartialAuthMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.PAYMENT_VOIDED:
                                // currently this only gets called during a TX, so falls outside our current process flow
                                //PaymentVoidedMessage vpMessage = (PaymentVoidedMessage) Message.fromJsonString(rMessage.payload);
                                //this.notifyObserversPaymentVoided(vpMessage.payment, vpMessage.voidReason, ResultStatus.SUCCESS, null, null);
                                break;
                            case sdk.remotemessage.Method.TIP_ADDED:
                                this.notifyObserversTipAdded(<sdk.remotemessage.TipAddedMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.TX_START_RESPONSE:
                                this.notifyObserverTxStart(<sdk.remotemessage.TxStartResponseMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.TX_STATE:
                                this.notifyObserversTxState(<sdk.remotemessage.TxStateMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.UI_STATE:
                                this.notifyObserversUiState(<sdk.remotemessage.UiStateMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.VERIFY_SIGNATURE:
                                this.notifyObserversVerifySignature(<sdk.remotemessage.VerifySignatureMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.REFUND_RESPONSE:
                                this.notifyObserversPaymentRefundResponse(<sdk.remotemessage.RefundResponseMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.REFUND_REQUEST:
                                //Outbound no-op
                                break;
                            case sdk.remotemessage.Method.TIP_ADJUST_RESPONSE:
                                this.notifyObserversTipAdjusted(<sdk.remotemessage.TipAdjustResponseMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.VAULT_CARD_RESPONSE:
                                this.notifyObserverVaultCardResponse(<sdk.remotemessage.VaultCardResponseMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.CAPTURE_PREAUTH_RESPONSE:
                                this.notifyObserversCapturePreAuth(<sdk.remotemessage.CapturePreAuthResponseMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.CLOSEOUT_RESPONSE:
                                this.notifyObserversCloseout(<sdk.remotemessage.CloseoutResponseMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.RETRIEVE_PENDING_PAYMENTS_RESPONSE:
                                this.notifyObserversPendingPaymentsResponse(<sdk.remotemessage.RetrievePendingPaymentsResponseMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.CARD_DATA_RESPONSE:
                                this.notifyObserversReadCardData(<sdk.remotemessage.CardDataResponseMessage>JSON.parse(rMessage.payload));
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
                                this.notifyObserversPrintCredit(<sdk.remotemessage.CreditPrintMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.PRINT_CREDIT_DECLINE:
                                this.notifyObserversPrintCreditDecline(<sdk.remotemessage.DeclineCreditPrintMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.PRINT_PAYMENT:
                                this.notifyObserversPrintPayment(<sdk.remotemessage.PaymentPrintMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.PRINT_PAYMENT_DECLINE:
                                this.notifyObserversPrintPaymentDecline(<sdk.remotemessage.DeclinePaymentPrintMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.PRINT_PAYMENT_MERCHANT_COPY:
                                this.notifyObserversPrintMerchantCopy(<sdk.remotemessage.PaymentPrintMerchantCopyMessage>JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.REFUND_PRINT_PAYMENT:
                                this.notifyObserversPrintMessage(<sdk.remotemessage.RefundPaymentPrintMessage>JSON.parse(rMessage.payload));
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
                            default:
                                this.logger.error('COMMAND not supported with method: ' + rMessage.method);
                                break;
                        }
                    }
                }
                else {
                    this.logger.error('Unsupported message type: ' + rMessage.type.toString());
                }
            }
            catch(eM) {
                this.logger.error('Error processing message: ' + rMessage.payload, eM);
            }
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
        let remoteMessage: sdk.remotemessage.RemoteMessage = new sdk.remotemessage.RemoteMessage(null, sdk.remotemessage.RemoteMessage.Type.PONG, this.packageName, null, null, DefaultCloverDevice.REMOTE_SDK, this.applicationId);
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
     */
    private notifyObserversReady(transport: CloverTransport, drm: sdk.remotemessage.DiscoveryResponseMessage): void {
		this.deviceObservers.forEach((obs) => {
			obs.onDeviceReady(this, drm);
		});
    }

    private notifyObserverAck(ackMessage: sdk.remotemessage.AcknowledgementMessage): void {
        let ackTask = this.msgIdToTask[ackMessage.sourceMessageId];
        if (ackTask !== null) {
            delete this.msgIdToTask[ackMessage.sourceMessageId];
            ackTask.call(null);
        }
        // go ahead and notify listeners of the ACK
        this.deviceObservers.forEach((obs) => {
            obs.onMessageAck(ackMessage.sourceMessageId);
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
            obs.onTxStartResponse(txsrm.result, txsrm.externalPaymentId);
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
            obs.onVaultCardResponse(vaultCardResponseMessage.card, vaultCardResponseMessage.status.tostring(), vaultCardResponseMessage.reason);
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

    public notifyObserversFinishCancel(): void {
        this.deviceObservers.forEach((obs) => {
            obs.onFinishCancel();
        });
    }

    public notifyObserversFinishOk(msg: sdk.remotemessage.FinishOkMessage): void {
        this.deviceObservers.forEach((obs) => {
            if (msg.payment !== null) {
                obs.onFinishOk(msg.payment, msg.signature);
            } else if (msg.credit !== null) {
                obs.onFinishOk(msg.credit);
            } else if (msg.refund !== null) {
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
        this.sendObjectMessage(new sdk.remotemessage.ShowPaymentReceiptOptionsMessage(orderId, paymentId, 2));
    }

	/**
	 * Key Press
	 * 
	 * @param {KeyPress} keyPress 
	 */
	public doKeyPress(keyPress: sdk.remotemessage.KeyPress): void {
        this.sendObjectMessage(new sdk.remotemessage.KeyPressMessage(keyPress));
    }

	/**
	 * Show Thank You Screen
	 */
	public doShowThankYouScreen(): void {
        this.sendObjectMessage(new sdk.remotemessage.ThankYouMessage());
    }

	/**
	 * Show Welcome Screen
	 */
	public doShowWelcomeScreen(): void {
        this.sendObjectMessage(new sdk.remotemessage.WelcomeMessage());
    }

	/**
	 * Signature Verified
	 * 
	 * @param {Payment} payment 
	 * @param {boolean} verified 
	 */
	public doSignatureVerified(payment: sdk.payments.Payment, verified: boolean): void {
        this.sendObjectMessage(new sdk.remotemessage.SignatureVerifiedMessage(payment, verified));
    }

	/**
	 * Retrieve Pending Payments
	 */
	public doRetrievePendingPayments(): void {
        this.sendObjectMessage(new sdk.remotemessage.RetrievePendingPaymentsMessage());
    }

	/**
	 * Terminal Message
	 * 
	 * @param {string} text 
	 */
	public doTerminalMessage(text: string): void {
        this.sendObjectMessage(new sdk.remotemessage.TerminalMessage(text));
    }

	/**
	 * Open Cash Drawer
	 * 
	 * @param {string} reason 
	 */
	public doOpenCashDrawer(reason: string): void {
        this.sendObjectMessage(new sdk.remotemessage.OpenCashDrawerMessage(reason));
    }

	/**
	 * Closeout
	 * 
	 * @param {boolean} allowOpenTabs 
	 * @param {string} batchId 
	 */
	public doCloseout(allowOpenTabs: boolean, batchId: string): void {
        this.sendObjectMessage(new sdk.remotemessage.CloseoutRequestMessage(allowOpenTabs, batchId));
    }

	/**
	 * Transaction Start
	 * 
	 * @param {PayIntent} payIntent 
	 * @param {Order} order 
	 * @param {boolean} suppressTipScreen 
	 */
	public doTxStart(payIntent: sdk.remotemessage.PayIntent, order: sdk.order.Order, suppressTipScreen: boolean): void {
        this.sendObjectMessage(new sdk.remotemessage.TxStartRequestMessage(payIntent, order, suppressTipScreen));
    }

	/**
	 * Tip Adjust Auth
	 * 
	 * @param {string} orderId 
	 * @param {string} paymentId 
	 * @param {number} amount 
	 */
	public doTipAdjustAuth(orderId: string, paymentId: string, amount: number): void {
        this.sendObjectMessage(new sdk.remotemessage.TipAdjustMessage(orderId, paymentId, amount));
    }

	/**
	 * Read Cart Data
	 * 
	 * @param {PayIntent} payment 
	 */
	public doReadCardData(payment: sdk.remotemessage.PayIntent): void {
        this.sendObjectMessage(new sdk.remotemessage.CardDataRequestMessage(payment));
    }

	/**
	 * Print Text
	 * 
	 * @param {Array<string>} textLines 
	 */
	public doPrintText(textLines: Array<string>): void {
        this.sendObjectMessage(new sdk.remotemessage.TextPrintMessage(textLines));
    }

	/**
	 * Print Image (Bitmap)
	 * 
	 * @param {byte[]} bitmap 
	 */
	public doPrintImage(bitmap: number[]): void;
	/**
	 * Print Image (URL)
	 * 
	 * @param {string} url 
	 */
	public doPrintImage(url: string): void;
	public doPrintImage(value: number[] | string): void {
        this.sendObjectMessage(new sdk.remotemessage.ImagePrintMessage(value));
    }

	/**
	 * Void Payment
	 * 
	 * @param {Payment} payment 
	 * @param {VoidReason} reason 
	 */
	public doVoidPayment(payment: sdk.payments.Payment, reason: sdk.order.VoidReason): void {
        let msgId: string = this.sendObjectMessage(new sdk.remotemessage.VoidPaymentMessage(payment, reason));

        if (!this.supportsAcks()) {
            this.notifyObserversPaymentVoided(payment, reason, sdk.remotemessage.ResultStatus.SUCCESS, null, null);
        }
        else {
            // we will send back response after we get an ack
            this.msgIdToTask[msgId] = () => {
                this.notifyObserversPaymentVoided(payment, reason, sdk.remotemessage.ResultStatus.SUCCESS, null, null);
            };
        }
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
        this.sendObjectMessage_opt_version(new sdk.remotemessage.RefundRequestMessage(orderId, paymentId, amount, fullRefund), 2);
    }

	/**
	 * Vault Card
	 * 
	 * @param {number} cardEntryMethods 
	 */
	public doVaultCard(cardEntryMethods: number): void {
        this.sendObjectMessage(new sdk.remotemessage.VaultCardMessage(cardEntryMethods));
    }

	/**
	 * Capture Auth
	 * 
	 * @param {string} paymentId 
	 * @param {number} amount 
	 * @param {number} tipAmount 
	 */
	public doCaptureAuth(paymentId: string, amount: number, tipAmount: number): void {
        this.sendObjectMessage(new sdk.remotemessage.CapturePreAuthMessage(paymentId, amount, tipAmount));
    }

	/**
	 * Accept Payment
	 * 
	 * @param {Payment} payment 
	 */
	public doAcceptPayment(payment: sdk.payments.Payment): void {
        this.sendObjectMessage(new sdk.remotemessage.PaymentConfirmedMessage(payment));
    }

	/**
	 * Reject Payment
	 * 
	 * @param {Payment} payment 
	 * @param {Challenge} challenge 
	 */
	public doRejectPayment(payment: sdk.payments.Payment, challenge: sdk.base.Challenge): void {
        this.sendObjectMessage(new sdk.remotemessage.PaymentRejectedMessage(payment, challenge.reason));
    }

	/**
	 * Discovery request
	 */
	public doDiscoveryRequest(): void {
        this.sendObjectMessage(new sdk.remotemessage.DiscoverRequestMessage(false));
    }

	/**
	 * Order Update
	 * 
	 * @param {DisplayOrder} order 
	 * @param {any} orderOperation 
	 */
	public doOrderUpdate(order: sdk.order.DisplayOrder, orderOperation: any): void {
        if (orderOperation instanceof sdk.order.operation.DiscountsAddedOperation ||
            orderOperation instanceof sdk.order.operation.DiscountsDeletedOperation ||
            orderOperation instanceof sdk.order.operation.LineItemsAddedOperation ||
            orderOperation instanceof sdk.order.operation.LineItemsDeletedOperation ||
            orderOperation instanceof sdk.order.operation.OrderDeletedOperation) {
            this.sendObjectMessage(new sdk.remotemessage.OrderUpdateMessage(order, orderOperation));
        }
        else {
            this.sendObjectMessage(new sdk.remotemessage.OrderUpdateMessage(order));
        }
    }

	/**
	 * Reset Device
	 */
	public doResetDevice(): void {
        this.sendObjectMessage(new sdk.remotemessage.BreakMessage());
    }

	/**
	 * Dispose
	 */
	public dispose(): void {
        this.deviceObservers.splice(0, this.deviceObservers.length);
        if (this.transport !== null) {
            this.transport.dispose();
            this.transport = null;
        }
    }

    /**
     * Send the message to the device using the transport
     * 
     * @param message 
     * @param version
     */
    public sendObjectMessage(message: sdk.remotemessage.Message): string {
        return this.sendObjectMessage_opt_version(message);
    }
    private sendObjectMessage_opt_version(message: sdk.remotemessage.Message, version?: number): string {
        // Default to version 1
        if (version == null) version = 1;

        // Make sure the message is not null
        if (message == null) {
            this.logger.debug('Message is null');
            return null;
        }

        // Check the message method
        this.logger.info(message.tostring());
        if (message.method == null) {
            this.logger.error('Invalid Message', new Error('Invalid Message: ' + message.tostring()));
            return null;
        }

        // Check the application id
        if (this.applicationId == null) {
            this.logger.error('Invalid ApplicationID: ' + this.applicationId);
            throw new Error('Invalid applicationId');
        }

        let messageId: string = (++DefaultCloverDevice.id) + '';
        let remoteMessage: sdk.remotemessage.RemoteMessage = new sdk.remotemessage.RemoteMessage(messageId, sdk.remotemessage.RemoteMessage.Type.COMMAND, this.packageName, message.method.tostring(), JSON.stringify(message), DefaultCloverDevice.REMOTE_SDK, this.applicationId);
        this.sendRemoteMessage(remoteMessage);
        return messageId;
    }

    private sendRemoteMessage(remoteMessage: sdk.remotemessage.RemoteMessage): void {
        let msg = JSON.stringify(remoteMessage);
        this.logger.debug('Sending: ' + msg);
        this.transport.sendMessage(msg);
    }
}
