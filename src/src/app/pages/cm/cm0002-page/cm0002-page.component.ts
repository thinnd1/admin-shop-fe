import { Component, OnInit } from '@angular/core';
import { Cm0002PageValidator } from '../../cm/cm0002-page/cm0002-page.validator';
import { FormGroup, FormControl } from '@angular/forms';
import { UserSession } from '../../../models/ba/user-session';
import { SharedValueService } from '../../../services/shared-value.service';
import { DialogService } from '../../../services/dialog.service';
import {Observable} from 'rxjs/Observable';
import { Contactus } from '../../../models/cm/contactus';
import { PageStatus } from '../../../models/cm/page.status';
import { CmsService } from '../../../services/cms.service';

@Component({
  selector: 'app-cm0002-page',
  templateUrl: './cm0002-page.component.html',
  styleUrls: ['./cm0002-page.component.scss'],
  providers: [Cm0002PageValidator]
})
export class Cm0002PageComponent implements OnInit {

  public pageStatus = PageStatus;
  public currentPage = PageStatus.Top;
  public detailData: any;
  private contactusForm: FormGroup;
  private userSession: UserSession;
  private contactus: Contactus;

  constructor(
    private cm0002PageValidator: Cm0002PageValidator,
    private sharedValueService: SharedValueService,
    private dialogService: DialogService,
    private cmsService: CmsService
    ) { }

  ngOnInit() {
    this.contactusForm = this.cm0002PageValidator.setContactusForm();
    this.userSession = this.sharedValueService.getUserSession();
  }

  onSubmit() {
    if (this.contactusForm.invalid) {
      Object.keys(this.contactusForm.controls).forEach((val, idx) => {
        this.contactusForm.get(val).markAsDirty();
      });
      return false;
    }
    this.gotoDetail();
  }

  send() {
    this.showLoading(true);
    this.contactus = this.cm0002PageValidator.mapModel(this.contactusForm.value);
    this.cmsService.postContactus(this.contactus).subscribe((res) => {
      this.showLoading(false);
      this.dialogService
      .showMessage('success', false, null, 'MSG.SENT', null, 'MSG.OK', null, null)
      .subscribe((r) => {
        this.gotoTop();
      });
    }, (res) => {
      this.showLoading(false);
      this.dialogService.showError('MSG.ERROR');
    });
  }

  isError(formControl: FormControl): boolean {
    return formControl.invalid && (formControl.dirty || formControl.touched);
  }

  showErrorMessage(controlName: string) {
    let message = '';
    Object.keys(this.contactusForm.get(controlName).errors).forEach((val) => {
      message = this.cm0002PageValidator.validationMessage[controlName][val];
    });
    return message;
  }

  showError(formControl): boolean {
    return this.isError(formControl);
  }

  showLoading(flag: boolean) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(flag);
    });
  }

  gotoDetail() {
    this.detailData = this.contactusForm.value;
    this.currentPage = PageStatus.Detail;
  }

  gotoTop() {
    this.contactusForm.reset();
    this.gotoBack();
  }

  gotoBack() {
    this.detailData = {};
    this.currentPage = PageStatus.Top;
  }

}
