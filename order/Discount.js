/**
 * Autogenerated by Avro
 * 
 * DO NOT EDIT DIRECTLY
 */

// Prototype.js required
require("prototype");
var base_Reference = require("../base/Reference");

  /**
  * @constructor
  */
  Discount = Class.create( {
    /**
    * Initialize the values for this.
    * @private
    */
    initialize: function() {
      this._class_ = Discount;
      this.id = undefined;
      this.orderRef = undefined;
      this.lineItemRef = undefined;
      this.discount = undefined;
      this.name = undefined;
      this.amount = undefined;
      this.percentage = undefined;
    },

    /**
    * Set the field value
    * Unique identifier
    *
    * @param {String} id 
    */
    setId: function(id) {
      this.id = id;
    },

    /**
    * Get the field value
    * Unique identifier
      * @return {String} 
    */
    getId: function() {
      return this.id;
    },

    /**
    * Set the field value
    * The order with which the discount is associated
    *
    * @param {Null|Reference} orderRef 
    */
    setOrderRef: function(orderRef) {
      this.orderRef = orderRef;
    },

    /**
    * Get the field value
    * The order with which the discount is associated
      * @return {Null|Reference} 
    */
    getOrderRef: function() {
      return this.orderRef;
    },

    /**
    * Set the field value
    * The lineItem with which the discount is associated
    *
    * @param {Null|Reference} lineItemRef 
    */
    setLineItemRef: function(lineItemRef) {
      this.lineItemRef = lineItemRef;
    },

    /**
    * Get the field value
    * The lineItem with which the discount is associated
      * @return {Null|Reference} 
    */
    getLineItemRef: function() {
      return this.lineItemRef;
    },

    /**
    * Set the field value
    * If this item is based on a standard discount, this will point to the appropriate inventory.Discount
    *
    * @param {Null|Reference} discount 
    */
    setDiscount: function(discount) {
      this.discount = discount;
    },

    /**
    * Get the field value
    * If this item is based on a standard discount, this will point to the appropriate inventory.Discount
      * @return {Null|Reference} 
    */
    getDiscount: function() {
      return this.discount;
    },

    /**
    * Set the field value
    * Name of the discount
    *
    * @param {String} name 
    */
    setName: function(name) {
      this.name = name;
    },

    /**
    * Get the field value
    * Name of the discount
      * @return {String} 
    */
    getName: function() {
      return this.name;
    },

    /**
    * Set the field value
    * Discount amount in fraction of currency unit (e.g. cents) based on currency fraction digits supported
    *
    * @param {Null|Number} amount must be a long integer
    */
    setAmount: function(amount) {
      this.amount = amount;
    },

    /**
    * Get the field value
    * Discount amount in fraction of currency unit (e.g. cents) based on currency fraction digits supported
      * @return {Null|Number} must be a long integer
    */
    getAmount: function() {
      return this.amount;
    },

    /**
    * Set the field value
    * Discount amount in percent
    *
    * @param {Null|Number} percentage must be a long integer
    */
    setPercentage: function(percentage) {
      this.percentage = percentage;
    },

    /**
    * Get the field value
    * Discount amount in percent
      * @return {Null|Number} must be a long integer
    */
    getPercentage: function() {
      return this.percentage;
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

Discount._meta_ =  {fields:  {}};
Discount._meta_.fields["id"] = {};
Discount._meta_.fields["id"].type = String;
Discount._meta_.fields["orderRef"] = {};
Discount._meta_.fields["orderRef"].type = base_Reference;
Discount._meta_.fields["lineItemRef"] = {};
Discount._meta_.fields["lineItemRef"].type = base_Reference;
Discount._meta_.fields["discount"] = {};
Discount._meta_.fields["discount"].type = base_Reference;
Discount._meta_.fields["name"] = {};
Discount._meta_.fields["name"].type = String;
Discount._meta_.fields["amount"] = {};
Discount._meta_.fields["amount"].type = Number;
Discount._meta_.fields["percentage"] = {};
Discount._meta_.fields["percentage"].type = Number;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
module.exports = Discount;
}

