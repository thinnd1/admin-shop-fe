/**
 * RE0023 初回登録
 */
export class FirstEntrySettings {
  public firstName: string;
  public firstNameKana: string;
  public jobType: string;
  public lastName: string;
  public lastNameKana: string;
  public loginId: string;
  public mailAddress: string;
  public chkResgister: boolean;
  public dayBirth: string;
  public emailNotification: boolean;
  public gender: string;
  public monthBirth: string;
  public newPassword: string;
  public newPasswordConfirm: string;
  public newEmailAddress: string;
  public specializedDepartmentField: any;
  public specializedDepartmentType: any;
  public yearBirth: string;
  public jobName: string;
  constructor(firstName: string, lastName: string, lastNameKana: string, loginId: string, mailAddress: string, firstNameKana: string,
    jobType: string, jobName: string, chkResgister: boolean, dayBirth: string, emailNotification: boolean, gender: string, monthBirth: string,
    newPassword: string, newPasswordConfirm: string, newEmailAddress: string, specializedDepartmentField: any,
    specializedDepartmentType: any, yearBirth: string) {
    this.firstName = firstName;
    this.firstNameKana = firstNameKana;
    this.lastName = lastName;
    this.lastNameKana = lastNameKana;
    this.loginId = loginId;
    this.mailAddress = mailAddress;
    this.jobType = jobType;
    this.jobName = jobName;
    this.chkResgister = chkResgister;
    this.dayBirth = dayBirth;
    this.monthBirth = monthBirth;
    this.yearBirth = yearBirth;
    this.emailNotification = emailNotification;
    this.gender = gender;
    this.newPassword = newPassword;
    this.newPasswordConfirm = newPasswordConfirm;
    this.newEmailAddress = newEmailAddress;
    this.specializedDepartmentField = specializedDepartmentField;
    this.specializedDepartmentType = specializedDepartmentType;

  }
}
