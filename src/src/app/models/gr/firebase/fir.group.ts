import {JsonConverter, JsonCustomConvert, JsonObject, JsonProperty} from 'json2typescript';
import {FirBase} from './fir.base';
import {KeysConverter} from '../../../common/converter/firebase.json.converter';

/**
 * Group type converter.
 */
@JsonConverter
class GroupTypeConverter implements JsonCustomConvert<GroupType> {
  // @Override
  serialize(data: GroupType): any {
    return data;
  }
  // @Override
  deserialize(data: any): GroupType {
    return data as GroupType;
  }
}

/**
 * Group type converter.
 */
@JsonConverter
class MemberConverter implements JsonCustomConvert<FirGroup.Member[]> {
  // @Override
  serialize(data: FirGroup.Member[]): any {
    return null;
  }
  // @Override
  deserialize(data: any): FirGroup.Member[] {
    const members: FirGroup.Member[] = [];
    Object.keys(data).forEach(officeUserId => {
      const bit = data[officeUserId];

      members.push({
        officeUserId: officeUserId,
        admin: 0 < (bit & 0x02),
        approved: 0 < (bit & 0x08),
      });
    });
    return members;
  }
}

/**
 * Group.
 *
 * @author k.sumi 2017/09/27
 */
@JsonObject
export class FirGroup extends FirBase {

  // Constants
  // --------------------------------------------------------------------------
  private static KeyName = 'name';
  private static KeyNameKana = 'nameKana';
  private static KeyType = 'type';
  private static KeyIsDeptGroup = 'deptGroupFlag';
  private static KeyUpdatedAt = 'updatedAt';
  private static KeyMember = 'approvedMembers';
  private static KeyArticles = 'articles';

  // Variables
  // --------------------------------------------------------------------------
  /** グループ名. */
  @JsonProperty(FirGroup.KeyName, String)
  name: string = undefined;

  /** グループ名かな. */
  @JsonProperty(FirGroup.KeyNameKana, String, true)
  nameKana?: string = undefined;

  /** グループタイプ. */
  @JsonProperty(FirGroup.KeyType, GroupTypeConverter)
  type: GroupType = undefined;

  /** 所属グループかどうかのフラグ. */
  @JsonProperty(FirGroup.KeyIsDeptGroup, Boolean)
  deptGroupFlag: boolean = undefined;

  /** 最終更新日時 */
  @JsonProperty(FirGroup.KeyUpdatedAt, Number)
  updatedAt: number = undefined;

  /** グループメンバー情報. */
  @JsonProperty(FirGroup.KeyMember, MemberConverter)
  approvedMembers: FirGroup.Member[] = [];

  /** 記事情報 */
  @JsonProperty(FirGroup.KeyArticles, KeysConverter, true)
  articles: string[] = [];

  // @Override
  updateData(key: string, val: any) {
    if (key === FirGroup.KeyName) {
      this.name = val;

    } else if (key === FirGroup.KeyNameKana) {
      this.nameKana = val;

    } else if (key === FirGroup.KeyType) {
      this.type = new GroupTypeConverter().deserialize(val);

    } else if (key === FirGroup.KeyIsDeptGroup) {
      this.deptGroupFlag = val;

    } else if (key === FirGroup.KeyUpdatedAt) {
      this.updatedAt = val;

    } else if (key === FirGroup.KeyMember) {
      this.approvedMembers = new MemberConverter().deserialize(val);
    }
  }
}

export namespace FirGroup {
  /**
   * Group member.
   */
  export interface Member {
    officeUserId: string;
    admin: boolean;
    approved: boolean;
  }
}

/**
 * Group type.
 */
export enum GroupType {
  /** オフィシャル(デフォルト) */
  Official = 0,
  /** 院内 */
  Inside = 1,
  /** 院外 */
  Outside = 2
}

/**
 * Group member.
 */
@JsonObject
export class FirGroupMember extends FirBase {

  // Constants
  // --------------------------------------------------------------------------
  private static KeyAuthority = 'authority';
  private static KeyOfficeId = 'officeId';
  private static KeyIsInvite = 'inviteFlag';
  private static KeyIsNotificationMail = 'notificationMailFlag';
  private static KeyIsNotificationSound = 'notificationSoundFlag';
  private static KeyIsOnlyToUser = 'onlyToUserFlag';
  private static KeyIsSoundType = 'soundType';

  // Variables
  // --------------------------------------------------------------------------
  /** 権限 */
  @JsonProperty(FirGroupMember.KeyAuthority, Number)
  authority: FirGroupMember.Authority = undefined;

  /** 招待中フラグ */
  @JsonProperty(FirGroupMember.KeyIsInvite, Boolean)
  inviteFlag: boolean = undefined;

  /** 通知音設定フラグ. */
  @JsonProperty(FirGroupMember.KeyIsNotificationSound, Boolean)
  notificationSoundFlag: boolean = undefined;

  @JsonProperty(FirGroupMember.KeyOfficeId, String)
  officeId: string = undefined;

  @JsonProperty(FirGroupMember.KeyIsNotificationMail, Boolean)
  notificationMailFlag: boolean = undefined;

  @JsonProperty(FirGroupMember.KeyIsOnlyToUser, Boolean)
  onlyToUserFlag = false;

  @JsonProperty(FirGroupMember.KeyIsSoundType, Number)
  soundType: number = undefined;

  userInfo: any;

  // Methods
  // --------------------------------------------------------------------------
  // @Override
  updateData(key: string, val: any) {
    if (key === FirGroupMember.KeyAuthority) {
      this.authority = val;
    }
  }

  /** 管理者かどうかを返却する. */
  isAdmin(): boolean {
    return this.authority === FirGroupMember.Authority.Admin;
  }

  /** 承認済みかどうかを返却する. */
  isApproved(): boolean {
    return !this.inviteFlag;
  }
}

export namespace FirGroupMember {
  export enum Authority {
    Member = 1,
    Admin = 2
  }
}
