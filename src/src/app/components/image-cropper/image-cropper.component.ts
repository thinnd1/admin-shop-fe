import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {FileUploader} from 'ng2-file-upload';
import {SharedValueService} from '../../services/shared-value.service';
import {Subject} from 'rxjs/Subject';
import {FirebaseStorage} from '../../services/firebase/firebase.storage';
import {Helper} from '../../common/helper';
import { UserSession } from '../../models/ba/user-session';

declare const $: any;
const MAX_SIZE = 10 * 1024 * 1024;

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss']
})
export class ImageCropperComponent implements OnInit {
  @Input('imageCropperOptions') imageCropperOptions: any = {
    id: null,
    type: 'card'
  };
  @Output() flagImgUpload = new EventEmitter<any>();
  @Output() flagImgDestroy = new EventEmitter<any>();
  public uploader: FileUploader = new FileUploader({url: 'apiURL'});
  public imagePath: string;
  public lang: string;
  public dammyImagePath: { [key: string]: string; } = {};
  public btnsDisabledFlag: boolean;
  public imageType: boolean;
  public originName: string;

  public windowURL: any = (<any>window).URL || (<any>window).webkitURL;
  public imgData: string;
  public userSession: UserSession;

  public mouseFlag = true;
  public noImage = [
    '/assets/img/user-no-image.png',
    '/assets/img/group-icon-no-image-' + this.lang + '.png'
  ];

  private getCroppedCanvasOption: any = {};

  constructor(private sharedValueService: SharedValueService,
              private helper: Helper,
              private firebaseStorage: FirebaseStorage) {
  }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    this.lang = this.sharedValueService.lang;
    this.imageType = (this.imageCropperOptions.type === 'card');
    this.dammyImagePath['default'] = '/assets/img/image-cropper-' + this.imageCropperOptions.type + '-' + this.lang + '.png';
    this.dammyImagePath['over'] = '/assets/img/image-cropper-' + this.imageCropperOptions.type + '-over-' + this.lang + '.png';

    // Personal Image
    if (this.userSession && this.userSession.personalFlag) {
      this.dammyImagePath['default'] = '/assets/img/image-cropper-' + this.imageCropperOptions.type + '-personal-' + this.lang + '.png';
      this.dammyImagePath['over'] = '/assets/img/image-cropper-' + this.imageCropperOptions.type + '-over-personal-' + this.lang + '.png';
    }
    this.imagePath = this.dammyImagePath.default;
    //$('#' +  this.imageCropperOptions.id + ' img').cropper(this.setOption(this.imageType));
    this.btnsDisabledFlag = true;

