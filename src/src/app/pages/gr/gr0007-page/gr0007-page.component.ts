import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import { GroupService } from '../../../services/group.service';
import {Helper} from '../../../common/helper';
import {ActivatedRoute, Router} from '@angular/router';
import {EditGroupOutsideSetting} from '../../../models/gr/edit-group-outside-settings';
import {GroupOutsideSaveResult} from '../../../models/gr/group-outside-save-result';
import {CreateHospitalGroupSettingsSendApi} from '../../../models/gr/create-hospital-group-settings-send-api';
import {HttpError} from '../../../common/error/http.error';
import {SharedValueService} from '../../../services/shared-value.service';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';
import {Gr0002PageComponent} from '../gr0002-page/gr0002-page.component';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';
import {AccountStatus} from '../../../models/ba/user-session';

@Component({
  selector: 'app-gr0007-page',
  templateUrl: './gr0007-page.component.html',
  styleUrls: ['./gr0007-page.component.scss'],
  preserveWhitespaces: false
})
export class Gr0007PageComponent implements OnInit {

  groupId: string;
  model = new EditGroupOutsideSetting();
  editForm: FormGroup;
  mailForm: FormGroup;
  invitedUser = [];
  listDepartment = [];
  suggestedList = [];

  // inside list
  listInside = [];
  originalInsideList = [];
  // outside list
  listOutside = [];
  listOffices = [];
  // member list
  listMember = [];
  inviteFlg = [];
  checkAllUserInside = false;
  checkAllUserOutside = false;
  noneSelectedAdmin = false;
  invitedUsersList = [];

  formErrors = {'name': '', 'member': '', 'mail': ''};
  userSession;
  imageFlag = false;
  appGroupIconSetResult: any;
  gr0002;
  gr0006;
  groupAvatar: string;

  constructor(private groupService: GroupService,
              private translate: TranslateService,
              private fb: FormBuilder,
              private dialogService: DialogService,
              public helper: Helper,
              private route: Router,
              public sharedValueService: SharedValueService,
              public activatedRoute: ActivatedRoute,
              private firebaseStorage: FirebaseStorage) {
    this.gr0002 = new Gr0002PageComponent(this.translate, this.dialogService, this.fb, this.groupService,
      this.helper, this.sharedValueService, this.route, this.firebaseStorage);
    this.editForm = this.fb.group({'name': ['']});
    this.mailForm = this.fb.group({'mail': ['']});
  }

