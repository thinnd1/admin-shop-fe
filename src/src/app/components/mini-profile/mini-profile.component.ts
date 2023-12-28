import { Component, EventEmitter, OnInit, Input, Output, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';
import { RegistrationService } from '../../services/registration.service';
import { DetailUser } from '../../models/re/staff-list-settings';
import { FirebaseStorage } from '../../services/firebase/firebase.storage';
import { SharedValueService } from '../../services/shared-value.service';
import { environment } from '../../../environments/environment';
import { Product } from '../../common/profile';
import {GroupService} from '../../services/group.service';

@Component({
  selector: 'app-mini-profile',
  templateUrl: './mini-profile.component.html',
  styleUrls: ['./mini-profile.component.scss']
})

export class MiniProfileComponent implements OnInit, OnChanges {
  @Input() faceIcon: string;
  public _faceIcon: string;
  userSession;

  @Input('officeUserId') _officeUserId: string;
  @Input('userInfo') userInfo: any;
  @Input('profileOptions') _profileOptions: any = {
    iconSet: false,
    iconSize: 55,
    nameKana: true,
    nameHonorific: false,
    officeName: false,
    departmentName: false,
    purposeMeeting: false,
    jobName: false,
    isLink: false,
    isContent: {
      top: {
        content: null,
        class: null
      },
      right: {
        content: null,
        class: null
      },
      bottom: {
        content: null,
        class: null
      }
    },
    popOver : {
      container: 'body',
      title: null,
      content: null,
      placement : 'top',
      trigger : 'manual'
    }
  };
  @Input() tooltipOptions = {
    isShow: false,
    isShowOfficeName: false
  };
  @Input() faceImgId: string;
  @Output('miniProfileLinkClick') _miniProfileLinkClick = new EventEmitter<Event>();
  @Output() updateImageUrl = new EventEmitter<Event>();


  // Pattern
  // face-icon 94px
  // {iconSize:94,officeName:true}
  // {iconSize:94,departmentName:true}
  // face-icon 76px
  // {iconSize:76}
  // {iconSize:76,nameKana:true}
  // {iconSize:76,officeName:true}
  // {iconSize:76,departmentName:true}
  // face-icon 55px
  // {iconSize:55}
  // {iconSize:55,officeName:true}
  // {iconSize:55,departmentName:true}
  // face-icon 40px
  // {iconSize:40}
  // {iconSize:40,nameKana:true}
  // {iconSize:40,officeName:true}
  // {iconSize:40,departmentName:true}
  // face-icon 30px
  // {iconSize:30}
  // {iconSize:30,officeName:true}
  // {iconSize:30,departmentName:true}
  public deptName: string;
  public product: string;

  public firstName: string;
  public lastName: string;
  public firstNameKana: string;
  public lastNameKana: string;
  public officeName: string;
  public departmentName: string;
  public purposeMeeting: string;
  public jobName: string;

  public content: any;
  public showContentTop = false;
  public showContentRight = false;
  public showContentBottom = false;
  public contentTopClass: string;
  public contentRightClass: string;
  public contentBottomClass: string;

  public popOver: any;
  public popOverContainer: string;
  public popOverTitle: string;
  public popOverContent: string;
  public popOverPlacement: string;
  public popOverTrigger: string;

  constructor(
    config: NgbPopoverConfig,
    private _registrationService: RegistrationService,
    private firebaseStorage: FirebaseStorage,
    private sharedValueService: SharedValueService,
    private groupService: GroupService
  ) {
  }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    this.product = environment.app === Product.Drjoy ? 'drjoy' : 'prjoy';
    this.deptName = '';
    if (this.product === 'drjoy') {
      if (this.userSession.deptName !== '/') {
        this.deptName = this.userSession.deptName.replace(/^\/(.*)\/$/, '$1');
      } else {
        this.deptName = '所属未分類';
      }
    }
    // this._update();
    // this.updateInfo();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (propName === '_officeUserId') {
        this._update();
      }
      if (propName === '_profileOptions') {
        this.updateOption();
      }
      if (propName === 'userInfo') {
        this.updateInfo();
      }
    }
  }

  /**
   * 情報を更新する
   */
  private _update() {
    if (!this._officeUserId) {
      return;
    }
    if (this.faceImgId) {
      this.groupService.getDetailUser(this.faceImgId)
        .subscribe(
          (detailUser: DetailUser) => {
            this.mapDetailUser(detailUser);
          });
    } else {
      this._registrationService.getStaffListDetail(this._officeUserId)
        .subscribe(
          (detailUser: DetailUser) => {
            this.mapDetailUser(detailUser);
          });
    }
  }

  private mapDetailUser(detailUser: DetailUser) {
    this.userInfo = detailUser;
    this.firstName = detailUser.firstName;
    this.lastName = detailUser.lastName;
    this.firstNameKana = detailUser.firstNameKana;
    this.lastNameKana = detailUser.lastNameKana;
    this.officeName = detailUser.officeName ? detailUser.officeName : 'offceName 未実装';
    this.departmentName = this.convertPathDepartment(detailUser);
  }

  private updateOption() {
    // isContent
    this.content = this._profileOptions.isContent;
    this.showContentTop = (this.content && this.content.top && this.content.top.content);
    this.showContentRight = (this.content && this.content.right && this.content.right.content);
    this.showContentBottom = (this.content && this.content.bottom && this.content.bottom.content);
    this.contentTopClass = (this.content && this.content.top && this.content.top.class) ? this.content.top.class : '';
    this.contentRightClass = (this.content && this.content.right && this.content.right.class) ? this.content.right.class : '';
    this.contentBottomClass = (this.content && this.content.bottom && this.content.bottom.class) ? this.content.bottom.class : '';

    // popOver
    this.popOver = this._profileOptions.popOver;
    this.popOverContainer = (this.popOver && this.popOver.container) ? this.popOver.container : 'body';
    this.popOverTitle = (this.popOver && this.popOver.title) ? this.popOver.title : null;
    this.popOverContent = (this.popOver && this.popOver.content) ? this.popOver.content : null;
    this.popOverPlacement = (this.popOver && this.popOver.placement) ? this.popOver.placement : 'top';
    this.popOverTrigger = (this.popOver && this.popOver.trigger && this.popOver.content) ? this.popOver.trigger : 'manual';
  }

  private updateInfo(){
    if (! this.userInfo) {
      return;
    }
    this.firstName = this.userInfo.firstName;
    this.lastName = this.userInfo.lastName ? this.userInfo.lastName : this.userInfo.fullName;
    this.firstNameKana = this.userInfo.firstNameKana;
    this.lastNameKana = this.userInfo.lastNameKana ? this.userInfo.lastNameKana : this.userInfo.fullNameKana;
    this.officeName = this.userInfo.officeName ? this.userInfo.officeName : 'officeName 未実装';
    this.departmentName = this.userInfo.deptName ?  this.userInfo.deptName : (this.userInfo.department ? this.userInfo.department.name : '');

    this.purposeMeeting =  this.userInfo.purposeMeeting;
    this.jobName = this._profileOptions.jobName ? this.userInfo.jobName : '';
  }

  private _profileLinkClick(val: Event){
    this._miniProfileLinkClick.emit(val);
  }

  updateInfoImageUrl() {
    this.updateImageUrl.emit();
  }

  convertPathDepartment(user: any) {
    let result = user.department.displayName ? user.department.displayName : user.department.name;
    if (user.department.path && user.department.path !== '/') {
      const department = user.department.path.slice(1, -1).replace(/\//g, ' | ');
      if (department) {
        result = department;
      }
    }
    return result;
  }
}
