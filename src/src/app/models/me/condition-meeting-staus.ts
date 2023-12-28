export class ConditionMeetingStatus {
  public sourceRequest: string;
  public meetingStatus: string;
  public order: string;
  public pageSize: number;
  public page: number;

  constructor(sourceRequest: string, meetingStatus: string, order: string, pageSize: number, page: number) {
    this.sourceRequest = sourceRequest;
    this.meetingStatus = meetingStatus;
    this.order = order;
    this.pageSize = pageSize;
    this.page = page;
  }
}
