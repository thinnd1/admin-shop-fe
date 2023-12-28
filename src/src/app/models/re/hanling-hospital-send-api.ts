export class HanlingHospitalSendApi {
  public entryToken: string;
  public keyCode: string;
  public medicalOfficeId: string;
  public medicalOfficeName: string;
  constructor(entryToken: string, keyCode: string, medicalOfficeId: string, medicalOfficeName: string) {
    this.entryToken = entryToken;
    this.keyCode = keyCode;
    this.medicalOfficeId = medicalOfficeId;
    this.medicalOfficeName = medicalOfficeName;
  }
}
