export class RejectMeetingSetting{
  public session_token: string;
  public message: string;


  constructor(session_token: string, message: string) {
    this.session_token = session_token;
    this.message = message;
  }
}
