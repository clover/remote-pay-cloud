export {Logger} from "../dist/definitions/com/clover/remote/client/util/Logger";
export {DebugConfig} from "../dist/definitions/com/clover/remote/client/util/DebugConfig";
export {HttpSupport} from "../dist/definitions/com/clover/util/HttpSupport";
export {ImageUtil} from "../dist/definitions/com/clover/util/ImageUtil";

export {CloverConnector} from "../dist/definitions/com/clover/remote/client/CloverConnector";
export {CloverDeviceFactory} from "../dist/definitions/com/clover/remote/client/device/CloverDeviceFactory";
export {CloverDeviceConfiguration} from "../dist/definitions/com/clover/remote/client/device/CloverDeviceConfiguration";

export {WebSocketCloverDeviceConfiguration} from "../dist/definitions/com/clover/remote/client/device/WebSocketCloverDeviceConfiguration";
export {WebSocketPairedCloverDeviceConfiguration, WebSocketPairedCloverDeviceConfigurationBuilder} from "../dist/definitions/com/clover/remote/client/device/WebSocketPairedCloverDeviceConfiguration";
export {WebSocketCloudCloverDeviceConfiguration, WebSocketCloudCloverDeviceConfigurationBuilder} from "../dist/definitions/com/clover/remote/client/device/WebSocketCloudCloverDeviceConfiguration";

export {CloverTransport} from "../dist/definitions/com/clover/remote/client/transport/CloverTransport";
export {CloverTransportObserver} from "../dist/definitions/com/clover/remote/client/transport/CloverTransportObserver";
export {WebSocketCloverTransport} from "../dist/definitions/com/clover/remote/client/transport/websocket/WebSocketCloverTransport";
export {WebSocketState} from "../dist/definitions/com/clover/websocket/WebSocketState";
export {CloverWebSocketInterface} from "../dist/definitions/com/clover/websocket/CloverWebSocketInterface";
export {BrowserWebSocketImpl} from "../dist/definitions/com/clover/websocket/BrowserWebSocketImpl";

export {CloverConnectorFactoryBuilder} from "../dist/definitions/com/clover/remote/client/CloverConnectorFactoryBuilder";
export {ICloverConnectorFactory} from "../dist/definitions/com/clover/remote/client/ICloverConnectorFactory";
export {CloverConnectorFactory} from "../dist/definitions/com/clover/remote/client/CloverConnectorFactory";
export {CardEntryMethods} from "../dist/definitions/com/clover/remote/client/CardEntryMethods";

export * from "remote-pay-cloud-api";

export var CloverID : {
    getNewId(): string;
    isValidBase32Id(id: string): boolean;
    guid(): string;
};

