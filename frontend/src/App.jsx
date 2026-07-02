import { useEffect, useState } from 'react';
import './App.css';
import Scene from './components/Scene';
import ChatPanel from './components/ChatPanel';
import { useSimStore } from './state/useSimStore';
import { fetchAgents } from './lib/api';
import { useAgentMovement } from './hooks/useAgentMovement';
import { useAgentInteractionLoop } from './hooks/useAgentInteractionLoop';

function App() {
  const loaded = useSimStore((state) => state.loaded);
  const setAgents = useSimStore((state) => state.setAgents);
  const openChat = useSimStore((state) => state.openChat);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    fetchAgents()
      .then(setAgents)
      .catch((err) => setLoadError(err.message));
  }, [setAgents]);

  useAgentMovement();
  useAgentInteractionLoop();

  return (
    <div className="app">
      <header className="app__header">
        <h1>Casa de Usuarios — Fintech</h1>
        <p>Haz click en un personaje para chatear con él. Los personajes también conversan entre sí.</p>
      </header>

      {loadError && (
        <div className="app__error">
          No se pudo conectar con el backend ({loadError}). Verifica que esté corriendo en el puerto configurado.
        </div>
      )}

      {loaded && <Scene onSelectAgent={openChat} />}

      <ChatPanel />
    </div>
  );
}

export default App;
