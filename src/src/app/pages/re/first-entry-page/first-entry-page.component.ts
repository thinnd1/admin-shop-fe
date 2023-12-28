import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { RegistrationService } from '../../../services/registration.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Helper } from '../../../common/helper';
import { Validator } from '../../../common/validation/validator';
import { FirstEntryValidator } from './first-entry-validator';
import { FirstEntrySettings } from '../../../models/re/first-entry-settings';
import {SpecialityArea} from "../../../models/ma/speciality-area";
import {HttpError} from "../../../common/error/http.error";
import {MasterService} from '../../../services/master.service';
import {DialogService} from '../../../services/dialog.service';
import {SpecialityType} from "../../../models/ma/speciality-type";
import {SpecialtyAreaConverter} from "../../../common/converter/specialty-area.converter";
import {CmsService} from '../../../services/cms.service';
import {TermOfUse} from '../../../models/cm/term_of_use';

declare const $: any;

@Component({
  selector: 'app-first-entry-page',
  templateUrl: './first-entry-page.component.html',
  styleUrls: ['./first-entry-page.component.scss'],
  providers: [Validator, FirstEntryValidator, SpecialtyAreaConverter]
})
export class FirstEntryPageComponent implements OnInit {

  public model = new FirstEntrySettings('', '', '', '', '', '', '', '', false, '', false, '', '', '', '', '', '', '', '');
  firstEntryForm: FormGroup;
  monthYears = [];
  dayOfMonths = [];
  genders: any;
  jobType: any;
  options_graduation_year = [];
  options_graduation_text = [];
  formErrors: any;
  selected: any;
  status: boolean;
  options: any;
  textTranslate: string;
  typeDefault: string;
  data: any;
  fieldIds = [];
  typeIds = [];
  listTypeIds = [];
  existedEmail:boolean;
  loginIdEmail: boolean;
  specializedDepartmentList: any;
  fieldIdDefault: any;
  typeIdDefault: any;
  nameArea: string;
  field: string;
  nameType: string;
  type: string;
  flagDefault: boolean;
  promise : any;
  count = 0;
  flag: boolean;
  public noResult: any;

  termOfUse: TermOfUse;
  constructor(
      private registrationService: RegistrationService,
      private translate: TranslateService,
      private dialogService: DialogService,
      private router: Router,
      private helper: Helper,
      private firstEntryValidator: FirstEntryValidator,
      private masterService: MasterService,
      private specialtyArea: SpecialtyAreaConverter,
      private cmsService: CmsService
  ) {
    this.firstEntryForm = this.firstEntryValidator.createFromFirstEntry(this.model);
    this.formErrors = this.firstEntryValidator.errors;
    this.status = true;
    this.translate.get(['RE0016', 'COMMON_LABEL']).subscribe((res) => {
      this.genders = [
        { Id: '0', Name: res.COMMON_LABEL.MALE },
        { Id: '1', Name: res.COMMON_LABEL.FEMALE }
      ];
    });
    this.masterService.getSpecialityAreas().subscribe(
        (specialtyAreas: SpecialityArea) => {
          this.fieldIds = this.specialtyArea.convertSpecialtyArea(specialtyAreas);
        });

    this.promise =  new Promise((resolve, reject)=> {
      this.masterService.getSpecialityTypes().subscribe(
          (specialtyType: SpecialityType) => {
            resolve(1);
            this.typeIds = this.specialtyArea.convertSpecialtyType(specialtyType);
            localStorage.setItem('first_entry_type',JSON.stringify(this.typeIds));
          });
    });


  }

