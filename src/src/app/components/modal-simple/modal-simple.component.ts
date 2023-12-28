import {Component} from '@angular/core';
import {DialogAdapter, DialogParams} from '../../models/dialog-param';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'app-modal-simple',
  template: `
    <p class="mb-0">{{params.message}}</p>
  `,
  styles: ['p { white-space: pre-line; }']
})
export class ModalSimpleComponent implements DialogAdapter {
  params: DialogParams;

  constructor() {}

  onModalInit() {
  }

  getPayload(): any {
    return {'from': 'ModalSimpleComponent'};
  }
}
