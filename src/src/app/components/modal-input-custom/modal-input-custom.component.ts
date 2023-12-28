import {Component, OnInit} from '@angular/core';
import {DialogAdapter, DialogParams, DialogResult} from '../../models/dialog-param';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Validator} from '../../common/validation/validator';

@Component({
  selector: 'app-modal-input-custom',
  templateUrl: './modal-input-custom.component.html',
  styleUrls: ['./modal-input-custom.component.scss']
})
export class ModalInputCustomComponent implements DialogAdapter {
  params: DialogParams;

  public prop: any;
  public fb: FormGroup;
  private result: {
    input?: string,
    error?: boolean
    isConfirm?: boolean,
    checkCallApi?: boolean
  } = {};

  private blurFlag = false;

  constructor(private formBuilder: FormBuilder) { }

  onModalInit() {
    this.prop = this.params.extraParams.initialValue;

    if (!this.fb) {
      switch (this.prop.type) {
        case 'email':
          this.fb = this.formBuilder.group({
            'input': [
              this.prop.theInput,
              Validators.compose([
                Validators.required,
                Validators.minLength(8),
                Validators.maxLength(64),
                Validators.pattern(Validator.emailRegex)
              ])
            ]
          });
          break;
      }
    }

    if (this.prop.isCallApi) {
      this.blurFlag = true;
      if (!this.isError(this.fb.get('input'))) {
        this.result['checkCallApi'] = false;
        this.params.subject.next(new DialogResult('ok', this.getPayload()));
        this.params.subject.complete();
        (<any>$('#theModal')).modal('hide');
      }
    }
  }

  getPayload(): any {
    this.result['input'] = this.fb.get('input').value;
    this.result['error'] = this.isError(this.fb.get('input'));
    this.result['isConfirm'] = this.prop.isConfirm;
    this.result['checkCallApi'] = this.prop.checkCallApi;
    return this.result;
  }

  isError(formControl: any, hasError?: string): boolean {
    if (hasError) {
      return formControl.hasError(hasError);
    } else {
      return formControl.invalid;
    }
  }

  isViewError(formControl: any, hasError?: string): boolean {
    // IE: When initializing form it is set to dirty
    // if (!(formControl.dirty || formControl.touched)) {
    //   return false;
    // }
    if (!this.blurFlag) {
      return false;
    }
    return this.isError(formControl, hasError);
  }

}
