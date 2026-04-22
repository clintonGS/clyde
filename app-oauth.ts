import 'dotenv/config';

import { readFileSync } from 'node:fs';

import { App, type Installation, type InstallationQuery, type InstallationStore, LogLevel } from '@slack/bolt';
import pkg from '@slack/oauth';

const { FileInstallationStore } = pkg;

import { registerListeners } from './listeners/index.js';

const manifest = JSON.parse(readFileSync('manifest.json', 'utf-8'));
const botScopes = manifest.oauth_config.scopes.bot;
const userScopes = manifest.oauth_config.scopes.user;

// ---------------------------------------------------------------------------
// Installation store with bot-token fallback
// ---------------------------------------------------------------------------
// When installed via Slack CLI, SLACK_BOT_TOKEN is available but Bolt clears
// it when OAuth options are present. This wrapper lets the bot token serve as
// a fallback so App Home (with the OAuth install URL) and basic bot operations
// work before anyone has completed the OAuth flow.

const fileStore = new FileInstallationStore({ baseDir: './data/installations' });
const fallbackBotToken = process.env.SLACK_BOT_TOKEN;

const installationStore: InstallationStore = {
  storeInstallation: async (installation: Installation) => fileStore.storeInstallation(installation),
  fetchInstallation: async (query: InstallationQuery<boolean>): Promise<Installation> => {
    try {
      return await fileStore.fetchInstallation(query);
    } catch {
      if (fallbackBotToken) {
        return { bot: { token: fallbackBotToken, scopes: [] } } as any as Installation;
      }
      throw new Error('No installation found and no fallback bot token configured');
    }
  },
  deleteInstallation: async (query: InstallationQuery<boolean>) => fileStore.deleteInstallation(query),
};

const app = new App({
  logLevel: LogLevel.DEBUG,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  ignoreSelf: false,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: 'bolt-js-clyde-agent',
  scopes: botScopes,
  installationStore,
  installerOptions: {
    stateVerification: true,
    userScopes,
  },
});

registerListeners(app);

(async () => {
  const port = Number.parseInt(process.env.PORT || '3000', 10);
  await app.start(port);
  app.logger.info(`Clyde is running on port ${port}!`);
  if (process.env.SLACK_REDIRECT_URI) {
    const origin = new URL(process.env.SLACK_REDIRECT_URI).origin;
    app.logger.info(`Connect the Slack MCP Server: ${origin}/slack/install`);
  }
})();
