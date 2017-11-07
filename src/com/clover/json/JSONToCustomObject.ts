import {Logger} from '../../clover/remote/client/util/Logger';

/**
 * A generic parser to take annotated javascript objects and populate them with
 * raw json data.
 *
 */
export class JSONToCustomObject {

    // Create a logger
    private log: Logger = Logger.create();

    public constructor() {
    }

    /**
     * Copies properties from a plain JavaScript object (sourceObject) into a remote-pay-cloud-api
     * object (targetObject) that contains meta information.
     *
     * Sample call:
     *
     *  const saleRequestJSON = {
     *    amount: 5000,
     *    cardEntryMethods: 1,
     *    externalId: "testexternal",
     *    tipMode: "NO_TIP"
     *  };
     *
     *  const saleRequest = new sdk.remotepay.SaleRequest();
     *  new JSONToCustomObject.transfertoObject(saleRequestJSON, saleRequest, true);
     *
     * @param {Object} sourceObject - A plain JavaScript Object.
     * @param {Object} targetObject - Generally an sdk object that has meta information (getter/setters, etc.)
     * @param attachUnknownProperties - if true, then properties that are not recognized will still be
     *  attached to the returned object, or; if the top level targetObject has no meta information,
     *  then a copy of the passed sourceObject will be returned.
     * @returns {Object | null}
     */
    public transfertoObject(sourceObject: any, targetObject: any, attachUnknownProperties: boolean): any {
        if (typeof sourceObject === "string") {
            // This should not happen, primitives are set outside this.
            // Try to parse it as a json string
            try {
                sourceObject = JSON.parse(sourceObject);
            } catch (e) {
                this.log.warn(e);
            }
        }
        // First see if we can do this
        if (targetObject["getMetaInfo"] && typeof(targetObject.getMetaInfo) === 'function') {
            for (var key in sourceObject) {
                // If the object is null or undefined (I don't think it can be undefined here...)
                // Just set the field on the customobject to null or undefined.
                if (sourceObject[key] === null || sourceObject[key] === undefined) {
                    targetObject[key] = sourceObject[key];
                } else {
                    var metaInfo = targetObject.getMetaInfo(key);
                    if (metaInfo) {
                        // The field exists on the customObject.  Do some checks on type to
                        // make sure we set the field to the proper value.
                        if (this.isPrimitive(metaInfo)) {
                            // Hope for the same type?  There is the possibility
                            // of having different types that are compatible...
                            targetObject[key] = sourceObject[key];
                        } else if (this.isArray(metaInfo)) {
                            var elementType = this.getArrayType(metaInfo);
                            var jsonArray = sourceObject[key];
                            // This must be an array.

                            // The json from remote-pay has this structure for arrays:
                            // foo: { elements : [ element ] }
                            // handle this here
                            if (jsonArray.hasOwnProperty("elements")) {
                                jsonArray = jsonArray.elements;
                            }
                            if (Array.isArray(jsonArray)) {
                                targetObject[key] = [];
                                for (var count = 0; count < jsonArray.length; count++) {
                                    targetObject[key][count] = new elementType;
                                    var copied = this.transfertoObject(jsonArray[count], targetObject[key][count], attachUnknownProperties);
                                    if (copied) {
                                        targetObject[key][count] = copied;
                                    }
                                }
                            } else {
                                // Warn.  We will be tolerant...
                                this.log.warn("Passed json contains field " + key + " of type " + typeof jsonArray +
                                    ".  The field on the object is of type array.  No assignment will be made", jsonArray, sourceObject);
                                if (attachUnknownProperties) {
                                    targetObject["x_" + key] = jsonArray;
                                }
                            }
                        } else if (this.isObject(metaInfo)) {
                            // This is a base object.
                            targetObject[key] = {};
                            var copied = this.transfertoObject(sourceObject[key], targetObject[key], true);
                            if (copied) {
                                targetObject[key] = copied;
                            }
                        } else {
                            var fieldType = metaInfo.type;
                            // Might be an enum.  Check here.
                            if (fieldType[sourceObject[key]]) {
                                // It is an 'enum', grab the enum value.
                                targetObject[key] = fieldType[sourceObject[key]];
                            } else {
                                try {
                                    // The field is not primitive, or an array, or an 'enum'
                                    // Try to create an instance of the type
                                    targetObject[key] = new fieldType;
                                } catch (e) {
                                    this.log.error("fieldType is ", fieldType, ", key is ", key, " for jsonobject ", sourceObject);
                                    throw e;
                                }
                                var copied = this.transfertoObject(sourceObject[key], targetObject[key], attachUnknownProperties);
                                if (copied) {
                                    targetObject[key] = copied;
                                }
                            }
                        }
                    } else if (attachUnknownProperties) {
                        // Add the unknown information as properties.
                        targetObject[key] = JSON.parse(JSON.stringify(sourceObject));
                    }
                }
            }
        } else if (attachUnknownProperties) {
            return JSON.parse(JSON.stringify(sourceObject));
        }
        return null;
    };

    public isPrimitive = function (metaInfo) {
        var variableType = metaInfo.type;
        return (
            variableType === String ||
            variableType === Number ||
            variableType === Boolean );
    };

    public isArray = function (metaInfo) {
        var variableType = metaInfo.type;
        return ( variableType === Array );
    };

    public isObject = function (metaInfo) {
        var variableType = metaInfo.type;
        return ( variableType === Object );
    };

    public getArrayType = function (metaInfo) {
        if (this.isArray(metaInfo)) {
            return metaInfo.elementType;
        }
    };

    /**
     * Not used much.  Could be here for a map, but really do not want to see a map...
     * @param metaInfo
     * @returns {string}
     */
    public getValueType = function (metaInfo) {
        return metaInfo.valueType;
    }
}