export class CancelMeetingsSendApi {
  public requestId: string;
  public frameId: string;
  public message: string;
  public allFollowing: boolean;
  constructor(requestId: string, frameId: string, message: string, allFollowing: boolean) {
    this.requestId = requestId;
    this.frameId = frameId;
    this.message = message;
    this.allFollowing = allFollowing;
  }
}
