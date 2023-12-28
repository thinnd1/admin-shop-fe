import {Component, Injectable, OnInit, PipeTransform} from '@angular/core';
import {MeetingService} from '../../../services/meeting.service';
import {DialogService} from '../../../services/dialog.service';
import {ListVisitorHistoriesSettings} from '../../../models/me/status-meeting-settings';
import {CalendarCommon} from '../../../common/calendar-common';
import {ListAggregationSettings} from '../../../models/me/aggregation-metting-settings';
import {ListAggregationDetailSettings} from '../../../models/me/aggregation_detail_setting';
import {ListDownloadCSVLog} from '../../../models/me/download-csv-log-settings';
import {Angular2Csv} from 'angular2-csv/Angular2-csv';
import {DialogResult} from '../../../models/dialog-param';
import {SharedValueService} from 'app/services/shared-value.service';
import {TranslateService} from '@ngx-translate/core';
import {Helper} from '../../../common/helper';
import {NgbDatepickerI18n} from '@ng-bootstrap/ng-bootstrap';
import {UserSession} from '../../../models/ba/user-session';

declare var moment: any;
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

@Injectable()
export class I18n {
  language;

  constructor(private translate: TranslateService) {
    this.language = this.translate.currentLang;
  }
}

@Component({
  selector: 'app-me0024-page',
  templateUrl: './me0024-page.component.html',
  styleUrls: ['./me0024-page.component.scss'],
  providers: [I18n, {provide: NgbDatepickerI18n, useClass: Me0024PageComponent}],
})
export class Me0024PageComponent extends NgbDatepickerI18n implements OnInit {

  // model
  public model = new ListVisitorHistoriesSettings;
  public modelAggregation: any;
  public modelDetail: any;
  public modelLog: any;
  public modelCSV: any;

  dateNow: any;
  historyday: any;
  flagDetail = false;
  flagAggre = true;
  time: string;
  type: number;
  numTab: number;
  startDate: string;
  endDate: string;
  isDesc = false;
  column = 'staffName';
  dataModel = [];
  tabTitle: number;
  currentDetail: any;
  private msgStore: any;
  downloadListMR = false;
  downloadMeetingStatus = false;
  userSesson : UserSession;

  constructor(private meetingService: MeetingService, private dialogService: DialogService, private calendarCommon: CalendarCommon,
              private sharedValueService: SharedValueService, private translate: TranslateService, private helper: Helper, private _i18n: I18n) {
    super();
    this.userSesson = this.sharedValueService.getUserSession();
  }

  getWeekdayShortName(weekday: number): string {
    return I18N_VALUES[this._i18n.language].weekdays[weekday - 1];
  }

  getMonthShortName(month: number): string {
    return I18N_VALUES[this._i18n.language].months[month - 1];
  }

  getMonthFullName(month: number): string {
    return this.getMonthShortName(month);
  }

  ngOnInit() {
    this.dateNow = moment().format('YYYY-MM-DDTHH:mm:ssZZ');
    this.startDate = moment(this.dateNow).clone().add(-7, 'days').format('YYYY-MM-DDT00:00:00ZZ');
    this.endDate = moment().format('YYYY-MM-DDT23:59:59ZZ');
    this.getListVisitorHistoriesSettings();
    this.tabTitle = 1;
    this.numTab = 1;
    this.translate.get('ME0024').subscribe(
      (res) => {
        this.msgStore = res;
      }
    );
  }

  /* ****************************RE0024*********************************** */
  getDownloadLogString(list) {
    let str = '';
    for (let i = 0; i < list.length; i++) {
      const record = list[i];
      const type = record.csvType === 'MEETING_STATE' ? this.msgStore.MEETING_LIST : this.msgStore.CUSTOMER_LIST;
      str += '[' + moment(record.timeDownloaded).format('YYYY-MM-DD HH:mm:ss') + ']（'
        + record.lastName + ' ' + record.firstName + '）' + type + '\n';
    }
    return str;
  }

