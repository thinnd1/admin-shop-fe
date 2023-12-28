export class OriginalRequest {
  public requestType: string;
  public fixedStart: string;
  public fixedEnd: string;
  public status: string;
  public place: string;
  public purposeId: string;
  public purposeName: string;
  public productName: string;
  public visitorNumber: number;
  public dr: any;
  public mr: any;
  public mediator: string;
  public mediatorOfficeId: string;
  public senderType: string;
  public comments: any[];
  public candidacyTime: any[];
  public drugList: any[];
  public requestId: string;

  constructor() {
    this.requestType = '';
    this.fixedStart = '';
    this.fixedEnd = '';
    this.status = '';
    this.place = '';
    this.purposeId = '';
    this.purposeName = '';
    this.productName = '';
    this.visitorNumber = 0;
    this.dr = {};
    this.mr = {};
    this.mediator = '';
    this.mediatorOfficeId = '';
    this.senderType = '';
    this.comments = [];
    this.candidacyTime = [];
    this.drugList = [];
    this.requestId = '';
  }
}
