"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var DebugConfig = require("../../../../../../DebugConfig");
// This is the same but will not work if DebugConfig is updated to ES6+
// import {default as DebugConfig} from '../../../../../../DebugConfig';
var Logger = (function (_super) {
    __extends(Logger, _super);
    function Logger() {
        var _this = _super.call(this) || this;
        _this.enabled = false;
        return _this;
    }
    Logger.create = function () {
        var log = new Logger();
        log.on("log", toConsole);
        log.silly = log.emit.bind(log, "log", "silly");
        log.verbose = log.emit.bind(log, "log", "verbose");
        log.info = log.emit.bind(log, "log", "info");
        log.warn = log.emit.bind(log, "log", "warn");
        log.error = log.emit.bind(log, "log", "error");
        log.debug = log.emit.bind(log, "log", "debug");
        log.enabled = false;
        return log;
        function toConsole() {
            if (log.enabled || DebugConfig.loggingEnabled) {
                console.log.apply(console, arguments);
            }
        }
    };
    Logger.prototype.silly = function () {
        var any = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            any[_i] = arguments[_i];
        }
    };
    Logger.prototype.verbose = function () {
        var any = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            any[_i] = arguments[_i];
        }
    };
    Logger.prototype.info = function () {
        var any = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            any[_i] = arguments[_i];
        }
    };
    Logger.prototype.warn = function () {
        var any = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            any[_i] = arguments[_i];
        }
    };
    Logger.prototype.error = function () {
        var any = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            any[_i] = arguments[_i];
        }
    };
    Logger.prototype.debug = function () {
        var any = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            any[_i] = arguments[_i];
        }
    };
    return Logger;
}(events_1.EventEmitter));
exports.Logger = Logger;

//# sourceMappingURL=../../../../../maps/com/clover/remote/client/util/Logger.js.map
