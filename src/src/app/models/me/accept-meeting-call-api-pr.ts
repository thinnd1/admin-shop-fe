export class AcceptMeetingCallApiPr {
  public requestId: any;
  public frameId: any;
  public startTime: string;
  public endTime: string;
  public place: string;
  public visitNumber: number;
  constructor(requestId: any, frameId: any, startDate: string, endDate: string, place: string, visitNumber: number) {
    this.requestId = requestId;
    this.frameId = frameId;
    this.startTime = startDate;
    this.endTime = endDate;
    this.place = place;
    this.visitNumber = visitNumber;
  }
}
