import type { AllMiddlewareArgs, BlockFeedbackButtonsAction, SlackActionMiddlewareArgs } from '@slack/bolt';

/**
 * Handle feedback button interactions.
 */
export async function handleFeedbackButton({
  ack,
  body,
  client,
  context,
  logger,
}: AllMiddlewareArgs & SlackActionMiddlewareArgs<BlockFeedbackButtonsAction>): Promise<void> {
  await ack();

  try {
    const userId = context.userId as string;
    const channelId = body.channel?.id as string;
    const messageTs = body.message?.ts as string;
    const feedbackValue = body.actions[0].value;

    if (feedbackValue === 'good-feedback') {
      await client.chat.postEphemeral({
        channel: channelId,
        user: userId,
        thread_ts: messageTs,
        text: 'Glad that was helpful! :tada:',
      });
    } else {
      await client.chat.postEphemeral({
        channel: channelId,
        user: userId,
        thread_ts: messageTs,
        text: "Sorry that wasn't helpful. :slightly_frowning_face: Try rephrasing your question or I can create a support ticket for you.",
      });
    }

    logger.debug(`Feedback received: value=${feedbackValue}, message_ts=${messageTs}`);
  } catch (e) {
    logger.error(`Failed to handle feedback: ${e}`);
  }
}
