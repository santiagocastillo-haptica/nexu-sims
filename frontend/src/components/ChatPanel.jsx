import { useEffect, useRef, useState } from 'react';
import { useSimStore } from '../state/useSimStore';
import { streamChat } from '../lib/api';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { stopSpeaking } from '../lib/voiceProvider';

export default function ChatPanel() {
  const activeChatAgentId = useSimStore((state) => state.activeChatAgentId);
  const agent = useSimStore((state) =>
    activeChatAgentId ? state.agents[activeChatAgentId] : null
  );
  const closeChat = useSimStore((state) => state.closeChat);

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const { isSupported: micSupported, isListening, transcript, startListening, stopListening } =
    useSpeechRecognition();
  const { say } = useSpeechSynthesis();

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agent?.chatHistory]);

  useEffect(() => {
    return () => stopSpeaking();
  }, [activeChatAgentId]);

  if (!agent) return null;

  const handleClose = () => {
    stopSpeaking();
    closeChat();
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
          useSimStore.getState().setAgentStatus(agent.id, 'hablando');
          useSimStore.getState().appendAgentDelta(agent.id, delta);
        },
        onDone: (fullText) => {
          useSimStore.getState().finalizeAgentReply(agent.id, fullText);
          useSimStore.getState().setAgentStatus(agent.id, 'disponible');
          say(fullText, agent.voiceProfile);
          setIsSending(false);
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

  return (
    <div className="chat-panel">
      <div className="chat-panel__header" style={{ borderColor: agent.avatarColor }}>
        <div>
          <div className="chat-panel__name">{agent.name}</div>
          <div className="chat-panel__summary">{agent.personalitySummary}</div>
        </div>
        <button className="chat-panel__close" onClick={handleClose} aria-label="Cerrar chat">
          ×
        </button>
      </div>

      <div className="chat-panel__messages">
        {agent.chatHistory.length === 0 && (
          <div className="chat-panel__empty">Escríbele algo a {agent.name} para empezar.</div>
        )}
        {agent.chatHistory.map((msg, index) => (
          <div key={index} className={`chat-message chat-message--${msg.role}`}>
            {msg.content || '…'}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-panel__input-row">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje…"
          rows={2}
        />
        {micSupported && (
          <button
            className={`chat-panel__mic ${isListening ? 'chat-panel__mic--active' : ''}`}
            onClick={toggleMic}
            title="Hablar"
          >
            🎤
          </button>
        )}
        <button className="chat-panel__send" onClick={handleSend} disabled={isSending}>
          Enviar
        </button>
      </div>
    </div>
  );
}
