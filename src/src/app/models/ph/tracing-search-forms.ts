export class TracingSearchForms {
  dateFrom: string;
  dateTo: string;
  officeId: string;
  prescriptionUpdateReason: string;
  pageNumber: number;
  pageLimit: number;
  text: string;

  constructor() {
    this.dateFrom = '';
    this.dateTo = '';
    this.officeId = '';
    this.prescriptionUpdateReason = '';
    this.pageNumber = 0;
    this.pageLimit = 20;
  }
}
