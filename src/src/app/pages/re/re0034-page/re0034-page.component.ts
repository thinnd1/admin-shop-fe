import {AfterViewInit, Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {Validator} from '../../../common/validation/validator';
import {SpecialtyAreaConverter} from '../../../common/converter/specialty-area.converter';
import {IndividualVerificationRequestSettings} from '../../../models/re/re0034-individual-verification-request-settings';
import {FormGroup} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {VerificationValidator} from './re0034-page-validator';
import {Router} from '@angular/router';
import {DialogService} from '../../../services/dialog.service';
import {Helper} from '../../../common/helper';
import {SpecialityArea} from '../../../models/ma/speciality-area';
import {SpecialityType} from '../../../models/ma/speciality-type';
import {MasterService} from '../../../services/master.service';
import {RegistrationService} from '../../../services/registration.service';
import {SharedValueService} from '../../../services/shared-value.service';
import {ImageCropperComponent} from '../../../components/image-cropper/image-cropper.component';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';
import {LocalStorage} from '../../../services/local-storage.service';
import {DialogResult} from '../../../models/dialog-param';
import {HttpError} from '../../../common/error/http.error';
import {NGXLogger} from 'ngx-logger';
import {DomSanitizer} from '@angular/platform-browser';

declare var moment: any;
declare const $: any;

@Component({
  selector: 'app-re0034-page',
  templateUrl: './re0034-page.component.html',
  styleUrls: ['./re0034-page.component.scss'],
  providers: [Validator, SpecialtyAreaConverter, VerificationValidator, ImageCropperComponent]
})
export class Re0034PageComponent implements OnInit, AfterViewInit {
  @ViewChild('firstImage1')
  protected imageCropperComponent1: ImageCropperComponent;
  @ViewChild('lastImage1')
  protected imageCropperComponent2: ImageCropperComponent;
  @ViewChild('firstImage2')
  protected imageCropperComponent3: ImageCropperComponent;
  @ViewChild('lastImage2')
  protected imageCropperComponent4: ImageCropperComponent;
  public model = new IndividualVerificationRequestSettings();
  verificationForm: FormGroup;
  genders: any;
  jobTypes: any;
  formErrors: any;
  jobType: any;
  options_graduation_year = [];
  options_graduation_text = [];
  monthYears = [];
  dayOfMonths = [];
  arrayBirthDate = [];
  data: any;
  selected: any;
  status: boolean;
  options: any;
  textTranslate: string;
  fieldIds = [];
  specializedDepartmentList: any;
  nameArea: string;
  field: string;
  nameType: string;
  type: string;
  listTypeIds = [];
  fieldIdDefault: any;
  typeIdDefault: any;
  typeIds = [];
  listDepartment = [];
  typeDefault: string;
  promise: any;
  isDr: boolean;
  userSession: any;
  flag: boolean;
  messageImage: string;
  document1 = {
    firstImage: '',
    lastImage: '',
    date: ''
  };
  document2 = {
    firstImage: '',
    lastImage: '',
    date: ''
  };
  dataUploader = [];
  blob: any;
  pathFirstImage1 = '';
  pathLastImage1 = '';
  pathFirstImage2 = '';
  pathLastImage2 = '';
  firstImageStorage1 = '';
  lastImageStorage1 = '';
  firstImageStorage2 = '';
  lastImageStorage2 = '';
  getPageConfirm: boolean;
  specializedDepartmentType: string;
  jobTypesConfirm: string;
  gendersConfirm: string;
  dateFirstImage1: string;
  dateLastImage1: string;
  dateFirstImage2: string;
  dateLastImage2: string;
  count: number;
  pathNoFirstImage1 = false;
  pathNoLastImage1 = false;
  pathNoFirstImage2 = false;
  pathNoLastImage2 = false;

  constructor(private translate: TranslateService,
              private verificationValidator: VerificationValidator,
              private dialogService: DialogService,
              private router: Router,
              private helper: Helper,
              private masterService: MasterService,
              private specialtyArea: SpecialtyAreaConverter,
              public registrationService: RegistrationService,
              public sharedValueService: SharedValueService,
              private storage: FirebaseStorage,
              private localStorage: LocalStorage,
              private logger: NGXLogger,
              private sanitizer: DomSanitizer,
              private firebaseStorage: FirebaseStorage) {
    this.verificationForm = this.verificationValidator.createFromVerification(this.model);
    this.formErrors = this.verificationValidator.formErrors;
    this.translate.get(['RE0034', 'COMMON_LABEL', 'JOB_TYPES']).subscribe((res) => {

      this.genders = [
        {id: '0', name: res.COMMON_LABEL.MALE},
        {id: '1', name: res.COMMON_LABEL.FEMALE},
      ];

      this.jobTypes = [
        {jobType: 'J0001', jobName: res.JOB_TYPES.J0001},
        {jobType: 'J0029', jobName: res.JOB_TYPES.J0029}
      ];
    });

    this.masterService.getSpecialityAreas().subscribe(
      (specialtyAreas: SpecialityArea) => {
        this.fieldIds = this.specialtyArea.convertSpecialtyArea(specialtyAreas);
      });
    this.promise = new Promise((resolve, reject) => {
      this.masterService.getSpecialityTypes().subscribe(
        (specialtyType: SpecialityType) => {
          this.typeIds = this.specialtyArea.convertSpecialtyType(specialtyType);
        });
    });
  }

  ngOnInit() {
    this.count = 0;
    this.userSession = this.sharedValueService.getUserSession();
    this.verificationForm = this.verificationValidator.createFromVerification(this.model);
    if ($.isEmptyObject(this.model)) {
      this.verificationForm.controls.jobType.setValue('J0001');
      this.verificationForm.controls.gender.setValue('0');
      this.verificationForm.controls.dayBirth.setValue('');
      this.verificationForm.controls.monthBirth.setValue('');
      this.verificationForm.controls.yearBirth.setValue('');
      this.verificationForm.controls.specializedDepartmentField.setValue(this.specialtyArea.idDefault);
      this.verificationForm.controls.specializedDepartmentType.setValue(this.specialtyArea.idDefault);
    }
    this.status = true;

    if (this.verificationForm.value.jobType === 'J0001') {
      this.isDr = true;
      this.status = true;
    } else {
      this.isDr = false;
      this.verificationForm.controls.specializedDepartmentField.setValue(this.specialtyArea.idDefault);
      this.verificationForm.controls.specializedDepartmentType.setValue(this.specialtyArea.idDefault);
    }

    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.registrationService.getPersonalReg().subscribe((settings: IndividualVerificationRequestSettings) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.model = settings;
        // console.log(this.model);
        // this.model.verificationStatus = 'ST1';
        if (this.model.verificationFlag === true) {
          this.translate.get('RE0034').subscribe(msg => {
            const html = msg.NOTICE_CONFIRM1 + '<br>'
              + msg.NOTICE_CONFIRM2;
            this.dialogService.showMessage('warning', false, null, null, html, 'MSG.OK', null);
          });
        }
        if (this.model.birthDate) {
          const birthDate = moment(this.model.birthDate).format();
          const value = this.helper.parseBirthDate(birthDate);
          this.arrayBirthDate = value.arrayBirthDate;
          this.model.dayBirth = this.arrayBirthDate[2];
          this.model.monthBirth = this.arrayBirthDate[1];
          this.model.yearBirth = this.arrayBirthDate[0];
        }

        this.specializedDepartmentList = JSON.parse(JSON.stringify(settings)).specializedDepartment;

        // Set Value Default
        if (this.specializedDepartmentList && this.specializedDepartmentList.length > 0) {
          this.nameArea = this.specializedDepartmentList[0].nameArea;
          this.field = this.specializedDepartmentList[0].fieldId;
          this.nameType = this.specializedDepartmentList[0].nameType;
          this.type = this.specializedDepartmentList[0].typeId;
          this.fieldIdDefault = {text: this.nameArea, id: this.field};
          this.typeIdDefault = {text: this.nameType, id: this.type, field_id: this.field};
          this.model.specializedDepartmentField = this.fieldIdDefault;
          this.model.specializedDepartmentType = this.typeIdDefault;
        }

        this.verificationForm = this.verificationValidator.createFromVerification(this.model);
        if ($.isEmptyObject(this.model)) {
          this.verificationForm.controls.jobType.setValue('J0001');
          this.verificationForm.controls.gender.setValue('0');
          this.verificationForm.controls.dayBirth.setValue('');
          this.verificationForm.controls.monthBirth.setValue('');
          this.verificationForm.controls.yearBirth.setValue('');
          this.verificationForm.controls.specializedDepartmentField.setValue(this.specialtyArea.idDefault);
          this.verificationForm.controls.specializedDepartmentType.setValue(this.specialtyArea.idDefault);
        }
        if (!this.model.jobType) {
          this.verificationForm.controls.jobType.setValue('J0001');
        }
        if (!this.model.gender) {
          this.verificationForm.controls.gender.setValue('0');
        }

        this.status = true;
        // console.log(this.model);
        if (this.model.jobType === 'J0001' || this.verificationForm.value.jobType === 'J0001') {
          this.isDr = true;
          this.status = true;
        } else {
          this.isDr = false;
          this.verificationForm.controls.specializedDepartmentField.setValue(this.specialtyArea.idDefault);
          this.verificationForm.controls.specializedDepartmentType.setValue(this.specialtyArea.idDefault);
        }

        this.graduationYearInit();
        this.getSpecializedDepartment();
      }
      ,
      () => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      }
    );
    this.graduationYearInit();
    this.translate.get('RE0034.RE0034_ERROR').subscribe((res: any) => {
      this.textTranslate = res.SPECIALIZE_DEPARTMENT_REQUIRED;
      this.typeDefault = res.SPECIALIZE_DEPARTMENT;
      this.options = {
        placeholder: this.textTranslate
      };
    });
  }

  ngAfterViewInit() {
    $.fn.autoKana('#surname', '#surname-kana');
    $.fn.autoKana('#name', '#name-kana');
  }

  flagImgUpload(event: any) {
    if (event === false) {
      this.translate.get('IMAGE_CROPPER.IMAGE_MAX_LENGTH').subscribe(
        res => {
          this.messageImage = res;
        });
      this.dialogService.showMessage('error', false, '', this.messageImage, null, 'MSG.OK', null).subscribe(
        () => {
          return;
        });
    }
  }

  /**
   * Get date for birth day
   *
   */
  changeDate() {
    const value = this.helper.changeDate('year', 'month');
    this.monthYears = value.months;
    this.dayOfMonths = value.days;
    const day = $('#day').val();
    if (this.dayOfMonths.indexOf(day) === -1) {
      $('#day').val('');
      this.verificationForm.controls.dayBirth.setValue('');
    }
  }

  /**
   * Get list of Year
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
    const year = this.helper.graduationYearOptions(89);
    this.options_graduation_year = year[0];
    this.options_graduation_text = year[1];
  }

  /**
   * Check JobType
   *
   */
  changeJobTypes(val) {
    if (val === 'J0001') {
      this.isDr = true;
      this.status = true;
    } else {
      this.isDr = false;
      this.verificationForm.controls.specializedDepartmentField.setValue(this.specialtyArea.idDefault);
      this.verificationForm.controls.specializedDepartmentType.setValue(this.specialtyArea.idDefault);
    }
  }

  /**
   * Get Specialized Department List
   *
   */
  getSpecializedDepartment() {
    if (this.model.specializedDepartment) {
      for (let i = 0; i < this.model.specializedDepartment.length; i++) {
        const objDepartment = {};
        objDepartment['fieldId'] = this.fieldIds.filter(
          (item) => item.id === this.model.specializedDepartment[i]['fieldId'])[0];
        objDepartment['typeId'] = this.typeIds.filter(
          (item) => item.id === this.model.specializedDepartment[i]['typeId'])[0];
        this.model.specializedDepartment[i] = objDepartment;
      }
    }
  }

  changeFields(event) {
    if (this.typeIds.length > 0) {
      this.getTypeFromField(event);
    } else {
      this.promise.then(result => {
        this.getTypeFromField(event);
      });
    }
  }

  /**
   * Get Type From Field List
   *
   */
  getTypeFromField(event) {
    const firstType = {'id': this.specialtyArea.idDefault, 'text': this.typeDefault, 'field_id': ''};
    const form = <FormGroup>this.verificationForm;
    if (event.id === this.specialtyArea.idDefault) {
      form.controls.specializedDepartmentField.setValue(this.specialtyArea.idDefault);
      form.controls.specializedDepartmentType.setValue(this.specialtyArea.idDefault);
      this.listTypeIds = [];
      this.status = true;
    } else {
      this.listTypeIds = this.typeIds.filter((item) => (item.field_id === event.id));
      this.listTypeIds.splice(0, 0, firstType);
      if (this.fieldIdDefault && event.id === this.fieldIdDefault.id) {
        form.controls.specializedDepartmentType.setValue(this.typeIdDefault);
        this.fieldIdDefault = event;
      } else {
        if (this.typeIdDefault) {
          form.controls.specializedDepartmentType.setValue(this.typeIdDefault);
        } else {
          form.controls.specializedDepartmentType.setValue(this.specialtyArea.idDefault);
        }
      }
      (this.model.verificationStatus === 'ST2') ? this.status = true : this.status = false;
    }
  }

  confirmPersonalReg() {
    this.dialogService.setLoaderVisible(true);
    setTimeout(() => {
      this.dialogService.setLoaderVisible(false);
    }, 400);
    this.verificationForm.patchValue({'lastNameKana': $('#surname-kana').val()});
    this.verificationForm.patchValue({'firstNameKana': $('#name-kana').val()});
    const resultValidate = this.verificationValidator.checkValidate(this.verificationForm, this.formErrors);
    this.data = this.verificationForm.value;
    this.data.newLoginId = this.data.loginId;
    this.data.loginId = (this.model.loginId) ? this.model.loginId : '';
    this.data['specializedDepartment'] = [];
    if (this.data.specializedDepartmentField && this.data.specializedDepartmentField !== this.specialtyArea.idDefault) {
      const element = {
        'fieldId': this.data.specializedDepartmentField.id,
        'nameArea': this.data.specializedDepartmentField.text,
        'typeId': this.data.specializedDepartmentType.id,
        'nameType': this.data.specializedDepartmentType.text,
      };
      this.data['specializedDepartment'].push(element);
    }
    this.specializedDepartmentList = this.data['specializedDepartment'];

    this.helper.gotoError();
    if (this.verificationForm.valid && resultValidate['checkValid']) {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.data.verificationStatus = this.model.verificationStatus;
      if (!this.model.verificationStatus ||
        this.model.verificationStatus && this.model.verificationStatus !== 'ST2' && this.model.verificationStatus !== 'ST3') {

        this.data.document1 = {
          firstImage: (this.pathFirstImage1) ?
            this.pathFirstImage1 : ((this.pathNoFirstImage1) ? this.pathFirstImage1 : this.model.document1.firstImage),
          lastImage: (this.pathLastImage1) ?
            this.pathLastImage1 : ((this.pathNoLastImage1) ? this.pathFirstImage1 : this.model.document1.lastImage),
          date: (this.dateLastImage1) ? this.dateLastImage1 : this.model.document1.date
        };
        this.data.document2 = {
          firstImage: (this.pathFirstImage2) ?
            this.pathFirstImage2 : ((this.pathNoFirstImage2) ? this.pathFirstImage1 : this.model.document2.firstImage),
          lastImage: (this.pathLastImage2) ?
            this.pathLastImage2 : ((this.pathNoLastImage2) ? this.pathFirstImage1 : this.model.document2.lastImage),
          date: (this.dateLastImage2) ? this.dateLastImage2 : this.model.document2.date
        };
        this.data.firstImage1 = this.model.firstImage1;
        this.data.lastImage1 = this.model.lastImage1;
        this.data.firstImage2 = this.model.firstImage2;
        this.data.lastImage2 = this.model.lastImage2;
        this.data.dataUploader = this.dataUploader;
      } else {
        this.data.document1 = {
          firstImage: '',
          lastImage: '',
          date: ''
        };
        this.data.document2 = {
          firstImage: '',
          lastImage: '',
          date: ''
        };
      }
      this.putConfirmPersonalReg();
    }
  }

  putConfirmPersonalReg() {
    this.model.personalObject = this.data;
    // console.log(this.model.personalObject);
    this.getPageConfirm = true;
    if (!$.isEmptyObject(this.model.personalObject)) {
      this.flag = true;
      this.model.personalObject = this.data;
      this.model.personalObject.verificationFlag = false;
      this.translate.get(['RE0034', 'COMMON_LABEL', 'JOB_TYPES']).subscribe((res) => {
        if (this.model.personalObject.gender === 0 || this.model.personalObject.gender === '0') {
          this.gendersConfirm = res.COMMON_LABEL.MALE;
        } else {
          this.gendersConfirm = res.COMMON_LABEL.FEMALE;
        }

        if (this.model.personalObject.jobType === 'J0001') {
          this.jobTypesConfirm = res.JOB_TYPES.J0001;
        } else {
          this.jobTypesConfirm = res.JOB_TYPES.J0029;
        }

      });

      if (this.model.personalObject.dataUploader && this.model.personalObject.dataUploader.length > 0) {
        for (let i = 0; i < this.model.personalObject.dataUploader.length; i++) {
          if (this.model.personalObject.dataUploader[i].imageId === 'firstImage1') {
            if (this.checkIfImageUpdated(this.model.personalObject.dataUploader[i].blob)) {
              this.firstImageStorage1 = this.model.personalObject.dataUploader[i].blob;
            } else {
              this.firebaseStorage.downloadURL(this.model.personalObject.dataUploader[i].blob).subscribe(
                (url) => {
                  this.firstImageStorage1 = url;
                });
            }
          }
          if (this.model.personalObject.dataUploader[i].imageId === 'lastImage1') {
            if (this.checkIfImageUpdated(this.model.personalObject.dataUploader[i].blob)) {
              this.lastImageStorage1 = this.model.personalObject.dataUploader[i].blob;
            } else {
              this.firebaseStorage.downloadURL(this.model.personalObject.dataUploader[i].blob).subscribe(
                (url) => {
                  this.lastImageStorage1 = url;
                });
            }
          }

          if (this.model.personalObject.dataUploader[i].imageId === 'firstImage2') {
            if (this.checkIfImageUpdated(this.model.personalObject.dataUploader[i].blob)) {
              this.firstImageStorage2 = this.model.personalObject.dataUploader[i].blob;
            } else {
              this.firebaseStorage.downloadURL(this.model.personalObject.dataUploader[i].blob).subscribe(
                (url) => {
                  this.firstImageStorage2 = url;
                });
            }
          }

          if (this.model.personalObject.dataUploader[i].imageId === 'lastImage2') {
            if (this.checkIfImageUpdated(this.model.personalObject.dataUploader[i].blob)) {
              this.lastImageStorage2 = this.model.personalObject.dataUploader[i].blob;
            } else {
              this.firebaseStorage.downloadURL(this.model.personalObject.dataUploader[i].blob).subscribe(
                (url) => {
                  this.lastImageStorage2 = url;
                });
            }
          }
        }
      }
      this.model.personalObject.birthDate = this.data.yearBirth + '-' + this.data.monthBirth + '-' + this.data.dayBirth;
      this.specializedDepartmentType = (this.data.specializedDepartmentType) ? this.data.specializedDepartmentType.text : '';
    } else {
      this.getPageConfirm = false;
    }

  }

  checkIfImageUpdated(src) {
    // true - updated
    if (src) {
      return /^blob/.test(src);
    }
    return true;
  }

  // back to RE0034
  backToRE0034() {
    this.getPageConfirm = false;
    this.dialogService.setLoaderVisible(true);
    setTimeout(() => {
      this.dialogService.setLoaderVisible(false);
    }, 400);

    const form = <FormGroup>this.verificationForm;
    form.controls.password.setValue('');
    form.controls.passwordConfirm.setValue('');
  }

  getPathImageOrigin(officeId: string, officeUserId: string, prefix?) {
    if (!prefix) {
      prefix = 'original';
    }
    const path = `/img/staff/identification/${officeId}/${officeUserId}/${prefix}`;
    return path;
  }

  @HostListener('window:imageChange', ['$event'])
  imageChange(event) {
    if (!this.getPageConfirm) {
      this.count++;
      const $parent = event.detail;
      if ($parent.length) {
        const id = $parent.attr('id');
        if (id === 'firstImage1') {
          this.imageCropperComponent1.getImageUrl('firstImage1').subscribe((res) => {
              if (res.name) {
                this.model.firstImage1 = res.name.split('\\').pop();
              }
              this.dateFirstImage1 = moment().format('YYYY-MM-DD HH:mm:ss');
              this.pathFirstImage1 = this.getPathImageOrigin(this.userSession.officeId, this.userSession.officeUserId, '1_front');
              this.pushDataUploader('firstImage1', (!this.checkIfImageUpdated(res.src)) ? ((this.count > 4) ? res.imgData :
                this.model.document1.firstImage) : res.imgData);
            },
            (error) => {
              if (error === 'no image') {
                this.pushDataUploader('firstImage1', '');
              }
              this.model.firstImage1 = '';
              this.pathNoFirstImage1 = true;
              this.pathFirstImage1 = '';
              this.dateFirstImage1 = '';
              this.model.document1.date = '';
            }
          );
        }
        if (id === 'lastImage1') {
          this.imageCropperComponent2.getImageUrl('lastImage1').subscribe((res) => {
              if (res.name) {
                this.model.lastImage1 = res.name.split('\\').pop();
              }
              this.dateLastImage1 = moment().format('YYYY-MM-DD HH:mm:ss');
              this.pathLastImage1 = this.getPathImageOrigin(this.userSession.officeId, this.userSession.officeUserId, '1_back');
              this.pushDataUploader('lastImage1', (!this.checkIfImageUpdated(res.src)) ? ((this.count > 4) ? res.imgData :
                this.model.document1.lastImage) : res.imgData);
            },
            (error) => {
              if (error === 'no image') {
                this.pushDataUploader('lastImage1', '');
              }
              this.model.lastImage1 = '';
              this.pathNoLastImage1 = true;
              this.pathLastImage1 = '';
              this.dateLastImage1 = '';
              this.model.document1.date = '';
            }
          );
        }
        if (id === 'firstImage2') {
          this.imageCropperComponent3.getImageUrl('firstImage2').subscribe((res) => {
              if (res.name) {
                this.model.firstImage2 = res.name.split('\\').pop();
              }
              this.dateFirstImage2 = moment().format('YYYY-MM-DD HH:mm:ss');
              this.pathFirstImage2 = this.getPathImageOrigin(this.userSession.officeId, this.userSession.officeUserId, '2_front');
              this.pushDataUploader('firstImage2', (!this.checkIfImageUpdated(res.src)) ? ((this.count > 4) ? res.imgData :
                this.model.document2.firstImage) : res.imgData);
            },
            (error) => {
              if (error === 'no image') {
                this.pushDataUploader('firstImage2', '');
              }
              this.model.firstImage2 = '';
              this.pathNoFirstImage2 = true;
              this.pathFirstImage2 = '';
              this.dateFirstImage2 = '';
              this.model.document2.date = '';
            }
          );
        }
        if (id === 'lastImage2') {
          this.imageCropperComponent4.getImageUrl('lastImage2').subscribe((res) => {
              if (res.name) {
                this.model.lastImage2 = res.name.split('\\').pop();
              }
              this.dateLastImage2 = moment().format('YYYY-MM-DD HH:mm:ss');
              this.pathLastImage2 = this.getPathImageOrigin(this.userSession.officeId, this.userSession.officeUserId, '2_back');
              this.pushDataUploader('lastImage2', (!this.checkIfImageUpdated(res.src)) ? ((this.count > 4) ? res.imgData :
                this.model.document2.lastImage) : res.imgData);
            },
            (error) => {
              if (error === 'no image') {
                this.pushDataUploader('lastImage2', '');
              }
              this.model.lastImage2 = '';
              this.pathNoLastImage2 = true;
              this.pathLastImage2 = '';
              this.dateLastImage2 = '';
              this.model.document2.date = '';
            }
          );
        }
      }
    }
  }

  pushDataUploader(id: string, imageData: string) {
    if (this.model.dataUploader && this.model.dataUploader.length > 0) {
      this.dataUploader = this.model.dataUploader;
      this.getImageDataArr(id, imageData);
    } else {
      if (this.dataUploader.length > 0) {
        this.getImageDataArr(id, imageData);
      } else {
        if (this.model.document1.firstImage !== '' || this.model.document1.lastImage !== ''
          || this.model.document2.firstImage !== '' || this.model.document2.lastImage !== '') {
          this.dataUploader = [
            {imageId: 'firstImage1', blob: this.model.document1.firstImage},
            {imageId: 'lastImage1', blob: this.model.document1.lastImage},
            {imageId: 'firstImage2', blob: this.model.document2.firstImage},
            {imageId: 'lastImage2', blob: this.model.document2.lastImage}
          ];
          this.getImageDataArr(id, imageData);
        } else {
          this.dataUploader.push({imageId: id, blob: imageData});
        }
      }
    }
  }

  getImageDataArr(id, res) {
    let checkexist = [];
    checkexist = this.dataUploader.filter((e) => {
      return e.imageId === id;
    });
    for (let i = 0; i < this.dataUploader.length; i++) {
      if (checkexist.length > 0) {
        if (this.dataUploader[i].imageId === id) {
          this.dataUploader[i] = {imageId: id, blob: res};
          break;
        }
      } else {
        if (this.dataUploader.length <= 3) {
          this.dataUploader.push({imageId: id, blob: res});
          break;
        }
      }
    }
    // console.log(this.dataUploader);
  }

  deleteAccount() {
    this.confirmDeleteAccount();
  }

  confirmDeleteAccount() {
    let html = '';
    this.translate.get('MSG').subscribe(msg => {
      html = '<p>' + msg.RE0034_1.E002_2 + '</p>' +
        '<div class="text-left" style="background-color:#eee; padding:0.7rem 1rem 0.5rem; border-radius:0.5rem">' +
        '<p>' + msg.RE0034_1.E002_3_1 + '</br>' + msg.RE0034_1.E002_3_2 + '<br>' + msg.RE0034_1.E002_3_3 + '<span class="text-danger">' +
        msg.RE0034_1.E002_3_RED_1 + '</span>' + msg.RE0034_1.E002_3_4 + '</p></div>';
    });
    this.dialogService.showMessage('warning', false, null, null, html, 'MSG.RE0034_1.E002_4', 'MSG.CANCEL', 'modal-lg').subscribe(
      (res: DialogResult) => {
        if (res.isOk()) {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(true);
          });
          this.registrationService.putDeleteUser(this.userSession.userId).subscribe(
            () => {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
              setTimeout(() => {
                this.dialogService.showMessage('success', false, null, 'MSG.DELETED', null, 'MSG.OK', null).subscribe(
                  (result: DialogResult) => {
                    if (result.isOk()) {
                      this.router.navigate(['/logout'], {replaceUrl: true});
                    }
                  });
              }, 500);
            },
            () => {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
              setTimeout(() => {
                this.dialogService.showError('VAL.DELETE_USER_FAILED');
              }, 500);
            }
          );
        }
      });
  }


  // ME0034 Confirm

  // put data call API register
  putPersonalRegister() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.registrationService.putPersonalReg(this.model.personalObject).subscribe(
      () => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        if (this.model.personalObject.dataUploader && this.model.personalObject.dataUploader.length > 0) {
          for (let i = 0; i < this.model.personalObject.dataUploader.length; i++) {
            if (this.model.personalObject.dataUploader[i].blob !== '' &&
              this.checkIfImageUpdated(this.model.personalObject.dataUploader[i].blob)) {
              const xhr = new XMLHttpRequest();
              xhr.open('GET', this.model.personalObject.dataUploader[i].blob, true);
              xhr.responseType = 'blob';
              xhr.onload = () => {
                this.storage.uploader.re_personal(
                  this.userSession.officeId,
                  this.userSession.officeUserId,
                  this.userSession.officeUserId,
                  this.model.personalObject.dataUploader[i].imageId,
                  xhr.response).subscribe((datas) => {
                    if (datas.done) {
                      this.logger.info('upload successfully');
                    }
                  },
                  () => {
                    this.logger.info('upload fail');
                  });
              };
              xhr.send();
            }
          }
        }
        this.dialogService.showSuccess('MSG.SAVED');
      },
      (error: HttpError) => {
        if (error.contains('COMMON.SAVE_FAILED')) {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.translate.get('RE0034').subscribe(
            res => {
              this.formErrors['loginId'] = res.RE0034_ERROR.LOGINID_MATCH;
            });
          this.getPageConfirm = false;
        } else {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showError('MSG.ERROR');
        }
      }
    );
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     if(!this.getPageConfirm) {
  //       this.confirmPersonalReg();
  //     } else {
  //       this.putPersonalRegister();
  //     }
  //   }
  // }
}



