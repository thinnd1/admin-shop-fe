import { Component } from '@angular/core';
import { DialogAdapter, DialogParams } from '../../models/dialog-param';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-modal-input',
  template: `
    <input type="text" [(ngModel)]="theInput" placeholder="">
  `
})
export class ModalInputComponent implements DialogAdapter {
  params: DialogParams;

  public theInput: string;

  constructor() { }

  onModalInit() {
    this.theInput = this.params.extraParams.initialValue;
  }

  getPayload(): any {
    return { 'input': this.theInput };
  }
}
