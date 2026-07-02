# Configuración de agentes — placeholder

`agentConfigs.json` contiene 4 personajes ficticios para esta fase de la plataforma.

En la siguiente fase, al cargar las entrevistas reales, reemplazar por cada agente:

- `name` — nombre del entrevistado (o alias).
- `personalitySummary` — resumen breve de su perfil real.
- `systemPrompt` — el prompt de sistema completo construido a partir de la entrevista
  (contexto, forma de hablar, preocupaciones, relación con la fintech, citas textuales
  relevantes, etc.).
- `_replaceWithInterviewData` — quitar este campo una vez reemplazado el agente.

No es necesario tocar `id`, `avatarColor`, `appearance` ni `voiceProfile` a menos que se
quiera ajustar la identidad visual/sonora de cada personaje. `appearance` controla el
avatar ilustrado (`skinTone`, `hairColor`, `hairStyle`: `"ponytail" | "short" | "bun" | "balding"`).
