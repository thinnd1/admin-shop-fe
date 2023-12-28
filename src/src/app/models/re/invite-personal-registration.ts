/**
 * OF0001 初回登録
 */
export class InvitePersonalRegistration {
  public medicalOfficeId: string;
  public invitationCode: string;
  public name: string;
  public loginId: string;

  constructor() {
    this.medicalOfficeId = '';
    this.invitationCode = '';
    this.name = '';
    this.loginId  = '';
  };
}
