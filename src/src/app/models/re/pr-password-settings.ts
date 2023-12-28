/**
 * RE0009 パスワード変更
 */
export class PrPasswordSettings {
  public currentPassword: string;
  public newPassword: string;
  public newPasswordConfirm: string;

  constructor(currentPassword, newPassword, newPasswordConfirm) {
    this.currentPassword = currentPassword;
    this.newPassword = newPassword;
    this.newPasswordConfirm = newPasswordConfirm;
  }
}
