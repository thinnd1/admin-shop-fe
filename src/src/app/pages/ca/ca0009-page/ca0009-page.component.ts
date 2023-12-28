import {Component, HostListener, OnInit} from '@angular/core';
import {CalendarService} from '../../../services/calendar.service';
import {SettingsSelfSettings} from '../../../models/ca/settings-self-settings';
import {Observable} from 'rxjs/Observable';
import {Http, Response} from '@angular/http';
import 'rxjs/add/observable/of';
import {HttpError} from '../../../common/error/http.error';
import {TranslateService} from '@ngx-translate/core';
import {OptionColorComponent} from '../../../components/option-color/option-color.component';
import {EventSaveStaffCalendarSetting} from '../../../models/ca/event-save-staff-calendar-setting';
import {EventSearchStaff} from '../../../models/ca/event-search-staff';
import {SettingsReferencedUser} from '../../../models/ca/settings-referenced-user';
import {SettingsSelfSettingsSaveResult} from '../../../models/ca/settings-self-settings-save-result';
import {HttpStatus} from '../../../common/http.status';
import {Router} from '@angular/router';
import {LocalStorage} from '../../../services/local-storage.service';
import {EventGetShareStatus} from '../../../models/ca/event-get-share-status';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';

@Component({
  selector: 'app-ca0009-page',
  templateUrl: './ca0009-page.component.html',
  styleUrls: ['../ca0006-page/ca0006-page.component.scss'],
  providers: [OptionColorComponent]
})

export class Ca0009PageComponent implements OnInit {
  modelListCalendarReFerents = new SettingsSelfSettings();
  modelSaveStaffCalendarSetting = new EventSaveStaffCalendarSetting([], 0, []);
  dataStaffCalendarSettings: EventSaveStaffCalendarSetting;
  modelReferencedUser = new SettingsReferencedUser();
  type: string;
  listReferencedUserDelete = [];
  listReferencedUserRemoveHand = [];
  shareLevels = [{'name': 'DENY', 'value': 0}, {'name': 'EDITABLE', 'value': 3}, {'name': 'READ_ONLY', 'value': 2},
    {'name': 'SCHEDULE_ONLY', 'value': 1}];
  shareStatus: number;
  canShare = [{'ON': 1}, {'OFF': 0}];
  disabledLevelShare: any;
  shareLevelsOutputs = [];
  listDataSaveCalendarReFerents: any = [];
  flag: boolean;
  activeConfirmDialog: boolean;
  shareStatusTemporary: any;
  getDataStorage: any;

  optionEventColor: any;
  calendarReferent: any;
  checkTab: boolean;

  constructor(private calendarService: CalendarService, private dialogService: DialogService,
              private translateService: TranslateService, private  optionColorComponent: OptionColorComponent,
              private http: Http, private router: Router, public localStorage: LocalStorage, private firebaseStorage: FirebaseStorage) {
    this.type = 'staff';
    this.localStorage.setObject('activeConfirmDialog', false);
  }

