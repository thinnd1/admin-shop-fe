import {Component, Input, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ReportUpdateSetting} from '../../../models/ph/report-update-setting';
import {ReportUpdateValidator} from './ph0015-validator';
import {Helper} from '../../../common/helper';
declare var moment: any;
import * as sha256 from 'sha256';
import {MasterService} from '../../../services/master.service';
import {SpecialityArea} from '../../../models/ma/speciality-area';
import {SpecialtyAreaConverter} from '../../../common/converter/specialty-area.converter';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';
import {TranslateService} from '@ngx-translate/core';
import {PharmacyService} from '../../../services/pharmacy.service';
import {UserSession} from '../../../models/ba/user-session';
import {SharedValueService} from '../../../services/shared-value.service';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';
import {HttpError} from '../../../common/error/http.error';
import {HttpStatus} from '../../../common/http.status';
import {Validator} from '../../../common/validation/validator';

@Component({
  selector: 'app-ph0015-page',
  templateUrl: './ph0015-page.component.html',
  styleUrls: ['./ph0015-page.component.scss'],
  providers: [ReportUpdateValidator, SpecialtyAreaConverter, Validators]
})
export class Ph0015PageComponent implements OnInit {
  createInfoFrom: FormGroup;
  public userSession: UserSession;
  specialtyAreasList: any;
  textTranslate: string;
  msgStore: any;
  fieldIds = [];
  listDrug: any = [];
  options: any;
  formErrors: any;
  listDepartment = [];
  status: boolean;
  submit = false;
  updated: any;
  listDoctor = [];
  data_confirm: any;
  public model = new ReportUpdateSetting();
  prescriptionUpdateReasonText: string;
  hospitals = [];
  protocolsText: string;
  selectedHospital: any = {};
  prescriptionUpdateReason: any;
  protocols: any;
  language: any = {};
  attachmentList: any[];
  progress = 0;
  today: '';
  msgPlaceHolder: any;
  beforeChangeDrugName1: string;
  infiniteScrollOptionsBefore: any = {
    page: 0,
    size: 20,
    placeHolder: 'PH0015.DRUG_BEFORE',
    allowFreeText: true,
    multiple: false
  };
  infiniteScrollOptionsAfter: any = {
    page: 0,
    size: 20,
    placeHolder: 'PH0015.DRUG_AFTER',
    allowFreeText: true,
    multiple: false
  };
  keyword = '';
  constructor(private reportUpdateValidator: ReportUpdateValidator,
              private helper: Helper,
              private formBuilder: FormBuilder,
              private masterService: MasterService,
              private specialtyArea: SpecialtyAreaConverter,
              private dialogService: DialogService,
              private translate: TranslateService,
              private pharmacyService: PharmacyService,
              private shareValue: SharedValueService,
              private router: Router,
              private validator: Validator,
              private firebaseStorage: FirebaseStorage
  ) {

    this.masterService.getSpecialityAreas().subscribe(
      (specialtyAreas) => {
        this.specialtyAreasList = [];
        const listSpecialtyArea = specialtyAreas.specialtyAreas;
        for (let i = 0; i < listSpecialtyArea.length; i++) {
          const fieldElement = {};
          fieldElement['id'] = listSpecialtyArea[i].id;
          fieldElement['text'] = listSpecialtyArea[i].specialtyAreaName;
          this.specialtyAreasList.push(fieldElement);
        }
      });
    this.translate.get(['PH0015.PLACEHOLDER_UPDATED']).subscribe(
      (res) => {
        this.msgPlaceHolder = res;
      }
    );
    this.formErrors = this.reportUpdateValidator.formErrors;
    this.userSession = this.shareValue.getUserSession();
    this.translate.get(['PH0015', 'SUCCESS_PUT_REPORT', 'PHARMACY.TRACING_REPORT', 'PHARMACY.PH0012']).subscribe(
      (res) => {
        this.msgStore = res;
      }
    );
  }

