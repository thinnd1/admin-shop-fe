export class StaffSettingMeeting {
  public userId: string;
  public officeId: string;
  public lastName: string;
  public firstName: string;
  public department: string;
  public path: string;
  public flag: string

  constructor(userId: string, officeId: string, lastName: string, firstName: string, department: string, avatar: string, flag: string) {
    this.userId = userId;
    this.officeId = officeId;
    this.lastName = lastName;
    this.firstName = firstName;
    this.department = department;
    this.path = avatar;
    this.flag = flag;
  }
}
