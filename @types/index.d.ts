export {Logger} from "../src/com/clover/remote/client/util/Logger";
export {DebugConfig} from "../src/com/clover/remote/client/util/DebugConfig";
export {HttpSupport} from "../src/com/clover/util/HttpSupport";
export {ImageUtil} from "../src/com/clover/util/ImageUtil";

export {CloverConnector} from "../src/com/clover/remote/client/CloverConnector";
export {CloverDeviceFactory} from "../src/com/clover/remote/client/device/CloverDeviceFactory";
export {CloverDeviceConfiguration} from "../src/com/clover/remote/client/device/CloverDeviceConfiguration";

export {WebSocketCloverDeviceConfiguration} from "../src/com/clover/remote/client/device/WebSocketCloverDeviceConfiguration";
export {WebSocketPairedCloverDeviceConfiguration} from "../src/com/clover/remote/client/device/WebSocketPairedCloverDeviceConfiguration";
export {WebSocketCloudCloverDeviceConfiguration} from "../src/com/clover/remote/client/device/WebSocketCloudCloverDeviceConfiguration";

export {CloverTransport} from "../src/com/clover/remote/client/transport/CloverTransport";
export {CloverTransportObserver} from "../src/com/clover/remote/client/transport/CloverTransportObserver";
export {WebSocketCloverTransport} from "../src/com/clover/remote/client/transport/websocket/WebSocketCloverTransport";
export {WebSocketState} from "../src/com/clover/websocket/WebSocketState";
export {CloverWebSocketInterface} from "../src/com/clover/websocket/CloverWebSocketInterface";
export {BrowserWebSocketImpl} from "../src/com/clover/websocket/BrowserWebSocketImpl";

export {CloverConnectorFactoryBuilder} from "../src/com/clover/remote/client/CloverConnectorFactoryBuilder";
export {ICloverConnectorFactory} from "../src/com/clover/remote/client/ICloverConnectorFactory";
export {CloverConnectorFactory} from "../src/com/clover/remote/client/CloverConnectorFactory";
export {CardEntryMethods} from "../src/com/clover/remote/client/CardEntryMethods";

export {remotepay} from "remote-pay-cloud-api";

export var CloverID : {
    getNewId(): string;
    isValidBase32Id(id: string): boolean;
    guid(): string;
}

