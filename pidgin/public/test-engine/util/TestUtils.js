import {LogLevel, Logger} from "./Logger";

const create = () => {

    var vals = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "M", "N", "P", "Q", "R", "S", "T", "V", "W", "X", "Y", "Z"];

    return {
        getNextId: function () {
            const id = [];
            for (let i = 0; i < 13; i++) {
                let idx = Math.floor(Math.random() * vals.length);
                id.push(vals[idx]);
            }
            return id.join("");
        },

        handleActionFailure: function (action, message, log = false) {
            if (action) {
                if (!lodash.has(action, "result")) {
                    lodash.set(action, "result", {});
                }
                action.result.pass = false;
                action.result.reason = message;
            }
            if (log) {
                Logger.log(LogLevel.ERROR, message);
            }
        }
    }
};

export {create}
