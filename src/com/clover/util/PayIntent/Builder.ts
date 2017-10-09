import * as sdk from 'remote-pay-cloud-api';

/**
 * Used to more closely match patterns used in other SDK's to allow for easier maintenance.
 *
 */
export namespace PayIntent {
    export class Builder {
        private action: string;
        private amount: number;
        /** @Deprecated // Please use TransactionSettings */
        private tippableAmount: number;
        private tipAmount: number;
        private taxAmount: number;
        private orderId: string;
        private paymentId: string;
        private employeeId: string;
        private transactionType: sdk.remotemessage.TransactionType;
        private taxableAmountRates: Array<sdk.payments.TaxableAmountRate>;
        private serviceChargeAmount: sdk.payments.ServiceChargeAmount;
        /** @Deprecated // Please use TransactionSettings */
        private isDisableCashBack: boolean = false;
        private isTesting: boolean = false;
        /** @Deprecated // Please use TransactionSettings */
        private cardEntryMethods: number;
        private voiceAuthCode: string;
        private postalCode: string;
        private streetAddress: string;
        private isCardNotPresent: boolean = false;
        private cardDataMessage: string;
        /** @Deprecated // Please use TransactionSettings */
        private remotePrint: boolean = false;
        private transactionNo: string;
        /** @Deprecated // Please use TransactionSettings */
        private isForceSwipePinEntry: boolean = false;
        /** @Deprecated // Please use TransactionSettings */
        private disableRestartTransactionWhenFailed: boolean = false;
        // Can be set to the properly formatted uuid for a payment (
        private externalPaymentId: string;
        private vaultedCard: sdk.payments.VaultedCard;
        /** @Deprecated // Please use TransactionSettings */
        private allowOfflinePayment: boolean;
        /** @Deprecated // Please use TransactionSettings */
        private approveOfflinePaymentWithoutPrompt: boolean;
        private requiresRemoteConfirmation: boolean;
        private applicationTracking: sdk.apps.AppTracking;
        private allowPartialAuth: boolean = true;
        private germanInfo: sdk.payments.GermanInfo;
        private cashAdvanceCustomerIdentification: sdk.payments.CashAdvanceCustomerIdentification;
        private transactionSettings: sdk.payments.TransactionSettings;

        public static buildTransactionSettingsFromPayIntent(payIntent: sdk.remotemessage.PayIntent): sdk.payments.TransactionSettings {
            let transactionSettings: sdk.payments.TransactionSettings = new sdk.payments.TransactionSettings();

            transactionSettings.setCloverShouldHandleReceipts(!payIntent.getRemotePrint());
            transactionSettings.setDisableRestartTransactionOnFailure(payIntent.getDisableRestartTransactionWhenFailed());
            transactionSettings.setForcePinEntryOnSwipe(payIntent.getIsForceSwipePinEntry());
            transactionSettings.setDisableCashBack(payIntent.getIsDisableCashBack());
            transactionSettings.setAllowOfflinePayment(payIntent.getAllowOfflinePayment());
            transactionSettings.setApproveOfflinePaymentWithoutPrompt(payIntent.getApproveOfflinePaymentWithoutPrompt());
            transactionSettings.setCardEntryMethods(payIntent.getCardEntryMethods());
            transactionSettings.setDisableDuplicateCheck(false); // default
            transactionSettings.setDisableReceiptSelection(false); // default
            transactionSettings.setSignatureEntryLocation(null); // will default to clover setting
            transactionSettings.setTipMode(null); // will default to clover setting
            transactionSettings.setTippableAmount(payIntent.getTippableAmount());

            return transactionSettings;
        }

        public payment(payment: sdk.payments.Payment): Builder {
            this.amount = payment.getAmount();
            this.tipAmount = payment.getTipAmount();
            this.taxAmount = payment.getTaxAmount();
            this.employeeId = payment.getEmployee().getId();
            this.transactionNo = payment.getCardTransaction() ? payment.getCardTransaction().getTransactionNo() : null;
            this.transactionSettings = payment.getTransactionSettings();
            return this;
        }

