import {AfterViewInit, Component, OnInit, HostListener, ViewChild} from '@angular/core';
import {RegistrationService} from '../../../services/registration.service';
import {UserEditSettings} from '../../../models/re/user-edit-settings';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {UserEditSettingsSaveResult} from '../../../models/re/user-edit-settings-save-result';
import {SharedValueService} from '../../../services/shared-value.service';
import {Helper} from '../../../common/helper';
import {Subscription} from 'rxjs/Subscription';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {UserEditValidator} from './user-edit-page.validator';
import {Re0020UpdateMailSendApi} from '../../../models/re/re0020-update-mail-send-api';
import {Re0020UpdateAdditionalMailSendApi} from '../../../models/re/re0020-update-additional-mail-send-api';
import {HttpError} from '../../../common/error/http.error';
import {SpecialityArea} from '../../../models/ma/speciality-area';
import {MasterService} from '../../../services/master.service';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';
import {ImageCropperComponent} from '../../../components/image-cropper/image-cropper.component';
import {SpecialtyAreaConverter} from '../../../common/converter/specialty-area.converter';
import {SpecialityType} from '../../../models/ma/speciality-type';
import { DateConverter } from '../../../common/converter/date.converter';
import {UserUpdateMailSave} from '../../../models/re/user-update-mail-save';

declare const $: any;

const max_year = 89;

@Component({
    selector: 'app-user-edit-page',
    templateUrl: './user-edit-page.component.html',
    styleUrls: ['./user-edit-page.component.scss'],
    providers: [UserEditValidator, SpecialtyAreaConverter, ImageCropperComponent]
})

