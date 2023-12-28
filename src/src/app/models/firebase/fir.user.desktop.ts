import {JsonConverter, JsonCustomConvert, JsonObject, JsonProperty} from 'json2typescript';
import {FirBase} from '../gr/firebase/fir.base';

/**
 * 日本語メッセージコンバーター.
 */
@JsonConverter
export class FirDesktopMessagesJPConverter implements JsonCustomConvert<FirDesktopMessage> {
  // @Override
  serialize(data: FirDesktopMessage): any {
    // unsupported
    return null;
  }
  // @Override
  deserialize(data: any): FirDesktopMessage {
    const model = new FirDesktopMessage();
    model.title = data['titleJP'];
    model.message = data['messageJP'];
    return model;
  }
}

/**
 * 英語メッセージコンバーター.
 */
@JsonConverter
export class FirDesktopMessagesUSConverter implements JsonCustomConvert<FirDesktopMessage> {
  // @Override
  serialize(data: FirDesktopMessage): any {
    // unsupported
    return null;
  }
  // @Override
  deserialize(data: any): FirDesktopMessage {
    const model = new FirDesktopMessage();
    model.title = data['titleUS'];
    model.message = data['messageUS'];
    return model;
  }
}

@JsonObject
export class FirUserDesktop extends FirBase {

  // Constants
  // --------------------------------------------------------------------------
  private static ContributorOfficeId = 'contributorOfficeId';
  private static ContributorOfficeUserId = 'contributorOfficeUserId';
  private static Message = 'message';
  private static SoucdFlag = 'soundFlag';

  // Variables
  // --------------------------------------------------------------------------
  /** 投稿者オフィスID. */
  @JsonProperty(FirUserDesktop.ContributorOfficeId, String, true)
  contributorOfficeId: string = undefined;

  /** 投稿者ユーザーID. */
  @JsonProperty(FirUserDesktop.ContributorOfficeUserId, String, true)
  contributorOfficeUserId: string = undefined;

  /** 日本語メッセージ. */
  @JsonProperty(FirUserDesktop.Message, FirDesktopMessagesJPConverter, true)
  messageJP: FirDesktopMessage = new FirDesktopMessage();

  /** 英語メッセージ. */
  @JsonProperty(FirUserDesktop.Message, FirDesktopMessagesUSConverter, true)
  messageUS: FirDesktopMessage = new FirDesktopMessage();

  /** 通知音設定 */
  @JsonProperty(FirUserDesktop.SoucdFlag, Boolean, true)
  soundFlag: boolean;

  // Methods
  // --------------------------------------------------------------------------
  // @Override
  updateData(key: string, val: any) {
  }
}

export class FirDesktopMessage {
  /** タイトル. */
  title: string = undefined;
  /** メッセージ. */
  message: string = undefined;
}
