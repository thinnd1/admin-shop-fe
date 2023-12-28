import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {SharedValueService} from '../../../services/shared-value.service';
import {DialogService} from '../../../services/dialog.service';
import {GroupService} from '../../../services/group.service';
import {FirebaseDatabase} from '../../../services/firebase/firebase.database';
import EventType = FirebaseDatabase.EventType;
import {DialogResult} from '../../../models/dialog-param';
import {Subscription} from 'rxjs/Subscription';
import {Title} from '@angular/platform-browser';
import {Helper} from '../../../common/helper';
import {FirComment} from '../../../models/gr/firebase/fir.comment';

declare const $: any;

@Component({
  selector: 'app-detail-page',
  templateUrl: './detail-page.component.html',
  styleUrls: ['./detail-page.component.scss'],
  preserveWhitespaces: false
})
export class DetailPageComponent implements OnInit, OnDestroy {
  userSession: any;
  groupId: string;
  articleId: string;
  commentId: string;
  article: any;
  comments: FirComment[] = [];
  memberInfoList = [];
  listFavorites = [];
  groupInfo: any;
  currentDateTime;
  favoriteListSubscription: Subscription;
  memberListListSubscription: Subscription;
  articleSubscription: Subscription;
  unseenTo;

  constructor(private sharedValueService: SharedValueService,
              private dialogService: DialogService,
              private activatedRoute: ActivatedRoute,
              private groupService: GroupService,
              private route: Router,
              private titleService: Title,
              private helper: Helper) {
  }

  ngOnInit() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.userSession = this.sharedValueService.getUserSession();
    this.activatedRoute.params.subscribe((params: Params) => {
      (<any>$('#theModal')).modal('hide');
      this.groupId = params['groupId'];
      this.articleId = params['articleId'];
      this.commentId = params['commentId'];
      this.comments = [];
      if (this.groupId && this.articleId) {
        if (!this.commentId) {
          this.helper.setScrollTop();
        }
        this.currentDateTime = new Date();
        this.groupService.getGroup(this.groupId).subscribe((response) => {
          this.groupInfo = response;
          this.titleService.setTitle(this.groupInfo.name);
        });
        this.articleSubscription = this.groupService.getArticleDetail(this.groupId, this.articleId).subscribe(data => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          if (data && this.commentId && data.article.comments.indexOf(this.commentId) > -1 || !this.commentId && data) {
            this.article = data.article;
            this.article['isEdit'] = false;
            this.comments = data.comments;
          } else {
            this.dialogService.showMessage('error', false, null, 'MSG.ERROR', null, 'MSG.OK', null).subscribe(
              (res: DialogResult) => {
                if (res.isOk()) {
                  this.route.navigate(['/']);
                }
              });
          }
        }, error => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showError('MSG.ERROR');
        });
        this.getMemberList();
        this.getListFavorite();
        this.getUnseenTo();
      }
    });
  }

  ngOnDestroy() {
    this.listFavorites = [];
    this.memberInfoList = [];
    this.article = null;
    if (this.memberListListSubscription) {
      this.memberListListSubscription.unsubscribe();
    }
    if (this.favoriteListSubscription) {
      this.favoriteListSubscription.unsubscribe();
    }
    if (this.articleSubscription) {
      this.articleSubscription.unsubscribe();
    }
  }

  /**
   * get group's member list
   */
  getMemberList() {
    this.memberInfoList = [];
    this.memberListListSubscription = this.groupService.getMembersInfo(this.groupId).subscribe(list => {
      this.memberInfoList = list;
    });
    this.groupService.eventListener(`group/${this.groupId}/approvedMembers`).subscribe(v => {
      if (v.type === EventType.ChildRemoved) {
        // removed
        this.memberInfoList = this.memberInfoList.filter(user => user.id !== v.key);
        this.memberInfoList = this.memberInfoList.slice();
        if (this.userSession.officeUserId === v.key) {
          this.dialogService.showMessage('warning', false, null, 'GR0013.REMOVED_MEMBER_MSG', null, 'MSG.OK', null).subscribe(
            (res: DialogResult) => {
              if (res.isOk()) {
                this.route.navigate(['/']);
              }
            }
          );
        }
      } else if (v.type === EventType.ChildAdd) {
        // added
        this.groupService.getUser(v.key).subscribe(mem => {
          if (mem && this.memberInfoList.findIndex(user => user.id === mem.id) < 0) {
            this.memberInfoList.push(mem);
            this.memberInfoList = this.memberInfoList.slice();
          }
        });
      }
    });
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

  getUnseenTo() {
    this.groupService.getUnseenToGroup(this.userSession.officeUserId, this.groupId).subscribe(data => {
      if (data) {
        this.unseenTo = data;
      }
    });
  }

  removeArticle(event) {
    this.article = null;
    this.dialogService.showMessage('error', false, null, 'MSG.ERROR', null, 'MSG.OK', null).subscribe(
      (res: DialogResult) => {
        if (res.isOk()) {
          this.route.navigate(['/']);
        }
      });
  }

}
