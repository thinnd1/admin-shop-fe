
export class Branch {
  address: string;
  department: string;
  industryType: string;
  mobileNo: string;
  name: string;
  phoneNo: string;
  prefectureCode: string;
}

export class HandleField {
  handleFieldCode: string;
  handleFieldId: string;
  handleFieldName: string;
}

export class HandleOffice {
  address: string;
  created: string;
  deleted: string;
  id: string;
  medicalOfficeNumber: string;
  name: string;
  nameKana: string;
  phoneNumber: string;
  postalCode: string;
  prefectureCode: string;
  updated: string;
}
export class DetailMrUser {
  branch: Branch;
  experiences: string;
  firstName: string;
  firstNameKana: string;
  gender: 0;
  graduatedPharmacy: true;
  handleDrugs: [''];
  handleFieldList: HandleField[];
  handleOffices: HandleOffice[];
  hobby: string;
  imageUrl: string;
  lastName: string;
  lastNameKana: string;
  mailAddress: string;
  mobileNo: string;
  officeId: string;
  officeName: string;
  officeType: string;
  placeBornIn: string;
  userId: string;
}
