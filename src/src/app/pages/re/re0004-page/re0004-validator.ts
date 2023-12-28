import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Validator } from '../../../common/validation/validator';
import { PrKeycodeSettings } from '../../../models/re/pr-keycode-settings';
@Injectable()
export class RE0004Validator {
    validationMessage: any;

    constructor(private fb: FormBuilder, private translate: TranslateService, private validator: Validator) {
    }
    createForm() {
        let RE0004Form: FormGroup;
        this.getErrorValidate();
        RE0004Form = this.fb.group({
            'mailAddress': ['', [
                Validators.required,
                Validators.maxLength(64),
                Validators.pattern(Validator.emailRegex)]
            ],
            'keyCode': ['', Validators.required]
        });
        return RE0004Form;
    }

    getErrorValidate() {
        this.translate.get(['MSG', 'VAL']).subscribe((res: any) => {
            this.validationMessage = {
                'mailAddress': {
                    'required': res.VAL.RE0004.REQUIRED_EMAIL,
                    'maxlength': res.VAL.RE0004.VALID_EMAIL,
                    'pattern': res.VAL.RE0004.VALID_EMAIL
                },
                'keyCode': {
                    'required': res.MSG.RE0004.E002_2
                }
            };
        });
    }

    checkValidate(RE0004Form: FormGroup, formErrors: PrKeycodeSettings) {
        if (!RE0004Form) {
            return false;
        }
        const form = RE0004Form;
        for (const field in formErrors) {
            if (formErrors.hasOwnProperty(field)) {
                formErrors[field] = this.validator.validateForm(form, field, this.validationMessage[field]);
            }
        }
    }
}
