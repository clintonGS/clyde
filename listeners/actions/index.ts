import type { App } from '@slack/bolt';
import { handleFeedbackButton } from './feedback-buttons.js';

/**
 * Register action listeners with the Bolt app.
 */
export function register(app: App): void {
  app.action('feedback', handleFeedbackButton);
}
