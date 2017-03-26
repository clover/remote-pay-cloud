"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var sdk = require("remote-pay-cloud-api");
var CloverDevice_1 = require("./CloverDevice");
var Logger_1 = require("../util/Logger");
/**
 * Default Clover Device
 *
 * This is a default implementation of the clover device.
 */
var DefaultCloverDevice = (function (_super) {
    __extends(DefaultCloverDevice, _super);
    function DefaultCloverDevice(configOrPackageName, transport, applicationId) {
        var _this = _super.call(this, typeof (configOrPackageName) == 'string' ?
            configOrPackageName :
            configOrPackageName.getMessagePackageName(), typeof (configOrPackageName) == 'string' ?
            transport :
            configOrPackageName.getCloverTransport(), typeof (configOrPackageName) == 'string' ?
            applicationId :
            configOrPackageName.getApplicationId()) || this;
        _this.logger = Logger_1.Logger.create();
        _this.msgIdToTask = {};
        _this.transport.subscribe(_this);
        _this.transport.setObjectMessageSender(_this);
        return _this;
    }
    /**
     * Device is there but not yet ready for use
     *
     * @param {CloverTransport} transport - the transport holding the notifications
     */
    DefaultCloverDevice.prototype.onDeviceConnected = function (transport) {
        this.notifyObserversConnected(transport);
    };
    /**
     * Device is there and ready for use
     *
     * @param {CloverTransport} transport - the transport holding the notifications
     */
    DefaultCloverDevice.prototype.onDeviceReady = function (transport) {
        this.doDiscoveryRequest();
    };
    /**
     * Device is not there anymore
     *
     * @param {CloverTransport} transport - the transport holding the notifications
     */
    DefaultCloverDevice.prototype.onDeviceDisconnected = function (transport) {
        this.notifyObserversDisconnected(transport);
    };
    DefaultCloverDevice.prototype.getApplicationId = function () {
        return this.applicationId;
    };
    /**
     * Called when a raw message is received from the device
     *
     * @param {string} message - the raw message from the device
     */
    DefaultCloverDevice.prototype.onMessage = function (message) {
        this.logger.debug('onMessage: ' + message);
        try {
            // Parse the message
            var rMessage = JSON.parse(message);
            var method = null;
            try {
                var msgType = rMessage.type;
                if (msgType == sdk.remotemessage.RemoteMessage.Type.PING) {
                    this.sendPong(rMessage);
                }
                else if (msgType == sdk.remotemessage.RemoteMessage.Type.COMMAND) {
                    method = sdk.remotemessage.Method[rMessage.method];
                    if (method == null) {
                        this.logger.error('Unsupported method type: ' + rMessage.method);
                    }
                    else {
                        switch (method) {
                            case sdk.remotemessage.Method.BREAK:
                                break;
                            case sdk.remotemessage.Method.CASHBACK_SELECTED:
                                this.notifyObserversCashbackSelected(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.ACK:
                                this.notifyObserverAck(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.DISCOVERY_RESPONSE:
                                this.logger.debug('Got a Discovery Response');
                                this.notifyObserversReady(this.transport, JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.CONFIRM_PAYMENT_MESSAGE:
                                this.notifyObserversConfirmPayment(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.FINISH_CANCEL:
                                this.notifyObserversFinishCancel();
                                break;
                            case sdk.remotemessage.Method.FINISH_OK:
                                this.notifyObserversFinishOk(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.KEY_PRESS:
                                this.notifyObserversKeyPressed(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.ORDER_ACTION_RESPONSE:
                                break;
                            case sdk.remotemessage.Method.PARTIAL_AUTH:
                                this.notifyObserversPartialAuth(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.PAYMENT_VOIDED:
                                // currently this only gets called during a TX, so falls outside our current process flow
                                //PaymentVoidedMessage vpMessage = (PaymentVoidedMessage) Message.fromJsonString(rMessage.payload);
                                //this.notifyObserversPaymentVoided(vpMessage.payment, vpMessage.voidReason, ResultStatus.SUCCESS, null, null);
                                break;
                            case sdk.remotemessage.Method.TIP_ADDED:
                                this.notifyObserversTipAdded(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.TX_START_RESPONSE:
                                this.notifyObserverTxStart(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.TX_STATE:
                                this.notifyObserversTxState(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.UI_STATE:
                                this.notifyObserversUiState(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.VERIFY_SIGNATURE:
                                this.notifyObserversVerifySignature(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.REFUND_RESPONSE:
                                this.notifyObserversPaymentRefundResponse(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.REFUND_REQUEST:
                                //Outbound no-op
                                break;
                            case sdk.remotemessage.Method.TIP_ADJUST_RESPONSE:
                                this.notifyObserversTipAdjusted(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.VAULT_CARD_RESPONSE:
                                this.notifyObserverVaultCardResponse(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.CAPTURE_PREAUTH_RESPONSE:
                                this.notifyObserversCapturePreAuth(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.CLOSEOUT_RESPONSE:
                                this.notifyObserversCloseout(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.RETRIEVE_PENDING_PAYMENTS_RESPONSE:
                                this.notifyObserversPendingPaymentsResponse(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.CARD_DATA_RESPONSE:
                                this.notifyObserversReadCardData(JSON.parse(rMessage.payload));
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
                                this.notifyObserversPrintCredit(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.PRINT_CREDIT_DECLINE:
                                this.notifyObserversPrintCreditDecline(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.PRINT_PAYMENT:
                                this.notifyObserversPrintPayment(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.PRINT_PAYMENT_DECLINE:
                                this.notifyObserversPrintPaymentDecline(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.PRINT_PAYMENT_MERCHANT_COPY:
                                this.notifyObserversPrintMerchantCopy(JSON.parse(rMessage.payload));
                                break;
                            case sdk.remotemessage.Method.REFUND_PRINT_PAYMENT:
                                this.notifyObserversPrintMessage(JSON.parse(rMessage.payload));
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
            catch (eM) {
                this.logger.error('Error processing message: ' + rMessage.payload, eM);
            }
        }
        catch (e) {
            this.logger.error(e);
        }
    };
    /**
     * Send a PONG response
     *
     * @param pingMessage
     */
    DefaultCloverDevice.prototype.sendPong = function (pingMessage) {
        var remoteMessage = new sdk.remotemessage.RemoteMessage(null, sdk.remotemessage.RemoteMessage.Type.PONG, this.packageName, null, null, DefaultCloverDevice.REMOTE_SDK, this.applicationId);
        this.logger.debug('Sending PONG...');
        this.sendRemoteMessage(remoteMessage);
    };
    /**
     * Notify the observers that the device is connected
     *
     * @param transport
     */
    DefaultCloverDevice.prototype.notifyObserversConnected = function (transport) {
        var _this = this;
        this.deviceObservers.forEach(function (obs) {
            obs.onDeviceConnected(_this);
        });
    };
    /**
     * Notify the observers that the device has disconnected
     *
     * @param transport
     */
    DefaultCloverDevice.prototype.notifyObserversDisconnected = function (transport) {
        var _this = this;
        this.deviceObservers.forEach(function (obs) {
            obs.onDeviceDisconnected(_this);
        });
    };
    /**
     * Notify the observers that the device is ready
     *
     * @param transport
     */
    DefaultCloverDevice.prototype.notifyObserversReady = function (transport, drm) {
        var _this = this;
        this.deviceObservers.forEach(function (obs) {
            obs.onDeviceReady(_this, drm);
        });
    };
    DefaultCloverDevice.prototype.notifyObserverAck = function (ackMessage) {
        var ackTask = this.msgIdToTask[ackMessage.sourceMessageId];
        if (ackTask !== null) {
            delete this.msgIdToTask[ackMessage.sourceMessageId];
            ackTask.call(null);
        }
        // go ahead and notify listeners of the ACK
        this.deviceObservers.forEach(function (obs) {
            obs.onMessageAck(ackMessage.sourceMessageId);
        });
    };
    DefaultCloverDevice.prototype.notifyObserversReadCardData = function (rcdrm) {
        this.deviceObservers.forEach(function (obs) {
            obs.onReadCardResponse(rcdrm.status, rcdrm.reason, rcdrm.cardData);
        });
    };
    DefaultCloverDevice.prototype.notifyObserversPrintMessage = function (rppm) {
        this.deviceObservers.forEach(function (obs) {
            obs.onPrintRefundPayment(rppm.payment, rppm.order, rppm.refund);
        });
    };
    DefaultCloverDevice.prototype.notifyObserversPrintMerchantCopy = function (ppmcm) {
        this.deviceObservers.forEach(function (obs) {
            obs.onPrintMerchantReceipt(ppmcm.payment);
        });
    };
    DefaultCloverDevice.prototype.notifyObserversPrintPaymentDecline = function (dppm) {
        this.deviceObservers.forEach(function (obs) {
            obs.onPrintPaymentDecline(dppm.payment, dppm.reason);
        });
    };
    DefaultCloverDevice.prototype.notifyObserversPrintPayment = function (ppm) {
        this.deviceObservers.forEach(function (obs) {
            obs.onPrintPayment(ppm.payment, ppm.order);
        });
    };
    DefaultCloverDevice.prototype.notifyObserversPrintCredit = function (cpm) {
        this.deviceObservers.forEach(function (obs) {
            obs.onPrintCredit(cpm.credit);
        });
    };
    DefaultCloverDevice.prototype.notifyObserversPrintCreditDecline = function (dcpm) {
        this.deviceObservers.forEach(function (obs) {
            obs.onPrintCreditDecline(dcpm.credit, dcpm.reason);
        });
    };
    //---------------------------------------------------
    /// <summary>
    /// this is for a payment refund
    /// </summary>
    /// <param name="rrm"></param>
    DefaultCloverDevice.prototype.notifyObserversPaymentRefundResponse = function (rrm) {
        this.deviceObservers.forEach(function (obs) {
            obs.onPaymentRefundResponse(rrm.orderId, rrm.paymentId, rrm.refund, rrm.code);
        });
    };
    DefaultCloverDevice.prototype.notifyObserversKeyPressed = function (keyPress) {
        this.deviceObservers.forEach(function (obs) {
            obs.onKeyPressed(keyPress.keyPress);
        });
    };
    DefaultCloverDevice.prototype.notifyObserversCashbackSelected = function (cbSelected) {
        this.deviceObservers.forEach(function (obs) {
            obs.onCashbackSelected(cbSelected.cashbackAmount);
        });
    };
    DefaultCloverDevice.prototype.notifyObserversTipAdded = function (tipAdded) {
        this.deviceObservers.forEach(function (obs) {
            obs.onTipAdded(tipAdded.tipAmount);
        });
    };
    DefaultCloverDevice.prototype.notifyObserverTxStart = function (txsrm) {
        this.deviceObservers.forEach(function (obs) {
            obs.onTxStartResponse(txsrm.result, txsrm.externalPaymentId);
        });
    };
    DefaultCloverDevice.prototype.notifyObserversTipAdjusted = function (tarm) {
        this.deviceObservers.forEach(function (obs) {
            obs.onAuthTipAdjusted(tarm.paymentId, tarm.amount, tarm.success);
        });
    };
    DefaultCloverDevice.prototype.notifyObserversPartialAuth = function (partialAuth) {
        this.deviceObservers.forEach(function (obs) {
            obs.onPartialAuth(partialAuth.partialAuthAmount);
        });
    };
    DefaultCloverDevice.prototype.notifyObserversPaymentVoided = function (payment, voidReason, result, reason, message) {
        this.deviceObservers.forEach(function (obs) {
            obs.onPaymentVoided(payment, voidReason, result, reason, message);
        });
    };
    DefaultCloverDevice.prototype.notifyObserversVerifySignature = function (verifySigMsg) {
        this.deviceObservers.forEach(function (obs) {
            obs.onVerifySignature(verifySigMsg.payment, verifySigMsg.signature);
        });
    };
    DefaultCloverDevice.prototype.notifyObserversConfirmPayment = function (confirmPaymentMessage) {
        this.deviceObservers.forEach(function (obs) {
            obs.onConfirmPayment(confirmPaymentMessage.payment, confirmPaymentMessage.challenges);
        });
    };
    DefaultCloverDevice.prototype.notifyObserverVaultCardResponse = function (vaultCardResponseMessage) {
        this.deviceObservers.forEach(function (obs) {
            obs.onVaultCardResponse(vaultCardResponseMessage.card, vaultCardResponseMessage.status.tostring(), vaultCardResponseMessage.reason);
        });
    };
    DefaultCloverDevice.prototype.notifyObserversUiState = function (uiStateMsg) {
        this.deviceObservers.forEach(function (obs) {
            obs.onUiState(uiStateMsg.uiState, uiStateMsg.uiText, uiStateMsg.uiDirection, uiStateMsg.inputOptions);
        });
    };
    DefaultCloverDevice.prototype.notifyObserversCapturePreAuth = function (cparm) {
        this.deviceObservers.forEach(function (obs) {
            obs.onCapturePreAuth(cparm.status, cparm.reason, cparm.paymentId, cparm.amount, cparm.tipAmount);
        });
    };
    DefaultCloverDevice.prototype.notifyObserversCloseout = function (crm) {
        this.deviceObservers.forEach(function (obs) {
            obs.onCloseoutResponse(crm.status, crm.reason, crm.batch);
        });
    };
    DefaultCloverDevice.prototype.notifyObserversPendingPaymentsResponse = function (rpprm) {
        this.deviceObservers.forEach(function (obs) {
            obs.onPendingPaymentsResponse(rpprm.status == sdk.remotemessage.ResultStatus.SUCCESS, rpprm.pendingPaymentEntries);
        });
    };
    DefaultCloverDevice.prototype.notifyObserversTxState = function (txStateMsg) {
        this.deviceObservers.forEach(function (obs) {
            obs.onTxState(txStateMsg.txState);
        });
    };
    DefaultCloverDevice.prototype.notifyObserversFinishCancel = function () {
        this.deviceObservers.forEach(function (obs) {
            obs.onFinishCancel();
        });
    };
    DefaultCloverDevice.prototype.notifyObserversFinishOk = function (msg) {
        this.deviceObservers.forEach(function (obs) {
            if (msg.payment !== null) {
                obs.onFinishOk(msg.payment, msg.signature);
            }
            else if (msg.credit !== null) {
                obs.onFinishOk(msg.credit);
            }
            else if (msg.refund !== null) {
                obs.onFinishOk(msg.refund);
            }
        });
    };
    /**
     * Show Payment Receipt Screen
     *
     * @param {string} orderId
     * @param {string} paymentId
     */
    DefaultCloverDevice.prototype.doShowPaymentReceiptScreen = function (orderId, paymentId) {
        this.sendObjectMessage(new sdk.remotemessage.ShowPaymentReceiptOptionsMessage(orderId, paymentId, 2));
    };
    /**
     * Key Press
     *
     * @param {KeyPress} keyPress
     */
    DefaultCloverDevice.prototype.doKeyPress = function (keyPress) {
        this.sendObjectMessage(new sdk.remotemessage.KeyPressMessage(keyPress));
    };
    /**
     * Show Thank You Screen
     */
    DefaultCloverDevice.prototype.doShowThankYouScreen = function () {
        this.sendObjectMessage(new sdk.remotemessage.ThankYouMessage());
    };
    /**
     * Show Welcome Screen
     */
    DefaultCloverDevice.prototype.doShowWelcomeScreen = function () {
        this.sendObjectMessage(new sdk.remotemessage.WelcomeMessage());
    };
    /**
     * Signature Verified
     *
     * @param {Payment} payment
     * @param {boolean} verified
     */
    DefaultCloverDevice.prototype.doSignatureVerified = function (payment, verified) {
        this.sendObjectMessage(new sdk.remotemessage.SignatureVerifiedMessage(payment, verified));
    };
    /**
     * Retrieve Pending Payments
     */
    DefaultCloverDevice.prototype.doRetrievePendingPayments = function () {
        this.sendObjectMessage(new sdk.remotemessage.RetrievePendingPaymentsMessage());
    };
    /**
     * Terminal Message
     *
     * @param {string} text
     */
    DefaultCloverDevice.prototype.doTerminalMessage = function (text) {
        this.sendObjectMessage(new sdk.remotemessage.TerminalMessage(text));
    };
    /**
     * Open Cash Drawer
     *
     * @param {string} reason
     */
    DefaultCloverDevice.prototype.doOpenCashDrawer = function (reason) {
        this.sendObjectMessage(new sdk.remotemessage.OpenCashDrawerMessage(reason));
    };
    /**
     * Closeout
     *
     * @param {boolean} allowOpenTabs
     * @param {string} batchId
     */
    DefaultCloverDevice.prototype.doCloseout = function (allowOpenTabs, batchId) {
        this.sendObjectMessage(new sdk.remotemessage.CloseoutRequestMessage(allowOpenTabs, batchId));
    };
    /**
     * Transaction Start
     *
     * @param {PayIntent} payIntent
     * @param {Order} order
     * @param {boolean} suppressTipScreen
     */
    DefaultCloverDevice.prototype.doTxStart = function (payIntent, order, suppressTipScreen) {
        this.sendObjectMessage(new sdk.remotemessage.TxStartRequestMessage(payIntent, order, suppressTipScreen));
    };
    /**
     * Tip Adjust Auth
     *
     * @param {string} orderId
     * @param {string} paymentId
     * @param {number} amount
     */
    DefaultCloverDevice.prototype.doTipAdjustAuth = function (orderId, paymentId, amount) {
        this.sendObjectMessage(new sdk.remotemessage.TipAdjustMessage(orderId, paymentId, amount));
    };
    /**
     * Read Cart Data
     *
     * @param {PayIntent} payment
     */
    DefaultCloverDevice.prototype.doReadCardData = function (payment) {
        this.sendObjectMessage(new sdk.remotemessage.CardDataRequestMessage(payment));
    };
    /**
     * Print Text
     *
     * @param {Array<string>} textLines
     */
    DefaultCloverDevice.prototype.doPrintText = function (textLines) {
        this.sendObjectMessage(new sdk.remotemessage.TextPrintMessage(textLines));
    };
    DefaultCloverDevice.prototype.doPrintImage = function (value) {
        this.sendObjectMessage(new sdk.remotemessage.ImagePrintMessage(value));
    };
    /**
     * Void Payment
     *
     * @param {Payment} payment
     * @param {VoidReason} reason
     */
    DefaultCloverDevice.prototype.doVoidPayment = function (payment, reason) {
        var _this = this;
        var msgId = this.sendObjectMessage(new sdk.remotemessage.VoidPaymentMessage(payment, reason));
        if (!this.supportsAcks()) {
            this.notifyObserversPaymentVoided(payment, reason, sdk.remotemessage.ResultStatus.SUCCESS, null, null);
        }
        else {
            // we will send back response after we get an ack
            this.msgIdToTask[msgId] = function () {
                _this.notifyObserversPaymentVoided(payment, reason, sdk.remotemessage.ResultStatus.SUCCESS, null, null);
            };
        }
    };
    /**
     * Payment Refund
     *
     * @param {string} orderId
     * @param {string} paymentId
     * @param {number} amount
     * @param {boolean} fullRefund
     */
    DefaultCloverDevice.prototype.doPaymentRefund = function (orderId, paymentId, amount, fullRefund) {
        this.sendObjectMessage_opt_version(new sdk.remotemessage.RefundRequestMessage(orderId, paymentId, amount, fullRefund), 2);
    };
    /**
     * Vault Card
     *
     * @param {number} cardEntryMethods
     */
    DefaultCloverDevice.prototype.doVaultCard = function (cardEntryMethods) {
        this.sendObjectMessage(new sdk.remotemessage.VaultCardMessage(cardEntryMethods));
    };
    /**
     * Capture Auth
     *
     * @param {string} paymentId
     * @param {number} amount
     * @param {number} tipAmount
     */
    DefaultCloverDevice.prototype.doCaptureAuth = function (paymentId, amount, tipAmount) {
        this.sendObjectMessage(new sdk.remotemessage.CapturePreAuthMessage(paymentId, amount, tipAmount));
    };
    /**
     * Accept Payment
     *
     * @param {Payment} payment
     */
    DefaultCloverDevice.prototype.doAcceptPayment = function (payment) {
        this.sendObjectMessage(new sdk.remotemessage.PaymentConfirmedMessage(payment));
    };
    /**
     * Reject Payment
     *
     * @param {Payment} payment
     * @param {Challenge} challenge
     */
    DefaultCloverDevice.prototype.doRejectPayment = function (payment, challenge) {
        this.sendObjectMessage(new sdk.remotemessage.PaymentRejectedMessage(payment, challenge.reason));
    };
    /**
     * Discovery request
     */
    DefaultCloverDevice.prototype.doDiscoveryRequest = function () {
        this.sendObjectMessage(new sdk.remotemessage.DiscoverRequestMessage(false));
    };
    /**
     * Order Update
     *
     * @param {DisplayOrder} order
     * @param {any} orderOperation
     */
    DefaultCloverDevice.prototype.doOrderUpdate = function (order, orderOperation) {
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
    };
    /**
     * Reset Device
     */
    DefaultCloverDevice.prototype.doResetDevice = function () {
        this.sendObjectMessage(new sdk.remotemessage.BreakMessage());
    };
    /**
     * Dispose
     */
    DefaultCloverDevice.prototype.dispose = function () {
        this.deviceObservers.splice(0, this.deviceObservers.length);
        if (this.transport !== null) {
            this.transport.dispose();
            this.transport = null;
        }
    };
    /**
     * Send the message to the device using the transport
     *
     * @param message
     * @param version
     */
    DefaultCloverDevice.prototype.sendObjectMessage = function (message) {
        return this.sendObjectMessage_opt_version(message);
    };
    DefaultCloverDevice.prototype.sendObjectMessage_opt_version = function (message, version) {
        // Default to version 1
        if (version == null)
            version = 1;
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
        var messageId = (++DefaultCloverDevice.id) + '';
        var remoteMessage = new sdk.remotemessage.RemoteMessage(messageId, sdk.remotemessage.RemoteMessage.Type.COMMAND, this.packageName, message.method.tostring(), JSON.stringify(message), DefaultCloverDevice.REMOTE_SDK, this.applicationId);
        this.sendRemoteMessage(remoteMessage);
        return messageId;
    };
    DefaultCloverDevice.prototype.sendRemoteMessage = function (remoteMessage) {
        var msg = JSON.stringify(remoteMessage);
        this.logger.debug('Sending: ' + msg);
        this.transport.sendMessage(msg);
    };
    return DefaultCloverDevice;
}(CloverDevice_1.CloverDevice));
DefaultCloverDevice.REMOTE_SDK = 'com.clover.cloverconnector.java:1.1.1.B';
DefaultCloverDevice.id = 0;
exports.DefaultCloverDevice = DefaultCloverDevice;

//# sourceMappingURL=../../../../../maps/com/clover/remote/client/device/DefaultCloverDevice.js.map
