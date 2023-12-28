import { Component, OnInit, HostListener } from '@angular/core';
import {
  FormBuilder,
  FormGroup
} from '@angular/forms';

import { RegistrationService } from '../../../services/registration.service';
import { GrantUserAuthSettings } from '../../../models/re/grant-user-auth-settings';
import { GrantUserAuthSettingsSaveResult } from '../../../models/re/grant-user-auth-settings-save-result';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';
import {HttpStatus} from '../../../common/http.status';
import {Subscription} from 'rxjs/Subscription';
import {ActivatedRoute} from '@angular/router';
import {StaffEditSettings} from '../../../models/re/staff-edit-settings';
import {Title} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-re0031-page',
  templateUrl: './re0031-page.component.html',
  styleUrls: ['./re0031-page.component.scss']
})
export class Re0031PageComponent implements OnInit {

  data: any;
  functionAuthorities = [];
  managerAuthorities = [];
  authSet: string;
  model = new GrantUserAuthSettings();
  checkDisabled = false;
  myForm: FormGroup;
  public subscription: Subscription;
  userId;

  constructor(private registrationService: RegistrationService,
              public formBuilder: FormBuilder,
              private dialogService: DialogService,
              private titleService: Title,
              private translate: TranslateService,
              public activatedRoute: ActivatedRoute) {
    this.myForm = this.formBuilder.group({
      'functionAuthority': [''],
      'functionAuthorityDetail': this.formBuilder.group({
        'fp_1': [''], 'fp_2': [''], 'fp_3': [''], 'fp_4': [''], 'fp_5': [''], 'fp_6': [''], 'fp_7': ['']
      })
    });

    this.managerAuthorities = [
      { Id: 'All', Name: 'ROLE_1' }, { Id: 'Limited', Name: 'ROLE_2' }
    ];
  }

