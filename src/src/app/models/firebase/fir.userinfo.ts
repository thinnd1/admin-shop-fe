import {AccountStatus, FuncAuthority, FuncAuthoritySet, IdentifyStatus, ManagementAuthority} from '../ba/user-session';

/**
 * Firebase上のユーザー情報.
 */
export class FirUserInfo {

  // Variables
  // --------------------------------------------------------------------------
  // オフィスユーザーID
  readonly id: string;

  // オフィスID
  readonly officeId: string;

  // オフィス名
  readonly officeName: string;

  // 所属ID
  readonly deptId: string;

  // 所属名
  readonly deptName: string;

  // 名
  readonly firstName: string;

  // 氏
  readonly lastName: string;

  // 名かな
  readonly firstNameKana: string;

  // アカウントステータス
  readonly accountStatus: AccountStatus;

  // 管理権限
  readonly managementAuthority: ManagementAuthority;

  // 機能権限セット
  readonly funcAuthority: FuncAuthoritySet;

  // 機能権限
  readonly authorities: FuncAuthority;

  readonly identifyStatus: string;

  // Constructor
  // --------------------------------------------------------------------------
  constructor(officeUserId: string, data: any) {

    this.id = officeUserId;
    this.officeId = data.officeId;
    this.officeName = data.officeName;
    this.deptId = data.deptId;
    this.deptName = data.deptName;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.firstNameKana = data.firstNameKana;
    this.accountStatus = new AccountStatus(data.accountStatus);
    this.managementAuthority = data.role;
    this.funcAuthority = data.funcAuthority;
    this.identifyStatus = data.identifyStatus;

    const authorized = [];
    if (data.authorities) {
      for (let i = 0; i < data.authorities.length; i++) {
        if (data.authorities[i] === true) authorized.push(i);
      }
    }
    this.authorities = new FuncAuthority(authorized);
  }

  // Helper
  // --------------------------------------------------------------------------
  /**
   * アカウントステータスは有効かチェックする.
   */
  public checkAccountStatus(): boolean {
    return this.accountStatus.isValid;
  }

  public checkLocking(): boolean {
    return this.accountStatus.isLocking;
  }

  public checkIdentify(): boolean {
    return this.identifyStatus === 'REJECTED';
  }
}