export class UserEditPageComponent implements OnInit, AfterViewInit {
    @ViewChild('imageCropper1')
    protected imageCropperComponent: ImageCropperComponent;
    editInfoForm: FormGroup;
    userModel = new UserEditSettings();
    private modelSendApi = new UserEditSettings();
    submitted = false;
    arrayFormGroupMail;
    listMail;
    birthdayFormat = {year: '', month: '', day: ''};
    options_graduation_year = [];
    options_graduation_text = [];
    graduation_year_text = '';
    graduationYear;
    checkJobType = false;
    checkBirthDate = false;
    publishingDefault;
    departmentTitle = [];
    listDepartment = [];
    listSpecializedDepartment = [];
    addDepartment;
    countDepartment = 0;
    publishingType = [];
    userSession;
    listDisabled = [];
    department = '';
    formErrors: any;
    options: any;
    fieldDefault: string;
    typeDefault: string;
    fieldIds = [];
    typeIds = [];
    isDr: boolean;
    /**-------------------RE0020 start progress change or add mail address--------------*/
    formConfirmMail: FormGroup;
    subscription: Subscription;
    reservationToken: string;
    reservationId;
    // type = change or add
    type: string;
    confirmMail = false;
    oldMailAddress: string;
    newMailAddress: string;
    formInputPassError = '';
    addMailPageTitle = false;
    changeMailPageTitle = false;
    formContent = false;
    mailExpiredContent = false;
    mailUpdated = false;
    public flagCrop =  false;
    public _defaultPath = '/assets/img/user-no-image.png';
    path_image = '';
    flagImgDestroy: any;
    flagImgUrl: any;
    mailRegisteredContent = false;
    flagMailAddition = false;
    flagMailAddress = false;
    flagLoginId: boolean;
    public noResult: any;
    /**-------------------RE0020 end progress change or add mail address--------------*/
    constructor(private fb: FormBuilder,
                private registrationService: RegistrationService,
                private dialogService: DialogService,
                private translate: TranslateService,
                private sharedValueService: SharedValueService,
                private helper: Helper,
                private activatedRoute: ActivatedRoute,
                private userEditValidator: UserEditValidator,
                private route: Router,
                private storage: FirebaseStorage,
                private masterService: MasterService,
                private specialtyArea: SpecialtyAreaConverter,
                private dateConverter: DateConverter) {
        this.formErrors = this.userEditValidator.formErrors;
        this.formInputPassError = this.userEditValidator.formInputPassError;
        this.createForm();
        this.translate.get(['COMMON_LABEL', 'RE0020']).subscribe(
            res => {
                this.departmentTitle = res.RE0020.DEPARTMENT_TITLE;
                this.fieldDefault = res.COMMON_LABEL.SELECT_DEPARTMENT_FIELD;
                this.typeDefault = res.COMMON_LABEL.SELECT_DEPARTMENT_TYPE;
                this.options = {
                    placeholder: this.typeDefault
                };
                if (res.RE0020.PUBLISHING_TYPE) {
                    this.publishingType = [];
                    for (let i = 0; i < res.RE0020.PUBLISHING_TYPE.length; i++) {
                        const publishing = {};
                        publishing['id'] = res.RE0020.PUBLISHING_TYPE[i].VALUE;
                        publishing['name'] = res.RE0020.PUBLISHING_TYPE[i].TEXT;
                        this.publishingType.push(publishing);
                    }
                }
                if (this.publishingType.length > 0) {
                    this.publishingDefault = this.publishingType[1].id;
                }
            });
        this.masterService.getSpecialityAreas().subscribe(
            (specialtyAreas: SpecialityArea) => {
                this.fieldIds = this.specialtyArea.convertSpecialtyArea(specialtyAreas);
            });
        this.masterService.getSpecialityTypes().subscribe(
            (specialtyType: SpecialityType) => {
                this.typeIds = this.specialtyArea.convertSpecialtyType(specialtyType);
            })
        /**-------------------RE0020 start progress change or add mail address--------------*/
        this.formConfirmMail = this.userEditValidator.formConfirmMail();
        /**-------------------RE0020 end progress change or add mail address--------------*/
    }
    ngOnInit() {
        /** ----------------- Check personal reg redirect RE0034 ----------------------------*/
        this.userSession = this.sharedValueService.getUserSession();
        if (!$.isEmptyObject(this.userSession) && this.userSession.personalFlag == true) {
           this.route.navigate(['re/re0034']);
        }
        /**-------------------RE0020 start progress change or add mail address--------------*/
        this.subscription = this.activatedRoute.params.subscribe((params: Params) => {
            this.reservationToken = params['token'];
            this.type = params['type'];
        });
        this.formErrors = this.userEditValidator.formErrors;
        this.formInputPassError = this.userEditValidator.formInputPassError;
        this.translateInit();
        if (this.reservationToken !== undefined && this.reservationToken !== '') {
            this.formConfirmMail = this.userEditValidator.formConfirmMail();
            this.loadConfirmMailPage();
            /**-------------------RE0020 end progress change or add mail address--------------*/
        } else {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(true);
            });
            this.addDepartment = new Array();
            this.listDepartment = new Array();
            this.userSession = this.sharedValueService.getUserSession();
            this.path_image = '/img/staff/face/' + this.userSession.officeId + '/' + this.userSession.officeUserId;
            this.registrationService.getUserEditSettings().subscribe(
                (settings: UserEditSettings) => {
                    setTimeout(() => {
                      this.dialogService.setLoaderVisible(false);
                    });
                    this.userModel = settings;
                    if(!this.userModel.imageUrl){
                        this.flagCrop = true;
                        this.flagImgUrl = true;
                    }
                    this.isDr = this.userModel.jobType === 'J0001';
                    this.createForm();
                },
                error => {
                    setTimeout(() => {
                      this.dialogService.setLoaderVisible(false);
                    });
                    this.dialogService.showError('VAL.GET_USER_FAILED');
                }
            );
        }
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

    translateInit() {
        if (this.translate.currentLang === 'ja') {
            this.noResult = '結果がありません';
        } else {
            this.noResult = 'No Results Found';
        }
        this.translate.get(['COMMON_LABEL', 'RE0020']).subscribe(
            res => {
                this.departmentTitle = res.RE0020.DEPARTMENT_TITLE;
                this.fieldDefault = res.COMMON_LABEL.SELECT_DEPARTMENT_FIELD;
                this.typeDefault = res.COMMON_LABEL.SELECT_DEPARTMENT_TYPE;
                this.options = {
                    placeholder: this.typeDefault,
                    language: {
                        noResults: () => {
                            return this.noResult;
                        }
                    }
                };

                if (res.RE0020.PUBLISHING_TYPE) {
                    this.publishingType = [];
                    for (let i = 0; i < res.RE0020.PUBLISHING_TYPE.length; i++) {
                        const publishing = {};
                        publishing['id'] = res.RE0020.PUBLISHING_TYPE[i].VALUE;
                        publishing['name'] = res.RE0020.PUBLISHING_TYPE[i].TEXT;
                        this.publishingType.push(publishing);
                    }
                }
                if (this.publishingType.length > 0) {
                    this.publishingDefault = this.publishingType[1].id;
                }
            });
    }

    /**
     * RE0020 disable copy & paste event
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

    get additionalMailAddressData() {
        return <FormArray>this.editInfoForm.get('additionalMailAddress');
    }

    get specializedDepartmentData() {
        return <FormArray>this.editInfoForm.get('specializedDepartment');
    }

    /**
     * convert specializedDepartment format select2
     * @param object
     */
    /**
     * RE0020 fill form with data from API
     */
    createForm() {
        this.checkBirthDate = !!(this.userModel.birthDate);
        this.checkJobType = !!(this.userModel.jobType);
        this.department = this.convertDepartment(this.userModel.department);
        this.birthFormat();
        this.graduationYearInit();
        this.editInfoForm = this.userEditValidator.userEditForm(this.userModel, this.publishingDefault);
        this.getAdditionalMails();
        this.getSpecializedDepartment();
        this.helper.numbericOnlyPaste('phsNo');
    }

    /**
     * RE0020 validate phone number (input accept only numbers)
     */
    acceptNumber(event) {
        this.helper.numericOnly(event);
    }

    convertDepartment(department) {
        let str = '';
        if (department && department.path !== 'undefined') {
            str = department.path.slice(1, -1).split('/').join('|');
            if(str === ''){
                str = department.displayName;
            }
        } else {
            str = '';
        }

        return str;
    }

    /**
     * RE0020 format date of birth
     */
    birthFormat() {
        if (this.userModel.birthDate) {
            const birthDate = new Date(this.dataConvert(this.userModel.birthDate,'L'));
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
                {
                    'value1': this.birthdayFormat.year,
                    'value2': this.birthdayFormat.month,
                    'value3': this.birthdayFormat.day
                });
            return content;
        } else {
            // do nothing...
        }
    }

    dataConvert(date:string,format:string){
        return this.dateConverter.moment(date,format);
    }

  graduationYearInit() {
        const value = this.helper.graduationYearOptions(max_year);
        this.options_graduation_year = value[0];
        this.options_graduation_text = value[1];
        if (this.userModel.graduationDate) {
            const d = new Date(this.dataConvert(this.userModel.graduationDate,'L'));
            this.graduationYear = d.getFullYear().toString();
            this.graduation_year_text = this.helper.graduationYearText(d.getFullYear());
        } else {
            this.graduation_year_text = '';
        }
    }

    changeYear(event) {
        this.graduationYear = event;
        this.graduation_year_text = this.helper.graduationYearText(event);
    }

    /**
     * RE0020 get additional mail addresses
     */
    getAdditionalMails() {
        this.arrayFormGroupMail = new Array();
        this.listMail = new Array();
        const mailDB = this.userModel.additionalMailAddress;
        if (mailDB && mailDB.length > 0) {
            if (mailDB.length === 1 && mailDB[0] === '') {
                this.addEmail();
            } else {
                for (let i = 0; i < mailDB.length; i++) {
                    this.arrayFormGroupMail = <FormArray>this.editInfoForm.get('additionalMailAddress');
                    if (mailDB[i] !== '') {
                        const newEmail = this.fb.control(mailDB[i],
                            Validators.compose([Validators.required, Validators.maxLength(64), Validators.pattern(Helper.emailRegex)]));
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

    /**
     * RE0020 add new mail address
     */
    onClickAddMail(event) {
        event.preventDefault();
        this.addEmail();
    }

    // check email valid
    validateEmail(emailField) {
        const reg = Helper.emailRegex;
        if (reg.test(emailField) === false) {
            return false;
        }
        return true;
    }

    addEmail() {
        if (this.editInfoForm.get('additionalMailAddress').value.length < 5) {
            this.arrayFormGroupMail = <FormArray>this.editInfoForm.get('additionalMailAddress');
            const newControl = this.fb.control('',
                Validators.compose([Validators.required, Validators.maxLength(64), Validators.pattern(Helper.emailRegex)]));
            this.arrayFormGroupMail.push(newControl);
            const newEmail = {value: '', flag: false};
            this.listMail.push(newEmail);
            if (this.editInfoForm.get('additionalMailAddress').value.length === 0) {
                this.userEditValidator.formErrors['additionalMailAddress'].push('');
            }
        } else {
            // do nothing...
        }
    }

    /**
     * RE0020 remove additional mail addresses
     */
    removeEmail(i: number) {
        const arrayEmail = <FormArray>this.editInfoForm.get('additionalMailAddress');
        let html = '';
        this.translate.get('MSG').subscribe((msg) => {
            html = '<p>' + msg.RE0020_1.E003_1 + '</p>' + '<p>' + msg.RE0020_1.E003_2 + '</p>';
        });
        for (let j = 0; j < this.listMail.length; j++) {
            if (j === i) {
                const email = this.listMail[i];
                if (email.flag === true) {
                    this.dialogService.showMessage('warning', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
                        (res: DialogResult) => {
                            if (res.isOk()) {
                                arrayEmail.removeAt(i);
                                this.listMail.splice(i, 1);
                                setTimeout(() => {
                                    this.dialogService.showSuccess('MSG.DELETED');
                                }, 400);
                                if (arrayEmail.length === 1 && arrayEmail.value[0] === '') {
                                    this.userEditValidator.formErrors['additionalMailAddress'] = [];
                                } else {
                                    this.userEditValidator.formErrors['additionalMailAddress'].splice(i, 1);
                                }
                            }
                        });
                } else {
                    arrayEmail.removeAt(i);
                    this.listMail.splice(i, 1);
                    if (arrayEmail.length === 1 && arrayEmail.value[0] === '') {
                        this.userEditValidator.formErrors['additionalMailAddress'] = [];
                    } else {
                        this.userEditValidator.formErrors['additionalMailAddress'].splice(i, 1);
                    }
                }
            }
        }
    }

    /**
     * RE0020 check string length in a textbox
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
     * RE0020 delete account
     * param userID
     */
    deleteAccount() {
        if (this.userModel.funcAuthority.fp_7 === true) {
            let html = '';
            let checkboxObj = {};
            this.translate.get('MSG').subscribe(msg => {
                html = '<p>' + msg.RE0016.E003_1_1 + '</p>' + msg.RE0016.E003_1_2;
                checkboxObj = {
                    checkedDelete: false,
                    confirmText: msg.CONFIRMED,
                    isConfirm: true,
                    disablePositive: true
                };
            });
            this.dialogService.showCheckboxDialog('warning', false, null, null, html, 'MSG.OK', 'MSG.CANCEL', checkboxObj, null, null).subscribe(
                (res: DialogResult) => {
                    if (res.isOk()) {
                        setTimeout(() => {
                            this.confirmDeleteAccount();
                        }, 500);
                    }
                });
        } else {
            this.confirmDeleteAccount();
        }
    }

    confirmDeleteAccount() {
        let html = '';
        this.translate.get('MSG').subscribe(msg => {
            html = '<p>' + msg.RE0020_1.E002_2 + '</p>' +
                '<div class="text-left" style="background-color:#eee; padding:0.7rem 1rem 0.5rem; border-radius:0.5rem">' +
                '<p>' + msg.RE0020_1.E002_3_1 + '</br>' + msg.RE0020_1.E002_3_2_1 + '<span class="text-danger">' +
                msg.RE0020_1.E002_3_2_2 + '</span>' + '<br>' + msg.RE0020_1.E002_3_3 + '<span class="text-danger">' +
                msg.RE0020_1.E002_3_RED_1 + '</span>' + msg.RE0020_1.E002_3_4 + '</p></div>';

        });
        this.dialogService.showMessage('warning', false, null, null, html, 'BTN.DELETE', 'MSG.CANCEL', 'modal-lg').subscribe(
            (res: DialogResult) => {
                if (res.isOk()) {
                    setTimeout(() => {
                      this.dialogService.setLoaderVisible(true);
                    });
                    this.registrationService.putDeleteUser(this.userSession.userId).subscribe(
                        (response: UserEditSettingsSaveResult) => {
                            setTimeout(() => {
                              this.dialogService.setLoaderVisible(false);
                            });
                        },
                        error => {
                            setTimeout(() => {
                              this.dialogService.setLoaderVisible(false);
                            });
                            setTimeout(() => {
                                this.dialogService.showError('MSG.NOT_DELETE_ADMINISTRATOR_2');
                            }, 500);
                        }
                    );
                }
            });
    }

    /**
     * RE0020 get datas specializedDepartment
     */
    getSpecializedDepartment() {
        this.listSpecializedDepartment = new Array();
        if (this.userModel.specializedDepartment) {
            for (let i = 0; i < this.userModel.specializedDepartment.length; i++) {
                const objDepartment = {};
                const field = this.fieldIds.filter((item) => item.id === this.userModel.specializedDepartment[i]['fieldId'])[0];
                const type = this.typeIds.filter((item) => item.id === this.userModel.specializedDepartment[i]['typeId'])[0];
                if (field) {
                    objDepartment['field'] = field.text;
                }
                if (type) {
                    objDepartment['type'] = type.text;
                }
                if (Object.keys(objDepartment).length > 0) {
                    this.listSpecializedDepartment.push(objDepartment);
                }
            }
            this.countDepartment = this.listSpecializedDepartment.length;
        }
    }

    /**
     * RE0020 add new specializedDepartment
     */
    addSpecializedDepartment() {
        event.preventDefault();
        this.listDepartment.push({id: this.specialtyArea.idDefault, text: this.typeDefault, field_id: ''});
        const len = this.countDepartment + this.editInfoForm.get('specializedDepartment').value.length;
        if (len < 5) {
            this.formErrors.specializedDepartment.push({'fieldId': '', 'typeId': ''});
            this.addDepartment = <FormArray>this.editInfoForm.get('specializedDepartment');
            const newDepartment = this.fb.group({
                'fieldId': [{id: this.specialtyArea.idDefault, text: this.fieldDefault}, Validators.required],
                'typeId': [{id: this.specialtyArea.idDefault, text: this.typeDefault}, Validators.required],
            });
            this.addDepartment.push(newDepartment);
            this.listDisabled.push(true);
        }
    }

    changeFields(event, name, index) {
        const arrayDepartment = <FormArray>this.editInfoForm.get('specializedDepartment');
        const selectGroup = <FormGroup>arrayDepartment.controls[index];

        if (name === 'fieldId') {
            if (event) {
                if (selectGroup.get('fieldId').value.id !== event.id) {
                    selectGroup.get('fieldId').setValue(event);
                }
            }
            selectGroup.get('typeId').setValue({
                'id': this.specialtyArea.idDefault,
                'text': this.typeDefault,
                'field_id': ''
            });
            const fieldId = selectGroup.get('fieldId').value.id;
            if (fieldId === this.specialtyArea.idDefault) {
                this.listDisabled[index] = true;
                this.listDepartment[index] = [];
            } else {
                this.listDisabled[index] = false;
                this.getListTypeId(fieldId, index);
            }
        } else {
            if (selectGroup.get('typeId').value.id !== event.id) {
                selectGroup.get('typeId').setValue(event);
            }
        }
    }

    /**
     * RE0020 get list typeId when fieldId changes
     */
    getListTypeId(fieldID: any, index: any) {
        const firstType = {'id': this.specialtyArea.idDefault, 'text': this.typeDefault, 'field_id': ''};
        if (this.listDepartment[index]) {
            this.listDepartment[index] = this.typeIds.filter((item) => item.field_id === fieldID);
            this.listDepartment[index].splice(0, 0, firstType);
        } else {
            this.listDepartment.push(this.typeIds.filter((item) => item.field_id === fieldID));
            this.listDepartment[this.listDepartment.length - 1].splice(0, 0, firstType);
        }

    }

    /**
     * RE0020 remove specializedDepartment
     */
    removeDepartment(i: number) {
        this.dialogService.showMessage('warning', false, 'MSG.RE0020_1.E006_1', null, null, 'MSG.YES', 'MSG.NO').subscribe(
            (res: DialogResult) => {
                if (res.isOk()) {
                    const arrayspecializedDepartment = <FormArray>this.editInfoForm.get('specializedDepartment');
                    if (i !== -1) {
                        this.listDisabled.splice(i, 1);
                        this.listDepartment.splice(i, 1);
                        arrayspecializedDepartment.removeAt(i);
                        this.formErrors.specializedDepartment.splice(i, 1);
                    }
                }
            }
        );
    }
    /**
     * RE0020 submit form
     */

    putUserEditSettings() {
        this.submitted = true;
        this.editInfoForm.patchValue({'mobileNo': this.helper.combinePhoneNumber('mobile-first', 'mobile-middle', 'mobile-last')});
        this.editInfoForm.patchValue({'phsNo': $('#phsNo').val()});
        this.editInfoForm.patchValue({'lastNameKana': $('#surname-kana').val()});
        this.editInfoForm.patchValue({'firstNameKana': $('#name-kana').val()});
        const loginIdValidate = this.userEditValidator.checkValidate( 'loginId',this.editInfoForm, this.formErrors);
        const resultCheckValidate = this.userEditValidator.submittedValidate(this.editInfoForm, this.listDisabled, this.userModel,
            this.fieldIds, this.typeIds);
        this.formErrors = resultCheckValidate.formErrors;
        this.helper.gotoError();
        if (loginIdValidate && resultCheckValidate.checkFormValid && resultCheckValidate.checkArrayValid && resultCheckValidate.checkDepartmentValid) {
            this.detectChanges();
        }
    }

    /**
     * RE0020 call API (putUserEditSettings())
     */
    callApiPutUser(type: string, html: string) {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(true);
        });
        this.modelSendApi = this.editInfoForm.value;
        this.modelSendApi.additionalMailAddress = this.modelSendApi.additionalMailAddress.filter(item => item !== '');
        this.modelSendApi.loginId = this.userModel.loginId;
        if(this.flagLoginId === true){
            this.modelSendApi.newLoginId = this.editInfoForm.get('loginId').value;
        }else{
            this.modelSendApi.newLoginId = '';
        }
        this.modelSendApi.mobileNo = this.helper.combinePhoneNumber('mobile-first', 'mobile-middle', 'mobile-last');
        if (this.graduationYear) {
            this.modelSendApi.graduationDate = this.graduationYear + '-08-08';
        } else {
            this.modelSendApi.graduationDate = '';
        }
        const specializedDepartment = this.editInfoForm.get('specializedDepartment').value;
        const postValue = [];
        for (let i = 0; i < this.userModel.specializedDepartment.length; i++) {
            let departmentElement = {};
            departmentElement['fieldId'] = this.userModel.specializedDepartment[i]['fieldId'];
            departmentElement['typeId'] = this.userModel.specializedDepartment[i]['typeId'];
            postValue.push(departmentElement);
        }
        for (let i = 0; i < this.editInfoForm.get('specializedDepartment').value.length; i++) {
            let departmentElement = {};
            departmentElement['fieldId'] = specializedDepartment[i]['fieldId'].id;
            departmentElement['typeId'] = specializedDepartment[i]['typeId'].id;
            postValue.push(departmentElement);
        }
        this.modelSendApi.specializedDepartment = postValue;
        this.imageCropperComponent.getImageUrl("imageCropper1").subscribe((res) => {
                this.storage.uploader.re(this.userSession.officeId, this.userSession.officeUserId, this.userSession.officeUserId, res)
                    .subscribe((data) => {
                            if (data.done) {
                              this.modelSendApi.imageUrl = this.path_image;
                              this.flagCrop = false;
                              if(!this.flagImgUrl){
                                  this.imageCropperComponent.loadImage(data.url, 'imageCropper1');
                              }
                            const img = document.createElement('img');
                            img.onload = () => {
                                this.subCallPutApi(type, html);
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
                if(this.modelSendApi.imageUrl){
                    this.storage.deleteImageUrl(this.modelSendApi.imageUrl);
                }
                this.modelSendApi.imageUrl = '';
                this.flagCrop = true;
                this.flagImgUrl = true;
                this.subCallPutApi(type, html);
            }
        );
    }

    subCallPutApi(type: string, html: string) {
        this.registrationService.putUserEditSettings(this.modelSendApi).subscribe(
            response => {
                setTimeout(() => {
                  this.dialogService.setLoaderVisible(false);
                });
                if(this.modelSendApi.imageUrl !== ''){
                    this.flagImgUrl = false;
                }
                const data = JSON.parse(JSON.stringify(this.userModel));
                for (let key in this.modelSendApi) {
                    if(this.userModel.hasOwnProperty(key)){
                        this.userModel[key] = this.modelSendApi[key];
                    }
                }
                if (type === 'mailChange') {
                    if(this.flagLoginId === true){
                        this.userModel.loginId = this.modelSendApi.newLoginId;
                    }
                    if(this.userModel.mailAddress !== ''){
                        this.userModel.mailAddress = data.mailAddress;
                    }
                    this.userModel.mailAddressPublishingType = data.mailAddressPublishingType;

                    this.userModel.additionalMailAddress = data.additionalMailAddress.filter((mail) => this.userModel.additionalMailAddress.indexOf(mail) > -1);
                    this.createForm();
                    this.dialogService.showMessage('success', false, null, null, html, 'MSG.OK', null).subscribe(
                        (res: DialogResult) => {
                            setTimeout(()=>{
                                  this.dialogService.showMessage('success', false, null, 'MSG.SAVED', null, 'MSG.OK', null)
                            }, 200)
                        });
                } else {
                    if(this.flagLoginId === true){
                        this.userModel.loginId = this.modelSendApi.newLoginId;
                    }
                    this.createForm();
                    this.flagLoginId = false;
                    this.dialogService.showMessage('success', false, null, 'MSG.SAVED', null, 'MSG.OK', null);
                }},
            (error: HttpError) => {
                const err = JSON.parse(error.message);
                this.translate.get('MSG').subscribe(
                    res => {
                        for (let key in err) {
                            if(key === 'loginId'){
                                this.formErrors.loginId = res.EMAIL_EXISTED;
                            }

                            if(key === 'mailAddress'){
                                this.formErrors.mailAddress = res.EMAIL_EXISTED;
                            }

                            if(key === 'addAllAdditionalMailAddress'){
                                let errMailAddress = err[key].replace('[', '').replace(']', '').split(', ');
                                let arrayAdditionalMail = this.editInfoForm.get('additionalMailAddress').value;
                                for( let i = 0; i < arrayAdditionalMail.length; i++){
                                    if(errMailAddress.indexOf(arrayAdditionalMail[i]) > -1){
                                        this.formErrors.additionalMailAddress[i] = res.EMAIL_EXISTED;
                                    }
                                }
                            }
                        }
                        if(!('loginId' in err)){
                            this.editInfoForm.get('loginId').setValue(this.userModel.loginId);
                        }
                    });
                setTimeout(() => {
                  this.dialogService.setLoaderVisible(false);
                });
                this.flagLoginId = false;
                // if (error.contains('COMMON.SAVE_FAILED')) {
                //     this.dialogService.showError('VAL.GET_USER_FAILED');
                // }
                this.helper.gotoError();
            }
        );
    }

    checkNotificationMail(): boolean {
        const mailAddress = this.editInfoForm.get('mailAddress').value;
        if (mailAddress !== '' && mailAddress !== this.userModel.mailAddress) {
            return true;
        } else {
            // do nothing...
        }
        return false;
    }

    checkAdditionalMail(): boolean {
        const arrayAdditionalMail = this.editInfoForm.get('additionalMailAddress').value;
        const arrayMail = this.userModel.additionalMailAddress;
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

    detectChanges() {
        this.checkMailChange();
        const loginId = this.editInfoForm.get('loginId').value;
        this.translate.get(['MSG', 'COMMON_LABEL']).subscribe(msg => {
            if (this.submitted && loginId === this.userModel.loginId && !this.checkMailChange()) {
                this.callApiPutUser(null, null);
            } else {
                if (this.submitted && loginId !== this.userModel.loginId) {
                    const obj = {isConfirm: true, isCallApi: false, checkCallApi: true, checkPlaceHolder: true};
                    const html = '<p>' + msg.MSG.RE0020_1.E010_1 + '</p>' +
                        '<p>' + msg.MSG.RE0020_1.E010_2 + '</p>' +
                        '<div class="text-left">' + msg.COMMON_LABEL.LBL_PASSWORD_LOGIN + '</div>';
                    this.dialogService.showInputPasswordDialog(html, obj, null, null).subscribe((res: DialogResult) => {
                        if (res.isOk()) {
                            this.flagLoginId = true;
                            if(this.checkMailChange()){
                                const html = '<p>' + msg.MSG.MSG_SEND_MAIL.MSG_1 + '</p>' +
                                    '<p>' + msg.MSG.MSG_SEND_MAIL.MSG_2 + '</p>' +
                                    '<p>' + msg.MSG.MSG_SEND_MAIL.MSG_3 + '</p>';
                                this.callApiPutUser('mailChange', html);
                            }else {
                                this.callApiPutUser('loginIdChange', null);
                            }
                        }else{
                            this.flagLoginId = false;
                            this.editInfoForm.get('loginId').setValue(this.userModel.loginId);
                        }
                    });
                } else {
                    if (this.submitted && this.checkMailChange()) {
                        const html = '<p>' + msg.MSG.MSG_SEND_MAIL.MSG_1 + '</p>' +
                            '<p>' + msg.MSG.MSG_SEND_MAIL.MSG_2 + '</p>' +
                            '<p>' + msg.MSG.MSG_SEND_MAIL.MSG_3 + '</p>';
                        this.callApiPutUser('mailChange', html);
                    }
                }
            }
        });
    }

    /**-------------------------------------RE0020 start progress change or add mail address-------------------------**/
    loadConfirmMailPage() {
        this.confirmMail = true;
        if (this.type === 'change') {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(true);
            });
            this.registrationService.getDrMailAddressChangeReservation(this.reservationToken).subscribe(
                response => {
                    setTimeout(() => {
                      this.dialogService.setLoaderVisible(false);
                    });
                    this.getConfirmMailPage(response, this.type);
                }, error => {
                setTimeout(() => {
                  this.dialogService.setLoaderVisible(false);
                });
                this.changeMailPageTitle = true;
                this.mailRegisteredContent = true;
               // this.dialogService.showError('MSG.ERROR');
              });

        } else if (this.type === 'add') {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(true);
            });
            this.registrationService.getDrAdditionalMailAddressChangeReservation(this.reservationToken).subscribe(
                response => {
                    setTimeout(() => {
                      this.dialogService.setLoaderVisible(false);
                    });
                    this.getConfirmMailPage(response, this.type);
                }, error => {
                setTimeout(() => {
                  this.dialogService.setLoaderVisible(false);
                });
                this.mailRegisteredContent = true;
                this.addMailPageTitle = true;
                //this.dialogService.showError('MSG.ERROR');
              });
        }
    }

    getConfirmMailPage(res, type) {
        this.reservationId = res.reservationId;
        if (type === 'change') {
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
        } else if (type === 'add') {
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
        this.formInputPassError = this.userEditValidator.checkPassValid(this.formConfirmMail);
        const password = this.formConfirmMail.get('inputPass').value;
        if (this.formConfirmMail.valid) {
            if (this.type === 'change') {
                setTimeout(() => {
                  this.dialogService.setLoaderVisible(true);
                });
                const modelSendAPI = new Re0020UpdateMailSendApi(this.reservationId, this.reservationToken, password);
                this.registrationService.updateDrMailAddress(modelSendAPI).subscribe(
                  (response: UserUpdateMailSave) => {
                        setTimeout(() => {
                          this.dialogService.setLoaderVisible(false);
                        });
                        this.dialogService.showSuccess('RE0020.REGISTERED').subscribe((res)=>{
                            if(res.isOk()){
                                if(this.sharedValueService.isLoggedIn()){
                                  if (this.parseJwt((JSON.parse(localStorage.getItem('dr_auth_token'))).access_token).user_id
                                    === response.userId) {
                                    this.route.navigate(['/re/user-edit']);
                                  } else {
                                    this.route.navigate(['logout']);
                                  }
                                }else{
                                    this.route.navigate(['/re/re0022/email/' + this.reservationToken]);
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
                        }else if(error.message.indexOf('total mailAdditionAddress > 5') > -1){
                            this.dialogService.showError('RE0020.OVER_MAIL').subscribe((res)=>{
                                if(res.isOk()){
                                    if(this.sharedValueService.isLoggedIn()){
                                        this.route.navigate(['/re/user-edit']);
                                    }else{
                                        this.route.navigate(['/re/re0022/email/' + this.reservationToken]);
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
            } else if (this.type === 'add') {
                setTimeout(() => {
                  this.dialogService.setLoaderVisible(true);
                });
                const modelAdditionalMail = new Re0020UpdateAdditionalMailSendApi(this.reservationId, this.reservationToken, password);
                this.registrationService.updateDrAdditionalMailAddress(modelAdditionalMail).subscribe(
                  (response: UserUpdateMailSave) => {
                        setTimeout(() => {
                          this.dialogService.setLoaderVisible(false);
                        });
                        this.dialogService.showSuccess('RE0020.REGISTERED').subscribe((res)=>{
                            if(res.isOk()){
                                if(this.sharedValueService.isLoggedIn()){
                                  if (this.parseJwt((JSON.parse(localStorage.getItem('dr_auth_token'))).access_token).user_id
                                    === response.userId) {
                                    this.route.navigate(['/re/user-edit']);
                                  } else {
                                    this.route.navigate(['logout']);
                                  }
                                }else{
                                    this.route.navigate(['/re/re0022/email/' + this.reservationToken]);
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
                        }else if(error.message.indexOf('total mailAdditionAddress > 5') > -1){
                            this.dialogService.showError('RE0020.OVER_MAIL').subscribe((res)=>{
                                if(res.isOk()){
                                    if(this.sharedValueService.isLoggedIn()){
                                        this.route.navigate(['/re/user-edit']);
                                    }else{
                                        this.route.navigate(['/re/re0022/email/' + this.reservationToken]);
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

    @HostListener('window:imageChange', ['$event'])
    testListener(event) {
        const CropperId = 'imageCropper1';
        if (event.detail.attr('id') !== CropperId) {
          return;
        }

        this.imageCropperComponent.getImageUrl(CropperId).subscribe((res) => {
            if (this.flagCrop) {
                if($('img.rounded-circle').attr('src')){
                    $('img.rounded-circle').attr('src', res.imgData);
                }
            }
            this.flagCrop = true;
        }, (error) => {
            if (this.flagCrop && this.flagImgDestroy) {
                if($('img.rounded-circle').attr('src')){
                    $('.rounded-circle').attr('src', this._defaultPath);
                }
            }
            this.flagCrop = true;
        });
    }

    /**-------------------------------------RE0020 end progress change or add mail address--------------------------------*/

    // @HostListener('document:keypress', ['$event'])
    // handleKeyboardEvent(event) {
    //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
    //     if (!this.confirmMail) {
    //       this.putUserEditSettings();
    //     } else {
    //       this.putConfirmMail();
    //     }
    //   }
    // }
}


