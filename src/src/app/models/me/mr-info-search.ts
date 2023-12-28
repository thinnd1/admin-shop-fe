export class MrInfoSearch {
  public keyword: string;
  public checkedMale: boolean;
  public checkedFeMale: boolean;
  public selectedIndustry: any;
  public selectedOffice: any;
  public selectedField: any;
  public next: string;
  public prev: string;
  public size: string;

  constructor(keyword: string, checkedMale: boolean, checkedFeMale: boolean, selectedIndustry: any, selectedOffice: any,
              selectedField: any, next: string, prev: string, size: string) {
    this.keyword = keyword;
    this.checkedMale = checkedMale;
    this.checkedFeMale = checkedFeMale;
    this.selectedIndustry = selectedIndustry;
    this.selectedOffice = selectedOffice;
    this.selectedField = selectedField;
    this.next = next;
    this.prev = prev;
    this.size = size;
  }
}
