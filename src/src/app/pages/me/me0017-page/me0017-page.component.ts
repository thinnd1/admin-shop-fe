import { Component, OnInit } from '@angular/core';
import {MeetingSettingDay} from '../../../models/me/metting-setting-day';
import {DialogResult} from '../../../models/dialog-param';
import {MeetingService} from '../../../services/meeting.service';
import {CalendarCommon} from '../../../common/calendar-common';
import {TranslateService} from '@ngx-translate/core';
import {SharedValueService} from '../../../services/shared-value.service';
import {FuncAuthoritySet, UserSession} from '../../../models/ba/user-session';
import {UpdateHolidaySetting} from '../../../models/me/update-holiday-setting';
import {SettingTimeDay} from '../../../models/me/setting-time-day';
import {Helper} from '../../../common/helper';
import {MeetingCommon, SettingType} from '../../../common/meeting-common';
import {SettingDayList} from '../../../models/me/setting-day-list';
import {DialogService} from '../../../services/dialog.service';
import {RuleMeetingSetting} from '../../../models/me/rule-meeting-seeting';
import {MasterService} from '../../../services/master.service';
import {JobType} from '../../../models/ma/job-type';
declare var moment: any;
@Component({
  selector: 'app-me0017-page',
  templateUrl: './me0017-page.component.html',
  styleUrls: ['./me0017-page.component.scss'],
})
export class Me0017PageComponent implements OnInit {
  public SettingType: typeof SettingType = SettingType;
  public jobType: string;
  public listJobType: any[];
  public settingFlag = true;
  public errorSettingTime: string;

  public model: RuleMeetingSetting;
  public me0017Model;
  public modelSettingType: number;
  public errorValidate: any[];
  public hospitalSetting: SettingDayList;
  public showPopoverSetting = false;
  public showLeft = false;
  public showRight = false;
  public timePicker = [];
  public me0017Translate: any;
  public userSession: UserSession;
  public checkValidate: boolean;
  public day: number;
  public isChangeForm = false;
  public authorityEditSettingMeeting: boolean;

  constructor(private meetingService: MeetingService, private calendarCommon: CalendarCommon, private dialogService: DialogService,
              private translate: TranslateService, private meetingCommon: MeetingCommon, private sharedValueService: SharedValueService,
              private helper: Helper, private masterService: MasterService) {
    this.calendarCommon.genTimePicker(this.timePicker);
    this.userSession = this.sharedValueService.getUserSession();
    // this.checkAuthorityEditSeetingMeetingOffice();
    this.masterService.getJobType().subscribe(
      (jobType: JobType) => {
        this.listJobType = jobType.jobTypeList;
      });
    this.jobType = 'J0001';
    this.translate.get('ME0017.ME0017').subscribe(
      (res) => {
        this.me0017Translate = res;
      }
    );
  }

  ngOnInit() {
    this.getMeetingSettingOffice();
    this.editSettingTimeMeeting(null);
    this.hide_popover_setting();
  }

  changJobType() {
    this.getMeetingSettingOffice();
  }

