import { MeetingService } from '../../../services/meeting.service';
import { SharedValueService } from '../../../services/shared-value.service';
import {Component, OnInit, Renderer2} from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from '../../../services/dialog.service';
import { HttpError } from '../../../common/error/http.error';
import { ListCustomerSettings } from '../../../models/me/list-customer-settings';
import { ListInitScreen } from '../../../models/me/get-init-screen';
import { PinCustomerSettings } from 'app/models/me/pin-customer-settings';
import {MrInfoSearch} from '../../../models/me/mr-info-search';
import {FuncAuthoritySet} from '../../../models/ba/user-session';
import {WsService} from '../../../services/stomp/ws.service';
import {Message} from '@stomp/stompjs';
declare var moment: any;

declare const $: any;
@Component({
  selector: 'app-me0005-page',
  templateUrl: './me0005-page.component.html',
  styleUrls: ['./me0005-page.component.scss']
})
export class Me0005PageComponent implements OnInit {
  public model = new ListCustomerSettings();
  public searchConditions: MrInfoSearch;
  public max_size_search = '20';
  public sendMessage = false;
  public authorityRequestMeeting = false;
  // Data when Scroll
  dataAll = new Array();
  // Declare variable
  selectedIndustryI0001 = false;
  public searchAdvance = false;

  // Master Data
  listIndustry: any;
  listFieldID: any;
  customerOfficesList: any;
  userSession;
  selectIndustry: any[];
  currentPage: string;
  visitorRecordVisible = false;
  callApi: boolean;

  constructor(private router: Router, private shareValue: SharedValueService, private dialogService: DialogService,
              private meetingService: MeetingService, private wsService: WsService) {
    if (!this.wsService.isConnected()) {
      this.wsService.initConnection();
    }
  }

  displayTooltip() {
    $('[data-toggle="tooltip"]').tooltip({animation: false});
    $('[data-toggle="popover"]').popover();
  }

  ngOnInit() {
    this.currentPage = '';
    this.searchConditions = new MrInfoSearch('', true, true, '', [''], [''], '', '', this.max_size_search);
    this.selectIndustry = [''];
    this.shareValue.fetchUserSession();
    this.userSession = this.shareValue.getUserSession();
    this.checkAuthorityRequestMeeting();
    this.checkAuthoritySendMessage();
    this.meetingService.getInitScreen().subscribe((settings: ListInitScreen) => {
      this.listIndustry = settings.industriesList;
      this.listFieldID = settings.mrFiledTypesList;
      this.customerOfficesList = settings.customerOfficesList;
    });
    this.getListUserMR();
  }

  showSearchAdvance() {
    this.searchAdvance = !this.searchAdvance;
  }

  searchUserMR(changeIndustry?: boolean) {
    this.searchConditions.next = '';

    // if change selectedIndustry => update selectedOffice
    if (changeIndustry) {
      this.searchConditions.selectedOffice = [''];
    }

    if (this.selectIndustry.length > 1) {
      for (let i = 0 ; i < this.selectIndustry.length; i++) {
        if (this.selectIndustry[i] !== this.searchConditions.selectedIndustry) {
          this.searchConditions.selectedIndustry = this.selectIndustry[i];
          this.selectIndustry = new Array(this.searchConditions.selectedIndustry);
          break;
        }
      }
    } else {
      if (this.selectIndustry.length === 1) {
        this.searchConditions.selectedIndustry = this.selectIndustry[0];
      } else {
        this.selectIndustry = new Array(this.searchConditions.selectedIndustry);
      }
    }

    if (this.searchConditions.selectedIndustry === 'I0001' || this.searchConditions.selectedIndustry === '') {
      this.selectedIndustryI0001 = false;
    } else {
      this.selectedIndustryI0001 = true;
      this.searchConditions.selectedField = [''];
    }
    this.getListUserMR();
  }

