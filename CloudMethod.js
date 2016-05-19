
// Adding in a few more types for Method the cloud specifically
var CloudMethod = {};

CloudMethod.ERROR = "ERROR";

//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = MethodToMessage;
}
