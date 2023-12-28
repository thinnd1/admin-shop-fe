import {FirBase} from './fir.base';
import {JsonObject, JsonProperty} from 'json2typescript';

/**
 *
 */
@JsonObject
export class FirUser extends FirBase {

  // Constants
  // --------------------------------------------------------------------------
  private static KeyFirstName = 'firstName';
  private static KeyLastName = 'lastName';
  private static KeyFirstNameKana = 'firstNameKana';
  private static KeyLastNameKana = 'lastNameKana';
  private static KeyOfficeId = 'officeId';
  private static KeyOfficeName = 'officeName';
  private static KeyDeptId = 'deptId';
  private static KeyDeptName = 'deptName';
  private static KeyImageUrl = 'imageUrl';
  private static KeyAccountStatus = 'accountStatus';

  // Variables
  // --------------------------------------------------------------------------
  /** 氏名. */
  @JsonProperty(FirUser.KeyFirstName, String)
  firstName: string = undefined;

  @JsonProperty(FirUser.KeyLastName, String)
  lastName: string = undefined;

  /** 氏名かな. */
  @JsonProperty(FirUser.KeyFirstNameKana, String)
  firstNameKana: string = undefined;

  @JsonProperty(FirUser.KeyLastNameKana, String)
  lastNameKana: string = undefined;

  /** オフィスID. */
  @JsonProperty(FirUser.KeyOfficeId, String)
  officeId: string = undefined;

  /** オフィス名. */
  @JsonProperty(FirUser.KeyOfficeName, String)
  officeName: string = undefined;

  /** 所属ID. */
  @JsonProperty(FirUser.KeyDeptId, String, true)
  deptId: string = undefined;

  /** 所属名. */
  @JsonProperty(FirUser.KeyDeptName, String, true)
  deptName: string = undefined;

  @JsonProperty(FirUser.KeyImageUrl, String)
  imageUrl: string = undefined;

  @JsonProperty(FirUser.KeyAccountStatus, Number)
  accountStatus: number = undefined;

  // Methods
  // --------------------------------------------------------------------------
  // @Override
  updateData(key: string, val: any) {
    if (key === FirUser.KeyFirstName) {
      this.firstName = val;

    } else if (key === FirUser.KeyLastName) {
      this.lastName = val;
    } if (key === FirUser.KeyFirstNameKana) {
      this.firstNameKana = val;
    } else if (key === FirUser.KeyLastNameKana) {
      this.lastNameKana = val;
    } else if (key === FirUser.KeyOfficeName) {
      this.officeName = val;

    } else if (key === FirUser.KeyDeptId) {
      this.deptId = val;

    } else if (key === FirUser.KeyDeptName) {
      this.deptName = val;

    } else if (key === FirUser.KeyImageUrl) {
      this.imageUrl = val;
    } else if (key === FirUser.KeyAccountStatus) {
      this.accountStatus = val;
    }
  }
}
