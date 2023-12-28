/**
 * タイムラインモデル.
 */
import {FirGroup} from './firebase/fir.group';
import {FirArticle} from './firebase/fir.article';
import {FirComment} from './firebase/fir.comment';

/**
 * タイムライン情報.
 */
export class Timeline {

  // Variables
  // --------------------------------------------------------------------------
  // ID.
  public id: string;
  // グループ情報.
  public group: FirGroup;
  // 記事情報.
  public article: FirArticle;
  // コメント情報.
  public comments: FirComment[] = [];

  // Constructor
  // --------------------------------------------------------------------------
  constructor() {
  }

  // Public methods
  // --------------------------------------------------------------------------
}
