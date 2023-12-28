import {
  AfterViewChecked,
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, ElementRef, EventEmitter, Input,
  KeyValueDiffers, NgZone,
  OnChanges, OnDestroy, OnInit, Output, SimpleChanges
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {GroupService} from '../../services/group.service';
import {FirebaseDatabase} from '../../services/firebase/firebase.database';
import EventType = FirebaseDatabase.EventType;
import {Router} from '@angular/router';
import {Helper} from '../../common/helper';
import {DialogResult} from '../../models/dialog-param';
import {DialogService} from '../../services/dialog.service';
import {GroupType} from '../../models/gr/firebase/fir.group';
import {AccountStatus} from '../../models/ba/user-session';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import { timer } from 'rxjs/observable/timer';
import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to';
import {FirComment} from '../../models/gr/firebase/fir.comment';
import * as firebase from 'firebase/app';
import Reference = firebase.database.Reference;
declare const $: any;

@Component({
  selector: 'app-group-article-information',
  templateUrl: './group-article-information.component.html',
  styleUrls: ['./group-article-information.component.scss'],
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupArticleInformationComponent implements OnInit, OnChanges, DoCheck, AfterViewInit, OnDestroy, AfterViewChecked {
  @Input('groupInfo') groupInfo: any;
  @Input() userSession: any;
  @Input() article: any;
  @Input() _inputOptions = {
    articleIndex: -1,
    isShowGroupName: false,
    focusedComment: null,
    unseenToArticle: [],
    unseenToComment: []
  };
  @Input() listMemberInfo: any[];
  @Input() listFavorites: any[] = [];
  @Input() comments: FirComment[] = [];
  @Output() removedArticleEvent = new EventEmitter<number[]>();
  _listMemberInfo: any[] = [];
  listAttachments: Array<any> = [];
  isGroupOutside: boolean;
  toUserList = [];
  confirmedList = [];
  confirmedIds = [];
  seenUnseenList = [];
  unansweredList = [];
  contributorInfo: any;
  firstConfirmation: any;
  replyList = [];
  objDiffer = [];
  isUnseenToArticle = false;
  isUnseenArticle = false;
  isExpiredSurvey = false;
  timerSurvey = timer(0, 1000);
  surveySubscription: Subscription;
  seenSubscription: Subscription;
  inViewport = {
    topInView: false,
    bottomInView: false
  };
  isFavorited: boolean;
  clickFavoriteDebounce: any;
  clickConfirmDebounce: any;
  isAuthor: boolean;
  isConfirmed: boolean;
  arrObjDiffer: any;
  articleReference: Reference;

  constructor(private groupService: GroupService,
              private dialogService: DialogService,
              private firebaseDatabase: FirebaseDatabase,
              private route: Router,
              private translate: TranslateService,
              private helper: Helper,
              private differs:  KeyValueDiffers,
              private _elementRef: ElementRef,
              private zone: NgZone,
              private changeDetectorRef: ChangeDetectorRef,
              private _scrollToService: ScrollToService) {
    this.objDiffer['article'] = differs.find({}).create(null);
    this.objDiffer['surveys'] = differs.find({}).create(null);
    this.objDiffer['group'] = differs.find({}).create(null);
  }

  ngOnInit() {
    this.clickFavoriteDebounce = this.helper.debounce(this.updateFavorite, 300);
    this.clickConfirmDebounce = this.helper.debounce(this.updateConfirmedArticle, 300);
  }

  ngOnDestroy() {
    this.removeTimer(this.surveySubscription);
    this.removeTimer(this.seenSubscription);
    if (this.articleReference) {
      this.articleReference.off();
      this.articleReference = null;
    }
  }

  private removeTimer(subscription) {
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
    }
  }

  private detectChanges() {
    setTimeout(() => {
      if (!this.changeDetectorRef['destroyed']) {
        this.changeDetectorRef.detectChanges();
      }
    }, 250);
  }

  ngAfterViewInit() {
    $('[data-toggle="tooltip"]').tooltip({animation: false});
    if(navigator.userAgent.indexOf('Safari') > 0){
      $('body').addClass('safari');
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (propName === 'groupInfo' && this.groupInfo) {
        this.isGroupOutside = this.groupInfo.type === GroupType.Outside;
        // gr0013: unseenTo
        if (!this.listMemberInfo) {
          this.getMemberList();
        }
        if (this._inputOptions.articleIndex >= 0) {
          this.groupService.eventListener(`article/${this.groupInfo.id}`).subscribe(value => {
            if (value.type === EventType.ChildRemoved && value.key === this.article.id) {
              this.removedArticleEvent.emit([this.article.id]);
            }
          });
          // delete group  => delete all posts in that group
          this.groupService.eventListener(`user/${this.userSession.officeUserId}/groupInfo`).subscribe(data => {
            if (data.type === EventType.ChildRemoved && data.key === this.groupInfo.id) {
              this.removedArticleEvent.emit(this.groupInfo.articles);
            }
          });
        }
      }
      if (propName === 'listMemberInfo') {
        this._listMemberInfo = this.listMemberInfo;
        this.getContributorInfo();
        this.getSeenList();
        this.getConfirmedList();
        this.getFirstConfirmation();
        this.getToUserList();
      }
      if (propName === 'article' && this.article) {
        this.isAuthor = this.article.contributorId === this.userSession.officeUserId;
        this.isUnseenArticle = this.userSession.officeUserId !== this.article.contributorId &&
          this.article.seen.seen.indexOf(this.userSession.officeUserId) < 0;
        this.confirmedIds = this.article.confirmed.reverse();
        this.isConfirmed = this.article.confirmed.indexOf(this.userSession.officeUserId) > -1;
        this.checkSeenArticleEvent();
        this.addCommentListener();
        this.articleReference = this.firebaseDatabase.ref(`article/${this.groupInfo.id}/${this.article.id}`);
        this.groupService.onChildEventListener(this.article, this.articleReference, `article/${this.groupInfo.id}/${this.article.id}`);
      }

      if (propName === 'comments' && this.comments) {
        for (let i = 0; i < this.comments.length; i++) {
          this.comments[i]['isEdit'] = false;
        }
        this.arrObjDiffer = {};
        this.comments.forEach((elt) => {
          this.arrObjDiffer[elt.id] = this.differs.find(elt).create(null);
        });
      }
      if (propName === 'listFavorites') {
        this.isFavorited = this.listFavorites.indexOf(this.article.id) > -1;
      }
      if (propName === '_inputOptions' && this._inputOptions.unseenToArticle) {
        this.isUnseenToArticle = this._inputOptions.unseenToArticle.indexOf(this.article.id) > -1;
        if (this.isUnseenToArticle) {
          // article has been read, then this article is edited, the userLogin is added to ToUser list => unseenTo article
          this.inViewport.topInView = false;
          this.inViewport.bottomInView = false;
          this.checkSeenArticleEvent();
        }
      }
    }
  }

  ngDoCheck() {
    const articleChanges = this.objDiffer['article'].diff(this.article);
    const surveyChanges = this.objDiffer['surveys'].diff(this.article.surveys);
    const groupChanges = this.objDiffer['group'].diff(this.groupInfo);
    this._groupChanges(groupChanges);
    this._articleChanges(articleChanges);
    this._surveyChanges(surveyChanges);
    this._commentsChanges();
  }

  private _groupChanges(changes) {
    if (changes) {
      this.detectChanges();
    }
  }

  // Trigger change detection if each property of a article changes
  private _articleChanges(changes) {
    if (changes) {
      changes.forEachChangedItem(r => {
        if (r.key === 'seen') {
          this.isUnseenArticle = this.userSession.officeUserId !== this.article.contributorId &&
            this.article.seen.seen.indexOf(this.userSession.officeUserId) < 0;
          this.getSeenList();
        } else if (r.key === 'confirmed') {
          this.isConfirmed = this.article.confirmed.indexOf(this.userSession.officeUserId) > -1;
          this.confirmedIds = this.article.confirmed.reverse();
          this.getConfirmedList();
          this.getFirstConfirmation();
        } else if (r.key === 'toUser') {
          this.getToUserList();
        }
      });
      this.detectChanges();
    }
  }

  // Trigger change detection if each property of a survey changes
  private _surveyChanges(changes) {
    if (changes) {
      changes.forEachChangedItem(r => {
        if (r.key === 'choices') {
          this.getUnansweredList();
        }
      });
      changes.forEachAddedItem(r => {
        if (r.key === 'choices') {
          this.getUnansweredList();
        }
      });
      this.detectChanges();
    }
  }

  // Detects if each property of a comment changes
  private _commentsChanges() {
    this.comments.forEach((elt) => {
      const changes  = this.arrObjDiffer[elt.id].diff(elt);
      if (changes) {
        this.detectChanges();
      }
    });
  }

  ngAfterViewChecked() {
    if (!this.surveySubscription) {
      this.zone.runOutsideAngular(() => {
        if (this.article && this.article.surveys) {
          this.surveySubscription = this.timerSurvey.subscribe(i => {
            this.isExpiredSurvey = this.article.surveys.closeDate < this.getCurrentTime();
            if (this.isExpiredSurvey) {
              this.zone.run(() => {
                this.detectChanges();
                this.removeTimer(this.surveySubscription);
              });
            }
          });
        }
      });
    }
  }

  checkSeenArticleEvent() {
    this.removeTimer(this.seenSubscription);
    this.zone.runOutsideAngular(() => {
      this.seenSubscription = Observable.timer(0, 100).subscribe(i => {
          const element = this._elementRef.nativeElement.querySelector('#' + this.article.id);
          if (!document.hidden && element) {
            if (navigator.onLine &&
              this.groupInfo.approvedMembers.findIndex(item => item.officeUserId === this.userSession.officeUserId) > -1) {
              if (this.helper.inViewport($('#' + this.article.id), this.inViewport)) {
                this.seenArticle();
                this.removeTimer(this.seenSubscription);
              }
            } else {
              // *** INTERNET_DISCONNECTED!
            }
          }
        });
    });
  }

  addCommentListener() {
    this.groupService.eventListener(`comment/${this.article.id}`).subscribe(v => {
      if (v.type === EventType.ChildRemoved) {
        // removed
        this.comments = this.comments.filter(comment => {
          return comment.id !== v.key;
        });
        this.detectChanges();
        delete this.arrObjDiffer[v.key];
        this.removeFavorite(v.key);
      } else if (v.type === EventType.ChildAdd) {
        // added
        this.groupService.getComment(this.article.id, v.key).subscribe(comment => {
          if (comment) {
            comment['isEdit'] = false;
            this.arrObjDiffer[comment.id] = this.differs.find(comment).create(null);
            this.comments.push(comment);
            this.detectChanges();
          }
        });
      }
    });
  }

  getToUserList() {
    this.groupService.getUserList(this.article.toUser, this._listMemberInfo).subscribe(list => {
      this.toUserList = list;
    });
  }

  getContributorInfo() {
    this.groupService.getUserList([this.article.contributorId], this._listMemberInfo).subscribe(user => {
      this.contributorInfo = user[0];
      this.detectChanges();
    });
  }

  getConfirmedList() {
    this.groupService.getUserList(this.article.confirmed, this._listMemberInfo).subscribe(users => {
      this.confirmedList = users;
    });
  }

  getFirstConfirmation() {
    this.groupService.getFirstConfirmation(this.groupInfo.id, this.article.id, this._listMemberInfo).subscribe(user => {
      this.firstConfirmation = user;
    });
  }

  getSeenList() {
    const arr = this.article.seen.seen.concat(this.article.seen.unseen);
    this.groupService.getUserList(arr, this._listMemberInfo).subscribe(users => {
      this.seenUnseenList = users;
    });
  }

  getUnansweredList() {
    this.unansweredList = [];
    const unansweredRef = this.firebaseDatabase.ref(`unanswered/${this.article.id}`);
    unansweredRef.once(EventType.Value).then((snapshot) => {
      if (snapshot.hasChildren()) {
        snapshot.forEach(child => {
          this.unansweredList.push(child.key);
          return false;
        });
      }
    });
  }


  /**
   * get member group list
   */
  getMemberList() {
    this._listMemberInfo = [];
    this.groupService.getMembersInfo(this.groupInfo.id).subscribe(list => {
      this._listMemberInfo = list;
      this.getContributorInfo();
      this.getSeenList();
      this.getConfirmedList();
      this.getFirstConfirmation();
      this.getToUserList();
      this.detectChanges();
    });
    this.groupService.eventListener(`group/${this.groupInfo.id}/approvedMembers`).subscribe(v => {
      if (v.type === EventType.ChildRemoved) {
        // removed
        this._listMemberInfo = this._listMemberInfo.filter(user => user.id !== v.key);
        this._listMemberInfo = this._listMemberInfo.slice();
      } else if (v.type === EventType.ChildAdd) {
        // added
        this.groupService.getUser(v.key).subscribe(mem => {
          if (mem && this._listMemberInfo.findIndex(user => user.id === mem.id) < 0) {
            this._listMemberInfo.push(mem);
            this._listMemberInfo = this._listMemberInfo.slice();
          }
        });
      }
    });
  }

  clickReplyAll(ids: string[]) {
    this.replyList = ids;
  }

  // common: detailUser popup
  detailUserDialog(user: any) {
    const accountStatus = new AccountStatus(user.accountStatus);
    if ((accountStatus.isValid || accountStatus.isProvisional) && !accountStatus.isLocking && !accountStatus.isInvalid) {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      this.groupService.getDetailUser(user.id).subscribe(res => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showStaffDetailsDialog(null, {data: res, officeUserId: 'dr'});
      }, error => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      });
    } else if (accountStatus.isLocking && (accountStatus.isValid || accountStatus.isProvisional)) {
      let html = '';
      this.translate.get('MSG.GR.LOCKED_ACCOUNT_PROFILE_POPUP').subscribe(msg => {
        html = '<div><h1 class="font-weight-bold">' + msg.MSG_1 + '<br>' + msg.MSG_2 + '</h1></div><br><div>' + msg.MSG_3 + '</div><div>' + msg.MSG_4 + '</div>';
      });
      this.dialogService.showMessage('error', false, null, null, html, 'MSG.OK', null).subscribe();
    }
  }

  getDetailUser(event, user: any) {
    event.preventDefault();
    $('.tooltip').remove();
    this.detailUserDialog(user);
  }

  /**
   * click favorite article
   * @param event
   */
  onclickFavorite(event) {
    event.preventDefault();
    this.clickFavoriteDebounce();
  }

  updateFavorite() {
    $('.tooltip').remove();
    if (navigator.onLine) {
      this.groupService.updateFavorite(this.userSession.officeUserId, this.article.id, !this.isFavorited).subscribe();
    } else {
      this.dialogService.showError('MSG.GR.ERROR＿NETWORK');
    }
  }

  /**
   * click confirm article
   * @param event
   */
  onClickConfirmed(event) {
    event.preventDefault();
    this.clickConfirmDebounce();
  }

  updateConfirmedArticle() {
    if (navigator.onLine) {
      const confirmedRef = this.firebaseDatabase.ref(`article/${this.groupInfo.id}/${this.article.id}/confirmed`);
      if (this.article.confirmed && this.article.confirmed.indexOf(this.userSession.officeUserId) > -1) {
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
   * show popup users who viewed the article
   * @param event
   */
  displaySeen(event) {
    event.preventDefault();
    this.dialogService
      .showMemberListDialog(false, 'MSG.MEMBER_LIST.READ_TITLE', null, 'MSG.CLOSE',
        {groupId: 'groupId', userIds: this.article.seen, userInfo: this.seenUnseenList, mode: 'already', isShowOfficeName: this.isGroupOutside})
      .subscribe();
  }

  /**
   * @param event
   * @param article
   */
  editArticle(event) {
    event.preventDefault();
    $('.tooltip').remove();
    if (this.article.surveysFlag) {
      this.article.isEdit = this.getCurrentTime() < this.article.surveys.closeDate;
    } else {
      this.article.isEdit = true;
    }
  }

  showConfirmedModal(event) {
    this.dialogService
      .showMemberListDialog(false, 'MSG.CONFIRMED', null, 'MSG.CLOSE',
        {groupId: this.groupInfo.id, userIds: event, userInfo: this.confirmedList, isShowOfficeName: this.isGroupOutside, mode: 'confirmed'})
      .subscribe();
  }

  showToUserModal(event) {
    this.dialogService
      .showMemberListDialog(false, null, null, 'MSG.CLOSE', {
        groupId: this.groupInfo.id,
        userIds: event,
        userInfo: this.toUserList,
        isShowOfficeName: this.isGroupOutside
      })
      .subscribe();
  }

  showAnsweredModal(event, answered) {
    event.preventDefault();
    this.groupService.getUserList(answered, this._listMemberInfo).subscribe(list => {
      this.dialogService
        .showMemberListDialog(false, 'MEMBER_LIST.ANSWERED', null, 'MSG.CLOSE',
          {groupId: this.groupInfo.id, userIds: answered, userInfo: list, isShowOfficeName: this.isGroupOutside})
        .subscribe();
    }, error => {
      this.dialogService
        .showMemberListDialog(false, 'MEMBER_LIST.ANSWERED', null, 'MSG.CLOSE',
          {groupId: this.groupInfo.id, userIds: answered, userInfo: this._listMemberInfo, isShowOfficeName: this.isGroupOutside})
        .subscribe();
    });

  }

  showUnansweredModal(event) {
    event.preventDefault();
    this.dialogService
      .showMemberListDialog(false, 'MEMBER_LIST.UNANSWERED', null, 'MSG.CLOSE',
        {
          groupId: this.groupInfo.id,
          userIds: this.unansweredList,
          userInfo: this._listMemberInfo,
          isShowOfficeName: this.isGroupOutside,
          mode: 'unanswered'
        }).subscribe();
  }

  /**
   * seen article
   */
  seenArticle() {
    // setting path: article/groupId/articleId/seen/officeUserId => true
    const groupRef = this.firebaseDatabase.ref(`article/${this.groupInfo.id}`);
    groupRef.once(EventType.Value).then((snap) => {
      if (snap.hasChild(`${this.article.id}/contributorId`)) {
        groupRef.child(`${this.article.id}/seen/${this.userSession.officeUserId}`).set(true);
      }
    });

    /**
     * remove path:
     * user/officeUserId/groupInfo/groupId/unseen/articleId
     * user/officeUserId/groupInfo/groupId/unseenTo/article/articleId
     */
    const unseenRef = this.firebaseDatabase.ref(`user/${this.userSession.officeUserId}/groupInfo/${this.groupInfo.id}`);
    unseenRef.once(EventType.Value).then(snapshot => {
      if (snapshot.hasChild(`unseen/${this.article.id}`)) {
        unseenRef.child(`unseen/${this.article.id}`).remove();
      }
      if (snapshot.hasChild(`unseenTo/article/${this.article.id}`)) {
        unseenRef.child(`unseenTo/article/${this.article.id}`).remove();
      }
    });
  }

  removeFavorite(id) {
    const favorRef = this.firebaseDatabase.ref(`/user/${this.userSession.officeUserId}/favorite`);
    favorRef.once(EventType.Value).then(snapshot => {
      if (snapshot.hasChild(id)) {
        favorRef.child(id).remove();
      }
    });
  }


  /**
   * delete article
   * @param event
   */
  deleteArticle(event) {
    event.preventDefault();
    $('.tooltip').remove();
    let html = '';
    this.translate.get('MSG.GR').subscribe(msg => {
      html = '<div>' + msg.M004_1 + '</div><div>' + msg.M004_2 + '</div>';
    });
    this.dialogService.showMessage('warning', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
      (res: DialogResult) => {
        if (res.isOk()) {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(true);
          });
          this.groupService.deleteArticle(this.article.id).subscribe(status => {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(false);
            });
            this.removeFavorite(this.article.id);
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

  /**
   * respond to survey
   * @param choice
   * @param event
   */
  answerSurvey(choice, event) {
    if (navigator.onLine) {
      if (this.article.surveys.closeDate > new Date().getTime()) {
        this.groupService.answerSurvey(this.article, choice, this.userSession.officeUserId).subscribe();
      }
    } else {
      event.target.checked = choice.answered.indexOf(this.userSession.officeUserId) > -1;
      this.dialogService.showError('MSG.GR.ERROR＿NETWORK');
    }
  }

  redirectGroupTimeline(event) {
    event.preventDefault();
    if (this.groupInfo) {
      this.route.navigate(['gr/gr0011', this.groupInfo.id]);
    }
  }

  getTooltipTitle(userInfo: any) {
    if (userInfo) {
      const suffix = this.isGroupOutside ?  userInfo.officeName : userInfo.deptName;
      return (suffix === '' ) ? userInfo.fullName : (userInfo.fullName + '/' + suffix);
    }
  }

  getCurrentTime() {
    return new Date().getTime();
  }

  attachedLists(list) {
    if (list) {
      this.listAttachments = list;
    }
  }

  checkCommentRendered(event) {
    if (event && this._inputOptions.focusedComment) {
      const config: ScrollToConfigOptions = {
        target: 'focus-' + this._inputOptions.focusedComment,
        duration: 1000,
        easing: 'easeOutCubic'
      };
      this._scrollToService.scrollTo(config).subscribe(res => {
        this._inputOptions.focusedComment = null;
      });
    }
  }

  commentTrackByFn(index: number, comment: any) {
    return comment.id;
  }
}
