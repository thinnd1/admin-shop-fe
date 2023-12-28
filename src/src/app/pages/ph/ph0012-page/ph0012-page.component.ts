import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {UserSession} from '../../../models/ba/user-session';
import {TranslateService} from '@ngx-translate/core';
import {SharedValueService} from '../../../services/shared-value.service';
import {DialogService} from '../../../services/dialog.service';
import {PharmacyService} from '../../../services/pharmacy.service';
import {TracingReportValidator} from './ph0012-page.validator';
import {TracingReport} from '../../../models/ph/tracing-report';
import {MasterService} from '../../../services/master.service';
import {Helper} from '../../../common/helper';
import {HttpError} from '../../../common/error/http.error';
import {DialogResult} from '../../../models/dialog-param';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import * as sha256 from 'sha256';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';
import {HttpStatus} from '../../../common/http.status';

declare var moment: any;

@Component({
  selector: 'app-ph0012-page',
  templateUrl: './ph0012-page.component.html',
  styleUrls: ['./ph0012-page.component.scss'],
  providers: [TracingReportValidator]
})
export class Ph0012PageComponent implements OnInit {
  modelGroupForm: FormGroup;
  userSession: UserSession;
  isConfirm: boolean;
  listHospital = [];
  listDoctor = [];
  const: any = {};
  formErrors: any;
  model: TracingReport;
  specialtyAreasList;
  msgStore: any;
  language: any = {};
  options: any = {};
  selectedHospital: any;
  today: '';
  progress: number;
  attachmentList: any[];

  constructor(private dialogService: DialogService,
              public translate: TranslateService,
              private masterService: MasterService,
              private pharmacyService: PharmacyService,
              private shareValue: SharedValueService,
              private helper: Helper,
              private router: Router,
              private firebaseStorage: FirebaseStorage,
              private tracingReportValidator: TracingReportValidator) {
    this.translate.get(['PHARMACY.TRACING_REPORT', 'PHARMACY.PH0012']).subscribe(
      (res) => {
        this.msgStore = res;
      }
    );
  }

  ngOnInit() {
    this.userSession = this.shareValue.getUserSession();
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
    this.pharmacyService.getListCurrentHospital().subscribe((res) => {
      this.listHospital = [{id: '', text: ''}];
      const listHospital = res.hospitals;
      for (let i = 0; i < listHospital.length; i++) {
        const fieldElement = {};
        fieldElement['id'] = listHospital[i].id;
        fieldElement['text'] = listHospital[i].name;
        fieldElement['nameKana'] = listHospital[i].nameKana;
        this.listHospital.push(fieldElement);
      }
      this.selectIfOnlyOneExist();
    });
    this.language = {
      noResults: () => {
        return this.msgStore['PHARMACY.TRACING_REPORT']['SELECT2_NO_RESULT'];
      }
    };
    this.today = moment().format('YYYY-MM-DD');
    this.resetPage();
    this.options = {
      selectOnClose: true,
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

  showMessageErrorRple(error) {
    this.dialogService.setLoaderVisible(false);
    this.dialogService.showMessage('error', false, null, 'PHARMACY.COMMON.ERROR_ROLE', null, 'MSG.OK', null).subscribe(
      (dialogResult: DialogResult) => {
        if (dialogResult.isOk()) {
          this.router.navigate(['/']);
        }
      });
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

  resetPage() {
    window.scrollTo(0, 0);
    this.model = new TracingReport();
    this.modelGroupForm = this.tracingReportValidator.createForm(this.model);
    this.formErrors = this.tracingReportValidator.formErrors;
    this.isConfirm = false;
    this.attachmentList = [];
    this.selectIfOnlyOneExist();
    this.pharmacyService.getMostRecentReportInfo().subscribe((res) => {
      this.model.phoneNumber = res.phoneNumber;
      this.model.pharmacistName = res.pharmacistName;
      this.selectedHospital = {id: res.medicalOfficeId, text: res.medicalOfficeName, nameKana: ''};
      this.modelGroupForm.get('pharmacistName').setValue(res.pharmacistName);
      this.onHospitalChange(this.selectedHospital);
      this.progress = 0;
    });
  }

  selectIfOnlyOneExist() {
    if (this.listHospital && this.listHospital.length === 2) {
      this.selectedHospital = this.listHospital[1];
      this.onHospitalChange(this.selectedHospital);
    }
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

  onHospitalChange($event) {
    this.getListDoctor($event.id);
  }

  autocompleListFormatter(data: any) {
    return `<span class='hover-result-search d-block p-1 bg-white'>${data['text']}</span>`;
  }

  myValueFormatter(data: any): string {
    return `${data['text']}`;
  }

  inputOnChange(event, name) {
    if (event != null) {
      const text = event.text ? event.text : event;
      this.modelGroupForm.get(name).setValue(text);
    }
  }

  dateInputOnChange($event, name) {
    const date = moment($event).format('YYYY-MM-DD');
    this.modelGroupForm.get(name).setValue(date);
  }

  combineMobilePhone() {
    this.modelGroupForm.patchValue(
      {'phoneNumber': this.helper.combinePhoneNumber('mobile-first', 'mobile-middle', 'mobile-last')});
  }

  confirm($event) {
    this.combineMobilePhone();
    this.modelGroupForm.get('medicalOfficeId').setValue(this.selectedHospital ? this.selectedHospital.id : '');
    this.modelGroupForm.get('content').setValue($event.content);
    this.tracingReportValidator.checkValidate(this.modelGroupForm, this.formErrors);
    this.model = this.modelGroupForm.value;
    this.model.hasFile = ($event.attachments && $event.attachments.length > 0);
    this.attachmentList = $event.attachments;
    this.helper.gotoError();
    if (this.modelGroupForm.valid && $event.valid && this.formErrors.compoundingDate === '') {
      if (this.model.compoundingDate != null) {
        this.model.compoundingDate = moment(this.model.compoundingDate).format('YYYY-MM-DDTHH:mm:ssZZ');
      }
      this.model.patientDateOfBirth = moment(this.model.patientDateOfBirth).format('YYYY-MM-DDTHH:mm:ssZZ');
      this.model.prescriptionIssuedDate = moment(this.model.prescriptionIssuedDate).format('YYYY-MM-DDTHH:mm:ssZZ');
      this.isConfirm = true;
    }
  }

  cancel() {
    this.isConfirm = false;
    $('body').click();
  }

  submit(submitData) {
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
      this.firebaseStorage.uploader.pharmacy(`tracingReport`, id, this.userSession.officeUserId, this.attachmentList)
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

  sendToServer() {
    this.dialogService.setLoaderVisible(true);
    this.pharmacyService.postCreateTracingReport(this.model).subscribe(
      (result: any) => {
        this.dialogService.setLoaderVisible(false);
        this.createDone();
      },
      (error) => {
        this.dialogService.setLoaderVisible(false);
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  createDone() {
    const html = '<p>' + this.msgStore['PHARMACY.PH0012'].SUCCESS_PUT_REPORT.MSG_1 + '</p>'
      + '<p>' + this.msgStore['PHARMACY.PH0012'].SUCCESS_PUT_REPORT.MSG_2 + '</p>';
    this.dialogService.showMessage('success', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
      (dialogResult: DialogResult) => {
        if (dialogResult.isOk()) {
          this.progress = 100;
          this.resetPage();
        } else {
          this.router.navigate(['/ph/ph0010']);
        }
      });
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
