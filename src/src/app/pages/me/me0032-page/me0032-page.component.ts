import { MeetingService } from '../../../services/meeting.service';
import { SharedValueService } from '../../../services/shared-value.service';
import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from '../../../services/dialog.service';
import { HttpError } from '../../../common/error/http.error';
import {DoctorInfoSearch} from '../../../models/me/doctor-info-search';
import {ListDoctor} from '../../../models/me/list-doctor';
import {MasterService} from '../../../services/master.service';
import {ModelInput} from '../../../common/meeting-common';
import {SpecialityArea} from '../../../models/ma/speciality-area';
import {TranslateService} from '@ngx-translate/core';
import {PinStaff} from '../../../models/me/pinStaff';

declare const $: any;
@Component({
  selector: 'app-me0032-page',
  templateUrl: './me0032-page.component.html',
  styleUrls: ['./me0032-page.component.scss'],
  preserveWhitespaces: false
})
export class Me0032PageComponent implements OnInit {
  public model = new ListDoctor();
  public dataAll = new Array();
  public searchAdvance = false;

  // master data
  public userSession;
  public specialtyAreasList: SpecialityArea;

  // search
  public searchConditions: DoctorInfoSearch;
  public max_size_search = 20;
  public listOfficeDoctor = new Array();

  // popup
  public details: string;
  public demandList: any[];
  public htmlDemandList: string;
  public meetingRule: string;
  public me0032Translate: any;
  public currentPage: number;
  public showTop: boolean;
  public callApi: boolean;

  constructor(private router: Router, private shareValue: SharedValueService, private dialogService: DialogService,
              private meetingService: MeetingService, private masterService: MasterService, private translate: TranslateService) {
    this.translate.get('ME0032').subscribe(
      (res) => {
        this.me0032Translate = res;
      }
    );
  }

  displayTooltip() {
    $('[data-toggle="tooltip"]').tooltip({animation: false});
    $('[data-toggle="popover"]').popover();
  }

  ngOnInit() {
    this.hideAspirationList();
    this.hideRequestMeetingRule();

    this.currentPage = 0;
    this.searchConditions = new DoctorInfoSearch('', true, true, true, [''], [''], 0, this.max_size_search);
    this.userSession = this.shareValue.getUserSession();
    this.masterService.getSpecialityAreas().subscribe(
      (specialityArea: SpecialityArea) => {
        this.specialtyAreasList = specialityArea.specialtyAreas;
      }, (error: HttpError) => {
        this.dialogService.showError('MSG.ERROR');
      }
    );
    this.meetingService.getListHandlingHospitals().subscribe(
      (settings) => {
        this.listOfficeDoctor = settings;
      }
    );
    this.getListDoctorRequest();
  }

  showSearchAdvance() {
    this.searchAdvance = !this.searchAdvance;
  }

  searchDoctor() {
    this.searchConditions.page = 0;
    this.getListDoctorRequest();
  }

