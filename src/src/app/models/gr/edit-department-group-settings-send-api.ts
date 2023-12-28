export class EditDepartmentGroupSettingsSendApi {
  public id: string;
  public groupName: string;
  public imageFlg: boolean;
  public users: any[];

  constructor() {
    this.groupName = '';
    this.id = '';
    this.imageFlg = false;
    this.users = [];
  }
}
