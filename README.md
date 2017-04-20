# Clover SDK for Javascript Integration

<!---
!!NOTE!!  The following is automatically updated to reflect the npm version.
See the package.json postversion script, which maps to scripts/postversion.sh
Do not change this or the versioning may not reflect the npm version correctly.
--->
Current version: 1.2.0

## Overview

This SDK provides an API to allow your application using Javascript to interface with a Clover® Mini device (https://www.clover.com/pos-hardware/mini)

The API is available on [GitHub](https://github.com/clover/remote-pay-cloud) for download, and can be used:

* in conjunction with the proper browser framework from a NodeJS `require` directive, [hosted on NPM](https://www.npmjs.com/package/remote-pay-cloud)
* in conjunction with a server based NodeJS application by including a compatible [WebSocket](https://www.npmjs.com/package/websocket) and [XMLHttpRequest](https://www.npmjs.com/package/xmlhttprequest) library.

1. The remotepay/ICloverConnector is the high-level API with methods like `Sale()`, `VoidTransaction()`, `ManualRefund()`, etc.
2. The remotepay/ICloverConnectorListener is the high-level listener API that defines callback methods like `onSaleResponse`, `onRefundPaymentResponse`, etc.
3. The API includes objects that map to standard Clover objects such as `Payment`, `CardTransaction`, `Order`, etc.  These objects will match those defined in [clover-android-sdk](https://github.com/clover/clover-android-sdk)

If used from a browser, the library requires the browser you use to support WebSockets. See [WebSocket Browser Support](http://caniuse.com/#feat=websockets).

For more developer documentation and information about the Semi-Integration program, please visit our [semi-integration developer documents] (https://docs.clover.com/build/integration-overview-requirements/). 

## Examples
### Application
A sale/refund UI example project that connects to a device via the Clover cloud [Clover Cloud Connector Example](https://github.com/clover/clover-cloud-connector-example) is available for download and deployment, or direct deployment to a Heroku server.

### Example Framework
A example project composed of small examples that connect to a device via the Clover cloud - [Clover Cloud Connector Unit Examples](https://github.com/clover/clover-cloud-connector-unit-examples) is available for download and deployment, or direct deployment to a Heroku server.

Please report any questions/comments/concerns to us by emailing [semi-integrations@clover.com](mailto:semi-integrations@clover.com).

---

# Quickstart

Clover's cloud connector API.  Published as an NPM package.  Intended for use in a browser environment, or in a NodeJS application.

## Javascript
This shows how you can make a connection using plain javascript in the browser to a Clover device using the Cloud Pay Display.

### At a Glance

#### Make a sale.
```
var $ = require('jQuery');

var clover = require("remote-pay-cloud");
var log = clover.Logger.create();

var connector = new clover.CloverConnectorFactory().createICloverConnector({
    "oauthToken": "1e7a9007-141a-293d-f41d-f603f0842139",
    "merchantId": "BBFF8NBCXEMDV",
    "clientId": "3RPTN642FHXTX",
    "remoteApplicationId": "com.yourname.yourapplication:1.0.0-beta1",
    "deviceSerialId": "C031UQ52340015",
    "domain": "https://sandbox.dev.clover.com/"
});

var ExampleCloverConnectorListener = function(cloverConnector) {
    clover.remotepay.ICloverConnectorListener.call(this);
    this.cloverConnector = cloverConnector;
};

ExampleCloverConnectorListener.prototype = Object.create(clover.remotepay.ICloverConnectorListener.prototype);
ExampleCloverConnectorListener.prototype.constructor = ExampleCloverConnectorListener;

ExampleCloverConnectorListener.prototype.onReady = function (merchantInfo) {
    var saleRequest = new clover.remotepay.SaleRequest();
    saleRequest.setExternalId(clover.CloverID.getNewId());
    saleRequest.setAmount(10000);
    this.cloverConnector.sale(saleRequest);
};

ExampleCloverConnectorListener.prototype.onVerifySignatureRequest = function (request) {
    log.info(request);
    this.cloverConnector.acceptSignature(request);
};

ExampleCloverConnectorListener.prototype.onConfirmPaymentRequest = function (request) {
  this.cloverConnector.acceptPayment(request.payment);
};

ExampleCloverConnectorListener.prototype.onSaleResponse = function (response) {
    log.info(response);
    connector.dispose();
    if(!response.getIsSale()) {
        console.error("Response is not an sale!");
        console.error(response);
    }
};

var connectorListener = new ExampleCloverConnectorListener(connector);
connector.addCloverConnectorListener(connectorListener);
connector.initializeConnection();

// Close the connection cleanly on exit.  This should be done with all connectors.
$(window).on('beforeunload ', function () {
    try {
        connector.dispose();
    } catch (e) {
        console.log(e);
    }
});
```

#### Breakdown
##### Import the libraries needed to create the clover object.
```
var clover = require("remote-pay-cloud");
```
##### Create the Clover Connector object.
This will require gathering the configuration information to create the connector.  In this example, the configuration is hard coded.  The creation of the connector is done using the connector factory.
```
var connector = new clover.CloverConnectorFactory().createICloverConnector({
    "merchantId": "BBFF8NBCXEMDT",
    "clientId": "3RPTN642FHXTC",
    "remoteApplicationId": "com.yourname.yourapplication:1.0.0-beta1",
    "deviceSerialId": "C031UQ52340045",
    "domain": "https://sandbox.dev.clover.com/"
});
```

There are several ways the Clover Connector object can be configured.

Examples of configurations that can be used when creating the Clover Connector object:

1. With a clientID, domain, merchantId, deviceSerialId
```
{
  "clientId" : "3BZPZ6A6FQ8ZM",
  "remoteApplicationId": "com.yourname.yourapplication:1.0.0-beta1",
  "domain" : "https://sandbox.dev.clover.com/",
  "merchantId" : "VKYQ0RVGMYHRS",
  "deviceSerialId" : "C021UQ52341078"
}
```
1. With a oauthToken, domain, merchantId, clientId, deviceSerialId
```
{
  "oauthToken" : "6e6313e8-fe33-8662-7ff2-3a6690e0ff14",
  "domain" : "https://sandbox.dev.clover.com/",
  "merchantId" : "VKYQ0RVGMYHRS",
  "clientId" : "3BZPZ6A6FQ8ZM",
  "remoteApplicationId": "com.yourname.yourapplication:1.0.0-beta1",
  "deviceSerialId" : "C021UQ52341078"
}
```

##### Define a listener that will listen for events produced by the Clover Connector.
The functions implemented will be called as the connector encounters the events.  These functions can be found in the clover.remotepay.ICloverConnectorListener. 
```
// This overrides/implements the constructor function.  This example
// expects that a clover connector implementation instance is passed to the created listener.
var ExampleCloverConnectorListener = function(cloverConnector) {
    clover.remotepay.ICloverConnectorListener.call(this);
    this.cloverConnector = cloverConnector;
};
ExampleCloverConnectorListener.prototype = Object.create(clover.remotepay.ICloverConnectorListener.prototype);
ExampleCloverConnectorListener.prototype.constructor = ExampleCloverConnectorListener;

// The ICloverConnectorListener function that is called when the device is ready to be used.
// This example starts up a sale for $100
ExampleCloverConnectorListener.prototype.onReady: function (merchantInfo) {
    var saleRequest = new clover.remotepay.SaleRequest();
    saleRequest.setExternalId(clover.CloverID.getNewId());
    saleRequest.setAmount(10000);
    this.cloverConnector.sale(saleRequest);
};

// The ICloverConnectorListener function that is called when the device needs to have a signature
// accepted, or rejected.
// This example accepts the signature, sight unseen
ExampleCloverConnectorListener.prototype.onVerifySignatureRequest = function (request) {
    log.info(request);
    this.cloverConnector.acceptSignature(request);
};

// The ICloverConnectorListener function that is called when the device detects a possible duplicate transaction,
// due to the same card being used in a short period of time. This example accepts the duplicate payment challenge, sight unseen
ExampleCloverConnectorListener.prototype.onConfirmPaymentRequest = function (request) {
  this.cloverConnector.acceptPayment(request.payment);
};

// The ICloverConnectorListener function that is called when a sale request is completed.
// This example logs the response, and disposes of the connector.  If the response is not an expected
// type, it will log an error.
ExampleCloverConnectorListener.prototype.onSaleResponse = function (response) {
    log.info(response);
    connector.dispose();
    if(!response.getIsSale()) {
        console.error("Response is not an sale!");
        console.error(response);
    }
};
```

##### Add the listener instance to the connector, and initialize the connection to the device.
```
var connectorListener = new ExampleCloverConnectorListener(connector);
connector.addCloverConnectorListener(connectorListener);
connector.initializeConnection();
```

##### Clean up the connection on exit of the window.  This should be done with all connectors.
This example uses jQuery to add a hook for the window `beforeunload` event that ensures that the connector is displosed of.
```
$(window).on('beforeunload ', function () {
    try {
        connector.dispose();
    } catch (e) {
        console.log(e);
    }
});
```

## Typescript
This shows how you can make a connection using typescript in the browser to a Clover device using the Network Pay Display.

### At a Glance

#### Make a sale.
```
var $ = require('jQuery');
import * as Clover from 'remote-pay-cloud';

export class StandAloneExampleWebsocketPairedCloverDeviceConfiguration extends Clover.WebSocketPairedCloverDeviceConfiguration {
    public constructor() {
        super(
            "wss://Clover-C030UQ50550081.local.:12345/remote_pay",
            "test.js.test:0.0.1",
            "My_Pos_System",
            "8675309142856", 
            null, 
            Clover.BrowserWebSocketImpl.createInstance 
        );
    }

    public onPairingCode(pairingCode: string): void {
        console.log("Pairing code is " + pairingCode + " you will need to enter this on the device.");
    }

    public onPairingSuccess(authToken: string): void {
        console.log("Pairing succeeded, authToken is " + authToken);

    }
}

export class StandAloneExampleCloverConnectorListener extends Clover.remotepay.ICloverConnectorListener {
    protected cloverConnector: Clover.remotepay.ICloverConnector;
    private testStarted: boolean;

    constructor(cloverConnector: Clover.remotepay.ICloverConnector) {
        super();

        this.cloverConnector = cloverConnector;
        this.testStarted = false;
    }
    protected onReady(merchantInfo: Clover.remotepay.MerchantInfo): void {
        console.log("In onReady, starting test", merchantInfo);
        if(!this.testStarted) {
            this.testStarted = true;
        }
        let saleRequest:Clover.remotepay.SaleRequest = new Clover.remotepay.SaleRequest();
        saleRequest.setExternalId(Clover.CloverID.getNewId());
        saleRequest.setAmount(10);
        console.log({message: "Sending sale", request: saleRequest});
        this.cloverConnector.sale(saleRequest);

    }
    public onSaleResponse(response:Clover.remotepay.SaleResponse): void {
        try{
            console.log({message: "Sale response received", response: response});
            if (!response.getIsSale()) {
                console.error("Response is not a sale!");
            }
            console.log("Test Completed.  Cleaning up.");
            this.cloverConnector.showWelcomeScreen();
            this.cloverConnector.dispose();
        } catch (e) {
            console.error(e);
        }
    }
    protected onConfirmPaymentRequest(request: Clover.remotepay.ConfirmPaymentRequest): void {
        console.log({message: "Automatically accepting payment", request: request});
        this.cloverConnector.acceptPayment(request.getPayment());
    }
    protected onVerifySignatureRequest(request: Clover.remotepay.onVerifySignatureRequest): void {
        console.log({message: "Automatically accepting signature", request: request});
        this.cloverConnector.acceptSignature(request);
    }
    protected onDeviceError(deviceErrorEvent: Clover.remotepay.CloverDeviceErrorEvent): void {
        console.error("onDeviceError", deviceErrorEvent);
    }
}

let configuration = {};
configuration[Clover.CloverConnectorFactoryBuilder.FACTORY_VERSION] = Clover.CloverConnectorFactoryBuilder.VERSION_12;
let connectorFactory: Clover.ICloverConnectorFactory = Clover.CloverConnectorFactoryBuilder.createICloverConnectorFactory(
    configuration
);

let cloverConnector: Clover.remotepay.ICloverConnector =
    connectorFactory.createICloverConnector( new StandAloneExampleWebsocketPairedCloverDeviceConfiguration());

cloverConnector.addCloverConnectorListener(new StandAloneExampleCloverConnectorListener(cloverConnector));

$(window).on('beforeunload ', function () {
    try {
        cloverConnector.dispose();
    } catch (e) {
        console.log(e);
    }
});

cloverConnector.initializeConnection();
```

#### Breakdown
##### Import the libraries needed to create the clover object.
```
import * as Clover from 'remote-pay-cloud';
```
##### Create the Clover Device Configuration object.
Depending on the mode of configuration, you may choose to use a WebSocketPairedCloverDeviceConfiguration, or a WebSocketCloudCloverDeviceConfiguration.
```
export class StandAloneExampleWebsocketPairedCloverDeviceConfiguration extends 
                 Clover.WebSocketPairedCloverDeviceConfiguration {
...
}
```
There are many ways the Clover Connector object can be configured.  This includes a direct connection with a browser as shown here, connecting using a browser via the cloud similar to the above example, and connecting using a NodeJS application. 

##### Define a listener that will listen for events produced byt the Clover Connector.
The functions implemented will be called as the connector encounters the events.  These functions can be found in the clover.remotepay.ICloverConnectorListener. 
```
export class StandAloneExampleCloverConnectorListener extends Clover.remotepay.ICloverConnectorListener {
...
}
```
##### Create the Clover Connector Factory object.
The factory can be obtained using the builder.  If unspecified, the factory will produce 1.1.0 compatible connectors.  Here we specify the 1.2 version.
```
let configuration = {};
configuration[Clover.CloverConnectorFactoryBuilder.FACTORY_VERSION] = 
      Clover.CloverConnectorFactoryBuilder.VERSION_12;
let connectorFactory: Clover.ICloverConnectorFactory = 
      Clover.CloverConnectorFactoryBuilder.createICloverConnectorFactory(configuration);
```
##### Create the Clover Connector object.
Using the configuration object you created, call the factory function to get an instance of a Clover Connector.
```
let cloverConnector: Clover.remotepay.ICloverConnector =
    connectorFactory.createICloverConnector(
      new StandAloneExampleWebsocketPairedCloverDeviceConfiguration());
```
##### Add the listener instance to the connector, and initialize the connection to the device.
```
cloverConnector.addCloverConnectorListener(new StandAloneExampleCloverConnectorListener(cloverConnector));
cloverConnector.initializeConnection();
```
##### Clean up the connection on exit of the window.  This should be done with all connectors.
This example uses jQuery to add a hook for the window `beforeunload` event that ensures that the connector is displosed of.
```
$(window).on('beforeunload ', function () {
    try {
        connector.dispose();
    } catch (e) {
        console.log(e);
    }
});
```

# Browser Versions Tested
This library has been tested against the following Browser type and versions:

* Chrome version 54
* Firefox version 49

# Generate Documentation
API documentation is generated when `npm install` is run. 
[Online Docs](http://clover.github.io/remote-pay-cloud/1.2.0/) and
[Online API class Docs](http://clover.github.io/remote-pay-cloud-api/1.2.0/)

# Release Notes

## Version 1.2.0
## Version 1.2.0-rc1.1

SEMI-792  Installation script fix.  Move dev-dependencies to dependencies.

## Version 1.2.0-rc1.0

SEMI-689  Initial 1.2 implementation.  Redesign of internal classes and many processes.  Support for 'per-transaction' settings. Update to use version 1.2.0-rc1.0 of remote-pay-cloud-api classes.  Addition of REMOTE_ERROR handling.  Increased request validation before communication.  Added ability to direct connect to device via 'Network Pay Display' app.  Added 'displayPaymentReceiptOptions' to replace deprecated 'showPaymentReceiptOptions'.  Removed dependency on browser for connector objects produced using 1.2 factory objects.

SEMI-554 Added internal support for remote error.  Fix "cloverShouldHandleReceipts" and "disablePrinting" check to look for correct property. Use 1.2.0-rc1.0 of remote-pay-cloud-api.

## Version 1.1.0
## Version 1.1.0-rc6.4

SEMI-498 Revert update to use new schema objects.  New schema is slated for 1.2.

## Version 1.1.0-rc6.3 (deprecated)

SEMI-498 Add ready checking before attempting remote calls.  Add request validation.  Inhibit multiple 'onReady' callbacks.  Update to use new schema objects.
SEMI-577 Add Declaration of support for Chrome version 54, Firefox version 49

## Version 1.1.0-rc6.2

SEMI-541 Update remote pay cloud API classes to ver 1.1.0-rc5.1

## Version 1.1.0-rc6.1

* SVR-899 Handle reconnect requests from the server.

## Version 1.1.0-rc6.0

* PAY-1258 Fix documentation.  Set up flow to capture "REFUND_RESPONSE" and extract any additional failure info.  Fix namespace issues.  Change flow to depend on ACK messages (when supported).  Extend ping/pong timeout check.

## Version 1.1.0-rc5.1

* SEMI-493: Allow suppression of log messages. Log messages are now suppressed by default.  To enable default logging:
```
require("remote-pay-cloud").DebugConfig.loggingEnabled = true;
```

## Version 1.1.0-rc5.0

* SEMI-438: Remove dependency on 'prototype.js'

## Version 1.1.0-RC2

* SEMI-457: Add remoteApplicationId to required configuration.
* SEMI-434: Add ability to read card data.
* SEMI-423: Added backwards compatibility For older versions of android remote-pay ACK messages.

## Version 1.1.0-RC1

A deprecated beta version of the Connector (Clover.js) is included in this version with `require` directive syntax, but will removed in the future.

## Version [BETA](https://github.com/clover/remote-pay-cloud-BETA/tree/BETA_Final) 

The beta version includes the earliest library as well as a server with examples of the functions. 