  async ngOnInit() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.shareLevels = this.tranSlateLevelShare(this.shareLevels);
    this.shareLevelsOutputs = this.shareLevels.filter(res => res.value > 0);
    setTimeout(() => {
      this.dialogService.setLoaderVisible(false);
    });
    $('.check-box .btn').on('click', function () {
      $(this).addClass('btn-primary-active').siblings().removeClass('btn-primary-active');
    });
    await this.getCalendarReferences();
    await this.getReferencedUsers();
    this.getShareStatus();
  }

  // GET /dr/ca/get_calendar_references
  getCalendarReferences() {
    return new Promise((resolve, reject) => {
      this.calendarService.getSettingsSelfSettings(this.type).subscribe((settings: SettingsSelfSettings) => {
        this.modelListCalendarReFerents = settings;
        this.modelListCalendarReFerents = this.formatNameReferences(this.modelListCalendarReFerents);
        this.modelListCalendarReFerents = this.optionColorComponent.convertOptionColorToString(this.modelListCalendarReFerents);
        resolve();
      }, (error: HttpError) => {
        console.log(error);
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.CA0002.E000_2');
        reject(error);
      });
    });
  }

  formatNameReferences(modelListCalendarReFerents) {
    let shareStatus;
      modelListCalendarReFerents.items.forEach((value, key) => {
        shareStatus = value['shareStatus'];
        switch (value['shareStatus']) {
          case 'EDITABLE':
            value['userName'] = value['lastName'] + ' ' + value['firstName'] + 'さん (予定の編集が可能)';
            break;
          case 'READ_ONLY':
            value['userName'] = value['lastName'] + ' ' + value['firstName'] + 'さん (閲覧のみ)';
            break;
          case 'SCHEDULE_ONLY':
            value['userName'] = value['lastName'] + ' ' + value['firstName'] + 'さん (予定の時間のみを表示)';
            break;
        }
      });
    return modelListCalendarReFerents;
  }

  // GET /dr/ca/get_referenced_users
  getReferencedUsers() {
    return new Promise((resolve, reject) => {
      this.calendarService.getReferencedUsers().subscribe((settingsSelfSettings: SettingsReferencedUser) => {
        this.modelReferencedUser = settingsSelfSettings;
        if (this.modelReferencedUser.items !== null) {
          this.modelReferencedUser = this.formatNameReferencedUser(this.modelReferencedUser);
        }
        resolve();
      }, (error: HttpError) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.CA0009.E000_1');
        reject(error);
      });
    });
  }

  formatNameReferencedUser(modelReferencedUser) {
    modelReferencedUser.items.forEach((value) => {
      value['userName'] = value['lastName'] + ' ' + value['firstName'] + 'さん';
    });
    return modelReferencedUser;
  }

  // GET /dr/ca/get_share_status
  getShareStatus() {
    return new Promise((resolve, reject) => {
      this.calendarService.getShareStatus().subscribe((reponse: EventGetShareStatus) => {
        this.shareStatus = reponse.status;
        console.log('shareStatus' + this.shareStatus);
        if (this.shareStatus === 0) {
          this.disabledLevelShare = true;
        }
        resolve();
      }, (error: HttpError) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.CA0009.E000_2');
        reject(error);
      });
    });
  }

  autocompleListFormatter(data: any) {
    let html;
    html = `<span class='hover-result-search d-block px-2 py-1'><img class='rounded-circle avatar-img-bordered avatar-img-40' src='${data['imageUrl']}'> ${data['lastName']} ${data['firstName']}さん</span>`;
    return html;
  }

  formatNameStaffSearch() {
    return ``;
  }

  addUserReferencing(userReferencing) {
    let checkUser;
    checkUser = true;
    if (typeof userReferencing.userId !== 'undefined' && userReferencing.userId !== '') {
      this.modelListCalendarReFerents.items.forEach((value) => {
        if (userReferencing.userId === value['userId']) {
          checkUser = false;
        }
      });
      if (checkUser) {
        userReferencing['color'] = this.chooseColorForStaff();
        switch (userReferencing['shareStatus']) {
          case 'EDITABLE':
            userReferencing['userName'] = userReferencing['lastName'] + ' ' + userReferencing['firstName'] + 'さん (予定の編集が可能)';
            break;
          case 'READ_ONLY':
            userReferencing['userName'] = userReferencing['lastName'] + ' ' + userReferencing['firstName'] + 'さん (閲覧のみ)';
            break;
          case 'SCHEDULE_ONLY':
            userReferencing['userName'] = userReferencing['lastName'] + ' ' + userReferencing['firstName'] + 'さん (予定の時間のみを表示)';
            break;
        }
        this.modelListCalendarReFerents.items.push(userReferencing);
        this.localStorage.setObject('activeConfirmDialog', true);
        this.optionColorComponent.convertOptionColorToString(this.modelListCalendarReFerents);
      }
    }
  }

  observableSource = (keyword: any): Observable<EventSearchStaff[]> => {
    const url = '/api/dr/ca/search_staff?keyword=' + encodeURIComponent(keyword);
    if (keyword !== '') {
      return this.http.get(url).map((res: Response) => {
        if (res.json().items) {
          const listResult = this.checkStaffExists(res.json().items);
          const defaultPath = '/assets/img/user-no-image.png';
          for ( let i = 0; i < listResult.length; i++) {
            if (listResult[i].imageUrl) {
              this.firebaseStorage.downloadURL(listResult[i].imageUrl).subscribe(
                (resultUrl) => {
                  listResult[i].imageUrl = resultUrl;
                }, (error) => {
                  listResult[i].imageUrl = defaultPath;
                });
            } else {
              listResult[i].imageUrl = defaultPath;
            }
          }
          return listResult;
        } else {
          return [];
        }
      });
    } else {
      return Observable.of([]);
    }
  }

  checkStaffExists(listResultSearchStaffs) {
    this.modelListCalendarReFerents.items.forEach((value2) => {
      listResultSearchStaffs.forEach((value1, key1) => {
        if (value2['userId'] === value1['userId']) {
          listResultSearchStaffs.splice(key1, 1);
        }
      });
    });
    return listResultSearchStaffs;
  }

  chooseColorForStaff() {
    const colorReferencingUsers = [];
    let staffColor;
    this.modelListCalendarReFerents.items.forEach((value) => {
      colorReferencingUsers.push(value['color']);
    });
    const listColorRandomInt = [];
    this.optionColorComponent.colorRandomToInt().forEach((value) => {
      listColorRandomInt.push(value['colorInt']);
    });
    staffColor = listColorRandomInt[Math.floor(Math.random() * listColorRandomInt.length)];
    staffColor = parseInt(staffColor, 0);
    return staffColor;
  }

  removeReferencingUser(index: number) {
    this.modelListCalendarReFerents.items.splice(index, 1);
    this.localStorage.setObject('activeConfirmDialog', true);
  }

  remmoveReferencedUser(referencedUser: SettingsReferencedUser, index: number) {
    const nameStaffReplace = referencedUser.lastName + ' ' + referencedUser.firstName + 'さん';
    this.translateService.get('MSG.CA0009').subscribe((res) => {
      const nameStaff = res['ALERT_REMOVE_STAFF'].replace('nameStaff', nameStaffReplace);
      this.dialogService.showMessage('warning', false, nameStaff, null, null, 'MSG.YES', 'MSG.NO').subscribe(
        (resp: DialogResult) => {
          if (resp.isOk()) {
            this.modelReferencedUser.items.splice(index, 1);
            this.listReferencedUserRemoveHand.push(referencedUser['userId']);
            this.localStorage.setObject('activeConfirmDialog', true);
          }
        });
    });
  }

  changeCanShare(shareStatus) {
    if (shareStatus === this.canShare[1]['OFF']) {
      this.disabledLevelShare = true;
      if (this.modelReferencedUser.items !== null) {
        this.listReferencedUserDelete.length = 0;
        this.modelReferencedUser.items.forEach((listReferencedUser: string) => {
          this.listReferencedUserDelete.push(listReferencedUser['userId']);
        });
      }
      this.flag = true;
      this.shareStatusTemporary = this.shareStatus;
      this.localStorage.setObject('activeConfirmDialog', true);
    } else if (shareStatus === this.canShare[0]['ON']) {
      this.listReferencedUserDelete.length = 0;
      if (this.flag) {
        this.shareStatus = this.shareStatusTemporary;
      }
      if (this.shareStatus === 0) {
        this.shareStatus = 1;
      }
      this.flag = false;
      this.disabledLevelShare = false;
      this.localStorage.setObject('activeConfirmDialog', true);
    }
  }

  async postSettingsStaffSettings() {
    if (this.disabledLevelShare) {
      await this.getPopupDeleteUserReferenced();
    }
    this.dataStaffCalendarSettings = this.formatDataBeforeSave();
    this.getDataStorage = this.localStorage.getObject('viewCalendar');
    this.calendarService.saveStaffCalendarSettings(this.dataStaffCalendarSettings).subscribe(
      (respone: SettingsSelfSettingsSaveResult) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        if (respone.status === HttpStatus.OK) {
          setTimeout(() => {
            this.dialogService.showMessage('success', false, null, 'MSG.SAVED', null, 'OK', null).subscribe(
              (resp: DialogResult) => {
                if (resp.isOk()) {
                  this.router.navigate(['ca/ca0002']);
                }
              });
          }, 300);
        }
      }, (error: HttpError) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        console.log(error);
        if (error.contains('MSG.CA0009.E001_2')) {
          this.dialogService.showError('MSG.CA0009.E001_2');
        }
      });
  }

  getPopupDeleteUserReferenced() {
    return new Promise((resolve) => {
      const offShareContent = this.translateService.instant('MSG.CA0009.ALERT_OFF_SHARE');
      this.dialogService.showMessageSize('warning', false, null, null, offShareContent, 'MSG.YES', 'MSG.NO', null, 'modal-lg').subscribe(
        (result: DialogResult) => {
          if (result.isOk()) {
            resolve();
          }
        });
    });
  }

  formatDataBeforeSave() {
    this.listDataSaveCalendarReFerents = [];
    if (this.disabledLevelShare) {
      this.shareStatus = this.shareLevels[0].value;
      this.modelSaveStaffCalendarSetting.referencedUserIdsList = this.listReferencedUserDelete;
    } else {
      this.modelSaveStaffCalendarSetting.referencedUserIdsList = this.listReferencedUserRemoveHand;
    }
    this.modelListCalendarReFerents.items.forEach((value) => {
      const referencingUser = {};
      referencingUser['userId'] = value['userId'];
      referencingUser['color'] = value['color'];
      referencingUser['visible'] = 'true';
      this.listDataSaveCalendarReFerents.push(referencingUser);
    });
    this.modelSaveStaffCalendarSetting.referencingUsersList = this.listDataSaveCalendarReFerents;
    this.modelSaveStaffCalendarSetting.status = this.shareStatus;
    return this.modelSaveStaffCalendarSetting;
  }

  tranSlateLevelShare(levelShare) {
    this.translateService.get('CA0009').subscribe((res) => {
      levelShare.forEach((value: string) => {
        switch (value['name']) {
          case 'EDITABLE':
            value['name'] = res['EDITABLE'];
            break;
          case 'READ_ONLY':
            value['name'] = res['READ_ONLY'];
            break;
          case 'SCHEDULE_ONLY':
            value['name'] = res['SCHEDULE_ONLY'];
            break;
        }
      });
    });
    return levelShare;
  }

  gotoHelp() {
    this.router.navigateByUrl('/he/he0011');
  }

  getDisplayPopUpColorCalendar(event: any, calendarReferent: any) {
    this.optionEventColor = event;
    this.calendarReferent = calendarReferent;
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea' && this.checkTab) {
  //     this.postSettingsStaffSettings();
  //   }
  // }
  //
  // @HostListener('document:click', ['$event'])
  // handleClickEvent(event) {
  //   let tab = [];
  //   let ca0009Tab = '';
  //   this.translateService.get(['CA0006', 'CA0008' , 'CA0009', 'CA0010']).subscribe(msg => {
  //     tab = [
  //       msg.CA0006.MY_SCHEDULE,
  //       msg.CA0008.GROUP_SCHEDULE,
  //       msg.CA0009.SHARING_SETTINGS_WITH_STAFF,
  //       msg.CA0010.EXTERNAL_CALENDAR
  //     ];
  //     ca0009Tab = msg.CA0009.SHARING_SETTINGS_WITH_STAFF;
  //   });
  //   if (tab.indexOf(event.target.outerText) > -1) {
  //     if (ca0009Tab.indexOf(event.target.outerText) > -1) {
  //       this.checkTab = true;
  //     } else {
  //       this.checkTab = false;
  //     }
  //   }
  // }
}
