/**
 * GR0002
 * Created by thaobtb on 9/28/2017.
 */
export class CreateDepartmentGroupSettingsSendApi {
  public groupName: string;
  public imageFlg: boolean;
  public deptId: string;
  public users: any[];

  constructor() {
    this.groupName = '';
    this.imageFlg = true;
    this.deptId = '';
    this.users = [];
  }
}
