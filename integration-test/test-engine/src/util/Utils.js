import {LogLevel, Logger} from "./Logger";

const create = () => {

    return {

        /**
         * Does expected match actual?
         *
         * @param expected []
         * @param actual []
         * @param regExMatchingEnabled boolean
         * @returns {boolean}
         */
        match: function(expected, actual, regExMatchingEnabled = true) {
            if (!expected) {
                expected = [];
            }

            if (!actual) {
                actual = [];
            }

            if (!lodash.isArray(expected) || !lodash.isArray(actual)) {
                Logger.log(LogLevel.WARN, "Utils.match - expected and actual must be arrays.");
                return false;
            }

            if (expected.length !== actual.length) {
                return false;
            }

            for (let i = 0; i < expected.length; i++) {
                if (!this.equals(expected[i], actual[i], regExMatchingEnabled)) {
                    return false;
                }
            }

            return true;
        },

        /**
         * Does arr contain obj?
         *
         * @param actualArr
         * @param expectedObj
         * @param regExMatchingEnabled
         * @returns {boolean}
         */
        contains: function(actualArr, expectedObj, regExMatchingEnabled = true) {
            return this.occurrencesIn(actualArr, expectedObj, regExMatchingEnabled) > 0;
        },

        /**
         * How many times is obj in array?
         *
         * @param actualArr
         * @param expectedObj
         * @param regExMatchingEnabled
         * @returns {number}
         */
        occurrencesIn: function(actualArr, expectedObj, regExMatchingEnabled = true) {
            let count = 0;
            if (!actualArr) {
                actualArr = [];
            }

            if (!expectedObj) {
                expectedObj = {};
            }

            // Remove the count property, if it exists.
            const expectedObjForCompare = Object.assign({}, expectedObj);
            lodash.unset(expectedObjForCompare, "count");

            if (!lodash.isArray(actualArr) || !lodash.isObject(expectedObjForCompare)) {
                Logger.log(LogLevel.WARN, "Utils.match - the first parameter must be an array and the second parameter must be an object.");
                return 0;
            }

            for (let i = 0; i < actualArr.length; i++) {
                if (this.equals(expectedObjForCompare, actualArr[i], regExMatchingEnabled)) {
                    count++;
                }
            }

            return count;
        },

        /**
         * Does actual contain all items in expected, in the same order?
         * This check disregards items found in actual that do not exist in
         * expected.
         *
         * @param expected []
         * @param actual []
         * @param regExMatchingEnabled boolean
         * @returns {boolean}
         */
        containsSequence: function(expected, actual, regExMatchingEnabled = true) {
            if (!lodash.isArray(expected) || !lodash.isArray(actual)) {
                Logger.log(LogLevel.WARN, "Utils.containsSequence - expected and actual must be arrays.");
                return false;
            }

            let lastExpectedIndexFound = 0;
            let expectedMatchCount = 0;
            for (let i = 0; i < actual.length; i++) {
                if (this.equals(expected[lastExpectedIndexFound], actual[i], regExMatchingEnabled)) {
                    lastExpectedIndexFound++;
                    expectedMatchCount++;
                }
            }

            if (expectedMatchCount === expected.length) {
                return true;
            }

            return false;
        },

        /**
         * Performs an equality check on two objects.
         *
         * @param expected object
         * @param actual object
         * @param regExMatchingEnabled boolean
         * @returns {*}
         */
        equals: function(expected, actual, regExMatchingEnabled = true) {
            if (!lodash.isObject(expected) || !lodash.isObject(actual)) {
                Logger.log(LogLevel.WARN, "Utils.equals - expected and actual must be objects.");
                return false;
            }

            const equals = lodash.isEqual(expected, actual);
            if (!regExMatchingEnabled || equals) {
                return equals;
            }

            // If the objects are not equal according to lodash, perform a more detailed check.
            // Only check properties on actual that exist on expected as the payload to assert on
            // may have an incomplete property set defined, also perform regExMatching if specified.
            let matchFound = true;
            lodash.forOwn(expected, (value, key) => {
                matchFound = lodash.isEqual(value, actual[key]);
                if (!matchFound && regExMatchingEnabled) {
                    const pattern = new RegExp(value);
                    matchFound = pattern.exec(actual[key]) != null;
                }
                if (!matchFound) {
                    return false;
                }
            });

            return matchFound;
        }

    }

};

export {create}
