import {JsonConverter, JsonCustomConvert, JsonObject, JsonProperty} from 'json2typescript';
import {FirBase} from './fir.base';
import {DateConverter, KeysConverter, ValuesConverter} from '../../../common/converter/firebase.json.converter';
import {FirSeen} from './fir.seen';

/**
 * Seen Converter.
 */
@JsonConverter
class SeenConverter implements JsonCustomConvert<FirSeen> {
  // @Override
  serialize(data: FirSeen): any {
    return null;
  }
  // @Override
  deserialize(data: any): FirSeen {
    const seenUsers: string[] = [];
    const unseenUsers: string[] = [];
    Object.keys(data).forEach(userId => {
      data[userId] ? seenUsers.push(userId) : unseenUsers.push(userId);
    });
    return new FirSeen(seenUsers, unseenUsers);
  }
}

/**
 * 記事コメント情報.
 */
@JsonObject
export class FirComment extends FirBase {

  // Constants
  // --------------------------------------------------------------------------
  private static ContributorId = 'contributorId';
  private static Contents = 'contents';
  private static EditDate = 'editDate';
  private static CreatedAt = 'createdAt';
  private static ToUser = 'toUser';
  private static Seen = 'seen';
  private static Confirmed = 'confirmed';
  private static Attachments = 'attachments';

  // Variables
  // --------------------------------------------------------------------------
  /** 投稿者ユーザーID. */
  @JsonProperty(FirComment.ContributorId, String, true)
  contributorId: string = undefined;

  /** 投稿内応. */
  @JsonProperty(FirComment.Contents, String, true)
  contents: string = undefined;

  /** 編集日時. */
  @JsonProperty(FirComment.EditDate, DateConverter, true)
  editDate: Date = undefined;

  /** 作成日時. */
  @JsonProperty(FirComment.CreatedAt, DateConverter, true)
  createdAt: Date = undefined;

  /** 宛先. */
  @JsonProperty(FirComment.ToUser, KeysConverter, true)
  toUser: string[] = [];

  /** 既読・未読情報. */
  @JsonProperty(FirComment.Seen, SeenConverter, true)
  seen: FirSeen = new FirSeen([], []);

  /** 確認しました！. */
  @JsonProperty(FirComment.Confirmed, ValuesConverter, true)
  confirmed: string[] = [];

  /** 添付ファイル. */
  @JsonProperty(FirComment.Attachments, ValuesConverter, true)
  attachments: string[] = [];

  // Override
  // --------------------------------------------------------------------------
  updateData(key: string, val: any) {
    if (key === FirComment.Contents) {
      this.contents = val;

    } else if (key === FirComment.EditDate) {
      this.editDate = new DateConverter().deserialize(val);

    } else if (key === FirComment.ToUser) {
      this.toUser = new KeysConverter().deserialize(val);

    } else if (key === FirComment.Seen) {
      this.seen = new SeenConverter().deserialize(val);

    } else if (key === FirComment.Confirmed) {
      this.confirmed = new ValuesConverter().deserialize(val);

    } else if (key === FirComment.Attachments) {
      this.attachments = new ValuesConverter().deserialize(val);
    }
  }
}