  getListUserMR() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getListCustomerSettings(this.searchConditions)
      .subscribe((settings: ListCustomerSettings) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.callApi = true;
        this.currentPage = this.searchConditions.next;

        if (!$.isEmptyObject(settings)) {
          this.visitorRecordVisible = settings.visitorRecordVisible;
          this.model = settings;
          const dataScroll = this.model.meetingRequestList;
          if (!this.searchConditions.next) {
            this.dataAll = this.model.meetingRequestList;
          } else {
            this.dataAll = this.dataAll.concat(dataScroll);
          }

          this.customerOfficesList = this.model.customerOfficesList;
        } else {
          this.dataAll = new Array();
          this.customerOfficesList = new Array();
        }
      }, (error: HttpError) => {
        this.currentPage = this.searchConditions.next;
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.callApi = true;
        this.dialogService.showError('MSG.ERROR');
      });
  }

  onScrollDown() {
    if (this.dataAll.length < this.model.totalNumber && this.model.meetingRequestList.length === 20) {
      if (this.currentPage === this.searchConditions.next) {
        this.searchConditions.next = this.model.next;
        this.getListUserMR();
      }
    }
  }

  pinCustomer(event, userId, officeId, pined) {
    event.stopPropagation();
    $('.tooltip').remove();
    const data = new PinCustomerSettings(userId, officeId, !pined);
    this.meetingService.postPinCustomer(data).subscribe((response: any) => {
      this.searchConditions = new MrInfoSearch('', true, true, [''], [''], [''], '', '', this.max_size_search);
      window.scrollTo(window.pageXOffset, 0);
      this.searchUserMR();
    }, (error: HttpError) => {
      console.log(error);
    });
  }

  goToHelp() {
    this.router.navigate(['/he/he0004']);
  }

  showInfoDetailMr(userId: string, officeId: string) {
    $('.tooltip').remove();
    this.router.navigate(['me/me0004', userId, officeId]);
  }

  goToME0006(event: any, userId: string, officeId: string) {
    event.stopPropagation();
    this.router.navigate(['me/me0006', userId, officeId, '']);
  }

  goToCH0002(event: any, officeUserId: string) {
    event.stopPropagation();
    const requestId = this.userSession.userId + Date.now();

    const data = {
      'type': 'get_room', // require
      'user': this.userSession.officeUserId, // require
      'request_id': this.userSession.userId + Date.now(), // 'クライアントで発行するユニークなID(user_id+unixtime)', // require
      'dr': this.userSession.officeUserId, // 'officeUserId of dr.joy user', // 医療者の事業所ユーザID
      'pr': officeUserId // 'officeUserId of pr.joy user', // 製薬企業の事業所ユーザID
    };

    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.wsService.onPublish('get_room', data);

    this.wsService.messages.map((message: Message) => {
      return message.body;
    }).subscribe((msg_body: string) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      if (requestId === JSON.parse(msg_body).request_id) {
        this.router.navigate(['ch/ch0007', JSON.parse(msg_body).room.id]);
      }
    });

    this.wsService.errors.map((message: Message) => {
      return message.body;
    }).subscribe((msg_body: string) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      if (requestId === JSON.parse(msg_body).request_id) {
        this.dialogService.showError(JSON.parse(msg_body).error.msg);
      }
    });
  }

  checkAuthoritySendMessage() {
    if (this.userSession) {
      switch (this.userSession.funcAuthoritySet) {
        case FuncAuthoritySet.FPS_0:
          const funcAuthority = this.userSession.funcAuthority;
          if (funcAuthority.FP_6) {
            this.sendMessage = true;
          }
          break;
        case FuncAuthoritySet.FPS_1:
          this.sendMessage = true;
          break;
        case FuncAuthoritySet.FPS_2:
          this.sendMessage = true;
          break;
        default:
          this.sendMessage = false;
          break;
      }
    }
  }

  checkAuthorityRequestMeeting() {
    if (this.userSession) {
      this.authorityRequestMeeting = this.userSession.funcAuthority.FP_1;
    }
  }
}