  ngOnInit() {
    this.data_confirm = false;
    window.scrollTo(0, 0);
    (<any>window).prescriptionUpdateReport = true;
    this.model = new ReportUpdateSetting();
    this.createInfoFrom = this.reportUpdateValidator.createForm(this.model);
    this.pharmacyService.getMostRecentReportInfo().subscribe((res) => {
      this.model.phoneNumber = res.phoneNumber;
      this.model.pharmacistName = res.pharmacistName;
      this.getListDoctor(res.medicalOfficeId);
      this.selectedHospital = {id: res.medicalOfficeId, text: res.medicalOfficeName};
      this.createInfoFrom.get('pharmacistName').setValue(res.pharmacistName);
    });
    this.callApiListHospital();
    this.addDrugList();
    this.createForm();
    this.attachmentList = [];
    this.model.officeUserId = this.userSession.officeId;
    this.protocols = [
      {value: 1, text: this.translate.instant('PH0015.PROTOCOL_YES')},
      {value: 0, text: this.translate.instant('PH0015.PROTOCOL_NO')},
    ];
    this.prescriptionUpdateReason = [
      {id: 0, key: 'BRAND_CHANGE', text: this.translate.instant('PHARMACY.COMMON.BRAND_CHANGE')},
      {id: 1, key: 'APPLICATION_DAYS_CHANGE', text: this.translate.instant('PHARMACY.COMMON.APPLICATION_DAYS_CHANGE')},
      {id: 2, key: 'GENERIC_DRUG_CHANGE', text: this.translate.instant('PHARMACY.COMMON.GENERIC_DRUG_CHANGE')},
      {id: 3, key: 'PACKAGING', text: this.translate.instant('PHARMACY.COMMON.PACKAGING')},
      {id: 4, key: 'DOSAGE_FORM_CHANGE', text: this.translate.instant('PHARMACY.COMMON.DOSAGE_FORM_CHANGE')},
      {id: 5, key: 'STANDARD_CHANGE', text: this.translate.instant('PHARMACY.COMMON.STANDARD_CHANGE')},
      {id: 6, key: 'REMAINING_ADJUSTMENT', text: this.translate.instant('PHARMACY.COMMON.REMAINING_ADJUSTMENT')},
      {id: 7, key: 'OTHER', text: this.translate.instant('PHARMACY.COMMON.OTHER')},
    ];
    this.language = {
      noResults: () => {
        return this.msgStore['PHARMACY.TRACING_REPORT']['SELECT2_NO_RESULT'];
      }
    };
    this.today = moment().format('YYYY-MM-DD');
    this.options = {
      multiple: false,
      placeholder: this.translate.instant('PHARMACY.COMMON.MEDICAL_OFFICE_PLACE_HOLDER'),
      language: {
        noResults: () => {
          return this.translate.instant('PHARMACY.TRACING_REPORT.SELECT2_NO_RESULT');
        }
      },
      matcher: this.customMatcher
    };
  }
  createForm() {
    this.createInfoFrom = this.reportUpdateValidator.createForm(this.model);
  }
  customMatcher(params, data) {
    if ($.trim(params.term) === '') {
      return data;
    }
    const term = params.term.toLowerCase();
    if (data.nameKana && data.nameKana.toLowerCase().indexOf(term) > -1 || data.text.toLowerCase().indexOf(term) > -1) {

      return data;
    } else {
      return null;
    }
  }

  putData($event) {
    const MAX_SIZE = 128 * 1024 * 1024;
    this.combineMobilePhone();
    this.createInfoFrom.get('medicalOfficeId').setValue(this.selectedHospital ? this.selectedHospital.id : '');
    this.createInfoFrom.get('content').setValue($event.content);
    this.reportUpdateValidator.checkValidate(this.createInfoFrom, this.formErrors);
    this.model.beforeChangeDrugName = this.beforeChangeDrugName1;
    this.model = this.createInfoFrom.value;
    if (this.model.protocolUsage != -1) {
      if (this.model.protocolUsage === 1) {
        this.protocolsText = this.translate.instant('PH0015.PROTOCOL_YES');
      } else {
        this.protocolsText = this.translate.instant('PH0015.PROTOCOL_NO');
      }
    } else if (this.model.protocolUsage == -1) {
      this.protocolsText = '';
    }
    if (parseInt(this.model.prescriptionUpdateReason, 10) === -1) {
      this.prescriptionUpdateReasonText = '';
    }else {
      this.prescriptionUpdateReasonText = this.selectTextPrescriptionUpdateReason(this.model.prescriptionUpdateReason);
    }
    this.attachmentList = $event.attachments;
    this.helper.gotoError();
    if (this.createInfoFrom.valid && $event.valid) {
      this.model.prescriptionIssuedDate = moment(this.model.prescriptionIssuedDate).format('YYYY-MM-DDTHH:mm:ssZZ');
      this.data_confirm = true;
    }
  }

