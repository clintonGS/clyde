import type { HomeView, KnownBlock } from '@slack/types';

/**
 * Build the App Home view.
 */
export function buildAppHomeView(
  installUrl: string | undefined | null = null,
  isConnected = false,
  botUserId: string | undefined | null = null,
): HomeView {
  const blocks: KnownBlock[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: "Hey there :wave: I'm the Godspeed SOP Assistant.",
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          'I can help you answer questions based on the company Standard Operating Procedures.\n\n' +
          '*Send me a direct message to get started!*',
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `You can also mention me in any channel${botUserId ? ` with <@${botUserId}>` : ''}.`,
        },
      ],
    },
    { type: 'divider' },
  ];

  if (isConnected) {
    blocks.push(
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '\ud83d\udfe2 *Slack MCP Server is connected.*',
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: 'This agent has access to search messages, read channels, and more.',
          },
        ],
      },
    );
  } else if (installUrl) {
    blocks.push(
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\ud83d\udd34 *Slack MCP Server is disconnected.* <${installUrl}|Connect the Slack MCP Server.>`,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: 'The Slack MCP Server enables this agent to search messages, read channels, and more.',
          },
        ],
      },
    );
  } else {
    blocks.push(
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '\ud83d\udd34 *Slack MCP Server is disconnected.* <https://docs.slack.dev/agents-ai/model-context-protocol|Learn how to enable the Slack MCP Server.>',
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: 'The Slack MCP Server enables this agent to search messages, read channels, and more.',
          },
        ],
      },
    );
  }

  return { type: 'home', blocks };
}
