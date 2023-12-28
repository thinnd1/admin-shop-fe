/**
 * RE0017 1部署所属登録
 */
export class DepartmentSettings {
  public displayName: string;
  public id: string;
  public name: string;
  public children: any[];

  constructor() {
    this.id = '';
    this.name = '';
    this.displayName = '';
    this.children = new Array;
  }
}
