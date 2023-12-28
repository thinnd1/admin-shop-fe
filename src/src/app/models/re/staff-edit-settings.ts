/**
 * RE0016 スタッフ情報の詳細編集
 */
import {FuncAuthoritySet, ManagementAuthority} from "../ba/user-session";

export class StaffEditSettings {
  public userID: string;
  public officeId: string;
  public officeUserId: string;
  public displayOrder: number;
  public accountStatus: number;
  public birthDate: string;
  public department: any;
  public children: any;
  public displayName: string;
  public path: string;
  public id: string;
  public name: string;
  public firstName: string;
  public firstNameKana: string;
  public gender: string;
  public graduationDate: string;
  public imageUrl: string;
  public jobType: string;
  public lastName: string;
  public lastNameKana: string;
  public loginId: string;
  public mailAddress: string;
  public mobileNo: string;
  public mobileNoPublishingType: string;
  public mailAddressPublishingType: string;
  public otherAuthority: boolean[];
  public password: string;
  public phsNo: string;
  public profileImageUrl: string;
  public specializedDepartment: any;
  public fieldId: string;
  public typeid: string;
  public staffAuthority: boolean[];
  public funcAuthoritySet: FuncAuthoritySet;
  public funcAuthority: any;
  public managementAuthority: ManagementAuthority;
}
