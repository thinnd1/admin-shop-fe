import {Component, OnInit, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {DialogAdapter, DialogParams, DialogResult} from '../../models/dialog-param';
import { ImageCropperComponent } from '../image-cropper/image-cropper.component';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-modal-cropper',
  templateUrl: './modal-cropper.component.html',
  styleUrls: ['./modal-cropper.component.scss']
})
export class ModalCropperComponent implements DialogAdapter {

  @ViewChild('imageCropper') cropper: ImageCropperComponent;

  public params: DialogParams;
  public prop: any;
  errorMsg = '';
  isCheckValidate: boolean;
  isConfirm: boolean;
  checkCallValidate: boolean;

  constructor(private translate: TranslateService) {}

  onModalInit() {
    this.prop = this.params.extraParams.initialValue;
    this.isConfirm = this.params.extraParams.initialValue.isConfirm;
    this.isCheckValidate = this.params.extraParams.initialValue.isCheckValidate;
    this.checkCallValidate = this.params.extraParams.initialValue.checkCallValidate;
    // Only call once when the group's avatar is exist
    if (!this.isCheckValidate && this.prop.imageUrl) {
      setTimeout(() => {
        this.cropper.loadImage(this.prop.imageUrl, this.prop.id, 'photo', true);
      });
    }
    if (this.isCheckValidate) {
      if (this.errorMsg === '') {
        this.checkCallValidate = false;
        this.params.subject.next(new DialogResult('ok', this.getPayload()));
        this.params.subject.complete();
        (<any>$('#theModal')).modal('hide');
      }
    }
  }

  uploadImageError(event: any) {
    this.errorMsg = '';
    if (event === false) {
      this.translate.get('MSG.MSG_UPLOAD_IMAGE_EXCEEDS_SIZE').subscribe(msg => {
        this.errorMsg = msg;
      });
    }
  }

  getPayload(): any {
    return Observable.create(observe => {
      this.cropper.getImageUrl(this.prop.id).subscribe(res => {
        if (res) {
          observe.next({value: res});
          observe.complete();
        }
      }, error => {
        observe.next({value: '', isConfirm: this.isConfirm, checkCallValidate: this.checkCallValidate});
        observe.complete();
        });
    });
  }

}
