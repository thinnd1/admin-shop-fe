export class AcceptMeetingsetting {
  public session_token: string;
  public startTime: string;
  public endTime: string;
  public place: string;

  constructor(session_token: string, startTime: string, endTime: string, place: string) {
    this.session_token = session_token;
    this.startTime = startTime;
    this.endTime = endTime;
    this.place = place;
  }
}
