import {
  AfterViewInit, Component, DoCheck, ElementRef, EventEmitter, Input,
  KeyValueDiffers, NgZone,
  OnChanges, OnDestroy, OnInit,
  Output, SimpleChanges
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {GroupService} from '../../services/group.service';
import {FirebaseDatabase} from '../../services/firebase/firebase.database';
import EventType = FirebaseDatabase.EventType;
import {DialogResult} from '../../models/dialog-param';
import {Helper} from '../../common/helper';
import {DialogService} from '../../services/dialog.service';
import {GroupType} from '../../models/gr/firebase/fir.group';
import {GroupArticleInformationComponent} from '../group-article-information/group-article-information.component';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import * as firebase from 'firebase/app';
import Reference = firebase.database.Reference;
declare const $: any;

@Component({
  selector: 'app-group-comment-info',
  templateUrl: './group-comment-info.component.html',
  styleUrls: ['./group-comment-info.component.scss'],
  preserveWhitespaces: false,
  providers: [GroupArticleInformationComponent]
})
export class GroupCommentInfoComponent implements OnInit, AfterViewInit, DoCheck, OnChanges, OnDestroy {
  @Input() article: any;
  @Input() comment: any;
  @Input() userSession: any;
  @Input() groupInfo: any;
  @Input('listMemberInfo') listMemberInfo = [];
  @Input() listFavorites: any[] = [];
  @Input() focusedComment: string;
  @Input('unseenToComment') unseenToComment: any[] = [];
  @Output() replyAll = new EventEmitter<string[]>();
  @Output() renderedComment = new EventEmitter<boolean>();
  isGroupOutside;
  toUserList = [];
  confirmedList = [];
  contributorInfo: any;
  cmtObjDiffer: any;
  isUnseenToComment = false;
  listAttachments = [];
  isUnseenComment = false;
  seenSubscription: Subscription;
  inViewport = {
    topInView: false,
    bottomInView: false
  };
  cmtConfirmedIds = [];
  commentIsFavorited: boolean;
  clickFavoriteDebounce: any;
  clickConfirmDebounce: any;
  commentReference: Reference;

  constructor(private groupService: GroupService,
              private dialogService: DialogService,
              private firebaseDatabase: FirebaseDatabase,
              private translate: TranslateService,
              private helper: Helper,
              private _elementRef: ElementRef,
              private differs:  KeyValueDiffers,
              private groupArticleComponent: GroupArticleInformationComponent,
              private ngZone: NgZone) {
    this.cmtObjDiffer = differs.find({}).create(null);
  }

  ngOnInit() {
    this.isGroupOutside = this.groupInfo.type === GroupType.Outside;
    this.clickFavoriteDebounce = this.helper.debounce(this.updateFavoriteComment, 300);
    this.clickConfirmDebounce = this.helper.debounce(this.updateConfirmedComment, 300);
  }

  private removeTimer(timer) {
    if (timer) {
      timer.unsubscribe();
      timer = null;
    }
  }

  ngOnDestroy() {
    this.removeTimer(this.seenSubscription);
    if (this.commentReference) {
      this.commentReference.off();
      this.commentReference = null;
    }
  }

  ngAfterViewInit() {
    if (this.focusedComment) {
      setTimeout(() => {
        this.renderedComment.emit(true);
      }, 1000);
    }
    this.checkSeenCommentEvent();
    if(navigator.userAgent.indexOf('Safari') > 0){
      $('body').addClass('safari');
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['listMemberInfo'] && this.listMemberInfo) {
      this.getContributorInfoCmt();
      this.getConfirmedList();
      this.getToUserList();
    }
    if (changes['comment'] && this.comment) {
      this.commentReference = this.firebaseDatabase.ref(`comment/${this.article.id}/${this.comment.id}`);
      this.groupService.onChildEventListener(this.comment, this.commentReference, `comment/${this.article.id}/${this.comment.id}`);
    }
    if (changes['listFavorites']) {
      this.commentIsFavorited = this.listFavorites.indexOf(this.comment.id) > -1;
    }
    if (changes['unseenToComment'] && this.unseenToComment) {
      this.isUnseenToComment = this.unseenToComment.findIndex(item => item.commentId === this.comment.id) > -1;
      if (this.isUnseenToComment) {
        // comment has been read, then this comment is edited, the userLogin is added to ToUser list => unseenTo comment
        this.inViewport.topInView = false;
        this.inViewport.bottomInView = false;
        this.checkSeenCommentEvent();
      }
    }
  }

  checkSeenCommentEvent() {
    this.removeTimer(this.seenSubscription);
    this.ngZone.runOutsideAngular(() => {
      this.seenSubscription = Observable.timer(0, 100)
        .subscribe(i => {
          const element = this._elementRef.nativeElement.querySelector('#' + this.comment.id);
          if (element && !document.hidden) {
            if (navigator.onLine &&
              this.groupInfo.approvedMembers.findIndex(item => item.officeUserId === this.userSession.officeUserId) > -1) {
              if (this.helper.inViewport($('#' + this.comment.id), this.inViewport)) {
                this.seenComment();
                this.removeTimer(this.seenSubscription);
              }
            } else  {
              // *** INTERNET_DISCONNECTED!
            }
          }
        });
    });
  }

  ngDoCheck() {
    const changes = this.cmtObjDiffer.diff(this.comment);
    if (changes) {
      changes.forEachChangedItem(r => {
        if (r.key === 'confirmed') {
          this.cmtConfirmedIds = this.comment.confirmed.reverse();
          this.getConfirmedList();
        } else if (r.key === 'toUser') {
          this.getToUserList();
        } else if (r.key === 'seen') {
          this.isUnseenComment = this.userSession.officeUserId !== this.comment.contributorId &&
            this.comment.seen.seen.indexOf(this.userSession.officeUserId) < 0;
        }
      });
      changes.forEachAddedItem(r => {
        if (r.key === 'confirmed') {
          this.cmtConfirmedIds = this.comment.confirmed.reverse();
        }
        if (r.key === 'seen') {
          this.isUnseenComment = this.userSession.officeUserId !== this.comment.contributorId &&
            this.comment.seen.seen.indexOf(this.userSession.officeUserId) < 0;
        }
      });
    }
  }

  getContributorInfoCmt() {
    this.groupService.getUserList([this.comment.contributorId], this.listMemberInfo).subscribe(user => {
      this.contributorInfo = user[0];
    });
  }

  getToUserList() {
    this.groupService.getUserList(this.comment.toUser, this.listMemberInfo).subscribe(list => {
      this.toUserList = list;
    });
  }

  getConfirmedList() {
    this.groupService.getUserList(this.comment.confirmed, this.listMemberInfo).subscribe(list => {
      this.confirmedList = list;
    });
  }

  /**
   * click confirm comment
   * @param event
   */
  onClickConfirmComment(event) {
    event.preventDefault();
    this.clickConfirmDebounce();
  }

  updateConfirmedComment() {
    if (navigator.onLine) {
      const confirmedRef = this.firebaseDatabase.ref(`comment/${this.article.id}/${this.comment.id}/confirmed`);
      if (this.comment.confirmed && this.comment.confirmed.indexOf(this.userSession.officeUserId) > -1) {
        confirmedRef.once(EventType.Value).then((snap) => {
          if (snap.hasChildren()) {
            snap.forEach(child => {
              if (child.val() === this.userSession.officeUserId) {
                confirmedRef.child(child.key).remove();
              }
              return false;
            });
          }
        });
      } else {
        confirmedRef.push(this.userSession.officeUserId);
      }
    } else {
      this.dialogService.showError('MSG.GR.ERROR＿NETWORK');
    }
  }

  /**
   * click favorite comment
   * @param event
   */
  onclickFavoriteComment(event) {
    event.preventDefault();
    $('.tooltip').remove();
    this.clickFavoriteDebounce();
  }

  updateFavoriteComment() {
    if (navigator.onLine) {
      this.groupService.updateFavorite(this.userSession.officeUserId, this.comment.id, !this.commentIsFavorited).subscribe();
    } else {
      this.dialogService.showError('MSG.GR.ERROR＿NETWORK');
    }
  }

  /**
   * @param event
   * @param comment
   */
  editComment(event) {
    $('.tooltip').remove();
    event.preventDefault();
    this.comment.isEdit = true;
  }

  toUserCommentPopover(event) {
    this.dialogService
      .showMemberListDialog(false, null, null, 'MSG.CLOSE',
        {groupId: this.groupInfo.id, userIds: event, userInfo: this.listMemberInfo, isShowOfficeName: this.isGroupOutside})
      .subscribe();
  }

  confirmedPopover(event) {
    this.dialogService
      .showMemberListDialog(false, 'MSG.CONFIRMED', null, 'MSG.CLOSE',
        {groupId: this.groupInfo.id, userIds: event, userInfo: this.confirmedList, isShowOfficeName: this.isGroupOutside, mode: 'confirmed'})
      .subscribe();
  }

  /**
   * click toAll button
   * @param event
   */
  toUserListCmt(event) {
    event.preventDefault();
    const userIds = [];
    if (this.article.contributorId !== this.userSession.officeUserId) {
      userIds.push(this.article.contributorId);
    }

    if (this.comment.contributorId !== this.userSession.officeUserId && userIds.indexOf(this.comment.contributorId) === -1 ) {
      userIds.push(this.comment.contributorId);
    }

    for (let i = 0; i < this.comment.toUser.length; i++) {
      if (userIds.indexOf(this.comment.toUser[i]) === -1 && this.comment.toUser[i] !== this.userSession.officeUserId ) {
        userIds.push(this.comment.toUser[i]);
      }
    }
    this.replyAll.emit(userIds);
  }

  /**
   * seen comment
   */
  seenComment() {
    const articleRef = this.firebaseDatabase.ref(`comment/${this.article.id}`);
    articleRef.once(EventType.Value).then((snap) => {
      if (snap.hasChild(this.comment.id)) {
        articleRef.child(`${this.comment.id}/seen/${this.userSession.officeUserId}`).set(true);
      }
    });
    // remove path: user/officeUserId/groupInfo/groupId/unseenTo/comment/commentId
    const unseenToRef = this.firebaseDatabase.ref(`user/${this.userSession.officeUserId}/groupInfo/${this.groupInfo.id}/unseenTo/comment`);
    unseenToRef.once(EventType.Value).then(snapshot => {
      if (snapshot.hasChild(this.comment.id)) {
        unseenToRef.child(this.comment.id).remove();
      }
    });
    // remove path: user/officeUserId/groupInfo/groupId/unseen
    const unseenRef = this.firebaseDatabase.ref(`user/${this.userSession.officeUserId}/groupInfo/${this.groupInfo.id}/unseen`);
    unseenRef.once(EventType.Value).then(snapshot => {
      if (snapshot.hasChild(this.comment.id)) {
        unseenRef.child(this.comment.id).remove();
      }
    });
  }

  /**
   * delete comment
   * @param event
   */
  deleteComment(event) {
    event.preventDefault();
    let html = '';
    this.translate.get('MSG.GR').subscribe(msg => {
      html = '<div>' + msg.M012_1 + '</div><div>' + msg.M012_2 + '</div>';
    });
    this.dialogService.showMessage('warning', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
      (res: DialogResult) => {
        if (res.isOk()) {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(true);
          });
          this.groupService.deleteComment(this.comment.id, this.article.id).subscribe((response) => {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(false);
            });
            const favorRef = this.firebaseDatabase.ref(`/user/${this.userSession.officeUserId}/favorite`);
            favorRef.once(EventType.Value).then(snapshot => {
              if (snapshot.hasChild(this.comment.id)) {
                favorRef.child(this.comment.id).remove();
              }
            });
            setTimeout(() => {
              this.dialogService.showSuccess('MSG.DELETED');
            }, 400);
          }, error => {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(false);
            });
            setTimeout(() => {
              this.dialogService.showError('MSG.ERROR');
            }, 400);
          });
        }
      }
    );
  }

  getDetailUser(event, user: any) {
    event.preventDefault();
    $('.tooltip').remove();
    this.groupArticleComponent.detailUserDialog(user);

  }

  getAttachedFiles(list) {
    if (list) {
      this.listAttachments = list;
    }
  }
}
