module.exports.payments = payments;
function payments() {}

payments.AVSResult = require("./AVSResult");
payments.Authorization = require("./Authorization");
payments.Batch = require("./Batch");
payments.BatchCardTotal = require("./BatchCardTotal");
payments.BatchDetail = require("./BatchDetail");
payments.BatchRequest = require("./BatchRequest");
payments.BatchState = require("./BatchState");
payments.BatchTotalStats = require("./BatchTotalStats");
payments.BatchTotalType = require("./BatchTotalType");
payments.BatchType = require("./BatchType");
payments.CVVResult = require("./CVVResult");
payments.CardEntryType = require("./CardEntryType");
payments.CardTransaction = require("./CardTransaction");
payments.CardTransactionState = require("./CardTransactionState");
payments.CardTransactionType = require("./CardTransactionType");
payments.CardType = require("./CardType");
payments.Credit = require("./Credit");
payments.Currency = require("./Currency");
payments.CvmResult = require("./CvmResult");
payments.DCCInfo = require("./DCCInfo");
payments.GatewayTxState = require("./GatewayTxState");
payments.GatewayTxType = require("./GatewayTxType");
payments.GatewayTxs = require("./GatewayTxs");
payments.GiftCard = require("./GiftCard");
payments.GiftCardResponse = require("./GiftCardResponse");
payments.GiftCardState = require("./GiftCardState");
payments.GiftCardTransaction = require("./GiftCardTransaction");
payments.LineItemPayment = require("./LineItemPayment");
payments.OverrideType = require("./OverrideType");
payments.ParamType = require("./ParamType");
payments.Payment = require("./Payment");
payments.PaymentResponse = require("./PaymentResponse");
payments.PaymentTaxRate = require("./PaymentTaxRate");
payments.Refund = require("./Refund");
payments.Result = require("./Result");
payments.ServerTotalStats = require("./ServerTotalStats");
payments.ServiceChargeAmount = require("./ServiceChargeAmount");
payments.Tag = require("./Tag");
payments.TaxableAmountRate = require("./TaxableAmountRate");
payments.TerminalParameter = require("./TerminalParameter");
payments.Transaction = require("./Transaction");
payments.TxType = require("./TxType");
payments.Type = require("./Type");
payments.VaultedCard = require("./VaultedCard");
payments.index = require("./index.js");
//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = payments;
}