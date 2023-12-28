import {Injectable} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Validator } from '../../../common/validation/validator';
import { TranslateService } from '@ngx-translate/core';
import { Contactus } from '../../../models/cm/contactus';

@Injectable()
export class Cm0002PageValidator {

  public validationMessage: any;
  public contactus = new Contactus();

  constructor(
    private formBuilder: FormBuilder,
    private translate: TranslateService
  ) { }

  setContactusForm(): FormGroup {
    this.getValidationMessage();
    return this.formBuilder.group({
      'contents': ['' , Validators.required],
      'replyMailAddress': ['', Validators.compose([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(64),
        Validators.pattern(Validator.emailRegex)
      ])]
    });
  }

  mapModel(data): Contactus {
    this.contactus.contents = data.contents;
    this.contactus.replyMailAddress = data.replyMailAddress;
    return this.contactus;
  }

  getValidationMessage() {
    this.translate.get(['CM0002', 'VAL']).subscribe((res) => {
      this.validationMessage = {
        'contents': {
          'required': res.CM0002.ERRORS.CONTENTS,
        },
        'replyMailAddress': {
          'required': res.VAL.REQUIRED_EMAIL,
          'maxlength': res.VAL.ILLEGAL_FORMAT_EMAIL,
          'pattern': res.VAL.ILLEGAL_FORMAT_EMAIL
        }
      };
    });
  }

}