  ngOnInit() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.userSession = this.sharedValueService.getUserSession();
    this.activatedRoute.params.subscribe(params => {
      this.groupId = params['groupId'];
    });
    if (this.groupId) {
      this.groupService.getEditGroupOutside(this.groupId).subscribe((settings: EditGroupOutsideSetting) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.firebaseStorage.groupIcon(this.groupId, true).subscribe(icon => {
            this.groupAvatar = icon;
          });
          this.model = settings;
          this.editFormOutsideGroup();
          this.getInit();
        },
        (error) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showError('MSG.ERROR');
        });
    } else {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
    }
  }

  getInit() {
    this.listDepartment = this.helper.createArrayDepartment([], this.model.departments, '', 1);

    this.listOffices = this.userSession.personalFlag ? this.model.offices :
      this.model.offices.filter(office => office.id !== this.userSession.officeId);
    const users = this.helper.convertUserNameGroupOutSide([], this.model.prepareOutsideOfficeUsers);
    // filter listInside & listOutside
    this.originalInsideList = this.model.prepareOutsideOfficeUsers.filter(user => user.officeId === this.userSession.officeId);
    this.listInside = users.filter(u => (u.officeId === this.userSession.officeId && u.officeUserid !== this.userSession.officeUserId &&
        this.getUserStatus(u)));
    if (!this.userSession.personalFlag) {
      this.listOutside = users.filter(u => (u.officeId !== this.userSession.officeId) && this.getUserStatus(u));
    } else {
      this.listOutside = users.filter(u => (u.officeUserid !== this.userSession.officeUserId &&
        new AccountStatus(u.accountStatus).isValid && !new AccountStatus(u.accountStatus).isLocking));
      this.listOutside.forEach(item => {
        item.inviteFlag = this.userSession.officeId !== item.officeId;
      });
    }

    // filter users who have not been added to the member list
    for (let j = 0; j < this.model.group.users.length; j++) {
      this.listInside = this.listInside.filter((item) => item.officeUserId !== this.model.group.users[j].officeUserId);
      this.listOutside = this.listOutside.filter((item) => item.officeUserId !== this.model.group.users[j].officeUserId);
    }
    this.listInside.sort(this.helper.orderByComparator('fullNameKana'));
    this.listOutside.sort(this.helper.orderByComparator('fullNameKana'));
    for (let j = 0; j < this.listOutside.length; j++) {
      this.listOutside[j].inviteFlg = this.listOutside[j].officeId !== this.userSession.officeId;
    }
    // filter member list
    const members = this.model.group.users;
    for (let a = 0; a < users.length; a++) {
      for (let b = 0; b < members.length; b++) {
        if (users[a].officeUserId === members[b].officeUserId &&
          this.listMember.findIndex(item => item.officeUserId === users[a].officeUserId) < 0) {
          let member = {};
          member = users[a];
          member['inviteFlg'] = members[b].inviteFlg;
          member['authority'] = members[b].authority ? 'ADMIN' : 'MEMBER';
          member['memberId'] = members[b].memberId;
          if (this.getMemberStatus(users[a])) {
            this.listMember.push(member);
          }
        }
      }
    }
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

  /**
   * get user list by department
   * @param deptId
   */
  changeDeptId(deptId) {
    this.checkAllUserInside = false;
    const result = this.gr0002.getDepartmentUserInHospitalGroup(deptId, this.originalInsideList,
      this.model.departments, this.listMember);
    this.listInside = result.listUser.sort(this.helper.orderByComparator('fullNameKana'));
    this.listInside.forEach(u => {
      u.inviteFlg = false;
      u.officeId = this.userSession.officeId;
    });
  }

  /**
   * @param value
   */
  changeOfficeId(value) {
    this.listOutside = [];
    this.checkAllUserOutside = false;
    if (value === '') {
      if (this.userSession.personalFlag) {
        this.listOutside = this.model.prepareOutsideOfficeUsers;
      } else {
        for (let m = 0; m < this.model.prepareOutsideOfficeUsers.length; m++) {
          if (this.model.prepareOutsideOfficeUsers[m].officeId !== this.userSession.officeId &&
            this.listOutside.findIndex(item => item.officeUserId === this.model.prepareOutsideOfficeUsers[m].officeUserId) < 0) {
            this.listOutside.push(this.model.prepareOutsideOfficeUsers[m]);
          }
        }
      }
    } else {
      for (let i = 0; i < this.model.prepareOutsideOfficeUsers.length; i++) {
        if (this.model.prepareOutsideOfficeUsers[i].officeId === value &&
          this.listOutside.findIndex(item => item.officeUserId === this.model.prepareOutsideOfficeUsers[i].officeUserId) < 0) {
          this.listOutside.push(this.model.prepareOutsideOfficeUsers[i]);
        }
      }
    }
    // filter users who have not been added to the member list
    this.listOutside = this.listOutside.filter((item) =>
      this.listMember.findIndex(mem => mem.officeUserId === item.officeUserId) < 0 &&
      new AccountStatus(item.accountStatus).isValid && !new AccountStatus(item.accountStatus).isLocking);
    this.listOutside = this.helper.convertUserNameGroupOutSide([], this.listOutside);
    this.listOutside.sort(this.helper.orderByComparator('fullNameKana'));
    if (value === '') {
      // add the list of invited users via mail to the display list
      if (this.invitedUsersList.length > 0) {
        for (let p = 0; p < this.invitedUsersList.length; p++) {
          if (this.listOutside.findIndex(item => item.officeUserId === this.invitedUsersList[p].officeUserId) < 0 &&
            this.listMember.findIndex(mem => mem.officeUserId === this.invitedUsersList[p].officeUserId) < 0) {
            this.listOutside.push(this.invitedUsersList[p]);
          }
        }
      }
    }
    for (let i = 0; i < this.listOutside.length; i++) {
      this.listOutside[i].inviteFlg = true;
    }
  }

  selectedUser(user: any) {
    if (user) {
      user.isSelected = !user.isSelected;
    }
  }

  /**
   * selected member in list member
   */
  selectedMember(member: any) {
    member.isSelected = !member.isSelected;
  }

  /**
   * selected all user in list member inside or outside
   * @return lists user selected
   */
  changeCheckAll(checkAllUser, isOutside) {
    if (!isOutside) {
      const result = this.gr0002.changeCheckAllCommon(checkAllUser, this.listInside);
      this.checkAllUserInside = result.checkAllUser;
      this.listInside = result.listUser;
    } else if (isOutside) {
      const result = this.gr0002.changeCheckAllCommon(checkAllUser, this.listOutside);
      this.checkAllUserOutside = result.checkAllUser;
      this.listOutside = result.listUser;
    }
  };

  /**
   * select 1 or more users in inside list or outside list --> add to member list
   * @param isOutside
   */
  addMember(isOutside) {
    if (!isOutside) {
        for (let j = 0; j < this.listInside.length; j++) {
          if (this.listInside[j].isSelected) {
            this.listInside[j].isSelected = false;
            this.listMember.push(this.listInside[j]);
            this.listInside.splice(j, 1);
            j--;
          }
        }
      this.checkAllUserInside = false;
    } else if (isOutside) {
        for (let j = 0; j < this.listOutside.length; j++) {
          if (this.listOutside[j].isSelected) {
            this.listOutside[j].isSelected = false;
            this.listMember.push(this.listOutside[j]);
            this.listOutside.splice(j, 1);
            j--;
          }
        }
      this.checkAllUserOutside = false;
    }
  }

  /**
   * remove member from member list
   */
  removeMember() {
      for (let j = 0; j < this.listMember.length; j++) {
        if (this.listMember[j].isSelected) {
          this.listMember[j].isSelected = false;
          this.listMember[j].authority = 'MEMBER';
          if (this.userSession.personalFlag) {
            this.listOutside.push(this.listMember[j]);
          } else {
            if (this.listMember[j].officeId !== this.userSession.officeId) {
              this.listOutside.push(this.listMember[j]);
            } else if (this.listMember[j].officeId === this.userSession.officeId) {
              this.listInside.push(this.listMember[j]);
            }
          }
          this.listMember.splice(j, 1);
          j--;
        }
      }
  }

  selectedHospitalAdmin(member) {
    if (member) {
      member.authority = member.authority === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    }
  }

  /**
   * validate form edit group
   */
  editFormOutsideGroup() {
    this.editForm = this.fb.group({
      'name': [this.model.group.name, [Validators.required, Validators.maxLength(17), Validators.pattern(Helper.checkSpace)]]
    });
    this.mailForm = this.fb.group({
      'mail': ['', Validators.required]
    });
  }

  searchOfficeUser() {
    if (!this.mailForm) {
      return false;
    } else {
      this.suggestedList = [];
      this.formErrors['mail'] = '';
      if (this.mailForm.get('mail').value.trim() === '') {
        this.formErrors['mail'] = this.translate.instant('GR0006.PLACEHOLDER_MAIL_INPUT');
      } else {
        this.groupService.getUserFromMail(this.mailForm.get('mail').value).subscribe((officeUser: any) => {
          this.suggestedList = officeUser.outsideOfficeUsers;
        });
      }
    }
  }

  /**
   * add to the list of invited users via mail
   * @param user
   */
  addInvitedMail(user) {
    this.mailForm.get('mail').setValue('');
    if (this.invitedUser.findIndex(item => item.officeUserId === user.officeUserId) < 0) {
      this.invitedUser.push(user);
    }
    this.suggestedList = [];
  }

  /**
   * remove user in invited users
   * @param user
   */
  removeDoctor(user: any) {
    if (user) {
      const index = this.invitedUser.findIndex(item => item.officeUserId === user.officeUserId);
      if (index > -1) {
        this.invitedUser.splice(index, 1);
      }
    }
  }

  /**
   * Add users invited via mail to the group's member list
   */
  addInvitedMember() {
    let listInvitedUser = [];
    listInvitedUser = this.helper.convertUserNameGroupOutSide(listInvitedUser, this.invitedUser);
    for (let i = 0; i < listInvitedUser.length; i++) {
      listInvitedUser[i].inviteFlg = true;
      const checkInMemberList = this.listMember.findIndex(item => item.officeUserId === listInvitedUser[i].officeUserId) > -1;
      const checkInTemporaryList = this.invitedUsersList.findIndex(item => item.officeUserId === listInvitedUser[i].officeUserId) > -1;
      const checkInListOutside = this.listOutside.findIndex(item => item.officeUserId === listInvitedUser[i].officeUserId) > -1;
      if (!checkInMemberList && !checkInTemporaryList && !checkInListOutside) {
        this.listMember.push(listInvitedUser[i]);
        this.invitedUsersList.push(listInvitedUser[i]);
      }
    }
    this.mailForm.get('mail').setValue('');
    this.invitedUser = [];
    this.formErrors.mail = '';
  }

  resetSearchMail() {
    this.mailForm.get('mail').setValue('');
    this.invitedUser = [];
    this.suggestedList = [];
    this.formErrors.mail = '';
  }

  /**
   * call api edit group
   * @api /api/dr/gr/outside/edit/save
   * @param listInfoUser
   */
  putEditOutsideGroup() {
    const resultCheckValidation = this.gr0002.checkValidate(this.editForm, this.formErrors,
      this.listMember, this.noneSelectedAdmin);
    this.formErrors.name = resultCheckValidation.msgError['name'];
    this.formErrors.member = resultCheckValidation.msgError['member'];
    if (this.formErrors.name === '' && this.formErrors.member === '' &&
      !resultCheckValidation.noneSelectedAdmin) {
      let html = '';
      this.translate.get('MSG.GR').subscribe((res) => {
        html = '<p>' + res.M008_1 + '</p>' + res.M008_2;
      });
      const dataSend = new CreateHospitalGroupSettingsSendApi();
      dataSend.groupName = this.editForm.get('name').value;
      dataSend.id = this.groupId;
      let userLoginIsMember = false;
      for (let i = 0; i < this.listMember.length; i++) {
        const mem = {};
        mem['officeUserId'] = this.listMember[i].officeUserId;
        mem['memberId'] = this.listMember[i].memberId ? this.listMember[i].memberId : '';
        mem['adminFlg'] = this.listMember[i].authority === 'ADMIN';
        mem['inviteFlg'] = this.listMember[i].inviteFlg;
        mem['officeId'] = this.listMember[i].officeId;
        dataSend.users.push(mem);
        if (mem['officeUserId'] === this.userSession.officeUserId) {
          userLoginIsMember = true;
        }
      }
      this.dialogService.showMessage('warning', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
        (res: DialogResult) => {
          setTimeout(() => {
            if (res.isOk()) {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(true);
              });
              if (this.imageFlag && this.appGroupIconSetResult) {
                this.firebaseStorage.uploader.groupIcon(this.groupId, this.userSession.officeUserId,
                  this.appGroupIconSetResult).subscribe(data => {
                  if (data.done) {
                    this.callPutApi(dataSend, userLoginIsMember);
                  }
                });
              } else {
                if (this.imageFlag && !this.appGroupIconSetResult && this.groupAvatar) {
                  this.firebaseStorage.ref(`group/${this.groupId}/icon.png`).delete();
                }
                this.callPutApi(dataSend, userLoginIsMember);
              }
            }
          });
        }
      );
    }
  }

  callPutApi(dataSend, userLoginIsMember) {
    this.groupService.putOutsideEditGroup(dataSend).subscribe((response: GroupOutsideSaveResult) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showSuccess('MSG.GR.M009').subscribe(
          (re: DialogResult) => {
            if (re.isOk()) {
              if (userLoginIsMember) {
                // redirect to group's timeline page
                this.route.navigate(['gr/gr0011', this.groupId]);
              } else {
                this.route.navigate(['/']);
              }
            }
          });
      },
      (error: HttpError) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.firebaseStorage.ref(`group/${this.groupId}/icon.png`).delete();
        this.dialogService.showError('MSG.ERROR');
      });
  }

  /**
   * call api delete group
   * @api /api/dr/gr/delete
   */
  putDeleteOutsideGroup() {
    let html = '';
    this.translate.get('MSG.GR').subscribe((res) => {
      html = '<p>' + res.M006_1 + '</p>' + res.M006_2;
    });
    this.dialogService.showMessage('warning', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
      (res: DialogResult) => {
        setTimeout(() => {
          if (res.isOk()) {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(true);
            });
            this.groupService.deleteGroup(this.groupId).subscribe((response: GroupOutsideSaveResult) => {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
              this.dialogService.showSuccess('MSG.GR.M007').subscribe(
                (result: any) => {
                  this.route.navigate(['/']);
                }
              );
            },
            (error: HttpError) => {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
              this.dialogService.showError('MSG.ERROR');
            });
          }
        }, 400);
      }
    );
  }
}
