var logLevel = 1;

export const LogLevel = {
    TRACE: 1,
    DEBUG: 2,
    INFO: 3,
    WARN: 4,
    ERROR: 5
};

export const Logger = {
    log: function(level = 2, toLog) {
        if (level >= logLevel) {
            console.log(toLog);
            if (level === 5) {
                console.trace();
            }
        }
    }
};