export class KpiInput {

  public data: any[];
  public id: string;
  public isVisible: boolean;
  public labels: string[];
  public labels2: string[];
  public name: string;
  public threshold: number;
  public type: type;

  constructor() {
    this.data = [];
    this.id = null;
    this.isVisible = true;
    this.labels = [];
    this.labels2 = [];
    this.name = null;
    this.threshold = null;
    this.type = null;
  }
}

export enum type {
  BED_USE_RATE = 'BED_USE_RATE',
  HOSPITAL_STAY = 'HOSPITAL_STAY',
  RELIEF_CLASSIFICATION = 'RELIEF_CLASSIFICATION',
  NURSING_NEED = 'NURSING_NEED',
  OUTPATIENT_NUMBER = 'OUTPATIENT_NUMBER',
  OTHER = 'OTHER'
}
