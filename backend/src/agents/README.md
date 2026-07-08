# Configuración de agentes

`agentConfigs.json` contiene los 4 personajes de la plataforma, basados en la perfilación
de comportamiento de clientes de Nexu (matriz de conciencia financiera × conocimiento del
servicio/autonomía en la gestión del crédito): Pasajero Turista, Conductor Wazer, Copiloto
Apoyo y Conductor Todoterreno.

- **agente_1 (Pasajero Turista / "Alejandro Martínez", alias)** ya está poblado con
  datos reales: el perfil de comportamiento del documento de perfilación de Nexu + la
  transcripción de una entrevista real, con nombre, ciudad exacta y lugar de trabajo
  anonimizados porque este repositorio es público — no usar el nombre real del
  entrevistado en este archivo. No tiene `_replaceWithInterviewData`.
- **agente_2 (Conductor Wazer / "Roberto López"), agente_3 (Copiloto Apoyo / "Bárbara
  Solano"), agente_4 (Conductor Todoterreno / "Karla Fuentes")** siguen siendo placeholder
  (`_replaceWithInterviewData: true`) — solo tienen nombre asignado, no entrevista real
  todavía. Al cargar sus entrevistas reales, reemplazar por cada uno:
  - `name` — nombre del entrevistado (o alias).
  - `personalitySummary` — resumen breve de su perfil real para la tarjeta de "expediente".
  - `systemPrompt` — el prompt de sistema completo construido a partir del arquetipo +
    la entrevista (contexto, forma de hablar, preocupaciones, relación con Nexu, citas
    textuales relevantes, etc.), siguiendo el mismo patrón que `agente_1`.
  - `_replaceWithInterviewData` — quitar este campo una vez reemplazado el agente.

No es necesario tocar `id`, `avatarColor`, `appearance`, `archetype`, `archetypeStat` ni
`voiceProfile` a menos que se quiera ajustar la identidad visual/sonora de cada personaje.
`appearance` controla el avatar ilustrado (`skinTone`, `hairColor`,
`hairStyle`: `"ponytail" | "short" | "long" | "bun" | "balding"`). `archetype`/`archetypeStat` son el
sello y estadística que se muestran en la tarjeta de selección de expediente.

`voiceProfile.elevenLabsVoiceId` es el Voice ID de ElevenLabs para ese personaje (ver
[Voice Library](https://elevenlabs.io/app/voice-library)). Si está vacío, la voz cae de
vuelta a la Web Speech API del navegador usando `pitch`/`rate` como antes — no rompe nada
dejarlo así mientras se eligen las voces.

## Protocolo de respuesta compartido

`responseProtocol.js` exporta `RESPONSE_PROTOCOL`, un bloque de instrucciones de
comportamiento (voz de cliente, no inventar información, estructura de
reacción/percepción/cierre al validar una propuesta, etc.) que `routes/chat.js` concatena
al final del `systemPrompt` de **cualquier** agente en cada llamada. No hace falta
repetirlo en `agentConfigs.json` — un solo lugar para ajustar el protocolo para los 4
personajes a la vez.

## Activar/desactivar un personaje

Agrega `"active": false` al agente para ocultarlo de `/api/agents` (no aparece en la
pantalla de selección) y bloquear `/api/chat` para su `id` (responde 404). No borra nada
de su configuración — para reactivarlo, quita el campo o ponlo en `true`. Ahora mismo
`agente_2` (Roberto López) y `agente_3` (Bárbara Solano) están desactivados; se reactivan
cuando se decida mostrarlos.
