import {Subscription} from 'rxjs/Subscription';
import {FirebaseStorage} from './firebase/firebase.storage';
import {NGXLogger} from 'ngx-logger';
import {FirebaseDatabase} from './firebase/firebase.database';
import {Injectable, OnDestroy} from '@angular/core';
import {SharedValueService} from './shared-value.service';
import {AuthenticationService} from './authentication.service';
import {AuthenticationMessage} from './message.service';
import {FirebaseService} from './firebase/firebase.service';
import {FirTimeline} from '../models/firebase/fir.timeline';
import {GroupService} from './group.service';
import {Observable} from 'rxjs/Observable';
import {Timeline} from '../models/gr/timeline';
import {FirArticle, FirSurveys} from '../models/gr/firebase/fir.article';
import {FirGroup} from '../models/gr/firebase/fir.group';
import {FirComment} from '../models/gr/firebase/fir.comment';
import {JsonConvert} from 'json2typescript';
import DataSnapshot = firebase.database.DataSnapshot;
import EventType = FirebaseDatabase.EventType;
import Reference = firebase.database.Reference;

/**
 * タイムラインサービス.
 */
@Injectable()
export class TimelineService implements OnDestroy {

  // Variables
  // --------------------------------------------------------------------------
  private timelines: FirTimeline[] = null;
  public data: Timeline[] = [];

  private subscription: Subscription = null;
  private jsonConverter = new JsonConvert();
  private databaseReferences = new Map<String, Reference>();

  // Constructor
  // --------------------------------------------------------------------------
  constructor(private firebase: FirebaseService,
              private database: FirebaseDatabase,
              private storage: FirebaseStorage,
              private shared: SharedValueService,
              private group: GroupService,
              private authentication: AuthenticationService,
              private authenticationMessage: AuthenticationMessage,
              private logger: NGXLogger) {
    this.prepare();
  }

  // Initializer
  // --------------------------------------------------------------------------
  public prepare() {
    this.registerObservers();
  }

  // Destroy
  // --------------------------------------------------------------------------
  // @Override
  ngOnDestroy(): void {
    this.unregisterLogoutObservers();
    this.dispose();
  }

  /**
   * 終了処理を行う.
   */
  public dispose() {
    // 各種通知の解除
    this.unregisterObservers();
    // データリセット
    this.timelines = null;
    this.data = [];

    // New
    this.databaseReferences.forEach(ref => ref.off());
    this.databaseReferences.clear();
  }

  // Public methods
  // --------------------------------------------------------------------------
  /**
   * タイムライン情報を最新から10件毎に取得する.
   */
  fetchPagerTimeline(): Observable<Timeline[]> {
    const session = this.shared.getUserSession();
    const officeUserId = session.officeUserId;

    return Observable.create(subscriber => {
      this.fetchNextPageTimelines(officeUserId).subscribe((targets: FirTimeline[]) => {
        if (targets.length === 0) {
          subscriber.next(this.data);
          subscriber.complete();

        } else {
          Observable.forkJoin(targets.map(v => this.fetchPerTimeline(v))).subscribe((timelines: Timeline[]) => {
            if (timelines) {
              timelines.forEach(timeline => this.data.push(timeline));
              // sort
              this.sortTimeline();
            }
          }, error => {
            subscriber.error(error);

          }, () => {
            subscriber.next(this.data);
            subscriber.complete();
          });
        }

      }, error => {
        subscriber.error(error);
      });
    });
  }

  // Private methods
  // --------------------------------------------------------------------------
  /**
   * 次頁のタイムラインを取得する.
   */
  private fetchNextPageTimelines(officeUserId: string): Observable<FirTimeline[]> {
    // from timeline id
    const fromID = (0 < this.data.length) ? this.data[this.data.length - 1].id : null;

    // 次頁10件の情報を取得する
    const nextTimelines = (index: number) => {
      const timelines: FirTimeline[] = [];
      for (let i = index; i < this.timelines.length; i++) {
        if (timelines.length === 10) {
          break;
        }
        timelines.push(this.timelines[i]);
      }
      return timelines;
    };

    return Observable.create(subscriber => {
      if (this.timelines !== null) {
        const index = this.timelines.findIndex((timeline: FirTimeline) => {
          return timeline.id === fromID;
        });
        subscriber.next(nextTimelines(index + 1));
        subscriber.complete();

      } else {
        this.fetchTimelines(officeUserId).subscribe((timelines: FirTimeline[]) => {
          this.timelines = timelines.reverse();

          subscriber.next(nextTimelines(0));
          subscriber.complete();
        });
      }
    });
  }