        public payIntent(payIntent: sdk.remotemessage.PayIntent): Builder {
            this.action = payIntent.getAction();
            this.amount = payIntent.getAmount();
            this.tippableAmount = payIntent.getTippableAmount();
            this.tipAmount = payIntent.getTipAmount();
            this.taxAmount = payIntent.getTaxAmount();
            this.orderId = payIntent.getOrderId();
            this.paymentId = payIntent.getPaymentId();
            this.employeeId = payIntent.getEmployeeId();
            this.transactionType = payIntent.getTransactionType();
            this.taxableAmountRates = payIntent.getTaxableAmountRates();
            this.serviceChargeAmount = payIntent.getServiceChargeAmount();
            this.isDisableCashBack = payIntent.getIsDisableCashBack();
            this.isTesting = payIntent.getIsTesting();
            this.cardEntryMethods = payIntent.getCardEntryMethods();
            this.voiceAuthCode = payIntent.getVoiceAuthCode();
            this.postalCode = payIntent.getPostalCode();
            this.streetAddress = payIntent.getStreetAddress();
            this.isCardNotPresent = payIntent.getIsCardNotPresent();
            this.cardDataMessage = payIntent.getCardDataMessage();
            this.remotePrint = payIntent.getRemotePrint();
            this.transactionNo = payIntent.getTransactionNo();
            this.isForceSwipePinEntry = payIntent.getIsForceSwipePinEntry();
            this.disableRestartTransactionWhenFailed = payIntent.getDisableRestartTransactionWhenFailed();
            this.externalPaymentId = payIntent.getExternalPaymentId();
            this.vaultedCard = payIntent.getVaultedCard();
            this.allowOfflinePayment = payIntent.getAllowOfflinePayment();
            this.approveOfflinePaymentWithoutPrompt = payIntent.getApproveOfflinePaymentWithoutPrompt();
            this.requiresRemoteConfirmation = payIntent.getRequiresRemoteConfirmation();
            this.applicationTracking = payIntent.getApplicationTracking();
            this.allowPartialAuth = payIntent.getAllowPartialAuth();
            this.germanInfo = payIntent.getGermanInfo();
            if (payIntent.getTransactionSettings() != null) {
                this.transactionSettings = payIntent.getTransactionSettings();
            } else {
                this.transactionSettings = PayIntent.Builder.buildTransactionSettingsFromPayIntent(payIntent);
            }
            this.cashAdvanceCustomerIdentification = payIntent.getCashAdvanceCustomerIdentification();

            return this;
        }

        public setAction(action: string): Builder {
            this.action = action;
            return this;
        }

        public setAmount(amount: number): Builder {
            this.amount = amount;
            return this;
        }

        /** @Deprecated */
        public setTippableAmount(tippableAmount: number): Builder {
            this.tippableAmount = tippableAmount;
            if (this.transactionSettings != null) { // ** Backward Compatibility **
                this.transactionSettings.setTippableAmount(tippableAmount);
            }
            return this;
        }

        public setTaxAmount(taxAmount: number): Builder {
            this.taxAmount = taxAmount;
            return this;
        }

        public setEmployeeId(employeeId: string): Builder {
            this.employeeId = employeeId;
            return this;
        }

        public setTipAmount(tipAmount: number): Builder {
            this.tipAmount = tipAmount;
            return this;
        }

        public setTransactionType(transactionType: sdk.remotemessage.TransactionType): Builder {
            this.transactionType = transactionType;
            return this;
        }

        /** @Deprecated */
        public setCardEntryMethods(cardEntryMethods: number): Builder {
            this.cardEntryMethods = cardEntryMethods;
            return this;
        }

        public setCardDataMessage(cardDataMessage: string): Builder {
            this.cardDataMessage = cardDataMessage;
            return this;
        }

        public setTaxableAmountRates(taxableAmountRates: Array<sdk.payments.TaxableAmountRate>): Builder {
            this.taxableAmountRates = new Array<sdk.payments.TaxableAmountRate>(taxableAmountRates);
            return this;
        }

        public setServiceChargeAmount(serviceChargeAmount: sdk.payments.ServiceChargeAmount): Builder {
            this.serviceChargeAmount = serviceChargeAmount;
            return this;
        }

        public setOrderId(orderId: string): Builder {
            this.orderId = orderId;
            return this;
        }

        public setPaymentId(paymentId: string): Builder {
            this.paymentId = paymentId;
            return this;
        }

        /** @Deprecated */
        public setRemotePrint(remotePrint: boolean = false): Builder {
            this.remotePrint = remotePrint;
            if (this.transactionSettings != null) { // ** Backward Compatibility **
                this.transactionSettings.setCloverShouldHandleReceipts(!remotePrint);
            }
            return this;
        }

        /** @Deprecated */
        public setDisableCashback(disableCashBack: boolean = false): Builder {
            this.isDisableCashBack = disableCashBack;
            if (this.transactionSettings != null) { // ** Backward Compatibility **
                this.transactionSettings.setDisableCashBack(disableCashBack);
            }
            return this;
        }

        public setTransactionNo(transactionNo: string): Builder {
            this.transactionNo = transactionNo;
            return this;
        }

        /** @Deprecated */
        public setForceSwipePinEntry(isForceSwipePinEntry: boolean = false): Builder {
            this.isForceSwipePinEntry = isForceSwipePinEntry;
            if (this.transactionSettings != null) { // ** Backward Compatibility **
                this.transactionSettings.setForcePinEntryOnSwipe(isForceSwipePinEntry);
            }
            return this;
        }

        /** @Deprecated */
        public setDisableRestartTransactionWhenFailed(disableRestartTransactionWhenFailed: boolean = false): Builder {
            this.disableRestartTransactionWhenFailed = disableRestartTransactionWhenFailed;
            if (this.transactionSettings != null) { // ** Backward Compatibility **
                this.transactionSettings.setDisableRestartTransactionOnFailure(disableRestartTransactionWhenFailed);
            }
            return this;
        }

