import {AfterViewInit, Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {RegistrationService} from '../../../services/registration.service';
import {PrFirstEntrySettings} from '../../../models/re/pr-first-entry-settings';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Helper} from '../../../common/helper';
import {SharedValueService} from '../../../services/shared-value.service';
import {PrFirstEntrySettingsSaveResult} from '../../../models/re/pr-first-entry-settings-save-result';
import {Re0006PageValidator} from './re0006-page.validator';
import {PharmaOfficeInfoSettings} from '../../../models/ma/pharma-office-info-settings';
import {MasterService} from '../../../services/master.service';
import {HttpError} from '../../../common/error/http.error';
import {IndustryType} from '../../../models/ma/industry-type';
import {Prefecture} from '../../../models/ma/prefecture';
import {HandleField} from '../../../models/ma/handle-field';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';
import {ImageCropperComponent} from '../../../components/image-cropper/image-cropper.component';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';
import {Observable} from 'rxjs/Observable';
import {FirAttachments} from '../../../models/gr/firebase/fir.attachments';
import {TermOfUse} from '../../../models/cm/term_of_use';
import {CmsService} from '../../../services/cms.service';
import {Title} from '@angular/platform-browser';

declare const $: any;

@Component({
  selector: 'app-re0006-page',
  templateUrl: './re0006-page.component.html',
  styleUrls: ['./re0006-page.component.scss'],
  providers: [Re0006PageValidator]
})
export class Re0006PageComponent implements OnInit, AfterViewInit {
  @ViewChild('imageCropper1')
  protected imageCropperComponent: ImageCropperComponent;
  @ViewChild('imageCropper2')
  protected identifyImageComponent: ImageCropperComponent;
  modelGroupForm: FormGroup;
  formErrors: any;
  model: any;
  registerToken: string;
  infoRegister = new PrFirstEntrySettings();
  checkRadio = true;
  selectedIndustry = '';
  pleaseSelect: string;
  noResult: string;

  // Information
  genders: any;
  monthYears: any;
  dayOfMonths: any;
  options_birthday_year = [];
  options_birthday_text = [];
  combineBirth: string;

  // Show Exp Group
  show_grade = false;
  show_area = false;

  // Show hide input form, confirm form
  register_input = true;
  register_confirm = false;
  register_complete = false;
  medicalOffices = [];
  yearsExpertise: any;
  majorAreas: any;
  listKeyProvince = [];
  listIndustryTypes = [];
  industryTypeCompany = 'I0001';

  // Select 2
  validateselectedCompany = false;
  validateHandleField = false;
  selectedCompany: any;
  selectedDefault: string;
  maximumSelected: string;
  data = [];
  options: any;
  phoneInvite;
  nameInvite;
  medicalOfficeId = '';
  medicalOfficeName = '';
  warekiYear = '';
  imageBlob: any;
  identificationBlob: any;
  disableSelect2 = false;
  flagCreateUser = true;

  termOfUse: TermOfUse;

  constructor(private activatedRoute: ActivatedRoute,
              private fb: FormBuilder,
              private translate: TranslateService,
              private registrationService: RegistrationService,
              private sharedValueService: SharedValueService,
              private dialogService: DialogService,
              private helper: Helper,
              private router: Router,
              public re0006Validator: Re0006PageValidator,
              private firebaseStorage: FirebaseStorage,
              private masterService: MasterService,
              private titleService: Title,
              private cmsService: CmsService) {
    this.formErrors = this.re0006Validator.formErrors;
    this.modelGroupForm = this.re0006Validator.re0006PageForm;
    this.yearsExpertise = this.sharedValueService.yearsExpertise();
    this.dayOfMonths = this.helper.dayOfMonths;
    this.monthYears = this.helper.monthYears;
    this.genders = this.helper.genders;
  }

