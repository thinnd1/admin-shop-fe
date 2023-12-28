export class AcceptMeetingsSendApi {
    public requestId: any;
    public frameId: any;
    public startTime: string;
    public endTime: string;
    public place: string;
    public message: string;
    constructor(requestId: any, frameId: any, startTime: string, endTime: string, place: string, message: string) {
      this.requestId = requestId;
      this.frameId = frameId;
      this.startTime = startTime;
      this.endTime = endTime;
      this.place = place;
      this.message = message;
    }

}
