import {Injectable} from "@angular/core";

/**
 * 未読情報データ.
 * firebaseの変更通知を受けて値を更新する
 * シングルトン
 */
@Injectable()
export class Unseens {
  // 面会
  meetingAll: number = 0;
  // チャット
  chatAll: number = 0;
  // グループ
  groupAll: number = 0;
  // DrJOYからのお知らせ
  drjoyInfoAll: number = 0;
  // 紙飛行機お知らせ
  notifyInfoAll: number = 0;

  getAll(): number {
    return this.meetingAll + this.chatAll + this.groupAll + this.drjoyInfoAll + this.notifyInfoAll;
  }
}
