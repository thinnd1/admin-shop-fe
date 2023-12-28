import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {DialogService} from '../../../services/dialog.service';
import {SharedValueService} from '../../../services/shared-value.service';
import {PharmacyService} from '../../../services/pharmacy.service';
import {CreatePharmacyGroupPrepare} from '../../../models/ph/create-pharmacy-group-prepare';
import {User} from '../../../models/ph/user';
import {Department} from '../../../models/ph/department';
import {CreatePharmacyGroupSettingsSendApi} from '../../../models/ph/create-pharmacy-group-settings-send-api';
import {HttpError} from '../../../common/error/http.error';
import {AccountStatus} from '../../../models/ba/user-session';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Helper} from '../../../common/helper';
import {DialogParams} from '../../../models/dialog-param';
import {ModalInvitePharmacyStaffComponent} from '../../../components/modal-invite-pharmacy-staff/modal-invite-pharmacy-staff.component';


@Component({
  selector: 'app-ph0001-page',
  templateUrl: './ph0001-page.component.html',
  styleUrls: ['./ph0001-page.component.scss']
})
export class Ph0001PageComponent implements OnInit {
  public prepare = new CreatePharmacyGroupPrepare();
  userSession;
  listDepartment = [];            // List departments of hospital
  listUser = [];                  // List users of hospital who are not member of group
  listMember = [];                // List users of hospital who are member of group
  checkAllUser = false;           // Indicate checkbox select all user is checked or not
  listKnownPharmacyStaff = [];    // List of pharmacy users who used to be in group
  listInvitedPharmacyStaff = [];  // List of pharmacy users who are member of group
  messError = {listMember: ''};
  public authority = {};
  params: DialogParams;
  mailForm: FormGroup;
  formErrors = {'email': ''};
  foundPharmacyStaff: User;
  inviteList: User[];

  constructor(private dialogService: DialogService,
              private sharedValueService: SharedValueService,
              private pharmacyService: PharmacyService,
              private helper: Helper,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    this.pharmacyService.getCreatePharmacyGroupPrepare().subscribe(
      (data: CreatePharmacyGroupPrepare) => {
        this.dialogService.setLoaderVisible(false);
        this.prepare = data;
        this.createForm();
      },
      (error: HttpError) => {
        this.dialogService.setLoaderVisible(false);
        if (error.contains('COMMON.SAVE_FAILED')) {
          this.dialogService.showError('VAL.NOT_PERMISSION');
        } else {
          this.dialogService.showError('MSG.ERROR');
        }
      }
    );
    this.authority = {
      managementAuthority: 'MP_1',
      deptId: this.userSession.deptId,
      objAll: {
        displayName: 'すべて',
        id: '',
        level: 1,
        name: 'すべて',
        save: true,
        text: 'すべて',
      },
      obj: null
    };
    this.inviteList = [];
    this.createMailForm();
  }

  createForm() {
    this.listDepartment = this.helper.createArrayDepartment(this.listDepartment, this.prepare.staffs.departments, '', 1);
    const members = this.prepare.memberMedicals.filter(user => !user.deleteFlag);
    this.listMember = this.helper.convertUserName([], members);
    this.listUser = this.getUserList(this.listMember);
    this.listMember.sort(this.helper.orderByComparator('fullNameKana'));
    this.listInvitedPharmacyStaff = this.setAttribute(this.prepare.memberDrugStores.filter(user => !user.deleteFlag));
    this.listInvitedPharmacyStaff.sort(this.helper.orderByComparator('fullNameKana'));
    this.listKnownPharmacyStaff = this.setAttribute(this.prepare.memberDrugStores.filter(user => user.deleteFlag));
    for (let i = 0; i < this.listKnownPharmacyStaff.length; i++ ) {
      if (this.listKnownPharmacyStaff[i].deleteFlag === true) {
            this.listKnownPharmacyStaff[i].accepted = false;
      }
    }
    this.listKnownPharmacyStaff.sort(this.helper.orderByComparator('fullNameKana'));
  }

  setAttribute(arr) {
    for (let i = 0; i < arr.length; i++) {
      arr[i]['fullName'] = arr[i].lastName + ' ' + arr[i].firstName;
      arr[i]['fullNameKana'] = arr[i].lastNameKana + ' ' + arr[i].firstNameKana;
    }
    return arr;
  }

  grChangeDepartment(dept) {
    this.checkAllUser = false;
    this.listUser = this.getDepartmentUserInHospitalGroup(dept);
  }

  getDepartmentUserInHospitalGroup(dept) {
    // get the department id list & its children id
    const listCurrentUser = this.getUserList(this.listMember);
    const departmentIdList = dept.department.children;
    departmentIdList.push(dept.departmentId);

    let result = [];
    if (dept.departmentId !== '') {
      for (let i = 0; i < listCurrentUser.length; i++) {
        if (departmentIdList.indexOf(listCurrentUser[i].deptId) > -1) {
          result.push(listCurrentUser[i]);
        }
      }
    } else {
      result = listCurrentUser;
    }
    // filter selected users
    let listConvertedUser = result.filter((item) => new AccountStatus(item.accountStatus).isValid && !new AccountStatus(item.accountStatus).isLocking);

    return listConvertedUser;
  }

  getUserList(memberList) {
    const users = this.helper.convertUserName([], this.prepare.staffs.departmentUsers);
    const allUser = [];
    for (const user of users) {
      if (new AccountStatus(user.accountStatus).isValid && !new AccountStatus(user.accountStatus).isLocking) {
        const selectedUser = memberList.filter((item) => {
          return user.officeUserId === item.officeUserId;
        });
        if (selectedUser.length <= 0) {
          allUser.push(user);
        }
      }
    }
    allUser.sort(this.helper.orderByComparator('fullNameKana'));
    return allUser;
  }

