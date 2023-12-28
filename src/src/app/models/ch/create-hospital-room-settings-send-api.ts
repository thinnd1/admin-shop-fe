/**
 * GR0002
 * Created by thaobtb on 9/26/2017.
 */
export class CreateHospitalRoomSettingsSendApi {
  public roomName: string;
  public id: string;
  public imageFlg: boolean;
  public users: any[];

  constructor() {
    this.roomName = '';
    this.imageFlg = false;
    this.users = [];
  }
}
