// These exports expose the v1 interface and objects.
var sdk = require("remote-pay-cloud-api");

var base = sdk.base;
var customers = sdk.customers;
var device = sdk.device;
var hours = sdk.hours;
var inventory = sdk.inventory;
var order = sdk.order;
var payments = sdk.payments;
var printer = sdk.printer;
var remotepay = sdk.remotepay;
var remotemessage = sdk.remotemessage;
var loyalty = sdk.loyalty;

// These exports expose the beta method of using the Clover device
var CloverID = require("./CloverID.js");

// These exports expose the CloverConnector and supporting objects
var CloverConnector = require('./dist/com/clover/remote/client/CloverConnector.js').CloverConnector;
var CloverDeviceFactory = require('./dist/com/clover/remote/client/device/CloverDeviceFactory.js').CloverDeviceFactory;

var Logger = require('./dist/com/clover/remote/client/util/Logger.js').Logger;
var DebugConfig = require('./dist/com/clover/remote/client/util/DebugConfig.js').DebugConfig;
var HttpSupport = require('./dist/com/clover/util/HttpSupport.js').HttpSupport;
var ImageUtil = require('./dist/com/clover/util/ImageUtil.js').ImageUtil;

var WebSocketCloverDeviceConfiguration = require('./dist/com/clover/remote/client/device/WebSocketCloverDeviceConfiguration.js').WebSocketCloverDeviceConfiguration;
var WebSocketPairedCloverDeviceConfiguration = require('./dist/com/clover/remote/client/device/WebSocketPairedCloverDeviceConfiguration.js').WebSocketPairedCloverDeviceConfiguration;
var WebSocketPairedCloverDeviceConfigurationBuilder = require('./dist/com/clover/remote/client/device/WebSocketPairedCloverDeviceConfiguration.js').WebSocketPairedCloverDeviceConfigurationBuilder;
var WebSocketCloudCloverDeviceConfiguration = require('./dist/com/clover/remote/client/device/WebSocketCloudCloverDeviceConfiguration.js').WebSocketCloudCloverDeviceConfiguration;
var WebSocketCloudCloverDeviceConfigurationBuilder = require('./dist/com/clover/remote/client/device/WebSocketCloudCloverDeviceConfiguration.js').WebSocketCloudCloverDeviceConfigurationBuilder;

var CloverTransport = require('./dist/com/clover/remote/client/transport/CloverTransport.js').CloverTransport;
var CloverTransportObserver = require('./dist/com/clover/remote/client/transport/CloverTransportObserver.js').CloverTransportObserver;
var WebSocketCloverTransport = require('./dist/com/clover/remote/client/transport/websocket/WebSocketCloverTransport.js').WebSocketCloverTransport;
var WebSocketState = require('./dist/com/clover/websocket/WebSocketState.js').WebSocketState;
var CloverWebSocketInterface = require('./dist/com/clover/websocket/CloverWebSocketInterface.js').CloverWebSocketInterface;
var BrowserWebSocketImpl = require('./dist/com/clover/websocket/BrowserWebSocketImpl.js').BrowserWebSocketImpl;
var JSONToCustomObject = require('./dist/com/clover/json/JSONToCustomObject.js').JSONToCustomObject;
var Version = require('./dist/com/clover/Version.js').Version;

var CloverConnectorFactoryBuilder = require('./dist/com/clover/remote/client/CloverConnectorFactoryBuilder.js').CloverConnectorFactoryBuilder;
var ICloverConnectorFactory = require('./dist/com/clover/remote/client/ICloverConnectorFactory.js').ICloverConnectorFactory;
var LoyaltyDataTypes = require('./dist/com/clover/remote/client/faux_enums/LoyaltyDataTypes.js').LoyaltyDataTypes;
// Following is exported explicitly because of backwards compatibility
var CloverConnectorFactory = require('./dist/com/clover/remote/client/CloverConnectorFactory.js').CloverConnectorFactory;
var CardEntryMethods = require('./dist/com/clover/remote/client/CardEntryMethods.js').CardEntryMethods;

// Export all of the pieces.
module.exports = {
    sdk: sdk,
    base: base,
    customers: customers,
    device: device,
    hours: hours,
    inventory: inventory,
    order: order,
    payments: payments,
    printer: printer,
    remotepay: remotepay,
    remotemessage: remotemessage,
    CloverID: CloverID,
    DebugConfig: DebugConfig,
    version: Version.CLOVER_CLOUD_SDK_VERSION,
    CloverConnector: CloverConnector,
    CloverDeviceFactory: CloverDeviceFactory,
    CloverTransport: CloverTransport,
    CloverTransportObserver: CloverTransportObserver,
    WebSocketCloverTransport: WebSocketCloverTransport,
    CloverWebSocketInterface: CloverWebSocketInterface,
    BrowserWebSocketImpl: BrowserWebSocketImpl,
    JSONToCustomObject: JSONToCustomObject,
    ImageUtil: ImageUtil,
    Logger: Logger,
    HttpSupport: HttpSupport,
    WebSocketCloverDeviceConfiguration: WebSocketCloverDeviceConfiguration,
    WebSocketPairedCloverDeviceConfiguration: WebSocketPairedCloverDeviceConfiguration,
    WebSocketPairedCloverDeviceConfigurationBuilder: WebSocketPairedCloverDeviceConfigurationBuilder,
    WebSocketCloudCloverDeviceConfiguration: WebSocketCloudCloverDeviceConfiguration,
    WebSocketCloudCloverDeviceConfigurationBuilder: WebSocketCloudCloverDeviceConfigurationBuilder,
    WebSocketState: WebSocketState,
    CloverConnectorFactoryBuilder: CloverConnectorFactoryBuilder,
    ICloverConnectorFactory: ICloverConnectorFactory,
    CloverConnectorFactory: CloverConnectorFactory,
    CardEntryMethods: CardEntryMethods,
    LoyaltyDataTypes: LoyaltyDataTypes,
    Version: Version,
    loyalty: loyalty
};