import {Component, HostListener, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import { GroupService } from '../../../services/group.service';
import {PrepareCreateOutsideGroupSetting} from '../../../models/gr/prepare-create-outside-group-settings';
import {Helper} from '../../../common/helper';
import {CreateOutsideGroupSetting} from '../../../models/gr/create-outside-group-settings';
import {CreateOutsideGroupSettingSaveResult} from '../../../models/gr/create-outside-group-settings-save-result';
import {CreateHospitalGroupSettingsSendApi} from '../../../models/gr/create-hospital-group-settings-send-api';
import {SharedValueService} from '../../../services/shared-value.service';
import {Router} from '@angular/router';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';
import {Gr0002PageComponent} from '../gr0002-page/gr0002-page.component';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';
import {AccountStatus} from '../../../models/ba/user-session';

@Component({
  selector: 'app-gr0006-page',
  templateUrl: './gr0006-page.component.html',
  styleUrls: ['./gr0006-page.component.scss'],
  preserveWhitespaces: false
})
export class Gr0006PageComponent implements OnInit {

  model = new PrepareCreateOutsideGroupSetting();
  data = new CreateOutsideGroupSetting();
  formCreateGroup: FormGroup;
  mailForm: FormGroup;
  suggestedList = [];
  invitedList = [];

  // list inside
  listInside = [];
  originalInsideList = [];
  // list outside
  listOutSide = [];
  listOffices = [];
  // list member
  listMember = [];
  listSelectedMember = [];
  checkAllUserInside = false;
  checkAllUserOutside = false;
  noneSelectedAdmin = false;
  invitedUsersList = [];

  listDepartment = [];
  formErrors = {'name': '', 'member': '', 'mail': ''};
  userSession: any;
  imageFlag = false;
  appGroupIconSetResult: any;
  gr0002;

  constructor(private groupService: GroupService,
              private translate: TranslateService,
              private fb: FormBuilder,
              private dialogService: DialogService,
              public sharedValueService: SharedValueService,
              private route: Router,
              private firebaseStorage: FirebaseStorage,
              public helper: Helper) {
    this.gr0002 = new Gr0002PageComponent(this.translate, this.dialogService, this.fb, this.groupService,
      this.helper, this.sharedValueService, this.route, this.firebaseStorage);
  }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.groupService.getOutsideGroup().subscribe((settings: PrepareCreateOutsideGroupSetting) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.model = settings;
      this.getInit();
    }, error => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
    this.createFormOutsideGroup();
  }

  getInit() {
    this.listDepartment = this.helper.createArrayDepartment(this.listDepartment, this.model.departments, '', 1);
    this.listOffices = this.userSession.personalFlag ? this.model.offices :
      this.model.offices.filter(office => office.id !== this.userSession.officeId);
    // filter listInside & listOutside
    this.originalInsideList = this.model.officeUsers.filter(user => user.officeId === this.userSession.officeId);
    const users = this.helper.convertUserNameGroupOutSide([], this.model.officeUsers);
    this.listInside = users.filter(u => (u.officeId === this.userSession.officeId &&
      u.officeUserId !== this.userSession.officeUserId && this.getUserStatus(u)));
    this.listInside.sort(this.helper.orderByComparator('fullNameKana'));

    if (!this.userSession.personalFlag) {
      this.listOutSide = users.filter(u => u.officeId !== this.userSession.officeId && this.getUserStatus(u));
    } else {
      // if personalFlag = true then show all users
      this.listOutSide = users.filter(u => (u.officeUserId !== this.userSession.officeUserId &&
        new AccountStatus(u.accountStatus).isValid && !new AccountStatus(u.accountStatus).isLocking));
    }
    this.listOutSide.sort(this.helper.orderByComparator('fullNameKana'));
    // Add user login to the member list
    this.listMember = users.filter(u => u.officeUserId === this.userSession.officeUserId);
    this.listMember.forEach(item => {
      if (item.officeUserId === this.userSession.officeUserId) {
        item.authority = 'ADMIN';
        item.isSelected = false;
      }
    });

    for (let j = 0; j < this.listOutSide.length; j++) {
      this.listOutSide[j].inviteFlg = this.listOutSide[j].officeId !== this.userSession.officeId;
    }
  }

  //  Show list of users whose status is valid and provisional
  getUserStatus(user) {
    const accountStatus = new AccountStatus(user.accountStatus);
    return (accountStatus.isValid || accountStatus.isProvisional) && !accountStatus.isLocking && !accountStatus.isInvalid;
  }

  groupIconSetChanged(event) {
    if (event) {
      this.imageFlag = true;
      this.appGroupIconSetResult = event;
    }
  }


  /**
   * get user list by department
   * @param deptId
   */
  changeDepId(deptId) {
    this.checkAllUserInside = false;
    const result = this.gr0002.getDepartmentUserInHospitalGroup(deptId, this.originalInsideList, this.model.departments, this.listMember);
    this.listInside = result.listUser.sort(this.helper.orderByComparator('fullNameKana'));
    this.listInside.forEach(u => {
      u.inviteFlg = false;
      u.officeId = this.userSession.officeId;
    });
  }

  /**
   * @param value
   * @return outside list
   */
  changeOfficeId(value) {
    this.listOutSide = [];
    this.checkAllUserOutside = false;
    if (value === '') {
      if (this.userSession.personalFlag) {
        this.listOutSide = this.model.officeUsers.slice();
      } else {
        for (let k = 0; k < this.model.officeUsers.length; k++) {
          if (this.model.officeUsers[k].officeId !== this.userSession.officeId) {
            this.listOutSide.push(this.model.officeUsers[k]);
          }
        }
      }
    } else {
      for (let i = 0; i < this.model.officeUsers.length; i++) {
        if (this.model.officeUsers[i].officeId === value) {
          this.listOutSide.push(this.model.officeUsers[i]);
        }
      }
    }
    // filter users who have not been added to the member list
    this.listOutSide = this.listOutSide.filter((item) => this.listMember.findIndex(mem => mem.officeUserId === item.officeUserId) < 0 &&
      new AccountStatus(item.accountStatus).isValid && !new AccountStatus(item.accountStatus).isLocking);
    this.listOutSide = this.helper.convertUserNameGroupOutSide([], this.listOutSide);
    this.listOutSide.sort(this.helper.orderByComparator('fullNameKana'));
    if (value === '') {
      // add the list of invited users via mail to the display list
      if (this.invitedUsersList.length > 0) {
        for (let p = 0; p < this.invitedUsersList.length; p++) {
          if (this.listOutSide.findIndex(item => item.officeUserId === this.invitedUsersList[p].officeUserId) < 0 &&
            this.listMember.findIndex(mem => mem.officeUserId === this.invitedUsersList[p].officeUserId) < 0) {
            this.listOutSide.push(this.invitedUsersList[p]);
          }
        }
      }
    }
    for (let i = 0; i < this.listOutSide.length; i++) {
      this.listOutSide[i].inviteFlg = this.userSession.officeId !== this.listOutSide[i].officeId;
    }
  }

  /**
   * create and validate form create group, form find user by email
   */
  createFormOutsideGroup() {
    this.formCreateGroup = this.fb.group({
      'name': ['', [Validators.required, Validators.maxLength(17), Validators.pattern(Helper.checkSpace)]]
    });
    this.mailForm = this.fb.group({
      'mail': ['', Validators.required]
    });
  }

  selectedUser(user: any) {
    if (user) {
      user.isSelected = !user.isSelected;
    }
  }

  selectedMember(member: any) {
   if (member) {
     member.isSelected = !member.isSelected;
   }
  }

  /**
   * select all user in list inside or outside
   * @return lists user selected
   */
  changeCheckAll(checkAllUser, isOutside) {
    if (!isOutside) {
      const result = this.gr0002.changeCheckAllCommon(checkAllUser, this.listInside);
      this.checkAllUserInside = result.checkAllUser;
      this.listInside = result.listUser;
    } else if (isOutside) {
      const result = this.gr0002.changeCheckAllCommon(checkAllUser, this.listOutSide);
      this.checkAllUserOutside = result.checkAllUser;
      this.listOutSide = result.listUser;
    }
  };

  /**
   * select 1 or more users in inside list or outside list --> add to member list
   * @param isOutside
   */
  addMember(isOutside) {
    if (!isOutside) {
      for (let i = 0; i < this.listInside.length; i++) {
        if (this.listInside[i].isSelected) {
          this.listInside[i].isSelected = false;
          this.listMember.push(this.listInside[i]);
          this.listInside.splice(i, 1);
          i--;
        }
      }
      this.checkAllUserInside = false;
    } else if (isOutside) {
      for (let n = 0; n < this.listOutSide.length; n++) {
        if (this.listOutSide[n].isSelected) {
          this.listOutSide[n].isSelected = false;
          this.listMember.push(this.listOutSide[n]);
          this.listOutSide.splice(n, 1);
          n--;
        }
      }
      this.checkAllUserOutside = false;
    }
  }

  /**
   * remove member from member list
   */
  removeMember() {
    for (let i = 0; i < this.listMember.length; i++) {
      if (this.listMember[i].isSelected && this.listMember[i].officeUserId !== this.userSession.officeUserId) {
        this.listMember[i].isSelected = false;
        this.listMember[i].authority = 'MEMBER';
        if (!this.userSession.personalFlag) {
          if (this.listMember[i].inviteFlg) {
            this.listOutSide.push(this.listMember[i]);
          } else if (!this.listMember[i].inviteFlg) {
            this.listInside.push(this.listMember[i]);
          }
        } else {
          this.listOutSide.push(this.listMember[i]);
        }
        this.listMember.splice(i, 1);
        i--;
        }
    }
  }

  selectedHospitalAdmin(event, member) {
    if (member.officeUserId !== this.userSession.officeUserId) {
      member.authority = member.authority === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    } else {
      event.target.checked = true;
    }
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
   * @return invitedList
   */
  addInvitedMail(user) {
    this.mailForm.get('mail').setValue('');
    if (this.invitedList.findIndex(item => item.officeUserId === user.officeUserId) < 0) {
      this.invitedList.push(user);
    }
    this.suggestedList = [];
  }

  /**
   * remove user in invited users
   * @param user
   */
  removeDoctor(user: any) {
    if (user) {
      const index = this.invitedList.findIndex(item => item.officeUserId === user.officeUserId);
      if (index > -1) {
        this.invitedList.splice(index, 1);
      }
    }
  }

  /**
   * add users invited via mail to the group's member list
   */
  addInvitedMember() {
    let listInvitedUser = [];
    listInvitedUser = this.helper.convertUserNameGroupOutSide(listInvitedUser, this.invitedList);
    for (let i = 0; i < listInvitedUser.length; i++) {
      listInvitedUser[i].inviteFlg = true;
      const checkInMemberList = this.listMember.findIndex(item => item.officeUserId === listInvitedUser[i].officeUserId) > -1;
      const checkInTemporaryList = this.invitedUsersList.findIndex(item => item.officeUserId === listInvitedUser[i].officeUserId) > -1;
      const checkInListOutside = this.listOutSide.findIndex(item => item.officeUserId === listInvitedUser[i].officeUserId) > -1;
      if (!checkInMemberList && !checkInTemporaryList && !checkInListOutside) {
        this.listMember.push(listInvitedUser[i]);
        this.invitedUsersList.push(listInvitedUser[i]);
      }
    }
    this.mailForm.get('mail').setValue('');
    this.invitedList = [];
    this.formErrors.mail = '';
  }

  resetSearchMail() {
    this.mailForm.get('mail').setValue('');
    this.invitedList = [];
    this.suggestedList = [];
    this.formErrors.mail = '';
  }

  /**
   * call api create group
   * @api /api/dr/gr/outside/create/save
   * @return groupId
   */
  putCreateOutsideGroup() {
    const resultCheckValidation = this.gr0002.checkValidate(this.formCreateGroup, this.formErrors,
      this.listMember, this.noneSelectedAdmin);
    this.formErrors.name = resultCheckValidation.msgError['name'];
    this.formErrors.member = resultCheckValidation.msgError['member'];
    if (this.formErrors.name === '' && this.formErrors.member === '' &&
      !resultCheckValidation.noneSelectedAdmin) {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      const dataSend = new CreateHospitalGroupSettingsSendApi();
      dataSend.groupName = this.formCreateGroup.get('name').value;
      dataSend.imageFlg = this.imageFlag;
      for (let i = 0; i < this.listMember.length; i++) {
        const mem = {};
        mem['officeUserId'] = this.listMember[i].officeUserId;
        mem['officeId'] = this.listMember[i].officeId;
        mem['adminFlg'] = this.listMember[i].authority === 'ADMIN';
        mem['inviteFlg'] = this.listMember[i].inviteFlg;
        dataSend.users.push(mem);
      }
      this.groupService.putOutsideGroup(dataSend).subscribe((response: CreateOutsideGroupSettingSaveResult) => {
        if (this.imageFlag) {
          this.firebaseStorage.uploader.groupIcon(response.groupId, this.userSession.officeUserId,
            this.appGroupIconSetResult).subscribe(data => {
            if (data.done) {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
              this.dialogService.showMessage('success', false, null, 'MSG.GR.M001', null,
                'MSG.YES', null).subscribe(
                (res: DialogResult) => {
                  if (res.isOk()) {
                    this.route.navigate(['gr/gr0011', response.groupId]);
                  }
                });
            }
          });
        } else {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showMessage('success', false, null, 'MSG.GR.M001', null,
            'MSG.YES', null).subscribe(
            (res: DialogResult) => {
              if (res.isOk()) {
                this.route.navigate(['gr/gr0011', response.groupId]);
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
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     this.putCreateOutsideGroup();
  //   }
  // }
}
