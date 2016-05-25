Repository for Clover's cloud connector API.  Published as an NPM package.  Intended for use in a browser environment.

##At a Glance 
Make a sale.

```
require("prototype");
var $ = require('jQuery');

var clover = require("remote-pay-cloud");
var log = clover.Logger.create();

var connector = new clover.CloverConnectorFactory().createICloverConnector({
    "oauthToken": "1e7a9007-141a-293d-f41d-f603f0842138",
    "merchantId": "BBFF8NBCXEMDT",
    "clientId": "3RPTN642FHXTC",
    "deviceSerialId": "C031UQ52340045",
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

###To make a payment using the Clover Cloud Connector API
####Create the Clover object.
Import the protoype library and the Clover Cloud Connector library.
```
require("prototype");
var clover = require("remote-pay-cloud");
```
The connector can be configured in different ways, but some values are required.

#####Examples of configurations for the Connector object:

* With a clientID, the device serial id, and the domain
```
{
    "clientId": "3RPTN642FHXTC",
    "deviceSerialId": "C031UQ52340045",
    "domain": "https://sandbox.dev.clover.com/"
}
```
The application page will be redirected to the domain, where the merchant will be prompted to log in.  If the application (represented by the clientId) is not installed, the merchant will be presented with the application page, and prompted to install it.  After the installation, the merchant will be directed to the application page. 

* With a oauthToken (an authentication token), merchantId, clientId, deviceSerialId and domain
```
{
  "oauthToken" : "6e6313e8-fe33-8662-7ff2-3a6690e0ff14",
  "merchantId" : "VKYQ0RVGMYHRS",
  "clientId": "3RPTN642FHXTC",
  "deviceSerialId" : "C021UQ52341078",
  "domain" : "https://sandbox.dev.clover.com/"
}
```
The application will launch directly without a redirect.

####Define the listener
* In this example, we define a custom ICloverConnectorListener that accepts a connector instance.
```
var ExampleCloverConnectorListener = Class.create( clover.remotepay.ICloverConnectorListener, {
    initialize: function (cloverConnector) {
        this.cloverConnector = cloverConnector;
    },
    ...
```
* The listener waits to be told that the connection is ready, then begins a sale by creating the request for $100
```
    ...
    onReady: function (merchantInfo) {
        var saleRequest = new clover.remotepay.SaleRequest();
        saleRequest.setExternalId(clover.CloverID.getNewId());
        saleRequest.setAmount(10000);
        this.cloverConnector.sale(saleRequest);
    },
    ...
```
* If the sale involves collecting a signature for verification, the listener just automatically accepts it.
```
    ...
    onVerifySignatureRequest: function (request) {
        log.info(request);
        this.cloverConnector.acceptSignature(request);
    },
    ...
```
* When the sale is complete, the listener is notified with the sale response. 
```
    ...
    onSaleResponse: function (response) {
        log.info(response);
        connector.dispose();
        if(!response.getIsSale()) {
            console.error("Response is not an sale!");
            console.error(response);
        }
    }
    ...
```
The listener definition is complete. 
####Create the instance, link it to the connector, and initiate the connection
* Create an instance of the listener and add it to the connector.  Then initialize the connector which makes it initiate the process to contact the device.  It is at this point that the oauth process begins, and the page may redirect to allow the merchant to login.
```
    ...
    var connectorListener = new ExampleCloverConnectorListener(connector);
    connector.addCloverConnectorListener(connectorListener);
    connector.initializeConnection();
    ...
```
####Properly close the connector if the browser window is closed
* Add a hook to properly close the connector if the browser window is closed.  If the connector is not closed properly, the device will remain paired until it times out.  Note that this implementation uses JQuery to attach the shutdown hook.
```
...
$(window).on('beforeunload ', function () {
    try {
        connector.dispose();
    } catch (e) {
        console.log(e);
    }
});
...
```
####Disclaimer
This is a beta release and will not be supported long term. There may be a few incompatible changes in the general 
release, which is coming soon.