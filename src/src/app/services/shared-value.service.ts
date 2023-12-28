import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {DialogParams} from '../models/dialog-param';
import {DrJOY} from '../models/ba/drjoy';
import {Observable} from 'rxjs/Observable';
import {AccountStatus, FuncAuthoritySet, UserSession} from '../models/ba/user-session';
import {Http, Response} from '@angular/http';
import {PopupHover} from '../models/popup-hover';
import {AuthenticationService} from './authentication.service';
import {isNullOrUndefined} from 'util';
import {Router} from '@angular/router';
import {LocalStorage} from './local-storage.service';
import {HttpStatus} from '../common/http.status';
import Favico from 'favico.js';
import { Subscription } from 'rxjs/Subscription';
import {LoginUserInfoMessage} from './message.service';
import {Unseens} from '../models/firebase/fir.unseens';

@Injectable()
export class SharedValueService {
  /**
   * 言語 ja, en, etc...
   */
  lang: string;

  /**
   * モーダル表示用Subject
   * @type {Subject}
   */
  showModal: Subject<DialogParams> = new Subject();
  showPopupHover: Subject<PopupHover> = new Subject();
  checkedPopup = new Subject();
  removeAttachment = new Subject();

  private badge = 0;
  private sideMenuBadgeCount = 0;
  private informationBadgeCount = 0;
  public userAgent = window.navigator.userAgent;
  public favicon: any;
  loginUserInfoMessageSubscription: Subscription;

  private drJOY: DrJOY;

  private userSession: UserSession;

  private accoutStatus: AccountStatus;

  constructor(private http: Http,
              private authService: AuthenticationService,
              private router: Router,
              private loginUserInfoMessage: LoginUserInfoMessage,
              private unseens: Unseens,
              private localStorage: LocalStorage) {
      // IE以外
      if (this.userAgent.indexOf('Trident') === -1) {
        this.favicon = new Favico({
          bgColor: '#d00',
          textColor: '#fff',
          fontFamily: 'Arial',
          fontStyle: 'normal',
          position: 'down',
          type: 'circle',
          animation: 'none'
        });
      }
  }

  set sideMenuBadge(sideMenuBadgeCount) {
    this.sideMenuBadgeCount = sideMenuBadgeCount;
    this.setFaviconBadge();
  }

  get sideMenuBadge(): number {
    return this.sideMenuBadgeCount;
  }

  set informationBadge(informationBadgeCount) {
    this.informationBadgeCount = informationBadgeCount;
    this.setFaviconBadge();
  }

  get informationBadge(): number {
    return this.informationBadgeCount;
  }
  setCheckedPopup(checked: boolean) {
    this.checkedPopup.next(checked);
  }

  getCheckedPopup(): Observable<any> {
    return this.checkedPopup.asObservable();
  }
  setRemoveAttachment(fileId: string) {
    this.removeAttachment.next(fileId);
  }

  getRemoveAttachment(): Observable<any> {
    return this.removeAttachment.asObservable();
  }
  setFaviconBadge() {
    if (this.userAgent.indexOf('Trident') !== -1) {
      return;
    }
    const unseen = this.unseens.getAll();
    if (this.badge !== unseen) {
      this.badge = unseen;
      const badge = (unseen > 99) ? '+99' : unseen;
      this.favicon.badge(badge);
    }
  }

  getDrJOY(): Observable<DrJOY> {
    if (this.drJOY) {
      return new Observable<DrJOY>(observer => {
        observer.next(this.drJOY);
        observer.complete();
      });
    }
    return this.http.get('/api/ba/session/drjoy').map(res => {
      const drjoy = Object.assign(new DrJOY(), res.json());
      this.drJOY = drjoy;
      return drjoy;
    });
  }

  /**
   * UserSession情報を取得します.
   *
   * @returns {UserSession}
   */
  getUserSession() {
    if (isNullOrUndefined(this.userSession)) {
      // TODO:k.sumi ログイン画面に遷移させるのがいいかも
    }
    return this.userSession;
  }

