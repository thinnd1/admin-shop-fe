import {Response} from '@angular/http';
import {Product} from '../../common/profile';
import {Authentication} from '../../services/authentication.service';

/**
 * UserSession情報.
 *
 * @author k.sumi 2017/10/07
 */
export class UserSession {

  // Variables
  // --------------------------------------------------------------------------
  readonly product: Product;
  readonly userId: string;
  readonly officeUserId: string;
  readonly officeId: string;
  readonly officeName: string;
  readonly deptId: string;
  readonly deptName: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly firstNameKana: string;
  readonly lastNameKana: string;
  readonly email: string;
  readonly password: string;
  readonly accountStatus: AccountStatus;
  readonly managementAuthority: ManagementAuthority;
  readonly funcAuthoritySet: FuncAuthoritySet;
  readonly funcAuthority: FuncAuthority;
  readonly managementLevel: ManagementLevel;
  readonly personalFlag: boolean;
  readonly verificationFlag: boolean;
  readonly verificationStatus: VerificationStatus;
  readonly identifyStatus: boolean;
  readonly officeType: OfficeType;

  // Constructor
  // --------------------------------------------------------------------------
  constructor(private res: Response, authentication: Authentication) {
    const json = res.json();

    this.product = authentication.product;
    this.userId = json.userId;
    this.officeUserId = json.officeUserId;
    this.officeId = json.officeId;
    this.officeName = json.officeName;
    this.deptId = json.deptId;
    this.deptName = json.deptName;
    this.firstName = json.firstName;
    this.lastName = json.lastName;
    this.firstNameKana = json.firstNameKana;
    this.lastNameKana = json.lastNameKana;
    this.email = json.mailAddress;
    this.accountStatus = new AccountStatus(json.accountStatus);
    this.managementAuthority = json.managementAuthority;
    this.funcAuthoritySet = json.funcAuthoritySet;
    this.funcAuthority = new FuncAuthority(json.funcAuthority);
    this.managementLevel = json.managementLevel;
    this.personalFlag = json.personalFlag;
    this.verificationFlag = json.verificationFlag;
    this.verificationStatus = json.verificationStatus;
    this.identifyStatus = json.identifyStatus;
    this.officeType = new OfficeType(json.officeType);
  }
}

/**
 * アカウントステータス.
 */
export class AccountStatus {
  // Variables
  // -----------------------
  /** 仮登録. */
  readonly isProvisional: boolean;
  /** 有効. */
  readonly isValid: boolean;
  /** ロック中. */
  readonly isLocking: boolean;
  /** 無効. */
  readonly isInvalid: boolean;

  // Constructor
  // -----------------------
  constructor(bit: number) {
    this.isProvisional = 0 < (bit & 0x01);
    this.isValid = 0 < (bit & 0x02);
    this.isLocking = 0 < (bit & 0x04);
    this.isInvalid = 0 < (bit & 0x08);
  }
}

/**
 * 管理権限.
 */
export enum ManagementAuthority {
  /** 全体管理者 */
  MP_1 = 'MP_1',
  /** 所属管理者 */
  MP_2 = 'MP_2',
  /** なし */
  MP_3 = 'MP_3'
}

/**
 * 機能権限セット.
 */
export enum FuncAuthoritySet {
  /** カスタム */
  FPS_0 = 'FPS_0',
  /** 面会管理者 */
  FPS_1 = 'FPS_1',
  /** 仲介者 */
  FPS_2 = 'FPS_2',
  /** 面会スタッフ */
  FPS_3 = 'FPS_3',
  /** なし */
  FPS_4 = 'FPS_4'
}

/**
 * 機能権限.
 */
export class FuncAuthority {
  /** 面会権限 */
  readonly FP_1: boolean;
  /** 面会ルール管理権限 */
  readonly FP_2: boolean;
  /** 面会状況管理権限 */
  readonly FP_3: boolean;
  /** 説明会状況管理権限 */
  readonly FP_4: boolean;
  /** 取引先一覧ダウンロード権限 */
  readonly FP_5: boolean;
  /** 取引先への一斉配信権限 */
  readonly FP_6: boolean;
  /** 仲介権限面会/説明会権限 */
  readonly FP_7: boolean;
  /*Admin Pharmacy */
  readonly FP_8: boolean;
  /*User Pharmacy */
  readonly FP_9: boolean;
  // Constructor
  // -----------------------
  constructor(authorities: number[]) {
    if (!authorities || authorities.length === 0) {
      return;
    }
    this.FP_1 = this.isAuthority(authorities, 1);
    this.FP_2 = this.isAuthority(authorities, 2);
    this.FP_3 = this.isAuthority(authorities, 3);
    this.FP_4 = this.isAuthority(authorities, 4);
    this.FP_5 = this.isAuthority(authorities, 5);
    this.FP_6 = this.isAuthority(authorities, 6);
    this.FP_7 = this.isAuthority(authorities, 7);
    this.FP_8 = this.isAuthority(authorities, 8);
    this.FP_9 = this.isAuthority(authorities, 9);
  }

  // Methods
  // -----------------------
  private isAuthority(authorities: number[], value: number): boolean {
    const authority = authorities.find(v => {
      return v === value;
    });
    return 0 < authority;
  }
}

/**
 * 管理範囲.
 */
export enum ManagementLevel {
  /** 院内全て. */
  All = 0,
  /** 所属および配下. */
  Limited = 1
}

export enum VerificationStatus {

  ST_0 = 'ST0',

  ST_1 = 'ST1',

  ST_2 = 'ST2',

  ST_3 = 'ST3',

  ST_4 = 'ST4'

}

export class OfficeType {

  readonly DRUG_STORE: boolean;
  readonly MEDICAL: boolean;

  static getOfficeType(string, type) {
    return string === type;
  }

  // Constructor
  // -----------------------
  constructor(officeType) {
    this.DRUG_STORE = OfficeType.getOfficeType(officeType, 'DRUG_STORE');
    this.MEDICAL = OfficeType.getOfficeType(officeType, 'MEDICAL');
  }
}

export class IdentifyStatus {

  IDENTIFIED = 'IDENTIFIED';

  UNCONFIRMED = 'UNCONFIRMED';

  REJECTED = 'REJECTED';
}
