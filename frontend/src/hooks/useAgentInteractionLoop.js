import { useEffect, useRef } from 'react';
import { useSimStore } from '../state/useSimStore';
import { getZone } from '../state/zones';
import { getAgentInteraction } from '../lib/api';

const CHECK_INTERVAL_MS = 12000;
const TRIGGER_PROBABILITY = 0.5;
const TURN_DISPLAY_MS = 3200;

/**
 * Revisa periódicamente qué agentes comparten zona y, con cierta probabilidad,
 * dispara una conversación ambiental breve entre dos de ellos usando el backend.
 */
export function useAgentInteractionLoop() {
  const loaded = useSimStore((state) => state.loaded);
  const busyRef = useRef(new Set());

  useEffect(() => {
    if (!loaded) return undefined;

    const intervalId = setInterval(async () => {
      const store = useSimStore.getState();
      const { activeChatAgentId } = store;
      const groups = store.getAgentsInSameZone();

      for (const group of groups) {
        const available = group.filter(
          (id) => !busyRef.current.has(id) && id !== activeChatAgentId
        );
        if (available.length < 2) continue;
        if (Math.random() > TRIGGER_PROBABILITY) continue;

        const [agentIdA, agentIdB] = available.sort(() => Math.random() - 0.5).slice(0, 2);
        const zone = getZone(store.agents[agentIdA].zoneId);

        busyRef.current.add(agentIdA);
        busyRef.current.add(agentIdB);
        useSimStore.getState().setAgentStatus(agentIdA, 'hablando');
        useSimStore.getState().setAgentStatus(agentIdB, 'hablando');

        try {
          const { turns } = await getAgentInteraction({
            agentIdA,
            agentIdB,
            zone: zone.label,
          });
          await playTurns(turns);
        } catch (err) {
          console.error('Error en interacción ambiental:', err);
        } finally {
          useSimStore.getState().clearBubble(agentIdA);
          useSimStore.getState().clearBubble(agentIdB);
          useSimStore.getState().setAgentStatus(agentIdA, 'disponible');
          useSimStore.getState().setAgentStatus(agentIdB, 'disponible');
          busyRef.current.delete(agentIdA);
          busyRef.current.delete(agentIdB);
        }

        break;
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [loaded]);
}

async function playTurns(turns) {
  for (const turn of turns || []) {
    useSimStore.getState().setBubble(turn.agentId, turn.text);
    await sleep(TURN_DISPLAY_MS);
    useSimStore.getState().clearBubble(turn.agentId);
    await sleep(300);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
