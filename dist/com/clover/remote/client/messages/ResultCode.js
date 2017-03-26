"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The result of the Response objects used in the
 * callbacks from the Mini
 */
var ResultCode;
(function (ResultCode) {
    ResultCode[ResultCode["SUCCESS"] = 0] = "SUCCESS";
    ResultCode[ResultCode["FAIL"] = 1] = "FAIL";
    ResultCode[ResultCode["UNSUPPORTED"] = 2] = "UNSUPPORTED";
    ResultCode[ResultCode["CANCEL"] = 3] = "CANCEL";
    ResultCode[ResultCode["ERROR"] = 4] = "ERROR"; // an error was encountered that wasn't expected or handled appropriately
})(ResultCode = exports.ResultCode || (exports.ResultCode = {}));

//# sourceMappingURL=../../../../../maps/com/clover/remote/client/messages/ResultCode.js.map
