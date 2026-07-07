# Nexu Sims — Plataforma de agentes IA (clientes Nexu)

Plataforma estilo videojuego (inspirada en Ace Attorney) para hablar 1 a 1 con agentes IA
(vía Claude) que representan arquetipos de comportamiento de clientes de Nexu, una fintech
de financiamiento de autos. Elige un "expediente" en la pantalla principal y entra a la
sala de investigación a interrogar al personaje, con chat en streaming, voz y micrófono.

El agente 1 (**Pasajero Turista**) ya está poblado con un perfil de comportamiento real y
datos de una entrevista real (con identidad anonimizada porque este repo es público). Los
otros 3 siguen siendo placeholder — ver
[backend/src/agents/README.md](backend/src/agents/README.md).

## Estructura

- `backend/` — Node.js + Express + `@anthropic-ai/sdk`. Streaming de chat vía SSE.
- `frontend/` — React + Vite + Zustand. Pantalla de selección de expediente, sala de
  investigación con diálogo tipo máquina de escribir, voz (Web Speech API).

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

Abre `http://localhost:5173`, elige un expediente y empieza a chatear.

## Deployment en vivo

Ver [DEPLOY.md](DEPLOY.md) para desplegar backend + frontend en Render.
