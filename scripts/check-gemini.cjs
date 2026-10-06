// Run manually:  node --env-file=.env scripts/check-gemini.cjs
(async () => {
  const key = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'gemini-3.8-flash';
  console.log('key:', key ? 'FOUND' : 'MISSING', '| model:', model);
  if (!key) return;
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Reply with exactly: AI WORKS' }] }],
      generationConfig: { maxOutputTokens: 1024, thinkingConfig: { thinkingLevel: 'low' } },
    }),
  });
  const j = await r.json();
  console.log('HTTP', r.status);
  console.log(JSON.stringify(j, null, 2));
})().catch((e) => console.log('REQUEST ERROR:', e.message));