  getListDoctorRequest() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getListDoctorRequest(this.searchConditions)
      .subscribe((settings: ListDoctor) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.callApi = true;
        this.currentPage = this.searchConditions.page;
        if (!$.isEmptyObject(settings)) {
          this.model = settings;
          const dataScroll = this.model.doctors;
          if (this.searchConditions.page === 0) {
            this.dataAll = this.model.doctors;
          } else {
            this.dataAll = this.dataAll.concat(dataScroll);
          }
        } else {
          this.dataAll = new Array();
          this.model.totalNumber = 0;
          this.model.doctors = new Array();
        }
      }, (error: HttpError) => {
        this.currentPage = this.searchConditions.page;
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.callApi = true;
        this.dialogService.showError('MSG.ERROR');
      });
  }

  onScrollDown() {
    if (!$.isEmptyObject(this.model) && this.currentPage === this.searchConditions.page) {
      if (this.model.doctors.length >= this.max_size_search && this.dataAll.length < this.model.totalNumber) {
        this.searchConditions.page += 1;
        this.getListDoctorRequest();
      }
    }
  }

  pinCustomer(event, userId, officeId, pinned) {
    event.stopPropagation();
    $('.tooltip').remove();
    const data = new PinStaff(userId, officeId, !pinned);
    this.meetingService.postPinCustomerMR(data).subscribe(
      (response: any) => {
        this.searchConditions = new DoctorInfoSearch('', true, true, true, [''], [''], 0, this.max_size_search);
        window.scrollTo(window.pageXOffset, 0);
        this.searchDoctor();
      }
    );
  }

  showAspirationRequestMeeting(doctor: any, event, requestMeetingType: string) {
    event.stopPropagation();
    setTimeout(() => {
      $('#' + requestMeetingType).show();

      this.details = doctor.meetingDemand.details;
      this.demandList = doctor.meetingDemand.demandList;
      this.meetingRule = doctor.meetingRule;
      if (requestMeetingType === 'requestMeeting') {
        this.showAspirationList();
        this.hideRequestMeetingRule();
      } else {
        this.hideAspirationList();
      }

      // const mouseLeft = event.x;
      // const mouseTop = event.y;
      setTimeout(() => {
        const mouseLeft = event.pageX;
        const mouseTop = event.pageY;

        let leftPopup = mouseLeft - event.offsetX + event.target.clientWidth / 2;
        let topPopup = mouseTop - event.offsetY + event.target.clientHeight;

        const widthPopup = $('#' + requestMeetingType).width();
        const heightPopup = $('#' + requestMeetingType).height();

        leftPopup -= widthPopup * 3 / 4;

        if ((heightPopup + topPopup + 10) < ($(window).height() + $(window).scrollTop())) {
          this.showTop = false;
        } else {
          this.showTop = true;
          topPopup -= event.target.clientHeight + heightPopup;
        }

        $('#' + requestMeetingType).css({
          top: topPopup,
          left: leftPopup,
          position: 'absolute',
          'z-index': 1000,
        });
      });
    });
  }

  showAspirationList() {
    this.htmlDemandList = '<td><strong>' + this.me0032Translate.REQUEST + '</strong></td>';
    if (this.demandList.length > 0) {
      const row = (this.demandList.length === 1) ? 1 : 2;
      const endList1 = (this.demandList.length % 2 === 0) ? this.demandList.length / 2 :
        (Math.floor(this.demandList.length / 2) + 1);
      for (let i = 0; i < row; i++) {
        const start = 0 + i * endList1;
        const end = (i === 0) ? endList1 : this.demandList.length;
        this.htmlDemandList += '<td>';
        for (let j = start; j < end; j++) {
          this.htmlDemandList += (j === start) ? ('・' + this.demandList[j].label) : ('<br>・' + this.demandList[j].label);
        }
        this.htmlDemandList += '</td>';
      }
    }

    $('#htmlDemandList').find('td').remove();
    $('#htmlDemandList').append(this.htmlDemandList);
  }

  hideRequestMeetingRule() {
    $('#requestMeetingRule').hide();
  }

  hideAspirationList() {
    $('#requestMeeting').hide();
  }

  showProfileDoctor(doctor: any) {
    $('.tooltip').remove();
    this.router.navigate(['me/me0036', doctor.userId, doctor.officeId]);
  }

  requestMeetingDoctor(event: any, userId: string, officeId: string) {
    event.stopPropagation();

    // check jobType, number frame
    this.meetingService.getAspirationMeeting(userId, officeId).subscribe(
      (res) => {
        if (res.jobType === 'J0022' || res.jobType === 'J0029' || res.meetingFrames.length > 0) {
          this.router.navigate(['me/me0028', userId, officeId]);
        } else {
          this.router.navigate(['me/me0029', userId, officeId, ModelInput.FUTURE, '']);
        }
      },
      (error) => {
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }


}
