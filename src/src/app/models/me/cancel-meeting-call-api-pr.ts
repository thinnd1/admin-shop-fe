export class CancelMeetingsSendApiPr {
  public requestId: string;
  public frameId: string;
  public type: string;
  public message: string;
  public session: string;
  public userId: string;
  constructor(requestId: string, frameId: string, type: string, message: string, session: string, userId: string) {
    this.requestId = requestId;
    this.frameId = frameId;
    this.type = type;
    this.message = message;
    this.session = session;
    this.userId = userId;
  }
}