        public setExternalPaymentId(externalPaymentId: string): Builder {
            this.externalPaymentId = externalPaymentId;
            return this;
        }

        public setVaultedCard(vaultedCard: sdk.payments.VaultedCard): Builder {
            this.vaultedCard = vaultedCard;
            return this;
        }

        /** @Deprecated */
        public setAllowOfflinePayment(allowOfflinePayment: boolean): Builder {
            this.allowOfflinePayment = allowOfflinePayment;
            if (this.transactionSettings != null) { // ** Backward Compatibility **
                this.transactionSettings.setAllowOfflinePayment(allowOfflinePayment);
            }
            return this;
        }

        /** @Deprecated */
        public setAapproveOfflinePaymentWithoutPrompt(approveOfflinePaymentWithoutPrompt: boolean): Builder {
            this.approveOfflinePaymentWithoutPrompt = approveOfflinePaymentWithoutPrompt;
            if (this.transactionSettings != null) { // ** Backward Compatibility **
                this.transactionSettings.setApproveOfflinePaymentWithoutPrompt(approveOfflinePaymentWithoutPrompt);
            }
            return this;
        }

        public setRequiresRemoteConfirmation(requiresRemoteConfirmation: boolean): Builder {
            this.requiresRemoteConfirmation = requiresRemoteConfirmation;
            return this;
        }

        public setApplicationTracking(applicationTracking: sdk.apps.AppTracking): Builder {
            this.applicationTracking = applicationTracking;
            return this;
        }

        public setAllowPartialAuth(allowPartialAuth: boolean = false): Builder {
            this.allowPartialAuth = allowPartialAuth;
            return this;
        }

        public setGermanInfo(germanInfo: sdk.payments.GermanInfo): Builder {
            this.germanInfo = germanInfo;
            return this;
        }

        public setCustomerIdentification(customerIdentification: sdk.payments.CashAdvanceCustomerIdentification): Builder {
            this.cashAdvanceCustomerIdentification = customerIdentification;
            return this;
        }

        public setTransactionSettings(transactionSettings: sdk.payments.TransactionSettings): Builder {
            this.transactionSettings = transactionSettings;
            return this;
        }

        public setCardNotPresent(cardNotPresent: boolean = false): Builder {
            this.isCardNotPresent = cardNotPresent;
            return this;
        }

        public build(): sdk.remotemessage.PayIntent {
            let payIntent: sdk.remotemessage.PayIntent = new sdk.remotemessage.PayIntent();
            payIntent.setAction(this.action);
            payIntent.setAmount(this.amount);
            payIntent.setTippableAmount(this.tippableAmount);
            payIntent.setTipAmount(this.tipAmount);
            payIntent.setTaxAmount(this.taxAmount);
            payIntent.setOrderId(this.orderId);
            payIntent.setPaymentId(this.paymentId);
            payIntent.setEmployeeId(this.employeeId);

            payIntent.setTransactionType(this.transactionType);
            payIntent.setTaxableAmountRates(this.taxableAmountRates);
            payIntent.setServiceChargeAmount(this.serviceChargeAmount);
            payIntent.setIsDisableCashBack(this.isDisableCashBack);
            payIntent.setIsTesting(this.isTesting);
            payIntent.setCardEntryMethods(this.cardEntryMethods);

            payIntent.setVoiceAuthCode(this.voiceAuthCode);
            payIntent.setPostalCode(this.postalCode);
            payIntent.setStreetAddress(this.streetAddress);
            payIntent.setIsCardNotPresent(this.isCardNotPresent);
            payIntent.setCardDataMessage(this.cardDataMessage);
            payIntent.setRemotePrint(this.remotePrint);
            payIntent.setTransactionNo(this.transactionNo);

            payIntent.setIsForceSwipePinEntry(this.isForceSwipePinEntry);
            payIntent.setDisableRestartTransactionWhenFailed(this.disableRestartTransactionWhenFailed);
            payIntent.setExternalPaymentId(this.externalPaymentId);
            payIntent.setVaultedCard(this.vaultedCard);
            payIntent.setAllowOfflinePayment(this.allowOfflinePayment);

            payIntent.setApproveOfflinePaymentWithoutPrompt(this.approveOfflinePaymentWithoutPrompt);
            payIntent.setRequiresRemoteConfirmation(this.requiresRemoteConfirmation);
            payIntent.setApplicationTracking(this.applicationTracking);
            payIntent.setAllowPartialAuth(this.allowPartialAuth);
            payIntent.setGermanInfo(this.germanInfo);

            payIntent.setCashAdvanceCustomerIdentification(this.cashAdvanceCustomerIdentification);
            payIntent.setTransactionSettings(this.transactionSettings);
            return payIntent;
        }
    }
}
