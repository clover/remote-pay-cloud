/**
 * Autogenerated by Avro
 * 
 * DO NOT EDIT DIRECTLY
 */

// Prototype.js required
require("prototype");
var payments_Payment = require("../payments/Payment");

  /**
  * @constructor
  */
  PaymentResponse = Class.create( {
    /**
    * Initialize the values for this.
    * @private
    */
    initialize: function() {
      this._class_ = PaymentResponse;
      this.requestSuccessful = undefined;
      this.responseErrorMessage = undefined;
      this.payment = undefined;
    },

    /**
    * Set the field value
    * @param {Boolean} requestSuccessful 
    */
    setRequestSuccessful: function(requestSuccessful) {
      this.requestSuccessful = requestSuccessful;
    },

    /**
    * Get the field value
    * @return {Boolean} 
    */
    getRequestSuccessful: function() {
      return this.requestSuccessful;
    },

    /**
    * Set the field value
    * @param {String|Null} responseErrorMessage 
    */
    setResponseErrorMessage: function(responseErrorMessage) {
      this.responseErrorMessage = responseErrorMessage;
    },

    /**
    * Get the field value
    * @return {String|Null} 
    */
    getResponseErrorMessage: function() {
      return this.responseErrorMessage;
    },

    /**
    * Set the field value
    * @param {Payment|Null} payment 
    */
    setPayment: function(payment) {
      this.payment = payment;
    },

    /**
    * Get the field value
    * @return {Payment|Null} 
    */
    getPayment: function() {
      return this.payment;
    },
    getMetaInfo: function(fieldName) {
      var curclass = this._class_;
      do {
        var fieldMetaInfo = curclass._meta_.fields[fieldName];
        if(fieldMetaInfo) {
          return fieldMetaInfo;
        }
        curclass = curclass.superclass;
      } while(curclass);
      return null;
    },

    toString: function() {
      return JSON.stringify(this);
    }

  });

PaymentResponse._meta_ =  {fields:  {}};
PaymentResponse._meta_.fields["requestSuccessful"] = {};
PaymentResponse._meta_.fields["requestSuccessful"].type = Boolean;
PaymentResponse._meta_.fields["responseErrorMessage"] = {};
PaymentResponse._meta_.fields["responseErrorMessage"].type = String;
PaymentResponse._meta_.fields["payment"] = {};
PaymentResponse._meta_.fields["payment"].type = payments_Payment;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
module.exports = PaymentResponse;
}

