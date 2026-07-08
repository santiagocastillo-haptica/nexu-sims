const express = require('express');
const { Readable } = require('stream');

const router = express.Router();

const ELEVENLABS_MODEL_ID = 'eleven_multilingual_v2';

router.get('/', async (req, res) => {
  const { text, voiceId } = req.query || {};

  if (!text || !voiceId) {
    return res.status(400).json({ error: 'Faltan text o voiceId.' });
  }

  if (!process.env.ELEVENLABS_API_KEY) {
    return res.status(503).json({ error: 'ELEVENLABS_API_KEY no está configurada en el backend.' });
  }

  try {
    const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({ text, model_id: ELEVENLABS_MODEL_ID }),
    });

    if (!elevenRes.ok || !elevenRes.body) {
      const errText = await elevenRes.text().catch(() => '');
      console.error('Error de ElevenLabs:', elevenRes.status, errText);
      return res.status(502).json({ error: 'No se pudo generar el audio.' });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    // Mismo texto + voz siempre produce el mismo audio: el navegador puede cachearlo y
    // así "repetir" no vuelve a llamar a ElevenLabs ni gasta créditos de nuevo.
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    Readable.fromWeb(elevenRes.body).pipe(res);
  } catch (err) {
    console.error('Error en /api/tts:', err);
    res.status(500).json({ error: 'Ocurrió un error generando el audio.' });
  }
});

module.exports = router;
