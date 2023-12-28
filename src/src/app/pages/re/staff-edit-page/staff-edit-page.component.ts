import {AfterViewInit, Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import {Subscription} from 'rxjs/Rx';
import {Router, ActivatedRoute,NavigationEnd} from '@angular/router';

import {RegistrationService} from '../../../services/registration.service';
import {SharedValueService} from '../../../services/shared-value.service';
import {StaffEditSettings} from '../../../models/re/staff-edit-settings';
import {TranslateService} from '@ngx-translate/core';
import {StaffEditSettingsSaveResult} from '../../../models/re/staff-edit-settings-save-result';
import {DepartmentSettings} from '../../../models/re/department-settings';
import {Helper} from '../../../common/helper';
import {HttpStatusCode} from '../../../common/http_status_code';
import {StaffEditValidator} from './staff-edit-validator';
import {HttpError} from '../../../common/error/http.error';
import {HttpStatus} from '../../../common/http.status';
import {JobType} from '../../../models/ma/job-type';
import {MasterService} from '../../../services/master.service';
import {SpecialityArea} from '../../../models/ma/speciality-area';
import {AccountStatus} from '../../../models/ba/user-session';
import {SpecialityType} from '../../../models/ma/speciality-type';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';
import {SpecialtyAreaConverter} from '../../../common/converter/specialty-area.converter';
import {ImageCropperComponent} from '../../../components/image-cropper/image-cropper.component';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';
import { DateConverter } from '../../../common/converter/date.converter';
import {Title} from '@angular/platform-browser';

declare const $: any;

@Component({
  selector: 'app-staff-edit-page',
  templateUrl: './staff-edit-page.component.html',
  styleUrls: ['./staff-edit-page.component.scss'],
  providers: [StaffEditValidator, SpecialtyAreaConverter, ImageCropperComponent]
})
export class StaffEditPageComponent implements OnInit, AfterViewInit {
  @ViewChild('imageCropper1')
  protected imageCropperComponent: ImageCropperComponent;
  public resetPassword = false;
  public data: any = {};
  public accountLockFlag: boolean;
  public userId: string;
  public subscription: Subscription;
  jobTypes: any;
  fieldIds = [];
  typeIds = [];
  listDepartment = [];
  listDepartmentDisabled = [];
  myForm: FormGroup;
  formErrors = {
    'firstName': '',
    'imageUrl': '',
    'lastName': '',
    'firstNameKana': '',
    'lastNameKana': '',
    'newPassword': '',
    'confirmNewPass': '',
    'phsNo': '',
    'mobileNo': '',
    'specializedDepartment': []
  };
  genders = [];
  publishingTypes = [];
  // declare for birthday
  birthdayFormat = {year: '', month: '', day: ''};
  checkNullBirthDate: boolean;
  // declare for phone number
  arrayMobile = [];
  // declare for department
  listDe = new Array();
  depart_id: any;
  departSelected: any;
  // graduation year
  options_graduation_year = [];
  options_graduation_text = [];
  graduation_year_text;
  gra_date: any;
  addField: string;
  addType: string;
  option: any;
  noResult: string;
  optionSelect2: any;
  isDr: boolean;
  public model = new StaffEditSettings();
  public modelOrigin = new StaffEditSettings();
  public modelDepartmentSettings = Array(new DepartmentSettings());
  profileImage: File;
  tempJobType: string;
  userSession;
  public _defaultPath = '/assets/img/user-no-image.png';
  public flagCrop = false;
  public listSpecializedDepartment: any;
  path_image = '';
  flagImgDestroy: any;
  flagImgUrl: any;
  officeId: any;
  officeUserId: any;
  promise: any;
  deptParent: any;

  constructor(public registrationService: RegistrationService,
              public sharedValueService: SharedValueService,
              public formBuilder: FormBuilder,
              public translate: TranslateService,
              public dialogService: DialogService,
              public activatedRoute: ActivatedRoute,
              public helper: Helper,
              public staffEditValidator: StaffEditValidator,
              private router: Router,
              private masterService: MasterService,
              private storage: FirebaseStorage,
              private specialtyArea: SpecialtyAreaConverter,
              private titleService: Title,
              private dateConverter: DateConverter) {

    this.myForm = this.staffEditValidator.staffEditForm();

    this.translate.get(['RE0016', 'COMMON_LABEL']).subscribe((res) => {
      this.genders = [
        {Id: '0', Name: res.COMMON_LABEL.MALE},
        {Id: '1', Name: res.COMMON_LABEL.FEMALE}
      ];
      this.publishingTypes = [
        {Id: '0', Name: res.RE0016.WHOLE_PUBLIC}, {Id: '1', Name: res.RE0016.ONLY_IN_HOSPITAL}, {Id: '2', Name: res.RE0016.NO_PUBLIC}
      ];
      this.addField = res.COMMON_LABEL.SELECT_DEPARTMENT_FIELD;
      this.addType = res.COMMON_LABEL.SELECT_DEPARTMENT_TYPE;
      this.option = {
        placeholder: this.addType,
        language: {
          noResults: () => {
            return this.noResult;
          }
        }
      };
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
          });
    });
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.titleService.setTitle(this.translate.instant('DOC_TITLE.STAFF_EDIT'));
    this.subscription = this.activatedRoute.params.subscribe(params => {
      this.userId = params['userId'];
    });
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.userSession = this.sharedValueService.getUserSession();
    this.userSession.managementAuthority === 'MP_1' ? (this.deptParent = '') : (this.deptParent = this.userSession.deptId);
    this.registrationService.getStaffEditSettings(this.userId).subscribe((settings: StaffEditSettings) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.model = settings;
        this.depart_id = this.model.department.id;
        this.modelOrigin = settings;
        this.officeId = this.model.officeId;
        this.officeUserId = this.model.officeUserId;
        this.path_image = '/img/staff/face/' + this.model.officeId + '/' + this.model.officeUserId;
        if(!this.model.imageUrl){
          this.flagCrop = true;
          this.flagImgUrl = true;
        }
        this.graduationYearInit();
        this.formStaffEdit();
        this.roleInit();
        this.birthFormat();
        this.isDr = this.model.jobType === 'J0001';
        this.tempJobType = this.model.jobType;
        if(this.isDr && this.model.specializedDepartment && this.model.specializedDepartment.length === 0){
          this.addSpecializedDepartment();
        }
      },
      (error: HttpError) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      });

    this.genDepartmentSelect();
    this.getListJobType();
    if (this.translate.currentLang === 'ja') {
      this.noResult = '結果がありません';
    } else {
      this.noResult = 'No Results Found';
    }
    this.optionSelect2 = {
      language: {
        noResults: () => {
          return this.noResult;
        }
      }
    };
  }

  dataConvert(date:string,format:string){
    return this.dateConverter.moment(date,format);
  }

  ngAfterViewInit() {
    $.fn.autoKana('#surname', '#surname-kana');
    $.fn.autoKana('#name', '#name-kana');
  }

  imgUploadError(event: any){
    if(event === false){
      this.dialogService.showError('IMAGE_CROPPER.IMAGE_MAX_LENGTH');
    }
  }

  imgDestroy(event: any){
    this.flagImgDestroy = true;
  }

  /**
   * RE0016 function call api load list jobType
   */
  getListJobType() {
    this.masterService.getJobType().subscribe(
      (jobType: JobType) => {
        this.jobTypes = jobType.jobTypeList;
      }, (error: HttpError) => {
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  /**
   * RE0016 function load role init and check account status
   */
  roleInit() {
    this.model.birthDate ? this.checkNullBirthDate = true : this.checkNullBirthDate = false;
    if (new AccountStatus(this.model.accountStatus).isLocking === true) {
      return this.accountLockFlag = true;
    } else {
      return this.accountLockFlag = false;
    }
  }

  /**
   * RE0016 unlock account locked
   * param userID
   */
  unlockAccount() {
    this.dialogService.showMessage('warning', false, null, 'MSG.RE0016.E002_1', null, 'MSG.YES', 'MSG.NO').subscribe(
      (res: DialogResult) => {
        setTimeout(() => {
          if (res.isOk()) {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(true);
            });
            this.registrationService.putAccountUnlock(this.userId).subscribe(
              (response: StaffEditSettingsSaveResult) => {
                setTimeout(() => {
                  this.dialogService.setLoaderVisible(false);
                });
                this.checkStatusResponse(response.status, 'lock', 'MSG.RE0016.P001_1');
              },
              (error: HttpError) => {
                setTimeout(() => {
                  this.dialogService.setLoaderVisible(false);
                });
                this.dialogService.showError('MSG.ERROR');
              }
            );
          }
        }, 400);
      }
    );
  }

  /**
   * RE0016 lock account
   * param userID
   */
  lockAccount() {
    this.dialogService.showMessage('warning', false, null, 'MSG.RE0016.E002_2', null, 'MSG.YES', 'MSG.NO').subscribe(
      (res: DialogResult) => {
        setTimeout(() => {
          if (res.isOk()) {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(true);
            });
            this.registrationService.putAccountLock(this.userId).subscribe(
              (response: StaffEditSettingsSaveResult) => {
                setTimeout(() => {
                  this.dialogService.setLoaderVisible(false);
                });
                this.checkStatusResponse(response.status, 'lock', 'MSG.RE0016.P002_1');
              },
              (error: HttpError) => {
                setTimeout(() => {
                  this.dialogService.setLoaderVisible(false);
                });
                this.dialogService.showError('MSG.NOT_BLOCK_ADMINISTRATOR');
              }
            );
          }
        }, 400);
      }
    );
  }

  /**
   * RE0016 delete account
   * param userID
   */
  deleteAccount() {
    let html = '';
    let html1 = '';
    let checkboxObj = {};
    this.translate.get('MSG').subscribe((res) => {
      html = res.RE0016.E003_3_0 + '<span class="text-danger">' + res.RE0016.E003_3_1 + '</span>' + res.RE0016.E003_3_2 + '<span class="text-danger">' + res.RE0016.E003_3_3 + '</span>' + res.RE0016.E003_3_4;
      html1 = '<p>' + res.RE0016.E003_1_1 + '</p>' + res.RE0016.E003_1_2;
      checkboxObj = {checkedDelete: false, confirmText: res.CONFIRMED, isConfirm: true, disablePositive: true};
    });
    if (this.model.funcAuthority.indexOf(7) != -1) {
      this.dialogService.showCheckboxDialog('warning', false, null, null,
        html1, 'MSG.OK', 'MSG.CANCEL', checkboxObj, null, null).subscribe(
        (res: any) => {
          setTimeout(() => {
            if (res.isOk()) {
              this.dialogService.showMessage('warning', false, 'MSG.RE0016.E003_2', null, html, 'BTN.DELETE', 'MSG.CANCEL').subscribe(
                (resp: DialogResult) => {
                  if (resp.isOk()) {
                    this.callApiDeleteAccount();
                  }
                }
              );
            }
          }, 400);
        }
      );
    } else {
      this.dialogService.showMessage('warning', false, 'MSG.RE0016.E003_2', null, html, 'BTN.DELETE', 'MSG.CANCEL').subscribe(
        (res: DialogResult) => {
          setTimeout(() => {
            if (res.isOk()) {
              this.callApiDeleteAccount();
            }
          }, 400);
        }
      );
    }
  }

  callApiDeleteAccount() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.registrationService.putDeleteAccount(this.userId).subscribe(
      (response: StaffEditSettingsSaveResult) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.checkStatusResponse(response.status, 'delete', 'MSG.RE0016.P003_1');
      },
      (error: HttpError) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.NOT_DELETE_ADMINISTRATOR_1');
      }
    );
  }

  /**
   * RE0016 format date of birth
   */
  birthFormat() {
    if (this.model.birthDate) {
      const birthDate = new Date(this.dataConvert(this.model.birthDate,'L'));
      const heisei = birthDate.getFullYear() - 1988;
      let wareki = '';
      if (heisei > 1) {
        wareki = '平成' + heisei;
      } else if (heisei === 1) {
        wareki = '平成元';
      } else if (heisei < 1) {
        wareki = '昭和' + (63 + heisei);
      }
      this.birthdayFormat = {
        year: birthDate.getFullYear().toString() + '(' + wareki + ')',
        month: ('0' + (birthDate.getMonth() + 1)).slice(-2),
        day: ('0' + birthDate.getDate()).slice(-2)
      };
      const content = this.translate.instant(['RE0020.DATE_OF_BIRTH'],
        {'value1': this.birthdayFormat.year, 'value2': this.birthdayFormat.month, 'value3': this.birthdayFormat.day});
      return content;
    } else {
      // do nothing...
    }
  }

  /**
   * RE0016 api response result
   */
  checkStatusResponse(status, type, message) {
    if (status === HttpStatusCode.HTTP_PUT_SUCCESS && type === 'lock' && this.userId !== this.userSession.userId) {
      this.dialogService.showSuccess(message).subscribe(
        (res: any) => {
          this.accountLockFlag = !this.accountLockFlag;
          if(this.userId === this.userSession.userId ){
            this.router.navigate(['/logout']);
          };
        }
      );
    } else if (status === HttpStatus.OK && type === 'delete' && this.userId !== this.userSession.userId) {
      this.dialogService.showSuccess(message).subscribe(
        (res: any) => {
          this.router.navigate(['re/staff-admin']);
        }
      );
    } else if (status === HttpStatusCode.HTTP_PUT_SUCCESS && type === 'save') {
      this.resetPassword = false;
      this.dialogService.showMessage('success', false, null, 'MSG.SAVED', null, 'OK', null).subscribe(
        (resp: DialogResult) => {
          if (resp.isOk()) {
            this.registrationService.getStaffListDetail(this.userId, true ).subscribe(
              (next) => {}
            );
            this.storage.downloadURL(this.path_image, true ).subscribe(
              (next) => {}
            );
          }
        });
    } else {
      // do not process
    }
  }

  /**
   * RE0016 get data from api and validate form
   */
  formStaffEdit() {
    this.getSpecializedDepartment();
    this.myForm = this.staffEditValidator.formStaffEdit(this.model, this.gra_date);
    this.helper.numbericOnlyPaste('phsNo');
  }

  resetPass() {
    this.resetPassword = !this.resetPassword;
  }

  /**
   * RE0016 get list department from api
   */
  genDepartmentSelect() {
    this.registrationService.getDepartmentSettings().subscribe(
      (res: DepartmentSettings[]) => {
        this.modelDepartmentSettings = res;
        const step = 1;
        if(this.deptParent !== ''){
          const listDepartmentAuthoritySet = this.helper.findDepartment(new Array(), this.modelDepartmentSettings, this.deptParent);
          this.listDe = this.helper.createArrayDepartment(new Array(), listDepartmentAuthoritySet, '', step, this.userSession.deptName);
        }else{
          this.listDe = this.helper.createArrayDepartment(new Array(), this.modelDepartmentSettings, '', step);
        }
      },
      (error: HttpError) => {
        this.dialogService.showError('MSG.ERROR');
      });
  }

  /**
   * RE0016 graduation year
   */
  graduationYearInit() {
    const value = this.helper.graduationYearOptions(89);
    this.options_graduation_year = value[0];
    this.options_graduation_text = value[1];
    const gra_date = this.model.graduationDate !== '' ? new Date(this.dataConvert(this.model.graduationDate,'L')) : new Date();
    const graduation_year = gra_date.getFullYear();
    this.gra_date = gra_date.getFullYear();
    this.graduation_year_text = this.helper.graduationYearText(graduation_year);
  }

  changeYear(event) {
    this.graduation_year_text = this.helper.graduationYearText(event);
  }

  /**
   * RE0016 validate phone number
   */
  numericWithDash(event) {
    this.helper.numericOnly(event);
  }

  /**
   * RE0016 specializedDepartment add and delete
   */
  initSpecialty() {
    return this.formBuilder.group({
      fieldId: [{'id': this.specialtyArea.idDefault, 'text': this.addField}, [Validators.required]],
      typeId: [{'id': this.specialtyArea.idDefault, 'text': this.addType, 'field_id': ''}, [Validators.required]]
    });
  }

  get formData() {
    return <FormArray>this.myForm.get('specializedDepartment');
  }

  getSpecializedDepartment() {
    this.listSpecializedDepartment = new Array();
    if (this.model.specializedDepartment) {
      for (let i = 0; i < this.model.specializedDepartment.length; i++) {
        const objDepartment = {};
        if (this.typeIds.length > 0) {
          const field = this.fieldIds.filter((item) => item.id === this.model.specializedDepartment[i]['fieldId'])[0];
          const type = this.typeIds.filter((item) => item.id === this.model.specializedDepartment[i]['typeId'])[0];
          if (field) {
            objDepartment['field'] = field.text;
            objDepartment['fieldId'] = field.id;
          }
          if (type) {
            objDepartment['type'] = type.text;
            objDepartment['typeId'] = type.id;
          }
          if (Object.keys(objDepartment).length > 0) {
            this.listSpecializedDepartment.push(objDepartment);
          }
        }else {
          this.promise.then(result => {
            const field = this.fieldIds.filter((item) => item.id === this.model.specializedDepartment[i]['fieldId'])[0];
            const type = this.typeIds.filter((item) => item.id === this.model.specializedDepartment[i]['typeId'])[0];
            if (field) {
              objDepartment['field'] = field.text;
              objDepartment['fieldId'] = field.id;
            }
            if (type) {
              objDepartment['type'] = type.text;
              objDepartment['typeId'] = type.id;
            }
            if (Object.keys(objDepartment).length > 0) {
              this.listSpecializedDepartment.push(objDepartment);
            }
          });
        }
      }
    }
  }

  addSpecializedDepartment() {
    event.preventDefault();
    this.listDepartment.push({'id': this.specialtyArea.idDefault, 'text': this.addType, 'field_id': ''});
    const control = <FormArray>this.myForm.controls['specializedDepartment'];
    const addCtrl = this.initSpecialty();
    control.push(addCtrl);
    this.listDepartmentDisabled.push(true);
    this.formErrors.specializedDepartment.push({'fieldId': '', 'typeId': ''});
  }

  checkValueChangeSpecializedDepartment(index: number, name: string, event) {
    const listSpecializedDepartment = <FormArray> this.myForm.controls.specializedDepartment;
    const specializedDepartment = <FormGroup> listSpecializedDepartment.controls[index];

    if (name === 'fieldId') {

      if (event) {
        if (specializedDepartment.get('fieldId').value.id !== event.id) {
          specializedDepartment.controls.fieldId.setValue(event);
        }
      }

      specializedDepartment.controls.typeId.setValue({'id': this.specialtyArea.idDefault, 'text': this.addType, 'field_id': ''});
      const fieldID = specializedDepartment.get('fieldId').value.id;

      if (fieldID !== this.specialtyArea.idDefault) {
        this.listDepartmentDisabled[index] = false;
        this.getListDepartment(fieldID, index);
      } else {
        this.listDepartmentDisabled[index] = true;
        this.listDepartment[index] = [];
      }

      //this.getListDepartment(fieldID, index);
    } else {
      if (name === 'typeId') {
        if (specializedDepartment.get('typeId').value.id !== event.id) {
          specializedDepartment.controls.typeId.setValue(event);
        }
      }
    }
  }

  getListDepartment(fieldID: any, index: any) {
    if (this.listDepartment[index]) {
      this.listDepartment[index] = this.typeIds.filter((item) => item.field_id === fieldID);
      this.listDepartment[index].splice(0, 0, {'id': this.specialtyArea.idDefault, 'text': this.addType, 'field_id': ''});
    } else {
      this.listDepartment.push(this.typeIds.filter((item) => item.field_id === fieldID));
      this.listDepartment[this.listDepartment.length - 1].splice(0, 0, {
        'id': this.specialtyArea.idDefault,
        'text': this.addType,
        'field_id': ''
      });
    }
  }

  removeSpecializedDepartment(i: number) {
    let html = '';
    this.translate.get('MSG').subscribe(msg => {
      html = msg.RE0016.E006_1;
    });
    this.dialogService.showMessage('warning', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
      (res: DialogResult) => {
        setTimeout(() => {
          if (res.isOk()) {
            const control = <FormArray>this.myForm.controls['specializedDepartment'];
            control.removeAt(i);
            this.dialogService.showSuccess('MSG.DELETED');
            this.listDepartmentDisabled.splice(i, 1);
            this.listDepartment.splice(i, 1);
            this.formErrors.specializedDepartment.splice(i, 1);
          }
        }, 400);
      }
    );
  }

  changeDepart(value) {
    this.departSelected = value.id;
  }

  // firebase storage
  changeImage(event) {
    this.profileImage = event;
  }

  // firebase storage

  changeJobTypes(val, funcAuthoritySet) {
    this.listSpecializedDepartment = [];
    this.tempJobType = val;
    this.isDr = val === 'J0001';
    if(this.isDr){
      this.addSpecializedDepartment();
    }
    if (val !== 'J0001') {
      const control = <FormArray>this.myForm.controls['specializedDepartment'];
      while (control.length !== 0) {
        control.removeAt(0);
        this.formErrors.specializedDepartment.splice(0,1);
      }
    }
  }

  /**
   * RE0016 post all items staff edit
   */
  putStaffEditSettings() {
    for (let i = 0; i < this.listDe.length; i++) {
      if (this.listDe[i].id === this.departSelected) {
        const de = <FormGroup>this.myForm.get('department');
        const de_id = <FormControl>de.controls['id'];
        const de_name = <FormControl>de.controls['name'];
        const de_displayName = <FormControl>de.controls['displayName'];
        de_id.setValue(this.listDe[i].id);
        de_name.setValue(this.listDe[i].name);
        de_displayName.setValue(this.listDe[i].displayName);
        break;
      }
    }
    this.myForm.patchValue({'mobileNo': this.helper.combinePhoneNumber('phone-first', 'phone-middle', 'phone-last')});
    this.myForm.patchValue({'phsNo': $('#phsNo').val()});
    this.myForm.patchValue({'lastNameKana': $('#surname-kana').val()});
    this.myForm.patchValue({'firstNameKana': $('#name-kana').val()});
    const checkValidateSD = this.staffEditValidator.checkValidate(this.resetPassword, this.myForm, this.formErrors, this.model);

    this.borderSD();
    if (this.resetPassword === false) {
      this.myForm.removeControl('newPassword');
      this.myForm.removeControl('confirmNewPass');
    }
    this.data = this.myForm.value;
    this.data.loginId = this.model.loginId;
    this.data.mailAddress = this.model.mailAddress;
    this.data.profileImageUrl = this.model.profileImageUrl;
    this.data.birthDate = this.model.birthDate;
    if (this.data.graduationDate) {
      this.data.graduationDate = this.data.graduationDate + '-08-08';
    } else {
      this.data.graduationDate = '';
    }
    // this.data.specializedDepartment = this.myForm.value.specializedDepartment.concat(this.model.specializedDepartment);
    this.helper.gotoError();
    if (this.myForm.valid && !this.formErrors['confirmNewPass'] && checkValidateSD) {
      if (this.myForm.value.newPassword) {
        this.data.password = this.myForm.value.newPassword;
      } else {
        this.data.password = '';
      }
      this.data.specializedDepartment = this.convertOutSpecializedDepartment();
      this.imageCropperComponent.getImageUrl('imageCropper1').subscribe((res) => {
          this.storage.uploader.re(this.officeId, this.officeUserId, this.userSession.officeUserId, res)
            .subscribe((data) => {
                if (data.done) {
                  setTimeout(() => {
                    this.dialogService.setLoaderVisible(false);
                  });
                  this.data.imageUrl = this.path_image;
                  this.subPutStaffEditSettings();
                  this.flagCrop = false;
                  if(!this.flagImgUrl){
                    this.imageCropperComponent.loadImage(data.url, 'imageCropper1');
                  }
                }
              },
              (error) => {
                setTimeout(() => {
                  this.dialogService.setLoaderVisible(false);
                });
                this.dialogService.showError('MSG.ERROR');
                return;
              });
        },
        (error) => {
          if(this.data.imageUrl){
            this.storage.deleteImageUrl(this.data.imageUrl);
          }
          this.flagCrop = true;
          this.data.imageUrl = '';
          this.flagImgUrl = true;
          this.subPutStaffEditSettings();
        }
      );
    }
    ;
    /* TODO: phase2
    else if (this.model.funcAuthoritySet === 'FPS_2') {
      this.dialogService.showMessage('warning', true, null, 'MSG.CONFIRM_SAVE', null, 'MSG.YES', 'MSG.NO').subscribe(
        (res: DialogResult) => {
          setTimeout(() => {
            if (res.isOk()) {
              this.dialogService.showError('RE0016.ERROR_SAVE_NO_ADMIN').subscribe(
                (resp: DialogResult) => {
                  setTimeout(() => {
                    this.dialogService.showError('RE0016.ERROR_SAVE_AN_ADMIN');
                  }, 400);
                }
              );
            }
          }, 400);
        }
      );
    }
    */
    if (this.resetPassword === false) {
      this.myForm.addControl('newPassword', new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(16),
        Validators.pattern(Helper.passwordRegex)
      ]));
      this.myForm.addControl('confirmNewPass', new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(16),
        Validators.pattern(Helper.passwordRegex)
      ]));
    }
  }

  subPutStaffEditSettings() {
    this.registrationService.putStaffEditSettings(this.data).subscribe(
      (response: StaffEditSettingsSaveResult) => {
        for (let key in this.data) {
          if(this.model.hasOwnProperty(key)){
            this.model[key] = this.data[key];
          }
        }
        if(this.model.imageUrl !== ''){
          this.flagImgUrl = false;
        }
        if(!this.isDr){
          this.model.specializedDepartment = [];
        }
        this.graduationYearInit();
        this.formStaffEdit();
        this.checkStatusResponse(response.status, 'save', 'MSG.SAVED');
      },
      (error: HttpError) => {

        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  convertOutSpecializedDepartment() {
    const listSpecializedDepartment = this.myForm.get('specializedDepartment').value;
    const listOutSpecializedDepartment = new Array();
    if (this.listSpecializedDepartment.length > 0) {
      for (let i = 0; i < this.listSpecializedDepartment.length; i++) {
        let specializedDepartment = {};
        specializedDepartment['fieldId'] = this.listSpecializedDepartment[i].fieldId;
        specializedDepartment['typeId'] = this.listSpecializedDepartment[i].typeId;
        listOutSpecializedDepartment.push(specializedDepartment);
      }
    }
    for (let i = 0; i < listSpecializedDepartment.length; i++) {
      let specializedDepartment = {};
      specializedDepartment['fieldId'] = listSpecializedDepartment[i].fieldId.id;
      specializedDepartment['typeId'] = listSpecializedDepartment[i].typeId.id;
      listOutSpecializedDepartment.push(specializedDepartment);
    }

    return listOutSpecializedDepartment;
  }

  borderSD() {
    for (let i = 0; i < this.formErrors.specializedDepartment.length; i++) {
      if (this.formErrors.specializedDepartment[i].fieldId) {
        $('#pd_fieldId_' + i).children().children('span:first').children('span').css('border', '1px solid #D21D29');
      } else {
        $('#pd_fieldId_' + i).children().children('span:first').children('span').css('border', '1px solid #aaa');
      }

      if (!this.listDepartmentDisabled[i]) {
        if (this.formErrors.specializedDepartment[i].typeId) {
          $('#pd_typeId_' + i).children().children('span:first').children('span').css('border', '1px solid #D21D29');
        } else {
          $('#pd_typeId_' + i).children().children('span:first').children('span').css('border', '1px solid #aaa');
        }
      }
    }
  }

  @HostListener('window:imageChange', ['$event'])
  testListener(event) {
    this.imageCropperComponent.getImageUrl('imageCropper1').subscribe((res) => {
      if(this.flagCrop){
        if(this.userId ===  this.userSession.userId){
          if($('img.rounded-circle').attr('src')){
            $('img.rounded-circle').attr('src', res.imgData);
          }
        }else{
          if($('#staff-icon').find('.rounded-circle').attr('src')){
            $('#staff-icon').find('.rounded-circle').attr('src', res.imgData);
          }
        }
      }
      this.flagCrop  = true;
    },(error) =>{
      if(this.flagCrop && this.flagImgDestroy){
        if(this.userId ===  this.userSession.userId){
          if($('img.rounded-circle').attr('src')){
            $('img.rounded-circle').attr('src', this._defaultPath);
          }
        }else{
          if($('#staff-icon').find('.rounded-circle').attr('src')){
            $('#staff-icon').find('.rounded-circle').attr('src', this._defaultPath);
          }
        }
      }
      this.flagCrop = true;
    });
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     this.putStaffEditSettings();
  //   }
  // }
}
