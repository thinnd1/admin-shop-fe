import {
  AfterViewInit, Component, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Angular2Csv } from 'angular2-csv/Angular2-csv';
import { TranslateService } from '@ngx-translate/core';
import {Helper} from '../../../common/helper';
import { RegistrationService } from '../../../services/registration.service';
import { StaffInvite } from '../../../models/re/staff-invite';
import { StaffInviteSettings } from '../../../models/re/staff-invite-settings';
import { SharedValueService } from '../../../services/shared-value.service';
import { StaffInvitePageValidator } from './staff-invite-page.validator';
import { Validator } from '../../../common/validation/validator';
import { DepartmentSettings } from '../../../models/re/department-settings';
import { HttpError } from '../../../common/error/http.error';
import { DepartmentSelectComponent } from '../../../components/department-select/department-select.component';
import {DialogResult} from '../../../models/dialog-param';
import {MasterService} from '../../../services/master.service';
import {JobType} from '../../../models/ma/job-type';
import {DialogService} from '../../../services/dialog.service';
import { saveAs } from 'file-saver/FileSaver';
import { VirtualScrollComponent } from 'angular2-virtual-scroll';
import {Subscription} from 'rxjs/Subscription';
import {ManagementAuthority} from '../../../models/ba/user-session';

declare const XLSX: any;
declare const moment: any;
declare const $: any;
@Component({
  selector: 'app-staff-invite-page',
  templateUrl: './staff-invite-page.component.html',
  styleUrls: ['./staff-invite-page.component.scss'],
  providers: [StaffInvitePageValidator, Validator, DepartmentSelectComponent],
  preserveWhitespaces: false
})
export class StaffInvitePageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(VirtualScrollComponent)
  private virtualScroll: VirtualScrollComponent;

  public managementAuthority = ManagementAuthority;
  public indexTab = 0;
  public users: any;
  public cbChecked: string[] = [];
  public selectedAll: any;
  // Params
  public pageDefault = '0';
  public sortDefault = '-lastName';
  public department = '';
  public name = '';
  public scrollOptions = {
    page: '0',
    size: '20',
    sort: '-lastName'
  };
  // model
  public staffBulks = new StaffInviteSettings;

  // Data when Scroll
  public dataScroll: any;
  public title: string;
  public descriptionsMail: string;
  public titleMail: string;
  public originTitleMail: string;
  public pdepartment = '';
  public listUserMail = [];
  public listUserMailFail = [];

  public modelGroupForm: FormGroup;
  public authorityTwo: any;
  public authority: any;
  public userSession;

  public mailAddressPublishingType;
  public listEmailRegisterFail = [];
  public listEmailRegisterSuccess = [];

  // virtual scroll Input
  public listStaff = [];
  public departmentList = [];
  public listJobType = [];
  public listManagementAuthority = [];
  public listFuncAuthoritySet = [];
  public countSubmit = 0;
  public startScrollPos = 0;
  public endScrollPos = 0;
  public focusOnAnItem: number;

  public flagScroll: boolean;
  public translateCsv: any;
  public re0015Translate: any;
  public departmentSearch;

  public timerSubscription: Subscription;

  constructor(private translate: TranslateService,
              private registrationService: RegistrationService,
              private dialogService: DialogService,
              private sharedValueService: SharedValueService,
              private helper: Helper,
              private validation: StaffInvitePageValidator,
              private masterService: MasterService) {
    this.userSession = this.sharedValueService.getUserSession();
    this.authority = {
      managementAuthority: this.userSession.managementAuthority,
      deptId: this.userSession.deptId,
      deptName: this.userSession.deptName,
      objAll: {
        displayName: this.translate.instant('COMMON_LABEL.ALL'),
        id: '',
        level: 1,
        name: '',
        save: true,
        text: this.translate.instant('COMMON_LABEL.DEFAULT_SELECT'),
      },
      obj: {
        displayName: this.translate.instant('COMMON_LABEL.ALL'),
        id: '',
        level: 1,
        name: '',
        save: true,
        text: this.translate.instant('COMMON_LABEL.DEFAULT_SELECT'),
      }
    };
    this.authorityTwo = {
      managementAuthority: this.userSession.managementAuthority,
      deptId: this.userSession.deptId,
      deptName: this.userSession.deptName,
      objAll: {
        displayName: this.translate.instant('COMMON_LABEL.ALL'),
        id: '',
        level: 1,
        name: '',
        save: true,
        text: this.translate.instant('COMMON_LABEL.ALL'),
      },
      obj: null
    };
    this.addStaff([this._newStaff]);
    this.translate.get(['AUTHORITY.ADMIN_AUTHORITY', 'AUTHORITY.FUNCTION_AUTHORITY']).subscribe(res => {
      this.translateCsv = res;
    });
    this.registrationService.getDepartmentSettings().subscribe((departmentSettings: DepartmentSettings[]) => {
        this.departmentList = this.helper.createArrayDepartmentAuthority([], departmentSettings, '', 1, this.authority.managementAuthority,
        this.authority.deptId, this.authority.objAll, this.authority.obj, this.authority.deptName);
        if (this.userSession.managementAuthority === this.managementAuthority.MP_1) {
          this.departmentSearch = JSON.parse(JSON.stringify(this.departmentList));
        }else {
          this.departmentSearch = JSON.parse(JSON.stringify(this.departmentList)).splice(0, 1);
        }
      }
    );
  }

  private _unsubscription(subscription) {
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
    }
  }

  private get _newStaff() {
    return new StaffInvite('', '', '', '', { id: '', name: '', displayName: '', children: [] }, '', '', '', '');
  }

  ngOnInit() {
    this.flagScroll = true;
    this.virtualScroll.scrollAnimationTime = 0;
    this.userSession.managementAuthority === this.managementAuthority.MP_1 ? (this.pdepartment = '') : (this.pdepartment = this.userSession.deptId);
    this.registrationService.getStaffListDetail(this.userSession.userId).subscribe((res) => {
      this.mailAddressPublishingType = res.mailAddressPublishingType;
    }, (error: HttpError) => {
      this.dialogService.showError('MSG.ERROR');
    });

    this.translate.get('RE0015').subscribe(res => {
      this.re0015Translate = res;
      const userName = this.userSession.lastName + ' ' + this.userSession.firstName;
      this.titleMail = res['VALUE_SUBJECT'].replace('nameOffice', userName);
      this.originTitleMail = this.titleMail;
    });
    this.masterService.getJobType().subscribe((jobType: JobType) => {
      this.listJobType = jobType.jobTypeList;
      }, (error: HttpError) => {
      this.dialogService.showError('MSG.ERROR');
    });
    this.getAuthority();
  }

  ngAfterViewInit() {
    $('[data-toggle="tooltip"]').tooltip({animation: false});
    $('[data-toggle="popover"]').popover();
  }

  ngOnDestroy() {
    this._unsubscription(this.timerSubscription);
  }

  getAuthority() {
    const auth = this.sharedValueService.getAuthority();
    this.listManagementAuthority = auth.adminAuthority;
    if (this.userSession.managementAuthority !== this.managementAuthority.MP_1) {
      this.listManagementAuthority.splice(0, 1);
    }
    this.listFuncAuthoritySet = auth.functionAuthority;
  }

  onClickAddMoreStaff(event) {
    event.preventDefault();
    this.addStaff([this._newStaff]);
    this.virtualScroll.scrollInto(this.listStaff[this.listStaff.length - 1]);
  }

  addStaff(listData: any) {
    this.focusOnAnItem = -1;
    for (let i = 0; i < listData.length; i++) {
      // listData[i]['errorMessages'] = new StaffInvite('', '', '', '', '', '', '', '', '');
      this.listStaff.push(listData[i]);
    }
    if (listData.length !== 1) {
      this.virtualScroll.scrollInto(this.listStaff[0]);
    }
    setTimeout(() => {
      this.listStaff = this.listStaff.slice();
    }, 100);
  }

  deleteAllStaff() {
    this.listStaff = [];
  }

  deleteStaff(index: number) {
    this.listStaff.splice(index, 1);
    this.listStaff = this.listStaff.slice();
  }

  /**
   * get the current scroll position
   * @param event
   */
  onListChange(event) {
    if (event && event.start >= 0) {
      this.startScrollPos = event.start;
      this.endScrollPos = event.end;
    }
  }

  registerStaff(event) {
    console.log(event)
    let countValidTotal = 0;
    let countDuplicatedMail = 0;
    let firstErrorIndex = -1;
    const mailArray = [];
    this.focusOnAnItem = -1;
    if (!this.listStaff.length) {
      return;
    }
    for (let index = 0; index < this.listStaff.length; index++) {
      const newStaff = this.validation.createStaff(this.listStaff[index]);
      this.listStaff[index]['errorMessages'] = this.validation.checkValidate(newStaff);
      if (this.listStaff[index]['errorMessages'] === null) {
        countValidTotal++;
      } else {
        if (firstErrorIndex === -1) {
          firstErrorIndex = index;
        }
      }

      // check duplicated emails
      this.listStaff[index].duplicateMailMessage = '';
      if (this.listStaff[index].mailAddress.trim() !== '') {
        if (mailArray.indexOf(this.listStaff[index].mailAddress) < 0) {
          mailArray.push(this.listStaff[index].mailAddress);
        } else {
          this.listStaff[index].duplicateMailMessage = this.re0015Translate.MSG_VALIDATION.DUPLICATED_EMAIL;
          countDuplicatedMail++;
          if (firstErrorIndex === -1) {
            firstErrorIndex = index;
          }
        }
      }
    }
    this.countSubmit += 2;
    if (this.listStaff.length === countValidTotal) {
      if (countDuplicatedMail > 0) {
        this.dialogService.showError('RE0015.EMAIL_DUPLICATE').subscribe((res) => {
          if (res.isOk()) {
            this.countSubmit = -1;
            this.focusFirstError(firstErrorIndex);
          }
        });
      } else {
        // this.countSubmit = 0; // update error
        this.confirmRegister(this.listStaff);
      }
    } else {
      this.focusFirstError(firstErrorIndex);
    }
  }

  /**
   * scroll into error first item in the list
   * @param index
   */
  focusFirstError(index) {
    if (index < this.startScrollPos || index >= this.endScrollPos - 1) {
      this.virtualScroll.scrollInto(this.listStaff[index]);
    }
    this.focusOnAnItem = index;
  }

  // Re0015_2
  confirmRegister(listStaff: any[]) {
    const msgText = this.getListMsg('RE0015.MSG_CONFIRM');
    const html = '<p>' + listStaff.length + msgText[1] + this.userSession.officeName + msgText[2] + '<p>';
    this.dialogService.showMessage('warning', false, 'RE0015.MSG_CONFIRM.REGISTER_STAFF', null, html, 'MSG.YES', 'MSG.NO').subscribe(
        (res: DialogResult) => {
          if (res.isOk()) {
            this.staffInviteTempRegister();
          }
        }
    );
  }

  /**
   * Call Api invite staff in tap staffInvite Re0015_3
   */
  staffInviteTempRegister() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.registrationService.staffInviteTempRegist(this.listStaff).subscribe(
        res => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          const str = res['queueId'];
          const sub = str.replace('{"queueId" : "', '').replace(']}"}', ']}');
          const json = JSON.parse(sub);
          this.listEmailRegisterFail = json.errorListInvite;
          this.listEmailRegisterSuccess = json.successListInvite.filter(item => this.validateEmail(item.mailAddress) === true);
          this.cbChecked = json.successListInvite.filter(item => this.validateEmail(item.mailAddress) !== true);
          if (json.successListInvite.length > 0) {
            if (this.listEmailRegisterSuccess.length > 0) {
              this.listUserMail = [];
              for (let j = 0; j < this.listEmailRegisterSuccess.length; j++) {
                const item = this.listEmailRegisterSuccess[j].mailAddress;
                this.listUserMail.push(item);
              }
              this.confirmSentMail();
            } else {
              if (this.cbChecked.length > 0) {
                this.confirmPrintUser('printSection', true);
              } else {
                this.checkExitStaffRegistrationFails();
              }
            }
          } else {
            this.dialogService.showError('RE0015.EMAIL_EXIST').subscribe(
                (dialogResult: DialogResult) => {
                  if (dialogResult.isOk()) {
                    this.addListStaffRegisterFail();
                  }
                }
            );
          }
        },
        error => {
          this.dialogService.showError('MSG.ERROR');
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
        }
    );
  }

  confirmSentMail() {
    const msgText = this.getListMsg('RE0015.MSG_CONFIRM');
    const title = this.re0015Translate.MSG_CONFIRM.REGISTER_COMPLETE;
    const html = title + '<br>' + '<p>' + msgText[4] + '</p>' + '<p>' + msgText[5] + '</p>' + msgText[6];
    this.dialogService.showMessageSize(null, false, null, null, html, 'MSG.YES', 'MSG.NO', null, 'modal-lg').subscribe(
        (dialogResult: DialogResult) => {
          if (dialogResult.isOk()) {
            this.staffRegiterSendEmail();
          } else {
            if (this.cbChecked.length > 0) {
              this.confirmPrintUser('printSection', true);
            } else {
              this.checkExitStaffRegistrationFails();
            }
          }
        }
    );
  }

  checkExitStaffRegistrationFails() {
    if (this.listEmailRegisterFail.length > 0) {
      setTimeout(() => {
        this.dialogService.showError('RE0015.EMAIL_EXIST').subscribe(
            (res: DialogResult) => {
              if (res.isOk()) {
                this.addListStaffRegisterFail();
              }
            }
        );
      }, 400);
    } else {
      this.deleteAllStaff();
      this.addStaff([this._newStaff]);
    }
  }

  addListStaffRegisterFail() {
    this.deleteAllStaff();
    let firstError = -1;
    this.addStaff(this.listEmailRegisterFail);
    for (let i = 0; i < this.listStaff.length; i++) {
      if (firstError === -1) {
        firstError = i;
      }
      this.listStaff[i].duplicateMailMessage = this.re0015Translate.MSG_VALIDATION.DUPLICATED_EMAIL;
    }
    this.countSubmit = -1;
    this.focusFirstError(firstError);
  }

  staffRegiterSendEmail(){
    let staff = {
      'mailAddresses': this.listUserMail
    };
    this.registrationService.staffInviteSendEmail(staff).subscribe(
        res => {
          setTimeout(()=>{
            this.dialogService.setLoaderVisible(false);
            this.dialogService.showSuccess('MSG.INVITATION_COMPLETE').subscribe(
                (dialogResult: DialogResult) => {
                  if (dialogResult.isOk()) {
                    if(this.cbChecked.length > 0){
                      this.confirmPrintUser('printSection', true);
                    }else{
                      this.checkExitStaffRegistrationFails();
                    }
                  }
                });
          },400)
        },
        error => {
          setTimeout(()=>{
            this.dialogService.showError('MSG.ERROR');
          },400);
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
        }
    );
  }

  /**
   * Call Api send email in tap staffInvite
   */
  staffInviteSendEmail() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    let title = $('#myModal input').val();
    let content = $('#myModal textarea').val();
    let staff = {
      'mailAddresses': this.listUserMail,
      'title': title,
      'content': content
    };
    setTimeout(function () { $('#myModal01').modal('hide'); }, 200);
    this.registrationService.staffInviteSendEmail(staff).subscribe(
        res => {
          setTimeout(()=>{
            this.dialogService.setLoaderVisible(false);
            this.dialogService.showSuccess('MSG.INVITATION_COMPLETE').subscribe(
                (dialogResult: DialogResult) => {
                  if (dialogResult.isOk()) {
                    this.completeSendMail();
                  }
                });
          },400)
        },
        error => {
          this.dialogService.setLoaderVisible(false);
          setTimeout(() => {
            this.dialogService.showError('MSG.ERROR');
          });
        }
    );
  }

  /**
   * import file xlsx in tab staffInvite
   * @param event1
   */
  onChangeFile(event1: any) {
    const file = event1.target.files[0];
    if (!(file.type && file.name.match(/.+(\.xlsx|\.csv|\.xls)$/))) {
      this.dialogService.showError('RE0015.MESSAGE_ERROR_FILE');
      return false;
    }
    const datas = [];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = f => {
      const contents: any = f.target;
      const data = contents.result;
      const arr1 = String.fromCharCode.apply(null, new Uint8Array(data));
      const workbook = XLSX.read(btoa(arr1), { type: 'base64' });
      const first_sheet_name = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[first_sheet_name];
      const rangen = worksheet['!ref'];
      const utils = XLSX.utils;
      const rangeVal = utils.decode_range(rangen);
      for (let r = 10; r <= rangeVal.e.r; r++) {
        if (datas.length === Helper.max_import_staff_invite) {
          break;
        }
        const row = {};

        const lastName = worksheet[utils.encode_cell({ c: 0, r: r })];
        const firstName = worksheet[utils.encode_cell({ c: 1, r: r })];
        const lastNameKana = worksheet[utils.encode_cell({ c: 2, r: r })];
        const firstNameKana = worksheet[utils.encode_cell({ c: 3, r: r })];
        const dept = worksheet[utils.encode_cell({ c: 4, r: r })];
        const job_type = worksheet[utils.encode_cell({ c: 5, r: r })];
        const mail = worksheet[utils.encode_cell({ c: 6, r: r })];
        const managementAuthority = worksheet[utils.encode_cell({ c: 7, r: r })];
        const funcAuthoritySet = worksheet[utils.encode_cell({ c: 8, r: r })];
        if (!(firstName && lastName && firstNameKana && lastNameKana && job_type && managementAuthority && funcAuthoritySet)) {
          continue;
        }

        if (!(firstName.v && lastName.v && firstNameKana.v && lastNameKana.v)) {
          continue;
        }

        let depart_id;
        if(dept && this.departmentList.filter(item => item.text === dept.v.toString()).length === 1){
          depart_id = this.departmentList.filter(item => item.text === dept.v.toString())[0];
        }else{
          depart_id = this.departmentList[0];
        }

        const job_id = this.listJobType.filter((item) => item.jobName === job_type.v.toString())[0];
        const managementAuthority_id = this.listManagementAuthority.filter(item => item.name === managementAuthority.v.toString())[0];
        const funcAuthoritySet_id = this.listFuncAuthoritySet.filter(item => item.name === funcAuthoritySet.v.toString())[0];

        if (!(job_id && managementAuthority_id && funcAuthoritySet_id)) {
          continue;
        }
        row['firstName'] = (firstName) ? firstName.v.toString() : '';
        row['lastName'] = (lastName) ? lastName.v.toString() : '';
        row['firstNameKana'] = (firstNameKana) ? firstNameKana.v.toString() : '';
        row['lastNameKana'] = (lastNameKana) ? lastNameKana.v.toString() : '';
        const dep = (depart_id) ? (depart_id.id).toString() : '';
        row['department'] = { id: dep, name: '', displayName: '', children: [] };
        row['jobType'] = (job_id) ? job_id.id : '';
        row['mailAddress'] = (mail) ? mail.v.toString() : '';
        row['managementAuthority'] = (managementAuthority_id) ? managementAuthority_id.id : '';
        row['funcAuthoritySet'] = (funcAuthoritySet_id) ? funcAuthoritySet_id.id : '';
        datas.push(row);
      }
      if (datas.length > 0) {
        this.deleteAllStaff();
        this.addStaff(datas);
      }
    };
    // File abc= new File(file.name);
    $('.custom-file-input').val('');
    event1.target.value = null;
  }

  getListMsg(msg: string) {
    const msgText = [];
    this.translate.get(msg).subscribe(
        res => {
          for (const field in res) {
            if (res.hasOwnProperty(field)) {
              msgText.push(res[field]);
            }
          }
        }
    );
    return msgText;
  }

  // Load all data
  getStaffBulkSettings() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.registrationService.getStaffInviteSettings(this.pdepartment, this.name, this.scrollOptions.sort, this.scrollOptions.page, this.scrollOptions.size).subscribe(
        (settings: StaffInviteSettings) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.staffBulks = settings['staffsProvisional'];
          this.dataScroll = this.staffBulks;
          if (this.dataScroll.length < 20) {
            this.flagScroll = false;
          }
          if (this.scrollOptions.page === this.pageDefault) {
            this.users = this.staffBulks;
          } else {
            this.users = this.users.concat(this.dataScroll);
          }
          if(this.dataScroll.length > 0 && this.selectedAll === true){
            for (let i = 0; i < this.dataScroll.length; i++) {
              const q = this.users.indexOf(this.dataScroll[i]);
              this.cbChecked.push(this.dataScroll[i]);
              this.users[q].selected = this.selectedAll;
            }
          }
        }, error => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
        });
  }

  showTextDepartment(index) {
    return this.convertLevelDepartment(this.users[index].department);
  }

  convertLevelDepartment(object: any) {
    const path = object.path;
    let result = path.slice(1, -1).replace(/\//g, ' | ');
    if (result === '') {
      result = object.displayName;
    }
    return result;
  }

  // Check all user
  checkAll(isChecked: boolean) {
    for (let i = 0; i < this.users.length; i++) {
      const q = this.cbChecked.indexOf(this.users[i]);
      if (isChecked) {
        if (q === -1) {
          this.cbChecked.push(this.users[i]);
        }
      } else {
        this.cbChecked.splice(q, 1);
      }
      this.users[i].selected = this.selectedAll;
    }

  }

  // User is checked
  toggleUser(index, ev) {
    const i = this.cbChecked.indexOf(this.users[index]);
    if (ev.target.checked) {
      if (i === -1) {
        this.cbChecked.push(this.users[index]);
      }
    } else {
      if (i !== -1) {
        this.cbChecked.splice(i, 1);
      }
    }

  }

  // Search by Department
  searchDepartment(department) {
    this.cbChecked = [];
    this.selectedAll = false;
    this.flagScroll = true;
    this.scrollOptions.page = this.pageDefault;
    this.scrollOptions.sort = this.sortDefault;
    this.pdepartment = department.departmentId;
    this.getStaffBulkSettings();
  }

  // Search by Name
  searchUser(inputName) {
    this.cbChecked = [];
    this.selectedAll = false;
    this.flagScroll = true;
    this.scrollOptions.page = this.pageDefault;
    this.scrollOptions.sort = this.sortDefault;
    inputName ? (this.name = inputName) : (this.name = '');
    this.getStaffBulkSettings();
  }

  // Send email
  sendMail() {
    this.listUserMail = [];
    this.listUserMailFail = [];
    this.descriptionsMail = '';
    if (this.cbChecked.length === 0) {
      this.dialogService.showError('RE0015.CHOOSE_MAIL');
    } else {
      const self = this;
      this.cbChecked.filter(item => {
        if (self.validateEmail(item['loginId'])) {
          self.listUserMail.push(item['loginId']);
        } else {
          self.listUserMailFail.push(item);
        }
      });
      if (this.listUserMail.length > 0) {
        $('#myModal').modal('show');
      }
      if (this.listUserMail.length == 0 && this.listUserMailFail.length > 0) {
        this.confirmPrintUser('printSection1');
      }
    }
  }

  confirmPrintUser(printId, flag?){
    let html = '';
    this.translate.get('MSG').subscribe(msg => {
      html = '<p style="font-size: 14px">' +
            '<br>' + msg.NOT_SEND_EMAIL +
            '<br>' + msg.CONFIRM_PRINT_ID1 + '</p>';
    });
    setTimeout(()=>{
      this.dialogService.showMessage('warning', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
          (res: DialogResult) => {
            if(res.isOk()){
              this.printUser(printId);
              if(flag){
                this.checkExitStaffRegistrationFails();
              }
            }else{
              if(flag){
                this.checkExitStaffRegistrationFails();
              }
            }
          });
    },500);
  }

  // complete send mail
  completeSendMail(){
    this.descriptionsMail = '';
    if(this.listUserMailFail.length > 0){
      this.confirmPrintUser('printSection1')
    }
    // waiting for API
    // to do
  }

  // check email valid
  validateEmail(emailField){
    const reg = Helper.emailRegex;
    if (reg.test(emailField) === false) {
      return false;
    }
    return true;
  }

  // comfirm send mail
  comfirmSendMail(){
    setTimeout(function () { $('#myModal').modal('hide'); }, 100);
    $('#myModal01').modal('show');
  }

  // back send mail
  backsendingMail() {
    setTimeout(function () { $('#myModal01').modal('hide'); }, 300);
    $('#myModal').modal('show');
  }

  // Print user
  printUser(printSection) {

    if (this.cbChecked.length === 0) {
      this.dialogService.showError('RE0015.CHOOSE_MAIL');
    } else {
      let printContents, popupWin;
      printContents = document.getElementById(printSection).innerHTML;
      popupWin = window.open('', '_blank', 'toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=0,width=4000,height=4000');
      popupWin.document.open();
      popupWin.document.write(
          `<html>
        <head>
          <style  media="all" type="text/css">
      body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
       }
      .title-head{
        border-bottom: 2px solid #F08D00;
        padding: 10px 20px 0;
        margin: 10px 0 0;
      h1{
          font-weight: 700;
        }
      }
      .group-txt {
        .group-box{
        background: #eee;
        padding: 12px;
        border-radius: 0.3rem;
        }
      }
    * {
        box-sizing: border-box;
        -moz-box-sizing: border-box;
      }
        .page {
            width: 230mm;
            min-height: 297mm;
            padding: 3mm;
            margin: 3mm auto;
            background: white;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
        }
        .subpage {
            padding: 1cm;
            height: 257mm;
        }

        @page {
            size: A4;
            margin: 0;
        }
        @media all {
            html, body {
                width: 230mm;
                height: 297mm;
            }
            .group-box {
              background: #eee !important;
              padding: 12px;
              border-radius: 0.3rem;
              display:block;
              -webkit-print-color-adjust: exact;
            }
        .page {
            margin: 0;
            border: initial;
            border-radius: initial;
            width: initial;
            min-height: initial;
            box-shadow: initial;
            background: initial;
            page-break-after: always;
          }
          .group-txt {
            margin-bottom:3.5rem;
          }
          .title-print {
            margin-bottom:0.25rem;
          }
          .table-form-txt {
            width:100%;
            overflow: hidden;
          }
          .table-form-txt .th {
            width:150px;
            float:left;
          }
          .table-form-txt .td {
            color:#a5a5a5;
          }
          .table-form-txt .th, .table-form-txt .td {
            padding: 0.75rem;
            vertical-align: top;
          }
          .table-form-txt .boder {
            clear: both;
            border-top: 1px solid #D7D7D7;
          }
          .table-form-txt .boder .th, .table-form-txt  {
            float: left;
          }
        }
          </style>
        </head>
      <body onload="window.print();window.close()">
        ${printContents}
      </body>
      </html>`
      );
     popupWin.document.close();
    }
  }

  // Export to CSV
  exportCSV() {
    // call API export CSV
    let data = JSON.parse(JSON.stringify(this.users));
    let dataCSV = new Array();
    data.forEach((item, index) => {
      let dep = item.department.path.slice(1, -1).replace(/\//g, ' | ');
      if(dep === ''){
        dep = item.department.displayName;
      }
      let element = {
        'lastName': item.lastName,
        'firstName': item.firstName,
        'lastNameKana': item.lastNameKana,
        'firstNameKana': item.firstNameKana,
        'department': dep,
        'jobName': item.jobName,
        'loginId': item.loginId,
        'temporaryPassword': item.temporaryPassword
      };
      dataCSV.push(element);
    });
    dataCSV.unshift(['姓', '名', 'せい', 'めい', '所属', '職業', '\tログインID', '仮パスワード']);
    new Angular2Csv(dataCSV, 'staff-invite');
  }

  // Scroll Paging
  scrollPaging() {
    if(this.users && this.flagScroll === true && this.indexTab === 1){
      this.scrollOptions.page = String(+this.scrollOptions.page + 1);
      this.getStaffBulkSettings();
    }
  }

  changeTab(indexTab) {
    this.indexTab = indexTab;
    this.cbChecked = [];
    this.selectedAll =  false;
    this.flagScroll = true;
    if (indexTab === 1) {
      this.scrollOptions.page = this.pageDefault;
      this.department = '';
      this.getStaffBulkSettings();
    }
  }

  downloadCsv() {
    const utils = XLSX.utils;
     const customFunc = XLSX.customFunc;
    // const customFunc = XLSX.utils;
    const style = {
      'numFmt': 'General',
      'fill': {'patternType': 'solid', 'fgColor': {'rgb': 'FFFFC000'}, 'bgColor': {'rgb': 'FFFF9900'}},
      'font': {'sz': '10', 'color': {'rgb': 'FF000000'}},
      'border': {},
      'alignment': {'vertical': 'center', 'horizontal': 'left'}
    };
    const ws = customFunc.aoa_to_sheet([]);
    const jobType = this.listJobType.map((item) => {
      return [item.jobName];
    });
    customFunc.sheet_add_aoa(ws, [['職業']], {origin: 'A1'});
    customFunc.sheet_add_aoa(ws, jobType, {origin: 'A2'});

    const listManagementAuthority = this.listManagementAuthority.map((item) => {
      return [this.translateCsv['AUTHORITY.ADMIN_AUTHORITY'][item.id]];
    });
    customFunc.sheet_add_aoa(ws, [['管理権限']], {origin: 'B1'});
    customFunc.sheet_add_aoa(ws, listManagementAuthority, {origin: 'B2'});

    const listFuncAuthoritySet = this.listFuncAuthoritySet.map((item) => {
      return [this.translateCsv['AUTHORITY.FUNCTION_AUTHORITY'][item.id]];
    });
    listFuncAuthoritySet.pop();
    customFunc.sheet_add_aoa(ws, [['機能権限']], {origin: 'C1'});
    customFunc.sheet_add_aoa(ws, listFuncAuthoritySet, {origin: 'C2'});

    const departmentList = this.departmentList.map((item) => {
      return [item.text];
    });
    customFunc.sheet_add_aoa(ws, [['所属']], {origin: 'AE1'});
    customFunc.sheet_add_aoa(ws, departmentList, {origin: 'AE2'});
    ws['A1'].s = style;
    ws['B1'].s = style;
    ws['C1'].s = style;
    this.appendDataToFile(ws);
  }

  appendDataToFile(ws) {
    const req = new XMLHttpRequest();
    const self = this;
    req.open('GET', '../../../../assets/examples/RE0015.xlsx', true);
    req.responseType = 'arraybuffer';
    req.onload = function (e) {
      const content = new Uint8Array(req.response);
      const workbook = XLSX.read(content, {type: 'array', cellHTML: true, cellStyles: true, raw: true});
      XLSX.customFunc.book_append_sheet(workbook, ws, 'マスタ');
      self.modifyWb(workbook);
      const wbout = self.s2ab(XLSX.write(workbook, {bookType: 'xlsx', type: 'binary', cellStyles: true, WTF: true, raw: true, bookSST: false}));
      saveAs(new Blob([wbout], {type: 'application/octet-stream'}), 'staff_invite.xlsx');
       //XLSX.writeFile(workbook, 'staff_invite_' + moment().format('MM_DD') + '.xlsx',  { type: 'xlxs', cellStyles: true, WTF: true, raw: true});

    };
    req.send();
  }

  s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i = 0; i != s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  }

  modifyWb(workbook) {
    const SheetNames = ['登録シート', 'マスタ'];
    const sheet1 = workbook.Sheets[SheetNames[0]];
    const listFuncAuthoritySet = this.listFuncAuthoritySet.map((item) => {
      return this.translateCsv['AUTHORITY.FUNCTION_AUTHORITY'][item.id];
    });
    listFuncAuthoritySet.pop();
    sheet1['!dataValidation'] = [
      {sqref: 'I10:I31', values: listFuncAuthoritySet.join(',')},
      {sqref: 'F10:F31', formula: 'OFFSET(マスタ!$A$2,0,0,' + this.listJobType.length + ',1)'},
      {sqref: 'H10:H31', formula: 'OFFSET(マスタ!$B$2,0,0,' + this.listManagementAuthority.length + ',1)'},
      {sqref: 'E10:E31', formula: 'OFFSET(マスタ!$AE$3,0,0,' + (this.departmentList.length - 1) + ',1)'},
    ];
    sheet1['E10'].v = this.departmentList[1].text;
  }
}
