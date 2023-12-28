export class DoctorInfoSearch {
  public keyword: string;
  public flagDoctor: boolean;
  public flagPharmacy: boolean;
  public flagOther: boolean;
  public officeIds: any;
  public fieldIds: any;
  public page: number;
  public pageSize: number;

  constructor(keyword: string, flagDoctor: boolean, flagPharmacy: boolean, flagOther: boolean, officeIds: any, fieldIds: any,
              page: number, pageSize: number) {
    this.keyword = keyword;
    this.flagDoctor = flagDoctor;
    this.flagPharmacy = flagPharmacy;
    this.flagOther = flagOther;
    this.officeIds = officeIds;
    this.fieldIds = fieldIds;
    this.page = page;
    this.pageSize = pageSize;
  }
}
