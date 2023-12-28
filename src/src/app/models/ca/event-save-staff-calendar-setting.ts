import {SettingsSelfSettings} from './settings-self-settings';

export class EventSaveStaffCalendarSetting {
  public referencingUsersList: SettingsSelfSettings[];
  public status: number;
  public referencedUserIdsList: string[];

  constructor(referencingUsersList: SettingsSelfSettings[], status: number, referencedUserIdsList: string[]) {
    this.referencingUsersList = referencingUsersList;
    this.status = status;
    this.referencedUserIdsList = referencedUserIdsList;
  }
}
