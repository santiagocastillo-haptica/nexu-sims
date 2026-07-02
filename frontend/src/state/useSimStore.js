import { create } from 'zustand';
import { ZONES, randomZoneId } from './zones';

export const useSimStore = create((set, get) => ({
  agents: {},
  agentOrder: [],
  loaded: false,
  activeChatAgentId: null,

  setAgents: (agentList) => {
    const agents = {};
    const agentOrder = [];
    agentList.forEach((agent, index) => {
      agentOrder.push(agent.id);
      agents[agent.id] = {
        ...agent,
        zoneId: ZONES[index % ZONES.length].id,
        status: 'disponible',
        chatHistory: [],
        bubble: null,
      };
    });
    set({ agents, agentOrder, loaded: true });
  },

  moveAgentToRandomZone: (agentId) => {
    set((state) => {
      const agent = state.agents[agentId];
      if (!agent) return state;
      const nextZoneId = randomZoneId(agent.zoneId);
      return {
        agents: {
          ...state.agents,
          [agentId]: { ...agent, zoneId: nextZoneId },
        },
      };
    });
  },

  setAgentStatus: (agentId, status) => {
    set((state) => {
      const agent = state.agents[agentId];
      if (!agent) return state;
      return { agents: { ...state.agents, [agentId]: { ...agent, status } } };
    });
  },

  setBubble: (agentId, text) => {
    set((state) => {
      const agent = state.agents[agentId];
      if (!agent) return state;
      return { agents: { ...state.agents, [agentId]: { ...agent, bubble: text } } };
    });
  },

  clearBubble: (agentId) => {
    set((state) => {
      const agent = state.agents[agentId];
      if (!agent) return state;
      return { agents: { ...state.agents, [agentId]: { ...agent, bubble: null } } };
    });
  },

  openChat: (agentId) => set({ activeChatAgentId: agentId }),
  closeChat: () => set({ activeChatAgentId: null }),

  appendUserMessage: (agentId, text) => {
    set((state) => {
      const agent = state.agents[agentId];
      if (!agent) return state;
      const chatHistory = [...agent.chatHistory, { role: 'user', content: text }];
      return { agents: { ...state.agents, [agentId]: { ...agent, chatHistory } } };
    });
  },

  startAgentReply: (agentId) => {
    set((state) => {
      const agent = state.agents[agentId];
      if (!agent) return state;
      const chatHistory = [...agent.chatHistory, { role: 'assistant', content: '' }];
      return { agents: { ...state.agents, [agentId]: { ...agent, chatHistory } } };
    });
  },

  appendAgentDelta: (agentId, delta) => {
    set((state) => {
      const agent = state.agents[agentId];
      if (!agent) return state;
      const chatHistory = [...agent.chatHistory];
      const lastIndex = chatHistory.length - 1;
      if (lastIndex < 0 || chatHistory[lastIndex].role !== 'assistant') return state;
      chatHistory[lastIndex] = {
        ...chatHistory[lastIndex],
        content: chatHistory[lastIndex].content + delta,
      };
      return { agents: { ...state.agents, [agentId]: { ...agent, chatHistory } } };
    });
  },

  finalizeAgentReply: (agentId, fullText) => {
    set((state) => {
      const agent = state.agents[agentId];
      if (!agent) return state;
      const chatHistory = [...agent.chatHistory];
      const lastIndex = chatHistory.length - 1;
      if (lastIndex >= 0 && chatHistory[lastIndex].role === 'assistant') {
        chatHistory[lastIndex] = { ...chatHistory[lastIndex], content: fullText };
      }
      return { agents: { ...state.agents, [agentId]: { ...agent, chatHistory } } };
    });
  },

  getAgentsInSameZone: () => {
    const { agents, agentOrder } = get();
    const byZone = {};
    agentOrder.forEach((id) => {
      const zoneId = agents[id].zoneId;
      byZone[zoneId] = byZone[zoneId] || [];
      byZone[zoneId].push(id);
    });
    return Object.values(byZone).filter((group) => group.length >= 2);
  },
}));
