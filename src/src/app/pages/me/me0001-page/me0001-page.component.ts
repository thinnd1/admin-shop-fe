import {Component, OnInit, Renderer2} from '@angular/core';
import {Router} from '@angular/router';
import {SharedValueService} from '../../../services/shared-value.service';
import {MeetingService} from '../../../services/meeting.service';
import {DataMeetingSettings} from '../../../models/me/data-meeting-settings';
import {HttpStatus} from '../../../common/http.status';
import {DialogService} from '../../../services/dialog.service';
import {ConditionMeetingStatus} from '../../../models/me/condition-meeting-staus';
import {MeetingStatus} from '../../../models/me/meeting-status';
import {UserSession} from '../../../models/ba/user-session';
import {TranslateService} from '@ngx-translate/core';
import {Helper} from '../../../common/helper';

declare var moment: any;
declare const $: any;
@Component({
  selector: 'app-me0001-page',
  templateUrl: './me0001-page.component.html',
  styleUrls: ['./me0001-page.component.scss'],
  preserveWhitespaces: false
})
export class Me0001PageComponent implements OnInit {
  public listUsers: any[] = [];
  public requestSource: any[];
  public status: any[];
  public sort: any[];
  public dataMeeting: any;
  public selectedUserId: string;
  public userSession: UserSession;
  public checkAuthority = true;
  public dataLength: number;

  public conditionSearch: ConditionMeetingStatus;
  public listRequestMeeting: MeetingStatus[] = [];
  public searchZeroRecord = false;
  public currentPage: number;

  constructor(private router: Router, private shareValue: SharedValueService, private meetingService: MeetingService,
              private dialogService: DialogService, private translate: TranslateService, private helper: Helper) {
    const meetingSelectOption = this.shareValue.meetingTopSelectOption();
    this.requestSource = meetingSelectOption.requestSource;
    this.status = meetingSelectOption.status;
    this.sort = meetingSelectOption.sort;
    this.userSession = this.shareValue.getUserSession();
  }

  ngOnInit() {
    this.currentPage = 0;
    this.conditionSearch = new ConditionMeetingStatus('0', '5', '0', 20, 0);
    this.selectedUserId = 'ALL';
    this.checkAuthority = this.userSession.funcAuthority.FP_7;
    this.getDataMeeting();
    // this.scrollPaging();
  }

  setUserDefault() {
    this.listUsers = [
      {
        'firstName': 'すべて',
        'lastName': '',
        'userId': 'ALL'
      },
      {
        'firstName': '自分の面会',
        'lastName': '',
        'userId': this.userSession.userId
      }
    ];
  }

  /*
   ** call api get list meeting
   */
  getDataMeeting() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getDataMeeting(this.selectedUserId, this.conditionSearch).subscribe((settings: DataMeetingSettings) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.searchZeroRecord = true;
      this.currentPage = this.conditionSearch.page;

      if (!$.isEmptyObject(settings)) {
        this.dataMeeting = settings;
        this.setUserDefault();
        this.listUsers = this.listUsers.concat(this.dataMeeting.handleUserResponses);
        if (this.conditionSearch.page === 0) {
          this.listRequestMeeting = this.convertDateMeeting(this.dataMeeting.meetingList);
        } else {
          this.listRequestMeeting = this.listRequestMeeting.concat(this.convertDateMeeting(this.dataMeeting.meetingList));
        }

        this.dataLength = this.dataMeeting.meetingList.length;
      } else {
        this.dataLength = 0;
      }
    }, (error: HttpStatus) => {
      if (this.listUsers.length === 0) {
        this.setUserDefault();
      }
      this.currentPage = this.conditionSearch.page;
      this.searchZeroRecord = false;
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
        meeting.userRequest = 'SELF_REQUEST';
      }

      if (meeting.senderType === 'MR') {
        meeting.userRequest = 'CUSTOMER_REQUEST';
      }

      if (meeting.status === 'NEW' && meeting.senderType === 'MR' && meeting.frameId) {
        meeting.routerLink = '/me/me0007/' + '1/' + meeting.frameId;
      } else {
        meeting.routerLink = '/me/me0007/' + '0/' + meeting.requestId;
      }
    }

    return listMeeting;
  }

  /*
   ** paging when event scroll
   */
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

  /*
   ** redirect to page me00016
   */
  goToME0016() {
    this.router.navigate(['me/me0016']);
  }

  /*
   ** redirect to page he0003
   */
  goToHelp() {
    this.router.navigate(['he/he0003']);
  }

  /*
   ** print list request
   */
  printPage() {
    // const css = '@page { margin: 20mm 2.75mm 20mm 2.75mm}';
    // const css = '@page { margin: 35px 2mm 35px 2mm}';
    const css = '@page { layout: portrait; size: A4; margin: 13mm 2mm 13mm 2mm}, @media print {html, body {width: 210mm;height: 297mm;}}';

    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.type = 'text/css';
    style.media = 'print';

    style.appendChild(document.createTextNode(css));
    head.appendChild(style);
    const originalTitle = document.title;
    this.translate.get('ME0001.PRINT_PAGE_TITLE').subscribe(title => {
      document.title = title;
    });

    $('#page-title').hide();
    $('#select-user').hide();
    $('#list-select-options').hide();
    window.print();
    document.title = originalTitle;
    $('#page-title').show();
    $('#select-user').show();
    $('#list-select-options').show();
    return false;
  }
}
