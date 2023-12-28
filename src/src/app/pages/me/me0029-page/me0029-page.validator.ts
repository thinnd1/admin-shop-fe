;import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {CreateEventMeeting} from '../../../models/me/create-event-meeting';
import {ModelInput, SettingType} from '../../../common/meeting-common';
import {Helper} from '../../../common/helper';
import {EventNoMeeting} from '../../../models/me/event-no-meeting';
declare var moment: any;

@Injectable()
export class Me0029PageValidator {
  public SettingType: typeof SettingType = SettingType;
  public checkValidate: boolean;
  public ModelInput: typeof ModelInput = ModelInput;

  constructor(private translate: TranslateService, private helper: Helper) {
  }

  addTimeMeeting(dateStart: string, dateEnd: string, modelInput) {
    dateEnd = (modelInput === this.ModelInput.DOCUMENT) ? moment(dateStart).clone().add('5', 'minutes') : dateEnd;
    const form = {
      'dateStart': moment(dateStart).format('YYYY-MM-DD'),
      'startTime': moment(dateStart).format('HH:mm'),
      'endTime': moment(dateEnd).format('HH:mm')
    };
    return form;
  }

  checkValidateForm(formCreateMeeting: CreateEventMeeting, errorValidateForm: any, modelInput, validate_error, checkNameProduct) {
    this.checkValidate = true;

    if (formCreateMeeting.date.length === 0) {
      errorValidateForm.date = validate_error.DATE;
      this.checkValidate = false;
    } else {
      this.checkMatchTimeMeeting(formCreateMeeting.date, errorValidateForm.listDate, validate_error);
      errorValidateForm.date = '';
    }

    if (!formCreateMeeting.purposeId && (modelInput !== this.ModelInput.CHANG_TIME)) {
      errorValidateForm.purposeId = validate_error.PURPOSE;
      this.checkValidate = false;
    } else {
      errorValidateForm.purposeId = '';
    }

    if (checkNameProduct && formCreateMeeting.productName.length > 100) {
      errorValidateForm.productName = validate_error.PRODUCT_NAME;
      this.checkValidate = false;
    } else {
      errorValidateForm.productName = '';
    }

    if (parseInt(formCreateMeeting.numberVisitors, 10) === 0) {
      errorValidateForm.numberVisitors = validate_error.VISIT;
      this.checkValidate = false;
    } else {
      errorValidateForm.numberVisitors = '';
    }

    if (formCreateMeeting.place.length > 20) {
      errorValidateForm.place = validate_error.PLACE;
      this.checkValidate = false;
    } else {
      errorValidateForm.place = '';
    }

    if (formCreateMeeting.note.length > 300 && (modelInput !== this.ModelInput.PASS)) {
      errorValidateForm.note = validate_error.NOTE;
      this.checkValidate = false;
    } else {
      errorValidateForm.note = '';
    }
    return this.checkValidate;
  }

  getListTimeNoMeeting(start: string, end: string, settingDayList, modelInput: any, checkMeetingInThePass) {
    let listEvent = new Array();
    const timeZone = parseInt(moment(start).format('Z'), 10);
    const startDateJapan = moment(start).add(9 - timeZone, 'hours').format();
    const endDateJapan = moment(end).add(9 - timeZone, 'hours').format();

    listEvent = listEvent.concat(this.getListEvent(startDateJapan, timeZone, settingDayList, modelInput, checkMeetingInThePass));
    if (moment(startDateJapan).format('YYYYMMDD') !== moment(endDateJapan).format('YYYYMMDD')) {
      listEvent = listEvent.concat(this.getListEvent(endDateJapan, timeZone, settingDayList, modelInput, checkMeetingInThePass));
    }
    return listEvent;
  }

