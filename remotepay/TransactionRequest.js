/**
 * Autogenerated by Avro
 * 
 * DO NOT EDIT DIRECTLY
 */

// Prototype.js required
require("prototype");
var remotepay_BaseRequest = require("../remotepay/BaseRequest");
var remotepay_TransactionType = require("../remotepay/TransactionType");
var payments_VaultedCard = require("../payments/VaultedCard");

  /**
  * @constructor
  */
  TransactionRequest = Class.create(remotepay_BaseRequest, {
    /**
    * Initialize the values for this.
    * @private
    */
    initialize: function($super) {
      $super();
      this._class_ = TransactionRequest;
      this.disablePrinting = undefined;
      this.cardNotPresent = undefined;
      this.disableRestartTransactionOnFail = undefined;
      this.amount = undefined;
      this.cardEntryMethods = undefined;
      this.vaultedCard = undefined;
      this.externalId = undefined;
      this.type = undefined;
    },

    /**
    * Set the field value
    * Do not print
    *
    * @param {Boolean|Null} disablePrinting 
    */
    setDisablePrinting: function(disablePrinting) {
      this.disablePrinting = disablePrinting;
    },

    /**
    * Get the field value
    * Do not print
      * @return {Boolean|Null} 
    */
    getDisablePrinting: function() {
      return this.disablePrinting;
    },

    /**
    * Set the field value
    * If true then card not present is accepted
    *
    * @param {Boolean|Null} cardNotPresent 
    */
    setCardNotPresent: function(cardNotPresent) {
      this.cardNotPresent = cardNotPresent;
    },

    /**
    * Get the field value
    * If true then card not present is accepted
      * @return {Boolean|Null} 
    */
    getCardNotPresent: function() {
      return this.cardNotPresent;
    },

    /**
    * Set the field value
    * If the transaction times out or fails because of decline, do not restart it
    *
    * @param {Boolean|Null} disableRestartTransactionOnFail 
    */
    setDisableRestartTransactionOnFail: function(disableRestartTransactionOnFail) {
      this.disableRestartTransactionOnFail = disableRestartTransactionOnFail;
    },

    /**
    * Get the field value
    * If the transaction times out or fails because of decline, do not restart it
      * @return {Boolean|Null} 
    */
    getDisableRestartTransactionOnFail: function() {
      return this.disableRestartTransactionOnFail;
    },

    /**
    * Set the field value
    * Total amount paid
    *
    * @param {Number|Null} amount must be a long integer, 
    */
    setAmount: function(amount) {
      this.amount = amount;
    },

    /**
    * Get the field value
    * Total amount paid
      * @return {Number|Null} must be a long integer, 
    */
    getAmount: function() {
      return this.amount;
    },

    /**
    * Set the field value
    * Allowed entry methods
    *
    * @param {Number|Null} cardEntryMethods must be an integer, 
    */
    setCardEntryMethods: function(cardEntryMethods) {
      this.cardEntryMethods = cardEntryMethods;
    },

    /**
    * Get the field value
    * Allowed entry methods
      * @return {Number|Null} must be an integer, 
    */
    getCardEntryMethods: function() {
      return this.cardEntryMethods;
    },

    /**
    * Set the field value
    * A saved card
    *
    * @param {VaultedCard|Null} vaultedCard 
    */
    setVaultedCard: function(vaultedCard) {
      this.vaultedCard = vaultedCard;
    },

    /**
    * Get the field value
    * A saved card
      * @return {VaultedCard|Null} 
    */
    getVaultedCard: function() {
      return this.vaultedCard;
    },

    /**
    * Set the field value
    * An id that will be persisted with transactions.
    *
    * @param {String} externalId 
    */
    setExternalId: function(externalId) {
      this.externalId = externalId;
    },

    /**
    * Get the field value
    * An id that will be persisted with transactions.
      * @return {String} 
    */
    getExternalId: function() {
      return this.externalId;
    },

    /**
    * Set the field value
    * The type of the transaction.
    *
    * @param {TransactionType} type 
    */
    setType: function(type) {
      this.type = type;
    },

    /**
    * Get the field value
    * The type of the transaction.
      * @return {TransactionType} 
    */
    getType: function() {
      return this.type;
    }
  });

TransactionRequest._meta_ =  {fields:  {}};
TransactionRequest._meta_.fields["disablePrinting"] = {};
TransactionRequest._meta_.fields["disablePrinting"].type = Boolean;
TransactionRequest._meta_.fields["cardNotPresent"] = {};
TransactionRequest._meta_.fields["cardNotPresent"].type = Boolean;
TransactionRequest._meta_.fields["disableRestartTransactionOnFail"] = {};
TransactionRequest._meta_.fields["disableRestartTransactionOnFail"].type = Boolean;
TransactionRequest._meta_.fields["amount"] = {};
TransactionRequest._meta_.fields["amount"].type = Number;
TransactionRequest._meta_.fields["cardEntryMethods"] = {};
TransactionRequest._meta_.fields["cardEntryMethods"].type = Number;
TransactionRequest._meta_.fields["vaultedCard"] = {};
TransactionRequest._meta_.fields["vaultedCard"].type = payments_VaultedCard;
TransactionRequest._meta_.fields["externalId"] = {};
TransactionRequest._meta_.fields["externalId"].type = String;
TransactionRequest._meta_.fields["type"] = {};
TransactionRequest._meta_.fields["type"].type = remotepay_TransactionType;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
module.exports = TransactionRequest;
}

