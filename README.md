![Clover logo](https://www.clover.com/assets/images/public-site/press/clover_primary_gray_rgb.png)

# Clover SDK for JavaScript integration

<!---
!!NOTE!!  The following is automatically updated to reflect the npm version.
See the package.json postversion script, which maps to scripts/postversion.sh
Do not change this or the versioning may not reflect the npm version correctly.
--->
## Version

Current version: 1.4.1

## Platforms supported

- Macintosh
- Linux
- Windows (for version 1.3.2 of the SDK only)

## Overview
This SDK provides an API that enables your JavaScript point-of-sale (POS) system to communicate with a [Clover® payment device](https://www.clover.com/pos-hardware/). Learn more about [Clover integrations](https://www.clover.com/integrations).

You can use the API in conjunction with:

* The proper browser framework from a Node.js `require` directive [hosted on npm](https://www.npmjs.com/package/remote-pay-cloud)
* A server-based Node.js application by including a compatible [WebSocket](https://www.npmjs.com/package/websocket) and [XMLHttpRequest](https://www.npmjs.com/package/xmlhttprequest) library

If used from a browser, the browser must support WebSockets. For more information, see [WebSocket Browser Support](http://caniuse.com/#feat=websockets).

## Examples
### Application
A [sale/refund UI example project](https://github.com/clover/clover-cloud-connector-example) that connects to a device via the Clover Cloud is available either for download and deployment, or direct deployment to a Heroku server.

### Example framework
Another [project](https://github.com/clover/clover-cloud-connector-unit-examples) composed of small examples that connect to a device via the Clover Cloud is also available either for download and deployment, or direct deployment to a Heroku server.

Please report any questions, comments, or concerns by emailing us at [semi-integrations@clover.com](mailto:semi-integrations@clover.com).

### Quick start

Clover's Cloud Connector API is published as an npm package. It is intended for use in a browser environment or Node.js application.

The following example demonstrates how you can create a connection to a Clover device using plain JavaScript in the browser and the Cloud Pay Display app.

#### Make a sale

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

#### Step-by-Step Explanation
##### Import the libraries needed to create the Clover object
```
var clover = require("remote-pay-cloud");
```
##### Create the Clover Connector object
You will need to gather the configuration information in order to create the connector.  In this example, the configuration is hard-coded. Use the connector factory to create the connection.
```
var connector = new clover.CloverConnectorFactory().createICloverConnector({
    "merchantId": "BBFF8NBCXEMDT",
    "clientId": "3RPTN642FHXTC",
    "remoteApplicationId": "com.yourname.yourapplication:1.0.0-beta1",
    "deviceSerialId": "C031UQ52340045",
    "domain": "https://sandbox.dev.clover.com/"
});
```

You can configure the Clover Connector object in several ways. Here are a few examples of configurations you can use.

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
The functions implemented will be called as the connector encounters the events. These functions can be found in the `clover.remotepay.ICloverConnectorListener`. 
```
// This overrides/implements the constructor function.  This example
// expects that a CloverConnector implementation instance is passed to the created listener.
var ExampleCloverConnectorListener = function(cloverConnector) {
    clover.remotepay.ICloverConnectorListener.call(this);
    this.cloverConnector = cloverConnector;
};
ExampleCloverConnectorListener.prototype = Object.create(clover.remotepay.ICloverConnectorListener.prototype);
ExampleCloverConnectorListener.prototype.constructor = ExampleCloverConnectorListener;

// The ICloverConnectorListener function that's called when the device is ready to be used
// This example starts up a sale for $100
ExampleCloverConnectorListener.prototype.onReady: function (merchantInfo) {
    var saleRequest = new clover.remotepay.SaleRequest();
    saleRequest.setExternalId(clover.CloverID.getNewId());
    saleRequest.setAmount(10000);
    this.cloverConnector.sale(saleRequest);
};

// The ICloverConnectorListener function that's called when the device needs to capture a signature
// The signature will be either accepted or rejected
// This example accepts the signature, sight-unseen
ExampleCloverConnectorListener.prototype.onVerifySignatureRequest = function (request) {
    log.info(request);
    this.cloverConnector.acceptSignature(request);
};

// The ICloverConnectorListener function that's called when the device detects a possible duplicate transaction,
// due to the same card being used in a short period of time. This example accepts the duplicate payment challenge sight-unseen.
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
This should be done with all connectors. The following example uses jQuery to add a hook for the window `beforeunload` event that ensures that the connector is disposed of.
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

### Make a sale
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

#### Step-by-Step Explanation
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
There are many ways the Clover Connector object can be configured.  This includes a direct connection with a browser as shown here, using a browser to connect through the cloud (similar to the example above), or connecting using a Node.js application. 

##### Define a listener that will listen for events produced by the Clover Connector
The functions implemented will be called as the connector encounters the events.  These functions can be found in the `clover.remotepay.ICloverConnectorListener`. 
```
export class StandAloneExampleCloverConnectorListener extends Clover.remotepay.ICloverConnectorListener {
...
}
```
##### Create the Clover Connector Factory object
The factory can be obtained using the builder.  If unspecified, the factory will produce 1.1.0-compatible connectors.  This example specifies the 1.2 version.
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
This should be done with all connectors. The following example uses jQuery to add a hook for the window `beforeunload` event that ensures the connector is disposed of.
```
$(window).on('beforeunload ', function () {
    try {
        connector.dispose();
    } catch (e) {
        console.log(e);
    }
});
```

## Browser Versions Tested
This library has been tested against the following browser types and versions:

* Chrome versions 54-58
* Firefox version 49

## Build
To build run "npm run build"

## Generate Documentation
API documentation is generated at build time - `npm run build` 
* [Online Docs](http://clover.github.io/remote-pay-cloud/1.4.0/)

## Additional resources
- [Release Notes](https://github.com/clover/remote-pay-cloud/releases)
- [Tutorial for the Browser SDK](https://docs.clover.com/build/getting-started-with-cloverconnector/?sdk=browser)
- [API Class Documentation](http://clover.github.io/remote-pay-cloud-api/1.4.0/)
- [Clover Developer Community](https://community.clover.com/index.html)

## License 
Copyright © 2017 Clover Network, Inc. All rights reserved.


