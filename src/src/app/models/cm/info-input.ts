export class InfoInput {

  public keyword: string;
  public pageNo: number;
  public pageSize: number;

  constructor(pageNo?, pageSize?) {
    this.keyword = null;
    this.pageNo = pageNo || 0;
    this.pageSize = pageSize || null;
  }

}
