import { useEffect, useRef, useState } from 'react';
import { useSimStore } from '../state/useSimStore';
import { streamChat } from '../lib/api';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useTypewriter } from '../hooks/useTypewriter';
import { stopSpeaking } from '../lib/voiceProvider';
import SimAvatar from './SimAvatar';

const DEFAULT_APPEARANCE = { skinTone: '#e7b48c', hairColor: '#3b2a1e', hairStyle: 'short' };
const STATUS_LABEL = { disponible: '', pensando: 'Pensando…', hablando: '' };

export default function InvestigationRoom() {
  const activeChatAgentId = useSimStore((state) => state.activeChatAgentId);
  const agent = useSimStore((state) =>
    activeChatAgentId ? state.agents[activeChatAgentId] : null
  );
  const backToSelect = useSimStore((state) => state.backToSelect);

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const logEndRef = useRef(null);

  const { isSupported: micSupported, isListening, transcript, startListening, stopListening } =
    useSpeechRecognition();
  const { say } = useSpeechSynthesis();

  const lastMessage = agent?.chatHistory[agent.chatHistory.length - 1] || null;
  const { visibleText, isTyping, skip } = useTypewriter(lastMessage?.content || '');

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const handleDialogueClick = () => {
    if (isTyping) skip();
  };

  const speakerName = lastMessage?.role === 'user' ? 'Tú' : agent.name;

  return (
    <div className="investigation-room">
      <button className="investigation-room__back" onClick={handleBack}>
        ← Expedientes
      </button>

      <div className="investigation-room__main">
        <aside className="case-log">
          {agent.chatHistory.length === 0 && (
            <div className="case-log__empty">Sin preguntas todavía.</div>
          )}
          {agent.chatHistory.map((msg, index) => (
            <div key={index} className={`case-log__entry case-log__entry--${msg.role}`}>
              <span className="case-log__speaker">{msg.role === 'user' ? 'Tú' : agent.name}:</span>{' '}
              {msg.content || '…'}
            </div>
          ))}
          <div ref={logEndRef} />
        </aside>

        <div className="investigation-room__stage">
          <div className="investigation-room__tag">
            {agent.name}
            {agent.archetype && <span className="investigation-room__tag-archetype"> · {agent.archetype}</span>}
          </div>
          <div className="investigation-room__portrait">
            <SimAvatar
              bodyColor={agent.avatarColor}
              skinTone={appearance.skinTone}
              hairColor={appearance.hairColor}
              hairStyle={appearance.hairStyle}
              talking={agent.status === 'hablando'}
            />
          </div>
        </div>
      </div>

      <div className="dialogue-box" onClick={handleDialogueClick}>
        <div className="dialogue-box__nameplate">
          {speakerName}
          {agent.status === 'pensando' && (
            <span className="dialogue-box__status"> {STATUS_LABEL.pensando}</span>
          )}
        </div>
        <div className="dialogue-box__text">
          {visibleText || (agent.chatHistory.length === 0 ? 'Empieza la investigación. Escribe tu primera pregunta.' : '')}
          {isTyping && <span className="dialogue-box__cursor">▌</span>}
        </div>

        <div className="dialogue-box__input-row" onClick={(e) => e.stopPropagation()}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Pregúntale algo a ${agent.name}…`}
            rows={2}
          />
          {micSupported && (
            <button
              className={`dialogue-box__mic ${isListening ? 'dialogue-box__mic--active' : ''}`}
              onClick={toggleMic}
              title="Hablar"
            >
              🎤
            </button>
          )}
          <button className="dialogue-box__send" onClick={handleSend} disabled={isSending}>
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
