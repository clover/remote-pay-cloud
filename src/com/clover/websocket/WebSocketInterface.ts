import {WebSocketListener} from './WebSocketListener'
import {WebSocketState} from './WebSocketState';

/**
 * WebSocket Clover Interface
 * 
 * Interface to connect a websocket implementation to.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
 */
export interface WebSocketInterface {

    // constructor
    // [Constructor(in DOMString url, in optional DOMString protocols)]
    // [Constructor(in DOMString url, in optional DOMString[] protocols)]

    // readonly attribute DOMString url;
    getUrl(): String;

    // ready state
    //const unsigned short CONNECTING: number = 0;
    //const unsigned short OPEN = 1;
    //const unsigned short CLOSING = 2;
    //const unsigned short CLOSED = 3;
    //readonly attribute unsigned short readyState;
    getReadyState(): WebSocketState;

    // readonly attribute unsigned long bufferedAmount;
    getBufferedAmount(): number;

    // networking
    //attribute Function onopen;
    setOnOpen(onFunction):void;
    //attribute Function onmessage;
    setOnMessage(onFunction):void;
    //attribute Function onerror;
    setOnError(onFunction):void;
    //attribute Function onclose;
    setOnClose(onFunction):void;

    //addWebSocketListener(listener: WebSocketListener): void;
    //removeWebSocketListener(listener: WebSocketListener): boolean;
    //getWebSocketListeners(): WebSocketListener[];

    // readonly attribute DOMString protocol;
    getProtocol(): string;

    send(data: string): void;
    close(): void;
}
