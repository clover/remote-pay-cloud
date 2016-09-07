var log = require('./Logger.js').create();
var sdk = require("remote-pay-cloud-api");

var ICloverConnectorListener = sdk.remotepay.ICloverConnectorListener;

/**
 *  Interface to the Clover remote-pay API.
 *
 *  Defines the interface used to interact with remote pay
 *  adapters.
 */

DelegateCloverConnectorListener  = function(listenersource) {
    ICloverConnectorListener.call(this);
    this.listenersource = listenersource;
};

DelegateCloverConnectorListener.prototype = Object.create(ICloverConnectorListener.prototype);
DelegateCloverConnectorListener.prototype.constructor = DelegateCloverConnectorListener;

/**
 * @return void
 */
DelegateCloverConnectorListener.prototype.onDisconnected = function () {
            this.listenersource.getListeners().forEach(function (element) {
                try {
                    element.onDisconnected();
                } catch (error) {
                    this.handleError("onDisconnected", element, error);
                }
            }.bind(this));
        };

/**
 * @return void
 */
DelegateCloverConnectorListener.prototype.onConnected = function () {
    this.listenersource.getListeners().forEach(function (element) {
        try {
            element.onConnected();
        } catch (error) {
            this.handleError("onConnected", element, error);
        }
    }.bind(this));
};

/**
 * @param {MerchantInfo} merchantInfo
 * @return void
 */
DelegateCloverConnectorListener.prototype.onReady = function (merchantInfo) {
    this.listenersource.getListeners().forEach(function (element) {
        try {
            element.onReady(merchantInfo);
        } catch (error) {
            this.handleError("onReady", element, error);
        }
    }.bind(this));
};

/**
 * @param {CloverDeviceEvent} deviceEvent
 * @return void
 */
DelegateCloverConnectorListener.prototype.onDeviceActivityStart = function (deviceEvent) {
    this.listenersource.getListeners().forEach(function (element) {
        try {
            element.onDeviceActivityStart(deviceEvent);
        } catch (error) {
            this.handleError("onDeviceActivityStart", element, error);
        }
    }.bind(this));
};

/**
 * @param {CloverDeviceEvent} deviceEvent
 * @return void
 */
DelegateCloverConnectorListener.prototype.onDeviceActivityEnd = function (deviceEvent) {
    this.listenersource.getListeners().forEach(function (element) {
        try {
            element.onDeviceActivityEnd(deviceEvent);
        } catch (error) {
            this.handleError("onDeviceActivityEnd", element, error);
        }
    }.bind(this));
};

/**
 * @param {CloverDeviceErrorEvent} deviceErrorEvent
 * @return void
 */
DelegateCloverConnectorListener.prototype.onDeviceError = function (deviceErrorEvent) {
    this.listenersource.getListeners().forEach(function (element) {
        try {
            element.onDeviceError(deviceErrorEvent);
        } catch (error) {
            this.handleError("onDeviceError", element, error);
        }
    }.bind(this));
};

/**
 * @param {AuthResponse} response
 * @return void
 */
DelegateCloverConnectorListener.prototype.onAuthResponse = function (response) {
    this.listenersource.getListeners().forEach(function (element) {
        try {
            element.onAuthResponse(response);
        } catch (error) {
            this.handleError("onAuthResponse", element, error);
        }
    }.bind(this));
};

/**
 * @param {TipAdjustAuthResponse} response
 * @return void
 */
DelegateCloverConnectorListener.prototype.onTipAdjustAuthResponse = function (response) {
    this.listenersource.getListeners().forEach(function (element) {
        try {
            element.onTipAdjustAuthResponse(response);
        } catch (error) {
            this.handleError("onTipAdjustAuthResponse", element, error);
        }
    }.bind(this));
};

/**
 * @param {CapturePreAuthResponse} response
 * @return void
 */
DelegateCloverConnectorListener.prototype.onCapturePreAuthResponse = function (response) {
    this.listenersource.getListeners().forEach(function (element) {
        try {
            element.onCapturePreAuthResponse(response);
        } catch (error) {
            this.handleError("onCapturePreAuthResponse", element, error);
        }
    }.bind(this));
};

/**
 * @param {VerifySignatureRequest} request
 * @return void
 */
DelegateCloverConnectorListener.prototype.onVerifySignatureRequest = function (request) {
    this.listenersource.getListeners().forEach(function (element) {
        try {
            element.onVerifySignatureRequest(request);
        } catch (error) {
            this.handleError("onVerifySignatureRequest", element, error);
        }
    }.bind(this));
};

/**
 * @param {ConfirmPaymentRequest} request
 * @return void
 */
DelegateCloverConnectorListener.prototype.onConfirmPaymentRequest = function (request) {
    this.listenersource.getListeners().forEach(function (element) {
        try {
            element.onConfirmPaymentRequest(request);
        } catch (error) {
            this.handleError("onConfirmPaymentRequest", element, error);
        }
    }.bind(this));
};

/**
 * @param {CloseoutResponse} response
 * @return void
 */
