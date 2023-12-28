
/**
 * Created by hungnq on 4/10/2018
 */
export class User {
  public officeUserId: string;

  public officeId: string;
  public officeName: string;

  public firstName: string;
  public lastName: string;

  public firstNameKana: string;
  public lastNameKana: string;

  public jobType: string;
  public imageUrl: string;

  public accountStatus: number;
  public authority: number;

  public drugStoreOfficeId: string;
  public accepted: boolean;

  public isShow: boolean = true;
  public isSelected: boolean = false;
  
  public fullName: string;
  public fullNameKana: string;
}
