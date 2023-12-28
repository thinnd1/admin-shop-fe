/**
 * PH0001
 * Created by hungnq on 4/12/2018.
 */
export class CreatePharmacyGroupSettingsSendApi {
  public doctors: any[];
  public drugStoreUsers: any[];

  constructor(doctors: any[], drugStoreUsers: any[]) {
    this.doctors = [];
    this.drugStoreUsers = [];
    let that = this;
    doctors.forEach(function (dr) {
      that.doctors.push({
        officeId: dr.officeId,
        officeUserId: dr.officeUserId
      });
    });

    drugStoreUsers.forEach(function (ph) {
      that.drugStoreUsers.push({
        officeId: ph.officeId,
        officeUserId: ph.officeUserId
      });
    });
  }
}
