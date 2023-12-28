import { Component, OnInit, AfterViewInit } from '@angular/core';
import {HttpError} from '../../../common/error/http.error';
import {MasterService} from '../../../services/master.service';
import {PharmacyService} from '../../../services/pharmacy.service';
import {Router} from '@angular/router';
import {DialogService} from '../../../services/dialog.service';
import {TranslateService} from '@ngx-translate/core';
import {SharedValueService} from '../../../services/shared-value.service';
import {Helper} from '../../../common/helper';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UpdateProtocolValidator} from './ph0007-validator';
import {UpdateProtocol} from '../../../models/ph/update-protocol';
import {SpecialtyAreaConverter} from '../../../common/converter/specialty-area.converter';
import {DialogResult} from '../../../models/dialog-param';
import {HttpStatus} from '../../../common/http.status';
import {UserSession} from '../../../models/ba/user-session';
declare const $: any;
@Component({
  selector: 'app-ph0007-page',
  templateUrl: './ph0007-page.component.html',
  styleUrls: ['./ph0007-page.component.scss'],
  providers: [UpdateProtocolValidator, SpecialtyAreaConverter, Validators]
})
export class Ph0007PageComponent implements OnInit, AfterViewInit {
  updateProtocolForm: FormGroup;
  protocol: any = {};
  formErrors: any;
  public userSession: UserSession;
  funcAuthority;
  constructor(private dialogService: DialogService,
              private translate: TranslateService,
              private masterService: MasterService,
              private updateProtocolValidator: UpdateProtocolValidator,
              private pharmacyService: PharmacyService,
              private shareValue: SharedValueService,
              private formBuilder: FormBuilder,
              private helper: Helper,
              private router: Router) {
    this.userSession = this.shareValue.getUserSession();
    const model = new UpdateProtocol();
    this.updateProtocolForm = this.updateProtocolValidator.createForm(model);
    this.formErrors = this.updateProtocolValidator.formErrors;
  }

  ngOnInit() {
    this.funcAuthority = this.userSession.funcAuthority.FP_8;
    this.pharmacyService.getProtocol(this.userSession.officeId).subscribe(
      (settings: UpdateProtocol) => {
        this.updateProtocolForm = this.updateProtocolValidator.createForm(settings);
        this.dialogService.setLoaderVisible(false);
      }, (error: HttpError) => {
        this.dialogService.setLoaderVisible(false);
          this.dialogService.showError('MSG.ERROR');
      });
  }
  putData() {
    this.dialogService.setLoaderVisible(true);
    this.updateProtocolValidator.checkValidate(this.updateProtocolForm, this.formErrors);
    if (this.updateProtocolForm.valid) {
      this.pharmacyService.putUpdateProtocol(this.updateProtocolForm.value).subscribe(
        (response) => {
          this.dialogService.setLoaderVisible(false);
          this.dialogService.showMessage('success', false, null, 'PHARMACY.PH0007.SAVED_SUCCESS', null,
            'MSG.OK', null);
        },
        (error) => {
          this.dialogService.setLoaderVisible(false);
          this.dialogService.showError('MSG.ERROR');
        }
      );
    } else {
      this.helper.gotoError();
      this.dialogService.setLoaderVisible(false);
    }
  }

  ngAfterViewInit() {
    $('[data-toggle="tooltip"]').tooltip();
  }

}
