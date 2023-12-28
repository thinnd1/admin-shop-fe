// **
// * RE0034 初回登録
// */

export class Document {
  public firstImage: string;
  public lastImage: string;
  public date: string;
}

export class IndividualVerificationRequestSettings {
  public firstName: string;
  public firstNameKana: string;
  public lastName: string;
  public lastNameKana: string;
  public gender: any;
  public birthDate: string;
  public dayBirth: string;
  public monthBirth: string;
  public yearBirth: string;
  public jobType: string;
  public loginId: string;
  public newLoginId: string;
  public password: string;
  public passwordConfirm: string;
  public specializedDepartmentField: any;
  public specializedDepartmentType: any;
  public specializedDepartment: any;
  public document1: Document;
  public document2: Document;
  public verificationFlag: boolean;
  public verificationStatus: string;
  public personalObject: any;
  public firstImage1: string;
  public lastImage1: string;
  public firstImage2: string;
  public lastImage2: string;
  public dataUploader: any;
}




