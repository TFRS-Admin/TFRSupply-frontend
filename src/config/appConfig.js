/**
 * config/appConfig.js
 * Frontend application configuration.
 *
 * IMPORTANT: No secrets here. This file is bundled and shipped to the browser.
 * API keys, tokens, and credentials must live in environment variables (see
 * .env.example) and must never be embedded in a file like this one.
 */

const appConfig = {
  /**
   * PROTOTYPE-ONLY admin access guard.
   * Lists email addresses allowed to view /admin/* pages.
   * This is NOT a real security boundary — it is a lightweight UX gate
   * to prevent accidental access during prototype review sessions.
   *
   * For production: replace with real, server-side-enforced authorization —
   * this list alone is not sufficient.
   *
   * No secrets here — email addresses are not credentials.
   */
  adminEmails: ['admin@tfrsupply.com', 'admin@example.com'],


  /**
   * Quote request email recipient.
   * Change this to route incoming quote emails to the right inbox.
   * For multi-tenant or dynamic routing, move this to a real settings source.
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

  /**
   * Optional hosted form endpoint (e.g. Formspree/Basin) that quote
   * requests are POSTed to. When unset, the quote delivery adapter falls
   * back to opening the requester's email client with a pre-filled
   * message addressed to `quoteRecipientEmail`. Not a secret — hosted
   * form endpoints are meant to be called from the browser.
   */
  quoteDeliveryEndpoint: import.meta.env.VITE_QUOTE_DELIVERY_ENDPOINT || '',
};

export default appConfig;