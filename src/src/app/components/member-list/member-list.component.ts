import {
  Component, OnInit, Input, OnChanges, SimpleChanges
} from '@angular/core';
import { DialogService } from '../../services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { SharedValueService } from '../../services/shared-value.service';
import { GroupService } from '../../services/group.service';
import { environment } from '../../../environments/environment';
import { Profile } from '../../../app/common/profile';
import {GroupType} from '../../models/gr/firebase/fir.group';
import {Router} from '@angular/router';
import {DialogResult} from '../../models/dialog-param';
import {FirebaseStorage} from '../../services/firebase/firebase.storage';
import {GroupArticleInformationComponent} from '../group-article-information/group-article-information.component';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss'],
  providers: [GroupArticleInformationComponent],
  preserveWhitespaces: false
})
export class MemberListComponent implements OnInit, OnChanges {

  @Input() groupInfo: any;
  @Input() listMemberInfo: any[];
  @Input() isAdmin: boolean = false;
  @Input() iconSize: number;
  public officeUserIds: string[] = [];
  public userSession: any;
  public isGroupOutside: boolean;
  public _groupAvatar: string;

  constructor(
    private dialogService: DialogService,
    private translateService: TranslateService,
    private sharedValueService: SharedValueService,
    private _groupService: GroupService,
    private route: Router,
    private firebaseStorage: FirebaseStorage,
    private groupArticleComponent: GroupArticleInformationComponent
  ) { }

  ngOnInit() {
    this._updateGroup();
    this._updateIconSize();
    this.userSession = this.sharedValueService.getUserSession();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (propName === 'groupInfo') {
        this._updateGroup();
      }
      if (propName === 'iconSize') {
        this._updateIconSize();
      }
    }
  }

  private _updateGroup() {
    if (! this.groupInfo) {
      return;
    }
    this.isGroupOutside = this.groupInfo.type === GroupType.Outside;
    // groupId から officeUserIdsを取得できる？ mock
    if (environment.profile === Profile.mock) {
      this.officeUserIds = ['1', '2', '3', '4', '5', '6', '7', '8'];
      return;
    }
    if (this.groupInfo.type === GroupType.Official) {
      this._groupAvatar = '/assets/img/group-official.png';
    } else if (this.groupInfo.id) {
      this.firebaseStorage.groupIcon(this.groupInfo.id, true).subscribe(icon => {
        this._groupAvatar = icon;
      }, error => {
        this._groupAvatar = '';
      });
    }

    // Call list info => performance is slow
    // this._groupService.getApprovedMembers(this.groupInfo.id).
    // subscribe(
    //   (members: FirGroupMember[]) => {
    //     this.officeUserIds = [];
    //     for (let member of members) {
    //       this.officeUserIds.push(member.id);
    //     }
    //   }
    // );
  }

  private _updateIconSize() {
  }

  openAllList() {
    let positiveBtnText = '';
    if (this.isAdmin) {
      positiveBtnText = 'MSG.MEMBER_LIST.GROUP_EDIT';
    } else {
      positiveBtnText = null;
    }

    this.dialogService
      .showMemberListDialog(false, 'MSG.MEMBER_LIST.GROUP_TITLE', positiveBtnText, 'MSG.CLOSE',
        {groupId: this.groupInfo.id, userIds: [], userInfo: this.listMemberInfo, isShowOfficeName: this.isGroupOutside, mode: 'all'})
      .subscribe((res: DialogResult) => {
        if (res.isOk()) {
          console.log('go to group edit');
          this.checkGroupType();
        }
      });
  }

  checkGroupType() {
    if (this.groupInfo.type === GroupType.Inside && !this.groupInfo.deptGroupFlag) {
      this.route.navigate(['gr/gr0004', this.groupInfo.id]);
    } else if ( this.groupInfo.type === GroupType.Outside) {
      this.route.navigate(['gr/gr0007', this.groupInfo.id]);
    } else if (this.groupInfo.deptGroupFlag) {
      this.route.navigate(['gr/gr0005', this.groupInfo.id]);
    }
  }

  groupIconSetChanged(event) {
    if (event) {
      this.firebaseStorage.uploader.groupIcon(this.groupInfo.id, this.userSession.officeUserId, event).subscribe(data => {
        if (data.done) {
          this._groupAvatar = data.url;
        }
      }, error => {
        this.dialogService.showError('MSG.ERROR');
      });
    } else {
      this.firebaseStorage.ref(`group/${this.groupInfo.id}/icon.png`).delete();
      this._groupAvatar = '';
    }
  }

  getDetailUser(event, user: any) {
    event.preventDefault();
    $('.tooltip').remove();
    this.groupArticleComponent.detailUserDialog(user);
  }
}
