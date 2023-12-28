import {Component, HostListener, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {SharedValueService} from '../../../services/shared-value.service';
import {Helper} from '../../../common/helper';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {EditHospitalGroupSettings} from '../../../models/gr/edit-hospital-group-settings';
import {GroupService} from '../../../services/group.service';
import {Gr0002PageComponent} from '../gr0002-page/gr0002-page.component';
import {CreateHospitalGroupSettingsSendApi} from '../../../models/gr/create-hospital-group-settings-send-api';
import {DialogResult} from '../../../models/dialog-param';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';
import {DialogService} from '../../../services/dialog.service';
import {AccountStatus} from '../../../models/ba/user-session';

@Component({
  selector: 'app-gr0004-page',
  templateUrl: './gr0004-page.component.html',
  styleUrls: ['./gr0004-page.component.scss'],
  preserveWhitespaces: false
})
export class Gr0004PageComponent implements OnInit {

  public editHospitalModel = new EditHospitalGroupSettings();
  editGroupForm: FormGroup;
  userSession;
  groupId = '';
  messError = {name: '', member: ''};
  gr0002;
  listMember = [];
  listUser = [];
  listDepartment = [];
  checkAllUser = false;
  imageFlag = false;
  appGroupIconSetResult: any;
  groupAvatar: string;

  constructor(private translate: TranslateService,
              private dialogService: DialogService,
              private fb: FormBuilder,
              private groupService: GroupService,
              private helper: Helper,
              private sharedValueService: SharedValueService,
              private activatedRoute: ActivatedRoute,
              private route: Router,
              private firebaseStorage: FirebaseStorage) {
    this.editGroupForm = this.fb.group({
      'name': '',
      'deptId': ''
    });
    this.gr0002 = new Gr0002PageComponent(this.translate, this.dialogService, this.fb, this.groupService,
      this.helper, this.sharedValueService, null, this.firebaseStorage);
  }

  ngOnInit() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.userSession = this.sharedValueService.getUserSession();
    this.activatedRoute.params.subscribe((params: Params) => {
      this.groupId = params['groupId'];
    });
    if (this.groupId) {
      this.groupService.getEditHospitalGroup(this.groupId).subscribe((settings: EditHospitalGroupSettings) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.firebaseStorage.groupIcon(this.groupId, true).subscribe(icon => {
          this.groupAvatar = icon;
        });
        this.editHospitalModel = settings;
        this.createForm();
      }, (error) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      });
    } else {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    }
  }

  createForm() {
    this.editGroupForm = this.fb.group({
      'name': [this.editHospitalModel.group.name,
        Validators.compose([Validators.required, Validators.maxLength(17)])],
      'deptId': ''
    });
    this.listDepartment = this.helper.createArrayDepartment(this.listDepartment, this.editHospitalModel.departments, '', 1);
    this.listUser = this.helper.convertUserName(this.listUser, this.editHospitalModel.departmentUsers);
    const groupMemberModel = this.editHospitalModel.group.users;
    for (let m = 0; m < groupMemberModel.length; m++) {
      for (let n = 0; n < this.listUser.length; n++) {
        if (groupMemberModel[m].officeUserId === this.listUser[n].officeUserId &&
          this.listMember.findIndex(item => item.officeUserId === groupMemberModel[m].officeUserId) < 0) {
          let mem = {};
          mem = this.listUser[n];
          mem['memberId'] = groupMemberModel[m].memberId;
          mem['authority'] = groupMemberModel[m].authority ? 'ADMIN' : 'MEMBER';
          if (this.getMemberStatus(this.listUser[n])) {
            this.listMember.push(mem);
            this.listUser.splice(n, 1);
          }
        }
      }
    }
    this.listUser = this.listUser.filter(item => this.getUserStatus(item));
    this.listUser.sort(this.helper.orderByComparator('fullNameKana'));
  }

  //  Show list of users whose status is valid and provisional
  getUserStatus(user) {
    const accountStatus = new AccountStatus(user.accountStatus);
    return (accountStatus.isValid || accountStatus.isProvisional) && !accountStatus.isLocking && !accountStatus.isInvalid;
  }

  // Show list of members whose status is valid, provisional or locked
  getMemberStatus(member) {
    const accountStatus = new AccountStatus(member.accountStatus);
    return !accountStatus.isInvalid;
  }

  groupIconSetChanged(event) {
    this.imageFlag = true;
    if (event) {
      this.appGroupIconSetResult = event;
    }
  }

  editSelectedHospitalAdmin(member) {
    if (member) {
      member.authority = member.authority === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    }
  }

  /**
   * select department
   * @param deptId
   */
   changeSelectedDepartment(deptId) {
    this.checkAllUser = false;
    const result = this.gr0002.getDepartmentUserInHospitalGroup(deptId.target.value, this.editHospitalModel.departmentUsers,
      this.editHospitalModel.departments, this.listMember);
    this.listUser = result.listUser.sort(this.helper.orderByComparator('fullNameKana'));
  }

  editSelectedUser(user) {
   if (user) {
     user.isSelected = !user.isSelected;
   }
  }

  editSelectedMember(member) {
    if (member) {
      member.isSelected = !member.isSelected;
    }
  }

  /**
   * @param checkAllUser
   */
  changeCheckAllUser(checkAllUser) {
    const result = this.gr0002.changeCheckAllCommon(checkAllUser, this.listUser);
    this.checkAllUser = result.checkAllUser;
    this.listUser = result.listUser;
  };

  /**
   * move users from user list to member list
   */
  editAddMember() {
    for (let i = 0; i < this.listUser.length; i++) {
      if (this.listUser[i].isSelected) {
        this.listUser[i].isSelected = false;
        this.listMember.push(this.listUser[i]);
        this.listUser.splice(i, 1);
        i--;
      }
    }
    this.checkAllUser = false;
  }

  /**
   * remove member from memberList to user List
   */
  editRemoveMember() {
    for (let i = 0; i < this.listMember.length; i++) {
      if (this.listMember[i].isSelected) {
        this.listUser.push(this.listMember[i]);
        this.listMember[i].isSelected = false;
        this.listMember[i].authority = 'MEMBER';
        this.listMember.splice(i, 1);
        i--;
      }
    }
  }

  /**
   * delete group
   * @param {string} groupId
   */
  deleteHospitalGroup(groupId: string) {
    let html = '';
    this.translate.get('MSG.GR').subscribe((msg) => {
      html = '<div>' + msg.M006_1 + '</div><div>' + msg.M006_2 + '</div>';
    });
    this.dialogService.showMessage('warning', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
      (res: DialogResult) => {
        if (res.isOk()) {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(true);
          });
          this.groupService.deleteGroup(groupId).subscribe((response) => {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(false);
            });
            this.firebaseStorage.ref(`group/${this.groupId}/icon.png`).delete();
            setTimeout(() => {
              this.dialogService.showMessage('success', false, null, 'MSG.GR.M007', null, 'MSG.YES', null).subscribe(
                (re: DialogResult) => {
                  if (re.isOk()) {
                    // redirect to .....
                    this.route.navigateByUrl('/');
                  }
                });
            });
          }, error => {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(false);
            });
            setTimeout(() => {
              this.dialogService.showError('MSG.ERROR');
            }, 400);
          });
        }
      });
  }

  putEditHospitalGroup() {
    const resultCheckValidation = this.gr0002.checkValidate(this.editGroupForm, this.messError,
      this.listMember);
    this.messError.name = resultCheckValidation.msgError['name'];
    this.messError.member = resultCheckValidation.msgError['member'];
    if (this.messError.name === ''  && this.messError.member === '' && !resultCheckValidation.noneSelectedAdmin) {
      let html = '';
      this.translate.get('MSG.GR').subscribe(msg => {
        html = '<div>' + msg.M008_1 + '</div><div>' + msg.M008_2 + '</div>';
      });
      let userLoginIsMember = false;
      const modelSendApi = new CreateHospitalGroupSettingsSendApi();
      modelSendApi.id = this.groupId;
      modelSendApi.groupName = this.editGroupForm.get('name').value;
      this.listMember.forEach(member => {
        const mem = {};
        mem['officeUserId'] = member.officeUserId;
        mem['memberId'] = member.memberId ? member.memberId : '';
        mem['adminFlg'] = member.authority === 'ADMIN';
        modelSendApi.users.push(mem);
        if (member.officeUserId === this.userSession.officeUserId) {
          userLoginIsMember = true;
        }
      });
      this.dialogService.showMessage('warning', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
        (res: DialogResult) => {
            if (res.isOk()) {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(true);
              });
              setTimeout(() => {
                if (this.imageFlag && this.appGroupIconSetResult) {
                  this.firebaseStorage.uploader.groupIcon(this.groupId, this.userSession.officeUserId,
                    this.appGroupIconSetResult).subscribe(data => {
                    if (data.done) {
                      this.callPutApi(modelSendApi, userLoginIsMember);
                    }
                  });
                } else {
                  if (this.imageFlag && !this.appGroupIconSetResult && this.groupAvatar) {
                    this.firebaseStorage.ref(`group/${this.groupId}/icon.png`).delete();
                  }
                  this.callPutApi(modelSendApi, userLoginIsMember);
                }
              });
            }
        });
    }
  }

  callPutApi(modelSendApi, userLoginIsMember) {
    this.groupService.putEditHospitalGroup(modelSendApi).subscribe(
      (response) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showMessage('success', false, null, 'MSG.GR.M009', null, 'MSG.YES', null).subscribe(
          (res: DialogResult) => {
            if (res.isOk()) {
              if (userLoginIsMember) {
                // redirect to group's timeline page
                this.route.navigate(['gr/gr0011', this.groupId]);
              } else {
                this.route.navigate(['/']);
              }
            }
          }
        );
      }, error => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      });
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     this.putEditHospitalGroup();
  //   }
  // }
}