  /**
   * ユーザーSession情報を取得する.
   *
   * @returns {Observable<void>}
   */
  fetchUserSession(): Observable<boolean> {
    return Observable.create((subscriber) => {
      this.http.get('/api/ba/shared_values/user_session').subscribe((res: Response) => {
        this.userSession = new UserSession(res, this.authService.authentication());
        subscriber.next(true);
        subscriber.complete();
      }, (error) => {
        // this.router.navigate(['/logout'], { replaceUrl: true });
        subscriber.error(error);
      });
    });
  }

  /* TODO: checkAuthority */
  fetchAuthoritySession(authority: string): Observable<boolean> {
    return Observable.create((subscriber) => {
      this.http.get('/api/ba/shared_values/user_session').subscribe((res: Response) => {
        this.userSession = new UserSession(res, this.authService.authentication());
        switch (authority) {
          case 'superAdmin':
            subscriber.next(this.userSession.managementAuthority === 'MP_1' && this.userSession.accountStatus.isValid);
            subscriber.complete();
            break;
          case 'admin':
            subscriber.next((this.userSession.managementAuthority === 'MP_1' || this.userSession.managementAuthority === 'MP_2') && this.userSession.accountStatus.isValid);
            subscriber.complete();
            break;
          case 'isValid':
            subscriber.next(this.userSession.accountStatus.isValid);
            subscriber.complete();
            break;
          case 'isProvisional':
            subscriber.next(this.userSession.accountStatus.isProvisional);
            subscriber.complete();
            break;
          case 'isMediator':
            subscriber.next(this.userSession.funcAuthority.FP_7);
            subscriber.complete();
            break;
          case 'personalVerify':
            subscriber.next(!this.userSession.verificationFlag);
            subscriber.complete();
            break;
          case 'identify':
            subscriber.next(!this.userSession.identifyStatus);
            subscriber.complete();
            break;
          case 'personal':
            subscriber.next(!this.userSession.personalFlag);
            subscriber.complete();
            break;
          default:
            this.router.navigate(['/'], {replaceUrl: true});
            subscriber.next(false);
        }
      }, (error) => {
        // this.router.navigate(['/logout'], {replaceUrl: true});
        subscriber.error(error);
      });
    });
  }
  /**
   * UserSession情報をクリアします.
   */
  clearUserSession() {
    this.userSession = null;
    this.authService.clearToken();
    // TODO: ログアウトAPIに問い合わせ
  }

