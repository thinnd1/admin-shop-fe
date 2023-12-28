///<reference path="../../../../../node_modules/@angular/router/src/router.d.ts"/>
import {Component, OnInit} from '@angular/core';
import {MeetingService} from '../../../services/meeting.service';
import {HttpStatus} from '../../../common/http.status';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder} from '@angular/forms';
import {CreateEventMeeting} from '../../../models/me/create-event-meeting';
import {TranslateService} from '@ngx-translate/core';
import {GroupPurposes} from '../../../models/me/group-purposes';
import {Me0033PageValidator} from './me0033-page.validator';
import {DialogResult} from '../../../models/dialog-param';
import {DialogService} from '../../../services/dialog.service';
import {MasterService} from '../../../services/master.service';
import {Title} from '@angular/platform-browser';

declare var moment: any;
const I18N_VALUES = {
  'ja': {
    weekdays: ['日', '月', '火', '水', '木', '金', '土'],
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  },
  'en': {
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  }
};

@Component({
  selector: 'app-me0033-page',
  templateUrl: './me0033-page.component.html',
  styleUrls: ['./me0033-page.component.scss'],
  providers: [Me0033PageValidator],
})
export class Me0033PageComponent implements OnInit {
  public frameId: string;
  public getResult: any;
  private msgStore: any;
  formCreateMeeting: CreateEventMeeting;
  //
  frameInfo: any = {};
  receiver: any = {};
  public drugOptions: any;
  public listDrug: any = [];
  public selectedDrug: any = [];
  public groupPurposes: GroupPurposes[];
  public maxNumberVisit = new Array(10);
  errorValidateForm = {
    purposeId: '',
    comment: '',
    productName: '',
    drugs: '',
    numberVisitors: '',
  };
  userType: string;
  infiniteScrollOptions: any = {
    size: 40,
    placeHolder: 'ME0033.ME0033.SELECT_2.PRODUCT_NAME_SEARCH_PLACEHOLDER',
    allowFreeText: true,
    multiple: true,
    maximumSelect: 5
  };

