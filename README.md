Repository for Clover's cloud connector API.  Published as an NPM package.  Intended for use in a browser environment.

##At a Glance
Make a sale.
```
var cloverLib = require("remote-pay-cloud").Clover;
var clover = new Clover({
  "clientId" : "3BZPZ6A6FQ8ZM",
  "domain" : "https://sandbox.dev.clover.com/",
  "merchantId" : "VKYQ0RVGMYHRS",
  "deviceSerialId" : "C021UQ52341078"
});
clover.initDeviceConnection(function(error) {
  if(error) console.log(error)
  else clover.sale({"amount" : 10000 }, 
    function(error, saleResult) {
      if(error) console.log(error);
      console.log(saleResult);
      clover.close();
  });
});
```

To make a payment using the High Level Cloud API
####Create the Clover object.
```
var cloverLib = require("remote-pay-cloud").Clover;
var clover = new Clover(configuration);
```
There are several ways the Clover object can be configured.

Examples of creating the Clover object:

1. With a clientID, domain, merchantId, deviceSerialId
```
{
  "clientId" : "3BZPZ6A6FQ8ZM",
  "domain" : "https://sandbox.dev.clover.com/",
  "merchantId" : "VKYQ0RVGMYHRS",
  "deviceSerialId" : "C021UQ52341078"
}
```
1. With a oauthToken, domain, merchantId, deviceSerialId
```
{
  "oauthToken" : "6e6313e8-fe33-8662-7ff2-3a6690e0ff14",
  "domain" : "https://sandbox.dev.clover.com/",
  "merchantId" : "VKYQ0RVGMYHRS",
  "deviceSerialId" : "C021UQ52341078"
}
```
1. Relying on a saved configuration in a cookie

####Define how your program will use the Clover object
#####In this example, this function will be passed when we start communicating with the device.  If there is an error when communication is initiated, this function will get the error as a parameter.
```
function makeASale(error) {
  if(error) console.log(error)
  else clover.sale({"amount" : 12345, "tipAmount" : 123 }, mySaleResult);
}
```

#####Here we define the error-first callback that we pass in to the Clover.sale function above.  If an error occurs, it will be the first parameter.
```
function mySaleResult(error, saleResult) {
  // do something with the result
}
```

####Start communicating with the device and tell the device to call your program when it is ready
```
clover.initDeviceConnection(makeASale);
```

####Disclaimer
This is a beta release and will not be supported long term. There may be a few incompatible changes in the general 
release, which is coming soon.