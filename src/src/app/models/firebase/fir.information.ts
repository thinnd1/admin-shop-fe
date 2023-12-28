import {FirBase} from '../gr/firebase/fir.base';
import {JsonObject, JsonProperty} from 'json2typescript';
import {DateConverter} from '../../common/converter/firebase.json.converter';

@JsonObject
export class FirInformationContributor {

  // Variables
  // --------------------------------------------------------------------------
  /** オフィスユーザーID. */
  @JsonProperty('officeUserId', String, true)
  officeUserId: string = undefined;

  /** ユーザーID. */
  @JsonProperty('userId', String, true)
  userId: string = undefined;

  /** ユーザー名. */
  @JsonProperty('name', String, true)
  name: string = undefined;

  /** オフィスID. */
  @JsonProperty('officeId', String, true)
  officeId: string = undefined;

  /** オフィス名. */
  @JsonProperty('officeName', String, true)
  officeName: string = undefined;

  /** 部署ID. */
  @JsonProperty('deptId', String, true)
  deptId: string = undefined;

  /** 部署名. */
  @JsonProperty('deptName', String, true)
  deptName: string = undefined;
}

@JsonObject
export class FirInformationMessage {

  // Variables
  // --------------------------------------------------------------------------
  /** デフォルトメッセージ. */
  @JsonProperty('default', String, true)
  def: string = undefined;

  /** 日本語メセージ. */
  @JsonProperty('jp', String, true)
  jp: string = undefined;
}

@JsonObject
export class FirInformationGroupInfo {

  // Variables
  // --------------------------------------------------------------------------
  /** グループID. */
  @JsonProperty('groupId', String, true)
  groupId: string = undefined;

  /** 記事ID. */
  @JsonProperty('articleId', String, true)
  articleId: string = undefined;

  /** 記事コメントID. */
  @JsonProperty('commentId', String, true)
  commentId: string = undefined;
}

@JsonObject
export class FirInformation extends FirBase {

  // Variables
  // --------------------------------------------------------------------------
  /** 投稿者. */
  @JsonProperty('contributor', FirInformationContributor, true)
  contributor: FirInformationContributor = undefined;

  /** タイトル. */
  @JsonProperty('title', FirInformationMessage, true)
  title: FirInformationMessage = undefined;

  /** Webタイトル. */
  @JsonProperty('titleWeb', FirInformationMessage, true)
  titleWeb: FirInformationMessage = undefined;

  /** 本文. */
  @JsonProperty('body', FirInformationMessage, true)
  body: FirInformationMessage = undefined;

  /** 添付ファイル画像パス. */
  @JsonProperty('imageFilePath', String, true)
  imageFilePath: string = undefined;

  /** 送信日時. */
  @JsonProperty('sentAt', DateConverter, true)
  sentAt: Date = undefined;

  /** 通知ID. */
  @JsonProperty('notificationId', String, true)
  notificationId: string = undefined;

  /** グループ情報. */
  @JsonProperty('groupInfo', FirInformationGroupInfo, true)
  groupInfo: FirInformationGroupInfo = undefined;

  /** 既読・未読. */
  read = false;

  // Methods
  // --------------------------------------------------------------------------
  // @Override
  updateData(key: string, val: any) {
    // ignore
  }
}
