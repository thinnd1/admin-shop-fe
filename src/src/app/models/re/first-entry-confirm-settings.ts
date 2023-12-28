/**
 * RE0025 初回登録
 */
export class FirstEntryConfirmSettings {
  public birthDate: string;
  public genderType: string;
  public loginId: string;
  public mailAddress: string;
  public newLoginId: string;
  public password: string;
  public specializedDepartment: any;
  constructor(birthDate: string, genderType: string, loginId: string,
    mailAddress: string, newLoginId: string, password: string, specializedDepartment: any) {
    this.birthDate = birthDate;
    this.genderType = genderType;
    this.loginId = loginId;
    this.mailAddress = mailAddress;
    this.newLoginId = newLoginId;
    this.password = password;
    this.specializedDepartment = specializedDepartment;
  }
}
