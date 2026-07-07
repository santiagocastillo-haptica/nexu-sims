import { useEffect, useRef, useState } from 'react';

const MS_PER_CHAR = 22;

/**
 * Revela `targetText` caracter a caracter a ritmo constante, persiguiendo el texto
 * objetivo aunque este siga creciendo (útil mientras llega por streaming). Devuelve
 * el texto visible, si todavía está revelando, y una función para saltar al final.
 */
export function useTypewriter(targetText) {
  const [visibleLength, setVisibleLength] = useState(0);
  const targetRef = useRef(targetText);
  const rafRef = useRef(null);
  const lastTickRef = useRef(0);

  targetRef.current = targetText;

  useEffect(() => {
    if (targetText.length < visibleLength) {
      // El texto objetivo cambió a algo más corto (nuevo mensaje): reinicia.
      setVisibleLength(0);
    }
  }, [targetText, visibleLength]);

  useEffect(() => {
    function tick(now) {
      if (!lastTickRef.current) lastTickRef.current = now;
      const elapsed = now - lastTickRef.current;

      setVisibleLength((current) => {
        const target = targetRef.current.length;
        if (current >= target) return current;
        const charsToAdd = Math.max(1, Math.floor(elapsed / MS_PER_CHAR));
        return Math.min(target, current + charsToAdd);
      });

      lastTickRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTickRef.current = 0;
    };
  }, []);

  const visibleText = targetText.slice(0, visibleLength);
  const isTyping = visibleLength < targetText.length;
  const skip = () => setVisibleLength(targetRef.current.length);

  return { visibleText, isTyping, skip };
}
