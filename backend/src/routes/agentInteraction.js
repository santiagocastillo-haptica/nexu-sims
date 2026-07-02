const express = require('express');
const { client, MODEL } = require('../anthropicClient');
const { getAgent } = require('../agents');

const router = express.Router();

const DIALOGUE_TOOL = {
  name: 'generate_dialogue',
  description: 'Genera un breve intercambio de diálogo ambiental entre dos personajes.',
  input_schema: {
    type: 'object',
    properties: {
      turns: {
        type: 'array',
        minItems: 2,
        maxItems: 4,
        items: {
          type: 'object',
          properties: {
            speaker: { type: 'string', enum: ['A', 'B'] },
            text: { type: 'string' },
          },
          required: ['speaker', 'text'],
        },
      },
    },
    required: ['turns'],
  },
};

router.post('/', async (req, res) => {
  const { agentIdA, agentIdB, zone } = req.body || {};

  if (!agentIdA || !agentIdB) {
    return res.status(400).json({ error: 'Faltan agentIdA o agentIdB.' });
  }

  let agentA;
  let agentB;
  try {
    agentA = getAgent(agentIdA);
    agentB = getAgent(agentIdB);
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }

  const systemPrompt = [
    'Vas a improvisar un diálogo corto y natural entre dos personajes (Persona A y Persona B) que se acaban de encontrar en el mismo lugar.',
    zone ? `Se encuentran en: ${zone}.` : '',
    'Persona A:',
    agentA.systemPrompt,
    'Persona B:',
    agentB.systemPrompt,
    'El diálogo debe tener entre 2 y 4 turnos, alternando o no según se sienta natural, en español, casual y breve (una o dos oraciones por turno). No agregues acotaciones ni narración, solo lo que dirían.',
    'Debes llamar a la herramienta generate_dialogue con el resultado.',
  ]
    .filter(Boolean)
    .join('\n\n');

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: systemPrompt,
      messages: [
        { role: 'user', content: 'Genera el diálogo ahora.' },
      ],
      tools: [DIALOGUE_TOOL],
      tool_choice: { type: 'tool', name: 'generate_dialogue' },
    });

    const toolUse = response.content.find((block) => block.type === 'tool_use');
    if (!toolUse) {
      return res.status(502).json({ error: 'El modelo no devolvió un diálogo estructurado.' });
    }

    const turns = (toolUse.input.turns || []).map((turn) => ({
      agentId: turn.speaker === 'A' ? agentIdA : agentIdB,
      text: turn.text,
    }));

    res.json({ turns });
  } catch (err) {
    console.error('Error en /api/agent-interaction:', err);
    res.status(500).json({ error: 'Ocurrió un error generando la interacción.' });
  }
});

module.exports = router;
