import {Component, OnInit} from '@angular/core';
import {CalendarService} from '../../../services/calendar.service';
import {SettingsSelfSettings} from '../../../models/ca/settings-self-settings';
import {EventSaveCalendarReferences} from '../../../models/ca/event-save-calendar-references';
import {TranslateService} from '@ngx-translate/core';
import {OptionColorComponent} from '../../../components/option-color/option-color.component';
import {HttpError} from '../../../common/error/http.error';
import {SettingsSelfSettingsSaveResult} from '../../../models/ca/settings-self-settings-save-result';
import {HttpStatus} from '../../../common/http.status';
import {Router} from '@angular/router';
import {LocalStorage} from '../../../services/local-storage.service';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';
import {SharedValueService} from '../../../services/shared-value.service';

@Component({
  selector: 'app-ca0008-page',
  templateUrl: './ca0008-page.component.html',
  styleUrls: ['../ca0006-page/ca0006-page.component.scss'],
  providers: [OptionColorComponent]
})
export class Ca0008PageComponent implements OnInit {
  modelListCalendarReFerents = new SettingsSelfSettings();
  modelEventSaveCalendarReferences = new EventSaveCalendarReferences();
  translateMessageError = {};
  translateTitle = {};
  listCalendarInGroups: any = [];
  listCalendarOutGroups: any = [];
  type: string;
  getDataStorage: any;
  userSession;
  optionEventColor: any;
  calendarReferent: any;

  constructor(private calendarService: CalendarService, private dialogService: DialogService,
              private translateService: TranslateService, private  optionColorComponent: OptionColorComponent,
              private router: Router, private localStorage: LocalStorage,
              private sharedValueService: SharedValueService) {
    this.type = 'group';
  }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    this.translateService.get('MSG').subscribe((res) => {
      this.translateMessageError = res;
    });
    this.translateService.get('CA0006').subscribe((res) => {
      this.translateTitle = res;
    });
    this.calendarService.getSettingsSelfSettings(this.type).subscribe((settings: SettingsSelfSettings) => {
      this.modelListCalendarReFerents = settings;
      // fake name group
      this.modelListCalendarReFerents.items.forEach((value: any) => {
        if (value['groupName'] === '') {
          value['groupName'] = 'GroupName';
        }
      });
      this.listCalendarInGroups = this.modelListCalendarReFerents.items.filter(calendar =>
        calendar.calendarType === 'INSIDE_GROUP');
      this.listCalendarInGroups = this.convertOptionColorToString(this.listCalendarInGroups);
      this.listCalendarOutGroups = this.modelListCalendarReFerents.items.filter(calendar =>
        calendar.calendarType === 'OUTSIDE_GROUP');
      this.listCalendarOutGroups = this.convertOptionColorToString(this.listCalendarOutGroups);
    }, (error: HttpError) => {
      console.log(error);
      this.dialogService.showError('MSG.CA0002.E000_2');
    });
  }

  convertOptionColorToString(listCalendarReferent) {
    listCalendarReferent.forEach((value: string) => {
      value['colorString'] = '#' + value['color'].toString(16);
    });
    return listCalendarReferent;
  }

  async postSettingsSelfSettings() {
    this.modelEventSaveCalendarReferences.calendarReferences = [];
    this.listCalendarInGroups.forEach((value: string) => {
      const newCalendar = {};
      newCalendar['id'] = value['id'];
      newCalendar['color'] = value['color'];
      newCalendar['visible'] = value['visible'];
      this.modelEventSaveCalendarReferences.calendarReferences.push(newCalendar);
    });
    this.listCalendarOutGroups.forEach((value: string) => {
      const newCalendar = {};
      newCalendar['id'] = value['id'];
      newCalendar['color'] = value['color'];
      newCalendar['visible'] = value['visible'];
      this.modelEventSaveCalendarReferences.calendarReferences.push(newCalendar);
    });
    this.getDataStorage = this.localStorage.getObject('viewCalendar');
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
            this.dialogService.showError('MSG.CA0008.E001_1');
            reject();
          }
        }
      );
    });
    return promise;
  }
  changeVisible(listCalendarReFerent) {
    listCalendarReFerent.visible = !listCalendarReFerent.visible;
    this.localStorage.setObject('activeConfirmDialog', true);
  }

  getDisplayPopUpColorCalendar(event: any, calendarReferent: any) {
    this.optionEventColor = event;
    this.calendarReferent = calendarReferent;
  }
}