  getListEvent(date: string, timeZone: number, settingDayList, modelInput: any, checkMeetingInThePass: boolean) {
    const listEvent = new Array();

    date = moment(date).format('YYYY-MM-DD');
    const day = moment(date).isoWeekday() % 7;
    let now = moment(new Date()).format('YYYY-MM-DDTHH:mm');

    // check modelInput is send document
    if (modelInput === ModelInput.DOCUMENT && checkMeetingInThePass) {
      now = moment(now).add(1, 'hours').format('YYYY-MM-DDTHH:mm');
    }

    const settingMeetingDay = settingDayList[day];
    switch (settingMeetingDay.settingType) {
      case this.SettingType.DISALLOW_ALL_DAY:
        const dateStart = moment(date).add(timeZone - 9, 'hours').format();
        const dateEnd = moment(date).add(24 + timeZone - 9, 'hours').format();
        const event = this.checkTimeNoMeetingInPass(checkMeetingInThePass, now, dateStart, dateEnd);
        if (event) {
          listEvent.push(event);
        }
        break;
      case this.SettingType.SET_TIME:
        const settingTimeList = settingMeetingDay.settingTimeList;
        for (let i = 0; i <= settingTimeList.length; i++) {
          let start: string;
          let end: string;
          if (i === 0) {
            start = start = moment(date).add(timeZone - 9, 'hours').format();
            end = moment(date + 'T' + settingTimeList[i].start).add(timeZone - 9, 'hours').format();
          } else {
            if (i === (settingTimeList.length)) {
              start = moment(date + 'T' + settingTimeList[i - 1].end).add(timeZone - 9, 'hours').format();
              end = moment(date).add(24 + timeZone - 9, 'hours').format();
            } else {
              start = moment(date + 'T' + settingTimeList[i - 1].end).add(timeZone - 9, 'hours').format();
              end = moment(date + 'T' + settingTimeList[i].start).add(timeZone - 9, 'hours').format();
            }
          }
          if (end && start && (end !== start)) {
            const eventNoMeeting = this.checkTimeNoMeetingInPass(checkMeetingInThePass, now, start, end);
            if (eventNoMeeting) {
              listEvent.push(eventNoMeeting);
            }
          }
        }
        break;
      default:
        break;
    };

    return listEvent;
  }

  checkTimeNoMeetingInPass(checkMeetingInThePass: boolean, now: string, startNoMeeting: string, endNoMeeting: string) {
    let event;
    if (checkMeetingInThePass) {
      if (moment(startNoMeeting).isSameOrAfter(now)) {
        event = new EventNoMeeting(startNoMeeting, endNoMeeting);
      } else {
        if (moment(startNoMeeting).isSameOrBefore(now) && moment(now).isBefore(endNoMeeting)) {
          event = new EventNoMeeting(now, endNoMeeting);
        }
      }
    } else {
      event = new EventNoMeeting(startNoMeeting, endNoMeeting);
    }

    return event;
  }

  isTimeMeeting(dateStart: string, dateEnd: string, listEventNoMeeting: any[]) {
    let checkMatch = true;
    for (let j = 0; j < listEventNoMeeting.length; j++) {
      if ((moment(dateStart).valueOf() >= moment(listEventNoMeeting[j].end).valueOf()) ||
        (moment(dateEnd).valueOf() <= moment(listEventNoMeeting[j].start).valueOf())) {
        checkMatch = true;
      } else {
        checkMatch = false;
        break;
      }
    }

    return checkMatch;
  }

  checkMatchTimeUserSetting(settingDayList: any[], listDate: any[], validate_error: any,
                            listEventMeetingFixed: any[], listEventHoliday: any[], settingHolidayMeeting: boolean, modelInput: any) {
    let error = '';
    for (let i = 0; i < listDate.length; i++) {
      if (!error) {
        let checkTimeNoMeeting = true;
        let checkPass = false;
        let now;

        let start = moment(listDate[i].dateStart + 'T' + listDate[i].startTime).format();
        const end = moment(listDate[i].dateStart + 'T' + listDate[i].endTime).format();
        now = moment(new Date()).format('YYYY-MM-DDTHH:mm');

        if (modelInput === ModelInput.PASS) {
          if (moment(now).isSameOrAfter(end)) {
            checkTimeNoMeeting = false;
          } else {
            if (moment(start).isBefore(now)) {
              start = now;
              checkPass = true;
            }
          }
        }

        if (modelInput === ModelInput.DOCUMENT) {
          now = moment(new Date()).add(1, 'hours').format('YYYY-MM-DDTHH:mm');
          if (moment(start).isBefore(now)) {
            error = validate_error.DOCUMENT_IN_PASS;
            break;
          } else {
            checkPass = true;
          }
        }

        const yearStart = moment(start).format('YYYY');
        const yearEnd  = moment(end).format('YYYY');

        // Check selected time coincides with the time no meeting
        if (checkTimeNoMeeting) {
          const listEventNoMeeting = this.getListTimeNoMeeting(start, end, settingDayList, modelInput, checkPass);
          if (this.isTimeMeeting(start, end, listEventNoMeeting)) {
            error = '';
          } else {
            error = validate_error.TIME_NO_MEETING;
            break;
          }
        }

        // check selected time coincides with the time meeting fixed, holiday
        if (!error) {
          if (settingHolidayMeeting) {
            error = this.checkMatchTimeMeetingFixedOrHoliday(validate_error.TIME_NO_MEETING, listEventHoliday, yearStart, start, end, true);
            if (!error && yearEnd !== yearStart) {
              error = this.checkMatchTimeMeetingFixedOrHoliday(validate_error.TIME_NO_MEETING, listEventHoliday, yearEnd, start, end, true);
            }
          }

          if (!error) {
            // if time select Same Or Before now => pass
            if (!moment(end).isSameOrBefore(now)) {
              // check meeting fix anf frame meeting
              error = this.checkMatchTimeMeetingFixedOrHoliday(validate_error.TIME_MEETING_FIX, listEventMeetingFixed,
                listDate[i].dateStart, start, end, false);
            }
          }
        }
      }
    }
    return error;
  }

