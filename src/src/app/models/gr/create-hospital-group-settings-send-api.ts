/**
 * GR0002
 * Created by thaobtb on 9/26/2017.
 */
export class CreateHospitalGroupSettingsSendApi {
  public groupName: string;
  public id: string;
  public imageFlg: boolean;
  public users: any[];

  constructor() {
    this.groupName = '';
    this.imageFlg = false;
    this.users = [];
  }
}
