/**
 * Autogenerated by Avro
 * 
 * DO NOT EDIT DIRECTLY
 */

// Prototype.js required
require("prototype");
var remotemessage_Method = require("../remotemessage/Method");
var remotemessage_Message = require("../remotemessage/Message");

  /**
  * @constructor
  */
  TipAddedMessage = Class.create(remotemessage_Message, {
    /**
    * Initialize the values for this.
    * @private
    */
    initialize: function($super) {
      $super();
      this._class_ = TipAddedMessage;
      this.setMethod(remotemessage_Method["TIP_ADDED"]);
      this.tipAmount = undefined;
    },

    /**
    * Set the field value
    * Amount paid in tips
    *
    * @param {Number} tipAmount must be a long integer
    */
    setTipAmount: function(tipAmount) {
      this.tipAmount = tipAmount;
    },

    /**
    * Get the field value
    * Amount paid in tips
      * @return {Number} must be a long integer
    */
    getTipAmount: function() {
      return this.tipAmount;
    }
  });

TipAddedMessage._meta_ =  {fields:  {}};
TipAddedMessage._meta_.fields["tipAmount"] = {};
TipAddedMessage._meta_.fields["tipAmount"].type = Number;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
module.exports = TipAddedMessage;
}

