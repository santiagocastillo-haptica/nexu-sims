import { useEffect, useRef, useState } from 'react';
import { getZone } from '../state/zones';
import SpeechBubble from './SpeechBubble';
import SimAvatar from './SimAvatar';

const STATUS_LABEL = {
  disponible: 'Disponible',
  pensando: 'Pensando…',
  hablando: 'Hablando',
};

const STATUS_COLOR = {
  disponible: '#4caf7d',
  pensando: '#e0b93f',
  hablando: '#3f8fe0',
};

const DEFAULT_APPEARANCE = { skinTone: '#e7b48c', hairColor: '#3b2a1e', hairStyle: 'short' };
const WALK_ANIMATION_MS = 2200; // debe igualar la duración de la transición CSS de .avatar

export default function Avatar({ agent, onClick }) {
  const zone = getZone(agent.zoneId);
  const appearance = agent.appearance || DEFAULT_APPEARANCE;

  const [isWalking, setIsWalking] = useState(false);
  const prevZoneId = useRef(agent.zoneId);

  useEffect(() => {
    if (prevZoneId.current === agent.zoneId) return undefined;
    prevZoneId.current = agent.zoneId;
    setIsWalking(true);
    const timeoutId = setTimeout(() => setIsWalking(false), WALK_ANIMATION_MS);
    return () => clearTimeout(timeoutId);
  }, [agent.zoneId]);

  return (
    <div
      className="avatar"
      style={{ transform: `translate(${zone.x}px, ${zone.y}px)` }}
      onClick={() => onClick(agent.id)}
      role="button"
      tabIndex={0}
      title={`Hablar con ${agent.name}`}
    >
      {agent.bubble && <SpeechBubble text={agent.bubble} color={agent.avatarColor} />}
      <div className="avatar__figure">
        <SimAvatar
          bodyColor={agent.avatarColor}
          skinTone={appearance.skinTone}
          hairColor={appearance.hairColor}
          hairStyle={appearance.hairStyle}
          walking={isWalking}
        />
        <span
          className="avatar__status-dot"
          style={{ backgroundColor: STATUS_COLOR[agent.status] || STATUS_COLOR.disponible }}
        />
      </div>
      <div className="avatar__name">{agent.name}</div>
      <div className="avatar__status-label">{STATUS_LABEL[agent.status] || 'Disponible'}</div>
    </div>
  );
}
