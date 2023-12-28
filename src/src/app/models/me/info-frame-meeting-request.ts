import {InfoMeetingRequest} from '../me/info-meeting-request';
export class InfoFrameMeetingRequest {
  public frameId: string;
  public frameStatus: number;
  public endTime: string;
  public startTime: string;
  public frameBasic: any;
  public doctor: any;
  public place: string;
  public candidates: InfoMeetingRequest[];
  public rrule: string;
}
