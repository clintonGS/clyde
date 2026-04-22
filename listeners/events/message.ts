import type { AgentInputItem } from '@openai/agents';
import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';
import type { GenericMessageEvent, MessageEvent } from '@slack/types';
import { ClydeDeps, runClyde } from '../../agent/index.js';
import { conversationStore } from '../../thread-context/index.js';
import { buildFeedbackBlocks } from '../views/feedback-builder.js';

function isGenericMessageEvent(event: MessageEvent): event is GenericMessageEvent {
  return !('subtype' in event && event.subtype !== undefined);
}

type IssueSubmissionMetadata = { event_type: 'issue_submission'; event_payload: { user_id: string } };

function getIssueMetadata(event: GenericMessageEvent): IssueSubmissionMetadata | null {
  const metadata = (event as any).metadata;
  return metadata?.event_type === 'issue_submission' ? metadata : null;
}

/**
 * Handle messages sent to Clyde via DM or in threads the bot is part of.
 */
export async function handleMessage({
  client,
  context,
  event,
  logger,
  say,
  sayStream,
  setStatus,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<'message'>): Promise<void> {
  // Skip message subtypes (edits, deletes, etc.)
  if (!isGenericMessageEvent(event)) return;

  // Issue submissions are posted by the bot with metadata so the message
  // handler can run the agent on behalf of the original user.
  const issueMetadata = getIssueMetadata(event);

  // Skip bot messages that are not issue submissions.
  if (event.bot_id && !issueMetadata) return;

  const isDm = event.channel_type === 'im';
  const isThreadReply = !!event.thread_ts;

  if (isDm) {
    // DMs are always handled
  } else if (isThreadReply) {
    // Channel thread replies are handled only if the bot is already engaged
    const history = conversationStore.getHistory(event.channel as string, event.thread_ts as string);
    if (history === null) return;
  } else {
    // Top-level channel messages are handled by app_mentioned
    return;
  }

  try {
    const channelId = event.channel;
    const text = event.text || '';
    const threadTs = event.thread_ts || event.ts;

    // For issue submissions the bot posted the message, so the real
    // user_id comes from the metadata rather than the event context.
    const userId = issueMetadata ? issueMetadata.event_payload.user_id : /** @type {string} */ (context.userId);

    // Get conversation history
    const history = conversationStore.getHistory(channelId, threadTs as string);

    // Add eyes reaction only to the first message (DMs only — channel
    // threads already have the reaction from the initial app_mention)
    if (isDm && history === null) {
      await client.reactions.add({
        channel: channelId,
        timestamp: event.ts,
        name: 'eyes',
      });
    }

    // Set assistant thread status with loading messages
    await setStatus({
      status: 'Thinking…',
      loading_messages: [
        'Teaching the hamsters to type faster…',
        'Untangling the internet cables…',
        'Consulting the office goldfish…',
        'Polishing up the response just for you…',
        'Convincing the AI to stop overthinking…',
      ],
    });

    // Run the agent
    const inputItems: string | AgentInputItem[] = history ? [...history, { role: 'user', content: text }] : text;

    const deps = new ClydeDeps(
      client,
      userId as string,
      channelId,
      threadTs as string,
      event.ts,
      context.userToken as string | undefined,
    );
    const result = await runClyde(inputItems, deps);

    // Stream response in thread with feedback buttons
    const streamer = sayStream();
    await streamer.append({ markdown_text: result.finalOutput });
    const feedbackBlocks = buildFeedbackBlocks();
    await streamer.stop({ blocks: feedbackBlocks });

    // Store conversation history
    conversationStore.setHistory(channelId, threadTs as string, result.history);
  } catch (e) {
    logger.error(`Failed to handle message: ${e}`);
    await say({
      text: `:warning: Something went wrong! (${e})`,
      thread_ts: event.thread_ts || event.ts,
    });
  }
}
