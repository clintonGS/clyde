import assert from 'node:assert';
import { beforeEach, describe, it, mock } from 'node:test';

import { handleAppHomeOpened } from '../../../listeners/events/app-home-opened.js';

describe('handleAppHomeOpened', () => {
  let fakeClient: any;
  let fakeContext: any;
  let fakeLogger: any;

  beforeEach(() => {
    fakeClient = { views: { publish: mock.fn(async () => ({ ok: true })) } };
    fakeContext = { userId: 'U123', botUserId: 'U0BOT' };
    fakeLogger = { error: mock.fn() };
  });

  it('publishes the home view for the user', async () => {
    await handleAppHomeOpened({ client: fakeClient, context: fakeContext, logger: fakeLogger } as any);
    assert.strictEqual(fakeClient.views.publish.mock.callCount(), 1);
    const callArgs = fakeClient.views.publish.mock.calls[0].arguments[0];
    assert.strictEqual(callArgs.user_id, 'U123');
    assert.strictEqual(callArgs.view.type, 'home');
  });

  it('logs error when views.publish fails', async () => {
    fakeClient.views.publish = mock.fn(async () => {
      throw new Error('API error');
    });
    await handleAppHomeOpened({ client: fakeClient, context: fakeContext, logger: fakeLogger } as any);
    assert.strictEqual(fakeLogger.error.mock.callCount(), 1);
  });
});
