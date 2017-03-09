import { EventEmitter } from 'events';
import DebugConfig = require('../../../../../../DebugConfig');

export class Logger extends EventEmitter {
	enabled: boolean = false;

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
			if (log.enabled || DebugConfig.loggingEnabled) {
				console.log.apply(console, arguments)
			}
		}
	}

	public silly(any: any) {}

	public verbose(any: any) {}

	public info(any: any) {}

	public warn(any: any) {}

	public error(any: any) {}

	public debug(any: any) {}
}

export default Logger;
