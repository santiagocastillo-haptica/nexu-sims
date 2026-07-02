/**
 * Capa de abstracción de voz. Hoy delega en la Web Speech API del navegador.
 * En el futuro se puede sustituir la implementación interna por un proveedor
 * externo (ej. ElevenLabs) sin tocar los componentes que llaman a speak()/stopSpeaking().
 */

let currentUtterance = null;

export function speak(text, voiceProfile = {}) {
  if (!('speechSynthesis' in window) || !text) return;

  window.speechSynthesis.cancel();

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
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}
