export class CreateEventMeeting {
  public date: any[];
  public purposeId: string;
  public purposeName: string;
  public note: string;
  public place: string;
  public drugList: any[];
  public productName: string;
  public request: string;
  public numberVisitors: string;
  public userIdReceive: string;
  public officeIdReceive: string;
  public userIdSent: string;
  public officeIdSent: string;
  public userIdMediator: string;
  public officeIdMediator: string;

  constructor(request) {
    this.date = new Array();
    this.purposeId = '';
    this.purposeName = '';
    this.note = '';
    this.place = '';
    this.drugList = new Array();
    this.productName = '';
    this.request = request;
    this.numberVisitors = '0';
    this.userIdSent = '';
    this.officeIdSent = '';
    this.userIdReceive = '';
    this.officeIdReceive = '';
    this.userIdMediator = '';
    this.officeIdMediator = '';
  }
}
