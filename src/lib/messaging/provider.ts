export interface SendMessageParams {
  to: string; // E.164 format e.g. +14695550199
  body: string;
  channel?: 'sms' | 'whatsapp';
}

export interface MessagingProvider {
  readonly name: string;
  send(params: SendMessageParams): Promise<{ ok: boolean; sid?: string }>;
}

class MockMessagingProvider implements MessagingProvider {
  readonly name = 'mock';

  async send(params: SendMessageParams) {
    console.info(`[Messaging Mock:${params.channel ?? 'sms'}] -> ${params.to}: ${params.body}`);
    return { ok: true, sid: `mock_${Date.now()}` };
  }
}

class TwilioMessagingProvider implements MessagingProvider {
  readonly name = 'twilio';

  async send(params: SendMessageParams) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber || accountSid.includes('...')) {
      console.warn('[Twilio] Missing credentials, falling back to log:', params.to);
      return { ok: true, sid: `fallback_${Date.now()}` };
    }

    const from = params.channel === 'whatsapp' ? `whatsapp:${fromNumber}` : fromNumber;
    const to = params.channel === 'whatsapp' ? `whatsapp:${params.to}` : params.to;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const body = new URLSearchParams({ From: from, To: to, Body: params.body });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Twilio error (${res.status}): ${errText}`);
    }

    const data = (await res.json()) as { sid?: string };
    return { ok: true, sid: data.sid };
  }
}

export function getMessagingProvider(): MessagingProvider {
  if (process.env.MESSAGING_PROVIDER === 'twilio') {
    return new TwilioMessagingProvider();
  }
  return new MockMessagingProvider();
}
