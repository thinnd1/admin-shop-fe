export class TracingSearchForm {
  text: string;
  start: string;
  end: string;
  officeId: string;
  hasComment: number;
  isRead: number;
  page: number;
  pageSize: number;

  constructor() {
    this.start = '';
    this.end = '';
    this.officeId = '';
    this.hasComment = 0;
    this.isRead = 0;
    this.page = 0;
    this.pageSize = 20;
  }

}

