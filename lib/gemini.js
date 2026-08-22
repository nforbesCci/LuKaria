/**
 * Gemini 2.0 Flash meal photo analysis (server-only).
 */

export async function identifyFoodsFromPhoto(imageDataUrl) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const match = String(imageDataUrl || '').match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error('image must be a base64 data URL');
  }
  const mimeType = match[1];
  const data = match[2];

  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const prompt = `You are a nutrition assistant. Identify the foods in this meal photo.
Return ONLY valid JSON (no markdown) with this shape:
{"foods":[{"name":"string","portion":"string","estimatedGrams":number}]}
Use common grocery/restaurant names. If unsure, still guess the most likely dish. Empty foods array if no food is visible.`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || `Gemini request failed (${response.status})`);
  }

  const text =
    payload.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join('\n') || '';
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    parsed = m ? JSON.parse(m[0]) : { foods: [] };
  }
  const foods = Array.isArray(parsed.foods) ? parsed.foods : [];
  return foods
    .map((f) => ({
      name: String(f.name || '').trim(),
      portion: f.portion ? String(f.portion) : null,
      estimatedGrams: Number.isFinite(Number(f.estimatedGrams)) ? Number(f.estimatedGrams) : null,
    }))
    .filter((f) => f.name);
}
