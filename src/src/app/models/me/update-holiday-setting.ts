export class UpdateHolidaySetting {
  settingType: number;
  officeId: string;
  jobType: string;
  userId: string;
  allowHolidayVisit: boolean;

  constructor(settingType: number, officeId: string, jobType: string, userId: string, allowHolidayVisit: boolean) {
    this.settingType = settingType;
    this.officeId = officeId;
    this.jobType = jobType;
    this.userId = userId;
    this.allowHolidayVisit = allowHolidayVisit;
  }
}