  constructor(private meetingService: MeetingService, private dialogService: DialogService, private router: Router,
              private me0033PageValidator: Me0033PageValidator, private activatedRoute: ActivatedRoute,
              private formBuilder: FormBuilder, private translate: TranslateService, private masterService: MasterService,
              private titleService: Title) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((param: any) => {
      this.frameId = param['frameId'];
    });
    this.titleService.setTitle(this.translate.instant('ME0033.TITLE'));
    this.formCreateMeeting = new CreateEventMeeting('MR');
    this.translate.get('ME0033.ME0033').subscribe(
      (res) => {
        this.msgStore = res;
      }
    );
    this.getFrameMeetingRequest(this.frameId);
  }

  getFrameMeetingRequest(frameId: string) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getMeetingFrame(frameId).subscribe((frameMeeting) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.getResult = frameMeeting;
      this.getResult.frameId = frameId;
      this.makeData(this.getResult);
    }, (error: HttpStatus) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.router.navigate(['/me/me0032']);
      // this.dialogService.showError('MSG.ERROR');
    });
  }

  makeData(response) {
    this.frameInfo = response.frameInfo;
    this.receiver = response.frameInfo.doctor;
    this.receiver.imageUrl = this.receiver.image;
    if (this.frameInfo) {
      this.frameInfo.meetingDurationJa = this.convertDurationISOtoJa(this.frameInfo.startTime, this.frameInfo.endTime);
    }
    this.filterGroupPurposes(response.purposes);
  }

  convertDurationISOtoJa(timeStart, timeEnd) {
    moment.locale(this.translate.currentLang, {
      weekdaysShort: I18N_VALUES[this.translate.currentLang].weekdays,
      monthsShort: I18N_VALUES[this.translate.currentLang].months
    });
    timeStart = moment(timeStart);
    timeEnd = moment(timeEnd);
    if (this.translate.currentLang === 'ja') {
      return timeStart.format('MM月DD日(ddd) HH:mm') + '〜' + timeEnd.format('HH:mm');
    } else {
      return timeStart.format('MMM Do(ddd) HH:mm') + '〜' + timeEnd.format('HH:mm');
    }
  }

  filterGroupPurposes(groupPurposes: any) {
    const listPurposes = [];
    const isPharmacy = this.isPharmaceuticalCompany();
    if (groupPurposes && groupPurposes.length > 0) {
      for (let i = 0; i < groupPurposes.length; i++) {
        if (groupPurposes[i].pharmacy === isPharmacy) {
          listPurposes.push(groupPurposes[i]);
        }
      }
    }
    this.groupPurposes = listPurposes;
  }

  checkProductType(purposeId?) {
    purposeId = purposeId ? purposeId : this.formCreateMeeting.purposeId;
    if (this.groupPurposes) {
      for (let i = 0; i < this.groupPurposes.length; i++) {
        const purpose = this.groupPurposes[i].purposes.filter((item) => (item.purposeCode === purposeId));
        if (purpose.length > 0) {
          this.formCreateMeeting.purposeName = purpose[0].purposeName;
          return this.groupPurposes[i].productType;
        }
      }
    }
    return '';
  }

  isPharmaceuticalCompany() {
    return this.getResult.sender.industryType === 'I0001';
  }

  displayError(errorList) {
    for (const key in errorList) {
      if (errorList.hasOwnProperty(key) && errorList[key]) {
        this.dialogService.showError(errorList[key]);
        return false;
      }
    }
    return true;
  }

  validateFormMeeting() {
    this.errorValidateForm = this.me0033PageValidator.checkValidateForm(this.formCreateMeeting, this.msgStore.VALIDATE);
    const validate = this.displayError(this.errorValidateForm);
    if (validate) {
      const html = '<p>' + this.msgStore.CONFIRM_PUT_MEETING.MSG_1 + '</p>'
        + '<p>' + this.msgStore.CONFIRM_PUT_MEETING.MSG_2 + '</p>';
      this.dialogService.showMessage('warning', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
        (dialogResult: DialogResult) => {
          if (dialogResult.isOk()) {
            this.putMeeting();
          }
        }
      );
    }
  }

  getDrugList() {
    const list = [];
    if (this.selectedDrug) {
      for (let i = 0; i < this.selectedDrug.length; i++) {
        list.push(this.selectedDrug[i].id);
      }
    }
    return list;
  }

  purposeOnChange(purposeId) {
    if (this.checkProductType() !== this.checkProductType(purposeId)) {
      if (this.checkProductType(purposeId) === 'DRUG') {
        this.selectedDrug = null;
      }
      if (this.checkProductType(purposeId) !== 'PRODUCT') {
        this.formCreateMeeting.productName = '';
      }
    }
  }

  mapError(body) {
    const ret = body.message;
    let msg = '';
    if (ret === 'You applied Meeting Frame' || ret === 'You applied meeting frame other in this time') {
      msg = this.msgStore.VALIDATE.DUPLICATE_TIME;
    }
    if (ret === 'You applied this meeting frame') {
      msg = this.msgStore.VALIDATE.DUPLICATE_APPLY;
    }
    if (ret === 'Meeting frame end') {
      msg = this.msgStore.VALIDATE.FRAME_END;
    }
    return msg;
  }

  successFunc() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(false);
    });
    const html = '<p>' + this.msgStore.SUCCESS_PUT_MEETING.MSG_1 + '</p>'
      + '<p>' + this.msgStore.SUCCESS_PUT_MEETING.MSG_2 + '</p>';
    setTimeout(() => {
      this.dialogService.setLoaderVisible(false);
    });
    this.dialogService.showMessage('success', false, null, null, html, 'MSG.OK', null).subscribe(
      (dialogResult: DialogResult) => {
        if (dialogResult.isOk()) {
          this.router.navigate(['/me/me0030']);
        } else {
          this.redirectBack();
        }
      });
  }

  putMeeting() {
    this.formCreateMeeting.drugList = this.getDrugList();
    const dataOutput = this.me0033PageValidator.dataOutPut(this.formCreateMeeting, this.getResult);
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.putRequestMeetingFrame(dataOutput).subscribe(
      (res) => {
        this.successFunc();
      },
      (error) => {
        let msg = this.mapError(error.json());
        msg = msg ? msg : 'MSG.ERROR';
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError(msg);
      }
    );
  }

  redirectBack() {
    this.router.navigate(['/me/me0028', this.receiver.userId, this.receiver.officeId]);
  }

  reloadListDrug(keyword, page) {
    this.masterService.getListDrugWithPaging(keyword, page, this.infiniteScrollOptions.size, '')
      .subscribe((settings: any) => {
          const loop = settings.drugs;
          for (let i = 0; i < loop.length; i++) {
            loop[i].name = loop[i].productName;
          }
          this.listDrug = page === 0 ? loop : this.listDrug.concat(loop);
        },
        (error) => {
          this.listDrug = [];
        });
  }

  textChanged(keyword: any, obj) {
    this.reloadListDrug(keyword, 0);
  }

  scrollDown($event) {
    this.reloadListDrug($event.keyword, $event.page);
  }

}
