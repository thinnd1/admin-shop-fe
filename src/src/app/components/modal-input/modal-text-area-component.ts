import {Component} from '@angular/core';
import {DialogAdapter, DialogParams} from '../../models/dialog-param';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'app-modal-text-area',
  template: `
    <textarea [(ngModel)]="theInput" class="input-text-area" ></textarea>
  `,
  styles: ['.input-text-area{width:100%; height:103px;resize:none;margin-top: 15px}']
})
export class ModalTextAreaComponent implements DialogAdapter {
  params: DialogParams;

  public theInput: string;

  constructor() {
  }

  onModalInit() {
    this.theInput = this.params.extraParams.initialValue;
  }

  getPayload(): any {
    return {'input': this.theInput};
  }
}
