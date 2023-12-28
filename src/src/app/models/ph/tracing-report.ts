export class TracingReport {
  compoundingDate: string;
  content: string;
  departmentName: string;
  doctorName: string;
  hasFile: boolean;
  medicalOfficeId: string;
  patientCode: string;
  patientConsent: any;
  patientDateOfBirth: string;
  patientGender: string;
  patientName: string;
  pharmacistName: string;
  phoneNumber: string;
  prescriptionIssuedDate: string;
  firebaseStorageTopicPath: string;
  fileIds: any;


  constructor() {
    this.patientConsent = '';
    this.patientGender = 'MALE';

  }

}

