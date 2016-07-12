Clover's cloud connector API.  Published as an NPM package.  Intended for use in a browser environment.

## At a Glance

### Make a sale.
```
require("prototype");
var $ = require('jQuery');

var clover = require("remote-pay-cloud");
var log = clover.Logger.create();

var connector = new clover.CloverConnectorFactory().createICloverConnector({
    "oauthToken": "1e7a9007-141a-293d-f41d-f603f0842139",
    "merchantId": "BBFF8NBCXEMDV",
    "clientId": "3RPTN642FHXTX",
    "deviceSerialId": "C031UQ52340015",
    "domain": "https://dev1.dev.clover.com/"
});

var ExampleCloverConnectorListener = Class.create( clover.remotepay.ICloverConnectorListener, {
    initialize: function (cloverConnector) {
        this.cloverConnector = cloverConnector;
    },
    onReady: function (merchantInfo) {
        var saleRequest = new clover.remotepay.SaleRequest();
        saleRequest.setExternalId(clover.CloverID.getNewId());
        saleRequest.setAmount(10000);
        this.cloverConnector.sale(saleRequest);
    },
    onVerifySignatureRequest: function (request) {
        log.info(request);
        this.cloverConnector.acceptSignature(request);
    },
    onSaleResponse: function (response) {
        log.info(response);
        connector.dispose();
        if(!response.getIsSale()) {
            console.error("Response is not an sale!");
            console.error(response);
        }
    }
});

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

### To make a payment using the High Level Cloud API
#### Import the libraries needed to create the clover object.
```
require("prototype");
var clover = require("remote-pay-cloud");
```
#### Create the Clover Connector object.
This will require gathering the configuration information to create the connector.  In this example, the configuration is hard coded.  The creation of the connector is done using the connector factory.
```
var connector = new clover.CloverConnectorFactory().createICloverConnector({
    "merchantId": "BBFF8NBCXEMDT",
    "clientId": "3RPTN642FHXTC",
    "deviceSerialId": "C031UQ52340045",
    "domain": "https://dev1.dev.clover.com/"
});
```

There are several ways the Clover Connector object can be configured.

Examples of configurations that can be used when creating the Clover Connector object:

1. With a clientID, domain, merchantId, deviceSerialId
```
{
  "clientId" : "3BZPZ6A6FQ8ZM",
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
  "deviceSerialId" : "C021UQ52341078"
}
```

#### Define a listener that will listen for events produced byt the Clover Connector.
The functions implemented will be called as the connector encounters the events.  These functions can be found in the clover.remotepay.ICloverConnectorListener. 
```
var ExampleCloverConnectorListener = Class.create( clover.remotepay.ICloverConnectorListener, {
    // This function overrides the basic prototype.js initialization function.  This example
    // expects that a coler connector implementation instance is passed to the created listener.
    initialize: function (cloverConnector) {
        this.cloverConnector = cloverConnector;
    },
    // The ICloverConnectorListener function that is called when the device is ready to be used.
    // This example starts up a sale for $100
    onReady: function (merchantInfo) {
        var saleRequest = new clover.remotepay.SaleRequest();
        saleRequest.setExternalId(clover.CloverID.getNewId());
        saleRequest.setAmount(10000);
        this.cloverConnector.sale(saleRequest);
    },
    // The ICloverConnectorListener function that is called when the device needs to have a signature
    // accepted, or rejected.
    // This example accepts the signature, sight unseen
    onVerifySignatureRequest: function (request) {
        log.info(request);
        this.cloverConnector.acceptSignature(request);
    },
    // The ICloverConnectorListener function that is called when a sale request is completed.
    // This example logs the response, and disposes of the connector.  If the response is not an expected 
    // type, it will log an error.
    onSaleResponse: function (response) {
        log.info(response);
        connector.dispose();
        if(!response.getIsSale()) {
            console.error("Response is not an sale!");
            console.error(response);
        }
    }
}
```

#### Add the listener instance to the connector, and initialize the connection to the device.
```
var connectorListener = new ExampleCloverConnectorListener(connector);
connector.addCloverConnectorListener(connectorListener);
connector.initializeConnection();
```

#### Clean up the connection on exit of the window.  This should be done with all connectors.
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

## Generate Documentation
Documentation is generated when `npm install` is run.