import {AfterViewInit, Component, HostListener, OnInit, ViewChild} from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { RegistrationService } from '../../../services/registration.service';
import { PrUserEditSettings } from '../../../models/re/pr-user-edit-settings';
import { Helper } from '../../../common/helper';
import { SharedValueService } from '../../../services/shared-value.service';
import { PrUserEditValidator } from './re0010-page.validator';
import { Re0010UpdateMailSendApi } from '../../../models/re/re0010-update-mail-send-api';
import { Re0010UpdateAdditionalMailSendApi } from '../../../models/re/re0010-update-additional-mail-send-api';
import { UserSession } from '../../../models/ba/user-session';
import { HttpError } from '../../../common/error/http.error';
import {HandleField} from '../../../models/ma/handle-field';
import {MasterService} from '../../../services/master.service';
import {Prefecture} from '../../../models/ma/prefecture';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';
import {ImageCropperComponent} from '../../../components/image-cropper/image-cropper.component';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';
import {UserUpdateMailSave} from '../../../models/re/user-update-mail-save';
declare var moment: any;
declare const $: any;
const max_year = 88;

@Component({
  selector: 'app-re0010-page',
  templateUrl: './re0010-page.component.html',
  styleUrls: ['./re0010-page.component.scss'],
  providers: [PrUserEditValidator]
})
export class Re0010PageComponent implements OnInit, AfterViewInit {
  @ViewChild('imageCropper1')
  protected imageCropperComponent: ImageCropperComponent;
  @ViewChild('imageCropper2')
  protected identifyImageComponent: ImageCropperComponent;
  editInfoForm: FormGroup;
  public model = new PrUserEditSettings();
  userInfo: any;
  formErrors: any;
  submitted = false;
  arrayFormGroupMail;
  listMail;
  arrayBirthDate = [];
  option_years = [];
  option_years_text = [];
  months = [];
  days = [];
  listDepartment;
  userSession: UserSession;
  options = [
    { value: true, display: '1' },
    { value: false, display: '0' }
  ];
  listKeyProvince: any;
  fieldIds = [];
  /**
   * RE0010 start progress change or add mail address
   */
  formConfirmMail: FormGroup;
  subscription: Subscription;
  reservationToken: string;
  reservationId;
  // type = change or add
  type: string;
  confirmMail = false;
  oldMailAddress: string;
  newMailAddress: string;
  formInputPassError;
  addMailPageTitle = false;
  changeMailPageTitle = false;
  formContent = false;
  mailExpiredContent = false;
  msgStore: any;
  changes: any[];
  identifyUpdated = false;
  initDone = false;
  path_image_origin = '';
  path_image_identify = '';
  modelSendApi: any;
  flagImgDestroy: boolean;
  curLoginId: any;
  mailRegisteredContent = false;
  flagUpdateImg = true;
  flagMailAddition = false;
  flagMailAddress = false;
  /**
   * RE0010 end progress change or add mail address
   */
  constructor(private registrationService: RegistrationService,
    private fb: FormBuilder,
    private dialogService: DialogService,
    private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private helper: Helper,
    private prUserEditValidator: PrUserEditValidator,
    private sharedValueService: SharedValueService,
    private route: Router,
    private firebaseStorage: FirebaseStorage,
    private masterService: MasterService) {
      this.formErrors = this.prUserEditValidator.formErrors;
      this.formInputPassError = this.prUserEditValidator.formInputPassError;
      this.createForm();
      /**--- RE0010 start progress change or add mail address ---*/
      this.formConfirmMail = this.prUserEditValidator.formConfirmMail();
      /**--- RE0010 end progress change or add mail address ---*/
  }

