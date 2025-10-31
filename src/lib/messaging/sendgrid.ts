/**
 * AI Summary: SendGrid webhook signature verification using Twilio Event Webhook ECDSA checks.
 */

export async function verifySendGridWebhook(
  timestamp: string | null,
  signature: string | null,
  payload: string | null,
  publicKey: string | null
): Promise<boolean> {
  if (!timestamp || !signature || !payload || !publicKey) {
    return false;
  }

  try {
    // Dynamic import to avoid requiring package in tests
    const { EventWebhook } = await import('@sendgrid/eventwebhook');
    const eventWebhook = new EventWebhook();
    const ecKey = eventWebhook.convertPublicKeyToECDSA(publicKey);
    return eventWebhook.verifySignature(ecKey, payload, signature, timestamp);
  } catch (error) {
    // Fail closed on verification errors
    return false;
  }
}