  ngOnInit() {
    this.data = JSON.parse(localStorage.getItem('first_entry'));
    if (!$.isEmptyObject(this.data)) {
      this.flag = true;
    }
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });

    this.cmsService.getTermOfUseOne().mergeMap((res: TermOfUse) => {
      this.termOfUse = res;
      return this.registrationService.getFirstEntrySettings();
    }).subscribe((settings) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      if (!$.isEmptyObject(this.data)) {
        if (localStorage.getItem('existed_email')) {
          this.translate.get('MSG').subscribe(
              res => {
                this.formErrors['newEmailAddress'] = res.EMAIL_EXISTED;
              });
        }
        this.model = this.data;
        this.specializedDepartmentList = this.data.specializedDepartment;
        if (this.validateEmail(this.model.loginId) == true) {
          this.loginIdEmail = true;
        }
        this.firstEntryForm = this.firstEntryValidator.createFromFirstEntry(this.model);
        if (this.model.specializedDepartmentField) {
          this.listTypeIds = JSON.parse(localStorage.getItem('first_entry_type')).filter((item) => (item.field_id === this.model.specializedDepartmentField.id));
        }
        this.status = false;
      } else {
        this.model = settings;
        this.specializedDepartmentList = JSON.parse(JSON.stringify(settings)).specializedDepartmentList;
        if (this.validateEmail(this.model.loginId) == true) {
          this.loginIdEmail = true;
        }
        this.firstEntryForm = this.firstEntryValidator.createFromFirstEntry(this.model);
        this.firstEntryForm.controls.dayBirth.setValue('');
        this.firstEntryForm.controls.monthBirth.setValue('');
        this.firstEntryForm.controls.yearBirth.setValue('');
        this.firstEntryForm.controls.specializedDepartmentField.setValue(this.specialtyArea.idDefault);
        this.firstEntryForm.controls.specializedDepartmentType.setValue(this.specialtyArea.idDefault);
      }
      if (this.specializedDepartmentList.length > 0) {
        this.nameArea = this.specializedDepartmentList[0].nameArea;
        this.field = this.specializedDepartmentList[0].fieldId;
        this.nameType = this.specializedDepartmentList[0].nameType;
        this.type = this.specializedDepartmentList[0].typeId;
        this.fieldIdDefault = {text: this.nameArea, id: this.field};
        this.typeIdDefault = {text: this.nameType, id: this.type, field_id: this.field };
        this.flagDefault = true;
      }
      this.graduationYearInit();
      // check jobtype is '医師'
      if (this.model.jobType !== 'J0001') {
        $('#specDepart').hide();
        delete this.formErrors['specializedDepartmentField'];
        delete this.formErrors['specializedDepartmentType'];
        const form = <FormGroup>this.firstEntryForm;
        form.removeControl('specializedDepartmentField');
        form.removeControl('specializedDepartmentType');
      } else {
        $('#specDepart').show();
      }
    }, error => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
    if (this.translate.currentLang === 'ja') {
      this.noResult = '結果がありません';
    } else {
      this.noResult = 'No Results Found';
    }

    this.translate.get('RE0023.RE0023_ERROR').subscribe((res: any) => {
      this.textTranslate = res.SPECIALIZE_DEPARTMENT_PLACEHOLDER;
      this.typeDefault = res.SPECIALIZE_DEPARTMENT;
      this.options = {
        placeholder: this.textTranslate,
        language: {
          noResults: () => {
            return this.noResult;
          }
        }
      };
    });
  }

  validateEmail(emailField) {
    const reg = Helper.emailRegex;
    if (reg.test(emailField) === false) {
      return false;
    }
    return true;
  }
  /**
   * convert specializedDepartment format select2
   * @param object
   */

  /**
   * filter specializedDepartmentType with specializedDepartmentField
   * @param event
   */
  changeFields(event) {
    if (this.typeIds.length > 0) {
      this.subChangeFields(event);
    }else {
      this.promise.then(result => {
        this.subChangeFields(event);
      });

    }
  }
  subChangeFields(event) {
    const firstType = {'id': this.specialtyArea.idDefault, 'text': this.typeDefault, 'field_id': ''};
    const form = <FormGroup>this.firstEntryForm;
    if (event.id === this.specialtyArea.idDefault) {
      form.controls.specializedDepartmentField.setValue(this.specialtyArea.idDefault);
      form.controls.specializedDepartmentType.setValue(this.specialtyArea.idDefault);
      this.listTypeIds = [];
      this.status = true;
    } else {
      this.listTypeIds = this.typeIds.filter((item) => (item.field_id === event.id));
      this.listTypeIds.splice(0, 0, firstType);
      if(this.fieldIdDefault && event.id == this.fieldIdDefault.id){
        form.controls.specializedDepartmentType.setValue(this.typeIdDefault);
        this.fieldIdDefault = event;
      }else{
        form.controls.specializedDepartmentType.setValue(this.specialtyArea.idDefault);
      }
      this.status = false;
    }
  }

  /**
   * RE0023 call date when select year and month
   */
  changeDate() {
    const value = this.helper.changeDate('year', 'month');
    this.monthYears = value.months;
    this.dayOfMonths = value.days;
    const day = $('#day').val();
    if (this.dayOfMonths.indexOf(day) === -1) {
      $('#day').val('');
      this.firstEntryForm.controls.dayBirth.setValue('');
    }
  }

  /**
   * RE0023 graduation year
   */
  graduationYearInit() {
    const value = this.helper.parseBirthDate('');
    this.monthYears = value.months;
    this.dayOfMonths = value.days;
    if (this.dayOfMonths) {
      for (let i = 1; i <= 31; i++) {
        const d = (i < 10 ? '0' : '') + i;
        this.dayOfMonths.push(d);
      }
    }
    const year = this.helper.graduationYearOptions(89, true);
    this.options_graduation_year = year[0];
    this.options_graduation_text = year[1];
  }

  // add control mail address
  addControlMailAddress() {
    const form = <FormGroup>this.firstEntryForm;
    this.formErrors['newEmailAddress'] = this.formErrors['newEmailAddress'];
    this.formErrors['newEmailAddressConfirm'] = this.formErrors['newEmailAddressConfirm'];
    form.addControl('newEmailAddress', new FormControl('', [Validators.required, Validators.pattern(Helper.emailRegex)]));
    form.addControl('newEmailAddressConfirm', new FormControl('', [Validators.required, Validators.pattern(Helper.emailRegex)]));
  }

  // delete control mail address
  deleteControlMailAddress() {
    const form = <FormGroup>this.firstEntryForm;
    delete this.formErrors['newEmailAddress'];
    delete this.formErrors['newEmailAddressConfirm'];
    form.removeControl('newEmailAddress');
    form.removeControl('newEmailAddressConfirm');
  }

  // add control address mail
  addControl() {
    this.addControlMailAddress();
  }

  /**
   * RE0023 set logID with email
   */
  changeCheckBox() {
    if (!this.firstEntryForm.value.emailNotification && !this.firstEntryForm.value.newEmailAddress
        && !this.firstEntryForm.value.newEmailAddressConfirm) {
      this.deleteControlMailAddress();
    } else if (this.firstEntryForm.value.emailNotification && !this.firstEntryForm.value.newEmailAddress
        || !this.firstEntryForm.value.newEmailAddressConfirm) {
      this.addControlMailAddress();
    } else if (!this.firstEntryForm.value.emailNotification && this.firstEntryForm.value.newEmailAddress
        && this.firstEntryForm.value.newEmailAddressConfirm) {
      this.addControlMailAddress();
    }
  }

  /**
   * put data to Re0025
   */
  putFirstEntrySettings() {
    this.changeCheckBox();
    const resultValidate = this.firstEntryValidator.checkValidate(this.firstEntryForm);
    this.formErrors = resultValidate['formErrors'];
    let data = this.firstEntryForm.value;
    data['specializedDepartment'] = [];
    if(data.specializedDepartmentField){
      let element = {
        'fieldId' : data.specializedDepartmentField.id,
        'nameArea' : data.specializedDepartmentField.text,
        'typeId' : data.specializedDepartmentType.id,
        'nameType' : data.specializedDepartmentType.text,
      }
      data['specializedDepartment'].push(element);
    }

    // if(this.specializedDepartmentList.length > 1){
    //   for(let i = 1; i< this.specializedDepartmentList.length; i++){
    //     data['specializedDepartment'].push(this.specializedDepartmentList[i]);
    //   }
    // }

    this.helper.gotoError();
    if (this.firstEntryForm.valid && resultValidate['checkValid']) {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      localStorage.setItem('first_entry', JSON.stringify(data));
      this.router.navigate(['/re/first-entry-confirm']);
    }
  }

  // Event check reload page
  @HostListener('window:beforeunload', ['$event']) checkLoadPage(event) {
    localStorage.removeItem('first_entry');
    localStorage.removeItem('existed_email');
    localStorage.removeItem('first_entry_type');
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     this.putFirstEntrySettings();
  //   }
  // }

}
