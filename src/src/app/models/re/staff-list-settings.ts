import { FuncAuthority } from "../ba/user-session";

/**
 * RE0018 スタッフ一覧
 */
export class StaffListSettings {
  public page: number;
  public user: any;
}



export type Child = Object;

export class Department {
  children: Child[];
  public displayName: string;
  public id: string;
  public name: string;
  public path: string;
}

export class SpecializedDepartment {
  public fieldId: string;
  public typeId: string;
}

export class DetailUser {
  public additionalMailAddress: string;
  public birthDate: string;
  public briefHistory: string;
  public department: Department;
  public firstName: string;
  public firstNameKana: string;
  public funcAuthority: FuncAuthority;
  public funcAuthoritySet: string;
  public gender: string;
  public graduationDate: string;
  public hobby: string;
  public imageUrl: string;
  public jobType: string;
  public lastName: string;
  public lastNameKana: string;
  public loginId: string;
  public mailAddress: string;
  public mailAddressPublishingType: string;
  public managementAuthority: string;
  public mobileNo: string;
  public mobileNoPublishingType: string;
  public password: string;
  public phsNo: string;
  public placeBornIn: string;
  public position: string;
  public qualification: string;
  public specializedDepartment: SpecializedDepartment[];
  public officeName: string;
  public experiences: string;
}