DelegateCloverConnectorListener.prototype.onCloseoutResponse = function (response) {
    this.listenersource.getListeners().forEach(function (element) {
        try {
            element.onCloseoutResponse(response);
        } catch (error) {
            this.handleError("onCloseoutResponse", element, error);
        }
    }.bind(this));
};

/**
 * @param {SaleResponse} response
 * @return void
 */
DelegateCloverConnectorListener.prototype.onSaleResponse = function (response) {
    this.listenersource.getListeners().forEach(function (element) {
        try {
            element.onSaleResponse(response);
        } catch (error) {
            this.handleError("onSaleResponse", element, error);
        }
    }.bind(this));
};

/**
 * @param {ManualRefundResponse} response
 * @return void
 */
DelegateCloverConnectorListener.prototype.onManualRefundResponse = function (response) {
    this.listenersource.getListeners().forEach(function (element) {
        try {
            element.onManualRefundResponse(response);
        } catch (error) {
            this.handleError("onManualRefundResponse", element, error);
        }
    }.bind(this));
};

/**
 * @param {RefundPaymentResponse} response
 * @return void
 */
DelegateCloverConnectorListener.prototype.onRefundPaymentResponse = function (response) {
    this.listenersource.getListeners().forEach(function (element) {
        try {
            element.onRefundPaymentResponse(response);
        } catch (error) {
            this.handleError("onRefundPaymentResponse", element, error);
        }
    }.bind(this));
};

/**
 * @param {TipAdded} tipAdded
 * @return void
 */
DelegateCloverConnectorListener.prototype.onTipAdded = function (tipAdded) {
    this.listenersource.getListeners().forEach(function (element) {
        try {
            element.onTipAdded(tipAdded);
        } catch (error) {
            this.handleError("onTipAdded", element, error);
        }
    }.bind(this));
};

/**
 * @param {VoidPaymentResponse} response
 * @return void
 */
DelegateCloverConnectorListener.prototype.onVoidPaymentResponse = function (response) {
    this.listenersource.getListeners().forEach(function (element) {
        try {
            element.onVoidPaymentResponse(response);
        } catch (error) {
            this.handleError("onVoidPaymentResponse", element, error);
        }
    }.bind(this));
};

/**
 * @param {VaultCardResponse} response
 * @return void
 */
DelegateCloverConnectorListener.prototype.onVaultCardResponse = function (response) {
    this.listenersource.getListeners().forEach(function (element) {
        try {
            element.onVaultCardResponse(response);
        } catch (error) {
            this.handleError("onVaultCardResponse", element, error);
        }
    }.bind(this));
};

/**
 * @param {PreAuthResponse} response
 * @return void
 */
DelegateCloverConnectorListener.prototype.onPreAuthResponse = function (response) {
    this.listenersource.getListeners().forEach(function (element) {
        try {
            element.onPreAuthResponse(response);
        } catch (error) {
            this.handleError("onPreAuthResponse", element, error);
        }
    }.bind(this));
};

/**
 * @param {BaseResponse} response
 * @return void
 */
DelegateCloverConnectorListener.prototype.onLastTransactionResponse = function (response) {
    this.listenersource.getListeners().forEach(function (element) {
        try {
            element.onLastTransactionResponse(response);
        } catch (error) {
            this.handleError("onLastTransactionResponse", element, error);
        }
    }.bind(this));
};

/**
 * Called in response to a retrievePendingPayment(...) request.
 *
 * @param {remotepay.RetrievePendingPaymentsResponse} response
 * @return void
 */
DelegateCloverConnectorListener.prototype.onRetrievePendingPaymentsResponse = function(response) {
    this.listenersource.getListeners().forEach(function (element) {
        try {
            element.onRetrievePendingPaymentsResponse(response);
        } catch (error) {
            this.handleError("onRetrievePendingPaymentsResponse", element, error);
        }
    }.bind(this));
};

/**
 * Called in response to a readCardData(...) request
 * @memberof remotepay.ICloverConnectorListener
 *
 * @param {remotepay.ReadCardDataResponse} response
 * @return {Null}
 */
DelegateCloverConnectorListener.prototype.onReadCardDataResponse = function(response) {
    this.listenersource.getListeners().forEach(function (element) {
        try {
            element.onReadCardDataResponse(response);
        } catch (error) {
            this.handleError("onReadCardDataResponse", element, error);
        }
    }.bind(this));
};

/**
 *
 * @param functionName
 * @param listener
 * @param error
 */
DelegateCloverConnectorListener.prototype.handleError = function(functionName, listener, error) {
    try {
        log.error({"functionName": functionName, "error:": error, "listener": listener});
    }catch(error2){
        // no idea what is going wrong at this point!  Might be the logger or a rouge toString()
        // Hard code this so someone can search for it in the code base if needed.  This is useful when
        // attempting to debug code inside a browser (where files may be combined - i.e. browserify)
        console.log("Unknown Error. Search code base for 93c02644-a530-44af-a0e1-3891d699f817 to find location");
    }
};

//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = DelegateCloverConnectorListener;
}

