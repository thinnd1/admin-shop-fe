import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from '../../../services/dialog.service';
import { FirebaseStorage } from '../../../services/firebase/firebase.storage';
import { RegistrationService } from '../../../services/registration.service';
import { SharedValueService } from '../../../services/shared-value.service';
import { TranslateService } from '@ngx-translate/core';
const MAX_SIZE = 10 * 1024 * 1024;
@Component({
  selector: 'app-re0032-page',
  templateUrl: './re0032-page.component.html',
  styleUrls: ['./re0032-page.component.scss']
})
export class Re0032PageComponent implements OnInit {
  public officeUserId: string;
  public fileName: any;
  public imageUrl: any;
  public file: any;
  public errorImage: string;
  public userSession: any;
  public registOfficeUserId: any;
  public userId: string;
  public officeId: string;
  constructor(private dialogService: DialogService,
              private registrationService: RegistrationService,
              private router: Router,
              private translate: TranslateService,
              private sharedValueService: SharedValueService,
              private firebaseStorage: FirebaseStorage) {

  }


  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    this.registOfficeUserId = this.userSession.officeUserId;
    this.officeUserId = this.userSession.officeUserId;
    this.userId = this.userSession.userId;
    this.officeId = this.userSession.officeId;
  }

  uploadImage(event: any) {
    $('.content-02').show();
    $('.content-01').hide();
    this.errorImage = '';
    const URL = (<any>window).URL || (<any>window).webkitURL;
    let file = event.target.files[0];

    if (!(file.type && file.type.match(/^image\/(png|jpeg|gif)$/))) {
      return false;
    }

    if (file.size > MAX_SIZE) {
      this.dialogService.showError('IMAGE_CROPPER.IMAGE_MAX_LENGTH');
    }else{
      this.file = file;
      this.fileName = file.name;
      this.imageUrl = URL.createObjectURL(file);
      $('.card-img img').attr('src', this.imageUrl);
    }
  }

  sendToServer() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    let check = 2;

    this.registrationService.updateIdentifyStatus().subscribe(next => {
      check = check - 1;
      if(check === 0){
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showSuccess('MSG.SAVED').subscribe((res)=>{
          if(res.isOk()){
            this.router.navigate(['']);
          }
        });
      }
    }, (error) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });

    const setting = {
      'officeUserId': this.officeUserId,
      'fileName':  this.fileName,
      'identificationImageUrl':  '/img/staff/identifier/pr/' + this.officeId + '/' + this.officeUserId,
    };

    this.registrationService.postUploadImage(setting).subscribe(next => {
      check = check - 1;
      if(check === 0){
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showSuccess('MSG.SAVED').subscribe((res)=>{
          if(res.isOk()){
            this.router.navigate(['']);
          }
        });
      }
    }, (error) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  uploadToFirebase() {
    if(this.file){
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      this.firebaseStorage.uploader.re_identification(this.officeId, this.officeUserId, this.registOfficeUserId, this.file).subscribe(
          (data) => {
            if (data.done) {
              this.sendToServer();
            }
          }, (error) => {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(false);
            });
            this.dialogService.showError('MSG.ERROR');
          })

    }else{
      this.translate.get(['RE0010', 'VAL']).subscribe(res => {
        this.errorImage = res.RE0010.RE0010_ERROR.IDENTIFICATION_IMAGE_URL;
        return false;
      });
    }
  }

}