  /**
   * "/user/{officeUserId}/timeline" の情報を全て取得する.
   */
  private fetchTimelines(officeUserId: string): Observable<FirTimeline[]> {
    if (this.timelines !== null)  {
      return Observable.create(subscriber => {
        subscriber.next(this.timelines);
        subscriber.complete();
      });
    }
    return Observable.create(subscriber => {
      // database reference
      const reference = this.database.ref(`/user/${officeUserId}/timeline`);
      this.databaseReferences.set('timeline', reference);

      reference.once(EventType.Value, (snapshot: DataSnapshot) => {
        // timeline data
        const timelines: FirTimeline[] = [];

        snapshot.forEach((child: DataSnapshot) => {
          const timeline: FirTimeline = this.jsonConverter.deserialize(child.val(), FirTimeline);
          timeline.id = child.key;
          // push data
          timelines.push(timeline);
          return false;
        });

        // register added event
        reference.on(EventType.ChildAdd, (ds: DataSnapshot) => {
          if (!ds || !ds.exists()) {
            return;
          }
          const timeline: FirTimeline = this.jsonConverter.deserialize(ds.val(), FirTimeline);
          if (this.existsTimeline(timeline.groupId, timeline.articleId)) {
            return;
          }

          this.fetchPerTimeline(timeline).subscribe((result: Timeline) => {
            if (result && !this.existsTimeline(result.group.id, result.article.id)) {
              this.data.unshift(result);
              this.sortTimeline();
            }
          });
        });

        // register deleted event
        reference.on(EventType.ChildRemoved, (ds: DataSnapshot) => {
          if (!ds || !ds.exists()) {
            return;
          }
          const removed: FirTimeline = this.jsonConverter.deserialize(ds.val(), FirTimeline);
          removed.id = ds.key;

          // delete article
          this.data.forEach((timeline: Timeline, index: number, objects: Timeline[]) => {
            if (timeline.group.id === removed.groupId && timeline.article.id === removed.articleId) {
              objects.splice(index, 1);
            }
          });
          // delete timeline
          this.timelines.forEach((timeline: FirTimeline, index: number, objects: FirTimeline[]) => {
            if (timeline.id === removed.id) {
              objects.splice(index, 1);
            }
          });
        });
        subscriber.next(timelines);
        subscriber.complete();
      });
    });
  }

  /**
   * タイムライン１件分の情報を取得する.
   */
  private fetchPerTimeline(timeline: FirTimeline): Observable<Timeline> {
    return Observable.create(subscriber => {
      this.database.ref(`/group/${timeline.groupId}`).once(EventType.Value, (snapshot: DataSnapshot) => {
        let group: FirGroup = null;

        if (snapshot && snapshot.exists()) {
          group = this.jsonConverter.deserialize(snapshot.val(), FirGroup);
          group.id = snapshot.key;

          if (!this.databaseReferences.has(group.id)) {
            const reference = this.database.ref(`/group/${group.id}`);
            reference.on(EventType.ChildChanged, (ds: DataSnapshot) => {
              if (!ds || !ds.exists()) {
                return;
              }
              const groupId = ds.ref.parent.key;

              this.data.forEach(t => {
                if (t.group.id === groupId) {
                  t.group.updateData(ds.key, ds.val());
                }
              });
            });
            this.databaseReferences.set(group.id, reference);
          }

          // 記事・記事コメント情報の取得
          this.fetchArticleAndComments(timeline, group).subscribe((t: Timeline) => {
            subscriber.next(t);
            subscriber.complete();

          }, error => {
            subscriber.error(error);
          });

        } else {
          subscriber.next(group);
          subscriber.complete();
        }
      });
    });
  }

