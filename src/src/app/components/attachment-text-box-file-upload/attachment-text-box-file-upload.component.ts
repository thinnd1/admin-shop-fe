import {
  Component, forwardRef, OnInit
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Helper} from '../../common/helper';
import {DialogService} from '../../services/dialog.service';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import * as loadImage from 'blueimp-load-image';
import {FirAttachments} from '../../models/gr/firebase/fir.attachments';
import {Observable} from 'rxjs/Observable';
import {Metadata} from '../../models/firebase/firebase.metadata';
const MAX_SIZE = 128 * 1024 * 1024;

@Component({
  selector: 'app-attachment-text-box-file-upload',
  templateUrl: './attachment-text-box-file-upload.component.html',
  styleUrls: ['./attachment-text-box-file-upload.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AttachmentTextBoxFileUploadComponent),
    multi: true
  }]
})
export class AttachmentTextBoxFileUploadComponent implements OnInit, ControlValueAccessor {
  listAttachments: any[] = [];
  options = {
    canvas: true,
    pixelRatio: window.devicePixelRatio,
    downsamplingRatio: 0.6,
    orientation: true,
    maxWidth: 500,
    maxHeight: 500
  };
  _onChange = (_: any) => {};
  constructor(private translate: TranslateService,
              private helper: Helper,
              private dialogService: DialogService) {
  }

  ngOnInit() {
  }

  removeDuplicates(objects: any[]) {
    const comparisons = this.listAttachments.map((item) => {
      return item.comparison;
    });
    const result = [];
    for (let i = 0; i < objects.length; i++) {
      objects[i]['comparison'] =  this.getComparison(objects[i]);
      if (comparisons.indexOf(objects[i]['comparison']) === -1) {
        result.push(objects[i]);
        comparisons.push(objects[i]['comparison']);
      } else {
        objects.splice(i, 1);
        i--;
      }
    }
    return result;
  }

  getComparison(file: any): string {
    return file.name + file.size + file.lastModified + file.type;
  }

  onFileSelected(event: any) {
    if (event.target.files.length) {
      const listNew = $.map(event.target.files, function (value, index) {
        return value;
      });
      this.removeDuplicates(listNew);
      this.checkValidateFiles(listNew);
      this.getOrientedList(listNew).subscribe((fileList) => {
        for (let i = 0; i < fileList.length; i++) {
          this.listAttachments.push(fileList[i]);
        }
        this._onChange(this.listAttachments);
      });
    }
    event.target.value = null;
  }

  getOrientedList(listNew) {
    return Observable.create(subscribe => {
      const listReq = listNew.map((item, i) => {
        return this.getOrientedImg(i, listNew);
      });
      Observable.forkJoin(listReq).subscribe((fileList: any[]) => {
        subscribe.next(fileList);
        subscribe.complete();
      }, err => {
        subscribe.error(err);
      });
    });
  }

  getRoundedRatio(w, h) {
    const x = w / h;
    return Number(x).toFixed();
  }

  getOrientedImg(i, list) {
    return Observable.create((subscriber) => {
      const fileObj = list[i];
      if (this.helper.getFileClass(fileObj) === 'image' && fileObj.type !== 'image/gif') {
        const loadingImage = loadImage(fileObj, (canvas) => {
          if (canvas.type === 'error') {
            subscriber.next(fileObj);
            subscriber.complete();
          } else {
            canvas.toBlob(blob => {
              const newFile: any = blob;
              newFile['name'] = fileObj.name;
              newFile['width'] = canvas.width;
              newFile['height'] = canvas.height;
              fileObj['_thumb'] = newFile;
              const ratio = loadingImage.naturalWidth / loadingImage.naturalHeight;
              const newRadio = canvas.width / canvas.height;
              const orientationChanged = (ratio > 1 && newRadio > 1) || (ratio <= 1 && newRadio <= 1);
              fileObj['width'] = orientationChanged ? loadingImage.naturalWidth : loadingImage.naturalHeight;
              fileObj['height'] = orientationChanged ? loadingImage.naturalHeight : loadingImage.naturalWidth;
              subscriber.next(fileObj);
              subscriber.complete();
            });
          }
        }, this.options);
      } else {
        subscriber.next(fileObj);
        subscriber.complete();
      }
    });
  }

  checkValidateFiles(listNew) {
    let isValid = true;
    if (this.listAttachments.length + listNew.length > 10) {
      isValid = false;
      this.dialogService.showMessage('error', false, null, 'MSG.GR.M016', null, 'MSG.OK', null)
        .subscribe(() => {
          isValid = this.checkMaxFileSize(listNew) && isValid;
        });
    }
    if (isValid) {
      isValid = this.checkMaxFileSize(listNew);
    }
    return isValid;
  }

  checkMaxFileSize(listNew) {
    let isValid = true;
    for (let i = listNew.length - 1; i >= 0; i--) {
      if (listNew[i].size > MAX_SIZE) {
        isValid = false;
        listNew.splice(i, 1);
      }
    }
    if (!isValid) {
      setTimeout(() => {
        this.dialogService.showMessage('error', false, null, 'MSG.GR.MAX_SIZE_ERROR', null, 'MSG.OK', null);
      });
    }
    return isValid;
  }

  // ControlValueAccessor

  writeValue(value: any | Array<any>): void {
    this.listAttachments = value;
  }

  registerOnChange(fn: (_: any) => {}): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
  }


}
