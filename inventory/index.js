module.exports.inventory = inventory;
function inventory() {}

inventory.Attribute = require("./Attribute");
inventory.Category = require("./Category");
inventory.CategoryItem = require("./CategoryItem");
inventory.Discount = require("./Discount");
inventory.Item = require("./Item");
inventory.ItemGroup = require("./ItemGroup");
inventory.ItemModifierGroup = require("./ItemModifierGroup");
inventory.ItemStock = require("./ItemStock");
inventory.Modifier = require("./Modifier");
inventory.ModifierGroup = require("./ModifierGroup");
inventory.Option = require("./Option");
inventory.OptionItem = require("./OptionItem");
inventory.PriceType = require("./PriceType");
inventory.Tag = require("./Tag");
inventory.TagItem = require("./TagItem");
inventory.TagPrinter = require("./TagPrinter");
inventory.TaxRate = require("./TaxRate");
inventory.TaxRateItem = require("./TaxRateItem");
inventory.index = require("./index.js");
//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = inventory;
}