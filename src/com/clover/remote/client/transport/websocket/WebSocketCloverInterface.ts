/**
 * WebSocket Clover Interface
 * 
 * Interface to connect a websocket implementation to.
 */
export interface WebSocketCloverInterface {
    /**
     * Return the endpoint for this websocket
     * 
     * @returns endpoint
     */
    getEndpoint(): string;

    /**
     * Handle connection open event
     * 
     * @param {any} event - The open event
     */
    onOpen(event: any): void;

    /**
     * Handle message received event
     * 
     * @param {any} event - The message event
     */
    onMessage(event: any): void;

    /**
     * Handle an error event
     * 
     * @param {any} event - The error event
     */
    onError(event: any): void;

    /**
     * Handle websocket closed event
     * 
     * @param {any} event - The close event
     */
    onClose(event: any): void;

    /**
     * Indicates whether the websocket connection is open or not
     * 
     * @returns true or false
     */
    isOpen(): boolean;

    /**
     * Indicates whether the websocket is connecting or not
     * 
     * @returns true or false
     */
    isConnecting(): boolean;

    /**
     * Send a message over the websocket
     * 
     * @param {any} message
     */
    send(message: any): void;

    /**
     * Close the websocket connection
     */
    close(): void;
}
