import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Validator} from '../../../common/validation/validator';
import {TranslateService} from '@ngx-translate/core';
import {Injectable} from '@angular/core';
import {UpdateProtocol} from '../../../models/ph/update-protocol';

/**
 * Created by banpt on 5/4/2018.
 */
@Injectable()
export class UpdateProtocolValidator {
  formErrors = {
    protocolItem0: '',
    protocolItem1: '',
    protocolItem2: '',
    protocolItem3: '',
    otherInfo: '',
    contactInfo: '',
    protocolUsageStartDate: '',
    revisionHistory: ''
  };
  validationForm: any = {};
  validationMessages: any = {};
  form: FormGroup;
  constructor(private translate: TranslateService,
              private validator: Validator,
              private fb: FormBuilder) {
    this.getErrorValidate();
  }

  createForm(model: UpdateProtocol) {
    let form: FormGroup;
    form = this.fb.group({
        'protocolItem0': [model.protocolItem0, [this.validator.validateAllSpace(), Validators.maxLength(3000)]],
        'protocolItem1': [model.protocolItem1, [this.validator.validateAllSpace(), Validators.maxLength(3000)]],
        'protocolItem2': [model.protocolItem2, [this.validator.validateAllSpace(), Validators.maxLength(3000)]],
        'protocolItem3': [model.protocolItem3, [this.validator.validateAllSpace(), Validators.maxLength(3000)]],
        'otherInfo': [model.otherInfo, [this.validator.validateAllSpace(), Validators.maxLength(3000)]],
        'contactInfo': [model.contactInfo, [this.validator.validateAllSpace(), Validators.maxLength(3000)]],
        'protocolUsageStartDate': [model.protocolUsageStartDate, [this.validator.validateAllSpace(), Validators.maxLength(3000)]],
        'revisionHistory': [model.revisionHistory, [this.validator.validateAllSpace(), Validators.maxLength(3000)]],
    });
    return form;
  }

  checkValidate(myForm, formErrors) {
    if (!myForm) {
      return false;
    }
    this.getErrorValidate();
    for (const field in formErrors) {
      if (formErrors.hasOwnProperty(field)) {
        formErrors[field] = this.validator.validateForm(myForm, field, this.validationMessages[field]);
      }
    }
  }

  getErrorValidate() {
    this.translate.get('PHARMACY.PH0007.VALIDATE').subscribe((res: any) => {
      this.validationMessages = {
        'protocolItem0': {
          'required': res.PROTOCOL_ITEM_0_REQUIRED,
          'maxlength': res.PROTOCOL_ITEM_0_LENGTH
      },
        'protocolItem1': {
          'required': res.PROTOCOL_ITEM_1_REQUIRED,
          'maxlength': res.PROTOCOL_ITEM_1_LENGTH
        },
        'protocolItem2': {
          'required': res.PROTOCOL_ITEM_2_REQUIRED,
          'maxlength': res.PROTOCOL_ITEM_2_LENGTH
        },
        'protocolItem3': {
          'required': res.PROTOCOL_ITEM_3_REQUIRED,
          'maxlength': res.PROTOCOL_ITEM_3_LENGTH
        },
        'otherInfo': {
          'required': res.OTHER_INFO_REQUIRED,
          'maxlength': res.OTHER_INFO_LENGTH
        },
        'contactInfo': {
          'required': res.CONTACT_INFO_REQUIRED,
          'maxlength': res.CONTACT_INFO_LENGTH
        },
        'protocolUsageStartDate': {
          'required': res.PROTOCOL_USAGE_START_DATE_REQUIRED,
          'maxlength': res.PROTOCOL_USAGE_START_DATE_LENGTH
        },
        'revisionHistory': {
          'required': res.REVISION_HISTORY_REQUIRED,
          'maxlength': res.REVISION_HISTORY_LENGTH
        },
      };
    });
  }
}
