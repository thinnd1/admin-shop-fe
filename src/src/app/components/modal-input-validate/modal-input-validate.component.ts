import {Component} from '@angular/core';
import {DialogAdapter, DialogParams, DialogResult} from '../../models/dialog-param';
import {TranslateService} from '@ngx-translate/core';
import {MeetingService} from '../../services/meeting.service';
import {VisitCardPayments} from '../../models/me/visit-card-payments';

@Component({
  selector: 'app-modal-input-validate',
  templateUrl: './modal-input-validate.component.html',
  styleUrls: ['./modal-input-validate.component.scss']
})
export class ModalInputValidateComponent implements DialogAdapter {

  params: DialogParams;

  public prop: any;
  isConfirm: boolean;
  isCheckValidate: boolean;
  checkCallValidate: boolean;
  messageErr: boolean;
  errors: string;
  msgStore: any;

  constructor(private translate: TranslateService,
              private meetingService: MeetingService) {
  }

  onModalInit() {
    this.translate.get('MSG.ME5002').subscribe(
      (res) => {
        this.msgStore = res;
      }
    );
    this.prop = this.params.extraParams.initialValue;
    this.isConfirm = this.prop.isConfirm;
    this.isCheckValidate = this.prop.isCheckValidate;
    this.checkCallValidate = this.prop.checkCallValidate;
    if (this.isCheckValidate) {
      if (this.checkValidate()) {
        this.messageErr = false;
        this.params.subject.next(new DialogResult('ok', this.getPayload()));
        this.params.subject.complete();
      } else {
        this.messageErr = true;
        if (this.prop.theInput.length > this.prop.maxlength) {
          this.errors = this.msgStore.VALIDATE.MAX_LENGTH;
        } else if (this.prop.theInput.length < this.prop.minlength || this.prop.theInput.trim().length === 0) {
          this.errors = this.msgStore.VALIDATE.MIN_LENGTH;
        }
      }
    }
  }

  getPayload(): any {
    return {input: this.prop.theInput, isConfirm: this.isConfirm, checkCallValidate: this.checkCallValidate};
  }

  checkValidate() {
    if (this.prop.theInput.length >= this.prop.minlength && this.prop.theInput.length <= this.prop.maxlength &&
      this.prop.theInput.trim().length !== 0) {
      return true;
    } else {
      return false;
    }
  }
}
