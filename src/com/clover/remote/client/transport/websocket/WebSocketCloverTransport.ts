import sdk = require('remote-pay-cloud-api');

import {RemoteMessageParser} from '../../../../json/RemoteMessageParser';
import {CloverWebSocketClient} from './CloverWebSocketClient';
import {CloverTransport} from '../CloverTransport';
import {Logger} from '../../util/Logger';
import {CloverWebSocketClientListener} from "./CloverWebSocketClientListener";

/**
 * WebSocket Clover Transport
 *
 * This is a websocket implementation of the Clover Transport.
 */
export abstract class WebSocketCloverTransport extends CloverTransport implements CloverWebSocketClientListener {

    // Create a logger
    protected logger: Logger = Logger.create();

    private reconnectDelay: number = 3000;

    /**
     * We do not wantto start up multiple reconnect threads.  This should alleviate that
     * @type {boolean}
     */
    private reconnecting: boolean = false;

    /**
     * Subclasses need to set this at times.
     *
     * @param newValue
     */
    protected setReconnecting(newValue: boolean): void {
        this.reconnecting = newValue;
    }

    webSocket: CloverWebSocketClient;

    private messageQueue: Array<string> = new Array<string>();

    /**
     * This is the WebSocket implementation.  This is odd,
     * but it is how we can keep ourselves from being tied to a browser.
     *
     * A NodeJS app that uses this library would pass in a different
     * object than a browser implementation.  NodeJS has an object that
     * satisfies the requirements of the WebSocket (looks the same).
     *
     * https://www.npmjs.com/package/websocket
     */
    webSocketImplClass: any;

    status: string = "Disconnected";
    /**
     * prevent reconnects if shutdown was requested
     */
    shutdown: boolean = false;

    messageParser: RemoteMessageParser;

    reconnector = function () {
        if (!this.shutdown) {
            try {
                this.initialize();
            } catch (e) {
                this.reconnect();
            }
        }
    }.bind(this);

    public reconnect(): void {
        // If we are already reconnecting, do not start another.
        if (!this.reconnecting) {
            this.setReconnecting(true);
            if (this.shutdown) {
                this.logger.debug("Not attempting to reconnect, shutdown...");
                return;
            }
            setTimeout(this.reconnector, this.reconnectDelay);
        } else {
            this.logger.debug("Already attempting to reconnect, will ignore additional request");
        }
    }

    public reset(): void {
        try {
            // By sending this close, the "onClose" will be fired, which will try to reconnect.
            this.webSocket.close(
                WebSocketCloverTransport.CloverWebSocketCloseCode.RESET_CLOSE_CODE.code,
                WebSocketCloverTransport.CloverWebSocketCloseCode.RESET_CLOSE_CODE.reason);
        } catch (e) {
            this.logger.error('error resetting transport.', e);
        }
    }

    public static METHOD: string = "method";
    public static PAYLOAD: string = "payload";

    public constructor(heartbeatInterval: number,
                       reconnectDelay: number,
                       retriesUntilDisconnect: number,
                       webSocketImplClass: any) {
        super();
        this.reconnectDelay = Math.max(0, reconnectDelay);
        this.webSocketImplClass = webSocketImplClass;
        // from WebSocketCloverDeviceConfiguration.getMessagePackageName, which needs to be changeable
        // 'com.clover.remote_protocol_broadcast.app'
        this.messageParser = RemoteMessageParser.getDefaultInstance();
        const messageSenderId = setInterval(() => {
            if (!this.shutdown) {
                this.sendMessageThread();
            } else {
                clearInterval(messageSenderId);
            }
        }, 100);
    }

    /**
     * Since this is javascript, this is not an actual thread, but it
     * represents threading the sending of the messages.
     *
     * This just checks the message queue for elements, then sends using
     * a FIFO pattern.
     */
    private sendMessageThread(): void {
        // If we do not have any messages, then don't try to send them
        if (this.messageQueue.length > 0) {
            // let's see if we have connectivity
            if (this.webSocket != null && this.webSocket.isOpen()) {
                // Hold the message in case we need to put it back on the queue
                let nextMsg: string = this.messageQueue.shift();
                try {
                    if (this.webSocket.getBufferedAmount() > 0) {
                        this.messageQueue.unshift(nextMsg);
                    } else {
                        this.webSocket.send(nextMsg);
                    }
                } catch (e) {
                    // Failed to send, put it back
                    this.messageQueue.unshift(nextMsg);
                    this.reconnect();
                }
            } else {
                this.reconnect();
            }
        }
    }

    /**
     * Pushes the message to the queue for sending by the send 'thread'
     *
     * @param message - a string message to send on the websocket
     * @returns {number} negative 1 (-1)
     */
    public sendMessage(message: string): number {
        if (!this.shutdown) {
            this.messageQueue.push(message);
        } else {
            this.logger.debug('In process of shutting down, ignoring ' + message);
        }
        return -1;
    }

    private clearWebsocket(): void { // synchronized
        if (this.webSocket != null) {
            this.webSocket.clearListener();
        }
        this.webSocket = null;
    }


    protected abstract initialize(): void

