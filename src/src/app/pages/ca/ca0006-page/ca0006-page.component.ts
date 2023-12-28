import {Component, OnDestroy, OnInit} from '@angular/core';
import {CalendarService} from '../../../services/calendar.service';
import {SettingsSelfSettings} from '../../../models/ca/settings-self-settings';
import {EventSaveCalendarReferences} from '../../../models/ca/event-save-calendar-references';
import {TranslateService} from '@ngx-translate/core';
import {OptionColorComponent} from '../../../components/option-color/option-color.component';
import {LocalStorage} from '../../../services/local-storage.service';
import {HttpError} from '../../../common/error/http.error';
import {CalendarCommon} from '../../../common/calendar-common';
import {ActivatedRoute, Router} from '@angular/router';
import {SettingsSelfSettingsSaveResult} from '../../../models/ca/settings-self-settings-save-result';
import {HttpStatus} from '../../../common/http.status';
import {Location} from '@angular/common';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';
import {SharedValueService} from '../../../services/shared-value.service';
import {UserSession} from '../../../models/ba/user-session';

declare const $: any;

@Component({
  selector: 'app-ca0006-page',
  templateUrl: './ca0006-page.component.html',
  styleUrls: ['./ca0006-page.component.scss'],
  providers: [OptionColorComponent, CalendarCommon]
})
export class Ca0006PageComponent implements OnInit, OnDestroy {
  modelListCalendarReferences = new SettingsSelfSettings();
  modelEventSaveCalendarReferences = new EventSaveCalendarReferences();
  translateTitle = {};
  type: string;
  changeStatus: string;
  getDataStorage: any;
  currentTap: number;
  weekStart: number;

  optionEventColor: any;
  calendarReferent: any;
  userSession: UserSession;

  constructor(private calendarService: CalendarService, private dialogService: DialogService,
              private translateService: TranslateService, private  optionColorComponent: OptionColorComponent,
              public localStorage: LocalStorage, private router: Router, private activatedRoute: ActivatedRoute,
              private location: Location, private shareValueService: SharedValueService) {
    this.type = 'my';
    this.userSession = this.shareValueService.getUserSession();
  }

  ngOnInit() {
    if (this.localStorage.getObject('viewCalendar')) {
      this.getDataStorage = this.localStorage.getObject('viewCalendar');
    } else {
      this.getDataStorage = {'defaultView': 0, 'weekStart': 0};
      this.localStorage.setObject('viewCalendar', this.getDataStorage);
    }
    this.translateService.get('CA0006').subscribe((res) => {
      this.translateTitle = res;
    });
    this.getSettingsSelfSettings();
    if (this.activatedRoute.snapshot.url[1].path === 'ca0008') {
      this.currentTap = 2;
    } else if (this.activatedRoute.snapshot.url[1].path === 'ca0009') {
      this.currentTap = 3;
    } else if (this.activatedRoute.snapshot.url[1].path === 'ca0010') {
      this.currentTap = 4;
    } else {
      if (this.activatedRoute.snapshot.url[1].path === 'ca0006') {
        this.currentTap = 1;
      }
    }

    if (location.hash === "#ca0010") {
      this.currentTap = 4;
    }
    const calendarSettingTap = this.localStorage.getObject('calendarSettingTap');
    this.localStorage.remove('calendarSettingTap');
    if (calendarSettingTap && calendarSettingTap.tap === 3) {
      this.currentTap = 3;
    }
  }

  ngOnDestroy() {
    this.localStorage.remove('activeConfirmDialog');
  }

