module.exports.hours = hours;
/**
* @namespace hours
*/
function hours() {}

hours.HourRange = require("./HourRange");
hours.HoursSet = require("./HoursSet");
hours.Reference = require("./Reference");
hours.ReferenceType = require("./ReferenceType.js");
//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = hours;
}