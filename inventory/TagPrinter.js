/**
 * Autogenerated by Avro
 * 
 * DO NOT EDIT DIRECTLY
 */

// Prototype.js required
require("prototype");
var printer_Printer = require("../printer/Printer");
var inventory_Tag = require("../inventory/Tag");

  /**
  * @constructor
  */
  TagPrinter = Class.create( {
    /**
    * Initialize the values for this.
    * @private
    */
    initialize: function() {
      this._class_ = TagPrinter;
      this.tag = undefined;
      this.printer = undefined;
    },

    /**
    * Set the field value
    * @param {Tag} tag 
    */
    setTag: function(tag) {
      this.tag = tag;
    },

    /**
    * Get the field value
    * @return {Tag} 
    */
    getTag: function() {
      return this.tag;
    },

    /**
    * Set the field value
    * @param {Printer} printer 
    */
    setPrinter: function(printer) {
      this.printer = printer;
    },

    /**
    * Get the field value
    * @return {Printer} 
    */
    getPrinter: function() {
      return this.printer;
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

TagPrinter._meta_ =  {fields:  {}};
TagPrinter._meta_.fields["tag"] = {};
TagPrinter._meta_.fields["tag"].type = inventory_Tag;
TagPrinter._meta_.fields["printer"] = {};
TagPrinter._meta_.fields["printer"].type = printer_Printer;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
module.exports = TagPrinter;
}

