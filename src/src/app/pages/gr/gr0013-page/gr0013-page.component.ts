import {AfterContentChecked, ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {SharedValueService} from '../../../services/shared-value.service';
import {FirebaseDatabase} from '../../../services/firebase/firebase.database';
import {GroupService} from '../../../services/group.service';
import EventType = FirebaseDatabase.EventType;
import {DialogService} from '../../../services/dialog.service';
import {Helper} from '../../../common/helper';
import {Subscription} from 'rxjs/Subscription';
import {Title} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-gr0013-page',
  templateUrl: './gr0013-page.component.html',
  styleUrls: ['./gr0013-page.component.scss'],
  preserveWhitespaces: false
})
export class Gr0013PageComponent implements OnInit, OnDestroy, AfterContentChecked {
  topicGroup: any[] = [];
  userSession;
  listFavorites: string[] = [];
  topicGroupsSubscription: Subscription;
  favoriteListSubscription: Subscription;
  unSeenToSubscription: Subscription;
  countUnseenTo = 0;

  constructor(private groupService: GroupService,
              private dialogService: DialogService,
              private firebaseDatabase: FirebaseDatabase,
              private activatedRoute: ActivatedRoute,
              private sharedValueService: SharedValueService,
              private helper: Helper,
              private ngZone: NgZone,
              private changeDetectorRef: ChangeDetectorRef,
              private titleService: Title,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    this.activatedRoute.params.subscribe((params: Params) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      (<any>$('#theModal')).modal('hide');
      this.helper.setScrollTop();
      this.getTopicGroup(params['type']);
      this.getListFavorite();
    });
    this.titleService.setTitle(this.translate.instant('GR0013.TITLE'));
  }

  private _unsubscribe(subscription) {
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
    }
  }

  ngAfterContentChecked() {
    if (this.topicGroup.length > 0) {
      this.getUnseenTo();
    }
  }

  ngOnDestroy() {
    this.listFavorites = [];
    this.topicGroup = [];
    this._unsubscribe(this.topicGroupsSubscription);
    this._unsubscribe(this.favoriteListSubscription);
    this._unsubscribe(this.unSeenToSubscription);
  }

  getTopicGroup(type) {
    this.topicGroup = [];
    this.topicGroupsSubscription = this.groupService.getTopicGroups(this.userSession.officeUserId, type).subscribe(topicList => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.topicGroup = topicList;
    }, error => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
    });
  }

  getListFavorite() {
    this.listFavorites = [];
    this.favoriteListSubscription = this.favoriteListSubscription = this.groupService.getFavoriteList(this.userSession.officeUserId)
      .subscribe(list => {
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

  removeArticle(articleId: string[]) {
    if (articleId.length > 0) {
      for (let i = 0; i < articleId.length; i++) {
        if (this.topicGroup.findIndex(item => item.article.id === articleId[i]) >= 0) {
          this.topicGroup.splice(this.topicGroup.findIndex(item => item.article.id === articleId[i]), 1);
        }
      }
    }
  }

  /**
   * count unSeenTo => disable/enable "Mark all as read" button
   */
  getUnseenTo() {
    this._unsubscribe(this.unSeenToSubscription);
    this.ngZone.runOutsideAngular(() => {
      if (navigator.onLine) {
        let count = 0;
        for (let i = 0; i < this.topicGroup.length; i++) {
          // count += listGroup[i].group.countUnseenTo();
          // just count the unseenTo in the articles and comments displayed on the screen
          for (let k = 0; k < this.topicGroup[i].unseenTo.article.length; k++) {
            if (this.topicGroup[i].unseenToArticle.indexOf(this.topicGroup[i].unseenTo.article[k]) > -1) {
              count++;
            }
          }
          for (let j = 0; j < this.topicGroup[i].unseenTo.comment.length; j++) {
            if (this.topicGroup[i].unseenToArticle.indexOf(this.topicGroup[i].unseenTo.comment[j].articleId) > -1) {
              count++;
            }
          }
        }
        if (count !== this.countUnseenTo) {
          this.countUnseenTo = count;
          this.changeDetectorRef.markForCheck();
          this._unsubscribe(this.unSeenToSubscription);
        }
      } else {
        // *** INTERNET_DISCONNECTED!
      }
    });
  }
  /**
   * @param event
   */
  allSeenTo(event) {
    event.preventDefault();
    if (navigator.onLine) {
      const groupInfoRef = this.firebaseDatabase.ref(`user/${this.userSession.officeUserId}/groupInfo`);
      groupInfoRef.once(EventType.Value).then(snap => {
        if (snap.hasChildren()) {
          for (let i = 0; i < this.topicGroup.length; i++) {
            const unseenToRef = groupInfoRef.child(`${this.topicGroup[i].id}/unseenTo`);
            // remove path : user/officeUserId/groupInfo/groupId/unseen/articleId
            unseenToRef.child('article').once(EventType.Value).then(snapShot => {
              if (snapShot.hasChildren()) {
                snapShot.forEach(child => {
                  groupInfoRef.child(`${this.topicGroup[i].id}/unseen/${child.key}`).remove();
                  this.firebaseDatabase.ref(`article/${child.key}/seen/${this.userSession.officeUserId}`).set(true);
                });
              }
            });
            // remove path : user/officeUserId/groupInfo/groupId/unseen/commentId
            unseenToRef.child('comment').once(EventType.Value).then(snapshot => {
              if (snapshot.hasChildren()) {
                snapshot.forEach(child => {
                  groupInfoRef.child(`${this.topicGroup[i].id}/unseen/${child.key}`).remove();
                  this.firebaseDatabase.ref(`comment/${child.val()}/${child.key}/seen/${this.userSession.officeUserId}`).set(true);
                });
              }
            });
            // remove path : user/officeUserId/groupInfo/groupId/unseenTo
            if (snap.hasChild(`${this.topicGroup[i].id}/unseenTo`)) {
              groupInfoRef.child(`${this.topicGroup[i].id}/unseenTo`).remove();
            }
          }
        }
      });
    } else {
      this.dialogService.showError('MSG.GR.ERROR＿NETWORK');
    }
  }

  topicTrackById(index: number, topic: any) {
    return topic.id;
  }
}
