/**
 * RE0015 スタッフ一括招待
 */
export class StaffInvite {
  public firstName: string;
  public lastName: string;
  public lastNameKana: string;
  public firstNameKana: string;
  public department: any;
  public jobType: string;
  public mailAddress: string;
  public managementAuthority: string;
  public funcAuthoritySet: string;
  public duplicateMailMessage: string;

  constructor(firstName, lastName, lastNameKana, firstNameKana, department, jobType, mailAddress, managementAuthority,
    funcAuthoritySet) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.lastNameKana = lastNameKana;
    this.firstNameKana = firstNameKana;
    this.department = department;
    this.jobType = jobType;
    this.mailAddress = mailAddress;
    this.managementAuthority = managementAuthority;
    this.funcAuthoritySet = funcAuthoritySet;
    this.duplicateMailMessage = '';
  }
}
