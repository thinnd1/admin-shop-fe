export class PinStaff {
  public staffUserId: string;
  private staffOfficeId: string;
  private pinned: boolean;

  constructor(staffUserId: string, staffOfficeId: string, pinned: boolean) {
    this.staffUserId = staffUserId;
    this.staffOfficeId = staffOfficeId;
    this.pinned = pinned;
  }
}
