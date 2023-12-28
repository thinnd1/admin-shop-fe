export class RejectMeetingsRequest {
  public requestId: string;
  public comment: string;
  public token: string;
  constructor(requestId: string, comment: string, token: string) {
    this.requestId = requestId;
    this.comment = comment;
    this.token = token;
  }
}
