const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function newsletter(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const { email, consent, source, language } = request.body || {};
  if (!EMAIL_PATTERN.test(String(email || '').trim()) || consent !== true) {
    return response.status(400).json({ error: 'A valid email and consent are required.' });
  }

  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_NEWSLETTER_TABLE || 'Newsletter';
  if (!token || !baseId) {
    return response.status(503).json({ error: 'Newsletter connection is not configured.' });
  }

  try {
    const airtableResponse = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [{
          fields: {
            Email: String(email).trim().toLowerCase(),
            Consent: true,
            Source: String(source || 'website').slice(0, 100),
            Language: language === 'en' ? 'EN' : 'HR',
            Status: 'Active',
            'Signup Date': new Date().toISOString()
          }
        }],
        typecast: true
      })
    });

    if (!airtableResponse.ok) {
      return response.status(502).json({ error: 'The subscription could not be saved.' });
    }

    return response.status(201).json({ ok: true });
  } catch (error) {
    return response.status(502).json({ error: 'The subscription could not be saved.' });
  }
};