  ngOnInit() {
    /**--- RE0010 start progress change or add mail address ---*/
    this.subscription = this.activatedRoute.params.subscribe((params: Params) => {
      this.reservationToken = params['token'];
      this.type = params['type'];
    });
    if (this.reservationToken !== undefined && this.reservationToken !== '') {
      this.loadConfirmMailPage();
      /**--- RE0010 end progress change or add mail address ---*/
    } else {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      this.userSession = this.sharedValueService.getUserSession();
      this.path_image_origin = '/img/staff/face/' + this.userSession.officeId + '/' + this.userSession.officeUserId;
      this.path_image_identify = '/img/staff/identifier/pr/' + this.userSession.officeId + '/' + this.userSession.officeUserId;
      this.masterService.getHandleField().subscribe(
        (handleField: HandleField) => {
          this.convertListHandles(handleField);
        }, (error: HttpError) => {
          this.dialogService.showError('MSG.ERROR');
        }
      );
      this.masterService.getPrefecture().subscribe(
        (prefecture: Prefecture) => {
          this.listKeyProvince = prefecture.mrPrefectures;
        }, (error: HttpError) => {
          this.dialogService.showError('MSG.ERROR');
        }
      );
      this.registrationService.getPrUserEditSettings().subscribe((settings: PrUserEditSettings) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.model = settings;
        this.userInfo = settings; // to check changes
        this.curLoginId  = this.userInfo.loginId;
        this.createForm();
      },
        error => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showError('VAL.GET_USER_FAILED');
        });
    }
    this.translate.get(['MSG', 'COMMON_LABEL', 'RE0010']).subscribe(
      (res) => {
        this.msgStore = res;
      }
    );
  }

  ngAfterViewInit() {
    $.fn.autoKana('#surname', '#surname-kana');
    $.fn.autoKana('#name', '#name-kana');
  }

  // disabledSubmitOnEnter(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     event.preventDefault();
  //     return;
  //   }
  // }
  /**
   * RE0010 disable copy & paste event
   */
  disableCopyPaste(elementId: string, index?: number) {
    if (index !== undefined) {
      $('#' + elementId + index).bind('copy and paste', (e) => {
        e.preventDefault();
      });
    } else {
      $('#' + elementId).bind('copy and paste', (e) => {
        e.preventDefault();
      });
    }
  }

  uploadImageError(event: any) {
    if(event === false){
      this.dialogService.showError('IMAGE_CROPPER.IMAGE_MAX_LENGTH');
    }
  }

  uploadIdentifyImageError(event: any) {
    if(event === false){
      this.dialogService.showError('IMAGE_CROPPER.IMAGE_MAX_LENGTH');
    }
  }
  /**
   * RE0010 start edit Pr user information
   */
  get additionalMailAddressData() {
    return <FormArray>this.editInfoForm.get('additionalMailAddress');
  }

  get listHandlesData() {
    return <FormArray>this.editInfoForm.get('listHandles');
  }

  convertListHandles(object) {
    for (let i = 0; i < object.mrFieldTypes.length; i++) {
      const fieldElement = {};
      fieldElement['id'] = object.mrFieldTypes[i]['id'];
      fieldElement['text'] = object.mrFieldTypes[i]['name'];
      this.fieldIds.push(fieldElement);
    }
  }

  getBirthDate() {
    const birthDate = moment(this.model.birthDate).format();
    const value = this.helper.parseBirthDate(birthDate);
    this.arrayBirthDate = value.arrayBirthDate;
    this.months = value.months;
    this.days = value.days;
    const d = new Date();
    const years = this.helper.graduationYearOptions(d.getFullYear() - 1929, true);
    this.option_years = years[0];
    this.option_years_text = years[1];
  }

  changeDate() {
    const value = this.helper.changeDate('year', 'month');
    this.months = value.months;
    this.days = value.days;
  }

  createForm() {
    this.editInfoForm = this.prUserEditValidator.userEditForm(this.model);
    this.identifyUpdated = false;
    this.getAdditionalMails();
    this.getBirthDate();
    this.getListHandles();
  }

  /**
   * RE0010 delete account
   * param userID
   */
  deleteAccount() {
    let html = '';
    this.translate.get('MSG').subscribe(msg => {
      html = '<p>' + msg.RE0010.E001_2 + '</p>' +
        '<div class="text-left" style="background-color:#eee; padding:0.7rem 1rem 0.5rem; border-radius:0.5rem">' +
        '<p>' + msg.RE0010.E001_3_1 + '<br>' + msg.RE0010.E001_3_2 + '<span class="text-danger">' +
          msg.RE0010.E001_3_2_RED + '</span>' + '<br>' + msg.RE0010.E001_3_3 + '<span class="text-danger">' +
        msg.RE0010.E001_3_RED + '</span>' + msg.RE0010.E001_3_4 + '</p></div>';
    });
    this.dialogService.showMessage('warning', false, null, null, html, 'BTN.DELETE', 'MSG.CANCEL', 'modal-lg').subscribe(
      (res: DialogResult) => {
        if (res.isOk()) {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(true);
          });
          this.registrationService.deletePrUser(this.userSession.userId).subscribe(
            (response) => {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
            },
            error => {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
              setTimeout(() => {
                this.dialogService.showError('VAL.DELETE_USER_FAILED');
              }, 500);
            });
        }
      });
  }

  checkIfImageUpdated(src) {
    // true - updated
    if (src) {
      return /^blob/.test(src);
    }
    return false;
  }

  imgDestroy(event: any){
    this.flagImgDestroy = true;
  }

  validateIdentifyImage() {
    this.identifyImageComponent.getImageUrl('imageCropper2').subscribe((res) => {
      let imgName = '';
      if (this.checkIfImageUpdated(res.src)) {
        imgName = res.name.split('\\').pop();
        this.model.identificationUpdated = moment().format();
      } else {
        // if not updated then get old name
        imgName = this.model.identificationFileName;
      }

      this.editInfoForm.get('identificationFileName').setValue(imgName);
    }, (error) => {
      if(this.flagImgDestroy){
        this.editInfoForm.get('identificationFileName').setValue('');
        this.model.identificationUpdated = '';
        this.flagImgDestroy = false;
      }
    });
  }

  postPrUserEditSettings() {
    this.submitted = true;
    this.editInfoForm.patchValue({ 'mobileNo': this.helper.combinePhoneNumber('pr-mobile-first', 'pr-mobile-middle', 'pr-mobile-last') });
    this.editInfoForm.patchValue({ 'branchPhoneNo': this.helper.combinePhoneNumber('pr-phone-first', 'pr-phone-middle', 'pr-phone-last') });
    this.editInfoForm.patchValue({ 'birthDate': this.helper.combineBirthDate('year', 'month', 'day') });
    this.editInfoForm.patchValue({'lastNameKana': $('#surname-kana').val()});
    this.editInfoForm.patchValue({'firtNameKana': $('#name-kana').val()});
    const res = this.helper.gotoError();
    const resultCheckValidate = this.prUserEditValidator.validationSubmited(this.editInfoForm, this.userInfo);
    this.formErrors = resultCheckValidate.formErrors;
    if (resultCheckValidate.checkFormValid && resultCheckValidate.checkArrayValid && resultCheckValidate.checkBirthDate) {
      this.model = this.editInfoForm.value;
      this.changes = this.getChanges();
      this.model.listHandles = this.model.listHandles.map((val) => val['fieldId']);
      this.model.additionalMailAddress = this.model.additionalMailAddress.map((val) => val['email']);
      this.showConfirmDialog(this.changes, 0);
    }
  }

  uploadImageToFirebase(type: string, html: string) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.imageCropperComponent.getImageUrl('imageCropper1').subscribe((res) => {
        this.firebaseStorage.uploader.re(this.userSession.officeId, this.userSession.officeUserId, this.userSession.officeUserId, res)
          .subscribe((data) => {
              if (data.done) {
                if(!this.model.imageUrl){
                  this.model.imageUrl = this.path_image_origin;
                }else{
                  this.imageCropperComponent.loadImage(data.url, 'imageCropper1');
                }
                const img = document.createElement('img');
                img.onload = () => {
                  this.sendUserSettingsToServer();
                };
                img.src = data.url;
              }
            },
            (error) => {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
              this.dialogService.showError('MSG.ERROR');
            });
      },
      (error) => {
        if(this.model.imageUrl){
          this.firebaseStorage.deleteImageUrl(this.model.imageUrl);
        }
        this.model.imageUrl = '';
        this.sendUserSettingsToServer();
      }
    );
  }

  sendUserSettingsToServer() {
    this.modelSendApi = JSON.parse(JSON.stringify(this.model));
    this.registrationService.putPrUserEditSettings(this.modelSendApi).subscribe(
      response => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.curLoginId = this.modelSendApi.loginId;
        if(this.modelSendApi.mailAddress !== ''){
          this.model.mailAddress = this.userInfo.mailAddress;
        }else{
          this.userInfo.mailAddress = '';
        }

        this.model.additionalMailAddress = this.userInfo.additionalMailAddress.filter(mail => this.modelSendApi.additionalMailAddress.indexOf(mail) > -1 );
        this.userInfo.additionalMailAddress = this.model.additionalMailAddress;
        this.createForm();
        if (this.changes.length > 0) {
          if (this.changes.indexOf('loginIdChange') > -1 && this.changes.indexOf('identificationUpdate') > -1) {
            this.identifyUpdated = false;
            this.changes.splice(this.changes.indexOf('loginIdChange'), 1);
          }
        }
        this.showSuccessDialog(this.changes, 0);
        this.identifyUpdated = false;
        this.initDone = false;
        this.registrationService.getStaffListDetail(this.userSession.userId, true).subscribe(
          (next) => {
          }
        );
        this.firebaseStorage.downloadURL(this.path_image_origin, true).subscribe(
          (next) => {
          }
        );
        this.firebaseStorage.downloadURL(this.path_image_identify, true ).subscribe(
          (next) => {}
        );
      },
      (error: HttpError) => {
        const msg = JSON.parse(error.message);
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.formErrors.loginId = '';
        for (let key in msg) {
          if(key === 'loginId'){
            this.formErrors.loginId = this.msgStore.RE0010.RE0010_ERROR.EXISTED_ID;
            this.curLoginId = this.userInfo.loginId;
          }

          if(key === 'mailAddress'){
            this.formErrors.mailAddress = this.msgStore.RE0010.RE0010_ERROR.EXISTED_MAIL;
          }

          if(key === 'addAllAdditionalMailAddress'){
            let errMailAddress = msg[key].replace('[', '').replace(']', '').split(', ');
            let arrayAdditionalMail = this.editInfoForm.get('additionalMailAddress').value;
            for( let i = 0; i < arrayAdditionalMail.length; i++){
              if(errMailAddress.indexOf(arrayAdditionalMail[i].email) > -1){
                this.formErrors.additionalMailAddress[i] = this.msgStore.RE0010.RE0010_ERROR.EXISTED_MAIL;
              }
            }
          }
        }
        if(!('loginId' in msg)){
          this.editInfoForm.get('loginId').setValue(this.curLoginId);
        }
        this.helper.gotoError();
      });

  }

  nextDiaglog(changes, i) {
    setTimeout(() => {
      this.showSuccessDialog(changes, i);
    }, 200);
  }

  showSuccessDialog(changes, i) {
    if (changes.length > 0 && changes[i]) {

      const change = changes[i];
      i++;
      switch (change) {
        case 'mailChange':
          const html = '<p>' + this.msgStore.MSG.MSG_SEND_MAIL.MSG_1 + '</p>' +
            '<p>' + this.msgStore.MSG.MSG_SEND_MAIL.MSG_2 + '</p>' +
            '<p>' + this.msgStore.MSG.MSG_SEND_MAIL.MSG_3 + '</p>';
          this.dialogService.showMessage('success', false, null, null, html, 'MSG.OK', null).subscribe(
            (res: DialogResult) => {
              if (res.isOk()) {
                this.nextDiaglog(changes, i);
              }
            });
          break;
        case 'loginIdChange':this.nextDiaglog(changes, i);break;
        case 'identificationUpdate':
          if(this.flagUpdateImg){
            this.dialogService.showMessage('success', false, null, null, this.msgStore.RE0010.CONFIRM_INDENTIFICATION_IMAGE_SUCCESS, 'MSG.OK', null).subscribe(
                (res: DialogResult) => {
                  if (res.isOk()) {
                    this.nextDiaglog(changes, i);
                  }
                });
          }
          break;
        default:
          //this.resetPage();
      }
    } else {
      // this.dialogService.showSuccess('MSG.SAVED');
      this.dialogService.showMessage('success', false, null, 'MSG.SAVED', null, 'MSG.OK', null).subscribe(
          (res: DialogResult) => {
            if (res.isOk()) {
              //this.resetPage();
            }
          });
    }
  }

  resetPage() {
    this.ngOnInit();
  }
  /**
   * RE0010 get additional mail addresses
   */
  getAdditionalMails() {
    this.arrayFormGroupMail = new Array();
    this.listMail = new Array();
    const mailDB = this.model.additionalMailAddress;
    if (mailDB && mailDB.length > 0) {
      if (mailDB.length === 1 && mailDB[0] === '') {
        this.addEmail();
      } else {
        for (let i = 0; i < mailDB.length; i++) {
          this.arrayFormGroupMail = <FormArray>this.editInfoForm.get('additionalMailAddress');
          if (mailDB[i] !== '') {
            const newEmail = this.fb.group(
              {email: [mailDB[i], [Validators.required, Validators.maxLength(64), Validators.pattern(Helper.emailRegex)]]});
            this.arrayFormGroupMail.push(newEmail);
            const element = {};
            element['value'] = mailDB[i];
            element['flag'] = true;
            this.listMail.push(element);
          }
        }
      }

    } else {
      this.addEmail();
    }
  }

  onClickAddMail(event) {
    event.preventDefault();
    this.addEmail();
  }

  /**
   * RE0010 add new mail address
   */
  addEmail() {
    if (this.editInfoForm.get('additionalMailAddress').value.length < 5) {
      this.arrayFormGroupMail = <FormArray>this.editInfoForm.get('additionalMailAddress');
      const newControl = this.fb.group(
        {email: ['', [Validators.required, Validators.maxLength(64), Validators.pattern(Helper.emailRegex)]]});
      this.arrayFormGroupMail.push(newControl);
      const newEmail = {value: '', flag: false};
      this.listMail.push(newEmail);
      if (this.editInfoForm.get('additionalMailAddress').value.length === 0) {
        this.prUserEditValidator.formErrors['additionalMailAddress'].push('');
      }
    } else {
      // do nothing...
    }
  }

  /**
   * RE0010 remove an additional mail address
   */
  removeEmail(i: number) {
    const arrayEmail = <FormArray>this.editInfoForm.get('additionalMailAddress');
    let html = '';
    this.translate.get('MSG').subscribe((msg) => {
      html = '<p>' + msg.RE0020_1.E003_1 + '</p>' + '<p>' + msg.RE0020_1.E003_2 + '</p>';
    });
    for (let j = 0; j < this.listMail.length; j++) {
      if (j === i) {
        const email = this.listMail[j];
        if (email.flag === true && arrayEmail.value[i] !== '') {
          this.dialogService.showMessage('warning', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
            (res: DialogResult) => {
              if (res.isOk()) {
                arrayEmail.removeAt(i);
                this.listMail.splice(i, 1);
                setTimeout(() => {
                  this.dialogService.showSuccess('MSG.DELETED');
                }, 500);
                if (arrayEmail.length === 1 && arrayEmail.value[0] === '') {
                  this.prUserEditValidator.formErrors['additionalMailAddress'] = [];
                } else {
                  this.prUserEditValidator.formErrors['additionalMailAddress'].splice(i, 1);
                }
              }
            }
          );
        } else {
          arrayEmail.removeAt(i);
          if (arrayEmail.length === 1 && arrayEmail.value[0] === '') {
            this.prUserEditValidator.formErrors['additionalMailAddress'] = [];
          } else {
            this.prUserEditValidator.formErrors['additionalMailAddress'].splice(i, 1);
          }
        }
      }
    }
  }

  /**
   * RE0010 get specializedDepartment
   */
  getListHandles() {
    this.listDepartment = new Array();
    const listHandles = this.model.listHandles;
    if (listHandles && listHandles[0]) {
        for (let i = 0; i < listHandles.length; i++) {
          this.listDepartment = <FormArray>this.editInfoForm.get('listHandles');
          if (listHandles[i] !== '') {
            const newDepart = this.fb.group({ fieldId: [listHandles[i], [Validators.required]] });
            this.listDepartment.push(newDepart);
          }
        }
    } else {
      this.addSpecializedDepartment();
    }
  }

  clickAddDepartment(event) {
    event.preventDefault();
    this.addSpecializedDepartment();
  }

  /**
   * RE0010 add new specializedDepartment
   */
  addSpecializedDepartment() {
    if (this.editInfoForm.get('listHandles').value.length < 5) {
      this.listDepartment = <FormArray>this.editInfoForm.get('listHandles');
      const newDepart = this.fb.group({ fieldId: ['', [Validators.required]] });
      this.listDepartment.push(newDepart);
      if (this.editInfoForm.get('listHandles').value.length === 0) {
        this.prUserEditValidator.formErrors['listHandles'].push('');
      }
    } else {
      // do nothing...
    }
  }

  /**
   * RE0010 remove a specializedDepartment
   */
  removeDepartment(i) {
    const arrayDepartment = <FormArray>this.editInfoForm.get('listHandles');
    this.dialogService.showMessage('warning', false, null, 'MSG.RE0010_1.E006_1', null, 'MSG.YES', 'MSG.NO').subscribe(
      (res: DialogResult) => {
        if (res.isOk()) {
          arrayDepartment.removeAt(i);
          if (arrayDepartment.length === 1 && arrayDepartment.value[0] === '') {
            this.prUserEditValidator.formErrors['listHandles'] = [];
          } else {
            this.prUserEditValidator.formErrors['listHandles'].splice(i, 1);
          }
        }
      }
    );
  }


  /**
   * RE0010 check string length in a textbox
   */
  checkLength(event: any, field: string, limit: number) {
    this.editInfoForm.controls[field].setValue(event.target.value);
    if (event.target.value.length > limit) {
      this.editInfoForm.controls[field].setValue(event.target.value.slice(0, limit));
    } else {
      // do nothing...
    }
  }

  /**
   * RE0020 get Japanese characters when you type
   */
  getJapaneseChars(event: any, field: string) {
    this.editInfoForm.get(field).setValue(event.target.value);
  }

  checkNotificationMail(): boolean {
    const mailAddress = this.editInfoForm.get('mailAddress').value;
    if (mailAddress !== '' && mailAddress !== this.userInfo.mailAddress) {
      return true;
    } else {
      // do nothing...
    }
    return false;
  }

  checkAdditionalMail(): boolean {
    const arrayAdditionalMail = this.editInfoForm.get('additionalMailAddress').value.map((val) => val['email']);
    const arrayMail = this.userInfo.additionalMailAddress;
    const diff = arrayAdditionalMail.filter((mail) => (mail !== '' && arrayMail.indexOf(mail) === -1));
    if (diff.length) {
      return true;
    }
    return false;
  }

  checkMailChange(): boolean {
    this.checkNotificationMail();
    this.checkAdditionalMail();
    if (this.checkNotificationMail() || this.checkAdditionalMail()) {
      return true;
    }
    return false;
  }

  getChanges() {
    const loginId = this.editInfoForm.get('loginId').value;
    const changes = [];
    if (loginId !== this.curLoginId) {
      changes.push('loginIdChange');
    }
    if (this.checkMailChange()) {
      changes.push('mailChange');
    }
    if (this.identifyUpdated) {
      changes.push('identificationUpdate');
    }
    return changes;
  }

  showConfirmDialog(changes, i) {
    if (changes && changes[i]) {
      const obj = {isConfirm: true, isCallApi: false, checkCallApi: true, checkPlaceHolder: true};
      const change = changes[i];
      i++;
      switch (change) {
        case 'loginIdChange':
          const html1 = '<p>' + this.msgStore.MSG.RE0010_1.E007_1 + '</p>' +
            '<p>' + this.msgStore.MSG.RE0010_1.E007_2 + '</p>' +
            '<div class="text-left">' + this.msgStore.COMMON_LABEL.LBL_PASSWORD_LOGIN + '</div>';
          this.dialogService.showInputPasswordDialog(html1, obj, null, null).subscribe((res: DialogResult) => {
            if (res.isOk()) {
              setTimeout(() => {
                this.showConfirmDialog(changes, i);
              }, 200);
            }else{
              this.editInfoForm.get('loginId').setValue(this.curLoginId);
            }
          });
          break;
        case 'mailChange': this.showConfirmDialog(changes, i);break;
        case 'identificationUpdate':
          const msg = '<p>' + this.msgStore.RE0010.CONFIRM_INDENTIFICATION_IMAGE_1 + '</p>'
            + '<p>' + this.msgStore.RE0010.CONFIRM_INDENTIFICATION_IMAGE_2 + '</p>';
          this.dialogService
            .showMessage('warning', false, null, null, msg, 'MSG.OK', 'MSG.CANCEL')
            .subscribe((result: DialogResult) => {
              if (result.isOk()) {
                this.flagUpdateImg = true;
                this.uploadIdentifyImage(() => {
                  setTimeout(() => {
                    this.showConfirmDialog(changes, i);
                  }, 200);
                });
              }else{
                this.flagUpdateImg = false;
                this.model.identificationFileName = this.userInfo.identificationFileName;
                this.uploadIdentifyImage();
              }
            });
          break;
        default:
          this.showConfirmDialog(changes, i);
      }
    } else {
      this.uploadImageToFirebase(null, null);
    }
  }

  uploadIdentifyImage(callback?) {
    if(this.flagUpdateImg){
      this.identifyImageComponent.getImageUrl('imageCropper2').subscribe((res) => {
        this.firebaseStorage.uploader
            .re_identification(this.userSession.officeId, this.userSession.officeUserId, this.userSession.officeUserId, res)
            .subscribe((data) => {
                  if (data.done) {
                    this.model.identificationImageUrl = this.path_image_identify;
                    this.model.identificationUpdated = moment().format('YYYY-MM-DDTHH:mm:ssZZ');
                    this.identifyImageComponent.loadImage(data.url, 'imageCropper2', 'card');
                    if (callback) {
                      // if success then continue
                      callback();
                    }
                  }
                },
                (error) => {
                  this.dialogService.showError('MSG.ERROR');
                });
      });
    }else{
      this.firebaseStorage.downloadURL(this.path_image_identify, true).subscribe(
          (url) => {
            this.identifyImageComponent.loadImage(url, 'imageCropper2', 'card');
            if (callback) {
              // if success then continue
              callback();
            }
            this.identifyUpdated = false;
            this.initDone = false;
          });
    }

  }
  /**
   * RE0010 end edit Pr user information
   */
  /**-------------------------------------RE0010 start progress change or add mail address-------------------------**/
  loadConfirmMailPage() {
    this.confirmMail = true;
    if (this.type === 'mail_address_change_reservation') {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      this.registrationService.getPrMailAddressChangeReservation(this.reservationToken).subscribe(
        response => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.getConfirmMailPage(response, this.type);
        },
        error => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.changeMailPageTitle = true;
          this.mailRegisteredContent = true;
          //this.dialogService.showError('MSG.ERROR');
        });
    } else if (this.type === 'additional_mail_address_change_reservation') {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      this.registrationService.getPrAdditionalMailAddressChangeReservation(this.reservationToken).subscribe(
        response => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.getConfirmMailPage(response, this.type);
        },
        error => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.mailRegisteredContent = true;
          this.addMailPageTitle = true;
          //this.dialogService.showError('MSG.ERROR');
        });
    } else {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      //this.dialogService.showError('MSG.ERROR');
    }
  }

  getConfirmMailPage(res, type) {
    this.reservationId = res.reservationId;
    if (type === 'mail_address_change_reservation') {
      this.flagMailAddress = true;
      this.oldMailAddress = res.oldMailAddress;
      if(this.oldMailAddress !== ''){
        this.changeMailPageTitle = true;
      }else{
        this.addMailPageTitle = true;
      }
      this.newMailAddress = res.newMailAddress;
      if(res.reservaationStatus === 'ACCEPTED'){
        this.formContent = true;
        this.formConfirmMail = this.fb.group({
          'inputPass': ['', Validators.required]
        });
      }else if(res.reservaationStatus === 'EXIPIED'){
        this.mailExpiredContent = true;
      }else{
        this.mailRegisteredContent = true;
      }
    } else if (type === 'additional_mail_address_change_reservation') {
      this.flagMailAddition = true;
      this.addMailPageTitle = true;
      this.newMailAddress = res.newMailAddress;
      if(res.reservaationStatus === 'ACCEPTED'){
        this.formContent = true;
        this.formConfirmMail = this.fb.group({
          'inputPass': ['', Validators.required]
        });
      }else if(res.reservaationStatus === 'EXIPIED'){
        this.mailExpiredContent = true;
      }else{
        this.mailRegisteredContent = true;
      }
    } else {
      this.dialogService.showError('MSG.ERROR');
    }
  }

  parseJwt (token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  };

  putConfirmMail() {
    this.formInputPassError = this.prUserEditValidator.checkPassValid(this.formConfirmMail);
    const password = this.formConfirmMail.get('inputPass').value;
    if (this.formConfirmMail.valid) {
      if (this.type === 'mail_address_change_reservation') {
        const modelSendAPI = new Re0010UpdateMailSendApi(this.reservationId, this.reservationToken, password);
        setTimeout(() => {
          this.dialogService.setLoaderVisible(true);
        });
        this.registrationService.updatePrMailAddress(modelSendAPI).subscribe(
          (response: UserUpdateMailSave) => {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(false);
            });
            this.dialogService.showSuccess('RE0020.REGISTERED').subscribe((res)=>{
              if(res.isOk()){
                if(this.sharedValueService.isLoggedIn()){
                  if (this.parseJwt((JSON.parse(localStorage.getItem('pr_auth_token'))).access_token).user_id
                    === response.userId) {
                    this.route.navigate(['/re/re0010']);
                  } else {
                    this.route.navigate(['logout']);
                  }
                }else{
                  this.route.navigate(['/re/re0013/email/' + this.reservationToken]);
                }
              }
            });
            // redirect to edit user info page
          },
          (error: HttpError) => {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(false);
            });
            if (error.message.indexOf('Invalid current password')> -1) {
              this.translate.get('VAL').subscribe(msg => {
                this.formInputPassError = msg.PASS_ERROR;
              });
            }else if(error.message.indexOf('email not validate') > -1){
              this.formContent = false;
              this.mailRegisteredContent = true;
            }else if(error.message.indexOf('total mailAdditionAddress > 5') > -1) {
              this.dialogService.showSuccess('RE0020.OVER_MAIL').subscribe((res) => {
                if (res.isOk()) {
                  if (this.sharedValueService.isLoggedIn()) {
                    this.route.navigate(['/re/re0010']);
                  } else {
                    this.route.navigate(['/re/re0013/email/' + this.reservationToken]);
                  }
                }
              });
            }else if(error.message.indexOf('Token not validate') > -1){
              this.formContent = false;
              this.mailExpiredContent = true;
            }
            else {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
              this.dialogService.showError('MSG.ERROR');
            }
          }
        );
      } else if (this.type === 'additional_mail_address_change_reservation') {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(true);
        });
        const modelAdditionalMail = new Re0010UpdateAdditionalMailSendApi(this.reservationId, this.reservationToken, password);
        this.registrationService.updatePrAdditionalMailAddress(modelAdditionalMail).subscribe(
          (response: UserUpdateMailSave) => {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(false);
            });
            this.dialogService.showSuccess('RE0020.REGISTERED').subscribe((res)=>{
              if(res.isOk()){
                if(this.sharedValueService.isLoggedIn()){
                  if (this.parseJwt((JSON.parse(localStorage.getItem('pr_auth_token'))).access_token).user_id
                    === response.userId) {
                    this.route.navigate(['/re/re0010']);
                  } else {
                    this.route.navigate(['logout']);
                  }
                }else{
                  this.route.navigate(['/re/re0013/email/' + this.reservationToken]);
                }
              }
            });
          },
          (error: HttpError) => {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(false);
            });
            if (error.message.indexOf('Invalid current password')> -1) {
              this.translate.get('VAL').subscribe(msg => {
                this.formInputPassError = msg.PASS_ERROR;
              });
            }else if(error.message.indexOf('email not validate') > -1){
              this.formContent = false;
              this.mailRegisteredContent = true;
            }else if(error.message.indexOf('total mailAdditionAddress > 5') > -1) {
              this.dialogService.showError('RE0020.OVER_MAIL').subscribe((res) => {
                if (res.isOk()) {
                  if (this.sharedValueService.isLoggedIn()) {
                    this.route.navigate(['/re/re0010']);
                  } else {
                    this.route.navigate(['/re/re0013/email/' + this.reservationToken]);
                  }
                }
              });
            }else if(error.message.indexOf('Token not validate') > -1){
              this.formContent = false;
              this.mailExpiredContent = true;
            }
            else {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
              this.dialogService.showError('MSG.ERROR');
            }
          }
        );
      }
    } else {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
    }
  }

  /**-------------------------------------RE0010 end progress change or add mail address--------------------------------*/

  @HostListener('window:imageChange', ['$event'])
  testListener(event) {
      const $parent = event.detail;
      if ($parent.length) {
        const id = $parent.attr('id');
        if (id === 'imageCropper2') {
          if (this.initDone || this.checkIfImageUpdated($parent.find('img').attr('src'))) {
            this.identifyUpdated = true;
            this.validateIdentifyImage();
          }
            // ignore changes made when init image
          this.initDone = true;
        }
      }
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     if (!this.confirmMail) {
  //       this.postPrUserEditSettings();
  //     } else {
  //       this.putConfirmMail();
  //     }
  //
  //   }
  // }
}
