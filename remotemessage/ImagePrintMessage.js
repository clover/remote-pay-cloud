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
  ImagePrintMessage = Class.create(remotemessage_Message, {
    /**
    * Initialize the values for this.
    * @private
    */
    initialize: function($super) {
      $super();
      this._class_ = ImagePrintMessage;
      this.setMethod(remotemessage_Method["PRINT_IMAGE"]);
      this.png = undefined;
      this.urlString = undefined;
    },

    /**
    * Set the field value
    * An image serialized to a base64 encoded byte array
    *
    * @param {Object} png Byte buffer
    */
    setPng: function(png) {
      this.png = png;
    },

    /**
    * Get the field value
    * An image serialized to a base64 encoded byte array
      * @return {Object} Byte buffer
    */
    getPng: function() {
      return this.png;
    },

    /**
    * Set the field value
    * The url of an image.  The url must be accessible from the Clover device.
    *
    * @param {String} urlString 
    */
    setUrlString: function(urlString) {
      this.urlString = urlString;
    },

    /**
    * Get the field value
    * The url of an image.  The url must be accessible from the Clover device.
      * @return {String} 
    */
    getUrlString: function() {
      return this.urlString;
    }
  });

ImagePrintMessage._meta_ =  {fields:  {}};
ImagePrintMessage._meta_.fields["png"] = {};
ImagePrintMessage._meta_.fields["png"].type = Object;
ImagePrintMessage._meta_.fields["urlString"] = {};
ImagePrintMessage._meta_.fields["urlString"].type = String;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
module.exports = ImagePrintMessage;
}