  getSettingsSelfSettings() {
    this.calendarService.getSettingsSelfSettings(this.type).subscribe((settings: SettingsSelfSettings) => {
      this.modelListCalendarReferences = settings;
      this.modelListCalendarReferences = this.translateCalendarName(this.modelListCalendarReferences);
      this.modelListCalendarReferences = this.optionColorComponent.convertOptionColorToString(this.modelListCalendarReferences);
    }, (error: HttpError) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.CA0006.E000_1');
    });
  }

  async postSettingsSelfSettings(calendarReferentUpdate) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.modelEventSaveCalendarReferences.calendarReferences = [];
    calendarReferentUpdate.forEach((value: string) => {
      const newCalendar = {};
      newCalendar['id'] = value['id'];
      newCalendar['color'] = value['color'];
      newCalendar['visible'] = value['visible'];
      this.modelEventSaveCalendarReferences.calendarReferences.push(newCalendar);
    });
    const dataStorage = {'defaultView': this.getDataStorage.defaultView, 'weekStart': this.getDataStorage.weekStart};
    this.localStorage.setObject('viewCalendar', dataStorage);
    const result = await this.settingsSelfSettings();
    if (result.result === HttpStatus.OK) {
      this.dialogService.showMessage('success', false, null, 'MSG.SAVED', null, 'OK', null).subscribe(
        (resp: DialogResult) => {
          if (resp.isOk()) {
            this.router.navigate(['ca/ca0002']);
          }
        });
    }
  }

  settingsSelfSettings(): Promise<any> {
    let promise;
    promise = new Promise((resolve, reject) => {
      this.calendarService.postSettingsSelfSettings(this.modelEventSaveCalendarReferences).subscribe(
        (respone: SettingsSelfSettingsSaveResult) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          resolve({'result': respone.status});
        }, (error: HttpError) => {
          if (error) {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(false);
            });
            this.dialogService.showError('MSG.CA0006.E001_1');
            reject();
          }
        }
      );
    });
    return promise;
  }

  translateCalendarName(translateCalendarReference) {
    translateCalendarReference.items.forEach((value: string) => {
      switch (value['calendarType']) {
        case 'MY':
          value['nameCalendarType'] = this.translateTitle['MY'];
          break;
        case 'MEETING_DECIDED':
          value['nameCalendarType'] = this.translateTitle['MEETING_DECIDED'];
          break;
        case 'MEETING_ACCEPTING':
          value['nameCalendarType'] = this.translateTitle['MEETING_ACCEPTING'];
          break;
        case 'MEETING_MEDIATOR':
          value['nameCalendarType'] = this.translateTitle['MEETING_MEDIATOR'];
          break;
        case 'VISIT':
          value['nameCalendarType'] = this.translateTitle['VISIT'];
          break;
        case 'SOCIETY':
          value['nameCalendarType'] = this.translateTitle['SOCIETY'];
          break;
        case 'HOLIDAY':
          value['nameCalendarType'] = this.translateTitle['HOLIDAY'];
          break;
        case 'EXTERNAL':
          value['nameCalendarType'] = 'EXTERNAL';
          break;
      }
    });
    return translateCalendarReference;
  }

  changeSettingWeekStart(weekStartSelected: number) {
    this.getDataStorage.weekStart = weekStartSelected;
    this.localStorage.setObject('activeConfirmDialog', true);
  }

  changeSettingDefault(defaultViewSelected: number) {
    this.getDataStorage.defaultView = defaultViewSelected;
    this.localStorage.setObject('activeConfirmDialog', true);
  }

  changeVisible(listCalendarReFerent) {
    listCalendarReFerent.visible = !listCalendarReFerent.visible;
    this.localStorage.setObject('activeConfirmDialog', true);
  }

  goToBack() {
    const message = this.translateService.instant('MSG.CA0006.BACK_CURRENT_PAGE');
    this.dialogService.showMessage('warning', false, null, null, message, 'MSG.YES', 'MSG.NO').subscribe(
      (resp) => {
        if (resp.isOk()) {
          this.location.back();
        }
      });
  }

  getDisplayPopUpColorCalendar(event: any, calendarReferent: any) {
    this.optionEventColor = event;
    this.calendarReferent = calendarReferent;
  }
}
