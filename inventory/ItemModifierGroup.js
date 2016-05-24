/**
 * Autogenerated by Avro
 * 
 * DO NOT EDIT DIRECTLY
 */

// Prototype.js required
require("prototype");
var inventory_ModifierGroup = require("../inventory/ModifierGroup");
var inventory_Item = require("../inventory/Item");

  /**
  * @constructor
  */
  ItemModifierGroup = Class.create( {
    /**
    * Initialize the values for this.
    * @private
    */
    initialize: function() {
      this._class_ = ItemModifierGroup;
      this.item = undefined;
      this.modifierGroup = undefined;
    },

    /**
    * Set the field value
    * @param {Item} item 
    */
    setItem: function(item) {
      this.item = item;
    },

    /**
    * Get the field value
    * @return {Item} 
    */
    getItem: function() {
      return this.item;
    },

    /**
    * Set the field value
    * @param {ModifierGroup} modifierGroup 
    */
    setModifierGroup: function(modifierGroup) {
      this.modifierGroup = modifierGroup;
    },

    /**
    * Get the field value
    * @return {ModifierGroup} 
    */
    getModifierGroup: function() {
      return this.modifierGroup;
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

ItemModifierGroup._meta_ =  {fields:  {}};
ItemModifierGroup._meta_.fields["item"] = {};
ItemModifierGroup._meta_.fields["item"].type = inventory_Item;
ItemModifierGroup._meta_.fields["modifierGroup"] = {};
ItemModifierGroup._meta_.fields["modifierGroup"].type = inventory_ModifierGroup;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
module.exports = ItemModifierGroup;
}

