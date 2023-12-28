import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {GroupService} from '../../../services/group.service';
import {CreateDepartmentGroupSettings} from '../../../models/gr/create-department-group-settings';
import {DepartmentUserSettings} from '../../../models/gr/department-user-settings';
import {Helper} from '../../../common/helper';
import {CreateDepartmentGroupSettingsSendApi} from '../../../models/gr/create-department-group-settings-send-api';
import {SharedValueService} from '../../../services/shared-value.service';
import {Router} from '@angular/router';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';
import {DialogResult} from '../../../models/dialog-param';
import {DialogService} from '../../../services/dialog.service';
import {AccountStatus} from '../../../models/ba/user-session';

@Component({
  selector: 'app-gr0003-page',
  templateUrl: './gr0003-page.component.html',
  styleUrls: ['./gr0003-page.component.scss'],
  preserveWhitespaces: false
})
export class Gr0003PageComponent implements OnInit {

  public createDepartModel = new CreateDepartmentGroupSettings();
  createGroupForm: FormGroup;
  listMember = [];
  listAdmin = [];
  listDepartment = [];
  formErrors = {
    'name': '',
    'member': '',
    'deptId': ''
  };
  selectedDepartmentId;
  userSession;
  imageFlag = false;
  appGroupIconSetResult: any;

  constructor(private translate: TranslateService,
              private fb: FormBuilder,
              private dialogService: DialogService,
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
    this.groupService.getCreateDepartmentGroup().subscribe(
      (settings: CreateDepartmentGroupSettings) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.createDepartModel = settings;
        this.createForm();
      }, (error) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        setTimeout(() => {
          this.dialogService.showError('MSG.ERROR');
        });
      });
  }

  groupIconSetChanged(event) {
    if (event) {
      this.imageFlag = true;
      this.appGroupIconSetResult = event;
    }
  }

  createForm() {
    this.createGroupForm = this.fb.group({
      'name': ['', Validators.compose([Validators.required, Validators.maxLength(17)])],
      'deptId': ''
    });
    let department;
    if (this.createDepartModel.departments[0].path.replace('/', '').trim() === '') {
      department = this.createDepartModel.departments[0].children;
    } else {
      department = this.createDepartModel.departments;
    }
    this.listDepartment = this.helper.createArrayDepartment(this.listDepartment, department, '', 1);
  }

  gotoCreateHospitalGr() {
    this.route.navigateByUrl('/gr/gr0002');
  }

  gotoHelp() {
    this.route.navigateByUrl('/he/he0008');
  }

  changeDepartment(dept) {
    if (dept.target.value === '') {
      this.listMember = [];
    } else {
      this.listMember = [];
      this.listAdmin = [];
      this.selectedDepartmentId = dept.target.value;
      this.groupService.getDepartmentUser(dept.target.value).subscribe(
        (res: DepartmentUserSettings[]) => {
          this.listMember = this.helper.convertUserName(this.listMember, res);
          this.listMember = this.listMember.filter(mem => this.getMemberStatus(mem));
          this.listMember.sort(this.helper.orderByComparator('fullNameKana'));
        },
        error => {
          this.dialogService.showError('MSG.ERROR');
        }
      );
    }
  }

  //  Show list of members whose status is valid and provisional
  getMemberStatus(user) {
    const accountStatus = new AccountStatus(user.accountStatus);
    return !accountStatus.isInvalid;
  }

  selectedDepartmentAdmin(mem) {
    if (mem) {
      mem.authority = mem.authority === 'MEMBER' ? 'ADMIN' : 'MEMBER';
    }
  }

  checkValidateDepartmentGroup(form, formErrors, listMember) {
    let checkSelectedMember = false;
    let noneSelectedAdmin = true;
    let formValid = true;
    if (!form) {
      return;
    } else {
      for (const field in formErrors) {
        formErrors[field] = '';
        if (form.get('deptId').value === '') {
          formErrors['deptId'] = this.translate.instant('VAL.NON_SELECTED_DEPT');
          formValid = false;
        }
        if (form.get('name').value.trim() === '' || form.get('name').value.length > 17) {
          formErrors['name'] = this.translate.instant('VAL.WRONG_FORMAT');
          formValid = false;
        }
        if (field === 'member') {
          checkSelectedMember = listMember.length !== 0;
          formErrors['member'] = listMember.length === 0 ? this.translate.instant('VAL.NON_SELECTED') : '';
        }
      }
    }
    if (listMember.length > 0) {
      for (let k = 0; k < listMember.length; k++) {
        if (listMember[k].authority === 'ADMIN') {
          noneSelectedAdmin = false;
          break;
        }
      }
      if (noneSelectedAdmin) {
        this.dialogService.showError('MSG.GR.M005');
      }
    }

    return {formErrors: formErrors, formValid : formValid, noneSelectedAdmin: noneSelectedAdmin, checkSelectedMember: checkSelectedMember};
  }

  postDepartmentGroup() {
    const results = this.checkValidateDepartmentGroup(this.createGroupForm, this.formErrors, this.listMember);
    this.formErrors = results.formErrors;
    if (results.formValid && !results.noneSelectedAdmin && results.checkSelectedMember) {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      const modelSendApi = new CreateDepartmentGroupSettingsSendApi();
      modelSendApi.groupName = this.createGroupForm.get('name').value;
      modelSendApi.imageFlg = this.imageFlag;
      modelSendApi.deptId = this.selectedDepartmentId;
      let userLoginIsMember = false;
      this.listMember.forEach(member => {
        const mem = {};
        mem['officeUserId'] = member.officeUserId;
        mem['adminFlg'] = member.authority === 'ADMIN';
        modelSendApi.users.push(mem);
        if (member.officeUserId === this.userSession.officeUserId) {
          userLoginIsMember = true;
        }
      });
      this.groupService.postCreateDepartmentGroup(modelSendApi).subscribe(
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
                    if (res.isOk() && userLoginIsMember) {
                      this.route.navigate(['gr/gr0011', response.groupId]);
                    } else {
                      this.route.navigate(['/']);
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
                if (res.isOk() && userLoginIsMember) {
                  this.route.navigate(['gr/gr0011', response.groupId]);
                } else {
                  this.route.navigate(['/']);
                }
              });
          }
        }, error => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showError('MSG.ERROR');
        }
      );
    }
  }
}