  /**
   * 記事、記事コメントを取得する.
   */
  private fetchArticleAndComments(timeline: FirTimeline, group: FirGroup): Observable<Timeline> {

    // Timeline情報を作成する
    const newTimeline = (article: FirArticle, comments: FirComment[]) => {
      const model = new Timeline();
      model.id = timeline.id;
      model.group = group;
      model.article = article;
      model.comments = comments;
      return model;
    };

    return Observable.create(subscriber => {
      const reference = this.database.ref(`/article/${group.id}/${timeline.articleId}`);

      reference.once(EventType.Value, (snapshot: DataSnapshot) => {
        let article: FirArticle = null;

        if (snapshot && snapshot.exists()) {
          article = this.jsonConverter.deserialize(snapshot.val(), FirArticle);
          article.id = snapshot.key;

          // Changed event listener
          this.registerArticlesListener(group, article);

          if (article.surveysFlag) {
            this.fetchSurveys(article.id).subscribe((surveys: FirSurveys) => {
              article.surveys = surveys;

              this.fetchComments(article).subscribe((comments: FirComment[]) => {
                subscriber.next(newTimeline(article, comments));
                subscriber.complete();
              }, error => {
                subscriber.error(error);
              });
            });
          } else {
            this.fetchComments(article).subscribe((comments: FirComment[]) => {
              subscriber.next(newTimeline(article, comments));
              subscriber.complete();
            }, error => {
              subscriber.error(error);
            });
          }
        } else {
          subscriber.next(null);
          subscriber.complete();
        }
      });
    });
  }

  /**
   * 記事ツリーに関連するイベントを登録する.
   */
  private registerArticlesListener(group: FirGroup, article: FirArticle) {

    // Check duplicate
    if (!article || this.databaseReferences.has(article.id)) {
      return;
    }

    // 記事DBパス
    let reference = this.database.ref(`/article/${group.id}/${article.id}`);
    this.databaseReferences.set(article.id, reference);

    // 記事変更イベント
    reference.on(EventType.ChildAdd, (snapshot: DataSnapshot) => {
      article.updateData(snapshot.key, snapshot.val());
    });
    reference.on(EventType.ChildChanged, (snapshot: DataSnapshot) => {
      article.updateData(snapshot.key, snapshot.val());
    });
    reference.on(EventType.ChildRemoved, (snapshot: DataSnapshot) => {
      article.updateData(snapshot.key, '');
    });

    // 記事コメントDBパス
    reference = this.database.ref(`/article/${group.id}/${article.id}/comments`);
    this.databaseReferences.set(`comment${article.id}`, reference);

    // Timelineを探す
    const findTimeline = () => {
      return this.data.find(target => {
        return target.group.id === group.id && target.article.id === article.id;
      });
    };

    // 記事コメント追加
    reference.on(EventType.ChildAdd, (snapshot: DataSnapshot) => {
      const timeline = findTimeline();

      if (timeline && 0 <= timeline.comments.findIndex(c => c.id === snapshot.key)) {
        return;
      }

      if (snapshot && snapshot.exists()) {
        article.updateData(snapshot.key, snapshot.val());

        this.fetchComment(article.id, snapshot.key).subscribe((comment: FirComment) => {
          if (comment) {
            if (timeline && timeline.comments.findIndex(c => c.id === comment.id) < 0) {
              timeline.comments.push(comment);
            }
          }
        });
      }
    });

    // 記事コメント変更イベント
    reference.on(EventType.ChildRemoved, (snapshot: DataSnapshot) => {
      article.updateData(snapshot.key, '');

      const timeline: Timeline = findTimeline();

      if (timeline) {
        const idx = timeline.comments.findIndex(comment => {
          return comment.id === snapshot.key;
        });
        if (0 <= idx) {
          timeline.comments.splice(idx, 1);
        }
      }
    });
  }

