import {Component, OnDestroy, OnInit} from '@angular/core';
import {GroupService} from '../../../services/group.service';
import {FirebaseDatabase} from '../../../services/firebase/firebase.database';
import {Router} from '@angular/router';
import {SharedValueService} from '../../../services/shared-value.service';
import {DialogResult} from '../../../models/dialog-param';
import {DialogService} from '../../../services/dialog.service';
import {TimelineService} from '../../../services/timeline.service';
import {Subscription} from 'rxjs/Subscription';
import {AuthenticationMessage} from '../../../services/message.service';
import EventType = FirebaseDatabase.EventType;

declare const $: any;

@Component({
  selector: 'app-gr0014-page',
  templateUrl: './gr0014-page.component.html',
  styleUrls: ['./gr0014-page.component.scss']
})
export class Gr0014PageComponent implements OnInit, OnDestroy {
  listFavorites = [];
  userSession;
  lastLoad = false;
  // scroll
  isLoading = true;
  infiniteScrollHeight: string;
  infiniteScrollOptions: any = {
    page: 1,
    height: 0
  };
  listTimeLine: any[] = [];
  favoriteListSubscription: Subscription;
  private logoutSubscription: Subscription;

  /**
   * 結果が無い場合のイラストの表示フラグ
   */
  public _displayHasntIllust = false;

  constructor(
    private groupService: GroupService,
    private dialogService: DialogService,
    private firebaseDatabase: FirebaseDatabase,
    private route: Router,
    private sharedValueService: SharedValueService,
    private timelineService: TimelineService,
    private logoutMessage: AuthenticationMessage
  ) {}

  showLoading(flag: boolean) {
    setTimeout(() => {
      if (!this.listTimeLine.length) {
        this.dialogService.setLoaderVisible(flag);
        this.isLoading = true;
      } else {
        this.dialogService.setLoaderVisible(false);
        this.isLoading = !flag;
      }
    });
  }

  getTimelineData() {
    this.showLoading(true);
    this.timelineService.fetchPagerTimeline().subscribe((response) => {
      this.showLoading(false);
      if (response) {
        if (!response.length) {
          this.lastLoad = true;
        }
        this.listTimeLine = response;
        this.getTimelineDataAfter();
        this._displayHasntIllust = response.length ? false : true; // 結果が無ければイラストを表示 
      } else {
        this.dialogService
          .showMessage('error', false, null, 'MSG.ERROR', null, 'MSG.OK', null)
          .subscribe((res: DialogResult) => {
            if (res.isOk()) {
              this.route.navigate(['/']);
            }
          });
      }
    });
  }

  getTimelineDataAfter() {
    this.getListFavorite();
    this.infiniteScrollHeight = (this.infiniteScrollOptions.height) ? this.infiniteScrollOptions.height + 'px' : 'auto';
  }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();

    this.timelineService.prepare();
    this.getTimelineData();

    this.logoutSubscription = this.logoutMessage.get().subscribe(type => {
      if (type === AuthenticationMessage.Type.Logout) {
        // ログアウト時
        this.timelineService.dispose();
        this.listTimeLine = [];
      }
    });

  }

  ngOnDestroy() {
    this.groupService.clearScreenRelatedReferences();

    if (this.favoriteListSubscription) {
      this.favoriteListSubscription.unsubscribe();
    }
    if (this.logoutSubscription) {
      this.logoutSubscription.unsubscribe();
    }
    this.logoutSubscription = null;

    // TimelineService を停止しておく
    this.listTimeLine = [];
    this.timelineService.dispose();
  }

  /**
   *
   */
  onScrollDown() {
    if (this.lastLoad) {
      return false;
    }
    if (!this.listTimeLine.length) {
      return false;
    }
    this.getTimelineData();
  }

  getListFavorite() {
    this.listFavorites = [];
    this.favoriteListSubscription = this.groupService.getFavoriteList(this.userSession.officeUserId).subscribe(list => {
      this.listFavorites = list;
    });

    this.groupService.eventListener(`user/${this.userSession.officeUserId}/favorite`).subscribe(v => {
      if (v.type === EventType.ChildRemoved) {
        this.listFavorites = this.listFavorites.filter(item => item !== v.key);
        this.listFavorites = this.listFavorites.slice();
      } else if (v.type === EventType.ChildAdd) {
        if (this.listFavorites.indexOf(v.key) < 0) {
          this.listFavorites.push(v.key);
          this.listFavorites = this.listFavorites.slice();
        }
      }
    });
  }

}

