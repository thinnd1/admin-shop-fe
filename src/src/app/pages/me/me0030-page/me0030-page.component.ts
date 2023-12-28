import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {SharedValueService} from '../../../services/shared-value.service';
import {MeetingService} from '../../../services/meeting.service';
import {DialogService} from '../../../services/dialog.service';
import {ConditionMeetingStatus} from '../../../models/me/condition-meeting-staus';
import {MeetingStatus} from '../../../models/me/meeting-status';
import {TranslateService} from '@ngx-translate/core';
import {Helper} from '../../../common/helper';
declare var moment: any;

@Component({
  selector: 'app-me0030-page',
  templateUrl: './me0030-page.component.html',
  styleUrls: ['./me0030-page.component.scss'],
  preserveWhitespaces: false
})
export class Me0030PageComponent implements OnInit {
  public conditionSearch: ConditionMeetingStatus;
  public meetingPresentation: any[];
  public requestSource: any[];
  public status: any[];
  public sort: any[];

  public listRequestMeeting: MeetingStatus[] = [];
  public dataMeeting: any;
  public searchZeroRecord = false;
  public dataLength = 0;
  public currentPage: number;

  constructor(private router: Router, private shareValue: SharedValueService, private meetingService: MeetingService,
              private dialogService: DialogService, private translate: TranslateService, private helper: Helper) {
    const dataSearch = this.shareValue.meetingPrTopSelectOption();
    if (!$.isEmptyObject(dataSearch)) {
      this.meetingPresentation = dataSearch.meetingPresentation;
      this.requestSource = dataSearch.requestSource;
      this.status = dataSearch.status;
      this.sort = dataSearch.sort;
    }
  }

  ngOnInit() {
    this.currentPage = 0;
    this.conditionSearch = new ConditionMeetingStatus('0', '5', '0', 20, 0);
    this.getDataMeeting();
  }

  getDataMeeting() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getDataMeetingPr(this.conditionSearch).subscribe((settings: any) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.searchZeroRecord = true;
      this.currentPage = this.conditionSearch.page;
      if (!$.isEmptyObject(settings)) {
        this.dataMeeting = settings;
        if (this.conditionSearch.page === 0) {
          this.listRequestMeeting = this.convertDateMeeting(this.dataMeeting.meetingList);
        } else {
          const dataMeeting = this.dataMeeting.meetingList;
          this.listRequestMeeting = this.listRequestMeeting.concat(this.convertDateMeeting(dataMeeting));
        }

        this.dataLength = this.dataMeeting.meetingList.length;
      } else {
        this.dataLength = 0;
      }
    }, (error) => {
      this.searchZeroRecord = false;
      this.currentPage = this.conditionSearch.page;
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  convertDateMeeting(listMeeting: any[]) {
    for (let i = 0; i < listMeeting.length; i++) {
      const meeting = listMeeting[i];

      meeting.numberTimeOther = 0;
      meeting.userRequest = '';

      if ((meeting.status === 'NEW' || (meeting.status === 'CANCELED' && !(meeting.fixedStart && meeting.fixedEnd)))
        && meeting.candidateTimeList.length > 0 ) {
        meeting.dateStart = this.helper.convertDateTime(meeting.candidateTimeList[0].start, 'MM月DD日(date)');
        meeting.time = this.helper.convertDateTime(meeting.candidateTimeList[0].start, 'HH:mm') + '〜'
          + this.helper.convertDateTime(meeting.candidateTimeList[0].end, 'HH:mm');
        meeting.numberTimeOther = (meeting.candidateTimeList.length > 1) ? (meeting.candidateTimeList.length - 1) : 0;
      }
      if (meeting.status !== 'NEW' && meeting.fixedStart && meeting.fixedEnd) {
        meeting.dateStart = this.helper.convertDateTime(meeting.fixedStart, 'MM月DD日(date)');
        meeting.time = this.helper.convertDateTime(meeting.fixedStart, 'HH:mm') + '〜'
          + this.helper.convertDateTime(meeting.fixedEnd, 'HH:mm');
      }
      meeting.updatedTime = this.helper.convertDateTime(listMeeting[i].updatedTime, 'M月D日(date)') + '　'
        + this.helper.convertDateTime(listMeeting[i].updatedTime, 'HH:mm');

      if (meeting.senderType === 'DR' || meeting.senderType === 'MD') {
        meeting.userRequest = 'DOCTOR_REQUEST';
      }

      if (meeting.senderType === 'MR') {
        meeting.userRequest = 'SELF_REQUEST';
      }
    }

    return listMeeting;
  }

  onScrollDown() {
   if (this.dataLength === this.conditionSearch.pageSize && this.currentPage === this.conditionSearch.page) {
     this.conditionSearch.page += 1;
     this.getDataMeeting();
   }
  }

  changeOptionDisplay() {
    this.conditionSearch.page = 0;
    if (this.conditionSearch.order === '2') {
      this.conditionSearch.meetingStatus = '0';
    }
    this.getDataMeeting();
  }

  printPage() {
    // const css = '@page { margin: 35px 2mm 35px 2mm}';
    const css = '@page { layout: portrait; size: A4; margin: 13mm 2mm 13mm 2mm}, @media print {html, body {width: 210mm;height: 297mm;}}';

    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.type = 'text/css';
    style.media = 'print';

    style.appendChild(document.createTextNode(css));
    head.appendChild(style);
    this.translate.get('ME0030.TITLE').subscribe(title => {
      document.title = title;
    });

    $('#title-head').hide();
    $('#list-select-options').hide();

    window.print();
    $('#title-head').show();
    $('#list-select-options').show();
    return false;
  }
}
