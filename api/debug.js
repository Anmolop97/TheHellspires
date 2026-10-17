// api/debug.js - Vercel Serverless Function for Gemini AI Escalation
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { prompt, language } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt in request body.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured in Vercel environment variables. You can still use the 14,800+ offline rules without an API key!'
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an elite senior systems and UI engineer diagnosing a ${language || 'programming'} error. Provide a concise, highly actionable explanation of why this error happens and the exact code to fix it:\n\n${prompt}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer) {
      return res.status(500).json({ error: 'Empty response received from AI.' });
    }

    return res.status(200).json({ answer });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'AI request failed.' });
  }
}
