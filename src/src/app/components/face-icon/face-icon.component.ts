import {
  Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef,
  AfterViewInit
} from '@angular/core';
import { RegistrationService } from '../../services/registration.service';
import { DetailUser } from '../../models/re/staff-list-settings';
import { FirebaseStorage } from '../../services/firebase/firebase.storage';
import { DomSanitizer } from '@angular/platform-browser';
import { SharedValueService } from '../../services/shared-value.service';
import { GroupService } from '../../services/group.service';
import { environment } from '../../../environments/environment';
import { Product } from '../../common/profile';
import { Router } from '@angular/router';

declare const $: any;
/**
 * 更新時にEventEmitterで飛ばすデータ
 */
export interface FaceIconData {
  iconPath: string;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-face-icon',
  templateUrl: './face-icon.component.html',
  styleUrls: ['./face-icon.component.scss'],
  providers: [ ]
})


/**
 * 顔アイコン用クラス
 * <app-face-icon [officeUserId]='officeUserId' [iconSize]='iconSize' (update)='update($event)'></app-face-icon>
 */
export class FaceIconComponent implements OnInit, OnChanges, AfterViewInit {
  @Input('officeUserId') private _officeUserId: string;
  @Input('imageUrl') private imageUrl: string;
  // iconSize: 30 or 40 or 55 or 76 or 94
  @Input() force = false;

  @Input('iconSize') private _iconSize = 30;
  @Input('userInfo') userInfo: any;
  @Input() tooltipOptions = {
    isShow: false,
    isShowOfficeName: false
  };
  @Input() faceImgId: string;
  @Input() currentUser: string;
  @Output('userInfoEvent') private _userInfoEvent = new EventEmitter<FaceIconData>();
  @Output() private updateImageUrl = new EventEmitter<any>();
  public lang: string;

   _iconPath;
   _defaultPath = '/assets/img/user-no-image.png';
   _deletedAccountIconPath = '/assets/img/deleted_account.png';
   name: string;
   tooltipTitle = '';
   productType: string;

  constructor(
    private _registrationService: RegistrationService,
    private _firebaseStorage: FirebaseStorage,
    private domSanitizer: DomSanitizer,
    private sharedValueService: SharedValueService,
    private _groupService: GroupService,
    private _router: Router,
    private groupService: GroupService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this._router.events.subscribe(
      ev => {
        this._decideType();
      }
    );
  }

  ngOnInit() {
    this.lang = this.sharedValueService.lang;
    if (this.currentUser && (<any>window).currentUserImage) {
      this._iconPath = (<any>window).currentUserImage;
    } else {
      this._iconPath = this._defaultPath;
    }
    this._update();
    this._updateInfo();
    this._updateWithImageUrl();
    this._updateFaceImg();
    this._decideType();
  }

  ngAfterViewInit() {
    $('[data-toggle="tooltip"]').tooltip({animation: false});
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (propName === 'faceImgId') {
        this._updateFaceImg();
        return;
      }
      if (propName === 'officeUserId') {
        this._update();
      }
      if (propName === 'userInfo') {
        this._updateInfo();
      }
      if (propName === 'imageUrl') {
        this._updateWithImageUrl();
      }
    }
  }

  /**
   * 情報を更新する
   */
  private _update() {
    if (! this._officeUserId || this.userInfo) {
      return;
    }
    this._registrationService.getStaffListDetail(this._officeUserId).
    subscribe(
      (detailUser: DetailUser) => {
        // this._iconPath = detailUser.imageUrl ? detailUser.imageUrl : this._defaultPath;
        if (detailUser.imageUrl) {
          this._firebaseStorage.downloadURL(detailUser.imageUrl, this.force).subscribe(
            (url) => {
              setTimeout(() => {
                this._iconPath = url;
                this.updateImageUrl.emit({imageUrl: url});
              });
            }, (error) => {
              this._iconPath = this._defaultPath;
            });
        } else {
          this._iconPath = this._defaultPath;
        }
        this.name = detailUser.lastName +  ' ' + detailUser.firstName;
        setTimeout(() => {
          this._userInfoEvent.emit({
            iconPath: this._iconPath,
            firstName: detailUser.firstName,
            lastName: detailUser.lastName
          });
        });
      }
    );
  }
  private _updateInfo() {
    if (!this.userInfo) {
      return;
    }
    if (this.tooltipOptions.isShow) {
      this.tooltipTitle = this.tooltipOptions.isShowOfficeName ? (this.userInfo.fullName + '/' + this.userInfo.officeName) :
          (this.userInfo.fullName + '/' + this.userInfo.deptName);
    }
    this.name = this.userInfo.fullName ? this.userInfo.fullName : (this.userInfo.lastName +  ' ' + this.userInfo.firstName);
    if (this.userInfo.imageUrl && !this.userInfo.invalid) {
      this._firebaseStorage.downloadURL(this.userInfo.imageUrl, this.force).subscribe(
        (url) => {
          setTimeout(() => {
            this._iconPath = url;
            this.updateImageUrl.emit({imageUrl: url});
            if (!this.changeDetectorRef['destroyed']) {
              this.changeDetectorRef.detectChanges();
            }
            if (this.currentUser) {
              (<any>window).currentUserImage = this._iconPath;
            }
          });
        }, (error) => {
          this._iconPath = this._defaultPath;
        });
    } else if (this.userInfo.invalid) {
      this._iconPath = this._deletedAccountIconPath;
    } else {
      this._iconPath = this._defaultPath;
      if (this.currentUser) {
        (<any>window).currentUserImage = this._iconPath;
      }
    }
  }

  private _updateWithImageUrl() {
    if (! this.imageUrl || this.userInfo || this._officeUserId) {
      return;
    }

    this._firebaseStorage.downloadURL(this.imageUrl, this.force).subscribe(
      (url) => {
        this._iconPath = url;
        this.updateImageUrl.emit({imageUrl: url});
      }, (error) => {
        this._iconPath = this._defaultPath;
      });
  }

  private _updateFaceImg() {
    if (!this.faceImgId) {
      return;
    }
    this.groupService.getDetailUser(this.faceImgId, this.force)
      .mergeMap((detailUser: any) => {
        if (detailUser.imageUrl) {
          return this._firebaseStorage.faceImageURL(detailUser.officeId, this.faceImgId);
        }
      })
      .subscribe((url) => {
        if (url) {
          this._iconPath = url;
        } else {
          this._iconPath = this._defaultPath;
        }
      }, () => {
        this._iconPath = this._defaultPath;
      });
  }

  private _decideType() {
    this.productType = environment.app === Product.Drjoy ? 'drjoy' : 'prjoy';
  }
}
