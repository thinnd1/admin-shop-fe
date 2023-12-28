import {Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import { SharedValueService } from '../../services/shared-value.service';
import { DialogService } from '../../services/dialog.service';
import { RegistrationService } from '../../services/registration.service';
import { UserSession } from '../../models/ba/user-session';
import { DetailUser } from '../../models/re/staff-list-settings';
import { FirebaseStorage } from '../../services/firebase/firebase.storage';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Product } from '../../common/profile';
import { DialogResult } from '../../models/dialog-param';
import {UserEditSettings} from '../../models/re/user-edit-settings';
import {Observable} from 'rxjs/Observable';
import {DetailMrUser} from '../../models/re/detail-mr-user';

@Component({
  selector: 'app-face-icon-set',
  templateUrl: './face-icon-set.component.html',
  styleUrls: ['./face-icon-set.component.scss'],
  preserveWhitespaces: false
})
export class FaceIconSetComponent implements OnInit, OnChanges {
  @Input('faceIconSetOptions') faceIconSetOptions: any;
  @Output() iconImageChanged = new EventEmitter<any>();
  public userInfo: DetailUser;
  public userSession: UserSession;
  public lang: string;
  public faceIconDisplay = 'none';
  private imageUrl;
  private userEditSettings: UserEditSettings;
  private postUploadImage: any;

  constructor(
    private sharedValue: SharedValueService,
    private dialogService: DialogService,
    private registrationService: RegistrationService,
    private firebaseStorage: FirebaseStorage,
    private router: Router
  ) {
    this.userSession = this.sharedValue.getUserSession();
  }

  ngOnInit() {
    this.lang = this.sharedValue.lang;
    this.getDetailUser();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (propName === 'faceIconSetOptions') {
        this.faceIconClassOptions();
      }
    }
  }

  /**
   * 情報を更新する
   */
  getDetailUser() {
    this.registrationService.getStaffListDetail(this.userSession.userId, true).subscribe(
      (detailUser: DetailUser) => {
        this.userInfo = detailUser;
      }
    );
  }

  faceIconClassOptions() {
    const classArr = [];
    classArr.push('face-icon-set-' + this.faceIconSetOptions.iconSize);
    return classArr;
  }

  onMouseClick($event: any) {
    this.registrationService.getStaffListDetail(this.userSession.userId, true)
      .mergeMap((detailUser: DetailUser) => {
        this.userInfo = detailUser;
        return Observable
          .create((observer) => {
            if (this.userInfo.imageUrl) {
              this.firebaseStorage
                .downloadURL(this.userInfo.imageUrl).subscribe((res) => {
                  observer.next(res);
                });
            } else {
              observer.next();
            }
          })
          .mergeMap((path) => {
            return this.dialogService
              .showCropperDialog(true, null, 'MSG.SAVE', {
                id: this.userSession.userId, type: 'photo', imageUrl: path
              });
          });
      })
      .filter((res: DialogResult) => res.isOk() && res.payload)
      .mergeMap((res: DialogResult) => {
        return res.payload;
      })
      .mergeMap((value: any) => {
        if (value.value) {
          return this.firebaseStorage
            .uploader
            .re(this.userSession.officeId, this.userSession.officeUserId, this.userSession.officeUserId, value.value);
        } else {
          return Observable.create((observer) => {
            observer.next({done: true, url: ''});
          }, (error) => {
          });
        }
      })
      .filter((data: any) => data.done)
      .mergeMap((data: any) => {
        return Observable.create((observer) => {
          const imageUrl = '/img/staff/face/' + this.userSession.officeId + '/' + this.userSession.officeUserId;
          this.postUploadImage = {
            officeUserId: this.userSession.officeUserId,
            imageUrl: ''
          };
          if (environment.app === Product.Drjoy) {
            this.registrationService.getUserEditSettings().subscribe((res) => {
              if (data.url) {
                this.postUploadImage.imageUrl = imageUrl;
              } else {
                this.postUploadImage.imageUrl = '';
                this.firebaseStorage.deleteImageUrl(imageUrl);
              }
              observer.next();
            }, (error) => {
              observer.next();
            });
          } else {
            this.registrationService.getPrUserEditSettings().subscribe((res) => {
              if (data.url) {
                this.postUploadImage.imageUrl = imageUrl;
              } else {
                this.postUploadImage.imageUrl = '';
                this.firebaseStorage.deleteImageUrl(imageUrl);
                this.registrationService.postUploadImageAvatar(this.postUploadImage);
              }
              observer.next();
            }, (error) => {
            });
          }
        }).mergeMap(() => {
            return this.registrationService.postUploadImageAvatar(this.postUploadImage);
        });
      })
      .mergeMap(() => {
          return this.registrationService.postUploadImageAvatar(this.postUploadImage);
      })
      .subscribe((res) => {
        this.getDetailUser();
      });
  }

  onMouseEnter($event: any) {
    this.faceIconDisplay = 'block';
  }

  onMouseLeave($event: any) {
    this.faceIconDisplay = 'none';
  }

  showDetailPopup($event: any) {
    if (!this.userInfo) {
      return false;
    }
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    if (environment.app === Product.Drjoy) {
      this.registrationService.getStaffListDetail(this.userSession.userId).subscribe((settings: DetailUser) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showStaffDetailsDialog(1, {data: this.userInfo, officeUserId: 'dr'}).subscribe((res) => {
          if (res.buttonName === 'ok') {
            this.router.navigate(['re/user-edit']);
          }
        });
      }, error => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
      });
    } else {
      this.registrationService.getDetailMR(this.userSession.officeUserId).subscribe((settings: DetailMrUser) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showStaffDetailsDialog(1, {data: settings, officeUserId: 'pr'}).subscribe((res) => {
          if (res.buttonName === 'ok') {
            this.router.navigate(['re/re0010']);
          }
        });
      }, error => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
      });
    }

  }

}
