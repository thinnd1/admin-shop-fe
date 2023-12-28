import {Component, HostListener, OnInit, SimpleChanges} from '@angular/core';
import {MeetingService} from '../../../services/meeting.service';
import {SettingTimeDay} from '../../../models/me/setting-time-day';
import {CalendarCommon} from '../../../common/calendar-common';
import {TranslateService} from '@ngx-translate/core';
import {DialogResult} from '../../../models/dialog-param';
import {SharedValueService} from '../../../services/shared-value.service';
import {FuncAuthoritySet, UserSession} from '../../../models/ba/user-session';
import {UpdateHolidaySetting} from '../../../models/me/update-holiday-setting';
import {MeetingSettingDay} from '../../../models/me/metting-setting-day';
import {Helper} from '../../../common/helper';
import {ActivatedRoute, Router} from '@angular/router';
import {MeetingCommon, SettingType} from '../../../common/meeting-common';
import {SettingDayList} from '../../../models/me/setting-day-list';
import {DialogService} from '../../../services/dialog.service';
import {LocalStorage} from '../../../services/local-storage.service';
import {StaffSettingMeeting} from '../../../models/me/staff-setting-meeting';
import {RuleMeetingSetting} from '../../../models/me/rule-meeting-seeting';

@Component({
  selector: 'app-me0016-page',
  templateUrl: './me0016-page.component.html',
  styleUrls: ['./me0016-page.component.scss']
})
export class Me0016PageComponent implements OnInit {
  public SettingType: typeof SettingType = SettingType;
  public me0016Model;
  public modelSettingType: number;
  public errorValidate: any[];
  public hospitalSetting: SettingDayList;
  public selfSetting: SettingDayList;
  public showPopoverSetting = false;
  public showLeft = false;
  public showRight = false;
  public timePicker = [];
  public me0016Translate: any;
  public userSession: UserSession;
  public checkValidate: boolean;
  public day: number;
  public allowHolidayVisitUser = false;
  public allowHolidayVisitOffice = false;
  public errorSettingTime: string;
  public tapActive: number;
  public staff: StaffSettingMeeting;
  public staffSettingMeeting = false;
  public title: string;
  public model: RuleMeetingSetting;
  public isChangeForm = false;
  public authorityEditSettingMeeting: boolean;

  constructor(private meetingService: MeetingService, private calendarCommon: CalendarCommon,
      private dialogService: DialogService, private translate: TranslateService, private meetingCommon: MeetingCommon,
      private sharedValueService: SharedValueService, private helper: Helper, private router: Router,
      private activatedRoute: ActivatedRoute, private localStorage: LocalStorage) {
    this.calendarCommon.genTimePicker(this.timePicker);
    this.userSession = this.sharedValueService.getUserSession();
    // this.checkAuthorityEditSeetingMeetingStaff();
    this.translate.get('ME0016.ME0016').subscribe(
      (res) => {
        this.me0016Translate = res;
      }
    );
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((staff) => {
      if (!$.isEmptyObject(staff) && staff['flag'] === 'true') {
        this.staffSettingMeeting = staff['userId'] !== this.userSession.userId;
        this.staff = new StaffSettingMeeting(staff['userId'], staff['officeId'], null, null, null, null, null);
      } else {
        this.staff = new StaffSettingMeeting(this.userSession.userId, this.userSession.officeId, null, null, null, null, null);
      }
      if (this.activatedRoute.snapshot.url[1].path === 'me0021') {
        this.setTapActive(4);
      } else if (this.activatedRoute.snapshot.url[1].path === 'me0018') {
        this.setTapActive(2);
      } else {
        this.setTapActive(1);
      }
      this.getInfoStaffMeetingSetting();
    });

    this.editSettingTimeMeeting(null);
    this.hide_popover_setting();
  }

