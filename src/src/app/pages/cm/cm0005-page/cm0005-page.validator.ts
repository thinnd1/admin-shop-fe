import {TranslateService} from '@ngx-translate/core';
import {Injectable} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OfficeInfo} from '../../../models/cm/office_info';

@Injectable()
export class Cm0005PageValidator {

  private industryTypes: string[];

  constructor(
    private translate: TranslateService,
    private formBuilder: FormBuilder
  ) { }

  setNewInfoForm(industryTypes: string[]): FormGroup {
    this.industryTypes = industryTypes;
    return this.formBuilder.group({
      'industryAll': [true],
      'industries': this.formBuilder.array(
        industryTypes.map((x) => {
            return [true];
        }), Validators.pattern(/(true)/)),
      'offices': ['', Validators.required],
      'signature': [],
      'title': ['', Validators.required],
      'body': ['', Validators.required],
      'files': []
    });
  }

  getIndustries(industries): string[] {
    const toIndustries = [];
    industries.forEach((val, idx) => {
       if (val) {
          toIndustries.push(this.industryTypes[idx]);
       }
    });
    return toIndustries;
  }

  mapModel(formModel, offices, attachmentFileIds): OfficeInfo {
    const officeInfo = new OfficeInfo();
    officeInfo['title'] = formModel.title;
    officeInfo['body'] = formModel.body;
    officeInfo['signature'] = formModel.signature;
    officeInfo['toIndustryIds'] = this.getIndustries(formModel.industries);

    formModel.offices.forEach((val) => {
      officeInfo['toOfficeIds'].push(val.id);
    });
    const count = offices.filter(val => (val.id && val.id !== 'ALL')).length;
    if (formModel.industryAll) {
      if (count <= formModel.offices.length) {
        officeInfo['isToAll'] = true;
      }
    }

    officeInfo['attachmentFileIds'] = attachmentFileIds;

    return officeInfo;
  }

}