  canActiveAuthority(authority: string): boolean | Observable<boolean> {
    if (this.isLoggedIn()) {
      return this.fetchAuthoritySession(authority).map(res => {
        if (res) {
          return true;
        } else if (authority === 'personalVerify') {
          this.router.navigate(['re/re0034'], {replaceUrl: true});
          return false;
        } else if (authority === 'identify') {
          this.router.navigate(['re/re0032'], {replaceUrl: true});
          return false;
        } else {
          this.router.navigate(['/'], {replaceUrl: true});
          return false;
        }
      });
    } else {
      return true;
    }
  }
  yearsExpertise() {
    const data = [
      { Id: '0', Name: '00' }, { Id: '1', Name: '01' }, { Id: '2', Name: '02' }, { Id: '3', Name: '03' }, { Id: '4', Name: '04' },
      { Id: '5', Name: '05' }, { Id: '6', Name: '06' }, { Id: '7', Name: '07' }, { Id: '8', Name: '08' },
      { Id: '9', Name: '09' }, { Id: '10', Name: '10' }, { Id: '11', Name: '11' }, { Id: '12', Name: '12' },
      { Id: '13', Name: '13' }, { Id: '14', Name: '14' }, { Id: '15', Name: '15' }, { Id: '16', Name: '16' },
      { Id: '17', Name: '17' }, { Id: '18', Name: '18' }, { Id: '19', Name: '19' }, { Id: '20', Name: '20' },
      { Id: '21', Name: '21' }, { Id: '22', Name: '22' }, { Id: '23', Name: '23' }, { Id: '24', Name: '24' },
      { Id: '25', Name: '25' }, { Id: '26', Name: '26' }, { Id: '27', Name: '27' }, { Id: '28', Name: '28' },
      { Id: '29', Name: '29' }, { Id: '30', Name: '30' }, { Id: '31', Name: '31' }, { Id: '32', Name: '32' },
      { Id: '33', Name: '33' }, { Id: '34', Name: '34' }, { Id: '35', Name: '35' }, { Id: '36', Name: '36' },
      { Id: '37', Name: '37' }, { Id: '38', Name: '38' }, { Id: '39', Name: '39' }, { Id: '40', Name: '40' },
      { Id: '41', Name: '41' }, { Id: '42', Name: '42' }, { Id: '43', Name: '43' }, { Id: '44', Name: '44' },
      { Id: '45', Name: '45' }, { Id: '46', Name: '46' }, { Id: '47', Name: '47' }, { Id: '48', Name: '48' },
      { Id: '49', Name: '49' }, { Id: '50', Name: '50' }
    ];
    return data;
  }
  getSpecializedDepartment() {
    return new Observable(observer => {
      this.http.get('/api/ba/specializedDepartment')
        .subscribe((response: Response) => {
          observer.next(response.json());
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }
  getSpecializedDepartmentFake() {
    const data = {
      fieldIds: [
        { id: 'A0001', name: '内科' },
        { id: 'A0002', name: '外科' },
        { id: 'A0003', name: '整形外科' },
        { id: 'A0004', name: '脳外科' },
        { id: 'A0005', name: '放射線科' },
        { id: 'A0006', name: '麻酔科' }
      ],
      typeIds: [
        { id: 'S0001', field_id: 'A0001', name: '一般内科' },
        { id: 'S0002', field_id: 'A0001', name: '腫瘍科' },
        { id: 'S0086', field_id: 'A0002', name: '一般外科' },
        { id: 'S0087', field_id: 'A0002', name: '甲状腺外科' },
        { id: 'S0137', field_id: 'A0003', name: '整形外科' },
        { id: 'S0138', field_id: 'A0003', name: '理学診療科' },
        { id: 'S0158', field_id: 'A0004', name: '脳外科' },
        { id: 'S0159', field_id: 'A0004', name: '脳神経外科' },
        { id: 'S0163', field_id: 'A0005', name: '放射線科' },
        { id: 'S0164', field_id: 'A0005', name: '核医学' },
        { id: 'S0168', field_id: 'A0006', name: '麻酔科' },
      ]
    };
    return data;
  }

  getI18nValues() {
    const I18N_VALUES = {
      'ja': {
        weekdays: ['月', '火', '水', '木', '金', '土', '日'],
        months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      },
      'en': {
        weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      }
    };
    return I18N_VALUES;
  };

  getJopTypes() {
    return new Observable(observer => {
      this.http.get('/api/ba/joptype')
        .subscribe((response: Response) => {
          observer.next(response.json());
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }
  getJopTypeFake() {
    const data = [
      { Id: 'J0001', Name: '医師' }, { Id: 'J0002', Name: '研修医' }, { Id: 'J0003', Name: '歯科医師' }, { Id: 'J0004', Name: '臨床検査技師' },
      { Id: 'J0005', Name: '診療放射線技師' }, { Id: 'J0006', Name: '臨床工学技士' }, { Id: 'J0007', Name: '理学療法士' }, { Id: 'J0008', Name: '作業療法士' },
      { Id: 'J0009', Name: '管理栄養士' }, { Id: 'J0010', Name: '栄養士' }, { Id: 'J0011', Name: '言語聴覚士' }, { Id: 'J0012', Name: '臨床心理士' },
      { Id: 'J0013', Name: '視能訓練士' }, { Id: 'J0014', Name: '義肢装具士' }, { Id: 'J0015', Name: '救急救命士' }, { Id: 'J0016', Name: '精神保健福祉士' },
      { Id: 'J0017', Name: '医療ソーシャルワーカー' }, { Id: 'J0018', Name: '医療コーディネーター' }, { Id: 'J0019', Name: 'ケアマネージャー' },
      { Id: 'J0020', Name: '産業カウンセラー' },
      { Id: 'J0021', Name: '心理カウンセラー' }, { Id: 'J0022', Name: '秘書' }, { Id: 'J0023', Name: '事務' }, { Id: 'J0024', Name: '看護師' },
      { Id: 'J0025', Name: '准看護師' }, { Id: 'J0026', Name: '看護助手' }, { Id: 'J0027', Name: '助産師' }, { Id: 'J0028', Name: '保健師' },
      { Id: 'J0029', Name: '薬剤師' }, { Id: 'J0030', Name: '薬剤師助手' }, { Id: 'J0031', Name: '歯科技工士' }, { Id: 'J0032', Name: '歯科衛生士' },
      { Id: 'J0033', Name: '歯科助手' }, { Id: 'J0034', Name: '介護福祉士' }, { Id: 'J0035', Name: '訪問介護員（ヘルパー）' }, { Id: 'J0036', Name: 'はり師' },
      { Id: 'J0037', Name: 'きゅう師' }, { Id: 'J0038', Name: 'あん摩マッサージ指圧師' }, { Id: 'J0039', Name: '柔道整復師' }, { Id: 'J0040', Name: '加圧トレーナー' },
      { Id: 'J0041', Name: '医師会職員' }, { Id: 'J0042', Name: '地方自治体職員' }, { Id: 'J0043', Name: '教員' }, { Id: 'J0044', Name: '医学生' },
      { Id: 'J0045', Name: '学生（医学生以外）' }, { Id: 'J0046', Name: '病棟クラーク' }, { Id: 'J9999', Name: 'その他' }
    ];
    return data;
  }
  getAuthority() {
    const data = {
      adminAuthority: [
        { id: 'MP_1', name: '全体管理者' },
        { id: 'MP_2', name: '所属管理者' },
        { id: 'MP_3', name: 'なし' }
      ],
      functionAuthority: [
        { id: 'FPS_1', name: '面会管理者' },
        { id: 'FPS_2', name: '仲介者' },
        { id: 'FPS_3', name: '面会スタッフ' },
        { id: 'FPS_4', name: 'なし' }
      ]
    };
    return data;
  }
  getProvince() {
    return new Observable(observer => {
      this.http.get('/api/ba/province')
        .subscribe((response: Response) => {
          observer.next(response.json());
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getProvinceFake() {
    const data = ['P001', 'P002', 'P003', 'P004', 'P005', 'P006', 'P007', 'P008', 'P009', 'P010', 'P011',
      'P012', 'P013', 'P014', 'P015', 'P016', 'P017', 'P018', 'P019', 'P020', 'P021', 'P022', 'P023', 'P024',
      'P025', 'P026', 'P027', 'P028', 'P029', 'P030', 'P031', 'P032', 'P033', 'P034', 'P035', 'P036', 'P037',
      'P038', 'P039', 'P040', 'P041', 'P042', 'P043', 'P044', 'P045', 'P046', 'P047'];
    return data;
  }

  getIndustryTypes() {
    const data = ['I0001', 'I0002', 'I0003', 'I0004', 'I0005', 'I0006', 'I0007', 'I0008', 'I9999'];
    return data;
  }

  getVisitNumber() {
    const data = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    return data;
  }

  meetingTopSelectOption() {
    const data = {
      meetingPresentation: [
        { id: 'ALL', name: 'すべて' },
        { id: 'MEETING', name: '面会' },
      ],
      requestSource: [
        { id: 'ALL', name: 'すべて', code: 0 },
        { id: 'DOCTOR', name: '自分', code: 1 },
        { id: 'MR', name: '取引先', code: 2 }
      ],
      status: [
        { id: 'ALL_MEETING', name: 'すべて', code: 5},
        { id: 'NEW', name: '未対応', code: 0},
        { id: 'REQUESTING', name: 'リクエスト中', code: 4},
        { id: 'FIXED', name: '確定', code: 1},
        { id: 'DONE', name: '終了', code: 3},
        { id: 'CANCELED', name: '中止', code: 2}
      ],
      sort: [
        { id: 'UPDATE', name: '更新順', code: 0},
        { id: 'FIXED_START', name: '面会日が近い順', code: 1},
        // { id: 'ORDER', name: '受信順', code: 2}
      ]
    };
    return data;
  }

  meetingPrTopSelectOption() {
    const data = {
      meetingPresentation: [
        { id: 'ALL', name: 'すべて' },
        { id: 'MEETING', name: '面会' },
      ],
      requestSource: [
        { id: 'ALL', name: 'すべて', code: 0},
        { id: 'DOCTOR', name: '医師からのリクエスト', code: 2},
        { id: 'MR', name: '自分からのリクエスト', code: 1}
      ],
      status: [
        { id: 'ALL_MEETING', name: 'すべて', code: 5},
        { id: 'NEW', name: '未対応', code: 0},
        { id: 'REQUESTING', name: 'リクエスト中', code: 4},
        { id: 'FIXED', name: '確定', code: 1},
        { id: 'CANCELED', name: '中止', code: 2},
        { id: 'DONE', name: '終了', code: 3}
      ],
      sort: [
        { id: 'UPDATE', name: '更新順', code: 0},
        { id: 'FIXED_START', name: '面会日が近い順', code: 1},
        // { id: 'ORDER', name: '受信順', code: 2}
      ]
    };
    return data;
  }

  isLoggedIn() {
    return this.authService.isLogin();
  }

  postMedical(model): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/am/init_office', JSON.stringify(model))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next();
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  postMedicalOffice(model): Observable<any> {
    return new Observable(observer => {
      this.http.post('/api/am/medical_office', JSON.stringify(model))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(response.json());
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  initData(): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/dr/create/data/test')
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next();
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  cancelMeeting(): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/dr/me/cancel_meeting_request_out_of_date', {})
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next();
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  createHoliday(model: any): Observable<any> {
    return new Observable(observer => {
      this.http.post('/api/dr/ca/save_holiday_event', JSON.stringify(model))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next();
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }
  getSettingMenuDr() {
    return new Observable(observer => {

      const next = [
        {
          name: 'MENU.GENERAL.LABEL', // 設定
          midCategories: [
            {
              name: 'MENU.GENERAL.PERSONAL.LABEL', // 個人情報編集
              items: [
                // ユーザー情報編集
                { name: 'MENU.ITEM.RE0020', path: '/re/user-edit', view:
                    {
                      'MP_1': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_2': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_3': [true, true, true, true, true, true, true, true, true, true, true]
                    },
                },
                // パスワード変更
                { name: 'MENU.ITEM.RE0019', path: '/re/password', view:
                    {
                      'MP_1': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_2': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_3': [true, true, true, true, true, true, true, true, true, true, true]
                    },
                },
              ]
            },
            {
              // 面会ルール設定
              name: 'MENU.GENERAL.MEETING.LABEL',
              items: [
                // 面会時間帯設定
                { name: 'MENU.ITEM.ME0016', path: '/me/me0016', view:
                    {
                      'MP_1': [true, false, false, false, false, false, true, true, true, true, false],
                      'MP_2': [true, false, false, false, false, false, true, true, true, true, false],
                      'MP_3': [true, false, false, false, false, false, true, true, true, true, false]
                    },
                },
                // 面会枠
                { name: 'MENU.ITEM.ME0018', path: '/me/me0018', view:
                    {
                      'MP_1': [true, false, false, false, false, false, true, true, true, true, false],
                      'MP_2': [true, false, false, false, false, false, true, true, true, true, false],
                      'MP_3': [true, false, false, false, false, false, true, true, true, true, false]
                    },
                },
                 // v2 自動承認
                 // { name: 'MENU.ITEM.ME0044', path: '/me/me0044', view:
                 //     {
                 //       'MP_1': [true, false, false, false, false, false, true, true, true, true, false],
                 //       'MP_2': [true, false, false, false, false, false, true, true, true, true, false],
                 //       'MP_3': [true, false, false, false, false, false, true, true, true, true, false]
                 //     },
                 // },
                // 面会に関する要望
                { name: 'MENU.ITEM.ME0021', path: '/me/me0021', view:
                    {
                      'MP_1': [true, false, false, false, false, false, true, true, true, true, false],
                      'MP_2': [true, false, false, false, false, false, true, true, true, true, false],
                      'MP_3': [true, false, false, false, false, false, true, true, true, true, false]
                    },
                },
              ]
            },
            {
              // カレンダー設定
              name: 'MENU.GENERAL.CALENDAR.LABEL',
              items: [
                // 自分の予定
                { name: 'MENU.ITEM.CA0006', path: '/ca/ca0006', view:
                    {
                      'MP_1': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_2': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_3': [true, true, true, true, true, true, true, true, true, true, true]
                    },
                },
                // グループの予定
                { name: 'MENU.ITEM.CA0008', path: '/ca/ca0008', view:
                    {
                      'MP_1': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_2': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_3': [true, true, true, true, true, true, true, true, true, true, true]
                    },
                },
                // スタッフとの共有設定
                { name: 'MENU.ITEM.CA0009', path: '/ca/ca0009', view:
                    {
                      'MP_1': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_2': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_3': [true, true, true, true, true, true, true, true, true, true, true]
                    },
                },
                // 外部カレンダー
                { name: 'MENU.ITEM.CA0010', path: '/ca/ca0010', view:
                    {
                      'MP_1': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_2': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_3': [true, true, true, true, true, true, true, true, true, true, true]
                    },
                },
              ]
            },
            {
              // 環境設定
              name: 'MENU.GENERAL.PREFERENCE.LABEL',
              items: [
                // サイドメニュー並び替え
                { name: 'MENU.ITEM.RE0001', path: '/re/side-menu-edit', view:
                    {
                      'MP_1': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_2': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_3': [true, true, true, true, true, true, true, true, true, true, true]
                    },
                },
                // 通知設定
                { name: 'MENU.ITEM.RE0021', path: '/re/notification', view:
                    {
                      'MP_1': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_2': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_3': [true, true, true, true, true, true, true, true, true, true, true]
                    },
                },
              ]
            },
            {
              // スタッフ
              name: 'MENU.GENERAL.STAFF.LABEL',
              items: [
                // スタッフ一覧
                { name: 'MENU.ITEM.RE0018', path: '/re/staff-list', view:
                    {
                      'MP_1': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_2': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_3': [true, true, true, true, true, true, true, true, true, true, true]
                    },
                }
              ]
            }
          ]
        },
        {
          name: 'MENU.ADMIN.LABEL', // 管理者メニュー
          midCategories: [
            {
              name: 'MENU.ADMIN.SUPPLIER.LABEL', // 取引先管理
              items: [
                // 面会ルール
                { name: 'MENU.ITEM.ME0023', path: '/me/me0023', view: {
                    'MP_1': [false, true, false, false, false, false, false, true, false, false, false],
                    'MP_2': [false, true, false, false, false, false, false, true, false, false, false],
                    'MP_3': [false, true, false, false, false, false, false, true, false, false, false]
                  }
                },
                // 面会時間帯設定
                { name: 'MENU.ITEM.ME0017', path: '/me/me0017', view: {
                    'MP_1': [false, true, false, false, false, false, false, true, false, false, false],
                    'MP_2': [false, true, false, false, false, false, false, true, false, false, false],
                    'MP_3': [false, true, false, false, false, false, false, true, false, false, false]
                  }
                },
                // 本人確認/訪問制限
                // TODO 採用薬管理の機能IDが不明
                { name: 'MENU.ITEM.ME0014', path: '/me/me0014', view: {
                    'MP_1': [false, true, false, false, false, false, false, true, false, false, false],
                    'MP_2': [false, true, false, false, false, false, false, true, false, false, false],
                    'MP_3': [false, true, false, false, false, false, false, true, false, false, false]
                  }
                },
              ]
            },
            {
              // 病院管理
              name: 'MENU.ADMIN.OFFICE.LABEL',
              items: [
                // 所属編集
                { name: 'MENU.ITEM.RE0017', path: '/re/node-edit', view:
                    {
                      'MP_1': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_2': [false, false, false, false, false, false, false, false, false, false, false],
                      'MP_3': [false, false, false, false, false, false, false, false, false, false, false]
                    },
                },
                // スタッフ編集
                { name: 'MENU.ITEM.RE0014', path: '/re/staff-admin', view:
                    {
                      'MP_1': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_2': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_3': [false, false, false, false, false, false, false, false, false, false, false]
                    },
                },
                // 一括招待
                { name: 'MENU.ITEM.RE0015', path: '/re/staff-invite', view:
                    {
                      'MP_1': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_2': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_3': [false, false, false, false, false, false, false, false, false, false, false]
                    },
                },
                // 仲介者の担当医師を設定
                { name: 'MENU.ITEM.ME0015', path: '/me/me0015', view:
                    {
                      'MP_1': [false, false, false, false, false, false, true, true, true, false, false],
                      'MP_2': [false, false, false, false, false, false, true, true, true, false, false],
                      'MP_3': [false, false, false, false, false, false, true, false, false, false, false]
                    },
                },
                // スタッフの面会ルール設定
                { name: 'MENU.ITEM.ME0010', path: '/me/me0010', view:
                    {
                      'MP_1': [false, true, false, false, false, false, true, true, true, false, false],
                      'MP_2': [false, true, false, false, false, false, true, true, true, false, false],
                      'MP_3': [false, false, false, false, false, false, true, false, false, false, false]
                    },
                },
                // 権限付与
                { name: 'MENU.ITEM.RE0030', path: '/re/re0030', view:
                    {
                      'MP_1': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_2': [true, true, true, true, true, true, true, true, true, true, true],
                      'MP_3': [false, false, false, false, false, false, false, false, false, false, false]
                    },
                },
              ]
            }
          ]
        }
      ];

      this.checkSettingMenuDr(
        this.userSession.managementAuthority,
        this.userSession.funcAuthority,
        this.userSession.funcAuthoritySet,
        next
      );

      this.loginUserInfoMessageSubscription = this.loginUserInfoMessage.get().subscribe(res => {
        this.checkSettingMenuDr(res.managementAuthority, res.authorities, res.funcAuthority, next);
      });

      observer.next(next);
      observer.complete();
    });
  }

  checkSettingMenuDr(managementAuthority: string, authorities: any, funcAuthority: string, next: any[]) {

    console.log('*****権限****');
    console.log('managementAuthority:', managementAuthority);
    console.log('authorities:', authorities);
    console.log('funcAuthority:', funcAuthority);

    // メニュー非表示
    next.forEach(value => {
      if (value.midCategories) {
        value.midCategories.forEach(val => {
          if (val.items) {
            val.items.forEach(v => {
              if (v.view[managementAuthority]) {
                let count = 0;
                v.view[managementAuthority].forEach((j, k) => {
                  if (
                    (authorities.FP_1 && k === 0 && j) ||
                    (authorities.FP_2 && k === 1 && j) ||
                    (authorities.FP_3 && k === 2 && j) ||
                    (authorities.FP_4 && k === 3 && j) ||
                    (authorities.FP_5 && k === 4 && j) ||
                    (authorities.FP_6 && k === 5 && j) ||
                    (authorities.FP_7 && k === 6 && j) ||
                    (funcAuthority === FuncAuthoritySet.FPS_1 && k === 7 && j) ||
                    (funcAuthority === FuncAuthoritySet.FPS_2 && k === 8 && j) ||
                    (funcAuthority === FuncAuthoritySet.FPS_3 && k === 9 && j) ||
                    (funcAuthority === FuncAuthoritySet.FPS_4 && k === 10 && j) ||
                    (funcAuthority === FuncAuthoritySet.FPS_0 && authorities.FP_1 && k === 0 && j) ||
                    (funcAuthority === FuncAuthoritySet.FPS_0 && authorities.FP_2 && k === 1 && j) ||
                    (funcAuthority === FuncAuthoritySet.FPS_0 && authorities.FP_3 && k === 2 && j) ||
                    (funcAuthority === FuncAuthoritySet.FPS_0 && authorities.FP_4 && k === 3 && j) ||
                    (funcAuthority === FuncAuthoritySet.FPS_0 && authorities.FP_5 && k === 4 && j) ||
                    (funcAuthority === FuncAuthoritySet.FPS_0 && authorities.FP_6 && k === 5 && j) ||
                    (funcAuthority === FuncAuthoritySet.FPS_0 && authorities.FP_7 && k === 6 && j) ||
                    (funcAuthority === FuncAuthoritySet.FPS_0 &&
                      Object.keys(authorities).length === 0 && k === 10 && j)
                  ) {
                    count++;
                  }
                });
                v['display'] = count > 0;
              }
            });
          }
        });
      }
    });
    // 中カテゴリ非表示
    next.forEach(value => {
      if (value.midCategories) {
        value.midCategories.forEach((val, idx) => {
          if (val.items) {
            let count = 0;
            val.items.forEach(v => {
              if (v.display) {
                count++;
              }
            });
            value.midCategories[idx].display = count > 0;
          }
        });
      }
    });
    // 大カテゴリ非表示
    next.forEach(value => {
      if (value.midCategories) {
        let count = 0;
        value.midCategories.forEach((val, idx) => {
          if (val.display) {
            count++;
          }
        });
        value.display = count > 0;
      }
    });
  }

  getSettingMenuPr() {
    return new Observable(observer => {

      const next = [
        {
          name: 'MENU.GENERAL.LABEL', // 設定
          midCategories: [
            {
              name: 'MENU.GENERAL.PERSONAL.LABEL', // ユーザー情報編集
              items: [
                // ユーザー情報編集
                { name: 'MENU.ITEM.RE0010', path: '/re/re0010' },
                // パスワード変更
                { name: 'MENU.ITEM.RE0009', path: '/re/re0009' },

                // 担当薬剤
                { name: 'MENU.ITEM.ME0035', path: '/me/me0035' },
                // 担当病院
                { name: 'MENU.ITEM.RE0012', path: '/re/re0012' },
                // 入退館カード
                { name: 'MENU.ITEM.ME5008', path: '/me/me5008' }
              ]
            },
            {
              // カレンダー設定
              name: 'MENU.GENERAL.CALENDAR.LABEL',
              items: [
                // 自分の予定
                { name: 'MENU.ITEM.CA0017', path: '/ca/ca0017' },
                // 外部カレンダー
                { name: 'MENU.ITEM.CA0021', path: '/ca/ca0017', fragment: 'ca0021' },
              ]
            },
            {
              // 環境設定
              name: 'MENU.GENERAL.PREFERENCE.LABEL',
              items: [
                // 通知設定
                { name: 'MENU.ITEM.RE0011', path: '/re/re0011' }
              ]
            },
            {
              // 社員情報
              name: 'MENU.GENERAL.EMPLOYEE.LABEL',
              items: [
                // 社員一覧
                { name: 'MENU.ITEM.RE0027', path: '/re/re0027' },
                // 社員招待
                { name: 'MENU.ITEM.RE0026', path: '/re/re0026' }
              ]
            }
          ]
        }
      ];

      this.checkSettingMenuPr(next);

      observer.next(next);
      observer.complete();

    });
  }

  checkSettingMenuPr(next: any[]) {
    // display追加
    next.forEach(value => {
      value.display = true;
      value.midCategories.forEach(val => {
        val.display = true;
        val.items.forEach(v => {
          v.display = true;
        });
      })
    });
  }


}
