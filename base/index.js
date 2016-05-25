module.exports.base = base;
function base() {}

base.Address = require("./Address");
base.ApprovalStatus = require("./ApprovalStatus");
base.BusinessTypeCode = require("./BusinessTypeCode");
base.CountryInfo = require("./CountryInfo");
base.Point = require("./Point");
base.Points = require("./Points");
base.Reference = require("./Reference");
base.ServiceCharge = require("./ServiceCharge");
base.Signature = require("./Signature");
base.Tender = require("./Tender.js");
//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = base;
}