  ngOnInit() {
    $('tr.disable-row').click(false);
    if (this.translate.currentLang === 'en') {
      this.pleaseSelect = 'Select Medical';
      this.noResult = 'No Results Found';
      this.maximumSelected = 'You can only select 1 item';
    } else {
      this.pleaseSelect = '会社名の一部を入力';
      this.noResult = '一致する会社がありません';
      this.maximumSelected = '1つのアイテムのみを選択できます';
    }
    this.initMasterData();
    this.options = {
      multiple: true,
      maximumSelectionLength: 1,
      placeholder: this.pleaseSelect,
      language: {
        noResults: () => {
          return this.noResult;
        },
        maximumSelected: () => {
          return this.maximumSelected;
        }
      }
    };
    this.birthdayYearInit();
    this.activatedRoute.params.subscribe((param: any) => {
      this.registerToken = param['registerToken'];
    });

    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });

    this.cmsService.getTermOfUseOne('PRJOY').mergeMap((res: TermOfUse) => {
      this.termOfUse = res;
      return this.registrationService.getPrFirstEntrySettings(this.registerToken);
    }).subscribe(
      (res: PrFirstEntrySettings) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.infoRegister = res;
        this.medicalOfficeName = res.medicalOfficeName;
        this.medicalOfficeId = res.medicalOfficeId;
        this.selectedDefault = res.inviteesOfficeId;
        this.selectedCompany = res.inviteesOfficeId;
        this.phoneInvite = res.contactPhoneNo;
        if (this.selectedCompany) {
          this.disableSelect2 = true;
          this.setPhone(this.selectedCompany);
        }
        this.flagCreateUser = true;
      }, error => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
          this.flagCreateUser = false;
        });
      }
    );
    this.selectIndustry(this.selectedIndustry);
    this.setTitle('DOC_TITLE.RE0006');
  }

  setTitle(id: string) {
    this.translate.get(id).subscribe(
      (res) => {
        this.titleService.setTitle(res);
      }
    );
  }

  ngAfterViewInit() {
    $.fn.autoKana('#surname', '#surname-kana');
    $.fn.autoKana('#name', '#name-kana');
  }

  initMasterData() {

    // PharmaOfficeInfo Master Data
    this.masterService.getPharmaOfficeInfo().subscribe(
      (pharmacyOffice: PharmaOfficeInfoSettings) => {
        this.medicalOffices = pharmacyOffice.pharmacyOfficeInfoList;
        const tempData = [];
        if (this.medicalOffices.length > 0) {
          for (const child of this.medicalOffices) {
            const objMedicalAnother = {};
            objMedicalAnother['text'] = child.officeName;
            objMedicalAnother['id'] = child.officeId;
            tempData.push(objMedicalAnother);
          }
        }
        this.data = tempData;
      }, (error: HttpError) => {
        this.dialogService.showError('MSG.ERROR');
      }
    );

    // Industry Master Data
    this.masterService.getIndustryType().subscribe(
      (industry: IndustryType) => {
        this.listIndustryTypes = industry.industryTypes;
      }, (error: HttpError) => {
        this.dialogService.showError('MSG.ERROR');
      }
    );

    // Prefecture Master Data
    this.masterService.getPrefecture().subscribe(
      (prefecture: Prefecture) => {
        this.listKeyProvince = prefecture.mrPrefectures;
      }, (error: HttpError) => {
        this.dialogService.showError('MSG.ERROR');
      }
    );

    // Handle Field Master Data
    this.masterService.getHandleField().subscribe(
      (handleField: HandleField) => {
        this.majorAreas = handleField.mrFieldTypes;
      }, (error: HttpError) => {
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  birthdayYearInit() {
    const value = this.helper.parseBirthDate('');
    this.monthYears = value.months;
    this.dayOfMonths = value.days;
    if (this.dayOfMonths) {
      for (let i = 1; i <= 31; i++) {
        const d = (i < 10 ? '0' : '') + i;
        this.dayOfMonths.push(d);
      }
    }
    const d = new Date();
    const year = this.helper.graduationYearOptions(d.getFullYear() - 1929, true);
    this.options_birthday_year = year[0];
    this.options_birthday_text = year[1];
  }

  uploadImageError(event: any) {
    if (event === false) {
      this.dialogService.showError('IMAGE_CROPPER.IMAGE_MAX_LENGTH');
    }
  }

  uploadIdentifyImageError(event: any) {
    if (event === false) {
      this.dialogService.showError('IMAGE_CROPPER.IMAGE_MAX_LENGTH');
    }
  }

  changeHandleField(index) {
    const arrayExpert = this.modelGroupForm.controls.handleFields.value;
  }

  combineBirthDay() {
    this.combineBirth = this.modelGroupForm.value.birthDayYear + '-' +
      this.modelGroupForm.value.birthDayMonth + '-' +
      this.modelGroupForm.value.birthDayDay;
  }

  combinebranchPhone() {
    this.modelGroupForm.patchValue(
      {'branchPhoneNo': this.helper.combinePhoneNumber('phone-office-first', 'phone-office-middle', 'phone-office-last')});
  }

  combineMobilePhone() {
    this.modelGroupForm.patchValue(
      {'mobileNo': this.helper.combinePhoneNumber('phone-first', 'phone-middle', 'phone-last')});
  }

  postPrFirstEntrySettings() {
    this.combineBirthDay();
    this.combinebranchPhone();
    this.combineMobilePhone();
    this.modelGroupForm.patchValue({'lastNameKana': $('#surname-kana').val()});
    this.modelGroupForm.patchValue({'firstNameKana': $('#name-kana').val()});
    this.model = this.modelGroupForm.value;
    if (this.modelGroupForm.value.industryType === this.industryTypeCompany) {
      this.model.handleFields = this.modelGroupForm.value.handleFields.map((val) => val.fieldId);
    } else {
      this.model.handleFields = [];
    }
    this.model.medicalOfficeId = this.medicalOfficeId;
    this.model.birthDate = this.combineBirth;
    this.model.restrictedKeyCode = this.infoRegister.restrictedKeyCode;
    this.validateSelectedCompany();
    this.re0006Validator.checkValidate();
    this.re0006Validator.checkSpaceBlank(this.modelGroupForm);
    if (this.model.pharmacyOfficeId !== this.selectedDefault && this.selectedDefault !== '') {
      this.dialogService.showMessage('error', false, 'RE0006.SWAL.REPLACE_COMPANY', null, null, 'OK', null).subscribe(
        (resp: DialogResult) => {
          if (resp.isOk()) {
            this.selectedCompany = this.selectedDefault;
            this.helper.gotoError();
          }
        });
    } else {
      const newListHandle = this.model.handleFields;
      const valueArr = newListHandle.map((item) => {
        return item;
      });
      const isDuplicate = valueArr.some((item, idx) => {
        if (item !== '' && idx !== '') {
          return valueArr.indexOf(item) !== idx;
        } else {
          return false;
        }
      });
      if (isDuplicate) {
        this.dialogService.showMessage('warning', false, 'RE0006.SWAL.EXIST_DEPARTMENT', null, null, 'MSG.YES', null).subscribe(
          (resp: DialogResult) => {
            if (resp.isOk()) {
              this.helper.gotoError();
            }
          });
      } else {
        const validate = this.formErrors.handleFields.filter((val) => val);
        const res = this.helper.gotoError();
        if (this.modelGroupForm.valid && this.formErrors.confirmPassword === ''
          && this.formErrors.confirmEmail === '' && validate.length === 0 && !this.validateselectedCompany) {
          this.register_input = false;
          this.register_confirm = true;
          window.scrollTo(0, 0);
          this.register_complete = false;
        }
      }
    }
  }

  validateSelectedCompany() {
    this.validateselectedCompany = true;
    if (this.selectedCompany && this.selectedCompany.length > 0) {
      this.validateselectedCompany = false;
      this.model.pharmacyOfficeId = this.selectedCompany;
    }
    for (let i = 0; i < this.medicalOffices.length; i++) {
      if (this.medicalOffices[i].officeId === this.selectedCompany) {
        this.nameInvite = this.medicalOffices[i].officeName;
      }
    }
  }

  addSpecializedDepartment() {
    if (this.modelGroupForm.get('handleFields').value.length < 5) {
      const specializedDepartment = <FormArray>this.modelGroupForm.get('handleFields');
      const newSpecializedDepartment = this.fb.group({fieldId: ['', [Validators.required]]});
      specializedDepartment.push(newSpecializedDepartment);
    }
  }

  deleteSpecializedDepartment(index) {
    const specializedDepartment = <FormArray>this.modelGroupForm.get('handleFields');
    specializedDepartment.removeAt(index);
    this.formErrors.handleFields[index] = '';
  }

  selectIndustry(selectData) {
    if (selectData === this.industryTypeCompany) {
      this.show_grade = true;
      this.show_area = true;
      if (this.modelGroupForm.controls['handleFields'].value.length === 0) {
        this.addSpecializedDepartment();
      }
    } else {
      this.modelGroupForm.controls['handleFields'] = this.fb.array([]);
      this.formErrors.handleFields = [];
      this.show_grade = false;
      this.show_area = false;
    }
  }

  registerComplete() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.model.entryToken = this.registerToken;
    this.model.termOfUseVersion = this.termOfUse.version;
    this.registrationService.postPrFirstEntrySettings(this.model).subscribe(
      (response) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        // this.uploadToFirebase(response['_body']);
        this.register_input = false;
        this.register_confirm = false;
        this.register_complete = true;
      }, (error: HttpError) => {
        const ret = JSON.parse(error['_body']).message;
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        if (ret === 'mailAddress is invalid') {
          this.registerBackInput();
          this.modelGroupForm.get('password').setValue(null);
          this.modelGroupForm.get('confirmPassword').setValue(null);
          this.formErrors.mailAddress = this.translate.instant('MSG.EMAIL_EXISTED_1');
          this.helper.gotoError();
        }
      }
    );
  }

  registerBackInput() {
    this.modelGroupForm.get('password').setValue(null);
    this.modelGroupForm.get('confirmPassword').setValue(null);
    this.register_input = true;
    this.register_confirm = false;
    this.register_complete = false;
    //this.setImage();

  }

  setPhone(id) {
    this.phoneInvite = [];
    if (this.medicalOffices.length > 0) {
      const data = this.searchPhone(id, this.medicalOffices);
      this.nameInvite = data.officeName;
      if (data.contactList.length > 0) {
        const afterPhone = [];
        for (const item of data.contactList) {
          afterPhone.push(item.phoneNo);
        }
        this.phoneInvite = afterPhone;
      }
    }
  }


  selectCompany(event) {
    this.phoneInvite = [];
    if (event.length > 0) {
      this.selectedCompany = event[0].id;
      this.setPhone(event[0].id);
    }
  }

  searchPhone(nameKey, myArray) {
    return this.helper.findByField(myArray, 'officeId', nameKey);
  }

  changeDate() {
    const value = this.helper.changeDate('year', 'month');
    this.monthYears = value.months;
    this.dayOfMonths = value.days;
    const chooseDay = $('#day').val();
    this.warekiYear = $('#year option:selected').text();
    if (this.dayOfMonths.indexOf(chooseDay) === -1) {
      $('#day').val('');
      this.modelGroupForm.controls.birthDayDay.setValue('');
    }
  }


  @HostListener('window:imageChange', ['$event'])
  testListener(event) {
    const $parent = event.detail;
    const id = $parent.attr('id');
    if (id === 'imageCropper1' && this.imageCropperComponent) {
      this.imageCropperComponent.getImageUrl('imageCropper1').subscribe((res) => {
        this.imageBlob = res;
        this.modelGroupForm.patchValue(
          {'imageByteSize': res.size});
        this.modelGroupForm.patchValue(
          {'imageByte': this.blobToUint8Array(this.imageBlob)});
      }, (error) => {
        this.modelGroupForm.patchValue(
          {'imageByte': []});
        this.modelGroupForm.patchValue(
          {'imageByteSize': 0});
      });
    }
    if (id === 'imageCropper2' && this.identifyImageComponent) {
      this.identifyImageComponent.getImageUrl('imageCropper2').subscribe((res) => {
        this.identificationBlob = res;
        this.modelGroupForm.patchValue(
          {'identificationImageByteSize': res.size});
        this.modelGroupForm.patchValue(
          {'identificationImageByte': this.blobToUint8Array(this.identificationBlob)});
        this.modelGroupForm.patchValue(
          {'identificationFileName': res.name});
      }, (error) => {
        this.modelGroupForm.patchValue(
          {'identificationImageByteSize': 0});
        this.modelGroupForm.patchValue(
          {'identificationImageByte': []});
      });
    }
  }

  blobToUint8Array(blob) {
    const reader = new FileReader();
    const fileByteArray = [];
    if (blob instanceof Blob) {
      reader.readAsArrayBuffer(blob);
      reader.onload = f => {
        const contents: any = f.target;
        const arrayBuffer = contents.result,
          array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < array.length; i++) {
          fileByteArray.push(array[i]);
        }
      };
    }
    return fileByteArray;
  }

  // uploadToFirebase(id) {
  //   setTimeout(() => {
  //     this.dialogService.setLoaderVisible(true);
  //   });
  //   const listReq = [this.firebaseStorage.uploader.re(this.selectedCompany, id, id, this.imageBlob),
  //     this.firebaseStorage.uploader.re_identification(this.selectedCompany, id, id, this.identificationBlob)
  //   ];
  //   Observable.forkJoin(listReq).subscribe((resList) => {
  //     if (resList[0].done && resList[1].done) {
  //       this.sendToServer(id);
  //     }
  //   }, (error) => {
  //     setTimeout(() => {
  //       this.dialogService.setLoaderVisible(false);
  //     });
  //     this.dialogService.showError('MSG.ERROR');
  //   });
  // }

  // getFireBaseUrl(id) {
  //   this.dialogService.setLoaderVisible(true);
  //   const listReq = [this.firebaseStorage.faceImageOriginURL(this.selectedCompany, id, ''),
  //     this.firebaseStorage.faceImageOriginURL(this.selectedCompany, id, 'identification')
  //   ];
  //   Observable.forkJoin(listReq).subscribe((resList) => {
  //     this.sendToServer(id, resList);
  //   }, (error) => {
  //     this.dialogService.setLoaderVisible(false);
  //     this.dialogService.showError('MSG.ERROR');
  //   });
  // }

  // sendToServer(id) {
  //   const setting = {
  //     'officeUserId': id,
  //     'fileName': this.modelGroupForm.get('identificationFileName').value,
  //     'identificationImageUrl': '/img/staff/identifier/pr/' + this.selectedCompany + '/' + id,
  //     'imageUrl': '/img/staff/face/' + this.selectedCompany + '/' + id
  //   };
  //   setTimeout(() => {
  //     this.dialogService.setLoaderVisible(true);
  //   });
  //   this.registrationService.postUploadImage(setting).subscribe(next => {
  //     setTimeout(() => {
  //       this.dialogService.setLoaderVisible(false);
  //     });
  //   }, (error) => {
  //     setTimeout(() => {
  //       this.dialogService.setLoaderVisible(false);
  //     });
  //     this.dialogService.showError('MSG.ERROR');
  //   });
  // }
}
