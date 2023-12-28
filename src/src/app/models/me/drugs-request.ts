export class DrugsRequest {
  public officeName: string;
  public firstName: string;
  public lastName: string;
  public mailAddress: string;
  public phoneNumber: string;
  public drugs: any[];

  constructor(officeName: string, firstName: string, lastName: string, mailAddress: string, phoneNumber: string, drugs: any[]) {
    this.officeName = officeName;
    this.firstName = firstName;
    this.lastName = lastName;
    this.mailAddress = mailAddress;
    this.phoneNumber = phoneNumber;
    this.drugs = drugs;
  }
}
