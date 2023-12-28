/**
 * RE0036
 */
export class PrPublicSettingPersonal {
  public officeUserId: string;
  public visibleToAllHospital: boolean;

  constructor() {
    this.visibleToAllHospital = true;
    this.officeUserId = '';
  }
}
