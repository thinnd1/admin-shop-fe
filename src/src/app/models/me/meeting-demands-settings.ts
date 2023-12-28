/**
 * Me0021 初回登録
 */
import {MeetingDemandsItemSettings} from './meeting-demands-item-settings';
export class MeetingsDemandsSettings {
  public officeId: string;
  public userId: string;
  public lastName: string;
  public firstName: string;
  public details: string;
  public meetingDemand: MeetingDemandsItemSettings[];
  public updated: string;
  private updateder: string;

  constructor() {
    this.officeId = null;
    this.userId = null;
    this.lastName = null;
    this.firstName = null;
    this.details = null;
    this.meetingDemand = [];
    this.updated = null;
    this.updateder = null;
  }
}
