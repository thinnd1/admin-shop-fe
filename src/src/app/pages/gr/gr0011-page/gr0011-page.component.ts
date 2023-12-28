import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {GroupService} from '../../../services/group.service';
import {FirebaseDatabase} from '../../../services/firebase/firebase.database';
import {ActivatedRoute, Params} from '@angular/router';
import {SharedValueService} from '../../../services/shared-value.service';
import {Router} from '@angular/router';
import {HttpError} from '../../../common/error/http.error';
import {DialogResult} from '../../../models/dialog-param';
import {Helper} from '../../../common/helper';
import {GroupOutsideSaveResult} from '../../../models/gr/group-outside-save-result';
import EventType = FirebaseDatabase.EventType;
import {FirGroup, FirGroupMember, GroupType} from '../../../models/gr/firebase/fir.group';
import {DialogService} from '../../../services/dialog.service';
import {Subscription} from 'rxjs/Subscription';
import {Title} from '@angular/platform-browser';
import {CsvFormat} from '../../../models/gr/csv-format';
import {Angular2Csv} from 'angular2-csv/Angular2-csv';
import * as moment from 'moment';
import {TranslateService} from '@ngx-translate/core';

declare const $: any;

@Component({
  selector: 'app-gr0011-page',
  templateUrl: './gr0011-page.component.html',
  styleUrls: ['./gr0011-page.component.scss'],
  preserveWhitespaces: false
})
export class Gr0011PageComponent implements OnInit, OnDestroy, AfterViewInit {
  groupId;
  groupInfo = new FirGroup();
  listMemberInfo = []; // approvedMember
  listArticles = [];
  currentDateTime;
  userSession;
  isAdmin: boolean;
  disabledAllSeen: boolean;
  // default
  notificationSoundFlag = true;
  notificationMailFlag = true;
  // scroll
  isLoading = true;
  infiniteScrollHeight: string;
  infiniteScrollOptions: any = {
    page: 1,
    height: 0,
    size: 10
  };
  articleSubscription: Subscription;
  memberListSubscription: Subscription;
  favoriteListSubscription: Subscription;
  listFavorites = [];
  isGroupOfficial: boolean;
  isSelfLeft = false;
  lastLoad = false;
  unseenTo: any;
  modelCSV: CsvFormat[] = [];

  /**
   * 結果が無い場合のイラストの表示フラグ
   */
  public _displayHasntIllust = false;

  constructor(private groupService: GroupService,
              private dialogService: DialogService,
              private firebaseDatabase: FirebaseDatabase,
              private activatedRoute: ActivatedRoute,
              private route: Router,
              private sharedValueService: SharedValueService,
              private titleService: Title,
              private helper: Helper,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    this.activatedRoute.params.subscribe((params: Params) => {
      this.helper.setScrollTop();
      (<any>$('#theModal')).modal('hide');
      this.groupId = params['groupId'];
      this.listArticles = [];
      this.listMemberInfo = [];
      this.listFavorites = [];
      this.lastLoad = false;
      this.currentDateTime = new Date();
      this.getInitGroupData();
    });
  }

  ngAfterViewInit() {
    $('[data-toggle="tooltip"]').tooltip({animation: false});
  }

  ngOnDestroy(): void {
    this.listArticles = [];
    this.listMemberInfo = [];
    this.listFavorites = [];
    if (this.articleSubscription) {
      this.articleSubscription.unsubscribe();
    }
    if (this.memberListSubscription) {
      this.memberListSubscription.unsubscribe();
    }
    if (this.favoriteListSubscription) {
      this.favoriteListSubscription.unsubscribe();
    }
    this.groupService.clearScreenRelatedReferences();
  }

  showLoading(flag: boolean) {
    setTimeout(() => {
      if (!this.listArticles.length) {
        this.dialogService.setLoaderVisible(flag);
        this.isLoading = true;
      } else {
        this.dialogService.setLoaderVisible(false);
        this.isLoading = !flag;
      }
    });
  }