  setTapActive(tap: number) {
    this.tapActive = tap;
    // if (tap === 1) {
    //   this.title = 'ME0016.MEETING_SETTING';
    // } else if (tap === 2) {
    //   this.title = 'ME0016.MEETING_SETTING';
    // } else if (tap === 4) {
    //   this.title = 'ME0021.MEETING_SETTING';
    // }
  }

  getInfoStaffMeetingSetting() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getMeetingSetting(this.staff.userId, this.staff.officeId, 1).subscribe(
      (res) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.model = res;
        this.hospitalSetting = this.meetingCommon.sortSettingDayListMeeting(res.hospitalSetting);
        this.selfSetting = this.meetingCommon.sortSettingDayListMeeting(res.selfSetting);
        this.allowHolidayVisitUser = !res.allowHolidayVisitUser;
        this.allowHolidayVisitOffice = !res.allowHolidayVisitOffice;
        this.settingOfWeek();
      },
      (error) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  settingOfWeek() {
    const  settingDayList = this.selfSetting.settingDayList;
    for (let i = 0; i < settingDayList.length; i++) {
      if (settingDayList[i].settingType === this.SettingType.NONE) {
        const settingType = this.hospitalSetting.settingDayList[i].settingType;
        if (settingType === this.SettingType.SET_TIME) {
          settingDayList[i].settingTimeList = this.hospitalSetting.settingDayList[i].settingTimeList;
        }
      }
    }
  }

  convertSettingType(settingType: number, index: number) {
    if (settingType === this.SettingType.NONE) {
      settingType = this.hospitalSetting.settingDayList[index].settingType;
    }
    return settingType;
  }

  confirmUpdateHolidaySettings() {
    if (this.allowHolidayVisitUser) {
      const html = '<p>' + this.me0016Translate.HOLIDAY_CONFIRM.MSG1 + '</p>'
        + '<p>' + this.me0016Translate.HOLIDAY_CONFIRM.MSG2 + '</p>'
        + '<p>' + this.me0016Translate.HOLIDAY_CONFIRM.MSG3 + '</p>'
        + '<p>' + this.me0016Translate.HOLIDAY_CONFIRM.MSG4 + '</p>';
      const object = {confirmText: this.me0016Translate.HOLIDAY_CONFIRM.CONFIRM, isConfirm: true, isChecked: false, disablePositive: true};

      this.dialogService.showCheckboxDialog('warning', false, null, null, html, 'MSG.YES', 'MSG.NO', object, null, 'modal-lg').
      subscribe((res: DialogResult) => {
          if (res.isOk()) {
            setTimeout(() => {
              this.updateHolidaySettings();
            }, 1000);
          } else {
            this.allowHolidayVisitUser = !this.allowHolidayVisitUser;
          }
        }
      );
    } else {
      this.dialogService.showMessage('warning', false, null, 'ME0016.ME0016.HOLIDAY_CONFIRM.MSG5', null, 'MSG.YES', 'MSG.NO')
        .subscribe((res: DialogResult) => {
          if (res.isOk()) {
            setTimeout(() => {
              this.updateHolidaySettings();
            }, 1000);
          } else {
            this.allowHolidayVisitUser = !this.allowHolidayVisitUser;
          }
        }
      );
    }
  }