  ngOnInit() {
    this.translate.get('DOC_TITLE.RE0031').subscribe(
      (res) => {
        this.titleService.setTitle(res);
      }
    );
    this.subscription = this.activatedRoute.params.subscribe(params => {
      this.userId = params['userId'];
    });
    this.dialogService.setLoaderVisible(true);
    this.registrationService.getStaffEditSettings(this.userId).subscribe(
      (settings: StaffEditSettings) => {
        this.dialogService.setLoaderVisible(false);
        this.data = settings;
        this.formGrantUser();
        this.roleInit();
      }, (error) => {
        this.dialogService.setLoaderVisible(false);
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  formGrantUser() {
    this.authSet = this.data.funcAuthoritySet;
    this.myForm = this.formBuilder.group({
      'functionAuthority': [this.authSet],
      'functionAuthorityDetail': this.formBuilder.group({
        'fp_1': [''], 'fp_2': [''], 'fp_3': [''], 'fp_5': [''], 'fp_6': [''], 'fp_7': ['']
      })
    });
    this.functionAuthorities = [
      { Id: 'FPS_1', Name: 'FPS_1' }, { Id: 'FPS_2', Name: 'FPS_2' },
      { Id: 'FPS_3', Name: 'FPS_3' }, { Id: 'FPS_4', Name: 'FPS_4' }, { Id: 'FPS_0', Name: 'FPS_0' }
    ];
  }

  changeFP(event){
    if(event.target.checked === true){
      const arr = <FormGroup>this.myForm.get('functionAuthorityDetail');
      arr.controls['fp_1'].setValue(true);
      $('.sp_1').prop('disabled', true);
    }else{
      $('.sp_1').prop('disabled', false);
    }
  }

  roleInit() {
    const arr = <FormGroup>this.myForm.get('functionAuthorityDetail');
    let i = 1;
    for (i; i <= 7; i++) {
      if(i !== 4){
        if (this.data.funcAuthoritySet === 'FPS_0' && (this.data.jobType === 'J0001' || this.data.jobType === 'J0029')) {
          $('.sp_' + i).prop('disabled', false);
          if(this.data.funcAuthority.indexOf(i) > -1){
            arr.controls['fp_' + i].setValue(true);
          }
          this.checkDisabled = false;
          // this.checkedCheckboxInit();
        }
        if (this.data.funcAuthoritySet === 'FPS_0' && this.data.jobType !== 'J0001' && this.data.jobType !== 'J0029') {
          $('.sp_' + i).prop('disabled', false);
          if(this.data.funcAuthority.indexOf(i) > -1){
            arr.controls['fp_' + i].setValue(true);
          }
          this.checkDisabled = false;
        }
        if (this.data.funcAuthoritySet === 'FPS_1') {
          $('.sp_' + i).prop('disabled', true);
          arr.controls['fp_' + i].setValue(true);
          this.checkDisabled = true;
        }
        if (this.data.funcAuthoritySet === 'FPS_2') {
          if (i === 2 || i === 5) {
            $('.sp_' + i).prop('disabled', true);
            arr.controls['fp_' + i].setValue(false);
          } else {
            $('.sp_' + i).prop('disabled', true);
            arr.controls['fp_' + i].setValue(true);
          }
          this.checkDisabled = true;
        }
        if (this.data.funcAuthoritySet === 'FPS_3') {
          if (i === 1) {
            $('.sp_' + i).prop('disabled', true);
            arr.controls['fp_' + i].setValue(true);
          } else {
            $('.sp_' + i).prop('disabled', true);
            arr.controls['fp_' + i].setValue(false);
          }
          this.checkDisabled = true;
        }
        if (this.data.funcAuthoritySet === 'FPS_4') {
          $('.sp_' + i).prop('disabled', true);
          arr.controls['fp_' + i].setValue(false);
          this.checkDisabled = true;
        }
      }
    }
    if(this.data.funcAuthority.indexOf(7) > -1){
      $('.sp_1').prop('disabled', true);
    }
  }

  change_role(value) {
    this.authSet = value;
    const arr = <FormGroup>this.myForm.get('functionAuthorityDetail');
    let i = 1;
    if(value !== 'FPS_0'){
      $("#selectLevel").val(this.managerAuthorities[0].Id).change();
    }
    for (i; i <= 7; i++) {
      if(i !== 4){
        if (value === 'FPS_0' && (this.data.jobType === 'J0001' || this.data.jobType === 'J0029')) {
          $('.sp_' + i).prop('disabled', false);
          arr.controls['fp_' + i].setValue(false);
          this.checkDisabled = false;
        }
        if (value === 'FPS_0' && this.data.jobType !== 'J0001' && this.data.jobType !== 'J0029') {
          $('.sp_' + i).prop('disabled', false);
          arr.controls['fp_' + i].setValue(false);
          this.checkDisabled = false;
        }
        if (value === 'FPS_1') {
          $('.sp_' + i).prop('disabled', true);
          arr.controls['fp_' + i].setValue(true);
          arr.controls['fp_7'].setValue(true);
          this.checkDisabled = true;
          // this.checkInit = true;
        }
        if (value === 'FPS_2') {
          if (i === 2 || i === 5) {
            $('.sp_' + i).prop('disabled', true);
            arr.controls['fp_' + i].setValue(false);
          } else {
            $('.sp_' + i).prop('disabled', true);
            arr.controls['fp_' + i].setValue(true);
          }
          this.checkDisabled = true;
          // this.checkInit = true;
        }
        if (value === 'FPS_3') {
          if (i === 1) {
            $('.sp_' + i).prop('disabled', true);
            arr.controls['fp_' + i].setValue(true);
          } else {
            $('.sp_' + i).prop('disabled', true);
            arr.controls['fp_' + i].setValue(false);
          }
          this.checkDisabled = true;
          // this.checkInit = true;
        }
        if (value === 'FPS_4') {
          $('.sp_' + i).prop('disabled', true);
          arr.controls['fp_' + i].setValue(false);
          this.checkDisabled = true;
          // this.checkInit = true;
        }
      }
    }
  }

  // checkedCheckboxInit() {
  //   const sp_1 = $('.sp_1');
  //   sp_1.on('click', () => {
  //     if (sp_1.is(':checked')) {
  //       // this.checkInit = true;
  //     } else {
  //       // this.checkInit = false;
  //     }
  //   });
  // }

  putStaffEditSettings() {
    this.model.loginId = this.data.loginId;
    this.model.functionAuthority = this.myForm.value.functionAuthority;
    this.model.managementAuthority = this.data.managementAuthority;
    this.model.functionAuthorityDetail = this.myForm.value.functionAuthorityDetail;
    this.model.fp3ManagementLevel = $('#selectLevel').val();

    this.dialogService.showMessage('warning', false, null, 'RE0031.CONFIRM', null, 'MSG.YES', 'MSG.NO').subscribe(
        (res: DialogResult) => {
          setTimeout(() => {
            if (res.isOk()) {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(true);
              });
              this.registrationService.putGrantAuthUser(this.model).subscribe(
                  (response: GrantUserAuthSettingsSaveResult) => {
                    setTimeout(() => {
                      this.dialogService.setLoaderVisible(false);
                    });
                    this.checkStatusResponse(response.status, 'MSG.SAVED');
                  },
                  (error) => {
                    setTimeout(() => {
                      this.dialogService.setLoaderVisible(false);
                    });
                    this.dialogService.showError('MSG.ERROR');
                  }
              );
            }
          }, 400);
        }
    );
  }

  checkStatusResponse(status, message) {
    if (status === HttpStatus.NotContent) {
      this.dialogService.showSuccess(message);
    } else {
      this.dialogService.showError('MSG.ERROR');
    }
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     this.putStaffEditSettings();
  //   }
  // }
}
