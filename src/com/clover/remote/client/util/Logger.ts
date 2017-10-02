import {EventEmitter} from 'events';
import {DebugConfig} from './DebugConfig';

// This is the same but will not work if DebugConfig is updated to ES6+
// import {default as DebugConfig} from '../../../../../../DebugConfig';


/**
 * A simple logging utility that uses the underlying console.
 *
 */
export class Logger extends EventEmitter {
    public enabled: boolean = false;

    constructor() {
        super();
    }

    public static create(): Logger {
        let log = new Logger();

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
            var args = [].slice.call(arguments),
                errorLog = args && args.length > 0 ? args[0] === "error" : false;
            if (errorLog || log.enabled || DebugConfig.loggingEnabled) {
                console.log.apply(console, arguments)
            }
        }
    }

    public silly(...any: any[]) {
    }

    public verbose(...any: any[]) {
    }

    public info(...any: any[]) {
    }

    public warn(...any: any[]) {
    }

    public error(...any: any[]) {
    }

    public debug(...any: any[]) {
    }
}
