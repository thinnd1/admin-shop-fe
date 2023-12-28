import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {DialogAdapter, DialogParams} from '../../models/dialog-param';

@Component({
  selector: 'app-modal-attached',
  templateUrl: './modal-attached.component.html',
  styleUrls: ['./modal-attached.component.scss']
})
export class ModalAttachedComponent implements DialogAdapter {
  public params: DialogParams;
  public prop: any;

  constructor() { }

  onModalInit() {
    this.prop = this.params.extraParams.initialValue;
  }

  getPayload(): any {
    return {};
  }

}
