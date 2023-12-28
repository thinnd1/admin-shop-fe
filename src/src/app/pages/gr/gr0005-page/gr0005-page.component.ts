import {Component, OnInit, HostListener} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {GroupService} from '../../../services/group.service';
import {SharedValueService} from '../../../services/shared-value.service';
import {Helper} from '../../../common/helper';
import {EditDepartmentGroupSettings} from '../../../models/gr/edit-department-group-settings';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Gr0003PageComponent} from '../gr0003-page/gr0003-page.component';
import {Gr0004PageComponent} from '../gr0004-page/gr0004-page.component';
import {EditDepartmentGroupSettingsSendApi} from '../../../models/gr/edit-department-group-settings-send-api';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';
import {AccountStatus} from '../../../models/ba/user-session';

@Component({
  selector: 'app-gr0005-page',
  templateUrl: './gr0005-page.component.html',
  styleUrls: ['./gr0005-page.component.scss'],
  preserveWhitespaces: false
})
export class Gr0005PageComponent implements OnInit {

  public editDepartmentModel = new EditDepartmentGroupSettings();
  editInfoForm: FormGroup;
  gr0003;
  gr0004;
  groupId = '';
  listMember = [];
  listDepartment = [];
  formErrors = {
    'name': '',
    'deptId': ''
  };
  userSession;
  department;
  imageFlag = false;
  appGroupIconSetResult: any;
  groupAvatar: string;

  constructor(private translate: TranslateService,
              private fb: FormBuilder,
              private dialogService: DialogService,
              private groupService: GroupService,
              private helper: Helper,
              private sharedValueService: SharedValueService,
              private activatedRoute: ActivatedRoute,
              private route: Router,
              private firebaseStorage: FirebaseStorage) {
    this.editInfoForm = this.fb.group({
      'name': ['', Validators.compose([Validators.required, Validators.maxLength(17)])],
      'deptId': ['', Validators.required]
    });
    this.gr0003 = new Gr0003PageComponent(this.translate, this.fb, this.dialogService, this.groupService,
      this.helper, this.sharedValueService, null, this.firebaseStorage);
    this.gr0004 = new Gr0004PageComponent(this.translate, this.dialogService, this.fb, this.groupService, this.helper,
      this.sharedValueService, this.activatedRoute, this.route, this.firebaseStorage);
  }


  ngOnInit() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.userSession = this.sharedValueService.fetchUserSession();
    this.activatedRoute.params.subscribe((params: Params) => {
      this.groupId = params['groupId'];
    });
    if (this.groupId) {
      this.groupService.getEditDepartmentGroup(this.groupId).subscribe(
        (settings) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.firebaseStorage.groupIcon(this.groupId, true).subscribe(icon => {
            this.groupAvatar = icon;
          });
          this.editDepartmentModel = settings;
          this.createForm();
        },
        error => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showError('MSG.ERROR');
        }
      );
    } else {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
    }
  }

  createForm() {
    this.editInfoForm = this.fb.group({
      'name': [this.editDepartmentModel.name,
        Validators.compose([Validators.required, Validators.maxLength(17)])],
      'deptId': (this.editDepartmentModel.deptName.length > 60) ? (this.editDepartmentModel.deptName.substr(0, 60)) :
        this.editDepartmentModel.deptName
    });
    this.listMember = this.helper.convertUserName(this.listMember, this.editDepartmentModel.users);
    this.listMember = this.listMember.filter(mem => this.getMemberStatus(mem));
    this.listMember.sort(this.helper.orderByComparator('fullNameKana'));
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

  editSelectedDepartmentAdmin(mem) {
    if (mem) {
      mem.authority = mem.authority === 'MEMBER' ? 'ADMIN' : 'MEMBER';
    }
  }

  deleteDepartmentGroup(groupId: string) {
    this.gr0004.deleteHospitalGroup(groupId);
  }

  putEditDepartmentGroupForm() {
    const resultCheckValidation =
      this.gr0003.checkValidateDepartmentGroup(this.editInfoForm, this.formErrors, this.listMember);
    this.formErrors = resultCheckValidation.formErrors;
    if (this.editInfoForm.valid && !resultCheckValidation.noneSelectedAdmin) {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      const modelSendApi = new EditDepartmentGroupSettingsSendApi();
      modelSendApi.groupName = this.editInfoForm.get('name').value;
      modelSendApi.id = this.editDepartmentModel.id;
      modelSendApi.imageFlg = this.imageFlag;
      this.listMember.forEach(member => {
        const mem = {};
        mem['memberId'] = member.memberId;
        mem['officeUserId'] = member.officeUserId;
        mem['adminFlg'] = member.authority === 'ADMIN';
        modelSendApi.users.push(mem);
      });
      if (this.imageFlag && this.appGroupIconSetResult) {
        this.firebaseStorage.uploader.groupIcon(this.groupId, this.userSession.officeUserId,
          this.appGroupIconSetResult).subscribe(data => {
          if (data.done) {
            this.callPutApi(modelSendApi);
          }
        });
      } else {
        if (this.imageFlag && !this.appGroupIconSetResult && this.groupAvatar) {
          this.firebaseStorage.ref(`group/${this.groupId}/icon.png`).delete();
        }
        this.callPutApi(modelSendApi);
      }
    }
  }

  callPutApi(modelSendApi) {
    this.groupService.putEditDepartmentGroup(modelSendApi).subscribe(
      (response) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showMessage('success', false, null, 'MSG.GR.M009', null, 'MSG.YES', null).subscribe(
          (res: DialogResult) => {
            if (res.isOk()) {
              // redirect to group's timeline page
              this.route.navigate(['gr/gr0011', this.groupId]);
            }
          }
        );
      }, error => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     this.putEditDepartmentGroupForm();
  //   }
  // }
}
