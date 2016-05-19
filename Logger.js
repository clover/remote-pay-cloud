var EventEmitter = require("events").EventEmitter
    , slice = Array.prototype.slice;

module.exports = {
    create: create
};

function create() {
    var log = new EventEmitter();

    log.on("log", toConsole);
    log.silly = log.emit.bind(log, "log", "silly");
    log.verbose = log.emit.bind(log, "log", "verbose");
    log.info = log.emit.bind(log, "log", "info");
    log.warn = log.emit.bind(log, "log", "warn");
    log.error = log.emit.bind(log, "log", "error");
    log.debug = log.emit.bind(log, "log", "debug");

    log.enabled = true;
    return log;

    function toConsole() {
        if (log.enabled) {
            console.log.apply(console, arguments)
        }
    }
}