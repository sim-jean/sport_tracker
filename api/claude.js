export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: 'Clé API non configurée sur le serveur' });

  const { prompt, model } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt manquant' });

  const ALLOWED_MODELS = ['claude-sonnet-4-6', 'claude-haiku-4-5-20251001'];
  const selectedModel = ALLOWED_MODELS.includes(model) ? model : 'claude-sonnet-4-6';
  const maxTokens = selectedModel.includes('haiku') ? 50 : 800;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: selectedModel,
      max_tokens: maxTokens,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await r.json();
  if (data.error) return res.status(400).json({ error: data.error.message });
  return res.status(200).json({ text: data.content[0].text });
}
