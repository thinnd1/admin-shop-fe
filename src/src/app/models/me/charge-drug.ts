export class ChargeDrug {
  public mrUserI: string;
  public mrOfficeId: string;
  public drOfficeId: string;
  public drugs: any[];

  constructor(mrUserI: string, mrOfficeId: string, drOfficeId: string, drugs: any[]) {
    this.mrUserI = mrUserI;
    this.mrOfficeId = mrOfficeId;
    this.drOfficeId = drOfficeId;
    this.drugs = drugs;
  }
}
