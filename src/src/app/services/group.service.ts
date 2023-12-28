import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {Http, Response, ResponseContentType, RequestOptions, Headers, URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {CreateHospitalGroupSettings} from '../models/gr/create-hospital-group-settings';
import {CreateHospitalGroupSettingsSendApi} from '../models/gr/create-hospital-group-settings-send-api';
import {CreateDepartmentGroupSettingsSaveResults} from '../models/gr/create-department-group-settings-save-results';
import {PrepareCreateOutsideGroupSetting} from '../models/gr/prepare-create-outside-group-settings';
import {DepartmentUserSettings} from '../models/gr/department-user-settings';
import {CreateOutsideGroupSettingSaveResult} from '../models/gr/create-outside-group-settings-save-result';
import {EditGroupOutsideSetting} from '../models/gr/edit-group-outside-settings';
import {GroupOutsideSaveResult} from '../models/gr/group-outside-save-result';
import {GroupOutsidePrepareJoinSetting} from '../models/gr/group-outside-prepare-join-settings';
import {CreateOutsideGroupSetting} from '../models/gr/create-outside-group-settings';
import {CreateDepartmentGroupSettings} from '../models/gr/create-department-group-settings';
import {CreateDepartmentGroupSettingsSendApi} from '../models/gr/create-department-group-settings-send-api';
import {CreateHospitalGroupSettingsSaveResults} from '../models/gr/create-hospital-group-settings-save-results';
import {EditHospitalGroupSettings} from '../models/gr/edit-hospital-group-settings';
import {EditHospitalGroupSettingsSaveResults} from '../models/gr/edit-hospital-group-settings-save-results';
import {EditDepartmentGroupSettingsSaveResults} from '../models/gr/edit-department-group-settings-save-results';
import {CreatePollSurveySettings} from '../models/gr/create-poll-survey-settings';
import {CreatePollSurveySettingsSaveResults} from '../models/gr/create-poll-survey-settings-save-results';
import {EditPollSurveySettingsSaveResults} from '../models/gr/edit-poll-survey-settings-save-results';
import {EditDepartmentGroupSettingsSendApi} from '../models/gr/edit-department-group-settings-send-api';
import * as firebase from 'firebase/app';
import {FirebaseDatabase} from './firebase/firebase.database';
import {NGXLogger} from 'ngx-logger';
import {FirArticle, FirChoice, FirSurveys} from '../models/gr/firebase/fir.article';
import {SharedValueService} from './shared-value.service';
import {FirGroupTopics, FirUnseenTo} from '../models/gr/firebase/fir.group.topics';
import Reference = firebase.database.Reference;
import DataSnapshot = firebase.database.DataSnapshot;
import EventType = FirebaseDatabase.EventType;
import {FirGroup, FirGroupMember, GroupType} from '../models/gr/firebase/fir.group';
import {FirUser} from '../models/gr/firebase/fir.user';
import {CommentArticleSetting} from '../models/gr/comment-article-settings';
import {CommentArticleSettingResult} from '../models/gr/comment-article-setting-result';
import {CreateArticleSettingResults} from '../models/gr/create-article-setting-results';
import {JsonConvert} from 'json2typescript';
import {FirComment} from '../models/gr/firebase/fir.comment';
import {FirAttachments, FirFile, Priority} from '../models/gr/firebase/fir.attachments';
import {FirebaseStorage} from './firebase/firebase.storage';
import {EditDepartmentGroupSettings} from '../models/gr/edit-department-group-settings';
import {OfficeOutsideUser} from '../models/gr/office-outside-user';
import {EditPollSurveySettings} from '../models/gr/edit-poll-survey-settings';
import {Helper} from '../common/helper';
import { Subject } from 'rxjs/Subject';
import {DetailUser} from '../models/re/staff-list-settings';
import {AccountStatus} from '../models/ba/user-session';
import {TranslateService} from "@ngx-translate/core";
import {FileTransfer} from '../models/gr/fileTransfer';
import {FirBase} from "../models/ch/firebase/fir.base";


/**
 * グループに関わる機能を提供するクラス.
 */
@Injectable()
export class GroupService implements OnInit, OnDestroy {

  // Variables.
  // --------------------------------------------------------------------------
  private screenRelatedReferences: Reference[] = [];

  private _detailUsersCash = {};


  // Static helper methods.
  // --------------------------------------------------------------------------
  static sortGroups(array: FirGroupTopics[]): FirGroupTopics[] {
    if (0 < array.length) {
      array.sort((a, b) => {
        let diff = b.countUnseenTo() - a.countUnseenTo();
        if (diff === 0) {
          diff = b.countUnseen() - a.countUnseen();
          if (diff === 0 && a.group && b.group) {
            return b.group.updatedAt - a.group.updatedAt;
          }
        }
        return diff;
      });
    }
    return array;
  }

  // calculate survey's graph
  static calculatePercent(listChoice: FirChoice[]): any[] {
    if (listChoice.length > 0) {
      const _max = listChoice.reduce((max, p) => p.answered.length > max ? p.answered.length : max, listChoice[0].answered.length);
      const result = listChoice.map(k => {
        return (_max > 0 ? (100 * k.answered.length / _max).toFixed(2) : 0);
      });
      return result;
    }
  }

  static getDisplayPriority(type: string) {
    if (type.startsWith('image')) {
      return Priority.IMAGE;
    } else if (type.startsWith('video')) {
      return Priority.VIDEO;
    } else if (type.startsWith('audio')) {
      return Priority.AUDIO;
    } else {
      return Priority.OTHER_FILES;
    }
  }

  // Constructor.
  // --------------------------------------------------------------------------
  constructor(private http: Http,
              private database: FirebaseDatabase,
              private storage: FirebaseStorage,
              private shared: SharedValueService,
              private logger: NGXLogger,
              private helper: Helper,
              private translate: TranslateService) {
  }


  // Init.
  // --------------------------------------------------------------------------
  ngOnInit(): void {
  }


  // Destroy.
  // --------------------------------------------------------------------------
  ngOnDestroy(): void {
  }


  // Firebase.
  // --------------------------------------------------------------------------
  clearScreenRelatedReferences(): void {
    this.logger.debug('*** Clear screen related reference on GroupService');

    this.screenRelatedReferences.forEach(ref => {
      ref.off();
    });
  }

  /*-----------------------------------------------GROUP 11-----------------------------------------------*/

  convertUserInfo(user: any) {
    const isInvalid = new AccountStatus(user.accountStatus).isInvalid;
    const isLocking = new AccountStatus(user.accountStatus).isLocking && new AccountStatus(user.accountStatus).isValid;
    const defaultName = this.translate.instant('MSG.GR.DEFAULT_NAME_DELETED_ACCOUNT');
    return {
      id: user.id,
      fullName: isInvalid ? defaultName : (user.lastName + ' ' + user.firstName),
      fullNameKana: isInvalid ? '' : (user.lastNameKana + ' ' + user.firstNameKana),
      officeName: user.officeName ? user.officeName : '',
      deptId: user.deptId,
      deptName: user.deptName ? user.deptName : '',
      imageUrl: isInvalid ? '' : user.imageUrl,
      accountStatus: user.accountStatus,
      invalid: isInvalid,
      isLocking: isLocking
    };
  }

  // sort by file type & createdAt
  comparatorAttachment(array: FirAttachments[]): FirAttachments[] {
    if (array.length > 0) {
      return array.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    }
  }

  private convertAttachedFile(firebaseKey: string, originalId: string, file: any): any {
    const originalType = file.customMetadata.original_file_type ? file.customMetadata.original_file_type : file.contentType;
    return {
      fileId: file.name,
      name: file.customMetadata.name,
      size: file.size,
      type: file.contentType,
      original_file_id: originalId,
      original_file_type: file.customMetadata.original_file_type || null,
      createdAt: file.timeCreated,
      owner: file.customMetadata.owner,
      url: file.downloadURL,
      height: file.customMetadata.height,
      width: file.customMetadata.width,
      key: firebaseKey,
      priority: GroupService.getDisplayPriority(originalType)
    };
  }
  /**
   * 指定されたグループ情報を取得する.
   *
   * @param {string} groupId グループID
   * @returns {Observable<FirGroup>}
   */
  getGroup(groupId: string): Observable<FirGroup> {
    return Observable.create(subscriber => {
      const groupRef = this.database.ref(`group/${groupId}`);
      this.database.fetchOne(FirGroup, `group/${groupId}`).subscribe(data => {
        if (data) {
          groupRef.on(EventType.ChildChanged, ref => {
            data.updateData(ref.key, ref.val());
          });
          this.screenRelatedReferences.push(groupRef);
          subscriber.next(data);
          subscriber.complete();
        } else {
          subscriber.next(null);
          subscriber.complete();
        }
      }, error => {
        subscriber.error(error);
      });
    });
  }

  public testFunc(): Observable<Object> {
    return Observable.create(observer => {
      this.database.ref("/group/-L0caDykX-CEBLTzXE_l").once("value",
        (snapshot) => {
          if (snapshot) {
            let v = snapshot.val();
            console.log("snapshot", v ? v : "");
            snapshot.key;
            v.name;
          }
          observer.next(snapshot.val());
          observer.complete();
        }
      );

      // let ref = this.database.ref("/group/");
      // ref.push({ "name": "name 2" });
    });
  }

  /**
   * 記事情報を10件毎に取得する.
   *
   * @param {string} groupId グループID
   * @param {string} fromArticleId 最後に取得した最古の記事ID
   * @returns {Observable<FirArticle[]>}
   */

  getArticles(groupId: string, fromArticleId?: string): Observable<FirArticle[]> {
    return Observable.create(subscriber => {
      // path
      const path = `article/${groupId}`;
      // fetch data
      this.database.pagerLastAt(FirArticle, path, fromArticleId).subscribe(data => {
        // event listen
        data.forEach(v => {
          const reference = this.database.ref(`article/${groupId}/${v.id}`);
          reference.on(EventType.ChildChanged, ref => {
            v.updateData(ref.key, ref.val());
          });
          this.screenRelatedReferences.push(reference);
        });
        subscriber.next(data);
        subscriber.complete();
      }, error => {
        subscriber.error(error);
      });
    });
  }

  /**
   * グループメンバーを取得する.
   *
   * @param {string} groupId グループID
   * @returns {Observable<any>}
   */
  getMembersInfo(groupId: string): Observable<any[]> {
    return Observable.create(observe => {
      this.getGroup(groupId).subscribe(gr => {
        if (gr) {
          const listMember: Observable<any>[] = gr.approvedMembers.map(user => {
            return Observable.create(subscribe => {
              // get user info
              this.database.fetchOne(FirUser, `user/${user.officeUserId}/userInfo`).subscribe(data => {
                if (data) {
                  data.id = user.officeUserId;
                  subscribe.next(this.convertUserInfo(data));
                  subscribe.complete();
                } else {
                  subscribe.next(null);
                  subscribe.complete();
                }
              });
            });
          });
          Observable.forkJoin(listMember).subscribe((array) => {
            array = array.filter(item => item !== null);
            observe.next(this.helper.sort('fullNameKana', array));
            observe.complete();
          }, error => {
            observe.error(error);
          });
        }
      }, error => {
        observe.error(error);
      });
    });
  }

  /**
   * @param {string[]} idList
   * @param {any[]} infos
   * @returns {Observable<any[]>}
   */
  getUserList(idList: string[], infos: any[]): Observable<any[]> {
    return Observable.create(subscriber => {
      if (idList.length > 0 && infos.length > 0) {
        const userList: Observable<any>[] = idList.map(id => {
          return Observable.create(observe => {
            if (infos.findIndex(item => item.id === id) > -1) {
              observe.next(infos.find(item => item.id === id));
              observe.complete();
            } else {
              this.getUser(id).subscribe(data => {
                observe.next(data);
                observe.complete();
              });
            }
          });
        });
        Observable.forkJoin(userList).subscribe((array) => {
          array = array.filter(item => item !== null);
          subscriber.next(this.helper.sort('fullNameKana', array));
          subscriber.complete();
        }, error => {
          subscriber.error(error);
        });
      }
    });
  }

  getUser(officeUserId: string): Observable<any> {
    const path = `user/${officeUserId}/userInfo`;
    return Observable.create(subscriber => {
      const infoRef = this.database.ref(path);
      infoRef.once(EventType.Value).then(snapshot => {
        this.database.fetchOne(FirUser, path).subscribe(info => {
          if (info) {
            info.id = officeUserId;
            subscriber.next(this.convertUserInfo(info));
            subscriber.complete();
          } else {
            subscriber.next(null);
            subscriber.complete();
          }
        }, error => {
          subscriber.error(error);
        });
      });
    });
  }

  /**
   * @param {string} groupId
   * @param {string} officeUserId
   * @returns {Observable<any>}
   */
  getMemberInfo(groupId: string, officeUserId: string): Observable<any> {
    return Observable.create(observe => {
      this.database.fetchOne(FirGroupMember, `member/${groupId}/${officeUserId}`).subscribe(member => {
        observe.next(member);
        observe.complete();
      }, error => {
        observe.error(error);
      });
    });
  }

  getFirstConfirmation(groupId: string, articleId: string, infos: any[]): Observable<any> {
    return Observable.create(subscriber => {
      const path = `article/${groupId}/${articleId}/confirmed`;
      const confirmedRef = this.database.ref(path);
      confirmedRef.orderByKey().limitToFirst(1).on(EventType.ChildAdd, (snap) => {
        if (infos.findIndex(item => item.id === snap.val()) > -1) {
          subscriber.next(infos.find(item => item.id === snap.val()));
        } else {
          this.getUser(snap.val()).subscribe(data => {
            subscriber.next(data);
          });
        }
      });
    });
  }
  /**
   * get list of articles from a group
   * @param {string} groupId
   * @param {string} fromArticleId
   * @returns {Observable<FirArticle[]>}
   */
  getArticleList(groupId: string, fromArticleId?: string): Observable<FirArticle[]> {
    return new Observable(subscriber => {
      this.database.pagerLastAt(FirArticle, `/article/${groupId}`, fromArticleId).subscribe((articles) => {
        if (articles.length === 0) {
          subscriber.next([]);
          return subscriber.complete();
        }
        // list Articles
        const arr = articles.filter(item => item.contributorId);
        const article: Observable<FirArticle>[] = arr.map((data) => {
          return Observable.create(subscribe => {
            this.getCommentAndSurveyInfo(data).subscribe(list => {
              list.forEach(item => {
                if (item instanceof FirSurveys) {
                  data.surveys = item;
                }
                if (item && item.length > 0 && item[0] instanceof FirComment) {
                  data.listComments = item;
                }
              });
              subscribe.next(data);
              subscribe.complete();
            });
          });
        });
        Observable.forkJoin(article).subscribe(array => {
          subscriber.next(array);
          subscriber.complete();
        });

      }, error => {
        subscriber.error(error);
      });
    });
  }

  getCommentAndSurveyInfo(article: FirArticle): Observable<any> {
    return Observable.create(subscriber => {
      Observable.forkJoin(
        this.getSurveyInfo(article),
        this.getComments(article.id)
      ).subscribe(data => {
        subscriber.next(data);
      }, error => {
        subscriber.error(error);
      }, () => {
        subscriber.complete();
      });
    });
  }

  /**
   * get survey information
   * @param {FirArticle} article
   * @returns {Observable<any>}
   */
  getSurveyInfo(article: FirArticle): Observable<any> {
    return Observable.create(subscriber => {
      if (article.surveysFlag) {
        this.database.fetchOne(FirSurveys, `surveys/${article.id}`).subscribe(value => {
          this.getSurveyChoices(article.id).subscribe(choices => {
            if (choices) {
              value.choices = choices;
              value['percent'] = GroupService.calculatePercent(choices);

              // event listen
              const surveyRef = this.database.ref(`surveys/${article.id}`);
              surveyRef.on(EventType.ChildChanged, ref => {
                value.updateData(ref.key, ref.val());
                value['percent'] = GroupService.calculatePercent(choices);
              });
              this.screenRelatedReferences.push(surveyRef);

              subscriber.next(value);
              subscriber.complete();
            }
          });
        }, error => {
          subscriber.error(error);
        });
      } else {
        subscriber.next();
        subscriber.complete();
      }
    });
  }

  /**
   * get choices information
   * @param {string} articleId
   * @returns {Observable<any[]>}
   */
  getSurveyChoices(articleId: string): Observable<any[]> {
    return Observable.create(subscriber => {
      const arrChoice = [];
      this.database.fetch(FirChoice, `surveys/${articleId}/choices`).subscribe(choices => {
        choices.map(choice => {
          const path = `surveys/${articleId}/choices/${choice.id}`;
          const choiceRef = this.database.ref(path);
          this.onChildEventListener(choice, choiceRef, path);
          arrChoice.push(choice);
        });
        subscriber.next(arrChoice);
        subscriber.complete();
      }, error => {
        subscriber.error(error);
        subscriber.complete();
      });
    });
  }

  /**
   * 記事情報を取得する.
   *
   * @param {string} groupId
   * @param {string} articleId
   * @param {boolean} withChangedEvent
   * @returns {Observable<FirArticle>}
   */
  getArticle(groupId: string, articleId: string, withChangedEvent = true): Observable<FirArticle> {
    const path = `article/${groupId}/${articleId}`;
    if (!withChangedEvent) {
      return this.database.fetchOne(FirArticle, path);
    }

    return Observable.create(subscriber => {
      const reference = this.database.ref(path);
      reference.once(EventType.Value).then(snapshot => {
        let data = new FirArticle();
        if (snapshot.hasChildren()) {
          data = new JsonConvert().deserialize(snapshot.val(), FirArticle);
          data.id = snapshot.key;
          if (data.surveysFlag) {
            this.getSurveyInfo(data).subscribe(survey => {
              data.surveys = survey;
            });
          }
          subscriber.next(data);
          subscriber.complete();
        }
      }, error => {
        subscriber.error(error);
      });
    });
  }

  /**
   * get article detail
   * @param {string} groupId
   * @param {string} articleId
   * @returns {Observable<any>}
   */
  getArticleDetail(groupId: string, articleId: string): Observable<any> {
    return Observable.create(subscriber => {
      Observable.forkJoin(
        this.getArticle(groupId, articleId),
        this.getComments(articleId)
      ).subscribe(list => {
        const data = {};
        data['comments'] = [];
        list.forEach(item => {
          if (item instanceof FirArticle) {
            data['article'] = item;
          } else if (item && item.length > 0 && item[0] instanceof FirComment) {
            data['comments'] = item;
          }
        });
        subscriber.next(data);
      }, error => {
        subscriber.error(error);
      }, () => {
        subscriber.complete();
      });
    });
  }

  /**
   * @param {string} articleId
   * @returns {Observable<FirComment[]>}
   */
  getComments(articleId: string): Observable<FirComment[]> {
    return Observable.create(observe => {
      this.database.fetch(FirComment, `comment/${articleId}`).subscribe(cmts => {
        if (cmts.length === 0) {
          observe.next([]);
          return observe.complete();
        }
        const arr = cmts.filter(item => item.contributorId);
        const listObs: Observable<FirComment>[] = arr.map(comment => {
          return Observable.create(subscribe => {
            subscribe.next(comment);
            subscribe.complete();
          });
        });
        Observable.forkJoin(listObs).subscribe(array => {
          observe.next(array);
          observe.complete();
        });
      }, error => {
        observe.error(error);
      });
    });
  }

  getComment(articleId: string, commentId: string, withChangedEvent = true): Observable<FirComment> {
    const path = `comment/${articleId}/${commentId}`;
    if (!withChangedEvent) {
      return this.database.fetchOne(FirComment, path);
    }
    return Observable.create(subscriber => {
      const reference = this.database.ref(path);
      reference.once(EventType.Value).then(snapshot => {
        let data = new FirComment();
        if (snapshot.hasChildren()) {
          data = new JsonConvert().deserialize(snapshot.val(), FirComment);
          data.id = snapshot.key;
          subscriber.next(data);
          subscriber.complete();
        }
      }, error => {
        subscriber.error(error);
      });
    });
  }

  paginationFilesList(path: string, isLast, fromKey: string, limit = 10): Observable<any[]> {
    return Observable.create(subscriber => {
      const ref = this.database.ref(path);
      let query = ref.orderByKey();
      if (fromKey) {
        query = query.endAt(fromKey);
      }
      query = query.limitToLast(fromKey ? limit + 1 : limit);
      query.once(EventType.Value).then((snapshot: DataSnapshot) => {
        const array: any[] = [];
        if (snapshot.hasChildren()) {
          snapshot.forEach(child => {
            if (fromKey && child.key === fromKey) {
              return false;
            }
            array.push({key: child.key, value: child.val()});
            return false;
          });
        }
        subscriber.next(isLast ? array.reverse() : array);
        subscriber.complete();
      }).catch(error => {
        this.logger.error(error);
        subscriber.error(error);
      });
    });
  }

  /**
   * get the attached files in an(a) article(comment)
   * @param {string} groupId
   * @param {string} path
   * @returns {Observable<FirAttachments[]>}
   */
  getAttachmentsList(groupId: string, path: string): Observable<FirAttachments[]> {
    return Observable.create(subscribe => {
      this.paginationFilesList(path, false, null, 10).subscribe(objs => {
        if (objs.length === 0) {
          subscribe.next([]);
          return subscribe.complete();
        }
        const arrAttachments: Observable<FirAttachments>[] = objs.map(data => {
          return Observable.create(observer => {
            // get image/video thumbnail
            this.storage.metadataGroup(groupId, 'thumb_' + data.value).subscribe( file => {
              observer.next(this.convertAttachedFile(data.key, data.value, file));
              observer.complete();
            }, error => {
              // get original file
              this.storage.metadataGroup(groupId, data.value).subscribe(originalFile => {
                observer.next(this.convertAttachedFile(data.key, null, originalFile));
                observer.complete();
              }, err => {
                observer.error(err);
              });
            });
          });
        });
        Observable.forkJoin(arrAttachments).subscribe(array => {
          const arr = this.comparatorAttachment(array);
          subscribe.next(arr);
          subscribe.complete();
        }, error => {
          subscribe.error(error);
        });
      });
    });
  }

  /**
   * get the attached files in a group
   * @param {string} groupId
   * @param {string} path
   * @param {boolean} isLast
   * @param {string} fromKey
   * @param {number} limit
   * @returns {Observable<FirAttachments[]>}
   */
  getAttachmentsGroup(groupId: string, path: string, isLast = false, fromKey?: string, limit?: number): Observable<FirAttachments[]> {
    return Observable.create(subscribe => {
      this.paginationFilesList(path, isLast, fromKey, limit).subscribe(objs => {
        if (objs.length === 0) {
          subscribe.next([]);
          return subscribe.complete();
        }
        const arrAttachments: Observable<FirAttachments>[] = objs.map(data => {
          return Observable.create(observer => {
            // get original file
            this.storage.metadataGroup(groupId, data.value).subscribe(originalFile => {
              observer.next(this.convertAttachedFile(data.key, null, originalFile));
              observer.complete();
            }, err => {
              observer.error(err);
            });
          });
        });
        Observable.forkJoin(arrAttachments).subscribe(array => {
          subscribe.next(array);
          subscribe.complete();
        }, error => {
          subscribe.error(error);
        });
      });
    });
  }

  getAttachment(groupId: string, attachmentKey: string, firebaseKey: string): Observable<FirAttachments> {
    return Observable.create(subscriber => {
      this.storage.metadataGroup(groupId, 'thumb_' + attachmentKey).subscribe(file => {
        subscriber.next(this.convertAttachedFile(firebaseKey, attachmentKey, file));
        subscriber.complete();
      }, error => {
        // get original file
        this.storage.metadataGroup(groupId, attachmentKey).subscribe(originalFile => {
          subscriber.next(this.convertAttachedFile(firebaseKey, null, originalFile));
          subscriber.complete();
        }, err => {
          subscriber.error(err);
        });
      });
    });
  }

  /**
   * 指定されたpathのchildren数を取得する.
   *
   * @param {string} path
   * @returns {Observable<number>}
   */
  size(path: string): Observable<number> {
    return Observable.create(subscriber => {
      this.database.fetchSnapshot(path).subscribe(snapshot => {
        let size = 0;
        if (snapshot) {
          size = snapshot.numChildren();
        }
        subscriber.next(size);
        subscriber.complete();
      });
    });
  }

  /**
   *
   */
  updateFavorite(officeUserId: string, contentId: string, on: boolean): Observable<void> {
    const path = `/user/${officeUserId}/favorite/${contentId}`; // TODO: sample
    return this.database.set(path, on ? true : null);
  }

  getFavoriteList(officeUserId: string): Observable<string[]> {
    return Observable.create(subscriber => {
      const favoriteRef = this.database.ref(`user/${officeUserId}/favorite`);
      favoriteRef.once(EventType.Value).then((snapshot: DataSnapshot) => {
        const array: string[] = [];
        if (snapshot.hasChildren()) {
          snapshot.forEach(child => {
            array.push(child.key);
            return false;
          });
        }
        subscriber.next(array);
        subscriber.complete();
      }).catch(error => {
        subscriber.error(error);
      });
    });
  }

  /*----------------------------------GROUP 13--------------------------------------*/

  /**
   * get all groups that the user login joins
   * @param {string} officeUserId
   * @param {number} type
   * @returns {Observable<any[]>}
   */
  getTopicGroups(officeUserId: string, type: string): Observable<any[]> {
    return Observable.create(subscriber => {
      this.database.fetch(FirGroupTopics, `user/${officeUserId}/groupInfo`).subscribe((groups) => {
        if (groups.length === 0) {
          subscriber.next([]);
          return subscriber.complete();
        }
        const groupList: Observable<FirGroupTopics>[] = groups.map(data => {
          return Observable.create(observe => {
            this.createTopicGroups(data, officeUserId).subscribe(list => {
              observe.next(list);
              observe.complete();
            });
          });
        });
        Observable.forkJoin(groupList).subscribe((array) => {
          array = array.filter(item => item !== null);
          let flattened = [].concat.apply([], array);
          if (type in GroupType) {
            if (type === 'Inside') {
              flattened = flattened.filter(gr => (gr.group.type === GroupType.Inside) || (gr.group.type === GroupType.Official));
            } else {
              flattened = flattened.filter(gr => gr.group.type === GroupType.Outside);
            }
          }
          subscriber.next(GroupService.sortGroups(flattened));
          subscriber.complete();
        }, error => {
          subscriber.error(error);
        });
      });
    });
  }

  /**
   * @param {FirGroupTopics} topic
   * @param {string} officeUserId
   * @returns {Observable<FirGroupTopics[]>}
   */
  createTopicGroups(topic: FirGroupTopics, officeUserId: string): Observable<FirGroupTopics[]> {
    return Observable.create(observe => {
      this.getUnseenToArticle(topic).subscribe(array => {
        if (array.length === 0) {
          observe.next(null);
          return observe.complete();
        }
        Observable.forkJoin(array.map(articleId => this.getFullTopicInfo(topic, articleId, officeUserId))).subscribe(list => {
          observe.next(list);
          observe.complete();
        }, error => {
          observe.error(error);
        });
      });
    });
  }

  /**
   * @param {FirGroupTopics} topicGroup
   * @param {string} articleId
   * @param {string} officeUserId
   * @returns {Observable<FirGroupTopics>}
   */
  getFullTopicInfo(topicGroup: FirGroupTopics, articleId: string, officeUserId: string): Observable<FirGroupTopics> {
    return Observable.create(subscriber => {
      Observable.forkJoin(
        this.getGroup(topicGroup.id),
        this.getArticle(topicGroup.id, articleId),
        this.getComments(articleId),
        this.getMembersInfo(topicGroup.id)
      ).subscribe(list => {
        const topic = new FirGroupTopics();
        topic.id = topicGroup.id;
        topic['unseenToArticle'] = [];
        this.getUnseenToArticle(topicGroup).subscribe(value => {
          topic['unseenToArticle'] = value;
        });
        // real-time unseenTo
        const unseenToPath = `user/${officeUserId}/groupInfo/${topic.id}/unseenTo`;
        const unseenToRef = this.database.ref(unseenToPath);
        this.onChildEventListener(topic.unseenTo, unseenToRef, unseenToPath, false);

        list.forEach(data => {
          if (data instanceof FirGroup) {
            topic.group = data;
          } else if (data instanceof FirArticle) {
            topic.article = data;
          } else if (data && data.length > 0 && data[0] instanceof FirComment) {
            topic.comments = data;
          } else {
            topic.membersInfo = data;
          }
        });
        subscriber.next(topic);
      }, error => {
        subscriber.error(error);
      }, () => {
        subscriber.complete();
      });
    });
  }

  /**
   * @param topicGroup
   * @returns {Observable<string[]>}
   */
  getUnseenToArticle(topicGroup): Observable<string[]> {
      const unseenToArticle = [];
      for (let i = 0; i < topicGroup.unseenTo.article.length; i++) {
        unseenToArticle.push(topicGroup.unseenTo.article[i]);
      }
      for (let j = 0; j < topicGroup.unseenTo.comment.length; j++) {
        if (unseenToArticle.indexOf(topicGroup.unseenTo.comment[j].articleId) < 0) {
          unseenToArticle.push(topicGroup.unseenTo.comment[j].articleId);
        }
      }
      return Observable.of(unseenToArticle);
  }

  /**
   * @param {string} officeUserId
   * @param {string} groupId
   * @returns {Observable<FirUnseenTo>}
   */
  getUnseenToGroup(officeUserId: string, groupId: string): Observable<FirUnseenTo> {
    return Observable.create(observer => {
      const path = `user/${officeUserId}/groupInfo/${groupId}/unseenTo`;
      this.database.fetchOne(FirUnseenTo, path).subscribe((res) => {
        const data = res ? res : new FirUnseenTo();
        const unseenToRef = this.database.ref(path);
        this.onChildEventListener(data, unseenToRef, path, false);
        observer.next(data);
        observer.complete();
      }, error => {
        observer.error(error);
      });
    });
  }

  /**
   * @param {FirArticle} article
   * @param {FirChoice} choice
   * @param {string} officeUserId
   * @returns {Observable<void>}
   */
  answerSurvey(article: FirArticle, choice: FirChoice, officeUserId: string): Observable<void> {
    return Observable.create(observer => {
      let isAnswered = false;
      const answerRef = this.database.ref(`surveys/${article.id}/choices`);
      const unAnswerRef = this.database.ref(`unanswered/${article.id}`);
      if (article.surveys.singleChoiceFlag) {
        // remove path: unanswered/officeUserId
        unAnswerRef.child(officeUserId).remove();
        if (choice.answered.indexOf(officeUserId) === -1) {
          // set path: surveys/articleId/choices/choiceId/answered/officeUserId => true;
          answerRef.child(`/${choice.id}/answered/${officeUserId}`).set(true);
          for (let i = 0; i < article.surveys.choices.length; i++) {
            if (article.surveys.choices[i].id !== choice.id) {
              answerRef.child(`${article.surveys.choices[i].id}/answered/${officeUserId}`).remove();
            }
          }
          observer.next();
          observer.complete();
        }
      } else if (!article.surveys.singleChoiceFlag) {
        if (choice.answered.indexOf(officeUserId) !== -1) {
          answerRef.child(`${choice.id}/answered/${officeUserId}`).remove();
          unAnswerRef.child(officeUserId).remove();
          // if unchecked all choices -> add user to the 'unanswered' table
          for (let i = 0; i < article.surveys.choices.length; i++) {
            if (article.surveys.choices[i].answered.indexOf(officeUserId) > -1) {
              isAnswered = true;
              break;
            }
          }
          if (!isAnswered) {
            unAnswerRef.child(officeUserId).set(true);
          }
          observer.next();
          observer.complete();
        } else {
          answerRef.child(`/${choice.id}/answered/${officeUserId}`).set(true);
          unAnswerRef.child(officeUserId).remove();
          observer.next();
          observer.complete();
        }
      }
    });
  }

  // Event.
  // --------------------------------------------------------------------------
  addArticleADListener(groupId: string, ignoreInitial = true): Observable<any> {
    return Observable.create(subscriber => {
      const path = `article/${groupId}`;
      // size
      this.size(path).subscribe(size => {
        const reference = this.database.ref(path);
        // add
        let countDownLatch = size;
        reference.on(EventType.ChildAdd, ref => {
          if (ignoreInitial && 0 < countDownLatch) {
            countDownLatch -= 1;
            return;
          }
          subscriber.next({
            type: EventType.ChildAdd,
            id: ref.key,
          });
        });
        // removed
        reference.on(EventType.ChildRemoved, ref => {
          subscriber.next({
            type: EventType.ChildRemoved,
            id: ref.key,
          });
        });
        // save
        this.screenRelatedReferences.push(reference);
      });
    });
  }

  eventListener(path: string, ignoreInitial = true): Observable<any> {
    return Observable.create(subscriber => {
      this.size(path).subscribe(size => {
        const reference = this.database.ref(path);
        // add
        let countDownLatch = size;
        reference.on(EventType.ChildAdd, ref => {
          if (ignoreInitial && 0 < countDownLatch) {
            countDownLatch -= 1;
            return;
          }
          subscriber.next({
            type: EventType.ChildAdd,
            key: ref.key,
            value: ref.val()
          });
        });
        // removed
        reference.on(EventType.ChildRemoved, ref => {
          subscriber.next({
            type: EventType.ChildRemoved,
            key: ref.key,
            value: ref.val()
          });
        });
        // save
        this.screenRelatedReferences.push(reference);
      });
    });
  }

  onChildEventListener<T extends FirBase>(data: T, reference: Reference, path: string, ignoreInitial = true) {
    if (reference) {
      this.size(path).subscribe(size => {
        // add
        let countDownLatch = size;
        reference.on(EventType.ChildAdd, ref => {
          if (ignoreInitial && 0 < countDownLatch) {
            countDownLatch -= 1;
            return;
          }
          data.updateData(ref.key, ref.val());
        });
        // removed
        reference.on(EventType.ChildRemoved, ref => {
          data.updateData(ref.key, '');
        });

        // changed
        reference.on(EventType.ChildChanged, ref => {
          data.updateData(ref.key, ref.val());
        });
        this.screenRelatedReferences.push(reference);
      });
    }
  }


  // API.
  // --------------------------------------------------------------------------
  deleteGroup(groupId: string): Observable<any> {
    let params, options, apiUrl;
    params = new URLSearchParams();
    params.append('groupId', groupId);
    options = new RequestOptions({params: params});
    apiUrl = '/api/dr/gr/delete';
    return new Observable(observer => {
      this.http.delete(apiUrl, options).subscribe((response: GroupOutsideSaveResult) => {
        observer.next(Object.assign(new GroupOutsideSaveResult(), response));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  getCreateHospitalGroup(): Observable<CreateHospitalGroupSettings> {
    return new Observable(observer => {
      this.http.get('/api/dr/gr/inside/create/prepare').subscribe((response: Response) => {
        observer.next(Object.assign(new CreateHospitalGroupSettings(), response.json()));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  postCreateHospitalGroup(settings: CreateHospitalGroupSettingsSendApi): Observable<CreateHospitalGroupSettingsSaveResults> {
    return new Observable(observer => {
      this.http.post('/api/dr/gr/inside/create/save', JSON.stringify(settings))
        .subscribe((response: Response) => {
          observer.next(Object.assign(new CreateHospitalGroupSettingsSaveResults(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getDepartmentUser(deptId: string): Observable<DepartmentUserSettings[]> {
    let params, options, apiUrl;
    params = new URLSearchParams();
    params.append('departmentId', deptId);
    options = new RequestOptions({params: params});
    apiUrl = '/api/dr/gr/dept/user';
    return new Observable(observer => {
      this.http.get(apiUrl, options).subscribe((response: Response) => {
        if (response.json().length === 0) {
          observer.next(Object.assign(new Array(), response.json()));
        } else {
          observer.next(Object.assign([new DepartmentUserSettings()], response.json()));
        }
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  getCreateDepartmentGroup(): Observable<CreateDepartmentGroupSettings> {
    return new Observable(observer => {
      this.http.get('/api/dr/gr/inside/create/dept/prepare').subscribe((response: Response) => {
        observer.next(Object.assign(new CreateDepartmentGroupSettings(), response.json()));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  postCreateDepartmentGroup(settings: CreateDepartmentGroupSettingsSendApi): Observable<CreateDepartmentGroupSettingsSaveResults> {
    return new Observable(observer => {
      this.http.post('/api/dr/gr/inside/create/dept/save', JSON.stringify(settings))
        .subscribe((response: Response) => {
          observer.next(Object.assign(new CreateDepartmentGroupSettingsSaveResults(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getEditHospitalGroup(groupId: string): Observable<EditHospitalGroupSettings> {
    let params, options, apiUrl;
    params = new URLSearchParams();
    params.append('groupId', groupId);
    options = new RequestOptions({params: params});
    apiUrl = '/api/dr/gr/inside/edit/prepare';
    return new Observable(observer => {
      this.http.get(apiUrl, options).subscribe((response: Response) => {
        observer.next(Object.assign(new EditHospitalGroupSettings(), response.json()));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  putEditHospitalGroup(settings: CreateHospitalGroupSettingsSendApi): Observable<EditHospitalGroupSettingsSaveResults> {
    return new Observable(observer => {
      this.http.put('/api/dr/gr/inside/edit/save', JSON.stringify(settings))
        .subscribe((response: Response) => {
          observer.next(Object.assign(new EditHospitalGroupSettingsSaveResults(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getEditDepartmentGroup(groupId: string): Observable<EditDepartmentGroupSettings> {
    let params, options, apiUrl;
    params = new URLSearchParams();
    params.append('groupId', groupId);
    options = new RequestOptions({params: params});
    apiUrl = '/api/dr/gr/inside/edit/dept/prepare';
    return new Observable(observer => {
      this.http.get(apiUrl, options).subscribe((response: Response) => {
        observer.next(Object.assign(new EditDepartmentGroupSettings(), response.json()));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  putEditDepartmentGroup(settings: EditDepartmentGroupSettingsSendApi): Observable<EditDepartmentGroupSettingsSaveResults> {
    return new Observable(observer => {
      this.http.put('/api/dr/gr/inside/edit/dept/save', JSON.stringify(settings))
        .subscribe((response: Response) => {
          observer.next(Object.assign(new EditDepartmentGroupSettingsSaveResults(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  postCreatePollSurvey(settings: CreatePollSurveySettings): Observable<CreatePollSurveySettingsSaveResults> {
    return new Observable(observer => {
      this.http.post('/api/dr/gr/surveys/create/save', JSON.stringify(settings))
        .subscribe((response: Response) => {
          observer.next();
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  putEditPollSurvey(settings: EditPollSurveySettings): Observable<EditPollSurveySettingsSaveResults> {
    return new Observable(observer => {
      this.http.put('/api/dr/gr/surveys/edit/save', JSON.stringify(settings))
        .subscribe((response: Response) => {
          observer.next(Object.assign(new EditPollSurveySettingsSaveResults(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getOutsideGroup(): Observable<PrepareCreateOutsideGroupSetting> {
    return new Observable(observer => {
      this.http.get('/api/dr/gr/outside/create/prepare').subscribe((response: Response) => {
        observer.next(Object.assign(new PrepareCreateOutsideGroupSetting(), response.json()));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  getUserFromMail(input: string): Observable<any> {
    let apiUrl;
    return new Observable(observer => {
      apiUrl = '/api/dr/gr/outside/user/from/email?input=' + encodeURIComponent(input);
      this.http.get(apiUrl).subscribe((response: Response) => {
        observer.next(Object.assign([new OfficeOutsideUser()], response.json()));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  putOutsideGroup(settings: CreateHospitalGroupSettingsSendApi): Observable<CreateOutsideGroupSettingSaveResult> {
    return new Observable(observer => {
      this.http.post('/api/dr/gr/outside/create/save', JSON.stringify(settings))
        .subscribe((response: Response) => {
          observer.next(Object.assign(new CreateOutsideGroupSettingSaveResult(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getEditGroupOutside(groupId: string): Observable<EditGroupOutsideSetting> {
    let apiUrl;
    return new Observable(observer => {
      apiUrl = '/api/dr/gr/outside/edit/prepare?groupId=' + groupId;
      this.http.get(apiUrl).subscribe((response: Response) => {
        observer.next(Object.assign(new EditGroupOutsideSetting(), response.json()));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  putOutsideEditGroup(settings: CreateOutsideGroupSetting): Observable<GroupOutsideSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/dr/gr/outside/edit/save', JSON.stringify(settings))
        .subscribe((response: Response) => {
          observer.next(Object.assign(new GroupOutsideSaveResult(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getMemberPrepare(groupId: string): Observable<GroupOutsidePrepareJoinSetting> {
    let apiUrl;
    return new Observable(observer => {
      apiUrl = '/api/dr/gr/member/join/prepare?groupId=' + groupId;
      this.http.get(apiUrl).subscribe((response: Response) => {
        observer.next(Object.assign(new GroupOutsidePrepareJoinSetting(), response.json()));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  putJoinAgreeGroup(groupId: string): Observable<GroupOutsideSaveResult> {
    let apiUrl;
    return new Observable(observer => {
      apiUrl = '/api/dr/gr/member/join/agree?groupId=' + groupId;
      this.http.put(apiUrl, JSON.stringify(groupId))
        .subscribe((response: Response) => {
          observer.next(Object.assign(new GroupOutsideSaveResult(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  putJoinDisagreeGroup(groupId: string): Observable<GroupOutsideSaveResult> {
    let apiUrl;
    return new Observable(observer => {
      apiUrl = '/api/dr/gr/member/join/disagree?groupId=' + groupId;
      this.http.put(apiUrl, JSON.stringify(groupId))
        .subscribe((response: Response) => {
          observer.next(Object.assign(new GroupOutsideSaveResult(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  putSendComment(settings: CommentArticleSetting): Observable<CommentArticleSettingResult> {
    return new Observable(observer => {
      this.http.post('/api/dr/gr/comment/create', JSON.stringify(settings))
        .subscribe((response: Response) => {
          observer.next(Object.assign(new CommentArticleSettingResult(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  postCreateArticle(settings: any): Observable<CreateArticleSettingResults> {
    return new Observable(observer => {
      this.http.post('/api/dr/gr/article/create', JSON.stringify(settings))
        .subscribe((response: Response) => {
          observer.next(Object.assign(new CreateArticleSettingResults(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  leaveGroup(groupId: string): Observable<any> {
    let params, options, apiUrl;
    params = new URLSearchParams();
    params.append('groupId', groupId);
    options = new RequestOptions({params: params});
    apiUrl = '/api/dr/gr/leave';
    return new Observable(observer => {
      this.http.delete(apiUrl, options).subscribe((response: GroupOutsideSaveResult) => {
        observer.next(Object.assign(new GroupOutsideSaveResult(), response));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  deleteArticle(articleId: string): Observable<any> {
    let params, options, apiUrl;
    params = new URLSearchParams();
    params.append('articleId', articleId);
    options = new RequestOptions({params: params});
    apiUrl = '/api/dr/gr/article/delete';
    return new Observable(observer => {
      this.http.delete(apiUrl, options).subscribe((response: GroupOutsideSaveResult) => {
        observer.next(Object.assign(new GroupOutsideSaveResult(), response));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  deleteComment(commentId: string, articleId: string): Observable<any> {
    let headers, body, options, apiUrl;
    headers = new Headers();
    headers.append('Content-Type', 'application/json; charset=utf-8');
    headers.append('Accept', 'application/json');
    body = JSON.stringify({id: commentId, articleId: articleId});
    options = new RequestOptions({headers: headers, body: body});
    apiUrl = '/api/dr/gr/comment/delete';
    return new Observable(observer => {
      this.http.delete(apiUrl, options).subscribe((response: GroupOutsideSaveResult) => {
        observer.next(Object.assign(new GroupOutsideSaveResult(), response));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  putEditArticle(settings: any): Observable<CreateArticleSettingResults> {
    return new Observable(observer => {
      this.http.put('/api/dr/gr/article/edit', JSON.stringify(settings))
        .subscribe((response: Response) => {
          observer.next(Object.assign(new CreateArticleSettingResults(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  postComment(settings: any): Observable<CommentArticleSettingResult> {
    return new Observable(observer => {
      this.http.post('/api/dr/gr/comment/create', JSON.stringify(settings))
        .subscribe((response: Response) => {
          observer.next(Object.assign(new CommentArticleSettingResult(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  putEditComment(settings: any): Observable<CommentArticleSettingResult> {
    return new Observable(observer => {
      this.http.put('/api/dr/gr/comment/edit', JSON.stringify(settings))
        .subscribe((response: Response) => {
          // if (response.status === HttpStatus.OK) {
          //   observer.next(Object.assign(new GroupOutsidePrepareJoinSetting(), response.json()));
          //   observer.complete();
          // } else if (response.status === HttpStatus.BadRequest) {
          //   observer.error();
          // } else {
          //   observer.error();
          // }
          observer.next(Object.assign(new CommentArticleSettingResult(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  /**
   * ユーザー情報取得
   * @param userIds
   */
  public getUsers(userIds: string[]): Observable<FirUser> {
    let subject = new Subject<FirUser>();

    for (let i = 0; i < userIds.length; i++) {
      this.database.ref(`/user/${userIds[i]}/userInfo`).once("value",
        (snapshot) => {
          if (snapshot) {
            let firUser = new JsonConvert().deserialize(snapshot.val(), FirUser);
            firUser.id = userIds[i];
            subject.next(firUser);
          }

          if (userIds.length - 1 <= i) {
            subject.complete();
          }
        }
      );
    }

    return subject.asObservable();
  }

  getFiles(fileIds: string[]): Observable<FirFile> {
    let subject = new Subject<FirFile>();

    for (let i = 0; i < fileIds.length; i++) {
      this.database.ref(`/files/${fileIds[i]}`).once("value",
        (snapshot) => {
          if (snapshot) {
            let val = snapshot.val();
            let obj = {mimeType: val.mimeType, fileName: val.mimeType, url: val.url, id: fileIds[i]};
            subject.next(obj);
          }

          if (fileIds.length - 1 <= i) {
            subject.complete();
          }
        }
      );
    }

    return subject.asObservable();
  }

  /**
   * API 経由のグループのユーザー一覧取得
   * @param groupId
   * @param contentsId
   */
  public getMembersList(groupId: string, contentsId: string): Observable<Object[]> {
    let url = groupId ? `/api/group/recipients?groupId=${groupId}` : `/api/group/recipients?contentsId=${contentsId}`
    return this.http.get(url).map(
      (response: Response) => {
        return response.json();
      }
    );
  }

  getDetailUser(officeUserId: string, reload?: boolean): Observable<DetailUser> {
    if (!reload && this._detailUsersCash[officeUserId]) {
      return new Observable(
        (observer) => {
          observer.next(this._detailUsersCash[officeUserId]);
          observer.complete();
        }
      );
    }

    return this.http.get(`/api/dr/re/detail_user/user_group?officeUserId=${officeUserId}`).
    map(
      (response: Response) => {
        this._detailUsersCash[officeUserId] =  Object.assign(new DetailUser(), response.json());
        return this._detailUsersCash[officeUserId];
      }
    );
  }

  deleteAttachedFile(fileId: string, groupId: string): Observable<any> {
    let body, options, apiUrl;
    body = JSON.stringify({groupId: groupId, fileId: fileId});
    options = new RequestOptions({body: body});
    apiUrl = '/api/dr/gr/delete_attachment ';
    return Observable.create(subscriber => {
      this.http.delete(apiUrl, options).subscribe((response) => {
        subscriber.next();
        subscriber.complete();
      }, (error) => {
        subscriber.error(error);
      });
    });
  }

  getDownloadCSV(groupId: string): Observable<any> {
    return new Observable(observer => {
      this.http.get(`/api/dr/gr/createCSV?groupId=${groupId}`).subscribe(response => {
        observer.next(response.json());
        observer.complete();
      }, error => {
        observer.error(error);
      });
    });
  }

  postFileTransfer(filetransfer: FileTransfer) {
    return new Observable(observer => {
      this.http.post('/api/file/transfer', JSON.stringify(filetransfer)).subscribe(response => {
        observer.next(response.json());
        observer.complete();
      }, error => {
        observer.error(error);
      });
    });
  }

  getDownloadFile(param: string) {
    return new Observable(observer => {
      this.http.get(`/api/file/download?token=${param}`, {responseType: ResponseContentType.Blob}).subscribe(response => {
        observer.next(response.blob());
        observer.complete();
      }, error => {
        observer.error(error);
      });
    });
  }

  postCreateMultipleArticle(settings: any): Observable<CreateArticleSettingResults> {
    return new Observable(observer => {
      this.http.post('/api/dr/gr/article/create/multiple', JSON.stringify(settings))
        .subscribe((response: Response) => {
          observer.next();
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }


}
