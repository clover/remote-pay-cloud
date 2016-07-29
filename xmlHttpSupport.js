//*********************************************
//
//*********************************************
var log = require('./Logger.js').create();

/**
 * Simple class to use the xmlhttp interface
 *
 * @constructor
 */
function XmlHttpSupport() {
    this.xmlhttp = new XMLHttpRequest();

    this.setXmlHttpCallback = function (xmlhttp, endpoint, onDataLoaded, onError) {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    try {
                        if (onDataLoaded) {
                            var data = null;
                            if (xmlhttp.responseText && xmlhttp.responseText != "") {
                                data = JSON.parse(xmlhttp.responseText);
                            }
                            onDataLoaded(data);
                        }
                    } catch (e) {
                        log.error(endpoint, e);
                        if (onDataLoaded) {
                            onDataLoaded({});
                        }
                    }
                }
                else {
                    if (onError) {
                        onError({message: "status returned was not 200", endpoint: endpoint, status: xmlhttp.status});
                    }
                }
            } else {
            }
        }
    }

    this.getResponseHeader = function (headerName) {
        return this.xmlhttp.getResponseHeader(headerName);
    }

    /**
     * Make the REST call to get the data
     */
    this.doXmlHttp = function (method, endpoint, onDataLoaded, onError) {
        this.setXmlHttpCallback(this.xmlhttp, endpoint, onDataLoaded, onError);

        this.xmlhttp.open(method, endpoint, true);
        // Firefox bug
        // https://bugzilla.mozilla.org/show_bug.cgi?id=433859#c4
        // ugh.  About time to go ahead and include a library
        // Not sure how to do browser specific hacks in npm
        if (navigator.userAgent.search("Firefox")) {
            this.xmlhttp.setRequestHeader("Accept", "*/*");
        }

        this.xmlhttp.send();
    }

    this.doXmlHttpSendJson = function (method, sendData, endpoint, onDataLoaded, onError, additionalHeaders) {
        this.setXmlHttpCallback(this.xmlhttp, endpoint, onDataLoaded, onError);

        this.xmlhttp.open(method, endpoint, true);
        if (additionalHeaders) {
            for (var key in additionalHeaders) {
                if (additionalHeaders.hasOwnProperty(key)) {
                    this.xmlhttp.setRequestHeader(key, additionalHeaders[key]);
                }
            }
        }
        if (sendData) {
            this.xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            var sendDataStr = JSON.stringify(sendData);
            this.xmlhttp.send(sendDataStr);
        }
        else {
            this.xmlhttp.send();
        }
    }
    /**
     * Make the REST call to get the data
     */
    this.postData = function (endpoint, onDataLoaded, onError, sendData, additionalHeaders) {
        this.doXmlHttpSendJson("POST", sendData, endpoint, onDataLoaded, onError, additionalHeaders);
    }

    /**
     * Make the REST call to get the data
     */
    this.getData = function (endpoint, onDataLoaded, onError) {
        this.doXmlHttp("GET", endpoint, onDataLoaded, onError)
    }

    /**
     * Make the REST call to get the data
     */
    this.options = function (endpoint, onSuccess, onError) {
        this.doXmlHttp("OPTIONS", endpoint, onSuccess, onError)
    }

    /**
     * Make the REST call to get the data
     */
    this.putData = function (endpoint, onDataLoaded, onError, sendData) {
        this.doXmlHttpSendJson("PUT", sendData, endpoint, onDataLoaded, onError);
    }
    /**
     * Make the REST call to get the data
     */
    this.deleteData = function (endpoint, onDataLoaded, onError) {
        this.doXmlHttp("DELETE", endpoint, onDataLoaded, onError)
    }
}

//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = XmlHttpSupport;
}