  /**
   * アンケート情報を取得する.
   */
  private fetchSurveys(articleId: string): Observable<FirSurveys> {
    return Observable.create(subscriber => {

      const path = `/surveys/${articleId}`;

      this.database.ref(path).once(EventType.Value, (snapshot: DataSnapshot) => {

        let surveys: FirSurveys = null;

        if (snapshot && snapshot.exists()) {

          surveys = this.jsonConverter.deserialize(snapshot.val(), FirSurveys);
          surveys.id = snapshot.key;
          surveys['percent'] = GroupService.calculatePercent(surveys.choices);

          if (!this.databaseReferences.has(`surveys${articleId}`)) {
            const reference = this.database.ref(path);
            this.databaseReferences.set(`surveys${articleId}`, reference);

            reference.on(EventType.ChildChanged, (ds: DataSnapshot) => {
              surveys.updateData(ds.key, ds.val());
              surveys['percent'] = GroupService.calculatePercent(surveys.choices);
            });
          }
          subscriber.next(surveys);
          subscriber.complete();

        } else {
          subscriber.next(surveys);
          subscriber.complete();
        }
      });
    });
  }

  /**
   * 指定された記事コメント情報を取得する.
   */
  private fetchComment(articleId: string, commentId: string): Observable<FirComment> {
    return Observable.create(subscriber => {
      const reference = this.database.ref(`/comment/${articleId}/${commentId}`);

      reference.once(EventType.Value, (snapshot: DataSnapshot) => {
        let comment: FirComment = null;

        if (snapshot && snapshot.exists()) {
          comment = this.jsonConverter.deserialize(snapshot.val(), FirComment);
          comment.id = snapshot.key;

          if (!this.databaseReferences.has(comment.id)) {
            const ref = this.database.ref(`/comment/${articleId}/${commentId}`);
            // event listener
            ref.on(EventType.ChildAdd, (ds: DataSnapshot) => {
              const target = this.findComment(articleId, commentId);
              if (target) {
                target.updateData(ds.key, ds.val());
              }
            });
            ref.on(EventType.ChildChanged, (ds: DataSnapshot) => {
              const target = this.findComment(articleId, commentId);
              if (target) {
                target.updateData(ds.key, ds.val());
              }
            });
            ref.on(EventType.ChildRemoved, (ds: DataSnapshot) => {
              const target = this.findComment(articleId, commentId);
              if (target) {
                target.updateData(ds.key, '');
              }
            });
            this.databaseReferences.set(comment.id, ref);
          }
        }
        subscriber.next(comment);
        subscriber.complete();
      });
    });
  }

  /**
   * 指定された記事に紐づく記事コメント情報をすべて取得する.
   */
  private fetchComments(article: FirArticle): Observable<FirComment[]> {
    return Observable.create(subscriber => {

      if (article.comments.length === 0) {
        subscriber.next([]);
        return subscriber.complete();
      }

      const observables = article.comments.map(commentId => {
        return this.fetchComment(article.id, commentId);
      });

      Observable.forkJoin(observables).subscribe((comments: FirComment[]) => {
        subscriber.next(comments.filter(comment => comment));
        subscriber.complete();

      }, error => {
        subscriber.error(error);
      });
    });
  }

  /**
   * 指定されたコメントを探す.
   */
  private findComment(articleId: string, commentId: string): FirComment {
    const timeline: Timeline = this.data.find(t => t.article.id === articleId);
    if (timeline) {
      return timeline.comments.find(c => c.id === commentId);
    }
    return null;
  }

  /**
   * ソートする.
   */
  private sortTimeline() {
    this.data.sort((t1: Timeline, t2: Timeline) => {
      return t2.article.createdAt.getTime() - t1.article.createdAt.getTime();
    });
  }

  /**
   * タイムラインが存在するかどうかをチェックする.
   */
  private existsTimeline(groupId: string, articleId: string): boolean {
    const index = this.timelines.findIndex(t => {
      return t.groupId === groupId && t.articleId === articleId;
    });
    return 0 <= index;
  }

  // Observers
  // --------------------------------------------------------------------------
  /**
   * 通知登録.
   */
  private registerObservers() {
    if (this.subscription != null) {
      return;
    }
    this.subscription = this.authenticationMessage.get().subscribe(type => {
      if (type === AuthenticationMessage.Type.Logout) {
        // ログアウト時
        this.unregisterObservers();
        // データクリア
        this.data = [];
      }
    });
  }

  /**
   * 通知解除.
   */
  private unregisterObservers() {
  }

  /**
   * ログアウト通知解除.
   */
  private unregisterLogoutObservers() {
    // ログアウト通知
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = null;
  }
}
