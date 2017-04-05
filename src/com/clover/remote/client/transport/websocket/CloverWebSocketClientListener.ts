import {CloverWebSocketClient} from './CloverWebSocketClient';

/**
 * A websocket listener interface definition.
 */
export interface CloverWebSocketClientListener {
    onOpen(ws: CloverWebSocketClient);

    onNotResponding(ws: CloverWebSocketClient);

    onPingResponding(ws: CloverWebSocketClient);

    onClose(ws: CloverWebSocketClient, code: number, reason: String, remote: boolean);

    onMessage(ws: CloverWebSocketClient, message: string);

    connectionError(cloverNVWebSocketClient: CloverWebSocketClient);

    onSendError(payloadText: string);
}