   getMeetingSettingOffice() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getMeetingSetting(this.jobType, this.userSession.officeId, 0).subscribe(
      (res) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.model = res;
        this.hospitalSetting = this.meetingCommon.sortSettingDayListMeeting(res.hospitalSetting);
        this.settingFlag = !res.allowHolidayVisitOffice;
        this.checkSettingMeeting();
      },
      (error) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
        this.model = null;
        this.hospitalSetting = null;
      }
    );
  }

  checkSettingMeeting() {
    // check setting meeting hospital
    if (this.hospitalSetting.settingDayList.length === 0) {
      const maxDay = new Array(7);
      for (let i = 0; i < maxDay.length; i++) {
        const settingDay = new MeetingSettingDay(i, new Array, this.SettingType.NONE);
        this.hospitalSetting.settingDayList.push(settingDay);
      }
    }
  }

  confirmUpdateHolidaySettings() {
    const html = '<p>' + this.me0017Translate.HOLIDAY_CONFIRM.MSG1 + '</p>'
      + '<p>' + this.me0017Translate.HOLIDAY_CONFIRM.MSG2 + '</p>';

    this.dialogService.showMessage('warning', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
      (res: DialogResult) => {
        if (res.isOk()) {
          setTimeout(() => {
            this.updateHolidaySettings();
          }, 1000);
        } else {
          this.settingFlag = !this.settingFlag;
        }
      }
    );
  }

  updateHolidaySettings() {
    const jobType = this.jobType;
    const type = 0;
    const office = this.userSession.officeId;
    const allowHolidayVisit = !this.settingFlag;
    const objUpdate = new UpdateHolidaySetting(type, office, jobType, null, allowHolidayVisit);
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.putUpdateHolidaySettings(objUpdate).subscribe(
      (res) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showSuccess('MSG.ME0017.E002_2');
        this.ngOnInit();
      },
      (error) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.settingFlag = !this.settingFlag;
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  settingTimeMeeting(hospitalSetting: any, index: number, event) {
    if (!this.showPopoverSetting) {
      this.show_popover_setting();
      this.day = hospitalSetting.day;
      this.editSettingTimeMeeting(hospitalSetting);
      setTimeout(() => {
        const top = event.pageY;
        const left = event.clientX + $(window).scrollLeft();
        const widthPopup = $('#popoverSetting').width();
        const limitLeft = $('#settingTime').offset().left;
        const maxWidth = $(window).width();

        let leftPopup: number;
        const topPopup = top;

        if ((left - widthPopup / 2) < limitLeft) {
          this.showLeft = true;
          this.showRight = false;
          leftPopup = left - widthPopup / 20;
        } else {
          if ((left + widthPopup / 2) < maxWidth) {
            leftPopup = left - widthPopup / 2;
            this.showLeft = false;
            this.showRight = false;
          } else {
            this.showLeft = false;
            this.showRight = true;
            leftPopup = left - widthPopup * 95 / 100;
          }
        }

        $('#popoverSetting').css({
          top: topPopup,
          left: leftPopup,
          position: 'absolute',
          'z-index': 999
        });
      });
    }
  }

  confirmClosePopupEditSetting() {
    if (this.isChangeForm) {
      const html = '<p>' + this.me0017Translate.MSG_CLOSE_1 + '</p>'
        + '<p>' + this.me0017Translate.MSG_CLOSE_2 + '</p>';
      this.dialogService.showMessage('warning', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
        (res: DialogResult) => {
          if (res.isOk()) {
            this.isChangeForm = false;
            this.hide_popover_setting();
          }
        });
    } else {
      this.isChangeForm = false;
      this.hide_popover_setting();
    }
  }

  hide_popover_setting() {
    this.showPopoverSetting = false;
    $('#popupCreateEvent').hide();
  }

  show_popover_setting() {
    this.showPopoverSetting = true;
    $('#popupCreateEvent').show();
  }

  editSettingTimeMeeting(hospitalSetting: any) {
    let oldSetting = new Array;

    if (hospitalSetting) {
      if (hospitalSetting.settingType === this.SettingType.SET_TIME) {
        oldSetting = oldSetting.concat(hospitalSetting.settingTimeList);
        this.modelSettingType = this.SettingType.SET_TIME;
      }
      if (hospitalSetting.settingType === this.SettingType.NONE) {
        this.modelSettingType = this.SettingType.NONE;
      }
      if (hospitalSetting.settingType === this.SettingType.DISALLOW_ALL_DAY) {
        this.modelSettingType = this.SettingType.DISALLOW_ALL_DAY;
      }
    }
    this.me0017Model = new SettingTimeDay(false, false, false, new Array(), oldSetting);
    this.errorValidate = new Array();
    this.errorSettingTime = null;
  }

  addTimeMeeting(event) {
    event.preventDefault();
    this.isChangeForm = true;
    if (this.modelSettingType === this.SettingType.SET_TIME) {
      this.me0017Model.settingTimeList.push({start: '', end: ''});
      this.errorValidate.push('');
    }
  }

  removeTimeMeeting(index: number, event) {
    event.preventDefault();
    if (this.modelSettingType === this.SettingType.SET_TIME) {
      this.me0017Model.settingTimeList.splice(index, 1);
      this.errorValidate.splice(index, 1);
    }
  }

  removeTimeOldMeeting(index: number, event) {
    event.preventDefault();
    this.isChangeForm = true;
    if (this.modelSettingType === this.SettingType.SET_TIME) {
      this.me0017Model.oldSetting.splice(index, 1);
    }
  }

  displaySettingType(settingType: number) {
    this.isChangeForm = true;
    if (settingType === this.SettingType.NONE) {
      this.me0017Model.disallowAllDay = false;
      this.me0017Model.time = false;
    } else if (settingType === this.SettingType.DISALLOW_ALL_DAY) {
      this.me0017Model.none = false;
      this.me0017Model.time = false;
    } else if (settingType === this.SettingType.SET_TIME) {
      this.me0017Model.disallowAllDay = false;
      this.me0017Model.none = false;
    }
  }

  checkSettingType() {
    // if (this.authorityEditSettingMeeting) {
      if (this.modelSettingType === this.SettingType.NONE) {
        this.checkValidate = true;
        const objSetting = new MeetingSettingDay(this.day, new Array(), this.SettingType.NONE);
        const dataOutput = this.dataOutput(objSetting);
        this.confirmPutMeetingSetting(dataOutput);
      } else if (this.modelSettingType === this.SettingType.DISALLOW_ALL_DAY) {
        this.checkValidate = true;
        const objSetting = new MeetingSettingDay(this.day, new Array(), this.SettingType.DISALLOW_ALL_DAY);
        const dataOutput = this.dataOutput(objSetting);
        this.confirmPutMeetingSetting(dataOutput);
      } else if (this.modelSettingType === this.SettingType.SET_TIME) {
        this.checkValidate = true;
        const settingTimeList: any[] = this.me0017Model.settingTimeList;
        if (settingTimeList.length > 0) {
          // check validate array time
          this.errorSettingTime = null;
          const listTime = this.me0017Model.oldSetting.concat(settingTimeList);
          this.errorValidate = new Array(this.me0017Model.settingTimeList.length);
          this.checkMatchTimeMeeting(settingTimeList, listTime);

          const objSetting = new MeetingSettingDay(this.day, listTime, this.SettingType.SET_TIME);
          const dataOutput = this.dataOutput(objSetting);
          this.confirmPutMeetingSetting(dataOutput);
        } else {
          if (this.me0017Model.oldSetting.length === 0) {
            // no change list time: setting meeting SET_TIME
            this.errorSettingTime = this.me0017Translate.SELECT_TIME;
          } else {
            // remove setting old
            const objSetting = new MeetingSettingDay(this.day, this.me0017Model.oldSetting, this.SettingType.SET_TIME);
            const dataOutput = this.dataOutput(objSetting);
            this.confirmPutMeetingSetting(dataOutput);
          }
        }
      }
    // } else {
    //   this.dialogService.showError('MSG.ERROR');
    // }
  }

  dataOutput(settingDay: MeetingSettingDay) {
    const settingDays = new Array();
    settingDays.push(settingDay);
    const data = {
      job: this.jobType,
      settingDays: settingDays
    };
    return data;
  }

  checkMatchTimeMeeting(settingTimeList: any[], listTime: any[]) {
    this.checkValidate = true;

    let start = 0;
    if (settingTimeList.length === listTime.length) {
      start = 1;
    }
    for (let i = 0; i < settingTimeList.length; i++) {
      this.errorValidate[i] = {start: '', end: '', date: ''};

      // check time required
      if (!settingTimeList[i].start || !settingTimeList[i].end) {
        if (!settingTimeList[i].start) {
          this.errorValidate[i].start = this.me0017Translate.SELECT_TIME_START;
        }
        if (!settingTimeList[i].end) {
          this.errorValidate[i].end = this.me0017Translate.SELECT_TIME_END;
        }
        this.checkValidate = false;
      } else

      // check time start is before time end
      if (this.helper.convertTimeIso(settingTimeList[i].start) < this.helper.convertTimeIso(settingTimeList[i].end)) {

        // check time select is exit
        if (i >= start) {
          const endCheckList = this.me0017Model.oldSetting.length + i;
          for (let j = 0; j < endCheckList; j++) {
            if (!(this.errorValidate[i].start || this.errorValidate[i].end || this.errorValidate[i].date)) {
              if (this.helper.convertTimeIso(listTime[j].start) < this.helper.convertTimeIso(listTime[j].end) &&
                listTime[j].start && listTime[j].end) {
                if (!((this.helper.convertTimeIso(settingTimeList[i].start) >= this.helper.convertTimeIso(listTime[j].end)) ||
                  (this.helper.convertTimeIso(settingTimeList[i].end) <= this.helper.convertTimeIso(listTime[j].start)))) {
                  this.errorValidate[i].date = this.me0017Translate.MATCH_TIME;
                  this.checkValidate = false;
                  break;
                }
              }
            }
          }
        }

      } else {
        this.errorValidate[i].date = this.me0017Translate.START_BEFORE_END;
        this.checkValidate = false;
      }
    }
  }

  confirmPutMeetingSetting(dataOutput) {
    if (this.checkValidate) {
      const html = '<p>' + this.me0017Translate.PUT_SETTING.MSG1 + '</p>'
        + '<p>' + this.me0017Translate.PUT_SETTING.MSG2 + '</p>'
        + '<p>' + this.me0017Translate.PUT_SETTING.MSG3 + '</p>'
        + '<p>' + this.me0017Translate.PUT_SETTING.MSG4 + '</p>'
        + '<p>' + this.me0017Translate.PUT_SETTING.MSG5 + '</p>';
      const object = {confirmText: this.me0017Translate.PUT_SETTING.CONFIRM, isConfirm: true, isChecked: false, disablePositive: true};

      this.dialogService.showCheckboxDialog('warning', false, null, null, html, 'MSG.YES', 'MSG.NO', object, null, null).subscribe(
        (res: DialogResult) => {
          if (res.isOk()) {
            if (res.payload.isChecked) {
              setTimeout(() => {
                this.putMeetingSetting(dataOutput);
              }, 1000);
            }
          }
        }
      );
    }
  }

  putMeetingSetting(dataOutput) {
    this.isChangeForm = false;
    if (this.checkValidate) {
      this.hide_popover_setting();
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      this.meetingService.putMeetingSetting(dataOutput).subscribe(
        (res) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.ngOnInit();
          this.dialogService.showSuccess('MSG.SAVED');
        },
        (error) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showError('MSG.ERROR');
        }
      );
    }
  }

  // checkAuthorityEditSeetingMeetingOffice() {
  //   if (this.userSession) {
  //     switch (this.userSession.funcAuthoritySet) {
  //       case FuncAuthoritySet.FPS_0:
  //         const funcAuthority = this.userSession.funcAuthority;
  //         if (funcAuthority.FP_2) {
  //           this.authorityEditSettingMeeting = true;
  //           break;
  //         }
  //         break;
  //       case FuncAuthoritySet.FPS_1:
  //         this.authorityEditSettingMeeting = true;
  //         break;
  //       default:
  //         this.authorityEditSettingMeeting = false;
  //         break;
  //     }
  //   }
  // }
}
