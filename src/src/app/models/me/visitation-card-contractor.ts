/**
 * RE0058 初回登録
 */

export class VisitationCardContractor {
  public paymentName: string;
  public zipCode: string;
  public address: string;
  public address2: string;
  public name: string;

  constructor(paymentName: string, zipCode: string, address: string, address2: string, name: string) {
      this.paymentName = paymentName;
      this.zipCode = zipCode;
      this.address = address;
      this.address2 = address2;
  };
}
