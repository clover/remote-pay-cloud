module.exports.customers = customers;
function customers() {}

customers.Address = require("./Address");
customers.Card = require("./Card");
customers.Customer = require("./Customer");
customers.EmailAddress = require("./EmailAddress");
customers.PhoneNumber = require("./PhoneNumber");
customers.index = require("./index.js");
//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = customers;
}