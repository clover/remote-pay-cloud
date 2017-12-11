import {LogLevel, Logger} from "./Logger";
import * as ActionStatus from "../ActionStatus";

const create = () => {

    const vals = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "M", "N", "P", "Q", "R", "S", "T", "V", "W", "X", "Y", "Z"];

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
                action.result.status = ActionStatus.get().fail;
                this.addMessageToResult(action, message);
            }
            if (log) {
                Logger.log(LogLevel.ERROR, message);
            }
        },

        addMessageToResult: function(action, message) {
            if (message && message.length > 0) {
                if (!action.result.messages) {
                    action.result.messages = [];
                }
                action.result.messages.push(message);
            }
        }
    }
};

export {create}
