import { useSimStore } from '../state/useSimStore';
import { ZONES } from '../state/zones';
import Avatar from './Avatar';

export default function Scene({ onSelectAgent }) {
  const agents = useSimStore((state) => state.agents);
  const agentOrder = useSimStore((state) => state.agentOrder);

  return (
    <div className="scene">
      {ZONES.map((zone) => (
        <div
          key={zone.id}
          className="scene__zone"
          style={{ left: zone.x - 90, top: zone.y - 60 }}
        >
          <span className="scene__zone-label">{zone.label}</span>
        </div>
      ))}

      {agentOrder.map((agentId) => (
        <Avatar key={agentId} agent={agents[agentId]} onClick={onSelectAgent} />
      ))}
    </div>
  );
}
