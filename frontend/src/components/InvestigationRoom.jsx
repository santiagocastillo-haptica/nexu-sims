import { useEffect, useRef, useState } from 'react';
import { useSimStore } from '../state/useSimStore';
import { streamChat } from '../lib/api';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { synthesizeAudioUrl, playAudioUrl, speakWebSpeech, playSequence, stopSpeaking } from '../lib/voiceProvider';
import SimAvatar from './SimAvatar';

const DEFAULT_APPEARANCE = { skinTone: '#e7b48c', hairColor: '#3b2a1e', hairStyle: 'short' };

async function playAgentReply(agentId, messageIndex, text, voiceProfile) {
  const store = useSimStore.getState();
  store.setAgentStatus(agentId, 'hablando');

  let url = null;
  if (voiceProfile.elevenLabsVoiceId) {
    url = await synthesizeAudioUrl(text, voiceProfile.elevenLabsVoiceId);
    if (url) store.setMessageAudio(agentId, messageIndex, url);
  }

  if (url) {
    await playAudioUrl(url);
  } else {
    await speakWebSpeech(text, voiceProfile);
  }

  store.setAgentStatus(agentId, 'disponible');
}

export default function InvestigationRoom() {
  const activeChatAgentId = useSimStore((state) => state.activeChatAgentId);
  const agent = useSimStore((state) =>
    activeChatAgentId ? state.agents[activeChatAgentId] : null
  );
  const backToSelect = useSimStore((state) => state.backToSelect);

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const transcriptEndRef = useRef(null);

  const { isSupported: micSupported, isListening, transcript, startListening, stopListening } =
    useSpeechRecognition();

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agent?.chatHistory]);

  useEffect(() => {
    return () => stopSpeaking();
  }, [activeChatAgentId]);

  if (!agent) return null;

  const appearance = agent.appearance || DEFAULT_APPEARANCE;

  const handleBack = () => {
    stopSpeaking();
    backToSelect();
  };

  const handleSend = async () => {
    const message = input.trim();
    if (!message || isSending) return;

    const store = useSimStore.getState();
    const history = agent.chatHistory.map(({ role, content }) => ({ role, content }));

    store.appendUserMessage(agent.id, message);
    store.setAgentStatus(agent.id, 'pensando');
    store.startAgentReply(agent.id);
    setInput('');
    setIsSending(true);

    await streamChat(
      { agentId: agent.id, message, conversationHistory: history },
      {
        onDelta: (delta) => {
          useSimStore.getState().setAgentStatus(agent.id, 'pensando');
          useSimStore.getState().appendAgentDelta(agent.id, delta);
        },
        onDone: (fullText) => {
          useSimStore.getState().finalizeAgentReply(agent.id, fullText);
          setIsSending(false);
          const messageIndex = useSimStore.getState().agents[agent.id].chatHistory.length - 1;
          playAgentReply(agent.id, messageIndex, fullText, agent.voiceProfile);
        },
        onError: (msg) => {
          useSimStore.getState().finalizeAgentReply(agent.id, `⚠️ ${msg}`);
          useSimStore.getState().setAgentStatus(agent.id, 'disponible');
          setIsSending(false);
        },
      }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleReplayLast = () => {
    const lastAssistant = [...agent.chatHistory].reverse().find((m) => m.role === 'assistant');
    if (!lastAssistant) return;
    useSimStore.getState().setAgentStatus(agent.id, 'hablando');
    const finish = () => useSimStore.getState().setAgentStatus(agent.id, 'disponible');
    if (lastAssistant.audioUrl) {
      playAudioUrl(lastAssistant.audioUrl).then(finish);
    } else {
      speakWebSpeech(lastAssistant.content, agent.voiceProfile).then(finish);
    }
  };

  const handleReplayAll = () => {
    const assistantMessages = agent.chatHistory.filter((m) => m.role === 'assistant');
    if (assistantMessages.length === 0) return;
    useSimStore.getState().setAgentStatus(agent.id, 'hablando');
    playSequence(
      assistantMessages.map((m) => ({ content: m.content, audioUrl: m.audioUrl, voiceProfile: agent.voiceProfile }))
    ).then(() => useSimStore.getState().setAgentStatus(agent.id, 'disponible'));
  };

  const handleDownload = () => {
    const lines = agent.chatHistory.map((m) => `${m.role === 'user' ? 'Tú' : agent.name}: ${m.content}`);
    const blob = new Blob([lines.join('\n\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversacion_${agent.name.toLowerCase().replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasAssistantMessages = agent.chatHistory.some((m) => m.role === 'assistant');

  return (
    <div className="investigation-room">
      <button className="investigation-room__back" onClick={handleBack}>
        ← Expedientes
      </button>

      <div className="investigation-room__layout">
        <div className="avatar-panel">
          <div className="avatar-panel__circle">
            <SimAvatar
              bodyColor={agent.avatarColor}
              skinTone={appearance.skinTone}
              hairColor={appearance.hairColor}
              hairStyle={appearance.hairStyle}
              talking={agent.status === 'hablando'}
            />
          </div>
          <p className="avatar-panel__name">{agent.name}</p>
          {agent.archetype && <div className="avatar-panel__archetype">{agent.archetype}</div>}

          {agent.status === 'hablando' && (
            <div className="avatar-panel__speaking-badge">
              <span className="avatar-panel__bar" style={{ height: 8 }} />
              <span className="avatar-panel__bar" style={{ height: 14 }} />
              <span className="avatar-panel__bar" style={{ height: 6 }} />
              <span>Hablando...</span>
            </div>
          )}
          {agent.status === 'pensando' && (
            <div className="avatar-panel__speaking-badge avatar-panel__speaking-badge--thinking">
              <span>Pensando...</span>
            </div>
          )}

          <button
            className="avatar-panel__btn avatar-panel__btn--primary"
            onClick={handleReplayLast}
            disabled={!hasAssistantMessages}
          >
            ↻ Última respuesta
          </button>
          <button
            className="avatar-panel__btn avatar-panel__btn--secondary"
            onClick={handleReplayAll}
            disabled={!hasAssistantMessages}
          >
            ▶ Toda la conversación
          </button>
          <button
            className="avatar-panel__btn avatar-panel__btn--secondary"
            onClick={handleDownload}
            disabled={agent.chatHistory.length === 0}
          >
            ⬇ Descargar conversación
          </button>
        </div>

        <div className="conversation-panel">
          <div className="transcript">
            {agent.chatHistory.length === 0 && (
              <div className="transcript__empty">Escríbele algo a {agent.name} para empezar.</div>
            )}
            {agent.chatHistory.map((msg, index) => (
              <div key={index} className={`bubble bubble--${msg.role}`}>
                {msg.content || '…'}
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>

          <div className="conversation-panel__input-row">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Escribe tu pregunta para ${agent.name}`}
            />
            {micSupported && (
              <button
                className={`conversation-panel__mic ${isListening ? 'conversation-panel__mic--active' : ''}`}
                onClick={toggleMic}
                title="Hablar"
              >
                🎤
              </button>
            )}
            <button className="conversation-panel__send" onClick={handleSend} disabled={isSending}>
              ➤
            </button>
          </div>
          {isListening && <p className="conversation-panel__mic-hint">Escuchando…</p>}
        </div>
      </div>
    </div>
  );
}
