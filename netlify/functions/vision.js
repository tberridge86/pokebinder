exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured on server.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body.' }) };
  }

  // Allow TEXT_DETECTION and WEB_DETECTION only
  const features = body?.requests?.[0]?.features;
  const allowedTypes = ['TEXT_DETECTION', 'WEB_DETECTION'];
  if (!features || !features.every(f => allowedTypes.includes(f.type))) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Only TEXT_DETECTION and WEB_DETECTION are permitted.' }) };
  }

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: `Proxy error: ${err.message}` })
    };
  }
};
