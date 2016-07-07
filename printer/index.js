module.exports.printer = printer;
function printer() {}

printer.Printer = require("./Printer");
printer.PrinterType = require("./PrinterType");
printer.index = require("./index.js");
//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = printer;
}