export class PinCustomerSettings {

  public customerUserId: string;
  public customerOfficeId: string;
  public pinned: boolean;

  constructor(customerUserId: string, customerOfficeId: string, pinned: boolean) {
    this.customerUserId = customerUserId;
    this.customerOfficeId = customerOfficeId;
    this.pinned = pinned;
  }
}
