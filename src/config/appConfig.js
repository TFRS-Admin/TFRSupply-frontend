/**
 * config/appConfig.js
 * Frontend application configuration.
 *
 * IMPORTANT: No secrets here. This file is bundled and shipped to the browser.
 * API keys, tokens, and credentials must live in Base44 environment variables
 * and be accessed only from backend functions.
 */

const appConfig = {
  /**
   * Quote request email recipient.
   * Change this to route incoming quote emails to the right inbox.
   * For multi-tenant or dynamic routing, move this to a Base44 AppSettings entity.
   */
  quoteRecipientEmail: 'quotes@tfrsupply.com',

  /**
   * Send a confirmation email back to the requestor after submission.
   * Set to false to suppress the confirmation (useful while testing).
   */
  quoteSendConfirmation: true,

  /**
   * Display name used in outgoing email "from" label.
   */
  quoteSenderName: 'TFR Supply',
};

export default appConfig;