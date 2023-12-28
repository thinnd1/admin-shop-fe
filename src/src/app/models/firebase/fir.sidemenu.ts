import {FirBase} from '../gr/firebase/fir.base';
import {UnseenToConverter} from '../gr/firebase/fir.group.topics';

/**
 * サイドメニューモデル.
 */
export class FirSideMenu extends FirBase {

  /**
   * タイトル.
   * @optional
   */
  title: string;

  /**
   * 未読件数.
   */
  unseenCount: number;

  /**
   * ToUser宛未読件数.
   * @optional
   */
  toUnseen: number;

  /**
   * Newアイコン表示フラグ.
   * @optional
   */
  isNew: boolean;

  /**
   * 面会仲介者の有無.
   * @optional
   */
  hasMediator: boolean;

  /**
   * タイムスタンプ.
   */
  timestamp: number;

  listToUnseen: any;

  // Constructor
  // --------------------------------------------------------------------------
  constructor(data: any) {
    super();
    this.title = data.title || data.name || data.display_name;
    this.toUnseen = data.toUnseen || 0;
    this.unseenCount = data.unseenCount || 0;
    this.isNew = data.isNew || false;
    this.hasMediator = data.hasMediator || false;
    this.timestamp = data.timestamp || 0;
    this.listToUnseen = data.listToUnseen ? new UnseenToConverter().deserialize(data.listToUnseen) : null;
  }

  updateData(key: string, val: any) {
    if (key === 'toUnseen') {
      this.toUnseen = val;
    } else if (key === 'unseenCount') {
      this.unseenCount = val;
    } else if (key === 'listToUnseen') {
      this.listToUnseen = new UnseenToConverter().deserialize(val);
    } else if (key === 'title') {
      this.title = val;
    }
  }
}
