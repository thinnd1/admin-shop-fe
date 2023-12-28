import { Component, OnInit, HostListener } from '@angular/core';
import { RegistrationService } from '../../../services/registration.service';
import { FirstEntryConfirmSettings } from '../../../models/re/first-entry-confirm-settings';
import { Router } from '@angular/router';
import {DialogService} from '../../../services/dialog.service';
import {CmsService} from '../../../services/cms.service';
import {TermOfUse} from '../../../models/cm/term_of_use';

declare const $: any;

@Component({
  selector: 'app-first-entry-confirm-page',
  templateUrl: './first-entry-confirm-page.component.html',
  styleUrls: ['./first-entry-confirm-page.component.scss']
})

export class FirstEntryConfirmPageComponent implements OnInit {
  yearBirth: string;
  monthBirth: string;
  dayBirth: string;
  data: any;
  termOfUse: TermOfUse;
  public model = new FirstEntryConfirmSettings('', '', '', '', '', '', { 'fieldId': '', 'typeId': '' });
  constructor(
    private registrationService: RegistrationService,
    private router: Router,
    private dialogService: DialogService,
    private cmsService: CmsService
  ) { }

  ngOnInit() {
    this.data = JSON.parse(localStorage.getItem('first_entry'));
    const year = this.data.yearBirth;
    const heisei = year - 1988;
    let wareki = '';
    if (heisei > 1) {
      wareki = '平成' + heisei;
    } else if (heisei === 1) {
      wareki = '平成元';
    } else if (heisei < 1) {
      wareki = '昭和' + (63 + heisei);
    }
    this.yearBirth = this.data.yearBirth + '(' + wareki + ')';
    this.monthBirth = this.data.monthBirth;
    this.dayBirth = this.data.dayBirth;
    this.model.loginId = this.data.loginId;
    this.model.genderType = this.data.gender;
    this.data.newEmailAddress ? this.model.mailAddress = this.data.newEmailAddress : this.model.mailAddress = '';
    this.model.password = this.data.newPassword;
    this.model.birthDate = this.data.yearBirth + '-' + this.monthBirth + '-' + this.dayBirth;
    this.model.specializedDepartment = [];
    for(let i = 0; i < this.data.specializedDepartment.length; i++){
      let field, type;
      field = this.data.specializedDepartment[i].fieldId;
      type = this.data.specializedDepartment[i].typeId;
      this.model.specializedDepartment.push({ 'fieldId': field, 'typeId': type })
    }

    if (this.data.emailNotification === true) {
      if (this.data.newEmailAddress) {
        this.model.newLoginId = this.data.newEmailAddress;
      }
    }
  }

  // put data call API register
  putFirstEntryConfirmSettings() {
    const settings = new FirstEntryConfirmSettings(this.model.birthDate, this.model.genderType, this.model.loginId,
      this.model.mailAddress, this.model.newLoginId, this.model.password, this.model.specializedDepartment);
    localStorage.removeItem('first_entry');
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
      this.registrationService.putFirstEntryConfirmSettings(settings).subscribe(
      (response: any) => {
        this.cmsService.getTermOfUseOne().subscribe(
            (res: TermOfUse)=>{
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
              $('#notiConfirm').show();
              $('#inforConfirm').hide();
              this.termOfUse = res;
              return this.cmsService.putTermOfUseApprove(this.termOfUse.version);
            }
        )
      },
      (error) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR').subscribe(res=>{
          const err = JSON.parse(error.message);
          for (let key in err) {
            if (key === 'mailAddress') {
              localStorage.setItem('existed_email', 'true');
            }
          }
          localStorage.setItem('first_entry', JSON.stringify(this.data));
          this.router.navigateByUrl('re/first-entry');
        });
      }
    );
  }

  // back to RE0023
  backToFirstEnTry() {
    localStorage.setItem('first_entry', JSON.stringify(this.data));
    this.router.navigateByUrl('re/first-entry');
  }

  // come back top page
  backToTop() {
    this.router.navigate(['']);
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     this.putFirstEntryConfirmSettings();
  //   }
  // }
}
