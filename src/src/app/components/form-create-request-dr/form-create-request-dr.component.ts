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
import {CalendarCommon} from '../../common/calendar-common';
import {ModelInput} from '../../common/meeting-common';
import {Helper} from '../../common/helper';
import {UserSession} from '../../models/ba/user-session';
import {MasterService} from '../../services/master.service';
import {SharedValueService} from '../../services/shared-value.service';
import {TranslateService} from '@ngx-translate/core';
import {CreateEventMeeting} from '../../models/me/create-event-meeting';
declare var moment: any;

@Component({
  selector: 'app-form-create-request-dr',
  templateUrl: './form-create-request-dr.component.html',
  styleUrls: ['./form-create-request-dr.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormCreateRequestDrComponent implements OnInit, OnChanges {
  public ModelInput: typeof ModelInput = ModelInput;
  @Input() modelInput: any;
  @Input() senderRequest: any;
  @Input() receiverRequest: any;
  @Input() originalRequest: CreateEventMeeting;
  @Input() formCreateMeeting: any;
  @Input() errorValidateForm: any;
  @Input() stringNameProduct;
  @Input() groupPurposes;
  @Input() inputAddTimeSelect: boolean; // check change of list time select

  @Output() changeTimeSelect = new EventEmitter<any>();
  @Output() outputAddTimeSelect = new EventEmitter<boolean>();
  @Output() checkValidateForm = new EventEmitter<any>();
  @Output() checkRequester = new EventEmitter<any>();

  public timePickerStart = [];
  public timePickerEnd = [];
  public userSession: UserSession;
  public maxNumberVisit = new Array(10);

  // select drug
  public productType = '';
  public listDrug: any = [];
  public options;

  public infiniteScrollOptions: any = {
    size: 20,
    placeHolder: 'ME0033.ME0033.SELECT_2.PRODUCT_NAME_SEARCH_PLACEHOLDER',
    allowFreeText: true,
    multiple: true,
    maximumSelect: 5
  };

  constructor(private calendarCommon: CalendarCommon, private sharedValueService: SharedValueService, private helper: Helper,
              private masterService: MasterService, private cd: ChangeDetectorRef, private translate: TranslateService) {
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
    const date = this.formCreateMeeting.date[index];
    const dateStart = moment(date.dateStart).format('YYYY-MM-DDT' + date.startTime);
    let endTime = moment(dateStart).add(15, 'minutes').format();

    if (moment(dateStart).format('YYYY-MM-DD') === moment(endTime).format('YYYY-MM-DD')) {
      endTime = moment(endTime).format('HH:mm');
    } else {
      endTime = '23:55';
    }

    this.formCreateMeeting.date[index].endTime = endTime;
    this.changeTimeSelect.emit(this.formCreateMeeting);
  }

  changeTimeEndMeeting(index: number) {
    const date = this.formCreateMeeting.date[index];
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

  removeTimeMeeting(index: number, event) {
    event.preventDefault();
    const listTime = this.formCreateMeeting.date;
    listTime.splice(index, 1);
    this.errorValidateForm.listDate.splice(index, 1);
    this.changeTimeSelect.emit(this.formCreateMeeting);
  }

  isPharmaceuticalCompany() {
    if (this.receiverRequest.industryType === 'I0001') {
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

  validateFormMeeting() {
    this.checkValidateForm.emit(this.formCreateMeeting);
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
  //     this.validateFormMeeting();
  //   }
  // }
}
