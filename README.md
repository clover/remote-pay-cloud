![alt text](https://www.clover.com/assets/images/public-site/press/clover_primary_gray_rgb.png)

# Clover SDK for JavaScript integration

<!---
!!NOTE!!  The following is automatically updated to reflect the npm version.
See the package.json postversion script, which maps to scripts/postversion.sh
Do not change this or the versioning may not reflect the npm version correctly.
--->
### Version

Current version: 1.3.1-3

### Overview
This SDK provides an API that enables your JavaScript point-of-sale (POS) system to communicate with a [Clover® payment device](https://www.clover.com/pos-hardware/). Learn more about [Clover integrations](https://www.clover.com/integrations).

You can use the API in conjunction with:

* The proper browser framework from a NodeJS `require` directive [hosted on npm](https://www.npmjs.com/package/remote-pay-cloud)
* A server-based NodeJS application by including a compatible [WebSocket](https://www.npmjs.com/package/websocket) and [XMLHttpRequest](https://www.npmjs.com/package/xmlhttprequest) library

If used from a browser, the browser must support WebSockets. For more information, see [WebSocket Browser Support](http://caniuse.com/#feat=websockets).

### Examples
#### Application
A [sale/refund UI example project](https://github.com/clover/clover-cloud-connector-example) that connects to a device via the Clover Cloud is available either for download and deployment, or direct deployment to a Heroku server.

#### Example framework
Another [project](https://github.com/clover/clover-cloud-connector-unit-examples) composed of small examples that connect to a device via the Clover Cloud is also available either for download and deployment, or direct deployment to a Heroku server.

Please report any questions, comments, or concerns by emailing us at [semi-integrations@clover.com](mailto:semi-integrations@clover.com).

---

### Quick start

Clover's Cloud Connector API is published as an npm package.  It is intended for use in a browser environment or Node.js application.

#### JavaScript
The following examples demonstrate how you can make a connection to a Clover device using plain JavaScript in the browser and the Cloud Pay Display app.

##### Make a sale
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
##### Import the libraries needed to create the Clover object.
```
var clover = require("remote-pay-cloud");
```
##### Create the Clover Connector object
You’ll need to gather the configuration information in order to create the connector.  In this example, the configuration is hard-coded. Use the connector factory to create the connection.
```
var connector = new clover.CloverConnectorFactory().createICloverConnector({
    "merchantId": "BBFF8NBCXEMDT",
    "clientId": "3RPTN642FHXTC",
    "remoteApplicationId": "com.yourname.yourapplication:1.0.0-beta1",
    "deviceSerialId": "C031UQ52340045",
    "domain": "https://sandbox.dev.clover.com/"
});
```

You can configure the Clover Connector object in several ways. Here are a few examples of configurations you can use when creating the Clover Connector object.

1. With a clientID, domain, merchantId, and deviceSerialId
```
{
  "clientId" : "3BZPZ6A6FQ8ZM",
  "remoteApplicationId": "com.yourname.yourapplication:1.0.0-beta1",
  "domain" : "https://sandbox.dev.clover.com/",
  "merchantId" : "VKYQ0RVGMYHRS",
  "deviceSerialId" : "C021UQ52341078"
}
```
1. With an oauthToken, domain, merchantId, clientId, and deviceSerialId
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

##### Define a listener that will listen for events produced by the Clover Connector
The functions implemented will be called as the connector encounters the events.  These functions can be found in the clover.remotepay.ICloverConnectorListener. 
```
// This overrides/implements the constructor function.  This example
// expects that a CloverConnector implementation instance is passed to the created listener.
var ExampleCloverConnectorListener = function(cloverConnector) {
    clover.remotepay.ICloverConnectorListener.call(this);
    this.cloverConnector = cloverConnector;
};
ExampleCloverConnectorListener.prototype = Object.create(clover.remotepay.ICloverConnectorListener.prototype);
ExampleCloverConnectorListener.prototype.constructor = ExampleCloverConnectorListener;

// The ICloverConnectorListener function that's called when the device is ready to be used.
// This example starts up a sale for $100
ExampleCloverConnectorListener.prototype.onReady: function (merchantInfo) {
    var saleRequest = new clover.remotepay.SaleRequest();
    saleRequest.setExternalId(clover.CloverID.getNewId());
    saleRequest.setAmount(10000);
    this.cloverConnector.sale(saleRequest);
};

// The ICloverConnectorListener function that's called when the device needs to capture a signature
// accepted, or rejected.
// This example accepts the signature, sight-unseen
ExampleCloverConnectorListener.prototype.onVerifySignatureRequest = function (request) {
    log.info(request);
    this.cloverConnector.acceptSignature(request);
};

// The ICloverConnectorListener function that's called when the device detects a possible duplicate transaction,
// due to the same card being used in a short period of time. This example accepts the duplicate payment challenge sight-unseen
ExampleCloverConnectorListener.prototype.onConfirmPaymentRequest = function (request) {
  this.cloverConnector.acceptPayment(request.payment);
};

// The ICloverConnectorListener function that's called when a sale request is completed.
// This example logs the response and disposes of the connector.  If the response is not an expected
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

##### Add the listener instance to the connector and initialize the connection to the device
```
var connectorListener = new ExampleCloverConnectorListener(connector);
connector.addCloverConnectorListener(connectorListener);
connector.initializeConnection();
```

##### Clean up the connection on exit of the window
This should be done with all connectors
The following example uses jQuery to add a hook for the window `beforeunload` event that ensures that the connector is disposed of
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
This section demonstrates how you can make a connection to a Clover device using typescript in the browser and the Network Pay Display app.

### At a Glance

#### Make a sale
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
##### Import the libraries needed to create the Clover object
```
import * as Clover from 'remote-pay-cloud';
```
##### Create the Clover device Configuration object
Depending on the mode of configuration, you may choose to use a WebSocketPairedCloverDeviceConfiguration or a WebSocketCloudCloverDeviceConfiguration.
```
export class StandAloneExampleWebsocketPairedCloverDeviceConfiguration extends 
                 Clover.WebSocketPairedCloverDeviceConfiguration {
...
}
```
There are many ways the Clover Connector object can be configured.  This includes a direct connection with a browser as shown here, connecting using a browser via the cloud (similar to the example above), or connecting using a Node.js application. 

##### Define a listener that will listen for events produced by the Clover Connector
The functions implemented will be called as the connector encounters the events.  These functions can be found in the clover.remotepay.ICloverConnectorListener. 
```
export class StandAloneExampleCloverConnectorListener extends Clover.remotepay.ICloverConnectorListener {
...
}
```
##### Create the Clover Connector Factory object
The factory can be obtained using the builder.  If unspecified, the factory will produce 1.1.0 compatible connectors.  Here we specify the 1.2 version.
```
let configuration = {};
configuration[Clover.CloverConnectorFactoryBuilder.FACTORY_VERSION] = 
      Clover.CloverConnectorFactoryBuilder.VERSION_12;
let connectorFactory: Clover.ICloverConnectorFactory = 
      Clover.CloverConnectorFactoryBuilder.createICloverConnectorFactory(configuration);
```
##### Create the Clover Connector object
Using the configuration object you created, call the factory function to get an instance of a Clover Connector.
```
let cloverConnector: Clover.remotepay.ICloverConnector =
    connectorFactory.createICloverConnector(
      new StandAloneExampleWebsocketPairedCloverDeviceConfiguration());
```
##### Add the listener instance to the connector and initialize the connection to the device
```
cloverConnector.addCloverConnectorListener(new StandAloneExampleCloverConnectorListener(cloverConnector));
cloverConnector.initializeConnection();
```
##### Clean up the connection on exit of the window  
This should be done with all connectors.
The following example uses jQuery to add a hook for the window `beforeunload` event that ensures the connector is disposed of.
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
This library has been tested against the following browser types and versions:

* Chrome version 54-58
* Firefox version 49

# Generate Documentation
API documentation is generated when `npm install` is run. 
* [Online Docs](http://clover.github.io/remote-pay-cloud/1.3.1-3/)
* [Online API class Docs](http://clover.github.io/remote-pay-cloud-api/1.3.1-1/)

## Release Notes

### Version 1.3.1-3
* SEMI-1045 Correct array serialization for top level remotemessage.Message types
* SEMI-1057 Adds the VaultedCard to the Vaulted Card response
* SEMI-1054 Adds tipAmount to tipAdded 

### Version 1.3.1-2
* SEMI-1045 Converts array elements into the format expected by Clover devices. Fix for displaying an order.

### Version 1.3.1-1
* SEMI-1025 Use version of remote-pay-cloud-api that contains OrderUpdateMessage and related files.
* SEMI-991 When Cloud connections fail because a device is not communicating with the Clover servers, report the disconnect.

### Version 1.3.1
#### Version 1.3.1-rc1.2
* CLOVER-21536  Default allowPartialAuth in PayIntent dto.  Update to dependency on remote-pay-cloud-api.

#### Version 1.3.1-rc1.1
* SEMI-695 Update typescript version.

#### Version 1.3.1-rc1.0
* SEMI-864 Fix case where a tip of 0 resulted in a sale being converted to an auth.

### Version 1.3.0-rc1.1
* SEMI-917 Added onDeviceDisconnected, onDeviceConnected, and onDeviceReady and deprecated onDisconnected, onConnected, and onReady. The additions bring this API into closer alignment with the other Remote Pay APIs.

#### Version 1.3.0-rc1.0
* Added support for Custom Activities
  * ICloverConnector
    * Added
      * startCustomActivity
  * ICloverConnectorListener
    * Added
      * onCustomActivityResponse
      
  * CustomActivity
    * The APK must be approved and then installed through the Clover App Market
    * clover-cfp-sdk library
      * Added CloverCFPActivity that can be extended
      * Added constants for getting/retrieving activity payload CloverCFP interface
      * Working with Custom Activities:
        * The action of the Activity, as defined in the AndroidManifest, should be passed in as part of the request
        * A single text payload can be passed in to the request and retrieved in the intent via com.clover.remote.cfp.CFPActivity.EXTRA_PAYLOAD constant (e.g. "com.clover.remote.terminal.remotecontrol.extra.EXTRA_PAYLOAD”).
        * The CustomActivityResponse (onCustomActivityResponse) contains a single text payload, populated from the com.clover.remote.cfp.EXTRA_PAYLOAD extra in the result Intent
        * Block vs Non-Blocking Activities
            * A blocking CustomActivity (CustomActivityRequest.setNonBlocking(boolean)) will either need to finish itself, or can be exited via ICloverConnector.resetDevice()
               * For example: Don't want a Sale request to interrupt Collect Customer Information Custom Activity
            * A non-blocking Custom Activity will finish when a new request is made
               * For example: Want a Sale request to interrupt showing Ads Custom Activity

* SEMI-889 Remove automatic transition to welcome screen when device is ready.
* SEMI-695 Add response to `resetDevice` call.
* SEMI-795 Add retrievePayment functionality.
* SEMI-777 Add support for Custom Activities.

### Version 1.2.0
#### Version 1.2.0-rc1.1

* SEMI-792  Installation script fix. Move dev-dependencies to dependencies.

#### Version 1.2.0-rc1.0

* SEMI-689  Initial 1.2 implementation. Redesign of internal classes and many processes. Support for 'per-transaction' settings. Update to use version 1.2.0-rc1.0 of remote-pay-cloud-api classes.  Addition of REMOTE_ERROR handling.  Increased request validation before communication.  Added the ability to direct connect to the device via the Network Pay Display app.  Added 'displayPaymentReceiptOptions' to replace deprecated 'showPaymentReceiptOptions'.  Removed dependency on browser for connector objects produced using 1.2 factory objects.
* SEMI-554 Added internal support for remote error. Fix "cloverShouldHandleReceipts" and "disablePrinting" check to look for correct property. Use 1.2.0-rc1.0 of remote-pay-cloud-api.

### Version 1.1.0
#### Version 1.1.0-rc6.4

* SEMI-498 Revert update to use new schema objects. New schema is slated for 1.2.

#### Version 1.1.0-rc6.3 (deprecated)

* SEMI-498 Add ready checking before attempting remote calls. Add request validation. Inhibit multiple 'onReady' callbacks. Update to use new schema objects.
* SEMI-577 Add declaration of support for Chrome version 54 and Firefox version 49.

#### Version 1.1.0-rc6.2

* SEMI-541 Update Remote Pay Cloud API classes to ver 1.1.0-rc5.1.

#### Version 1.1.0-rc6.1

* SVR-899 Handle reconnect requests from the server.

#### Version 1.1.0-rc6.0

* PAY-1258 Fix documentation. Set up flow to capture "REFUND_RESPONSE" and extract any additional failure info. Fix namespace issues. Change flow to depend on ACK messages (when supported). Extend ping/pong timeout check.

#### Version 1.1.0-rc5.1

* SEMI-493: Allow suppression of log messages. Log messages are now suppressed by default. To enable default logging:
```
require("remote-pay-cloud").DebugConfig.loggingEnabled = true;
```

#### Version 1.1.0-rc5.0

* SEMI-438: Remove dependency on 'prototype.js'.

#### Version 1.1.0-RC2

* SEMI-457: Add remoteApplicationId to required configuration.
* SEMI-434: Add ability to read card data.
* SEMI-423: Added backwards compatibility For older versions of android remote-pay ACK messages.

#### Version 1.1.0-RC1

A deprecated beta version of the Connector (Clover.js) is included in this version with `require` directive syntax, but will removed in the future.

### Version [BETA](https://github.com/clover/remote-pay-cloud-BETA/tree/BETA_Final) 

The beta version includes the earliest library, as well as a server with examples of the functions. 

### Additional resources
- [Tutorial for the Browser SDK](https://docs.clover.com/build/getting-started-with-cloverconnector/?sdk=browser)
- [API Class Documentation](http://clover.github.io/remote-pay-cloud-api/1.3.1/)
- [Semi-Integration FAQ](https://docs.clover.com/build/semi-integration-faq/)
- [Clover Developer Community](https://community.clover.com/index.html)

## License 
Copyright © 2017 Clover Network, Inc. All rights reserved.