    this.getCroppedCanvasOption.fillColor = '#fff';
    switch (this.imageCropperOptions.type) {
      case 'card':
        break;
      case 'photo':
      case 'group':
        this.getCroppedCanvasOption.width = 240;
        this.getCroppedCanvasOption.height = 240;
        break;
    }

  }

  setOption(imageType) {
    const configImage: any = {
      center: true,
      highlight: true,
      dragMode: 'move',
      zoomOnWheel: false,
      autoCropArea: 1,
      crop: this.helper.debounce(this.cropend, 400)
    };

    if (imageType) {
      configImage.autoCrop = true;
      configImage.cropBoxResizable = true;
    } else {
      configImage.cropBoxResizable = false;
      configImage.aspectRatio = 1;
      configImage.minCropBoxHeight = 240;
      configImage.minCropBoxWidth = 240;
    }
    return configImage;
  }

  @Input('imageUrl')
  set value(imageUrl: string) {
    if (imageUrl && imageUrl !== '') {
      this.firebaseStorage.downloadURL(imageUrl, true).subscribe(
        (url) => {
          if($('.image-cropper-picture').attr('src')){
            this.loadImage(url, this.imageCropperOptions.id, this.imageCropperOptions.type, true);
          }
        });
    }
  }

  @Input('addUrl')
  set val(imageUrl: string) {
    if (imageUrl) {
      if (imageUrl.indexOf('blob:http') >= 0) {
        this.loadImage(imageUrl, this.imageCropperOptions.id, this.imageCropperOptions.type, true);
      } else {
        this.firebaseStorage.downloadURL(imageUrl).subscribe(
          (url) => {
            this.loadImage(url, this.imageCropperOptions.id, this.imageCropperOptions.type, true);
          });
      }
    }
  }

  loadImage(imageUrl, id?, type?, flag?) {
    if (imageUrl && id && !this.noImage.some(elm => elm === imageUrl)) {
      const $image = $('#' + id).find('.image-cropper-picture');
      if (flag){
        $image.cropper('destroy');
        $image.attr('src', imageUrl);
        $image.cropper(this.setOption(type === 'card'));
      }else{
        $image.cropper('replace', imageUrl);
        $image.cropper(this.setOption(type === 'card'));
      }
      this.btnsDisabledFlag = null;
      //$image.cropper('replace', imageUrl);
      // const img = document.createElement('img');
      // img.onload = () => {
      //   this.btnsDisabledFlag = null;
      // };
      // img.src = imageUrl;
    }
  }

  cropend(e) {
    // emit event
    const id = $(e.target).parents('.image-cropper-inner-wrap');
    let event;
    event = document.createEvent('CustomEvent');
    event.initCustomEvent('imageChange', true, true, id);
    window.dispatchEvent(event);
  }

  getCropper(event: any) {
    const $cropper = $(event.target).parents('.image-cropper-inner-wrap');
    const $image = $cropper.find('.image-cropper-picture');
    const $file = $cropper.find('.image-cropper-upload');
    return {cropper: $cropper, image: $image, file: $file};
  }

  // on choose new image
  setCropper(obj: any) {
    obj.image.cropper(this.setOption(this.imageType));
  }

  onMouseClick(event: any) {
    const obj = this.getCropper(event);
    this.mouseFlag = false;
    obj.file.click();
  }

  onMouseOver() {
    if (this.btnsDisabledFlag && this.mouseFlag) {
      this.imagePath = this.dammyImagePath.over;
    }
  }

  onMouseOut() {
    if (this.btnsDisabledFlag && this.mouseFlag) {
      this.imagePath = this.dammyImagePath.default;
    }
  }

  imageUpload(event: any) {
    const obj = this.getCropper(event);
    const files = obj.file[0].files[0];
    this.originName = files.name;
    if (files.size > MAX_SIZE) {
      this.flagImgUpload.emit(false);
      //this.imageCropperAction(event, 'destroy', null);
      return;
    } else {
      this.flagImgUpload.emit(true);
    }
    const reader: FileReader = new FileReader();
    const URL = (<any>window).URL || (<any>window).webkitURL;
    if (!(files.type && files.type.match(/^image\/(png|jpeg|gif)$/))) {
      return false;
    }
    if (URL) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(files);
      img.onload = () => {
        this.setCropper(obj);
        obj.image.cropper('replace', URL.createObjectURL(files));
        this.btnsDisabledFlag = null;
      };
      img.onerror = () => {
        return;
      }

    } else if (reader) {
      reader.readAsDataURL(files);
      reader.onload = () => {
        this.setCropper(obj);
        obj.image.cropper('replace', reader.result);
        this.btnsDisabledFlag = null;
      };
    }
  }

  imageCropperAction(event: any, method: string, option: string) {
    const obj = this.getCropper(event);
    obj.image.cropper(method, option);
    if (method === 'destroy') {
      obj.file.val('');
      obj.image.attr('src', this.dammyImagePath.default);
      // this.setCropper(obj);
      this.cropend(event);
      this.btnsDisabledFlag = true;
    }
  }

  imageZoomIn(event: any) {
    console.log('imageZoomIn');
    this.imageCropperAction(event, 'zoom', '0.1');
  }

  imageZoomOut(event: any) {
    console.log('imageZoomOut');
    this.imageCropperAction(event, 'zoom', '-0.1');
  }

  imageRotateLeft(event: any) {
    console.log('imageRotateLeft');
    this.imageCropperAction(event, 'rotate', '-15');
  }

  imageRotateRight(event: any) {
    console.log('imageRotateRight');
    this.imageCropperAction(event, 'rotate', '15');
  }


  imageDelete(event: any) {
    this.mouseFlag = true;
    this.flagImgUpload.emit(true);
    this.flagImgDestroy.emit(true);
    this.imageCropperAction(event, 'destroy', null);
  }

  getImageUrl(id: string): any {
    let imageObj;
    imageObj = $('#' + id).find('.image-cropper-picture');
    // const imageFile = $('#' + id).find('.image-cropper-upload');
    if (!id) {
      imageObj = $('.image-cropper-inner-wrap').find('.image-cropper-picture');
    }
    const src = imageObj.attr('src');
    const subject = new Subject();
    if (imageObj.length <= 0 || this.btnsDisabledFlag != null || !imageObj.data('cropper')) {
      subject.next();
      subject.error('no image');
    } else {
      imageObj.cropper('getCroppedCanvas', this.getCroppedCanvasOption)
        .toBlob((blob) => {
        if (this.imgData) {
          this.windowURL.revokeObjectURL(this.imgData);
        }
        blob.src = src;
        if (id) {
          blob.name = this.originName;
        }
        this.imgData = this.windowURL.createObjectURL(blob);
        blob.imgData = this.imgData;
        subject.next(blob);
        subject.complete();
      }, 'image/jpeg');
    }
    return subject;
  }

}
