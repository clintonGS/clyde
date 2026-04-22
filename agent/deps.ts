import type { WebClient } from '@slack/web-api';

/**
 * Dependencies passed to the Clyde agent as run context.
 */
export class ClydeDeps {
  public client: WebClient;
  public userId: string;
  public channelId: string;
  public threadTs: string;
  public messageTs: string;
  public userToken?: string;

  constructor(
    client: WebClient,
    userId: string,
    channelId: string,
    threadTs: string,
    messageTs: string,
    userToken: string | undefined = undefined,
  ) {
    this.client = client;
    this.userId = userId;
    this.channelId = channelId;
    this.threadTs = threadTs;
    this.messageTs = messageTs;
    this.userToken = userToken;
  }
}
