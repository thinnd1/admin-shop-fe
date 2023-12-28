import {Component, HostListener, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {CreateHospitalGroupSettings} from '../../../models/gr/create-hospital-group-settings';
import {GroupService} from '../../../services/group.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Helper} from '../../../common/helper';
import {CreateHospitalGroupSettingsSendApi} from '../../../models/gr/create-hospital-group-settings-send-api';
import {SharedValueService} from '../../../services/shared-value.service';
import {Router} from '@angular/router';
import {HttpError} from '../../../common/error/http.error';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';
import {AccountStatus} from '../../../models/ba/user-session';

@Component({
  selector: 'app-gr0002-page',
  templateUrl: './gr0002-page.component.html',
  styleUrls: ['./gr0002-page.component.scss'],
  preserveWhitespaces: false
})
export class Gr0002PageComponent implements OnInit {
  public model = new CreateHospitalGroupSettings();
  listUser = [];
  listDepartment = [];
  createGroupForm: FormGroup;
  checkAllUser = false;
  listMember = [];
  messError = {name: '', member: ''};
  userSession;
  imageFlag = false;
  appGroupIconSetResult: any;

  constructor(private translate: TranslateService,
              private dialogService: DialogService,
              private fb: FormBuilder,
              private groupService: GroupService,
              private helper: Helper,
              private sharedValueService: SharedValueService,
              private route: Router,
              private firebaseStorage: FirebaseStorage) {
    this.createGroupForm = this.fb.group({
      'name': ['', Validators.compose([Validators.required, Validators.maxLength(17)])],
      'deptId': ''
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.userSession = this.sharedValueService.getUserSession();
    this.groupService.getCreateHospitalGroup().subscribe(
      (settings: CreateHospitalGroupSettings) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.model = settings;
        this.createForm();
      },
      (error: HttpError) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        if (error.contains('COMMON.SAVE_FAILED')) {
          this.dialogService.showError('VAL.NOT_PERMISSION');
        } else {
          this.dialogService.showError('MSG.ERROR');
        }
      }
    );
  }


  createForm() {
    let users = [];
    this.createGroupForm = this.fb.group({
      'name': ['', Validators.compose([Validators.required, Validators.maxLength(17)])],
      'deptId': ''
    });
    this.listDepartment = this.helper.createArrayDepartment(this.listDepartment, this.model.departments, '', 1);
    users = this.helper.convertUserName(this.listUser, this.model.departmentUsers);
    this.listUser = users.filter(item =>  (item.officeUserId !== this.userSession.officeUserId) && this.getUserStatus(item));
    this.listUser.sort(this.helper.orderByComparator('fullNameKana'));
    this.listMember = users.filter(item => item.officeUserId === this.userSession.officeUserId);
    this.listMember.forEach(item => {
      if (item.officeUserId === this.userSession.officeUserId) {
        item.authority = 'ADMIN';
        item.isSelected = false;
      }
    });
  }

  //  Show list of users whose status is valid and provisional
  getUserStatus(user) {
    const accountStatus = new AccountStatus(user.accountStatus);
    return (accountStatus.isValid || accountStatus.isProvisional) && !accountStatus.isLocking && !accountStatus.isInvalid;
  }

  gotoCreateDeptGroup() {
    this.route.navigateByUrl('/gr/gr0003');
  }

  groupIconSetChanged(event) {
    if (event) {
      this.imageFlag = true;
      this.appGroupIconSetResult = event;
    }
  }

  gotoHelp() {
    this.route.navigateByUrl('/he/he0008');
  }

  selectedHospitalAdmin(event, member) {
    if (member.officeUserId !== this.userSession.officeUserId) {
      member.authority = member.authority === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    } else {
      event.target.checked = true;
    }
  }

  /**
   *
   * @param deptId
   * @param userInfoModel
   * @param listMember
   * @returns {{listUser: Array}
   */
  getDepartmentUserInHospitalGroup(deptId, userInfoModel, departmentListModel, listMember) {
    // get the department id list & its children id
    const departmentIdList = this.helper.getDepartmentIdList(new Array(), departmentListModel);
    let listUser: any[];
    let listConvertedUser = [];
    if (deptId === '') {
      listConvertedUser = this.helper.convertUserName(listConvertedUser, userInfoModel);
    } else {
      const deptIdList = departmentIdList.find(value => value.id === deptId);
      listUser = this.getUserList(userInfoModel, deptIdList);
      listConvertedUser = this.helper.convertUserName(listConvertedUser, listUser);
    }
    // filter selected users
    for (let i = 0; i < listMember.length; i++) {
      listConvertedUser = listConvertedUser.filter((item) => item.officeUserId !== listMember[i].officeUserId &&
        new AccountStatus(item.accountStatus).isValid && !new AccountStatus(item.accountStatus).isLocking);
    }
    return {'listUser': listConvertedUser};
  }

  /**
   * Retrieving the userList of selected department and userList of its child departments
   * @param {any[]} listUser
   * @param departId
   */
  getUserList(listUser: any[], departId: any): any[] {
    let users = [];
    if (departId && listUser) {
      for (let i = 0; i < listUser.length; i++) {
        if (listUser[i].deptId === departId.id) {
          users.push(listUser[i]);
        }
      }
      if (departId.childIds.length > 0) {
        departId.childIds.forEach(child => {
          const arr = listUser.filter(user => user.deptId === child);
          users = users.concat(arr);
        });
      }
    }
    return this.helper.arrayUnique(users);
  }

  grChangeDepartment(dept) {
    this.checkAllUser = false;
    const result = this.getDepartmentUserInHospitalGroup(dept, this.model.departmentUsers, this.model.departments, this.listMember);
    this.listUser = result.listUser.sort(this.helper.orderByComparator('fullNameKana'));
  }

  selectedUser(user) {
    if (user) {
      user.isSelected = !user.isSelected;
    }
  }

  selectedMember(member) {
    if (member) {
      member.isSelected = ! member.isSelected;
    }
  }

  changeCheckAllCommon(checkAllUser, listUser) {
    checkAllUser = !checkAllUser;
    for (let i = 0; i < listUser.length; i++) {
      listUser[i].isSelected = !!(checkAllUser && listUser[i].isShow);
    }
    return {
      checkAllUser: checkAllUser,
      listUser: listUser,
    };
  }

  changeCheckAll(checkAllUser) {
    const result = this.changeCheckAllCommon(checkAllUser, this.listUser);
    this.checkAllUser = result.checkAllUser;
    this.listUser = result.listUser;
  };

  addMember() {
    for (let i = 0; i < this.listUser.length; i++) {
      if (this.listUser[i].isSelected) {
        this.listUser[i].isSelected = false;
        this.listMember.push(this.listUser[i]);
        this.listUser.splice(i, 1);
        i--;
      }
    }
    console.log(this.listUser)
    console.log(this.listMember)
    this.checkAllUser = false;
  }

  removeMember() {
    for (let i = 0; i < this.listMember.length; i++) {
      if (this.listMember[i].isSelected && this.listMember[i].officeUserId !== this.userSession.officeUserId) {
        this.listUser.push(this.listMember[i]);
        this.listMember[i].isSelected = false;
        this.listMember[i].authority = 'MEMBER';
        this.listMember.splice(i, 1);
        i--;
      }
    }
  }

  checkValidate(form: FormGroup, errors, listMember) {
    if (!form) {
      return;
    } else {
      let noneSelectedAdmin = true;
      const control = form.get('name');
      if (control && (control.invalid || control.value.trim() === '')) {
        errors['name'] = this.translate.instant('VAL.WRONG_FORMAT');
      } else {
        errors['name'] = '';
      }
      if (listMember.length > 0) {
        errors['member'] = '';
        for (let i = 0; i < listMember.length; i++) {
          if (listMember[i].authority === 'ADMIN') {
            noneSelectedAdmin = false;
            break;
          }
        }
        if (noneSelectedAdmin) {
          this.dialogService.showError('MSG.GR.M005');
        }
      } else {
        errors['member'] = this.translate.instant('VAL.NON_SELECTED');
      }
      return {'msgError': errors, 'noneSelectedAdmin': noneSelectedAdmin};
    }
  }

  createInsideGroup() {
    const resultCheckValidation = this.checkValidate(this.createGroupForm, this.messError,
      this.listMember);
    this.messError.name = resultCheckValidation.msgError['name'];
    this.messError.member = resultCheckValidation.msgError['member'];
    if (this.messError.name === '' && this.messError.member === '' &&
      !resultCheckValidation.noneSelectedAdmin) {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      const modelSendApi = new CreateHospitalGroupSettingsSendApi();
      modelSendApi.groupName = this.createGroupForm.get('name').value;
      modelSendApi.imageFlg = this.imageFlag;
      this.listMember.forEach(member => {
        const mem = {};
        mem['officeUserId'] = member.officeUserId;
        mem['adminFlg'] = member.authority === 'ADMIN';
        modelSendApi.users.push(mem);
      });
      this.groupService.postCreateHospitalGroup(modelSendApi).subscribe(
        (response) => {
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
        }, error => {
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
  //     this.createInsideGroup();
  //   }
  // }
}
