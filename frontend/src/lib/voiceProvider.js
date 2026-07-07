import { API_URL } from './api';

/**
 * Capa de abstracción de voz. Si el agente tiene `elevenLabsVoiceId`, pide el audio
 * al backend (que llama a ElevenLabs con la key server-side) y lo reproduce. Si no
 * hay voiceId configurado o la llamada falla, cae de vuelta a la Web Speech API del
 * navegador. Los componentes solo llaman a speak()/stopSpeaking(), sin saber cuál
 * proveedor está detrás.
 */

let currentAudio = null;
let currentUtterance = null;

export async function speak(text, voiceProfile = {}) {
  if (!text) return;
  stopSpeaking();

  if (voiceProfile.elevenLabsVoiceId) {
    const played = await speakWithElevenLabs(text, voiceProfile.elevenLabsVoiceId);
    if (played) return;
  }

  speakWithWebSpeech(text, voiceProfile);
}

async function speakWithElevenLabs(text, voiceId) {
  try {
    const res = await fetch(`${API_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId }),
    });
    if (!res.ok) throw new Error(`TTS respondió ${res.status}`);

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.addEventListener('ended', () => URL.revokeObjectURL(url));
    currentAudio = audio;
    await audio.play();
    return true;
  } catch (err) {
    console.warn('ElevenLabs TTS no disponible, usando voz del navegador:', err);
    return false;
  }
}

function speakWithWebSpeech(text, voiceProfile) {
  if (!('speechSynthesis' in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-MX';
  utterance.pitch = voiceProfile.pitch ?? 1;
  utterance.rate = voiceProfile.rate ?? 1;

  const voices = window.speechSynthesis.getVoices();
  const spanishVoice = voices.find((v) => v.lang?.startsWith('es'));
  if (spanishVoice) utterance.voice = spanishVoice;

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
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
