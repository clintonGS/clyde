import {
  Agent,
  type AgentInputItem,
  fileSearchTool,
  MCPServerStreamableHttp,
  type RunResult,
  run,
  type Tool,
} from '@openai/agents';
import * as dotenv from 'dotenv';
import { addEmojiReaction } from './tools/index.js';

dotenv.config();

const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;
if (!vectorStoreId) {
  console.warn('OPENAI_VECTOR_STORE_ID is not set. fileSearchTool will not have access to SOPs.');
}

const CLYDE_SYSTEM_PROMPT = `\
You are Clyde, the Godspeed SOP Assistant. You help employees answer questions \
based strictly on the company's Standard Operating Procedures (SOPs).

## PERSONALITY
- Calm, competent, and efficient
- Helpful and directly answers the question using the provided SOPs.
- Confident but honest when you don't know something.
- If the answer is not found in the SOP documents, state clearly that you cannot find it.

## WORKFLOW
1. Acknowledge the user's issue/question.
2. Search the attached SOP knowledge base using the file_search tool.
3. Provide a clear, actionable answer based on the SOPs.
4. Reference the specific SOP document title or section if possible.

## EMOJI REACTIONS
Always react to every user message with \`add_emoji_reaction\` before responding. \
Pick any Slack emoji that reflects the topic or tone of the message.
- Do not use \`eyes\` — it is added automatically.

## SLACK MCP SERVER
You may have access to the Slack MCP Server, which gives you powerful Slack tools. Use them whenever they would help the user.
`;

import type { ClydeDeps } from './deps.js';

const SLACK_MCP_URL = 'https://mcp.slack.com/mcp';

const tools: Tool[] = [addEmojiReaction as Tool];

if (vectorStoreId) {
  tools.push(fileSearchTool(vectorStoreId) as Tool);
}

export const clydeAgent = new Agent({
  name: 'Clyde',
  instructions: CLYDE_SYSTEM_PROMPT,
  tools: tools,
  model: 'gpt-4o-mini',
});

/**
 * Run the Clyde agent, optionally connecting to the Slack MCP server.
 * @param inputItems - The input for the agent.
 * @param deps - The dependencies.
 */
export async function runClyde(inputItems: string | AgentInputItem[], deps: ClydeDeps): Promise<RunResult<any, any>> {
  if (deps.userToken) {
    const mcpServer = new MCPServerStreamableHttp({
      url: SLACK_MCP_URL,
      requestInit: { headers: { Authorization: `Bearer ${deps.userToken}` } },
    });

    try {
      await mcpServer.connect();
      const agentWithMcp = clydeAgent.clone({ mcpServers: [mcpServer] });
      return await run(agentWithMcp, inputItems, { context: deps });
    } finally {
      await mcpServer.close();
    }
  }

  return await run(clydeAgent, inputItems, { context: deps });
}
