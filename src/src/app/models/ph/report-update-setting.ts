export class ReportUpdateSetting {
  public medicalOfficeId: string;
  public medicalOfficeName: string;
  public drugStoreOfficeName: string;
  public pharmacistName: string;
  public officeUserId: string;
  public patientName: string;
  public patientCode: string;
  public phoneNumber: string;
  public prescriptionIssuedDate: string;
  public doctorName: string;
  public beforeChangeDrugName: any;
  public afterChangeDrugName: any;
  public departmentName: string;
  public fileIds: any;
  public prescriptionUpdateDetails: any;
  public protocolUsage: any;
  public prescriptionUpdateReason: any;
  public updateDetails: any;
  public content: any;
  public updated: any;
  public created: any;
  public firstName: string;
  public lastName: string;
  public firstNameKana: string;
  public lastNameKana: string;
  public imageURL: any;
  public firebaseStorageTopicPath: string;
  public accountStatuses: number;
  constructor() {
    this.prescriptionUpdateReason = -1;
    this.protocolUsage = -1;
    this.firebaseStorageTopicPath = '';
  }
}
