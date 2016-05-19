/**
 * Autogenerated by Avro
 * 
 * DO NOT EDIT DIRECTLY
 */

// Prototype.js required
require("prototype");
var remotepay_ResultStatus = require("../remotepay/ResultStatus");

  /**
  * @constructor
  */
  ResultStatusEnum = Class.create( {
    /**
    * Initialize the values for this.
    * @private
    */
    initialize: function() {
      this._class_ = ResultStatusEnum;
      this.status = undefined;
    },

    /**
    * Set the field value
    * @param {ResultStatus} status 
    */
    setStatus: function(status) {
      this.status = status;
    },

    /**
    * Get the field value
    * @return {ResultStatus} 
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

ResultStatusEnum._meta_ =  {fields:  {}};
ResultStatusEnum._meta_.fields["status"] = {};
ResultStatusEnum._meta_.fields["status"].type = remotepay_ResultStatus;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
module.exports = ResultStatusEnum;
}