  updateHolidaySettings() {
    const type = 1;
    const allowHolidayVisit = !this.allowHolidayVisitUser;
    const objUpdate = new UpdateHolidaySetting(type, this.staff.officeId, null, this.staff.userId, allowHolidayVisit);
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.putUpdateHolidaySettings(objUpdate).subscribe(
      (res) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showSuccess('MSG.SAVED');
        this.ngOnInit();
      },
      (error) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.allowHolidayVisitUser = !this.allowHolidayVisitUser;
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  isEditSettingMeeting(index: number) {
    if (this.hospitalSetting.settingDayList[index].settingType === this.SettingType.DISALLOW_ALL_DAY) {
      return false;
    } else {
      return true;
    }
  }

  settingTimeMeeting(selfSetting: any, index: number, event) {
    if (!this.showPopoverSetting) {
      if (this.isEditSettingMeeting(index)) {
        this.show_popover_setting();
        this.day = selfSetting.day;
        this.editSettingTimeMeeting(selfSetting);
        setTimeout(() => {
          const top = event.clientY + $(window).scrollTop();
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
  }

  confirmClosePopupEditSetting() {
    if (this.isChangeForm) {
      const html = '<p>' + this.me0016Translate.MSG_CLOSE_1 + '</p>'
        + '<p>' + this.me0016Translate.MSG_CLOSE_2 + '</p>';
      this.dialogService.showMessage('warning', false, null, null, html, 'MSG.OK', 'MSG.CANCEL').subscribe(
        (res: DialogResult) => {
          if (res.isOk()) {
            this.isChangeForm = false;
            this.hide_popover_setting();
          }
        }
      );
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

  editSettingTimeMeeting(selfSetting: any) {
    let oldSetting = new Array;

    if (selfSetting) {
      if (selfSetting.settingType === this.SettingType.SET_TIME) {
        oldSetting = oldSetting.concat(selfSetting.settingTimeList);
        this.modelSettingType = this.SettingType.SET_TIME;
      }
      if (selfSetting.settingType === this.SettingType.NONE) {
        this.modelSettingType = this.SettingType.NONE;
      }
      if (selfSetting.settingType === this.SettingType.DISALLOW_ALL_DAY) {
        this.modelSettingType = this.SettingType.DISALLOW_ALL_DAY;
      }
    }
    this.me0016Model = new SettingTimeDay(false, false, false, new Array(), oldSetting);
    this.errorValidate = new Array();
    this.errorSettingTime = null;
  }

  addTimeMeeting(event) {
    event.preventDefault();
    this.isChangeForm = true;
    if (this.modelSettingType === this.SettingType.SET_TIME) {
      this.me0016Model.settingTimeList.push({start: '', end: ''});
      this.errorValidate.push('');
    }
  }

  removeTimeMeeting(index: number, event) {
    event.preventDefault();
    if (this.modelSettingType === this.SettingType.SET_TIME) {
      this.me0016Model.settingTimeList.splice(index, 1);
      this.errorValidate.splice(index, 1);
    }
  }

  removeTimeOldMeeting(index: number, event) {
    event.preventDefault();
    this.isChangeForm = true;
    if (this.modelSettingType === this.SettingType.SET_TIME) {
      this.me0016Model.oldSetting.splice(index, 1);
    }
  }

  displaySettingType(settingType: number) {
    this.isChangeForm = true;
    if (settingType === this.SettingType.NONE) {
      this.me0016Model.disallowAllDay = false;
      this.me0016Model.time = false;
    } else if (settingType === this.SettingType.DISALLOW_ALL_DAY) {
      this.me0016Model.none = false;
      this.me0016Model.time = false;
    } else if (settingType === this.SettingType.SET_TIME) {
      this.me0016Model.disallowAllDay = false;
      this.me0016Model.none = false;
    }
  }

  checkSettingType() {
    // if (this.authorityEditSettingMeeting) {
      if (this.modelSettingType === this.SettingType.NONE) {
        this.checkValidate = true;
        const objSetting = new MeetingSettingDay(this.day, new Array(), this.SettingType.NONE);
        const dataOutput = this.dataOutput(objSetting);
        this.putMeetingSetting(dataOutput);
      }

      if (this.modelSettingType === this.SettingType.DISALLOW_ALL_DAY) {
        this.checkValidate = true;
        this.putMeetingDisallowAllDay(this.day, new Array(), this.SettingType.DISALLOW_ALL_DAY);
      }

      if (this.modelSettingType === this.SettingType.SET_TIME) {
        this.checkValidateModel();
      }
    // } else {
    //   this.dialogService.showError('MSG.ERROR');
    // }
  }

  putMeetingDisallowAllDay(day: number, settingTimeList: any[], settingType: number) {
    if (this.checkValidate) {
      const html = '<p>' + this.me0016Translate.DIS_ALLOW_ALL_DAY.MSG1 + '</p>'
        + '<p>' + this.me0016Translate.DIS_ALLOW_ALL_DAY.MSG2 + '</p>'
        + '<p>' + this.me0016Translate.DIS_ALLOW_ALL_DAY.MSG3 + '</p>'
        + '<p>' + this.me0016Translate.DIS_ALLOW_ALL_DAY.MSG4 + '</p>';
      const object = {confirmText: this.me0016Translate.DIS_ALLOW_ALL_DAY.CONFIRM, isConfirm: true, isChecked: false, disablePositive: true};

      this.dialogService.showCheckboxDialog('warning', false, null, null, html, 'MSG.YES', 'MSG.NO', object, null, null).subscribe(
        (res: DialogResult) => {
          if (res.isOk()) {
            if (res.payload.isChecked) {
              setTimeout(() => {
                const objSetting = new MeetingSettingDay(day, settingTimeList, settingType);
                const dataOutput = this.dataOutput(objSetting);
                this.putMeetingSetting(dataOutput);
              }, 1000);
            }
          }
        }
      );
    }
  }

  checkValidateModel() {
    this.checkValidate = true;
    const settingTimeList: any[] = this.me0016Model.settingTimeList;

    if (settingTimeList.length > 0) {
      this.errorSettingTime = null;
      const listTime = this.me0016Model.oldSetting.concat(settingTimeList);
      this.errorValidate = new Array(this.me0016Model.settingTimeList.length);
      this.checkMatchTimeMeeting(settingTimeList, listTime);

      const objSetting = new MeetingSettingDay(this.day, listTime, this.SettingType.SET_TIME);
      const dataOutput = this.dataOutput(objSetting);
      this.putMeetingSetting(dataOutput);
    } else {
      if (this.me0016Model.oldSetting.length === 0) {
        // no change list time: setting meeting SET_TIME
        this.errorSettingTime = this.me0016Translate.SELECT_TIME;
      } else {
        // remove setting old
        const objSetting = new MeetingSettingDay(this.day, this.me0016Model.oldSetting, this.SettingType.SET_TIME);
        const dataOutput = this.dataOutput(objSetting);
        this.putMeetingSetting(dataOutput);
      }
    }
  }

  checkMatchTimeOfficeSetUpMeeting(settingOffice, settingTimeListOffice, settingTimeList: any[], index: number) {
    switch (settingOffice.settingType) {
      case this.SettingType.NONE:
        break;
      case this.SettingType.DISALLOW_ALL_DAY:
        this.errorValidate[index].date = this.me0016Translate.MATCH_OFFICE;
        this.checkValidate = false;
        break;
      case this.SettingType.SET_TIME:
        let checkMatch = false;
        for (let j = 0; j < settingTimeListOffice.length; j++) {
          if ((this.helper.convertTimeIso(settingTimeList[index].start) >= this.helper.convertTimeIso(settingTimeListOffice[j].start)) &&
            (this.helper.convertTimeIso(settingTimeList[index].end) <= this.helper.convertTimeIso(settingTimeListOffice[j].end))) {
            checkMatch = true;
            break;
          }
        }
        if (!checkMatch) {
          this.errorValidate[index].date = this.me0016Translate.MATCH_OFFICE;
          this.checkValidate = false;
        }
        break;
      default:
        break;
    }
  }

  checkMatchTimeMeeting(settingTimeList: any[], listTime: any[]) {
    this.checkValidate = true;
    const settingOffice = this.hospitalSetting.settingDayList[this.day];
    const settingTimeListOffice = settingOffice.settingTimeList;

    let start = 0;
    if (settingTimeList.length === listTime.length) {
      start = 1;
    }
    for (let i = 0; i < settingTimeList.length; i++) {
      this.errorValidate[i] = {start: '', end: '', date: ''};

      // check time required
      if (!settingTimeList[i].start || !settingTimeList[i].end) {
        if (!settingTimeList[i].start) {
          this.errorValidate[i].start = this.me0016Translate.SELECT_TIME_START;
        }
        if (!settingTimeList[i].end) {
          this.errorValidate[i].end = this.me0016Translate.SELECT_TIME_END;
        }
        this.checkValidate = false;
      } else

        // check time start is before time end
        if (this.helper.convertTimeIso(settingTimeList[i].start) < this.helper.convertTimeIso(settingTimeList[i].end)) {

          // check match time office set up meeting
          this.checkMatchTimeOfficeSetUpMeeting(settingOffice, settingTimeListOffice, settingTimeList, i);

          // check time select is exit
          if (i >= start) {
            const endCheckList = this.me0016Model.oldSetting.length + i;
            for (let j = 0; j < endCheckList; j++) {
              if (!(this.errorValidate[i].start || this.errorValidate[i].end || this.errorValidate[i].date)) {
                if (this.helper.convertTimeIso(listTime[j].start) < this.helper.convertTimeIso(listTime[j].end) &&
                  listTime[j].start && listTime[j].end) {
                  if (!((this.helper.convertTimeIso(settingTimeList[i].start) >= this.helper.convertTimeIso(listTime[j].end)) ||
                    (this.helper.convertTimeIso(settingTimeList[i].end) <= this.helper.convertTimeIso(listTime[j].start)))) {
                    this.errorValidate[i].date = this.me0016Translate.MATCH_TIME;
                    this.checkValidate = false;
                    break;
                  }
                }
              }
            }
          }

        } else {
          this.errorValidate[i].date = this.me0016Translate.START_BEFORE_END;
          this.checkValidate = false;
        }
    }
  }

  dataOutput(settingDay: MeetingSettingDay) {
    const settingDays = new Array();
    settingDays.push(settingDay);
    const settingMeeting = {
      type: 1,
      settingDays: settingDays,
      userId: this.staff.userId,
      officeId: this.staff.officeId
    };
    return settingMeeting;
  }

  putMeetingSetting(objSetting) {
    this.isChangeForm = false
    if (this.checkValidate) {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      this.meetingService.putMeetingSetting(objSetting).subscribe(
        (res) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.hide_popover_setting();
          this.dialogService.showSuccess('MSG.SAVED');
          this.ngOnInit();
        },
        (error) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.hide_popover_setting();
          this.dialogService.showError('MSG.ERROR');
        }
      );
    }
  }

  gotoHelp() {
    this.router.navigateByUrl('/he/he0006');
  }

  // checkAuthorityEditSeetingMeetingStaff() {
  //   if (this.userSession) {
  //     switch (this.userSession.funcAuthoritySet) {
  //       case FuncAuthoritySet.FPS_0:
  //         const funcAuthority = this.userSession.funcAuthority;
  //         if (funcAuthority.FP_1 || funcAuthority.FP_3 || funcAuthority.FP_4 || funcAuthority.FP_5 || funcAuthority.FP_6 ||
  //           funcAuthority.FP_7) {
  //           this.authorityEditSettingMeeting = true;
  //           break;
  //         }
  //         break;
  //       case FuncAuthoritySet.FPS_1:
  //         this.authorityEditSettingMeeting = true;
  //         break;
  //       case FuncAuthoritySet.FPS_2:
  //         this.authorityEditSettingMeeting = true;
  //         break;
  //       case FuncAuthoritySet.FPS_3:
  //         this.authorityEditSettingMeeting = true;
  //         break;
  //       default:
  //         this.authorityEditSettingMeeting = false;
  //         break;
  //     }
  //   }
  // }
}
