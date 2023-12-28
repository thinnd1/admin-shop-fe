export class InfoMeetingRequest {
  public requestId: string;
  public requestStatus: number;
  public direction: number;
  public mrInfo: any;
  public drInfo: any;
  public mediator: any;
  public candidateTimes: any[];
  public acceptedStartTime: string;
  public acceptedEndTime: string;
  public place: string;
  public comment: any[];
  public purposeId: string;
  public purposeName: string;
  public drugList: any[];
  public productName: string;
  public numVisitors: number;
  public frameMeetingInfo: any;
  public canceler: any;
  public accepter: any;
  public inputType: string;
  public meetingRestriction: string;
}
