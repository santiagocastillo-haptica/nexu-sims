const agentConfigs = require('./agentConfigs.json');

const agentsById = new Map(agentConfigs.map((agent) => [agent.id, agent]));

function getAgent(agentId) {
  const agent = agentsById.get(agentId);
  if (!agent) {
    throw new Error(`Agente desconocido: ${agentId}`);
  }
  return agent;
}

module.exports = { agentConfigs, getAgent };
