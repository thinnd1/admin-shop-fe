export class DrugQueryForm {
  public officeId: string;
  public productName: string;
  public nameInitial: string;
  public companyName: string;
  public isAdoptedOnly: any;
  public page: number;
  public pageSize: string;
  public alphabetIndex: string;

  constructor() {
    this.isAdoptedOnly = false;
    this.alphabetIndex = '';
  }
}

