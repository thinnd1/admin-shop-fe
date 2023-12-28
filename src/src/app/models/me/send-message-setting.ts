export class SendMessageSetting {
  public oneTimeSessionToken: string;
  public messageContent: string;

  constructor(oneTimeSessionToken: string, messageContent: string) {
    this.oneTimeSessionToken = oneTimeSessionToken;
    this.messageContent = messageContent;
  }
}
