/**
 * Created by thaobtb on 9/6/2017.
 */
import {Component} from '@angular/core';
import {DialogAdapter, DialogParams} from '../../models/dialog-param';
import {SharedValueService} from '../../services/shared-value.service';

@Component({
  selector: 'app-modal-input',
  template: `
    <div class="custom-control-checkbox">
      <label class="custom-control custom-checkbox">
        <input type="checkbox" id="checkbox" [(ngModel)]="isChecked" (change)="changeDisablePos()" class="custom-control-input">
        <span class="custom-control-indicator"></span>
        <span class="custom-control-description">{{confirmText}}</span>
      </label>
    </div>
  `
})
export class ModalCheckboxComponent implements DialogAdapter {
  params: DialogParams;
  disablePositive = true;

  public isChecked: boolean;
  public confirmText: string;
  public isConfirm: boolean;

  constructor(private shared: SharedValueService ) {}

  /**
   * isConfirm: is need disable Positive Button
   * isChecked: status default
   */
  onModalInit() {
    this.isChecked = false;
    this.confirmText = this.params.extraParams.initialValue.confirmText;
    this.isConfirm = this.params.extraParams.initialValue.isConfirm;
    this.disablePositive = this.params.extraParams.initialValue.disablePositive;
  }

  changeDisablePos() {
    this.shared.setCheckedPopup(this.isChecked);
  }
  getPayload(): any {
    return {'isChecked': this.isChecked, 'isConfirm': this.isConfirm, 'disablePositive': this.disablePositive};
  }
}
