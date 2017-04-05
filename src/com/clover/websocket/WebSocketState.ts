/**
 * WebSocket state.
 *
 * <p>
 * The initial state of a {@link WebSocket} instance is
 * <b><code>CREATED</code></b>. {@code WebSocket.}{@link
    * WebSocket#connect() connect()} method is allowed to be called
 * only when the state is {@code CREATED}. If the method is called
 * when the state is not {@code CREATED}, a {@link WebSocketException}
 * is thrown (its error code is {@link WebSocketError#NOT_IN_CREATED_STATE
 * NOT_IN_CREATED_STATE}).
 * </p>
 *
 * <p>
 * At the beginning of the implementation of {@code connect()} method,
 * the state is changed to <b><code>CONNECTING</code></b>, and then
 * {@link WebSocketListener#onStateChanged(WebSocket, WebSocketState)
 * onStateChanged()} method of each registered listener ({@link
    * WebSocketListener}) is called.
 * </p>
 *
 * <p>
 * After the state is changed to {@code CONNECTING}, a WebSocket
 * <a href="https://tools.ietf.org/html/rfc6455#section-4">opening
 * handshake</a> is performed. If an error occurred during the
 * handshake, the state is changed to {@code CLOSED} ({@code
 * onStateChanged()} method of listeners is called) and a {@code
 * WebSocketException} is thrown. There are various reasons for
 * handshake failure. If you want to know the reason, get the error
 * code ({@link WebSocketError}) by calling {@link
    * WebSocketException#getError() getError()} method of the exception.
 * </p>
 *
 * <p>
 * After the opening handshake succeeded, the state is changed to
 * <b><code>OPEN</code></b>. Listeners' {@code onStateChanged()} method
 * and {@link WebSocketListener#onConnected(WebSocket, java.util.Map)
 * onConnected()} method are called in this order. Note that {@code
 * onConnected()} method is called by another thread.
 * </p>
 *
 * <p>
 * Upon either sending or receiving a <a href=
 * "https://tools.ietf.org/html/rfc6455#section-5.5.1">close frame</a>,
 * a <a href="https://tools.ietf.org/html/rfc6455#section-7">closing
 * handshake</a> is started. The state is changed to
 * <b><code>CLOSING</code></b> and {@code onStateChanged()} method of
 * listeners is called.
 * </p>
 *
 * <p>
 * After the client and the server have exchanged close frames, the
 * state is changed to <b><code>CLOSED</code></b>. Listeners'
 * {@code onStateChanged()} method and {@link
    * WebSocketListener#onDisconnected(WebSocket, WebSocketFrame,
 * WebSocketFrame, boolean) onDisconnected()} method is called in
 * this order.
 * </p>
 */
export enum WebSocketState
{
    /**
     * This value does not exist in the web
     *
     * The initial state of a {@link WebSocket} instance.
     */
    // CREATED,

    /**
     * An <a href="https://tools.ietf.org/html/rfc6455#section-4">opening
     * handshake</a> is being performed.
     */
    CONNECTING,


    /**
     * The WebSocket connection is established (= the <a href=
     * "https://tools.ietf.org/html/rfc6455#section-4">opening handshake</a>
     * has succeeded) and usable.
     */
    OPEN,


    /**
     * A <a href="https://tools.ietf.org/html/rfc6455#section-7">closing
     * handshake</a> is being performed.
     */
    CLOSING,


    /**
     * The WebSocket connection is closed.
     */
    CLOSED
}
