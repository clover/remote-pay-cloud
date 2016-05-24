require("prototype");
var log = require('./Logger.js').create();
var ICloverConnectorListener = require("./remotepay/ICloverConnectorListener.js");

/**
 *  Interface to the Clover remote-pay API.
 *
 *  Defines the interface used to interact with remote pay
 *  adapters.
 */

DelegateCloverConnectorListener = Class.create(ICloverConnectorListener, {

    /**
     *
     * @param {CloverConnectorImpl} listenersource
     */
    initialize: function (listenersource) {
        this.listenersource = listenersource;
    },

    /**
     * @return void
     */
    onDisconnected: function () {
        this.listenersource.getListeners().forEach(function (element) {
            try {
                element.onDisconnected();
            } catch (error) {
                this.handleError("onDisconnected", element, error);
            }
        }.bind(this));
    },

    /**
     * @return void
     */
    onConnected: function () {
        this.listenersource.getListeners().forEach(function (element) {
            try {
                element.onConnected();
            } catch (error) {
                this.handleError("onConnected", element, error);
            }
        }.bind(this));
    },

    /**
     * @param {MerchantInfo} merchantInfo
     * @return void
     */
    onReady: function (merchantInfo) {
        this.listenersource.getListeners().forEach(function (element) {
            try {
                element.onReady(merchantInfo);
            } catch (error) {
                this.handleError("onReady", element, error);
            }
        }.bind(this));
    },

    /**
     * @param {CloverDeviceEvent} deviceEvent
     * @return void
     */
    onDeviceActivityStart: function (deviceEvent) {
        this.listenersource.getListeners().forEach(function (element) {
            try {
                element.onDeviceActivityStart(deviceEvent);
            } catch (error) {
                this.handleError("onDeviceActivityStart", element, error);
            }
        }.bind(this));
    },

    /**
     * @param {CloverDeviceEvent} deviceEvent
     * @return void
     */
    onDeviceActivityEnd: function (deviceEvent) {
        this.listenersource.getListeners().forEach(function (element) {
            try {
                element.onDeviceActivityEnd(deviceEvent);
            } catch (error) {
                this.handleError("onDeviceActivityEnd", element, error);
            }
        }.bind(this));
    },

    /**
     * @param {CloverDeviceErrorEvent} deviceErrorEvent
     * @return void
     */
    onDeviceError: function (deviceErrorEvent) {
        this.listenersource.getListeners().forEach(function (element) {
            try {
                element.onDeviceError(deviceErrorEvent);
            } catch (error) {
                this.handleError("onDeviceError", element, error);
            }
        }.bind(this));
    },

    /**
     * @param {AuthResponse} response
     * @return void
     */
    onAuthResponse: function (response) {
        this.listenersource.getListeners().forEach(function (element) {
            try {
                element.onAuthResponse(response);
            } catch (error) {
                this.handleError("onAuthResponse", element, error);
            }
        }.bind(this));
    },

    /**
     * @param {TipAdjustAuthResponse} response
     * @return void
     */
    onTipAdjustAuthResponse: function (response) {
        this.listenersource.getListeners().forEach(function (element) {
            try {
                element.onTipAdjustAuthResponse(response);
            } catch (error) {
                this.handleError("onTipAdjustAuthResponse", element, error);
            }
        }.bind(this));
    },

    /**
     * @param {CapturePreAuthResponse} response
     * @return void
     */
    onCapturePreAuthResponse: function (response) {
        this.listenersource.getListeners().forEach(function (element) {
            try {
                element.onCapturePreAuthResponse(response);
            } catch (error) {
                this.handleError("onCapturePreAuthResponse", element, error);
            }
        }.bind(this));
    },

    /**
     * @param {VerifySignatureRequest} request
     * @return void
     */
    onVerifySignatureRequest: function (request) {
        this.listenersource.getListeners().forEach(function (element) {
            try {
                element.onVerifySignatureRequest(request);
            } catch (error) {
                this.handleError("onVerifySignatureRequest", element, error);
            }
        }.bind(this));
    },

    /**
     * @param {CloseoutResponse} response
     * @return void
     */
    onCloseoutResponse: function (response) {
        this.listenersource.getListeners().forEach(function (element) {
            try {
                element.onCloseoutResponse(response);
            } catch (error) {
                this.handleError("onCloseoutResponse", element, error);
            }
        }.bind(this));
    },

    /**
     * @param {SaleResponse} response
     * @return void
     */
    onSaleResponse: function (response) {
        this.listenersource.getListeners().forEach(function (element) {
            try {
                element.onSaleResponse(response);
            } catch (error) {
                this.handleError("onSaleResponse", element, error);
            }
        }.bind(this));
    },

    /**
     * @param {ManualRefundResponse} response
     * @return void
     */
    onManualRefundResponse: function (response) {
        this.listenersource.getListeners().forEach(function (element) {
            try {
                element.onManualRefundResponse(response);
            } catch (error) {
                this.handleError("onManualRefundResponse", element, error);
            }
        }.bind(this));
    },

    /**
     * @param {RefundPaymentResponse} response
     * @return void
     */
    onRefundPaymentResponse: function (response) {
        this.listenersource.getListeners().forEach(function (element) {
            try {
                element.onRefundPaymentResponse(response);
            } catch (error) {
                this.handleError("onRefundPaymentResponse", element, error);
            }
        }.bind(this));
    },

    /**
     * @param {TipAdded} tipAdded
     * @return void
     */
    onTipAdded: function (tipAdded) {
        this.listenersource.getListeners().forEach(function (element) {
            try {
                element.onTipAdded(tipAdded);
            } catch (error) {
                this.handleError("onTipAdded", element, error);
            }
        }.bind(this));
    },

    /**
     * @param {VoidPaymentResponse} response
     * @return void
     */
    onVoidPaymentResponse: function (response) {
        this.listenersource.getListeners().forEach(function (element) {
            try {
                element.onVoidPaymentResponse(response);
            } catch (error) {
                this.handleError("onVoidPaymentResponse", element, error);
            }
        }.bind(this));
    },

    /**
     * @param {VaultCardResponse} response
     * @return void
     */
    onVaultCardResponse: function (response) {
        this.listenersource.getListeners().forEach(function (element) {
            try {
                element.onVaultCardResponse(response);
            } catch (error) {
                this.handleError("onVaultCardResponse", element, error);
            }
        }.bind(this));
    },

    /**
     * @param {ConfigErrorResponse} response
     * @return void
     */
    onConfigErrorResponse: function (response) {
        this.listenersource.getListeners().forEach(function (element) {
            try {
                element.onConfigErrorResponse(response);
            } catch (error) {
                this.handleError("onConfigErrorResponse", element, error);
            }
        }.bind(this));
    },

    /**
     * @param {PreAuthResponse} response
     * @return void
     */
    onPreAuthResponse: function (response) {
        this.listenersource.getListeners().forEach(function (element) {
            try {
                element.onPreAuthResponse(response);
            } catch (error) {
                this.handleError("onPreAuthResponse", element, error);
            }
        }.bind(this));
    },

    /**
     * @param {BaseResponse} response
     * @return void
     */
    onLastTransactionResponse: function (response) {
        this.listenersource.getListeners().forEach(function (element) {
            try {
                element.onLastTransactionResponse(response);
            } catch (error) {
                this.handleError("onLastTransactionResponse", element, error);
            }
        }.bind(this));
    },

    /**
     * 
     * @param functionName
     * @param listener
     * @param error
     */
    handleError: function(functionName, listener, error) {
        try {
            log.error({"functionName": functionName, "error:": error, "listener": listener});
        }catch(error2){
            // no idea what is going wrong at this point!  Might be the logger or a rouge toString()
            // Hard code this so someone can search for it in the code base if needed.  This is useful when
            // attempting to debug code inside a browser (where files may be combined - i.e. browserify)
            console.log("Unknown Error. Search code base for 93c02644-a530-44af-a0e1-3891d699f817 to find location");
        }
    }
});


//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = DelegateCloverConnectorListener;
}

