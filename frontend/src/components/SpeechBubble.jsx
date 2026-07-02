export default function SpeechBubble({ text, color }) {
  return (
    <div className="speech-bubble" style={{ borderColor: color }}>
      {text}
    </div>
  );
}