  getInitGroupData() {
    this.showLoading(true);
    this.groupService.getGroup(this.groupId).subscribe((response) => {
      if (response && response.approvedMembers.findIndex((mem) => mem.officeUserId === this.userSession.officeUserId) > -1) {
        this.groupInfo = response;
        this.isGroupOfficial = this.groupInfo.type === GroupType.Official;
        this.groupSetting();
        this.getMemberList();
        this.getArticleList();
        this.getListFavorite();
        this.getUnseenTo();
        this.titleService.setTitle(this.groupInfo.name);
        this.infiniteScrollHeight = (this.infiniteScrollOptions.height) ? this.infiniteScrollOptions.height + 'px' : 'auto';
      } else {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
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
  }

  groupSetting() {
    this.groupService.getMemberInfo(this.groupId, this.userSession.officeUserId).subscribe(value => {
      this.isAdmin = value.authority === FirGroupMember.Authority.Admin;
      this.notificationSoundFlag = value.notificationSoundFlag;
      this.notificationMailFlag = value.notificationMailFlag;
    });
    const unseenRef = this.firebaseDatabase.ref(`user/${this.userSession.officeUserId}/groupInfo/${this.groupId}/unseen`);
    let numChildren = 0;
    unseenRef.once(EventType.Value).then(snap => {
      this.disabledAllSeen = numChildren <= 0;
    });
    unseenRef.on(EventType.ChildAdd, ref => {
      numChildren++;
      this.disabledAllSeen = numChildren <= 0;
    });
    unseenRef.on(EventType.ChildRemoved, ref => {
      numChildren--;
      this.disabledAllSeen = numChildren <= 0;
    });
  }

  getListFavorite() {
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

  /**
   * get member group list
   */
  getMemberList() {
    this.memberListSubscription = this.groupService.getMembersInfo(this.groupId).subscribe(list => {
      this.listMemberInfo = list;
    });
    this.groupService.eventListener(`group/${this.groupId}/approvedMembers`).subscribe(v => {
      if (v.type === EventType.ChildRemoved) {
        // removed
        this.listMemberInfo = this.listMemberInfo.filter(user => user.id !== v.key);
        this.listMemberInfo = this.listMemberInfo.slice();
        if (this.userSession.officeUserId === v.key && !this.isSelfLeft) {
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
          if (mem && this.listMemberInfo.findIndex(user => user.id === mem.id) < 0) {
            this.listMemberInfo.push(mem);
            this.listMemberInfo = this.helper.sort('fullNameKana', this.listMemberInfo);
            this.listMemberInfo = this.listMemberInfo.slice();
          }
        });
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

  /**
   * get article list
   */
  getArticleList(fromArticleId?: string) {
    this.articleSubscription = this.groupService.getArticleList(this.groupId, fromArticleId).subscribe((data) => {
      this.showLoading(false);
      if (data.length < this.infiniteScrollOptions.size) {
        this.lastLoad = true;
      }
      data.forEach(article => {
        article['isEdit'] = false;
        this.listArticles.push(article);
      });
      
      this._displayHasntIllust = this.listArticles && this.listArticles.length ? false : true; // リストが無ければイラストを表示 
    }, error => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
    });

    this.groupService.addArticleADListener(this.groupId).subscribe(v => {
      if (v.type === EventType.ChildRemoved) {
        // removed
        this.listArticles = this.listArticles.filter(article => {
          return article.id !== v.id;
        });
      } else if (v.type === EventType.ChildAdd) {
        // added
        this.groupService.getArticle(this.groupId, v.id).subscribe(article => {
          if (article && this.listArticles.findIndex(art => art.id === article.id) < 0) {
            this.listArticles.unshift(article);
          }
        });
      }
    });
  }

  /**
   *
   */
  onScrollDown() {
    if (this.lastLoad) {
      return false;
    }
    if (!this.listArticles.length) {
      return false;
    }
    this.showLoading(true);
    const start = this.listArticles[this.listArticles.length - 1].id;
    this.infiniteScrollOptions.page += 1;
    this.getArticleList(start);
  }

  /**
   * show attached files popup
   * @param event
   */
  attachedFilesPopup(event) {
    event.preventDefault();
    this.dialogService
      .showAttachedFilesDialog({officeUserId: this.userSession.officeUserId, groupId: this.groupId, roomId: null, memberList: this.listMemberInfo})
      .subscribe();
  }

/**-----------------------------------------GR0011-0-------------------------------------------**/
  allSeen(event) {
    event.preventDefault();
    if (navigator.onLine) {
      if (!this.disabledAllSeen) {
        const unseenComment = [];
        const unseenArticle = [];

        const unseenRef = this.firebaseDatabase.ref(`user/${this.userSession.officeUserId}/groupInfo/${this.groupId}/unseen`);
        unseenRef.once(EventType.Value).then((snapshot) => {
          if (snapshot.hasChildren()) {
            snapshot.forEach(child => {
              if (child.val() === true) {
                if (unseenArticle.indexOf(child.key) === -1) {
                  unseenArticle.push(child.key);
                }
              } else {
                if (unseenArticle.indexOf(child.key) === -1) {
                  unseenComment.push({articleId: child.val(), commentId: child.key});
                }
              }
            });
          }
        });

        const articleRef = this.firebaseDatabase.ref(`article/${this.groupId}`);
        articleRef.once(EventType.Value).then((snap) => {
          for (let i = 0; i < unseenArticle.length; i++) {
            if (snap.hasChildren() && snap.hasChild(unseenArticle[i])) {
              articleRef.child(`${unseenArticle[i]}/seen/${this.userSession.officeUserId}`).set(true);
            }
          }
        });

        const commentRef = this.firebaseDatabase.ref(`comment`);
        commentRef.once(EventType.Value).then(snapshot => {
          if (snapshot.hasChildren()) {
            for (let j = 0; j < unseenComment.length; j++) {
              if (snapshot.hasChild(unseenComment[j].articleId)) {
                commentRef.child(`${unseenComment[j].articleId}/${unseenComment[j].commentId}/seen/${this.userSession.officeUserId}`).set(true);
              }
            }
          }
        });

        this.firebaseDatabase.ref('/user/' + this.userSession.officeUserId + '/groupInfo/' + this.groupId + '/unseenTo').remove();
        this.firebaseDatabase.ref('/user/' + this.userSession.officeUserId + '/groupInfo/' + this.groupId + '/unseen').remove();
        this.disabledAllSeen = true;
      }
    } else {
      this.dialogService.showError('MSG.GR.ERROR＿NETWORK');
    }
  }

  /**
   * go to the edit group screen
   * @param event
   */
  redirectEditGroup(event) {
    event.preventDefault();
    $('.tooltip').remove();
    if (this.groupInfo.type === GroupType.Outside) {
      this.route.navigate(['gr/gr0007/', this.groupId]);
    } else if (this.groupInfo.type === GroupType.Inside && !this.groupInfo.deptGroupFlag) {
      this.route.navigate(['gr/gr0004/', this.groupId]);
    } else if (this.groupInfo.deptGroupFlag) {
      this.route.navigate(['gr/gr0005/', this.groupId]);
    }
  }

  csvDownload(event) {
    this.modelCSV = [];
    let html = '';
    this.translate.get('MSG.GR.MSG_CSV_POPUP').subscribe(msg => {
      html = '<div><h3>' + msg.P001 + '</h3></div><div>' +  msg.P002 + '</div><div class="text-danger">' + msg.P003 + '</div>';
    });
    if (this.listArticles.length > 0) {
      this.dialogService.showMessage('warning', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
        (response: DialogResult) => {
          if (response.isOk()) {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(true);
            });
            this.groupService.getDownloadCSV(this.groupId).subscribe(res => {
              this.modelCSV = res;
              this.exportCSVTimeline();
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
            }, error => {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
              this.dialogService.showError('MSG.ERROR');
            });
          }
        });
    } else {
      this.dialogService.showMessage('warning', false, null, 'MSG.GR.CSV_MSG_NO_ARTICLES', null, 'MSG.OK', null);
    }
  }

  exportCSVTimeline() {
    const header = [];
    this.translate.get('MSG.GR.CSV_HEADER').subscribe(messages => {
      header.push(messages.H001);
      header.push(messages.H002);
      header.push(messages.H003);
      header.push(messages.H004);
    });
    const title = this.groupInfo.name;
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: false,
      headers: header
    };
    const dataList = [];
    for (let i = 0; i < this.modelCSV.length; i++) {
      const data = [];
      const seen = [];
      const unseen = [];
      data['created'] = moment(this.modelCSV[i].created).format('YYYY/MM/DD HH:mm');
      data['creator'] = this.modelCSV[i].creator;
      for (let n = 0; n < this.modelCSV[i].seen.length; n++) {
        seen.push(this.modelCSV[i].seen[n]['lastName'] + ' ' + this.modelCSV[i].seen[n]['firstName']);
      }
      for (let p = 0; p < this.modelCSV[i].unseen.length; p++) {
        unseen.push(this.modelCSV[i].unseen[p]['lastName'] + ' ' + this.modelCSV[i].unseen[p]['firstName']);
      }
      data['seen'] = seen.toString();
      data['unseen'] = unseen.toString();
      dataList.push(data);
    }
    new Angular2Csv(dataList, title, options);
  }

  notificationSound(event) {
    if (navigator.onLine) {
      this.firebaseDatabase.ref(`/member/${this.groupId}/${this.userSession.officeUserId}/notificationSoundFlag`).set(event);
      this.notificationSoundFlag = event;
    } else {
      this.dialogService.showError('MSG.GR.ERROR＿NETWORK');
    }
  }

  notificationMail(event) {
    if (navigator.onLine) {
      this.firebaseDatabase.ref(`/member/${this.groupId}/${this.userSession.officeUserId}/notificationMailFlag`).set(event);
      this.notificationMailFlag = event;
    } else {
      this.dialogService.showError('MSG.GR.ERROR＿NETWORK');
    }
  }

  leaveGroup(event) {
    event.preventDefault();
    this.dialogService.showMessage('warning', false, null, 'MSG.GR.M002', null, 'MSG.YES', 'MSG.NO').subscribe(
      (res: DialogResult) => {
        setTimeout(() => {
          if (res.isOk()) {
            this.isSelfLeft = true;
            setTimeout(() => {
              this.dialogService.setLoaderVisible(true);
            });
            this.groupService.leaveGroup(this.groupId).subscribe(
              (response: GroupOutsideSaveResult) => {
                setTimeout(() => {
                  this.dialogService.setLoaderVisible(false);
                });
                this.dialogService.showMessage('success', false, null, 'MSG.GR.M003', null, 'MSG.OK', null).subscribe(
                  (result: DialogResult) => {
                    if (result.isOk()) {
                      this.route.navigateByUrl('/');
                    }
                  });
              }, (error: HttpError) => {
                this.isSelfLeft = false;
                setTimeout(() => {
                  this.dialogService.setLoaderVisible(false);
                });
                if (error.contains('GR.M014')) {
                  this.dialogService.showError('MSG.GR.M014');
                } else {
                  this.dialogService.showError('MSG.ERROR');
                }
              });
          }
        }, 400);
      });
  }

  articleTrackByFn(index: number, article: any) {
    return article.id;
  }
}
