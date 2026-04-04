function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getAccent(type) {
  switch (type) {
    case 'Event Update':
      return {
        bg: '#DBEAFE',
        text: '#1D4ED8',
        pill: '#1D4ED8'
      };
    case 'Reminder':
      return {
        bg: '#FEF3C7',
        text: '#B45309',
        pill: '#D97706'
      };
    case 'Alert':
      return {
        bg: '#FEE2E2',
        text: '#B91C1C',
        pill: '#DC2626'
      };
    default:
      return {
        bg: '#EDE9FE',
        text: '#6D28D9',
        pill: '#7C3AED'
      };
  }
}

function buildHtmlTemplate({ recipientName, title, message, type, audienceLabel }) {
  const accent = getAccent(type);
  const safeName = escapeHtml(recipientName || 'Student');
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message).replaceAll('\n', '<br />');
  const safeAudience = escapeHtml(audienceLabel);
  const year = new Date().getFullYear();

  return `
    <div style="margin:0;background:#f8fafc;padding:32px 16px;font-family:Arial,sans-serif;color:#0f172a;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(15,23,42,0.12);">
        <div style="padding:32px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 45%,#334155 100%);color:#ffffff;">
          <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:${accent.pill};font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
            ${escapeHtml(type)}
          </div>
          <h1 style="margin:20px 0 10px;font-size:32px;line-height:1.15;">UniConnect Notification</h1>
          <p style="margin:0;color:#cbd5e1;font-size:15px;line-height:1.6;">
            Fresh updates from Hub for ${safeAudience}.
          </p>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#334155;">
            Hello ${safeName},
          </p>
          <div style="border-radius:20px;background:${accent.bg};padding:24px;">
            <h2 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:${accent.text};">
              ${safeTitle}
            </h2>
            <p style="margin:0;font-size:15px;line-height:1.8;color:#334155;">
              ${safeMessage}
            </p>
          </div>
          <div style="margin-top:24px;padding:20px;border:1px solid #e2e8f0;border-radius:18px;background:#f8fafc;">
            <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">
              Stay Connected
            </p>
            <p style="margin:0;font-size:15px;line-height:1.7;color:#475569;">
              Open UniConnect to read this notification inside the app, view related updates, and manage your latest activities.
            </p>
          </div>
        </div>
        <div style="padding:24px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
          <p style="margin:0;font-size:12px;line-height:1.7;color:#64748b;">
            Sent by Hub • ${year}
          </p>
        </div>
      </div>
    </div>
  `;
}

function buildTextTemplate({ recipientName, title, message, type, audienceLabel }) {
  return [
    `Hello ${recipientName || 'Student'},`,
    '',
    `UniConnect ${type}`,
    `Audience: ${audienceLabel}`,
    '',
    title,
    '',
    message,
    '',
    'Open UniConnect to read the notification in the app.',
    '',
    'Sent by Hub'
  ].join('\n');
}

export async function sendNotificationEmails({
  recipients,
  title,
  message,
  type,
  audienceLabel
}) {
  const enabled = String(process.env.MAILJET_ENABLED || 'true').toLowerCase() === 'true';

  if (!enabled || recipients.length === 0) {
    return {
      status: 'Skipped',
      sentCount: 0
    };
  }

  const apiKey = process.env.MAILJET_API_KEY || '';
  const secretKey = process.env.MAILJET_SECRET_KEY || '';
  const fromEmail = process.env.MAILJET_FROM_EMAIL || '';
  const fromName = process.env.MAILJET_FROM_NAME || 'Hub';

  if (!apiKey || !secretKey || !fromEmail) {
    return {
      status: 'Skipped',
      sentCount: 0
    };
  }

  const body = {
    Messages: recipients.map((recipient) => ({
      From: {
        Email: fromEmail,
        Name: fromName
      },
      To: [
        {
          Email: recipient.email,
          Name: recipient.name || 'Student'
        }
      ],
      Subject: title,
      TextPart: buildTextTemplate({
        recipientName: recipient.name,
        title,
        message,
        type,
        audienceLabel
      }),
      HTMLPart: buildHtmlTemplate({
        recipientName: recipient.name,
        title,
        message,
        type,
        audienceLabel
      })
    }))
  };

  const auth = Buffer.from(`${apiKey}:${secretKey}`).toString('base64');
  const response = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Mailjet email send failed.');
  }

  return {
    status: 'Sent',
    sentCount: recipients.length
  };
}
