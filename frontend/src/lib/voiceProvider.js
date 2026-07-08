import { API_URL } from './api';

/**
 * Capa de abstracción de voz. Si el agente tiene `elevenLabsVoiceId`, arma una URL GET
 * al backend (que llama a ElevenLabs con la key server-side y transmite el audio en
 * streaming). Al ser una URL normal, `new Audio(url)` la reproduce progresivamente sin
 * esperar el archivo completo, y el navegador la cachea (repetir no vuelve a pegarle a
 * ElevenLabs). Si no hay voiceId, el caller debe usar speakWebSpeech() como respaldo.
 */

let currentAudio = null;
let currentUtterance = null;

export function buildTtsUrl(text, voiceId) {
  if (!text || !voiceId) return null;
  const params = new URLSearchParams({ text, voiceId });
  return `${API_URL}/api/tts?${params.toString()}`;
}

/** Reproduce una URL de audio. Resuelve en `true` si terminó bien, `false` si falló (para que el caller pueda caer a speakWebSpeech). */
export function playAudioUrl(url) {
  return new Promise((resolve) => {
    stopSpeaking();
    const audio = new Audio(url);
    currentAudio = audio;
    audio.addEventListener('ended', () => resolve(true));
    audio.addEventListener('error', () => resolve(false));
    audio.play().catch(() => resolve(false));
  });
}

export function speakWebSpeech(text, voiceProfile = {}) {
  return new Promise((resolve) => {
    if (!text || !('speechSynthesis' in window)) {
      resolve();
      return;
    }
    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    utterance.pitch = voiceProfile.pitch ?? 1;
    utterance.rate = voiceProfile.rate ?? 1;

    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find((v) => v.lang?.startsWith('es'));
    if (spanishVoice) utterance.voice = spanishVoice;

    utterance.onend = resolve;
    utterance.onerror = resolve;

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  });
}

/** Reproduce una lista de { content, audioUrl, voiceProfile } en orden, esperando a que cada uno termine. */
export async function playSequence(items) {
  for (const item of items) {
    const ok = item.audioUrl ? await playAudioUrl(item.audioUrl) : false;
    if (!ok) await speakWebSpeech(item.content, item.voiceProfile);
  }
}

/**
 * Extrae del buffer las oraciones ya "cerradas" (terminan en . ! ? seguido de espacio),
 * dejando en `remainder` lo que sigue incompleto (todavía se está generando). Se usa para
 * mandar cada oración a sintetizar voz en cuanto está lista, en vez de esperar la
 * respuesta completa — así el audio empieza a sonar mucho antes.
 */
export function splitReadySentences(buffer) {
  const sentences = [];
  let remainder = buffer;
  const re = /[.!?]+(\s+)/;
  let match;
  while ((match = re.exec(remainder))) {
    const cutEnd = match.index + match[0].length;
    sentences.push(remainder.slice(0, cutEnd).trim());
    remainder = remainder.slice(cutEnd);
  }
  return { sentences, remainder };
}

export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}