  checkMatchTimeMeeting(listDate: any[], errorListDate: any[], validate_error: any) {
    for (let i = 0; i < listDate.length; i++) {
      const dateStart = moment(listDate[i].dateStart + 'T' + listDate[i].startTime).format();
      const dateEnd = moment(listDate[i].dateStart + 'T' + listDate[i].endTime).format();
      if (i !== 0) {
        for (let j = 0; j < i; j++) {
          const start = moment(listDate[j].dateStart + 'T' + listDate[j].startTime).format();
          const end = moment(listDate[j].dateStart + 'T' + listDate[j].endTime).format();

          if ((moment(dateStart).valueOf() === moment(start).valueOf()) &&
            (moment(dateEnd).valueOf() === moment(end).valueOf())) {
            errorListDate[i] = validate_error.DATE_MATCH;
            this.checkValidate = false;
            break;
          } else {
            errorListDate[i] = '';
          }
        }
      }
    }
  }

  checkMatchTimeMeetingFixedOrHoliday(validate_error: any, listEvent: any[], date, dateStart, dateEnd, checkHoliday: boolean) {
    let error = '';
    const now = moment(new Date()).format('YYYY-MM-DDTHH:mm');
    for (let j = 0; j < listEvent.length; j++) {
      // find day
      if (listEvent[j].date === date) {
        const events = listEvent[j].listEvent;
        // check list meetingFixed of day
        for (let k = 0; k < events.length; k++) {

          // check meeting DONE
          if (moment(events[k].end).isAfter(now) || checkHoliday) {
            if ((moment(dateStart).valueOf() >= moment(events[k].end).valueOf()) ||
              (moment(dateEnd).valueOf() <= moment(events[k].start).valueOf())) {
              error = '';
            } else {
              error = validate_error;
              this.checkValidate = false;
              return error;
            }
          }
        }
      }
    }

    return error;
  }

  dataOutPut(formCreateMeeting: CreateEventMeeting, modelInput, originalRequest: any) {
    // convert list time
    const listDate = new Array();
    const listTime =  formCreateMeeting.date;
    for (let i = 0; i < listTime.length; i++) {
      const end = moment(listTime[i].dateStart + 'T' + listTime[i].endTime).format('YYYY-MM-DDT' + 'HH:mm:ss' + 'ZZ');
      const start = moment(listTime[i].dateStart + 'T' + listTime[i].startTime).format('YYYY-MM-DDT' + 'HH:mm:ss' + 'ZZ');
      const date = {
        startTime: start,
        endTime: end
      };
      listDate.push(date);
    }

    const data = {
      content: {
        comment: (modelInput !== this.ModelInput.PASS) ? formCreateMeeting.note : '',
        drugsId: (modelInput === this.ModelInput.CHANG_TIME) ? this.getListDrugId(originalRequest.drugList) :
          this.getListDrugId(formCreateMeeting.drugList),
        numVisitors: formCreateMeeting.numberVisitors,
        place: (modelInput === this.ModelInput.CHANG_TIME) ? originalRequest.place : formCreateMeeting.place,
        productName: (modelInput === this.ModelInput.CHANG_TIME) ? originalRequest.productName : formCreateMeeting.productName,
        purposeId: (modelInput === this.ModelInput.CHANG_TIME) ? originalRequest.purposeId : formCreateMeeting.purposeId,
        purposeName: (modelInput === this.ModelInput.CHANG_TIME) ? originalRequest.purposeName : formCreateMeeting.purposeName,
        times: listDate,
      },
      mediator: formCreateMeeting.userIdMediator,
      mediatorOfficeId: formCreateMeeting.officeIdMediator,
      dr: {
        officeId: formCreateMeeting.officeIdReceive,
        userId: formCreateMeeting.userIdReceive,
      },
      requestId: (modelInput === this.ModelInput.CHANG_TIME) ? originalRequest.requestId : '',
      mr: {
        officeId: formCreateMeeting.officeIdSent,
        userId: formCreateMeeting.userIdSent,
      },
      requestFromMr: (modelInput !== this.ModelInput.PASS) ? false : (formCreateMeeting.request === 'MR'),
      inputMode: (modelInput === this.ModelInput.DOCUMENT) ? 0 : 1,
    };
    return data;
  }

  getListDrugId(listDrug) {
    const listDrugId = new Array();
    for (let i = 0; i < listDrug.length; i++) {
      listDrugId.push(listDrug[i].id);
    }
    return listDrugId;
  }
}
