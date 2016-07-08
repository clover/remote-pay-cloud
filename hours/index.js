module.exports.hours = hours;
function hours() {}

hours.HourRange = require("./HourRange");
hours.HoursSet = require("./HoursSet");
hours.Reference = require("./Reference");
hours.ReferenceType = require("./ReferenceType");
hours.index = require("./index.js");
//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = hours;
}