  getDownloadLogResponse() {
    this.meetingService.getListDownloadLogSettings().subscribe((settings: ListDownloadCSVLog) => {
      this.modelLog = Object.keys(settings).map(key => settings[key]);
      this.modelLog = this.getDownloadLogString(this.modelLog);
    });
  }

  getStatusCSVMeetings(callback?) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getListDownloadCSVSettings(this.startDate, this.endDate).subscribe((settings: ListDownloadCSVLog) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.modelCSV = settings;
      if (callback) {
        callback();
      }
    }, (error) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      if (callback) {
        callback();
      }
    });
  }

  getCSVMeetingsByCustommer(callback?) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getCSVMeetingCustomer().subscribe((settings: ListDownloadCSVLog) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.modelCSV = settings;
      if (callback) {
        callback();
      }
    }, (error) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      if (callback) {
        callback();
      }
    });
  }

  getDownloadCsvResponse(index) {
    const object = {
      'check': false,
      'confirmText': '確認しました',
      'isConfirm': true,
      'disablePositive': true
    };
    const html = this.msgStore.MSG_EXPORT_CSV;
    this.modelCSV = [];
    switch (index) {
      case 1:
        this.getStatusCSVMeetings(() => {
          this.exportCSVLogMeetings(index);
        });
        break;
      case 2:
        this.dialogService.showCheckboxDialog('warning', false, 'ME0024.TITLE_DOWNLOAD', null,
          html, 'ME0024.DOWNLOAD', 'MSG.CANCEL', object, null, 'modal-lg').subscribe(
          (res: DialogResult) => {
            if (res.isOk())  {
              this.getCSVMeetingsByCustommer(() => {
                this.exportCSVLogMeetings(index);
              });
            }
          }
        );
        break;
    }
  }


  /* *******************************Me0025******************************** */
  getListVisitorHistoriesSettings() {
    const startDate = moment(this.dateNow).format('YYYY-MM-DDT00:00:00ZZ');
    const endDate = moment(this.dateNow).format('YYYY-MM-DDT23:59:59ZZ');
    this.meetingService.getListVisitorHistoriesSettings(startDate, endDate).subscribe((settings: ListVisitorHistoriesSettings) => {
      const loop = settings['getStatusMeetingList'];
      for (let i = 0; i < loop.length; i++) {
        if (moment(loop[i].end).isAfter(endDate)) {
          loop[i].end = moment(loop[i].end).format('YYYY-MM-DDT23:55:00ZZ');
        }
        loop[i].timeMeeting = moment(loop[i].start).isValid() ?
          moment(loop[i].start).format('HH:mm') + '-' + moment(loop[i].end).format('HH:mm') : '';
      }
      const sort = [
        {key: 'entering', direction: 1},
        {key: 'leaving', direction: 1}];
      this.model['getStatusMeetingList'] = this.helper.sortByMulti(loop, sort);
    }, (error) => {
      const msg = error.message;
      if (msg === 'Not exist' || msg === 'Date of Meeting is invalid') {
        this.model = new ListVisitorHistoriesSettings;
      } else {
        this.dialogService.showError('MSG.ERROR');
      }
    });
  }

  dateConvert(date: any, flag: boolean) {
    if (flag) {
      // Input
      if (!moment(date, 'YYYY-MM-DD').isValid()) {
        return false;
      }
      const m = moment(date);
      const obj = m.toObject();
      return {year: obj.years, month: obj.months + 1, day: obj.date};
    } else {
      // Output
      const m = moment(date);
      return m.format('YYYY-MM-DDTHH:mm:ssZZ');
    }
  }

  getHistoryNow() {
    const date = new Date();
    this.dateNow = moment(date).format('YYYY-MM-DDT00:00:00ZZ');
    this.reloadTabContent();
  }

  getAddHistoryNow(param) {
    switch (this.numTab) {
      case 1:
        const down = moment(this.dateNow).clone().add(param, 'days').format('YYYY-MM-DD') + 'T00:00';
        this.dateNow = this.dateConvert(down, false);
        break;
      case 2:
      case 3:
        const upD = moment(this.dateNow).clone().add(param, 'month').format('YYYY-MM-DD') + 'T00:00';
        this.dateNow = upD;
        break;
    }
    this.reloadTabContent();
  }

  reloadTabContent() {
    switch (this.numTab) {
      case 1:
        this.getListVisitorHistoriesSettings();
        break;
      case 2:
      case 3:
        if (!this.flagDetail) {
          this.getAggregationSetiings(this.type, this.dateNow);
        } else {
          this.getDetailAggregationSettings(this.currentDetail, false);
        }
        break;
    }
  }

  getHistoryOfDay(date: any) {
    const slDate = moment(date.year + '-' + date.month + '-' + date.day, 'YYYY-M-D').format();
    this.dateNow = this.dateConvert(slDate, false);
    this.getListVisitorHistoriesSettings();
  }

  printPage() {
    switch (this.numTab) {
      case 1:
        if (this.model['getStatusMeetingList'] && this.model['getStatusMeetingList'].length > 0) {
          this.print();
        }
        break;
      case 2:
      case 3:
        if (this.flagAggre && this.modelAggregation || this.flagDetail && this.modelDetail) {
          this.print();
        }
        break;
    }
  }

  print() {
    const css = '@page {size:A4 portrait;margin: 50px 0;}';
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.type = 'text/css';
    style.media = 'print';

    style.appendChild(document.createTextNode(css));
    head.appendChild(style);
    window.print();
    return false;
  }

  /* ****************************RE0026*********************************** */
  getAggregationSetiings(type, time) {
    this.modelAggregation = [];
    time = moment(time).date(1).format();
    const sort = this.getSortParam();
    this.meetingService.getAggregationSettings(type, this.dateConvert(time, false), sort).subscribe((settings: ListAggregationSettings) => {
      let record;
      if (this.numTab === 2) {
        record = settings['officeAggregationList'];
      } else if (this.numTab === 3) {
        record = settings['aggregationList'];
        for (let i = 0; i < record.length; i++) {
          record[i].departmentPath = record[i].departmentName.replace(/^\/+|\/+$/g, '').replace(/\//g, '|');
        }
      }
      this.modelAggregation = record;
    }, (error) => {
      const msg = error.message;
      if (msg !== 'Not exist' && msg !== 'Date of Meeting is invalid') {
        // this.dialogService.setLoaderVisible(false);
        this.dialogService.showError('MSG.ERROR');
      }
    });
  }

  getDetailAggregationSettings(model, event: any) {
    if (event.target.parentElement.className === 'sort-arrow') {
      return false;
    }
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.modelDetail = [];
    const sort = this.getSortParam();
    const time = moment(this.dateNow).date(1).format('YYYY-MM-DDTHH:mm:ssZZ');
    const modelToSend = this.convertUserInfoForDetailList(model);
    this.meetingService.getAggregationDetailSettings(this.type, time, modelToSend, sort).subscribe(
      (settings: ListAggregationDetailSettings) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.currentDetail = model;
        const detailList = settings['detailList'];
        for (let i = 0; i < detailList.length; i++) {
          detailList[i].date = moment(detailList[i].start).isValid() ? moment(detailList[i].start).format('MM月DD日') : '';
          detailList[i].meetingTime = moment(detailList[i].end).isValid() ? moment(detailList[i].start).format('HH:mm') + '-' + moment(detailList[i].end).format('HH:mm') : '';
        }
        this.modelDetail = detailList;
        this.flagAggre = false;
        this.flagDetail = true;
      }, (error) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        const msg = error.message;
        if (msg !== 'Date of Meeting is invalid') {
          this.dialogService.showError('MSG.ERROR');
        }
      });
  }

  convertUserInfoForDetailList(model) {
    if (this.numTab === 2) {
      return {
        userName: '',
        officeUserId: '',
        departmentId: '',
        id: model.officeId
      };
    }
    if (this.numTab === 3) {
      return {
        userName: model.staffName ? model.staffName : '',
        officeUserId: model.staffOfficeUserId ? model.staffOfficeUserId : '',
        departmentId: model.departmentId ? model.departmentId : '',
        id: model.staffId ? model.staffId : ''
      };
    }
  }

  changeTab(number) {
    this.numTab = number;
    this.resetSort();
    const date = new Date();
    this.dateNow = moment(date).format('YYYY-MM-DD') + 'T00:00';
    switch (number) {
      case 1:
        this.historyday = this.dateConvert(this.dateNow, true);
        this.getListVisitorHistoriesSettings();
        this.tabTitle = 1;
        break;
      case 2:
        this.flagAggre = true;
        this.flagDetail = false;
        this.type = 1; // office
        this.tabTitle = 2;
        this.getAggregationSetiings(this.type, this.dateNow);
        break;
      case 3:
        this.flagAggre = true;
        this.type = 0; // staff
        this.flagDetail = false;
        this.getAggregationSetiings(this.type, this.dateNow);
        this.tabTitle = 3;
        break;
      case 4:
        if (!this.modelLog) {
          this.getDownloadLogResponse();
        }
        this.tabTitle = 4;
        break;
      default:
        this.numTab = 1;
        this.getListVisitorHistoriesSettings();
        break;
    }
  }

  resetSort() {
    this.column = 'default';
  }

  getSortParam() {
    const sort = this.isDesc ? '+' : '-';
    return this.column === 'default' ? this.column : sort + this.column;
  }

  // Sort by Title
  orderBy(property) {
    if (this.column === property) {
      this.isDesc = !this.isDesc;
      if (!this.flagDetail) {
        this.modelAggregation = this.modelAggregation.reverse();
      } else {
        this.modelDetail = this.modelDetail.reverse();
      }
    } else {
      this.column = property;
      this.isDesc = true;
      this.reloadTabContent();
    }
  };

  endDateChanged(event) {
    this.endDate = moment(event).format('YYYY-MM-DDT23:59:59ZZ');
  }

  startDateChanged(event) {
    this.startDate = moment(event).format('YYYY-MM-DDT00:00:00ZZ');
  }

  getMeetingTime(record) {
    let res = '';
    if (moment(record['start']).isValid()) {
      if (moment(record['end']).isValid()) {
        res = moment(record['start']).format('YYYY-MM-DD HH:mm:ss〜') + moment(record['end']).format('HH:mm:ss');
      } else {
        res = moment(record['start']).format('YYYY-MM-DD');
      }
    }
    return res;
  }

  // export CSV Me0025, ME0026, Me0027
  exportCSVStatusMeetings(index) {
    let title = '';
    const dataList = [];
    switch (index) {
      case 1:
        this.dataModel = this.model['getStatusMeetingList'];
        for (let i = 0; i < this.dataModel.length; i++) {
          const data = [];
          data['timeInRoom'] = this.dataModel[i]['entering'] ? moment(this.dataModel[i]['entering']).format('HH:mm') : '';
          data['timeOutRoom'] = this.dataModel[i]['leaving'] ? moment(this.dataModel[i]['leaving']).format('HH:mm') : '';
          data['timeMeeting'] = moment(this.dataModel[i]['start']).isValid() ?
            moment(this.dataModel[i]['start']).format('HH:mm') + '-' + moment(this.dataModel[i]['end']).format('HH:mm') : '';
          data['visitorName'] = this.dataModel[i]['visitorName'];
          data['visitorOfficeName'] = this.dataModel[i]['visitorOfficeName'] || '';
          data['staffName'] = this.dataModel[i]['staffName'];
          data['staffSpecializeDepartment'] = this.dataModel[i]['staffSpecializeDepartment'] || '';
          data['purposeMeeting'] = this.dataModel[i]['purpose'];
          data['numPeople'] = this.dataModel[i]['visitorNumber'];
          data['locationMeeting'] = this.dataModel[i]['place'];
          dataList.push(data);
        }
        title = moment(this.dateNow).format('YYYY-MM-DD');
        break;
      case 2:
        if (this.flagAggre) {
          this.dataModel = this.modelAggregation;
          for (let i = 0; i < this.dataModel.length; i++) {
            const data = [];
            data['officeName'] = this.dataModel[i]['officeName'];
            data['visitorNumber'] = this.dataModel[i]['visitorNumber'] + '人';
            data['meetingNumber'] = this.dataModel[i]['meetingNumber'] + '回';
            data['totalDuration'] = this.dataModel[i]['totalDuration'] + '分';
            data['staffNumber'] = this.dataModel[i]['staffNumber'] + '人';
            dataList.push(data);
            // OK
          }
          title = moment(this.dateNow).format('YYYYMM');
        }

        if (this.flagDetail) {
          this.dataModel = this.modelDetail;
          for (let i = 0; i < this.dataModel.length; i++) {
            const data = [];
            data['timeMeeting'] = this.getMeetingTime(this.dataModel[i]);
            data['visitorName'] = this.dataModel[i]['visitorLastName'] + ' ' + this.dataModel[i]['visitorFirstName'];
            data['visitorOfficeName'] = this.dataModel[i]['visitorOfficeName'];
            data['staffName'] = this.dataModel[i]['staffLastName'] + ' ' + this.dataModel[i]['staffFirstName'];
            data['staffTypeName'] = this.dataModel[i]['staffTypeName'];
            data['meetingPurpose'] = this.dataModel[i]['meetingPurpose'];
            data['visitorNumber'] = this.dataModel[i]['visitorNumber'] + '人';
            data['place'] = this.dataModel[i]['place'];
            dataList.push(data);
          }
          title = moment(this.dateNow).format('YYYYMM_') + this.dataModel[0]['visitorOfficeName'];
        }
        break;
      case 3:
        if (this.flagAggre) {
          this.dataModel = this.modelAggregation;
          for (let i = 0; i < this.dataModel.length; i++) {
            const data = [];
            data['staffName'] = this.dataModel[i]['staffName'];
            data['departmentName'] = this.dataModel[i]['departmentName'];
            data['meetingNumber'] = this.dataModel[i]['meetingNumber'] + '回';
            data['totalDuration'] = this.dataModel[i]['totalDuration'] + '分';
            data['visitorNumber'] = this.dataModel[i]['visitorNumber'] + '人';
            dataList.push(data);
          }
          title = moment(this.dateNow).format('YYYYMM');
        }

        if (this.flagDetail) {
          this.dataModel = this.modelDetail;
          for (let i = 0; i < this.dataModel.length; i++) {
            const data = [];
            data['timeMeeting'] = this.getMeetingTime(this.dataModel[i]);
            data['visitorName'] = this.dataModel[i]['visitorLastName'] + ' ' + this.dataModel[i]['visitorFirstName'];
            data['visitorOfficeName'] = this.dataModel[i]['visitorOfficeName'];
            data['staffName'] = this.dataModel[i]['staffLastName'] + ' ' + this.dataModel[i]['staffFirstName'];
            data['meetingPurpose'] = this.dataModel[i]['meetingPurpose'];
            data['visitorNumber'] = this.dataModel[i]['visitorNumber'] + '人';
            data['place'] = this.dataModel[i]['place'];
            dataList.push(data);
          }
          title = moment(this.dateNow).format('YYYYMM_') + this.dataModel[0]['staffLastName'] + this.dataModel[0]['staffFirstName'];
        }
        break;
    }
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: false
    };
    if (dataList && dataList.length) {
      new Angular2Csv(dataList, title, options);
    }
  }

  // export CSV Me0024
  exportCSVLogMeetings(index) {
    let header = [];
    const dataList = [];
    let title = '';
    switch (index) {
      case 1:
        header = ['入館時間', '退館時間', '面会開始時間', '面会終了時間', '訪問者', '訪問者会社名', '訪問先スタッフ名'
          , '訪問先スタッフ職種', '訪問先スタッフ専門領域', '面会場所', '訪問目的', '訪問人数', 'リクエスト時のコメント', '備考'];
        this.dataModel = this.modelCSV['visitorHistories'] ? this.modelCSV['visitorHistories'] : [];
        for (let i = 0; i < this.dataModel.length; i++) {
          const data = [];
          data['entering'] = this.dataModel[i]['entering'] ? moment(this.dataModel[i]['entering']).format('DD/MM/YYYY HH:mm') : '';
          data['leaving'] = this.dataModel[i]['leaving'] ? moment(this.dataModel[i]['leaving']).format('DD/MM/YYYY HH:mm') : '';
          data['start'] = moment(this.dataModel[i]['start']).isValid() ? moment(this.dataModel[i]['start']).format('DD/MM/YYYY HH:mm') : '';
          data['end'] = moment(this.dataModel[i]['end']).isValid() ? moment(this.dataModel[i]['end']).format('DD/MM/YYYY HH:mm') : '';
          data['visitorNameKana'] = this.dataModel[i]['visitorNameKana'];
          data['visitorOfficeName'] = this.dataModel[i]['visitorOfficeName'];
          data['staffName'] = this.dataModel[i]['staffName'];
          data['staffCareer'] = this.dataModel[i]['staffCareer'] ? this.dataModel[i]['staffCareer'] : '';
          data['staffAreaType'] = this.dataModel[i]['staffAreaType'] ? this.dataModel[i]['staffAreaType'] : '';
          data['place'] = this.dataModel[i]['place'];
          data['purpose'] = this.dataModel[i]['purpose'];
          data['visitorNumber'] = this.dataModel[i]['visitorNumber'];
          data['comment'] = this.dataModel[i]['comment'];
          data['note'] = this.dataModel[i]['note'];
          dataList.push(data);
        }
        title = '面会状況';
        break;
      case 2:
        header = ['業種', '会社名', '拠点名', '拠点住所', '拠点電話番号', '部署・役職', '名前',
          '名前（カナ）', '電話番号', '病院に登録された日', 'ユーザーが登録された日'];
        this.dataModel = this.modelCSV['listCustomers'] ? this.modelCSV['listCustomers'] : [];
        for (let i = 0; i < this.dataModel.length; i++) {
          const data = [];
          data['industry'] = this.dataModel[i]['industry'];
          data['officeName'] = this.dataModel[i]['officeName'];
          data['branchName'] = this.dataModel[i]['branchName'];
          data['branchAddress'] = this.dataModel[i]['branchAddress'];
          data['branchPhoneNumber'] = this.dataModel[i]['branchPhoneNumber'];
          data['department'] = this.dataModel[i]['department'];
          data['lastName'] = this.dataModel[i]['lastName'] + ' ' + this.dataModel[i]['firstName'];
          data['lastNameKana'] = this.dataModel[i]['lastNameKana'] + ' ' + this.dataModel[i]['firstNameKana'];
          data['phoneNumber'] = this.dataModel[i]['phoneNumber'];
          data['assigned'] = this.dataModel[i]['assigned'] ? moment(this.dataModel[i]['assigned']).format('DD/MM/YYYY HH:mm') : '';
          data['created'] = this.dataModel[i]['created'] ? moment(this.dataModel[i]['created']).format('DD/MM/YYYY HH:mm') : '';
          dataList.push(data);
        }
        title = '取引先一覧';
        break;
    }

    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: false,
      headers: header
    };

    new Angular2Csv(dataList, title, options);
    this.getDownloadLogResponse();
  }

}
