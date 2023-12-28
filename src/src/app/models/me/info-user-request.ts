export class InfoUserRequest {
  public imageUrl: string;
  public officeName: string;
  public firstName: string;
  public lastName: string;
  public firstNameKana: string;
  public lastNameKana: string;
  public officeId: string;
  public userId: string;
  public industryType: string;
  public deptName: string;

  constructor(avatar: string, companyName: string, firstName: string, lastName: string, officeId: string, userId: string,
              industryType: string, department: string) {
    this.imageUrl = avatar;
    this.officeName = companyName;
    this.firstName = firstName;
    this.lastName = lastName;
    this.officeId = officeId;
    this.userId = userId;
    this.industryType = industryType;
    this.deptName = department;
    this.firstNameKana = '';
    this.lastNameKana = '';
  }
}
