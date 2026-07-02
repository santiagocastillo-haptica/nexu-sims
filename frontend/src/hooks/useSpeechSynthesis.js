import { useCallback } from 'react';
import { speak, stopSpeaking } from '../lib/voiceProvider';

/**
 * Punto de acceso desde componentes React a la capa de voz (voiceProvider),
 * hoy basada en Web Speech API.
 */
export function useSpeechSynthesis() {
  const say = useCallback((text, voiceProfile) => speak(text, voiceProfile), []);
  const stop = useCallback(() => stopSpeaking(), []);
  return { say, stop };
}
