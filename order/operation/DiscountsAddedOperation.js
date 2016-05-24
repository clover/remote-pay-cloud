/**
 * Autogenerated by Avro
 * 
 * DO NOT EDIT DIRECTLY
 */

// Prototype.js required
require("prototype");

  /**
  * @constructor
  */
  DiscountsAddedOperation = Class.create( {
    /**
    * Initialize the values for this.
    * @private
    */
    initialize: function() {
      this._class_ = DiscountsAddedOperation;
      this.ids = undefined;
      this.orderId = undefined;
    },

    /**
    * Set the field value
    * @param {Array.<String>} ids An array of 
    */
    setIds: function(ids) {
      this.ids = ids;
    },

    /**
    * Get the field value
    * @return {Array.<String>} An array of 
    */
    getIds: function() {
      return this.ids;
    },

    /**
    * Set the field value
    * @param {String} orderId 
    */
    setOrderId: function(orderId) {
      this.orderId = orderId;
    },

    /**
    * Get the field value
    * @return {String} 
    */
    getOrderId: function() {
      return this.orderId;
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

DiscountsAddedOperation._meta_ =  {fields:  {}};
DiscountsAddedOperation._meta_.fields["ids"] = {};
DiscountsAddedOperation._meta_.fields["ids"].type = Array;
DiscountsAddedOperation._meta_.fields["orderId"] = {};
DiscountsAddedOperation._meta_.fields["orderId"].type = String;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
module.exports = DiscountsAddedOperation;
}

