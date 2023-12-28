import {JsonConverter, JsonCustomConvert, JsonObject, JsonProperty} from 'json2typescript';
import {FirBase} from './fir.base';
import {
  DateConverter, KeysConverter, ValuesConverter
} from '../../../common/converter/firebase.json.converter';
import {FirSeen} from './fir.seen';
import {FirUser} from './fir.user';
import {FirGroup} from './fir.group';
import {FirComment} from "./fir.comment";

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
 * Object Array Converter.
 */
@JsonConverter
export class ChoicesConverter implements JsonCustomConvert<string[]> {
  // @Override
  serialize(data: string[]): any {
    // unsupported
    return null;
  }
  // @Override
  deserialize(data: any): any[] {
    const fields: any[] = [];
    Object.keys(data).forEach(k => {
      data[k]['answered'] = data[k]['answered'] ? Object.keys(data[k]['answered']) : [];
      data[k]['id'] = k;
      fields.push(data[k]);
    });
    return fields;
  }
}

/**
 * 選択肢情報.
 */
@JsonObject
export class FirChoice extends FirBase {

  /** 選択肢内容. */
  @JsonProperty('contents', String)
  contents: string = undefined;

  /** 回答情報. */
  @JsonProperty('answered', KeysConverter, true)
  answered: string[] = [];

  // @Override
  updateData(key: string, val: any) {
   if (key === 'answered') {
      this.answered = new KeysConverter().deserialize(val);
    }
  }
}

/**
 * アンケート情報.
 */
@JsonObject
export class FirSurveys extends FirBase {

  /** 単一選択かどうかのフラグ. */
  @JsonProperty('singleChoiceFlag', Boolean)
  singleChoiceFlag: boolean = undefined;

  /** 締切日時. */
  @JsonProperty('closeDate', DateConverter, true)
  closeDate: Date = undefined;

  /** 選択肢情報. */
  @JsonProperty('choices', ChoicesConverter, true)
  choices: FirChoice[] = [];

  /** アンケート未回答情報. */
  unanswered: string[] = [];

  // @Override
  updateData(key: string, val: any) {
    if (key === 'closeDate') {
      this.closeDate = new DateConverter().deserialize(val);
    } else if (key === 'choices') {
      this.choices = new ChoicesConverter().deserialize(val);
    }
  }
}

/**
 * 記事情報.
 */
@JsonObject
export class FirArticle extends FirBase {

  // Constants
  // --------------------------------------------------------------------------
  private static ContributorId = 'contributorId';
  private static Contents = 'contents';
  private static IsSurveys = 'surveysFlag';
  private static EditDate = 'editDate';
  private static CreatedAt = 'createdAt';
  private static ToUser = 'toUser';
  private static Seen = 'seen';
  private static Confirmed = 'confirmed';
  private static Attachments = 'attachments';
  private static Comments = 'comments';

  // Variables
  // --------------------------------------------------------------------------
  /** 投稿者ユーザーID. */
  @JsonProperty(FirArticle.ContributorId, String, true)
  contributorId: string = undefined;

  /** 投稿内応. */
  @JsonProperty(FirArticle.Contents, String, true)
  contents: string = undefined;

  /** アンケートかどうかのフラグ. */
  @JsonProperty(FirArticle.IsSurveys, Boolean, true)
  surveysFlag: boolean = undefined;

  /** 編集日時. */
  @JsonProperty(FirArticle.EditDate, DateConverter, true)
  editDate: Date = undefined;

  /** 作成日時. */
  @JsonProperty(FirArticle.CreatedAt, DateConverter, true)
  createdAt: Date = undefined;

  /** 宛先. */
  @JsonProperty(FirArticle.ToUser, KeysConverter, true)
  toUser: string[] = [];

  /** 既読・未読情報. */
  @JsonProperty(FirArticle.Seen, SeenConverter, true)
  seen: FirSeen = new FirSeen([], []);

  /** 確認しました！. */
  @JsonProperty(FirArticle.Confirmed, ValuesConverter, true)
  confirmed: string[] = [];

  /** 添付ファイル. */
  @JsonProperty(FirArticle.Attachments, ValuesConverter, true)
  attachments: string[] = [];

  /** コメントID. */
  @JsonProperty(FirArticle.Comments, KeysConverter, true)
  comments: string[] = [];

  /** アンケート情報 */
  surveys: FirSurveys;
  groupInfo?: FirGroup;
  listComments?: FirComment[] = [];

  // Override
  // --------------------------------------------------------------------------
  updateData(key: string, val: any) {
    if (key === FirArticle.Contents) {
      this.contents = val;

    } else if (key === FirArticle.EditDate) {
      this.editDate = new DateConverter().deserialize(val);

    } else if (key === FirArticle.ToUser) {
      this.toUser = new KeysConverter().deserialize(val);

    } else if (key === FirArticle.Seen) {
      this.seen = new SeenConverter().deserialize(val);

    } else if (key === FirArticle.Confirmed) {
      this.confirmed = new ValuesConverter().deserialize(val);

    } else if (key === FirArticle.Attachments) {
      this.attachments = new ValuesConverter().deserialize(val);

    } else if (key === FirArticle.Comments) {
      this.comments = new KeysConverter().deserialize(val);

    } else if (key === FirArticle.CreatedAt) {
      this.createdAt = new DateConverter().deserialize(val);
    }
  }
}
