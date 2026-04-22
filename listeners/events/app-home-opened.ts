import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';
import { buildAppHomeView } from '../views/app-home-builder.js';

/**
 * Handle the app_home_opened event by publishing the app's home view.
 */
export async function handleAppHomeOpened({
  client,
  context,
  logger,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<'app_home_opened'>): Promise<void> {
  try {
    const userId = context.userId as string;

    let installUrl: string | null = null;
    let isConnected = false;

    if (process.env.SLACK_CLIENT_ID) {
      if (context.userToken) {
        isConnected = true;
      } else if (process.env.SLACK_REDIRECT_URI) {
        const base = new URL(process.env.SLACK_REDIRECT_URI);
        installUrl = `${base.origin}/slack/install`;
      }
    }

    const view = buildAppHomeView(installUrl, isConnected, context.botUserId);
    await client.views.publish({ user_id: userId, view });
  } catch (e) {
    logger.error(`Failed to publish App Home: ${e}`);
  }
}
