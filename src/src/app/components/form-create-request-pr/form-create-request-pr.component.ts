import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter, HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {MasterService} from '../../services/master.service';
import {UserSession} from '../../models/ba/user-session';
import {ModelInput} from '../../common/meeting-common';
import {SharedValueService} from '../../services/shared-value.service';
import {Helper} from '../../common/helper';
import {CalendarCommon} from '../../common/calendar-common';
import {DialogService} from '../../services/dialog.service';
import {HttpError} from '../../common/error/http.error';
import {CalendarService} from '../../services/calendar.service';
import {Me0029PageValidator} from '../../pages/me/me0029-page/me0029-page.validator';
declare var moment: any;

@Component({
  selector: 'app-form-create-request-pr',
  templateUrl: './form-create-request-pr.component.html',
  styleUrls: ['./form-create-request-pr.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormCreateRequestPrComponent implements OnInit, OnChanges {
  public ModelInput: typeof ModelInput = ModelInput;
  @Input() modelInput: any;
  @Input() senderRequest: any;
  @Input() receiverRequest: any;
  @Input() originalRequest: any;
  @Input() formCreateMeeting: any;
  @Input() errorValidateForm: any;
  @Input() stringNameProduct;
  @Input() groupPurposes;
  @Input() inputAddTimeSelect: boolean; // check change of list time select

  @Output() changeTimeSelect = new EventEmitter<any>();
  @Output() outputAddTimeSelect = new EventEmitter<boolean>();
  @Output() checkValidateForm = new EventEmitter<any>();
  @Output() checkAcceptRequestMeetingDecides = new EventEmitter<boolean>();
  @Output() checkRequester = new EventEmitter<any>();

  public timePickerStart = [];
  public timePickerEnd = [];
  public userSession: UserSession;
  public maxNumberVisit = new Array(10);

  // select drug
  public productType = '';
  public listDrug: any = [];
  public options;
  infiniteScrollOptions: any = {
    size: 20,
    placeHolder: 'ME0033.ME0033.SELECT_2.PRODUCT_NAME_SEARCH_PLACEHOLDER',
    allowFreeText: true,
    multiple: true,
    maximumSelect: 5
  };

  constructor(private calendarCommon: CalendarCommon, private sharedValueService: SharedValueService, private helper: Helper,
              private masterService: MasterService, private cd: ChangeDetectorRef, private translate: TranslateService,
              private dialogService: DialogService, private calendarService: CalendarService,
              private me0029PageValidator: Me0029PageValidator) {
  }

  ngOnInit() {
    this.calendarCommon.genTimePicker(this.timePickerStart);
    this.calendarCommon.genTimePicker(this.timePickerEnd);
    this.userSession = this.sharedValueService.getUserSession();
    this.timePickerStart.splice(this.timePickerStart.length - 1, 1);
    this.timePickerEnd.splice(0, 1);
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (propName === 'inputAddTimeSelect' && this.inputAddTimeSelect) {
        this.outputAddTimeSelect.emit(false);
        this.cd.markForCheck();
      }

      if (propName === 'modelInput') {
        this.productType = '';
      }
    }
  }

  changeTimeStartMeeting(index: number) {
    let endTime: string;
    const date = this.formCreateMeeting.date[index];
    const dateStart = moment(date.dateStart).format('YYYY-MM-DDT' + date.startTime);
    if (this.modelInput === this.ModelInput.DOCUMENT) {
      endTime = moment(dateStart).add(5, 'minutes').format('HH:mm');
    } else {
      endTime = moment(dateStart).add(15, 'minutes').format();

      if (moment(dateStart).format('YYYY-MM-DD') === moment(endTime).format('YYYY-MM-DD')) {
        endTime = moment(endTime).format('HH:mm');
      } else {
        endTime = '23:55';
      }
    }

    this.formCreateMeeting.date[index].endTime = endTime;
    this.changeTimeSelect.emit(this.formCreateMeeting);
  }

  changeTimeEndMeeting(index: number, event: any) {
    const date = this.formCreateMeeting.date[index];

    if (this.modelInput === this.ModelInput.DOCUMENT) {
      const dateStart = moment(date.dateStart).format('YYYY-MM-DDT' + date.startTime);
      const endTime = moment(dateStart).add(5, 'minutes').format('HH:mm');
      const endTimeChange = event;

      if (this.helper.convertTimeIso(endTime) < this.helper.convertTimeIso(endTimeChange)) {
        this.formCreateMeeting.date = [];
        const newTimeMeeting = this.me0029PageValidator.addTimeMeeting(dateStart, null, this.modelInput);
        this.formCreateMeeting.date.push(newTimeMeeting);
        this.changeTimeSelect.emit(this.formCreateMeeting);
        // this.cd.markForCheck();
        this.dialogService.showError('MSG.ME.MEETING_REQUEST.MSG_CHANGE_TIME_END');
      } else {
        const dateEnd = moment(date.dateStart).format('YYYY-MM-DDT' + date.endTime);
        this.formCreateMeeting.date[index].startTime = moment(dateEnd).add(-5, 'minutes').format('HH:mm');
        this.changeTimeSelect.emit(this.formCreateMeeting);
      }
    } else {
      const dateEnd = moment(date.dateStart).format('YYYY-MM-DDT' + date.endTime);

      if (this.helper.convertTimeIso(date.endTime) <= this.helper.convertTimeIso(date.startTime)) {
        const startTime = moment(dateEnd).add(-15, 'minutes').format();
        if (moment(date.dateStart).format('YYYY-MM-DD') === moment(startTime).format('YYYY-MM-DD')) {
          date.startTime = moment(dateEnd).add(-15, 'minutes').format('HH:mm');
        } else {
          date.startTime = '00:00';
        }
      }
      this.changeTimeSelect.emit(this.formCreateMeeting);
    }
  }

  removeTimeMeeting(index: number, event) {
    event.preventDefault();
    const listTime = this.formCreateMeeting.date;
    listTime.splice(index, 1);
    this.errorValidateForm.listDate.splice(index, 1);
    this.changeTimeSelect.emit(this.formCreateMeeting);
  }

  isPharmaceuticalCompany() {
    if (this.senderRequest.industryType === 'I0001') {
      return true;
    }
    return false;
  }

  changePurpose() {
    if (this.checkProductType() !== this.productType) {
      this.formCreateMeeting.drugList = [];
      this.formCreateMeeting.productName = '';
      this.errorValidateForm.productName = '';
    }
    this.productType = this.checkProductType();
  }

  checkProductType() {
    if (this.groupPurposes) {
      for (let i = 0; i < this.groupPurposes.length; i++) {
        const purpose = this.groupPurposes[i].purposes.filter((item) => (item.purposeCode === this.formCreateMeeting.purposeId));
        if (purpose.length > 0) {
          this.formCreateMeeting.purposeName = purpose[0].purposeName;
          return this.groupPurposes[i].productType;
        }
      }
    }
    return '';
  }

  /**
   * check accept request in frameMeting
   */
  checkAcceptRequest() {
    this.calendarService.getAcceptRequest(this.receiverRequest.userId, this.receiverRequest.officeId).subscribe(
      (data) => {
        const flagMeeting = !data.acceptRequest;
        this.checkAcceptRequestMeetingDecides.emit(flagMeeting);
        this.checkValidateForm.emit(this.formCreateMeeting);
      }, (error: HttpError) => {
        const ret = error.message;
        if (ret === 'DR not setting meeting') {
          const flagMeeting = true;
          this.checkAcceptRequestMeetingDecides.emit(flagMeeting);
          this.checkValidateForm.emit(this.formCreateMeeting);
        } else {
          this.dialogService.showError('MSG.ERROR');
        }
      }
    );
  }
  reloadListDrug(keyword, page) {
    this.masterService.getListDrugWithPaging(keyword, page, this.infiniteScrollOptions.size, '')
      .subscribe((settings: any) => {
          const loop = settings.drugs;
          for (let i = 0; i < loop.length; i++) {
            loop[i].name = loop[i].productName;
          }
          this.listDrug = page === 0 ? loop : this.listDrug.concat(loop);
          this.cd.markForCheck();
        },
        (error) => {
          this.listDrug = [];
          this.cd.markForCheck();
        });
  }

  textChanged(keyword: any, obj) {
    this.reloadListDrug(keyword, 0);
  }

  scrollDown($event) {
    this.reloadListDrug($event.keyword, $event.page);
  }

  changeRequester() {
    // reset purpose
    this.formCreateMeeting.purposeId = '';
    this.productType = '';
    this.checkRequester.emit(this.formCreateMeeting);
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     this.checkAcceptRequest();
  //   }
  // }
}
