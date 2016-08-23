module.exports.remotepay = remotepay;
/**
* @namespace remotepay
*/
function remotepay() {}

remotepay.AuthRequest = require("./AuthRequest");
remotepay.AuthResponse = require("./AuthResponse");
remotepay.BaseRequest = require("./BaseRequest");
remotepay.BaseResponse = require("./BaseResponse");
remotepay.CapturePreAuthRequest = require("./CapturePreAuthRequest");
remotepay.CapturePreAuthResponse = require("./CapturePreAuthResponse");
remotepay.CardInfoRequest = require("./CardInfoRequest");
remotepay.CardInfoResponse = require("./CardInfoResponse");
remotepay.CloseoutRequest = require("./CloseoutRequest");
remotepay.CloseoutResponse = require("./CloseoutResponse");
remotepay.CloverDeviceErrorEvent = require("./CloverDeviceErrorEvent");
remotepay.CloverDeviceEvent = require("./CloverDeviceEvent");
remotepay.ConfirmPaymentRequest = require("./ConfirmPaymentRequest");
remotepay.DeviceErrorEventCode = require("./DeviceErrorEventCode");
remotepay.DeviceEventEnum = require("./DeviceEventEnum");
remotepay.DeviceEventState = require("./DeviceEventState");
remotepay.DeviceInfo = require("./DeviceInfo");
remotepay.DisplayReceiptOptionsRequest = require("./DisplayReceiptOptionsRequest");
remotepay.ErrorType = require("./ErrorType");
remotepay.ICloverConnector = require("./ICloverConnector");
remotepay.ICloverConnectorListener = require("./ICloverConnectorListener");
remotepay.Img = require("./Img");
remotepay.InputOption = require("./InputOption");
remotepay.KeyPress = require("./KeyPress");
remotepay.KeyPressEnum = require("./KeyPressEnum");
remotepay.ManualRefundRequest = require("./ManualRefundRequest");
remotepay.ManualRefundResponse = require("./ManualRefundResponse");
remotepay.MerchantInfo = require("./MerchantInfo");
remotepay.PaymentResponse = require("./PaymentResponse");
remotepay.PreAuthRequest = require("./PreAuthRequest");
remotepay.PreAuthResponse = require("./PreAuthResponse");
remotepay.ReadCardDataRequest = require("./ReadCardDataRequest");
remotepay.ReadCardDataResponse = require("./ReadCardDataResponse");
remotepay.RefundPaymentRequest = require("./RefundPaymentRequest");
remotepay.RefundPaymentResponse = require("./RefundPaymentResponse");
remotepay.ResponseCode = require("./ResponseCode");
remotepay.ResponseCodeEnum = require("./ResponseCodeEnum");
remotepay.ResultStatus = require("./ResultStatus");
remotepay.ResultStatusEnum = require("./ResultStatusEnum");
remotepay.RetrievePendingPaymentsResponse = require("./RetrievePendingPaymentsResponse");
remotepay.SaleRequest = require("./SaleRequest");
remotepay.SaleResponse = require("./SaleResponse");
remotepay.TipAdded = require("./TipAdded");
remotepay.TipAdjustAuthRequest = require("./TipAdjustAuthRequest");
remotepay.TipAdjustAuthResponse = require("./TipAdjustAuthResponse");
remotepay.TransactionRequest = require("./TransactionRequest");
remotepay.TransactionType = require("./TransactionType");
remotepay.TransactionTypeEnum = require("./TransactionTypeEnum");
remotepay.VaultCardRequest = require("./VaultCardRequest");
remotepay.VaultCardResponse = require("./VaultCardResponse");
remotepay.VerifySignatureRequest = require("./VerifySignatureRequest");
remotepay.VoidCreditRequest = require("./VoidCreditRequest");
remotepay.VoidCreditResponse = require("./VoidCreditResponse");
remotepay.VoidPaymentRequest = require("./VoidPaymentRequest");
remotepay.VoidPaymentResponse = require("./VoidPaymentResponse.js");
//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = remotepay;
}