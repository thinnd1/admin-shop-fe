import {Component, OnInit, HostListener} from '@angular/core';
import {MeetingService} from '../../../services/meeting.service';
import {MeetingsDemandsSettings} from '../../../models/me/meeting-demands-settings';
import {MeetingsDemandsSettingsSaveResult} from '../../../models/me/meeting-demands-settings-save-result';
import {SharedValueService} from '../../../services/shared-value.service';
import {MeetingDemandsInputSettings} from '../../../models/me/meeting-demands-input-settings';
import {HttpError} from '../../../common/error/http.error';
import {DialogService} from '../../../services/dialog.service';
import {StaffSettingMeeting} from '../../../models/me/staff-setting-meeting';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-me0021-page',
  templateUrl: './me0021-page.component.html',
  styleUrls: ['./me0021-page.component.scss']
})
export class Me0021PageComponent implements OnInit {
  userSession: any;
  model = new MeetingsDemandsSettings();
  modelInput = new MeetingDemandsInputSettings();
  staff: StaffSettingMeeting;
  detail: string;
  checkTab: boolean;

  constructor(private dialogService: DialogService, private meetingService: MeetingService,
              private sharedValueService: SharedValueService, private activatedRoute: ActivatedRoute,
              private translate: TranslateService,
              private router: Router) {
    this.router.events.subscribe((event) => {
      if (event['url'] === '/me/me0021') {
        this.checkTab = true;
      }
    });
  }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    this.activatedRoute.params.subscribe((staff: StaffSettingMeeting) => {
      if (!$.isEmptyObject(staff) && staff['flag'] === 'true') {
        this.staff = new StaffSettingMeeting(staff['userId'], staff['officeId'], null, null, null, null, null);
      } else {
        this.staff = new StaffSettingMeeting(this.userSession.userId, this.userSession.officeId, null, null, null, null, null);
      }
      this.getListMeetingDemands();
    });
  }

  getListMeetingDemands() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getMeetingDemandsSettings(this.staff.userId, this.staff.officeId).subscribe((settings: MeetingsDemandsSettings) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.model = settings;
      this.detail = this.model.details;
    }, (error: HttpError ) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  putMeetingDemands() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    if (this.model.details.length > 300) {
      this.dialogService.showError('ME0021.MSG_MAX_LENGTH');
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      return false;
    }
    this.mapModelPut();
    this.meetingService.putMeetingDemandsSettings(this.modelInput).subscribe((response: MeetingsDemandsSettingsSaveResult) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showSuccess('ME0021.SAVED');
      this.getListMeetingDemands();
    }, (error: HttpError ) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  mapModelPut(){
    this.modelInput.userId = this.model.userId;
    this.modelInput.officeId = this.model.officeId;
    this.modelInput.details = this.model.details;
    this.modelInput.meetingDemandIds = [];
    if(this.model.meetingDemand.length){
      for (let i = 0; i< this.model.meetingDemand.length; i++){
        if(this.model.meetingDemand[i].selected === true){
          this.modelInput.meetingDemandIds.push(this.model.meetingDemand[i].id);
        }
      }
    }else{
      this.modelInput.meetingDemandIds = [];
    }
  }

  // @HostListener('document:keydown', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea' && this.checkTab) {
  //     this.putMeetingDemands();
  //   }
  // }
  //
  // @HostListener('document:click', ['$event'])
  // handleClickEvent(event) {
  //   let tab = [];
  //   let me0021Tab = '';
  //   this.translate.get(['ME0016', 'ME0018' , 'ME0021']).subscribe(msg => {
  //     tab = [
  //       msg.ME0016.TITLE,
  //       msg.ME0018.TITLE,
  //       msg.ME0021.TAB,
  //     ];
  //     me0021Tab = msg.ME0021.TAB;
  //   });
  //   if (tab.indexOf(event.target.innerText) > -1) {
  //     if (me0021Tab.indexOf(event.target.firstChild.data) > -1 || event.target.hash === '#tab-content4') {
  //       this.checkTab = true;
  //     } else {
  //       this.checkTab = false;
  //     }
  //   }
  // }
}
