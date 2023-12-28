import {Component, HostListener, OnInit} from '@angular/core';
import { RegistrationService } from '../../../services/registration.service';
import { PrKeycodeSettings } from '../../../models/re/pr-keycode-settings';
import { FormGroup } from '@angular/forms';
import { Validator } from '../../../common/validation/validator';
import { RE0004Validator } from './re0004-validator';
import { SharedValueService } from '../../../services/shared-value.service';
import { HttpError } from '../../../common/error/http.error';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';

@Component({
  selector: 'app-re0004-page',
  templateUrl: './re0004-page.component.html',
  styleUrls: ['./re0004-page.component.scss'],
  providers: [Validator, RE0004Validator]
})
export class Re0004PageComponent implements OnInit {
  public model = new PrKeycodeSettings('', '');
  formErrors = new PrKeycodeSettings('', '');
  re004Form: FormGroup;
  dataDrJOY: any;
  status: boolean;
  errorKeyCode: string;
  constructor(
    private registrationService: RegistrationService,
    private dialogService: DialogService,
    private re0004Validator: RE0004Validator,
    private sharedValueService: SharedValueService,
    private translate: TranslateService,
    private router: Router) {
  }

  ngOnInit() {
    this.re004Form = this.re0004Validator.createForm();
    this.dataDrJOY = this.sharedValueService.getDrJOY();
    this.status = false;
  }

  postPrKeycodeSettings() {
    this.errorKeyCode = '';
    this.model = this.re004Form.value;
    this.re0004Validator.checkValidate(this.re004Form, this.formErrors);
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    if (this.re004Form.valid) {
      this.status = true;
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showMessage('warning', false, null, 'RE0004.CONFIRM_SAVE', null, 'MSG.YES', 'MSG.NO').subscribe(
        (res: DialogResult) => {
          setTimeout(() => {
            if (res.isOk()) {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(true);
              });
              this.registrationService.postPrKeycodeSettings(this.model).subscribe(
                (respone: any) => {
                  setTimeout(() => {
                    this.dialogService.setLoaderVisible(false);
                  });
                  this.dialogService.showMessage('success', false, 'RE0004.TITLE', 'RE0004.MESSAGE', null, 'MSG.OK', null).subscribe(
                    (rese: DialogResult) => {
                      if (rese.isOk()) {
                        this.status = false;
                        this.router.navigate(['/logout'], { replaceUrl: true });
                      }
                    });
                }, (error: HttpError) => {
                  setTimeout(() => {
                    this.dialogService.setLoaderVisible(false);
                  });
                  if (error.contains('RE0004.E001_1')) {
                    this.translate.get('MSG.RE0004').subscribe(msg => {
                      this.errorKeyCode = msg.E001_1;
                      this.status = false;
                    });
                  } else {
                    if(error.message === 'You have linked with medical'){
                      this.router.navigate(['/NotFound'], { replaceUrl: true });
                      this.status = false;
                    }else if(error.message === 'email is MEDICAL'){
                      this.dialogService.showError('MSG.RE0004.E003_3');
                      this.status = false;
                    }else{
                      this.dialogService.showError('MSG.ERROR');
                    }
                  }
                }
              );
            } else if (res.isCancel()) {
              this.status = false;
            }
          }, 500);
        }
      );
    } else {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
    }
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     this.postPrKeycodeSettings();
  //   }
  // }
}