    /**
     * Called from subclasses at the end of the constructor.
     *
     * @param deviceEndpoint
     */
    protected initializeWithUri(deviceEndpoint: string): void { // synchronized
        // Primary end to the reconnect attempts
        this.setReconnecting(false);
        if (this.webSocket != null) {
            if (this.webSocket.isOpen() || this.webSocket.isConnecting()) {
                return;
            } else {
                this.clearWebsocket();
            }
        }
        this.webSocket = new CloverWebSocketClient(deviceEndpoint, this, 5000, this.webSocketImplClass);
        this.webSocket.connect();
        this.logger.debug('connection attempt done.');
    }

    public dispose(): void {
        this.shutdown = true;

        // Attempt to clear out messages already in the send queue
        this.drainQueue();

        if (this.webSocket != null) {
            this.notifyDeviceDisconnected();
            try {
                this.webSocket.close();
            } catch (e) {
                this.logger.error('error disposing of transport.', e);
            }
        }
        this.clearWebsocket();
    }

    private drainQueue(): void {
        // Attempt to finish off the queue
        while (this.messageQueue.length > 0) {
            // let's see if we have connectivity
            if (this.webSocket != null && this.webSocket.isOpen()) {
                let nextMsg: string = this.messageQueue.shift();
                try {
                    this.webSocket.send(nextMsg);
                } catch (e) {
                    this.logger.debug('In process of shutting down, an error occurred trying to drain the message queue.  The messages unsent are ' + this.messageQueue);
                    break;
                }
            } else {
                this.logger.debug('In process of shutting down, the websocket became disconnected.  The messages unsent are ' + this.messageQueue);
                break;
            }
        }
    }

    public connectionError(ws: CloverWebSocketClient, message?: string): void {
        this.logger.debug('Connection error...');
        if (this.webSocket == ws) {
            for (let observer of this.observers) {
                observer.onDeviceDisconnected(this, message);
                let deviceErrorEvent: sdk.remotepay.CloverDeviceErrorEvent = new sdk.remotepay.CloverDeviceErrorEvent();
                deviceErrorEvent.setType(sdk.remotepay.ErrorType.COMMUNICATION);
                deviceErrorEvent.setCode(sdk.remotepay.DeviceErrorEventCode.NotConnected);
                deviceErrorEvent.setCause(null);
                deviceErrorEvent.setMessage(message);
                observer.onDeviceError(deviceErrorEvent)
            }
        }
    }

    public onNotResponding(ws: CloverWebSocketClient): void {
        this.logger.debug('Not Responding...');
        if (this.webSocket == ws) {
            for (let observer of this.observers) {
                this.logger.debug('onNotResponding');
                observer.onDeviceDisconnected(this);
            }
        }
    }

    public onPingResponding(ws: CloverWebSocketClient): void {
        this.logger.debug("Ping Responding");
        if (this.webSocket == ws) {
            for (let observer of this.observers) {
                this.logger.debug("onPingResponding");
                observer.onDeviceReady(this);
            }
        }
    }

    public onOpen(ws: CloverWebSocketClient): void {
        this.logger.debug("Open...");
        if (this.webSocket == ws) {
            // notify connected
            this.notifyDeviceConnected();
        }
    }

    public onClose(ws: CloverWebSocketClient, code: number, reason: string, remote: boolean): void {
        this.logger.debug("onClose: " + reason + ", remote? " + remote);

        if (this.webSocket == ws) {
            if (!this.webSocket.isClosing()) {
                this.webSocket.clearListener();
                if (!this.webSocket.isClosed()) {
                    this.webSocket.close();
                }
            }
            this.clearWebsocket();
            for (let observer of this.observers) {
                this.logger.debug("onClose");
                observer.onDeviceDisconnected(this);
            }
            if (!this.shutdown) {
                this.reconnect();
            }
        }
    }

    /**
     * Messed up way ts/js does function overloading
     *
     * @param ws
     * @param message
     */
    public onMessage(ws: CloverWebSocketClient, message: string): void;
    public onMessage(message: string): void;
    public onMessage(wsOrMessage: any, messageOnly?: string): void {
        if (typeof wsOrMessage == 'string') {
            super.onMessage(wsOrMessage);
        } else {
            this.onMessage_cwscl(wsOrMessage, messageOnly);
        }
    }

    public onMessage_cwscl(ws: CloverWebSocketClient, message: string): void { // CloverWebSocketClientListener
        if (this.webSocket == ws) {
            for (let observer of this.observers) {
                this.logger.debug("Got message: " + message);
                observer.onMessage(message);
            }
        }
    }

    public onSendError(payloadText: string): void {
       this.logger.error("WebSocketCloverTransport: An error occurred sending a message.");
    }
}

export namespace WebSocketCloverTransport {
    export class CloverWebSocketCloseCode {
        // See https://tools.ietf.org/html/rfc6455#section-7.4
        public code: number;
        public reason: string;

        // Using 4000 as a reset code.
        static RESET_CLOSE_CODE: CloverWebSocketCloseCode = new CloverWebSocketCloseCode(4000, "Reset requested");

        constructor(code: number, reason: string) {
            this.code = code;
            this.reason = reason;
        }
    }
}

