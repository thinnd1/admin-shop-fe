import { Component } from '@angular/core';
import { DialogAdapter, DialogParams } from '../../models/dialog-param';

@Component({
  selector: 'app-modal-member-list',
  templateUrl: './modal-member-list.component.html',
  styleUrls: ['./modal-member-list.component.scss']
})
export class ModalMemberListComponent implements DialogAdapter {
  params: DialogParams;

  public prop: any;
  public $event: any;

  constructor() { }

  onModalInit() {
    this.prop = this.params.extraParams.initialValue;
  }

  getPayload(): any {
    return { '$event': this.$event };
  }

}
