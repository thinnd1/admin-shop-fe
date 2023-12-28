import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {DialogAdapter, DialogParams} from '../../models/dialog-param';

@Component({
  selector: 'app-modal-file-preview',
  templateUrl: './modal-file-preview.component.html',
  styleUrls: ['./modal-file-preview.component.scss']
})
export class ModalFilePreviewComponent implements DialogAdapter {
  public params: DialogParams;
  public prop: any;
  public data: any;

  constructor() { }

  onModalInit() {
    this.prop = this.params.extraParams.initialValue;
  }

  getSelectItem($event) {
    this.data = $event.value;
  }

  getPayload(): any {
    return {value: this.data};
  }

}
