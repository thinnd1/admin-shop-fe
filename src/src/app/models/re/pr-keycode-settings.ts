/**
 * RE0004 keyコードの登録
 */
export class PrKeycodeSettings {
  public keyCode: string;
  public mailAddress: string;
  constructor(mailAddress: string, keyCode: string) {
    this.mailAddress = mailAddress;
    this.keyCode = keyCode;
  }
}
