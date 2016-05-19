/**
 * Autogenerated by Avro
 * 
 * DO NOT EDIT DIRECTLY
 */

// Prototype.js required
require("prototype");
var base_Reference = require("../base/Reference");
var inventory_Modifier = require("../inventory/Modifier");

  /**
  * @constructor
  */
  ModifierGroup = Class.create( {
    /**
    * Initialize the values for this.
    * @private
    */
    initialize: function() {
      this._class_ = ModifierGroup;
      this.id = undefined;
      this.name = undefined;
      this.alternateName = undefined;
      this.minRequired = undefined;
      this.maxAllowed = undefined;
      this.showByDefault = true;
      this.modifiers = undefined;
      this.modifierIds = undefined;
      this.items = undefined;
    },

    /**
    * Set the field value
    * @param {String} id 
    */
    setId: function(id) {
      this.id = id;
    },

    /**
    * Get the field value
    * @return {String} 
    */
    getId: function() {
      return this.id;
    },

    /**
    * Set the field value
    * Name of the modifier group
    *
    * @param {String} name 
    */
    setName: function(name) {
      this.name = name;
    },

    /**
    * Get the field value
    * Name of the modifier group
      * @return {String} 
    */
    getName: function() {
      return this.name;
    },

    /**
    * Set the field value
    * @param {String} alternateName 
    */
    setAlternateName: function(alternateName) {
      this.alternateName = alternateName;
    },

    /**
    * Get the field value
    * @return {String} 
    */
    getAlternateName: function() {
      return this.alternateName;
    },

    /**
    * Set the field value
    * @param {Number} minRequired must be an integer
    */
    setMinRequired: function(minRequired) {
      this.minRequired = minRequired;
    },

    /**
    * Get the field value
    * @return {Number} must be an integer
    */
    getMinRequired: function() {
      return this.minRequired;
    },

    /**
    * Set the field value
    * @param {Number} maxAllowed must be an integer
    */
    setMaxAllowed: function(maxAllowed) {
      this.maxAllowed = maxAllowed;
    },

    /**
    * Get the field value
    * @return {Number} must be an integer
    */
    getMaxAllowed: function() {
      return this.maxAllowed;
    },

    /**
    * Set the field value
    * @param {Boolean} showByDefault 
    */
    setShowByDefault: function(showByDefault) {
      this.showByDefault = showByDefault;
    },

    /**
    * Get the field value
    * @return {Boolean} 
    */
    getShowByDefault: function() {
      return this.showByDefault;
    },

    /**
    * Set the field value
    * @param {Array.<Modifier>} modifiers An array of 
    */
    setModifiers: function(modifiers) {
      this.modifiers = modifiers;
    },

    /**
    * Get the field value
    * @return {Array.<Modifier>} An array of 
    */
    getModifiers: function() {
      return this.modifiers;
    },

    /**
    * Set the field value
    * The ordered, comma-separated list of modifier ids in this group.
    *
    * @param {String} modifierIds 
    */
    setModifierIds: function(modifierIds) {
      this.modifierIds = modifierIds;
    },

    /**
    * Get the field value
    * The ordered, comma-separated list of modifier ids in this group.
      * @return {String} 
    */
    getModifierIds: function() {
      return this.modifierIds;
    },

    /**
    * Set the field value
    * @param {Array.<Reference>} items An array of 
    */
    setItems: function(items) {
      this.items = items;
    },

    /**
    * Get the field value
    * @return {Array.<Reference>} An array of 
    */
    getItems: function() {
      return this.items;
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

ModifierGroup._meta_ =  {fields:  {}};
ModifierGroup._meta_.fields["id"] = {};
ModifierGroup._meta_.fields["id"].type = String;
ModifierGroup._meta_.fields["name"] = {};
ModifierGroup._meta_.fields["name"].type = String;
ModifierGroup._meta_.fields["alternateName"] = {};
ModifierGroup._meta_.fields["alternateName"].type = String;
ModifierGroup._meta_.fields["minRequired"] = {};
ModifierGroup._meta_.fields["minRequired"].type = Number;
ModifierGroup._meta_.fields["maxAllowed"] = {};
ModifierGroup._meta_.fields["maxAllowed"].type = Number;
ModifierGroup._meta_.fields["showByDefault"] = {};
ModifierGroup._meta_.fields["showByDefault"].type = Boolean;
ModifierGroup._meta_.fields["modifiers"] = {};
ModifierGroup._meta_.fields["modifiers"].type = Array;
ModifierGroup._meta_.fields["modifiers"].elementType = inventory_Modifier;
ModifierGroup._meta_.fields["modifierIds"] = {};
ModifierGroup._meta_.fields["modifierIds"].type = String;
ModifierGroup._meta_.fields["items"] = {};
ModifierGroup._meta_.fields["items"].type = Array;
ModifierGroup._meta_.fields["items"].elementType = base_Reference;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
module.exports = ModifierGroup;
}

