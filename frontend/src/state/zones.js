export const ZONES = [
  { id: 'sala', label: 'Sala', x: 160, y: 420 },
  { id: 'cocina', label: 'Cocina', x: 760, y: 420 },
  { id: 'escritorio', label: 'Escritorio', x: 160, y: 130 },
  { id: 'balcon', label: 'Balcón', x: 760, y: 130 },
];

export function randomZoneId(excludeId) {
  const candidates = excludeId ? ZONES.filter((z) => z.id !== excludeId) : ZONES;
  return candidates[Math.floor(Math.random() * candidates.length)].id;
}

export function getZone(zoneId) {
  return ZONES.find((z) => z.id === zoneId) || ZONES[0];
}
