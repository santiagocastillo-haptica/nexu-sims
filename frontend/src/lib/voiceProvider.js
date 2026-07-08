import { API_URL } from './api';

/**
 * Capa de abstracción de voz. Si el agente tiene `elevenLabsVoiceId`, pide el audio
 * al backend (que llama a ElevenLabs con la key server-side) y devuelve una URL de
 * blob reproducible/cacheable. Si no hay voiceId o la llamada falla, el caller debe
 * usar speakWebSpeech() como respaldo (voz del navegador, no cacheable pero gratis
 * de regenerar).
 */

let currentAudio = null;
let currentUtterance = null;

export async function synthesizeAudioUrl(text, voiceId) {
  if (!text || !voiceId) return null;
  try {
    const res = await fetch(`${API_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId }),
    });
    if (!res.ok) throw new Error(`TTS respondió ${res.status}`);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn('ElevenLabs TTS no disponible, usando voz del navegador:', err);
    return null;
  }
}

export function playAudioUrl(url) {
  return new Promise((resolve) => {
    stopSpeaking();
    const audio = new Audio(url);
    currentAudio = audio;
    audio.addEventListener('ended', resolve);
    audio.addEventListener('error', resolve);
    audio.play().catch(resolve);
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
    if (item.audioUrl) {
      await playAudioUrl(item.audioUrl);
    } else {
      await speakWebSpeech(item.content, item.voiceProfile);
    }
  }
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
