import { useEffect } from 'react';
import { useSimStore } from '../state/useSimStore';

const MIN_DELAY_MS = 9000;
const MAX_DELAY_MS = 17000;

function randomDelay() {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
}

/**
 * Hace que cada agente deambule entre zonas cada cierto tiempo, de forma
 * independiente y sin coordinación (no hay pathfinding, solo cambio de zona
 * destino con transición CSS a cargo del componente Avatar).
 */
export function useAgentMovement() {
  const agentOrder = useSimStore((state) => state.agentOrder);
  const loaded = useSimStore((state) => state.loaded);

  useEffect(() => {
    if (!loaded) return undefined;

    const timeouts = agentOrder.map((agentId) => {
      let timeoutId;

      const tick = () => {
        useSimStore.getState().moveAgentToRandomZone(agentId);
        timeoutId = setTimeout(tick, randomDelay());
      };

      timeoutId = setTimeout(tick, randomDelay());
      return () => clearTimeout(timeoutId);
    });

    return () => timeouts.forEach((cancel) => cancel());
  }, [loaded, agentOrder]);
}
