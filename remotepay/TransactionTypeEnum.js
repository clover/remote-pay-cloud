/**
 * Autogenerated by Avro
 * 
 * DO NOT EDIT DIRECTLY
 */

// Prototype.js required
require("prototype");
var remotepay_TransactionType = require("../remotepay/TransactionType");

  /**
  * @constructor
  */
  TransactionTypeEnum = Class.create( {
    /**
    * Initialize the values for this.
    * @private
    */
    initialize: function() {
      this._class_ = TransactionTypeEnum;
      this.status = undefined;
    },

    /**
    * Set the field value
    * @param {TransactionType} status 
    */
    setStatus: function(status) {
      this.status = status;
    },

    /**
    * Get the field value
    * @return {TransactionType} 
    */
    getStatus: function() {
      return this.status;
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

TransactionTypeEnum._meta_ =  {fields:  {}};
TransactionTypeEnum._meta_.fields["status"] = {};
TransactionTypeEnum._meta_.fields["status"].type = remotepay_TransactionType;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
module.exports = TransactionTypeEnum;
}

