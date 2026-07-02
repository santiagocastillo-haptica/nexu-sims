# Agentes Sims — Plataforma de agentes IA (fintech)

Simulación 2D estilo "The Sims" con 4 personajes (agentes IA vía Claude) que representan
usuarios de una fintech mexicana. Chat 1 a 1 con streaming y voz, más conversaciones
ambientales entre agentes cuando comparten zona.

Los 4 personajes de `backend/src/agents/agentConfigs.json` son **placeholder** — se
reemplazarán con datos de entrevistas reales en una siguiente fase (ver
[backend/src/agents/README.md](backend/src/agents/README.md)).

## Estructura

- `backend/` — Node.js + Express + `@anthropic-ai/sdk`. Streaming de chat vía SSE,
  interacción agente-agente vía tool use forzado.
- `frontend/` — React + Vite + Zustand. Escenario 2D, avatares animados, chat con voz
  (Web Speech API).

## Setup local

```bash
# Backend
cd backend
npm install
cp .env.example .env   # agrega tu ANTHROPIC_API_KEY
npm run dev            # http://localhost:3001

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev             # http://localhost:5173
```

Abre `http://localhost:5173`, haz click en un personaje para chatear. Los personajes
también conversan entre sí de forma ambiental cuando comparten zona en el escenario.
