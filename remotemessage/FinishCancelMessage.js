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
  FinishCancelMessage = Class.create(remotemessage_Message, {
    /**
    * Initialize the values for this.
    * @private
    */
    initialize: function($super) {
      $super();
      this._class_ = FinishCancelMessage;
      this.setMethod(remotemessage_Method["FINISH_CANCEL"]);
    }
  });

FinishCancelMessage._meta_ =  {fields:  {}};

//
// Expose the module.
//
if ('undefined' !== typeof module) {
module.exports = FinishCancelMessage;
}

