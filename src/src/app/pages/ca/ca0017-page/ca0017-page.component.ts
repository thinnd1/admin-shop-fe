import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {CalendarService} from '../../../services/calendar.service';
import {SettingsSelfSettings} from '../../../models/ca/settings-self-settings';
import {EventSaveCalendarReferences} from '../../../models/ca/event-save-calendar-references';
import {TranslateService} from '@ngx-translate/core';
import {DialogService} from '../../../services/dialog.service';
import {OptionColorComponent} from '../../../components/option-color/option-color.component';
import {LocalStorage} from '../../../services/local-storage.service';
import {HttpError} from '../../../common/error/http.error';
import {CalendarCommon} from '../../../common/calendar-common';
import { Router, ActivatedRoute } from '@angular/router';
import {SettingsSelfSettingsSaveResult} from '../../../models/ca/settings-self-settings-save-result';
import {HttpStatus} from '../../../common/http.status';
import {Location} from '@angular/common';

@Component({
  selector: 'app-ca0017-page',
  templateUrl: './ca0017-page.component.html',
  styleUrls: ['./ca0017-page.component.scss'],
  providers: [OptionColorComponent, CalendarCommon]
})

export class Ca0017PageComponent implements OnInit, OnDestroy {
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
  checkTab: boolean;

  constructor(private calendarService: CalendarService, private dialogService: DialogService,
              private translateService: TranslateService, private  optionColorComponent: OptionColorComponent,
              public localStorage: LocalStorage, private router: Router, private location: Location,
              private activatedRoute: ActivatedRoute
            ) {
    this.type = 'my';
    this.localStorage.setObject('activeConfirmDialog', false);
    this.router.events.subscribe(
      ev => {
        if (window.location.hash === '') {
          this.currentTap = 1;
        }else if (window.location.hash === '#ca0021') {
          this.currentTap = 4;
        }
      }
    );
    this.router.events.subscribe((event) => {
      if (event['url'] === '/ca/ca0017') {
        this.checkTab = true;
      }
    });
  }

  ngOnInit() {
    if (this.localStorage.getObject('viewCalendarPr')) {
      this.getDataStorage = this.localStorage.getObject('viewCalendarPr');
    } else {
      this.getDataStorage = {'defaultView': 0, 'weekStart': 0};
      this.localStorage.setObject('viewCalendarPr', this.getDataStorage);
    }
    this.translateService.get('CA0006').subscribe((res) => {
      this.translateTitle = res;
    });
    this.getSettingsSelfSettings();
    this.currentTap = 1;

    if (this.activatedRoute.snapshot.url[1].path === 'ca0017') {
      this.currentTap = 1;
    }

    if (location.hash === '#ca0021') {
      this.currentTap = 4;
    }
  }

  ngOnDestroy() {
    this.localStorage.remove('activeConfirmDialog');
  }

  getSettingsSelfSettings() {
    this.calendarService.getSettingsSelfSettingsPr(this.type).subscribe((settings: SettingsSelfSettings) => {
      this.modelListCalendarReferences = settings;
      this.modelListCalendarReferences = this.translateCalendarName(this.modelListCalendarReferences);
      this.modelListCalendarReferences = this.optionColorComponent.convertOptionColorToString(this.modelListCalendarReferences);
      console.log(this.modelListCalendarReferences);
    }, (error: HttpError) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      console.log(error);
      this.dialogService.showError('MSG.CA0006.E000_1');
    });
  }

  async postSettingsSelfSettings(calendarReferentUpdate) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    // this.optionColorComponent.removePopoverBeforeSave();
    this.modelEventSaveCalendarReferences.calendarReferences = [];
    calendarReferentUpdate.forEach((value: string) => {
      const newCalendar = {};
      newCalendar['id'] = value['id'];
      newCalendar['color'] = value['color'];
      newCalendar['visible'] = value['visible'];
      this.modelEventSaveCalendarReferences.calendarReferences.push(newCalendar);
    });
    const dataStorage = {'defaultView': this.getDataStorage.defaultView, 'weekStart': this.getDataStorage.weekStart};
    this.localStorage.setObject('viewCalendarPr', dataStorage);
    const result = await this.settingsSelfSettings();
    if (result.result === HttpStatus.OK) {
      this.dialogService.showMessage('success', false, null, 'MSG.SAVED', null, 'OK', null).subscribe(
        (resp) => {
          if (resp.isOk()) {
            this.router.navigate(['ca/ca0014']);
          }
        });
    }
  }

  settingsSelfSettings(): Promise<any> {
    let promise;
    promise = new Promise((resolve, reject) => {
      this.calendarService.postSettingsSelfSettingsPr(this.modelEventSaveCalendarReferences).subscribe(
        (response: SettingsSelfSettingsSaveResult) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          resolve({'result': response.status});
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

  getDisplayPopUpColorCalendar(event: any, calendarReferent: any) {
    this.optionEventColor = event;
    this.calendarReferent = calendarReferent;
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

  // @HostListener('document:click', ['$event'])
  // handleClickEvent(event) {
  //   let content1 = '';
  //   let content4 = '';
  //   this.translateService.get(['CA0006', 'CA0010']).subscribe(msg => {
  //     content4 = msg.CA0010.EXTERNAL_CALENDAR;
  //     content1 = msg.CA0006.MY_SCHEDULE;
  //   });
  //   if (content1.indexOf(event.target.firstChild.data) > -1 || event.target.hash === '#tab-content1') {
  //     this.checkTab = true;
  //   } else if (content4.indexOf(event.target.firstChild.data) > -1 || event.target.hash === '#tab-content4') {
  //     this.checkTab = false;
  //   }
  // }
  //
  // @HostListener('document:keydown', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea' && this.checkTab) {
  //       this.postSettingsSelfSettings(this.modelListCalendarReferences.items);
  //   }
  // }
}
