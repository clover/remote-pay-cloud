import {Logger} from '../remote/client/util/Logger';

/**
 * Interface used to abstract implementation details to allow for NodeJS and
 * Browser usage of the library.
 *
 */
export class HttpSupport {

    // Create a logger - when we need it
    protected logger: Logger = Logger.create();

    /**
     * This is the xmlhttprequest implementation.  This is odd,
     * but it is how we can keep ourselves from being tied to a browser.
     *
     * A NodeJS app that uses this library would pass in a different
     * object than a browser implementation.  NodeJS has an object that
     * satisfies the requirements of the xmlhttprequest (looks the same).
     *
     * https://www.npmjs.com/package/xmlhttprequest
     */
    xmlHttpImplClass: any;

    public constructor(xmlHttpImplClass: any) {
        this.xmlHttpImplClass = xmlHttpImplClass;
    }

    private setXmlHttpCallback(xmlHttpInst: any, endpoint: string, onDataLoaded: Function, onError: Function): void {
        xmlHttpInst.onreadystatechange = function () {
            if (xmlHttpInst.readyState == 4) {
                if (xmlHttpInst.status == 200) {
                    try {
                        if (onDataLoaded) {
                            var data = null;
                            if (xmlHttpInst.responseText && xmlHttpInst.responseText != "") {
                                data = JSON.parse(xmlHttpInst.responseText);
                            }
                            onDataLoaded(data, xmlHttpInst);
                        }
                    } catch (e) {
                        this.logger.error(endpoint, e);
                        if (onDataLoaded) {
                            onDataLoaded({});
                        }
                    }
                }
                else {
                    if (onError) {
                        onError({
                            message: "status returned was not 200",
                            endpoint: endpoint,
                            status: xmlHttpInst.status
                        });
                    }
                }
            } else {
            }
        }.bind(this);
    }

    /**
     * Make the REST call to get the data
     */
    public doXmlHttp(method: string, endpoint: string, onDataLoaded: Function, onError: Function): void {
        const xmlHttp = new this.xmlHttpImplClass();
        this.setXmlHttpCallback(xmlHttp, endpoint, onDataLoaded, onError);
        xmlHttp.open(method, endpoint, true);
        // Handle the following Firefox bug - https://bugzilla.mozilla.org/show_bug.cgi?id=433859#c4
        // This check can only be performed in a browser environment so make sure navigator is defined first.
        if (typeof(navigator) !== "undefined" && navigator.userAgent.search("Firefox")) {
            xmlHttp.setRequestHeader("Accept", "*/*");
        }

        xmlHttp.send();
    }

    public doXmlHttpSendJson(method: string, sendData: any, endpoint: string, onDataLoaded: Function, onError: Function, additionalHeaders?: any): void {
        const xmlHttp = new this.xmlHttpImplClass();
        this.setXmlHttpCallback(xmlHttp, endpoint, onDataLoaded, onError);

        xmlHttp.open(method, endpoint, true);
        if (additionalHeaders) {
            for (var key in additionalHeaders) {
                if (additionalHeaders.hasOwnProperty(key)) {
                    xmlHttp.setRequestHeader(key, additionalHeaders[key]);
                }
            }
        }
        if (sendData) {
            xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            var sendDataStr = JSON.stringify(sendData);
            xmlHttp.send(sendDataStr);
        }
        else {
            xmlHttp.send();
        }
    }

    /**
     * Make the REST call to get the data
     */
    public postData(endpoint: string, onDataLoaded: Function, onError: Function, sendData: any, additionalHeaders?: any): void {
        this.doXmlHttpSendJson("POST", sendData, endpoint, onDataLoaded, onError, additionalHeaders);
    }

    /**
     * Make the REST call to get the data
     */
    public getData(endpoint: string, onDataLoaded: Function, onError: Function): void {
        this.doXmlHttp("GET", endpoint, onDataLoaded, onError)
    }

    /**
     * Make the REST call to get the data
     */
    public options(endpoint: string, onDataLoaded: Function, onError: Function): void {
        this.doXmlHttp("OPTIONS", endpoint, onDataLoaded, onError)
    }

    /**
     * Make the REST call to get the data
     */
    public putData(endpoint: string, onDataLoaded: Function, onError: Function, sendData: any): void {
        this.doXmlHttpSendJson("PUT", sendData, endpoint, onDataLoaded, onError);
    }

    /**
     * Make the REST call to get the data
     */
    public deleteData(endpoint: string, onDataLoaded: Function, onError: Function): void {
        this.doXmlHttp("DELETE", endpoint, onDataLoaded, onError)
    }
}