import {JsonConverter, JsonCustomConvert, JsonObject, JsonProperty} from 'json2typescript';
import {FirBase} from './fir.base';
import {KeysConverter} from '../../../common/converter/firebase.json.converter';
import {FirGroup} from './fir.group';
import {FirArticle} from './fir.article';
import {FirComment} from './fir.comment';

/**
 * @author k.sumi 2017/09/28
 */
@JsonConverter
export class UnseenToConverter implements JsonCustomConvert<FirUnseenTo> {
  // @Override
  serialize(data: FirUnseenTo): any {
    return null;
  }
  // @Override
  deserialize(data: any): FirUnseenTo {
    if (!(typeof {})) {
      return null;
    }
    const model = new FirUnseenTo();
    if (data.hasOwnProperty('article')) {
      model.article = Object.keys(data.article);
    }
    if (data.hasOwnProperty('comment')) {
      // model.comment = Object.keys(data.comment);
      Object.keys(data.comment).forEach(k => {
        model.comment.push({commentId: k, articleId: data.comment[k]});
      });
    }
    return model;
  }
}

@JsonConverter
class UnseenToCommentConverter implements JsonCustomConvert<any[]> {
  // @Override
  serialize(data: any[]): any {
    return null;
  }
  // @Override
  deserialize(data: any[]): any[] {
    if (!(typeof {})) {
      return null;
    }
    const unseenToCmtList: any[] = [];
    Object.keys(data).forEach(k => {
      unseenToCmtList.push({commentId: k, articleId: data[k]});
    });
    return unseenToCmtList;
  }
}

/**
 * 自分宛ての未読記事情報.
 */
@JsonObject
export class FirUnseenTo extends FirBase {

  // Constants
  // --------------
  private static Article = 'article';
  private static Comment = 'comment';

  // Variables
  // --------------
  @JsonProperty(FirUnseenTo.Article, KeysConverter, true)
  article: string[] = [];

  @JsonProperty(FirUnseenTo.Comment, UnseenToCommentConverter, true)
  comment: any[] = [];

  // Methods
  // --------------
  countUnseenTo() {
    return this.article.length + this.comment.length;
  }

  // @Override
  // --------------
  updateData(key: string, val: any) {
    if (key === FirUnseenTo.Article) {
      this.article = new KeysConverter().deserialize(val);
    } else if (key === FirUnseenTo.Comment) {
      this.comment = new UnseenToCommentConverter().deserialize(val);
    }
  }
}

/**
 * @author k.sumi 2017/09/28
 */
@JsonObject
export class FirGroupTopics extends FirBase {

  // Constants
  // --------------
  private static UnseenTo = 'unseenTo';
  private static Unseen = 'unseen';

  // Variables
  // --------------
  group: FirGroup;
  article: FirArticle;
  comments: FirComment[] = [];
  membersInfo: any[] = [];

  @JsonProperty(FirGroupTopics.UnseenTo, UnseenToConverter, true)
  unseenTo: FirUnseenTo = new FirUnseenTo();

  @JsonProperty(FirGroupTopics.Unseen, KeysConverter, true)
  unseen: string[] = [];

  // Methoda
  // --------------
  countUnseenTo() {
    return this.unseenTo ? this.unseenTo.countUnseenTo() : 0;
  }

  countUnseen() {
    return this.unseen.length;
  }

  // @Override
  // --------------
  updateData(key: string, val: any) {
    if (key === FirGroupTopics.Unseen) {
      this.unseen = new KeysConverter().deserialize(val);
    } else if (key === FirGroupTopics.UnseenTo) {
      this.unseenTo = new UnseenToConverter().deserialize(val);
    }
  }
}
