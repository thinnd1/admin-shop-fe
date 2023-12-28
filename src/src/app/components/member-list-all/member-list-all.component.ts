import { Component, OnInit, Input } from '@angular/core';
import { SharedValueService } from '../../services/shared-value.service';
import {Observable} from 'rxjs/Observable';
import { DialogService } from '../../services/dialog.service';
import 'rxjs/add/operator/delay';
import {GroupService} from '../../services/group.service';
import {AccountStatus} from '../../models/ba/user-session';
import {TranslateService} from '@ngx-translate/core';
import {DetailMrUser} from '../../models/re/detail-mr-user';
import {Product} from '../../common/profile';
import {environment} from '../../../environments/environment';
import {RegistrationService} from '../../services/registration.service';

@Component({
  selector: 'app-member-list-all',
  templateUrl: './member-list-all.component.html',
  styleUrls: ['./member-list-all.component.scss']
})
export class MemberListAllComponent implements OnInit {

  @Input() groupId: string;
  @Input() userIds: any;
  @Input() userInfo: any;
  @Input() iconSize: string;
  @Input() mode: string;
  @Input() isShowOfficeName = false;
  @Input() roomType: string;

  public users: string[];
  public userSession;
  public delaySec = 400;
  // isSort = true; Sort by name kana
  public isSort: boolean;
  public isAllMember: boolean;
  public navs = [
    {active: false, label: 'MEMBER_LIST.ALREADY', mode: 'already'},
    {active: false, label: 'MEMBER_LIST.UNREAD', mode: 'unread'}
  ];
  multiTabs = false;
  message = null;
  adminLabel: string;
  lockedAccountLabel: string;
  blockedAccountLabel: string;
  restrictedLabel: string;

  constructor(
    private sharedValueService: SharedValueService,
    private dialogService: DialogService,
    private groupService: GroupService,
    private translateService: TranslateService,
    private translate: TranslateService,
    private registrationService: RegistrationService
  ) { }

  ngOnInit() {
    // mock
    let count = 0;
    if (this.mode) {
      this.navs.forEach((val, idx) => {
        if (this.mode === val.mode) {
          count++;
          this.tabOpen(val);
          return;
        }
      });
      this.multiTabs = count > 0;
    }
    this.users = this.getOfficeUserIds(this.mode);
    // sort the list of members in the chat room
    if (this.roomType) {
      this.userInfo.map(function (data, idx) {
        data.order = idx;
      });
      this.userInfo.sort((a, b) => {
        return (a.invalid === b.invalid) ? ((a.order > b.order) ? 1 : -1) : a.invalid ? 1 : -1;
      });
    }
    this.userSession = this.sharedValueService.getUserSession();
    this.translate.get('MSG.CH').subscribe(text => {
      this.adminLabel = text.ADMIN_LABEL;
      this.lockedAccountLabel = text.LOCKED_ACCOUNT_LABEL;
      this.blockedAccountLabel = text.BLOCKED_ACCOUNT_LABEL;
      this.restrictedLabel = text.VISIT_RESTRICTION_LABEL;
    });
  }

  tabOpenClick($event, nav) {
    $event.preventDefault();
    $event.stopPropagation();
    this.tabOpen(nav);
  }

  tabOpen(nav) {
    this.navs.forEach((val, idx) => {
      val.active = false;
      if (nav === val) {
        val.active = true;
      }
    });
    this.users = this.getOfficeUserIds(nav.mode);
  }

  private getOfficeUserIds(mode) {
    let userArr = [];
    switch (mode) {
      case 'already':
        userArr = this.userIds.seen;
        this.isSort = true;
        break;
      case 'unread':
        userArr = this.userIds.unseen;
        this.isSort = true;
        break;
      case 'confirmed':
        userArr = this.userIds;
        this.isSort = false;
        break;
      case 'all':
        userArr = [];
        this.isSort = true;
        this.isAllMember = true;
        break;
      case 'unanswered':
        userArr = this.userIds;
        this.isSort = true;
        this.translate.get('GR0013.NOBODY').subscribe(msg => {
          this.message = this.userIds.length === 0 ? msg : null;
        });
        break;
      default:
        userArr = this.userIds;
        this.isSort = true;
        break;
    }
    return userArr;
  }

  miniProfileOpen($event, user: any){
    $event.preventDefault();
    $event.stopPropagation();

    let isSelf = 0;

    // isSelf
    if (this.userSession.officeUserId === user.id) {
      isSelf = 1;
    }

    Observable.create(observer => {
      if (!user.invalid) {
        (<any>$('#theModal')).modal('hide');
        observer.next();
      }
    })
    .delay(this.delaySec)
    // .mergeMap((res)=>{
      // return this.dialogService.showStaffDetailsDialog(isSelf, {officeUserId: officeUserId});
    // })
    .subscribe((res) => {
      if (new AccountStatus(user.accountStatus).isValid  && !new AccountStatus(user.accountStatus).isLocking || new AccountStatus(user.accountStatus).isProvisional && !new AccountStatus(user.accountStatus).isLocking) {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(true);
        });
        if (this.roomType === 'CUSTOMER' && user.officeId !== this.userSession.officeId && environment.app === Product.Drjoy  ||
          user.officeId === this.userSession.officeId && environment.app === Product.Prjoy) {
          this.registrationService.getDetailMR(user.id).subscribe((settings: DetailMrUser) => {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(false);
            });
            this.dialogService.showStaffDetailsDialog('', {data: settings, officeUserId: 'pr'});
          }, error => {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(false);
            });
          });
        } else {
          this.groupService.getDetailUser(user.id).subscribe(modelDetail => {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(false);
            });
            this.dialogService.showStaffDetailsDialog(null, {data: modelDetail, officeUserId: 'dr'});
          }, error => {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(false);
            });
            this.dialogService.showError('MSG.ERROR');
          });
        }
      }  else if (new AccountStatus(user.accountStatus).isLocking && new AccountStatus(user.accountStatus).isValid) {
        let html = '';
        this.translateService.get('MSG.GR.LOCKED_ACCOUNT_PROFILE_POPUP').subscribe(msg => {
          html = '<div><h1 class="font-weight-bold">' + msg.MSG_1 + '<br>' + msg.MSG_2 + '</h1></div><br><div>' + msg.MSG_3 + '</div><div>' + msg.MSG_4 + '</div>';
        });
        this.dialogService.showMessage('error', false, null, null, html, 'MSG.OK', null).subscribe();
      }
      // NamDH confirmed: remove edit button
      // if(res.buttonName === 'ok' && isSelf){
      //   console.log('go to edit');
      // }
      // TODO:何か加えないとcloseして前のmodalに戻れないので、とじて終わる
    });
  }

  getContentBottom(user: any) {
    return (user.isLocking ? this.lockedAccountLabel : null) || (user.isRestricted ? this.restrictedLabel : null) ||
      (user.isBlocked ? this.blockedAccountLabel : null);
  }

}
