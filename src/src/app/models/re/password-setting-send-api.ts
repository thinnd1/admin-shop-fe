/**
 * RE0019 パスワード変更
 */
export class PasswordSettingsSendApi {
  public currentPassword: string;
  public newPassword: string;

  constructor(currentPassword, newPassword) {
    this.currentPassword = currentPassword;
    this.newPassword = newPassword;
  }
}
