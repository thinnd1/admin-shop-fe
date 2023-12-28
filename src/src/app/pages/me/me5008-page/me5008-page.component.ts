import {AfterViewInit, Component, HostListener, OnInit} from '@angular/core';
import {VisitationCardContractor} from '../../../models/me/visitation-card-contractor';
import {MeetingService} from '../../../services/meeting.service';
import {DialogService} from '../../../services/dialog.service';
import {FormGroup} from '@angular/forms';
import {Me5008Validator} from './me5008-validator';
import {TranslateService} from '@ngx-translate/core';
import {SpecialtyAreaConverter} from '../../../common/converter/specialty-area.converter';
import {HttpError} from '../../../common/error/http.error';
import {SharedValueService} from '../../../services/shared-value.service';
import {DialogResult} from '../../../models/dialog-param';
import {Router} from '@angular/router';
import {VisitCardPayments} from '../../../models/me/visit-card-payments';
import {ContactOfficesUser} from '../../../models/me/contact-offices-user';
import {Helper} from '../../../common/helper';

declare const $: any;

@Component({
  selector: 'app-me5008-page',
  templateUrl: './me5008-page.component.html',
  styleUrls: ['./me5008-page.component.scss'],
  providers: [Me5008Validator, SpecialtyAreaConverter]
})
export class Me5008PageComponent implements OnInit,AfterViewInit {
  createContractor: FormGroup;
  checkContractor = false;
  checkContractorError: boolean;
  public model = new VisitationCardContractor('', '', '', '', '' );
  formErrors: any;
  userSession: any;
  public contact = new ContactOfficesUser();
  public getUserResult: any;

  constructor(private meetingService: MeetingService,
              private dialog: DialogService,
              private me5008Validator: Me5008Validator,
              private translate: TranslateService,
              public sharedValueService: SharedValueService,
              private router: Router,
              private helper: Helper) {
    this.formErrors = this.me5008Validator.errors;
    this.userSession = this.sharedValueService.getUserSession();
    this.createContractor = this.me5008Validator.createFormMe5008(this.userSession);
  }

  routerToRe() {
    window.scroll(0, 0);
    this.router.navigate(['/re/re0010']);
  }

  ngOnInit() {
    setTimeout(() => {
      this.dialog.setLoaderVisible(true);
    });
    this.meetingService.getVisitCardPayments(this.userSession.officeUserId).subscribe((response: VisitCardPayments) => {
      setTimeout(() => {
        this.dialog.setLoaderVisible(false);
      });
      if (response && response.histories.length > 0) {
        this.router.navigate(['/me/me5002']);
      } else {
        this.getAddressUser();
      }
    }, (error: HttpError) => {
      setTimeout(() => {
        this.dialog.setLoaderVisible(false);
      });
      this.dialog.showError('MSG.ERROR');
    });
  }

  ngAfterViewInit() {
    $('#zipCode1').on('keydown', this.helper.numericOnly);
    $('#zipCode2').on('keydown', this.helper.numericOnly);
    $('#zipCode1').on('keypress', this.helper.numericOnly);
    $('#zipCode2').on('keypress', this.helper.numericOnly);
    this.helper.numbericOnlyPaste('zipCode1');
    this.helper.numbericOnlyPaste('zipCode2');
  }

  getAddressUser() {
      this.meetingService.getOfficeUser(this.userSession.officeId).subscribe(
        res => {
          this.contact = res.contact;
          this.createContractor = this.me5008Validator.createFormMe5008(this.userSession);
        }, (error: HttpError) => {
          this.dialog.showError('MSG.ERROR');
        });
  }

  isCheckContractor(checkContractor) {
    if (event) {
      this.checkContractor = !checkContractor;
    }
  }

  checkLength(event: any, field: string, limit: number) {
    this.createContractor.controls[field].setValue(event.target.value);
    if (event.target.value.length > limit) {
      this.createContractor.controls[field].setValue(event.target.value.slice(0, limit));
    } else {
      // do nothing...
    }
  }

  addCardContrac(): void {
    const resultValidate = this.me5008Validator.checkValidate(this.createContractor);
    this.formErrors = resultValidate['formErrors'];
    this.checkContractorError = !this.checkContractor;
    if (resultValidate['checkValidateForm'] && !this.checkContractorError) {
        this.model = this.createContractor.value;
        this.model.zipCode = this.createContractor.get('zipCode1').value + '-' + this.createContractor.get('zipCode2').value;
        // this.me5008Validator.checkSpaceBlank(this.createContractor);
          this.dialog.showMessage('warning', false, null, 'ME0058.TITLE_WARNING', null, 'MSG.OK', 'ME0058.BUTTON_CANCEL').subscribe(
            (dialogResult: DialogResult) => {
              if (dialogResult.isOk()) {
                setTimeout(() => {
                  this.dialog.setLoaderVisible(true);
                });
                this.meetingService.addCardContractor(this.model).subscribe(res => {
                    setTimeout(() => {
                      this.dialog.setLoaderVisible(false);
                    });
                    this.dialog.showMessage('success', false, null, 'ME0058.TITLE_SUCCESS', null,
                      'MSG.OK', null).subscribe(
                      (dialogResul: DialogResult) => {
                        if (dialogResul.isOk()) {
                          this.router.navigate(['/me/me5002']);
                        }
                      });
                  },
                  (error: HttpError) => {
                    setTimeout(() => {
                      this.dialog.setLoaderVisible(false);
                    });
                    this.dialog.showError('MSG.ERROR');
                  });
              }
            });
    }
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     this.addCardContrac();
  //   }
  // }
}

