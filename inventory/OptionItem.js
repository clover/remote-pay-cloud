/**
 * Autogenerated by Avro
 * 
 * DO NOT EDIT DIRECTLY
 */

// Prototype.js required
require("prototype");
var base_Reference = require("../base/Reference");

/** This class represents the association between an item and an option */
  /**
  * @constructor
  */
  OptionItem = Class.create( {
    /**
    * Initialize the values for this.
    * @private
    */
    initialize: function() {
      this._class_ = OptionItem;
      this.option = undefined;
      this.item = undefined;
    },

    /**
    * Set the field value
    * Reference to an option
    *
    * @param {Null|Reference} option 
    */
    setOption: function(option) {
      this.option = option;
    },

    /**
    * Get the field value
    * Reference to an option
      * @return {Null|Reference} 
    */
    getOption: function() {
      return this.option;
    },

    /**
    * Set the field value
    * Reference to an item
    *
    * @param {Null|Reference} item 
    */
    setItem: function(item) {
      this.item = item;
    },

    /**
    * Get the field value
    * Reference to an item
      * @return {Null|Reference} 
    */
    getItem: function() {
      return this.item;
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

OptionItem._meta_ =  {fields:  {}};
OptionItem._meta_.fields["option"] = {};
OptionItem._meta_.fields["option"].type = base_Reference;
OptionItem._meta_.fields["item"] = {};
OptionItem._meta_.fields["item"].type = base_Reference;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
module.exports = OptionItem;
}

