import {DialogService} from '../../../services/dialog.service';
import {Component, OnInit, HostListener} from '@angular/core';
import {MeetingService} from '../../../services/meeting.service';
import {Me0003PageValidator} from './me0003-page.validator';
import {SharedValueService} from '../../../services/shared-value.service';
import {TranslateService} from '@ngx-translate/core';
import {FormGroup} from '@angular/forms';
import {VisitEntrySettings} from '../../../models/me/visit-entry-settings';
import {VisitEntrySettingsSaveResult} from '../../../models/me/visit-entry-settings-save-result';
import {HttpError} from '../../../common/error/http.error';
import {CalendarCommon} from '../../../common/calendar-common';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogResult} from '../../../models/dialog-param';
import {Helper} from '../../../common/helper';
import {HttpStatus} from '../../../common/http.status';

declare const moment: any;

@Component({
  selector: 'app-me0003-page',
  templateUrl: './me0003-page.component.html',
  styleUrls: ['./me0003-page.component.scss'],
  providers: [Me0003PageValidator]
})
export class Me0003PageComponent implements OnInit {

  public model = new VisitEntrySettings();
  public modelResponse: any;
  modelGroupForm: FormGroup;
  formErrors: any;
  visitNumbers: any;
  userSession;
  // Select 2 Meeting Visit
  selectedVisitMeeting: any;
  data: Array<any>;
  options: any;
  noResult: string;
  checkValidateSelect = false;
  // Datetime Picker
  timePicker = [];
  // Convert Date
  private msgStore: any;
  private visitId: any;

  constructor(private meetingService: MeetingService,
              private me0003Validator: Me0003PageValidator,
              private shareValue: SharedValueService,
              private translate: TranslateService,
              private activatedRoute: ActivatedRoute,
              private dialogService: DialogService,
              private calendarCommon: CalendarCommon,
              private helper: Helper,
              private router: Router) {
    this.formErrors = this.me0003Validator.formErrors;
    this.modelGroupForm = this.me0003Validator.createForm();
    this.visitNumbers = this.shareValue.getVisitNumber();
    this.translate.get('ME0003').subscribe(
      (res) => {
        this.msgStore = res;
      }
    );
  }

  ngOnInit() {
    this.shareValue.fetchUserSession();
    this.userSession = this.shareValue.getUserSession();
    this.genTimePicker();
    if (this.translate.currentLang === 'en') {
      this.noResult = 'No Result';
    } else {
      this.noResult = '一致する会社がありません';
    }
    this.options = {
      placeholder: {
        id: '0',
        text: '',
        selected: 'selected'
      },
      language: {
        noResults: () => {
          return this.noResult;
        }
      }
    };
    this.loadVisitableUsers();
    this.activatedRoute.params.subscribe((param: any) => {
      if (param['visit_id']) {
        this.visitId = param['visit_id'];
        this.loadVisit();
      }
    });
  }

  loadVisitableUsers() {
    this.meetingService.getVisitableUsersSettings(this.userSession.userId, this.userSession.officeId, 0).subscribe((settings: VisitEntrySettings) => {
      this.model = settings;
      const tempData = [];
      const placeholder = {id: '0', text: ''};
      tempData.push(placeholder);
      for (const child of this.model.users) {
        const objMedicalAnother = {'text': '', 'id': '0'};
        objMedicalAnother['text'] = child.lastName + ' ' + child.firstName;
        objMedicalAnother['id'] = child.userId;
        tempData.push(objMedicalAnother);
      }
      this.data = tempData;
    }, (error: HttpStatus) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  loadVisit() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getVisitDetail(this.visitId).subscribe((settings) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      const startTime = moment(settings.start);
      const endTime = moment(settings.end);
      settings.timeStartVisit = startTime.format('HH:mm');
      settings.dateStartVisit = startTime.format('YYYY/MM/DD');
      settings.dateEndVisit = endTime.format('YYYY/MM/DD');
      settings.timeEndVisit = endTime.format('HH:mm');
      this.selectedVisitMeeting = settings.userId;
      this.modelGroupForm.patchValue(settings);
    }, (error: HttpStatus) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  convertStartDate() {
    return this.convertDateTimeToISO(this.modelGroupForm.value.dateStartVisit + ' ' + this.modelGroupForm.value.timeStartVisit);
  }

  convertEndDate() {
    if (this.modelGroupForm.value.dateEndVisit === '') {
      return this.convertDateTimeToISO(this.modelGroupForm.value.dateStartVisit + ' ' + this.modelGroupForm.value.timeEndVisit);
    } else {
      return this.convertDateTimeToISO(this.modelGroupForm.value.dateEndVisit + ' ' + this.modelGroupForm.value.timeEndVisit);
    }
  }

  convertDateTimeToISO(fullTime) {
    const format = 'YYYY/MM/DD HH:mm';
    return moment(fullTime, format).format('YYYY-MM-DDTHH:mm:ssZZ');
  }
  checkError(errorList): boolean {
    for (const key in errorList) {
      if (errorList.hasOwnProperty(key) && errorList[key]) {
        return false;
      }
    }
    return true;
  }
  addVisitHistory() {
    this.checkValidateSelect2();
    const resultCheckValidate = this.me0003Validator.checkValidate(this.modelGroupForm);
    this.me0003Validator.checkSpaceBlank(this.modelGroupForm);
    this.formErrors = resultCheckValidate.formErrors;
    this.helper.gotoError();
    if (this.checkValidateSelect === false && this.checkError(this.formErrors)) {
      this.modelResponse = this.modelGroupForm.value;
      this.modelResponse.userId = this.selectedVisitMeeting;
      this.modelResponse.start = this.convertStartDate();
      this.modelResponse.end = this.convertEndDate();
      if (this.visitId) {
        this.modelResponse.id = this.visitId;
      }
      this.modelResponse.officeId = this.userSession.officeId;
      this.dialogService.showMessage('warning', false, null, null, this.msgStore.MESSAGE_SAVE, 'ME0003.SAVE', 'MSG.CANCEL').subscribe(
        (dialogResult: DialogResult) => {
          if (dialogResult.isOk()) {
            this.submitToServer();
          }
        }
      );
    }
  }

  submitToServer() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.postAddVisitorRecordSettings(this.modelResponse)
      .subscribe((response: VisitEntrySettingsSaveResult) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showSuccess('MSG.SAVED').subscribe(
          (res: DialogResult) => {
            if (res.isOk()) {
              this.router.navigate(['/']);
            }
          }
        );
      }, (error: HttpError) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      });
  }

  selectVisitMeeting(event) {
    this.selectedVisitMeeting = event.id;
  }

  genTimePicker() {
    this.calendarCommon.genTimePicker(this.timePicker);
  }

  changeDateStartVisit(dateStart) {
    this.modelGroupForm.controls.dateStartVisit.setValue(moment(dateStart).format('YYYY-MM-DD'));
  }

  changedateEndVisit(dateEnd) {
    this.modelGroupForm.controls.dateEndVisit.setValue(moment(dateEnd).format('YYYY-MM-DD'));
  }

  checkValidateSelect2() {
    if (this.selectedVisitMeeting === undefined) {
      this.checkValidateSelect = true;
    } else {
      if (this.selectedVisitMeeting === '0') {
        this.checkValidateSelect = true;
      } else {
        this.checkValidateSelect = false;
      }
    }
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     this.addVisitHistory();
  //   }
  // }
}
