import {Injectable} from '@angular/core';
import {CreateEventMeeting} from '../../../models/me/create-event-meeting';

declare var moment: any;

@Injectable()
export class Me0033PageValidator {
  public checkValidate: boolean;
  private errorValidateForm;

  constructor() {
  }


  checkValidateForm(formCreateMeeting: CreateEventMeeting, validate_error) {
    this.checkValidate = true;
    this.errorValidateForm = {};
    this.validateField(!formCreateMeeting.purposeId, 'purposeId', validate_error.PURPOSE_REQUIRED);
    this.validateField(parseInt(formCreateMeeting.numberVisitors, 10) <= 0, 'numberVisitors', validate_error.PARTICIPATOR_NUMBER_REQUIRED);
    this.validateField(formCreateMeeting.note && formCreateMeeting.note.length > 300, 'comment', validate_error.COMMENT_LENGTH);
    this.validateField(formCreateMeeting.productName && formCreateMeeting.productName.length > 100, 'productName', validate_error.PRODUCT_LENGTH);
    this.validateField(!formCreateMeeting.note.trim(), 'comment', validate_error.COMMENT_REQUIRED);
    return this.errorValidateForm;
  }

  validateField(condition, field, msg) {
    if (condition) {
      this.errorValidateForm[field] = msg;
      this.checkValidate = false;
    } else {
      if (this.errorValidateForm.hasOwnProperty(field)) {
        this.errorValidateForm[field] = this.errorValidateForm[field];
      }
    }
  }

  dataOutPut(formCreateMeeting: CreateEventMeeting, originalRequest: any) {
    return {
      userId: originalRequest.frameInfo.doctor.userId,
      officeId: originalRequest.frameInfo.doctor.officeId,
      frameId: originalRequest.frameId,
      purposeId: formCreateMeeting.purposeId,
      comment: formCreateMeeting.note,
      drugs: formCreateMeeting.drugList,
      productName: formCreateMeeting.productName,
      numVisitors: formCreateMeeting.numberVisitors
    };
  }

}