  combineMobilePhone() {
    this.createInfoFrom.patchValue(
      {'phoneNumber': this.helper.combinePhoneNumber('pr-mobile-first', 'pr-mobile-middle', 'pr-mobile-last')});
  }

  startDateFrameChanged(date: any) {
    date = moment(date).format('YYYY-MM-DD');
    this.createInfoFrom.patchValue(
      {'prescriptionIssuedDate': date});
  }

  selectDrug(event, obj, name) {
    if (event != null) {
      const text = event.text ? event.text : event;
      obj.get(name).setValue(text);
    }
  }

  inputOnChange(event, name) {
      if (event != null) {
        const text = event.text ? event.text : event;
        this.createInfoFrom.get(name).setValue(text);
      }
  }

  get formData() {
    return <FormArray>this.createInfoFrom.get('prescriptionUpdateDetails');
  }
  initDrugList() {
    return this.formBuilder.group({
      'beforeChangeDrugName': ['', [this.validator.validateAllSpace(),  Validators.maxLength(200)]],
      'afterChangeDrugName': ['', [this.validator.validateAllSpace(), Validators.maxLength(200)]]
    });
  }

  addDrugList() {
    event.preventDefault();
    this.formErrors.prescriptionUpdateDetails.push({'beforeChangeDrugName': '', 'afterChangeDrugName': ''});
    const control = <FormArray>this.createInfoFrom.controls['prescriptionUpdateDetails'];
    const addCtrl = this.initDrugList();
    control.push(addCtrl);

  }

  removeDrugList(i: number) {
    let html = '';
    this.translate.get('MSG').subscribe(msg => {
      html = msg.RE0016.E006_1;
    });
    const control = <FormArray>this.createInfoFrom.controls['prescriptionUpdateDetails'];
    control.removeAt(i);
    this.listDrug.splice(i, 1);
    this.formErrors.prescriptionUpdateDetails.splice(i, 1);
  }

  autocompleListFormatter(data: any) {
    return `<span class='hover-result-search d-block px-2 py-1 bg-white left'>${data['text']} </span>`;
  }

  myValueFormatter(data: any): string {
    return `${data['text']}`;
  }

  backInput() {
    this.data_confirm = false;
    setTimeout(() => {
      $('head').click();
    }, 500);
  }

  selectTextPrescriptionUpdateReason(id: number): string {
    const res = this.prescriptionUpdateReason.filter(
      pre => pre.id === id
    );
    return res[0].text;
  }

  callApiListHospital() {
    this.dialogService.setLoaderVisible(true);
    this.pharmacyService.getListCurrentHospital().subscribe(
      (settings) => {
        this.dialogService.setLoaderVisible(false);
        this.hospitals = settings.hospitals;
        const listHospital = new Array();
        for (let i = 0; i < this.hospitals.length; i++) {
          const hosp = {'id': this.hospitals[i].id, 'text': this.hospitals[i].name, 'nameKana': this.hospitals[i].nameKana };
          listHospital.push(hosp);
        }
        this.hospitals = listHospital;
      },
      (error) => {
          this.dialogService.setLoaderVisible(false);
          this.dialogService.showError('MSG.ERROR');
      });
  }

  onHospitalChange($event) {
    this.getListDoctor($event.id);
  }

  getListDoctor(hospitalId) {
    this.pharmacyService.getListDoctor(hospitalId).subscribe((res) => {
      this.listDoctor = res.doctors;
      const listDoctor = new Array();
      for (let i = 0; i < this.listDoctor.length; i++) {
        const doctors = {'text': this.listDoctor[i].lastName + ' ' + this.listDoctor[i].firstName,
          'nameKana': this.listDoctor[i].lastNameKana + ' ' + this.listDoctor[i].firstNameKana };
        listDoctor.push(doctors);
      }
      this.listDoctor = listDoctor;
    });
  }

