export class OfficeInfo {
  public id: string;
  public title: string;
  public body: string;
  public signature: string;
  public toIndustryIds: string[];
  public toOfficeIds: string[];
  public attachmentFileIds: string[];
  public isToAll: boolean;

  constructor() {
    this.id = null;
    this.title = null;
    this.body = null;
    this.signature = null;
    this.toIndustryIds = [];
    this.toOfficeIds = [];
    this.attachmentFileIds = [];
    this.isToAll = false;
  }
}
