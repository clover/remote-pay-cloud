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
  Tag = Class.create( {
    /**
    * Initialize the values for this.
    * @private
    */
    initialize: function() {
      this._class_ = Tag;
      this.tag = undefined;
      this.length = undefined;
      this.value = undefined;
      this.description = undefined;
      this.optional = undefined;
      this.filter = undefined;
    },

    /**
    * Set the field value
    * @param {String} tag 
    */
    setTag: function(tag) {
      this.tag = tag;
    },

    /**
    * Get the field value
    * @return {String} 
    */
    getTag: function() {
      return this.tag;
    },

    /**
    * Set the field value
    * @param {String} length 
    */
    setLength: function(length) {
      this.length = length;
    },

    /**
    * Get the field value
    * @return {String} 
    */
    getLength: function() {
      return this.length;
    },

    /**
    * Set the field value
    * @param {String} value 
    */
    setValue: function(value) {
      this.value = value;
    },

    /**
    * Get the field value
    * @return {String} 
    */
    getValue: function() {
      return this.value;
    },

    /**
    * Set the field value
    * @param {String} description 
    */
    setDescription: function(description) {
      this.description = description;
    },

    /**
    * Get the field value
    * @return {String} 
    */
    getDescription: function() {
      return this.description;
    },

    /**
    * Set the field value
    * @param {String} optional 
    */
    setOptional: function(optional) {
      this.optional = optional;
    },

    /**
    * Get the field value
    * @return {String} 
    */
    getOptional: function() {
      return this.optional;
    },

    /**
    * Set the field value
    * @param {String} filter 
    */
    setFilter: function(filter) {
      this.filter = filter;
    },

    /**
    * Get the field value
    * @return {String} 
    */
    getFilter: function() {
      return this.filter;
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

Tag._meta_ =  {fields:  {}};
Tag._meta_.fields["tag"] = {};
Tag._meta_.fields["tag"].type = String;
Tag._meta_.fields["length"] = {};
Tag._meta_.fields["length"].type = String;
Tag._meta_.fields["value"] = {};
Tag._meta_.fields["value"].type = String;
Tag._meta_.fields["description"] = {};
Tag._meta_.fields["description"].type = String;
Tag._meta_.fields["optional"] = {};
Tag._meta_.fields["optional"].type = String;
Tag._meta_.fields["filter"] = {};
Tag._meta_.fields["filter"].type = String;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
module.exports = Tag;
}

