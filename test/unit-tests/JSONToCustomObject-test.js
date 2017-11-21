const assert = require("chai").assert;
const jsonToCustomObject = require("../../dist/com/clover/json/JSONToCustomObject").JSONToCustomObject;
const sdk = require("remote-pay-cloud-api");

describe('JSONToCustomObject()', function () {

    const saleRequestJSON = {
        amount: 5000,
        cardEntryMethods: 1,
        externalId: "testexternal",
        tipMode: "NO_TIP"
    };

    const saleRequest = new sdk.remotepay.SaleRequest();
    new jsonToCustomObject().transfertoObject(saleRequestJSON, saleRequest, true);
    assert.equal(saleRequest.getAmount(), saleRequestJSON.amount, "Sale Request - Amount not equal");
});