  sendToServer() {
    this.dialogService.setLoaderVisible(true);
    this.pharmacyService.postReportUpdate(this.model).subscribe(
      () => {
        this.dialogService.setLoaderVisible(false);
        this.createDone();
      },
      (error) => {
        this.dialogService.setLoaderVisible(false);
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  postReportUpdate(submitData) {
    const unixtime = new Date().getTime();
    const id = sha256(`${unixtime}${this.userSession.officeUserId}`);
    this.uploadAttachmentsToFirebase(id).subscribe((list) => {
      this.model.firebaseStorageTopicPath = id;
      this.model.fileIds = list;
      this.sendToServer();
    }, (error: HttpError) => {
      this.dialogService.setLoaderVisible(false);
      this.dialogService.showError('MSG.ERROR');
    });
  }

  createDone() {
    const html = '<p>' + this.msgStore['PH0015'].SUCCESS_PUT_REPORT.MSG_1 + '</p>'
      + '<p>' + this.msgStore['PH0015'].SUCCESS_PUT_REPORT.MSG_2 + '</p>';
    this.dialogService.showMessage('success', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
      (dialogResult: DialogResult) => {
        if (dialogResult.isOk()) {
          this.selectedHospital = {};
          this.progress = 100;
          this.ngOnInit();
        } else {
          this.router.navigate(['/ph/ph0010']);
        }
      });
  }

  getProgress(files) {
    let progress = 0;
    for (let i = 0; i < files.length; i++) {
      progress += files[i].progress;
    }
    if (files.length === 0 || progress / files.length === 100) {
      progress = 99;
    }
    this.progress = progress;
  }

  uploadAttachmentsToFirebase(id): Observable<any> {
    return Observable.create(subscribe => {
      if (this.attachmentList.length === 0) {
        subscribe.next([]);
      }
      this.dialogService.setLoaderVisible(true);
      this.firebaseStorage.uploader.pharmacy(`updateReport`, id, this.userSession.officeUserId, this.attachmentList)
        .subscribe((files) => {
          this.dialogService.setLoaderVisible(false);
          this.getProgress(files);
          if (this.progress === 99) {
            subscribe.next(files.map(file => file.file.id));
          }
        }, (err) => {
          this.dialogService.setLoaderVisible(false);
          this.dialogService.showError('MSG.ERROR');
          subscribe.error(err);
        });
    });
  }

  reloadListDrug(keyword) {
    this.masterService.getListDrugWithPaging(keyword, this.infiniteScrollOptionsBefore.page, this.infiniteScrollOptionsBefore.size, '')
      .subscribe((settings: any) => {
          const loop = settings.drugs;
          for (let i = 0; i < loop.length; i++) {
            loop[i].name = loop[i].productName;
          }
          this.listDrug = this.infiniteScrollOptionsBefore.page === 0 ? loop : this.listDrug.concat(loop);

        },
        (error) => {
          this.listDrug = [];
        });
  }

  textChanged(keyword: any, obj, name) {
    // get and update text
    obj.get(name).setValue(keyword);
    // then reload search
    this.infiniteScrollOptionsBefore.page = 0;
    this.keyword = keyword;
    this.reloadListDrug(keyword);
  }

  scrollDown(page) {
    this.infiniteScrollOptionsBefore.page += 1;
    this.reloadListDrug(this.keyword);
  }

  changeDrug($event, obj, name) {
    if ($event) {
      obj.get(name).setValue($event.name);
    }
  }

  matcherListAutocomplete(listName, keyword) {
    const term = keyword.toLowerCase();
    if (keyword !== '' && this[listName]) {
      const list = this[listName].filter((data) => {
        return data.nameKana && data.nameKana.toLowerCase().indexOf(term) > -1 || data.text && data.text.toLowerCase().indexOf(term) > -1;
      });
      return Observable.of(list);
    } else {
      return Observable.of([]);
    }
  }

  closeInput() {
    $('ngui-auto-complete').hide();
  }

}
