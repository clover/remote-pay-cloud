import sdk = require('remote-pay-cloud-api');

/**
 * Clover Transport Observer
 *
 * The transport observer listens for notifications and handles them.
 */
export interface ObjectMessageSender {

    sendObjectMessage(message: sdk.remotemessage.Message): string;
}