  toogleSelectAllUser(event: any) {
    const checked = event.target.checked;
    this.listUser.forEach(function (user, index, arr) {
      arr[index].isSelected = !!(checked && arr[index].isShow);
    });
    this.checkAllUser = checked;
  }

  addMember() {
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

  removeMember() {
    for (let i = 0; i < this.listMember.length; i++) {
      if (this.listMember[i].isSelected && !this.listMember[i].adminFlag) {
        this.listMember[i].isSelected = false;
        this.listMember[i].adminFlag = false;
        this.listUser.push(this.listMember[i]);
        this.listMember.splice(i, 1);
        i--;
      }
    }
  }

  appendListInvitedPharmacyStaff() {
    let staffs = [];
    staffs = this.helper.convertUserNameGroupOutSide(staffs, this.inviteList);
    for (let i = 0; i < staffs.length; i++) {
      const staffId = staffs[i].officeUserId;
      for (let j = 0; j < this.listKnownPharmacyStaff.length; j++) {
        if (staffId === this.listKnownPharmacyStaff[j].officeUserId) {
          this.listKnownPharmacyStaff.splice(j, 1);
        }
      }
      const existed = this.listInvitedPharmacyStaff.filter((item) => {
        return item.officeUserId === staffId;
      });
      if (existed.length === 0) {
        // if not already existed in the list then append staff to list
        this.listInvitedPharmacyStaff.push(staffs[i]);
      }
      this.inviteList = [];
      this.formErrors.email = '';
      this.mailForm.get('email').setValue('');
      }

    // this.listInvitedPharmacyStaff.sort(this.helper.orderByComparator('fullNameKana'));
  }
  resetSearchMail() {
    this.inviteList = [];
    this.formErrors.email = '';
    this.mailForm.get('email').setValue('');
  }

  toogleSelectAllKnownStaff(event: any) {
    const checked = event.target.checked;
    this.listKnownPharmacyStaff.forEach(function (staff, index, arr) {
      arr[index].isSelected = !!(checked && arr[index].isShow);
    });
  }

  toogleSelect(user: any) {
    user.isSelected = !user.isSelected;
  }
  selectedAdmin(event, member) {
    event.target.checked = member.adminFlag;
  }
  /**
   * Move selected items from source to destination
   *
   * @param  {any[]} source
   * @param  {any[]} dest
   * @param  {} callback? function will be apply with every selected items
   * @returns void
   *
   * @author Hung Nguyen <hungnq@ominext.com>
   */
  moveList(source: any[], dest: any[], callback?): void {
    for (let i = 0; i < source.length; i++) {
      if (source[i].isSelected) {
        source[i].isSelected = false;
        if (callback) {
          source[i] = callback(source[i]);
        }
        dest.push(source[i]);
        source.splice(i, 1);
        i--;
      }
    }
  }

  invitePharmacyStaff() {
    this.moveList(this.listKnownPharmacyStaff, this.listInvitedPharmacyStaff);
  }

  unInvitePharmacyStaff() {
    this.moveList(this.listInvitedPharmacyStaff, this.listKnownPharmacyStaff);
  }

  createPharmacyGroup() {
    if (this.formIsValid()) {
      this.dialogService.setLoaderVisible(true);
      const modelSendApi = new CreatePharmacyGroupSettingsSendApi(this.listMember, this.listInvitedPharmacyStaff);
      this.pharmacyService.postCreatePharmacyGroup(modelSendApi)
        .subscribe((response) => {
          this.dialogService.setLoaderVisible(false);
          this.dialogService.showMessage('success', false, null, 'PH0001.SAVED_SUCCESS', null,
            'MSG.OK', null);
          this.ngOnInit();
        }, (error) => {
          this.dialogService.setLoaderVisible(false);
          this.dialogService.showError('MSG.ERROR');
        });
    }
  }

  formIsValid() {
    let isValid = true;

    if (this.listMember.length === 0) {
      this.messError['listMember'] = 'VAL.NON_SELECTED';
      isValid = false;
    } else {
      this.messError['listMember'] = '';
    }
    return isValid;
  }

  createMailForm() {
    this.mailForm = this.fb.group({
      email: ''
    });
  }

  searchPharmacyStaff() {
    this.foundPharmacyStaff = null;
    if (this.formIsValidMail()) {
      this.pharmacyService.searchPharmacyMember(this.mailForm.get('email').value)
        .subscribe((data: User) => {
          this.foundPharmacyStaff = data;
        });
    }
  }

  formIsValidMail() {
    let isValid = true;
    if (!this.mailForm.get('email').value || this.mailForm.get('email').value.trim() === '') {
      isValid = false;
      this.formErrors['email'] = 'GR0006.PLACEHOLDER_MAIL_INPUT';
    } else {
      this.formErrors['email'] = '';
    }

    return isValid;
  }

  isAlreadyAdded(pharmacyStaff: User) {
    return this.inviteList.map(function (s) {
      return s.officeUserId;
    }).indexOf(pharmacyStaff.officeUserId) >= 0;
  }

  addToInviteList(pharmacyStaff: User) {
    if (!this.isAlreadyAdded(pharmacyStaff)) {
      this.inviteList.push(pharmacyStaff);
    }
    this.mailForm.reset();
    this.foundPharmacyStaff = null;
  }

  removeFromInviteList(i) {
    this.inviteList.splice(i, 1);
  }
}
