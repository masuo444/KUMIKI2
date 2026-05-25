export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, product, message, page, lang } = req.body;

  if (!name || !email || !product) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const productLabels = {
    necklace: 'ネックレス / Necklace',
    earrings: '耳飾り / Earrings',
    kanzashi: 'かんざし / Kanzashi',
    bespoke: 'オーダーメイド / Bespoke',
    gift: 'ギフト / Gift',
    badge: '枡バッジ / Masu Badge',
    other: 'その他 / Other',
  };

  const productLabel = productLabels[product] || product;
  const langLabel = lang === 'fr' ? 'フランス語' : lang === 'en' ? '英語' : '日本語';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'KUMIKI <noreply@fomus.jp>',
        to: ['contact@fomus.jp'],
        reply_to: email,
        subject: `【KUMIKI お問い合わせ】${name} — ${productLabel}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
            <h2 style="border-bottom:2px solid #C9A86C;padding-bottom:8px;">KUMIKIサイトからお問い合わせ</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#888;width:140px;">お名前</td><td style="padding:8px 0;"><strong>${name}</strong></td></tr>
              <tr><td style="padding:8px 0;color:#888;">メールアドレス</td><td style="padding:8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#888;">商品</td><td style="padding:8px 0;">${productLabel}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">言語 / ページ</td><td style="padding:8px 0;">${langLabel} — ${page || '不明'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;vertical-align:top;">メッセージ</td><td style="padding:8px 0;white-space:pre-line;">${message || '（なし）'}</td></tr>
            </table>
          </div>
        `,
      }),
    });

    if (response.ok) {
      return res.status(200).json({ ok: true });
    }

    const err = await response.json();
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
