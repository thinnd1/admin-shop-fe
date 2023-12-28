import {Component, OnInit, AfterViewInit, OnDestroy} from '@angular/core';
import {TracingSearchForm} from '../../../models/ph/tracing-search-form';
import {Router} from '@angular/router';
import {Angular2Csv} from 'angular2-csv';
import {PharmacyService} from '../../../services/pharmacy.service';
import {DialogService} from '../../../services/dialog.service';
import {TracingSearchForms} from '../../../models/ph/tracing-search-forms';
import {TranslateService} from '@ngx-translate/core';
import {DialogResult} from '../../../models/dialog-param';
import {HttpStatus} from '../../../common/http.status';

declare const $: any;
declare var moment: any;

@Component({
  selector: 'app-ph0010-page',
  templateUrl: './ph0010-page.component.html',
  styleUrls: ['./ph0010-page.component.scss']
})
export class Ph0010PageComponent implements OnInit, AfterViewInit, OnDestroy {
  numTab: any;
  searchAdvance: boolean;
  formSearchTab2: any = new TracingSearchForm();
  formSearchTab3: any = new TracingSearchForms();
  page: number;
  const: any = {};
  hospitals = [];
  selectedHospital2: any = {};
  selectedHospital3: any = {};
  latestPage = [];
  allPage = [];
  options: any;
  keyword = '';
  prescriptionUpdateReason: any;
  msgStore: any;
  timeOut: any;
  latestQuery: any = {};

  constructor(private router: Router,
              private dialogService: DialogService,
              private translate: TranslateService,
              private pharmacyService: PharmacyService) {
    this.setConstant();
    this.translate.get(['PHARMACY.TRACING_REPORT', 'PHARMACY.COMMON', 'PH0015', 'PH0004', 'PH0010']).subscribe(
      (res) => {
        this.msgStore = res;
      }
    );
    this.callApiListHospital();

  }

  ngOnInit() {
    this.prescriptionUpdateReason = [
      {id: 0, key: 'BRAND_CHANGE'},
      {id: 1, key: 'APPLICATION_DAYS_CHANGE'},
      {id: 2, key: 'GENERIC_DRUG_CHANGE'},
      {id: 3, key: 'PACKAGING'},
      {id: 4, key: 'DOSAGE_FORM_CHANGE'},
      {id: 5, key: 'STANDARD_CHANGE'},
      {id: 6, key: 'REMAINING_ADJUSTMENT'},
      {id: 7, key: 'OTHER'},
    ];
    this.changeTab((<any>window).prescriptionUpdateReport ? 3 : 2);
    delete (<any>window).prescriptionUpdateReport;
    this.searchAdvance = false;
    this.options = {
      multiple: false,
      placeholder: this.translate.instant('PH0015.MEDICAL'),
      language: {
        noResults: () => {
          return this.translate.instant('PHARMACY.TRACING_REPORT.SELECT2_NO_RESULT');
        }
      },
      matcher: this.customMatcher
    };
    this.updateView();
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
  callApiListHospital() {
    this.dialogService.setLoaderVisible(true);
    this.pharmacyService.getListHospital({officeUserId: '', drugStoreOfficeId: ''}).subscribe(
      (settings) => {
        this.dialogService.setLoaderVisible(false);
        this.hospitals = [{id: '0', text: this.translate.instant('PH0015.MEDICAL')}];
        const listHospital = settings.hospitals;
        for (let i = 0; i < listHospital.length; i++) {
          const hosp = {'id': listHospital[i].id, 'text': listHospital[i].name, 'nameKana': listHospital[i].nameKana};
          this.hospitals.push(hosp);
        }
        if (this.hospitals) {
          this.selectedHospital2 = this.hospitals[0];
          this.selectedHospital3 = this.hospitals[0];
        }
      },
      (error) => {
        this.dialogService.setLoaderVisible(false);
        this.dialogService.showError('MSG.ERROR');
      });
  }
  ngAfterViewInit() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  setConstant() {
    this.const = {
      pageSize: 20,
      maxTextLength: 11,
      page: 0
    };
  }

  showSearchAdvance() {
    this.searchAdvance = !this.searchAdvance;
  }

  changeUpdated($event, property, type) {
    let format = 'YYYY-MM-DDTHH:mm:ssZZ';
    if (type === 'from') {
      format = 'YYYY-MM-DDT00:00:00ZZ';
    }
    if (type === 'to') {
      format = 'YYYY-MM-DDT23:59:59ZZ';
    }
    if (this.numTab === 2) {
      this.formSearchTab2[property] = moment($event).format(format);
      this.reloadSearch();
    }
    if (this.numTab === 3) {
      this.formSearchTab3[property] = moment($event).format(format);
      this.reloadSearch();
    }
  }

  changeTab(number) {
    if (this.numTab !== number) {
      this.numTab = number;
      this.keyword = '';
      this.formSearchTab2.start = '';
      this.formSearchTab2.end = '';
      this.selectedHospital2 = '';
      this.formSearchTab2.isRead = '0';
      this.formSearchTab2.hasComment = '0';
      this.formSearchTab3.dateFrom = '';
      this.formSearchTab3.dateTo = '';
      this.selectedHospital3 = '';
      this.formSearchTab3.prescriptionUpdateReason = '';
    }
    this.reloadSearch();
  }

  reloadSearch() {
    this.page = this.const.page;
    this.latestQuery = {};
    this.callApi(false);
  }

  scrollPaging() {
    if (this.latestPage.length >= this.const.pageSize) {
      this.page = this.page + 1;
      this.callApi(false);
    }
  }

  callApi(replace) {
    switch (this.numTab) {
      case 1:
        break;
      case 2:
        this.formSearchTab2.officeId = this.selectedHospital2.id && this.selectedHospital2.id !== '0' ? this.selectedHospital2.id : '';
        if (replace) {
          this.latestQuery = $.extend({}, this.formSearchTab2);
          this.latestQuery.page = 0;
          this.latestQuery.pageSize = (this.page + 1) * this.const.pageSize;
          this.getTracingReportListReplace(this.latestQuery);
        } else {
          this.formSearchTab2.page = this.page;
          this.formSearchTab2.pageSize = this.const.pageSize;
          this.getTracingReportList(this.formSearchTab2);
        }
        break;
      case 3:
        this.formSearchTab3.officeId =  this.selectedHospital3.id  && this.selectedHospital3.id !== '0' ? this.selectedHospital3.id : '';
        if (replace) {
          this.latestQuery = $.extend({}, this.formSearchTab3);
          this.latestQuery.page = 0;
          this.latestQuery.pageSize = (this.page + 1) * this.const.pageSize;
          this.getUpdateReportStatisticReplace(this.latestQuery);
        } else {
          this.formSearchTab3.page = this.page;
          this.formSearchTab3.pageSize = this.const.pageSize;
          this.getUpdateReportStatistic(this.formSearchTab3);
        }
        break;
      default:
        break;
    }
  }

  getUpdateReportStatistic(query) {
    query.patientCodeOrName = this.keyword;
    this.dialogService.setLoaderVisible(true);
    this.pharmacyService.getUpdateReportStatistic(query).subscribe((latestPage) => {
      this.dialogService.setLoaderVisible(false);
      for (let i = 0; i < latestPage.length; i++) {
        if ( latestPage[i].prescriptionUpdateReason !== -1) {
          latestPage[i].prescriptionUpdateReason = this.getPrescriptionUpdateReasonKey(latestPage[i].prescriptionUpdateReason);
        }
      }
      this.allPage = this.page === this.const.page ? latestPage : this.allPage.concat(latestPage);
      this.latestPage = latestPage;
    }, (error) => {
      this.dialogService.setLoaderVisible(false);
      this.allPage = [];
    });
  }

  getUpdateReportStatisticReplace(query) {
    query.patientCodeOrName = this.keyword;
    this.pharmacyService.getUpdateReportStatistic(query).subscribe((replacePage) => {
      if (this.isEqual(this.formSearchTab3)) {
        for (let i = 0; i < replacePage.length; i++) {
          if ( replacePage[i].prescriptionUpdateReason !== -1) {
            replacePage[i].prescriptionUpdateReason = this.getPrescriptionUpdateReasonKey(replacePage[i].prescriptionUpdateReason);
            this.allPage[i] = replacePage[i];
          }
        }
      }
    });
  }

  getTracingReportList(query) {
    query.text = this.keyword;
    this.dialogService.setLoaderVisible(true);
    this.pharmacyService.getTracingReportList(query).subscribe((latestPage) => {
      this.dialogService.setLoaderVisible(false);
      latestPage = latestPage.items;
      this.allPage = this.page === this.const.page ? latestPage : this.allPage.concat(latestPage);
      this.latestPage = latestPage;
    }, (error) => {
      this.dialogService.setLoaderVisible(false);
      this.allPage = [];
    });
  }

  getTracingReportListReplace(query) {
    query.text = this.keyword;
    this.pharmacyService.getTracingReportList(query).subscribe((replacePage) => {
      replacePage = replacePage.items;
      if (this.isEqual(this.formSearchTab2)) {
        for (let i = 0; i < replacePage.length; i++) {
          this.allPage[i] = replacePage[i];
        }
      }
    });
  }

  isEqual(query) {
    for (const key in this.latestQuery) {
      if (this.latestQuery.hasOwnProperty(key) && query.hasOwnProperty(key)) {
        if (key !== 'page' && key !== 'pageSize') {
          if (this.latestQuery[key] !== query[key]) {
            return false;
          }
        }
      } else {
        return false;
      }
    }
    return true;
  }

  reCallGetTracingReportListCsv() {
    this.formSearchTab2.text = this.keyword;
    this.formSearchTab2.page = null;
    this.formSearchTab2.pageSize = null;
    this.dialogService.setLoaderVisible(true);
    this.pharmacyService.getTracingReportList(this.formSearchTab2).subscribe((result) => {
      this.getTracingCsv(result.items);
      this.dialogService.setLoaderVisible(false);
    }, (error) => {
      this.dialogService.setLoaderVisible(false);
      this.dialogService.showError('MSG.ERROR');
    });
  }

  reCallGetReportListCsv() {
    this.formSearchTab3.patientCodeOrName = this.keyword;
    this.formSearchTab3.page = null;
    this.formSearchTab3.pageSize = null;
    this.dialogService.setLoaderVisible(true);
    this.pharmacyService.getUpdateReportStatistic(this.formSearchTab3).subscribe((result) => {
      this.getUpdateCSV(result);
      this.dialogService.setLoaderVisible(false);
    }, (error) => {
      this.dialogService.setLoaderVisible(false);
      this.dialogService.showError('MSG.ERROR');
    });
  }
  getPrescriptionUpdateReasonKey(id) {
    const res = this.prescriptionUpdateReason.filter(
      pre => pre.id === id
    );
    return res[0].key;
  }

  getUpdateCSV(dataList) {
    const title = this.msgStore['PH0010'].TITLE_CSV_13;
    const exportList = [];
    const header = [this.msgStore['PH0004'].UPDATED, this.msgStore['PH0004'].OFFICE_ID,
      this.msgStore['PHARMACY.TRACING_REPORT'].DEPARTMENT_NAME, this.msgStore['PH0010'].DOCTOR_NAME,
      this.msgStore['PHARMACY.TRACING_REPORT'].PATIENT_CODE, this.msgStore['PHARMACY.TRACING_REPORT'].PATIENT_NAME,
      this.msgStore['PH0015'].UPDATED, this.msgStore['PH0015'].PRESCRIPTION_UPDATE_REASON, this.msgStore['PH0010'].PROTOCOL,
      this.msgStore['PH0010'].PRESCRIPTION_UPDATE_CONTENT];
    for (let i = 0; i < dataList.length; i++) {
      const data = [];
      data[0] = moment(dataList[i]['updated']).format('YYYY/MM/DD HH:mm');
      data[1] = dataList[i]['medicalOfficeName'];
      data[2] = dataList[i]['departmentName']; // TODO
      data[3] = dataList[i]['doctorName'] ? dataList[i]['doctorName'] : '';
      data[4] = dataList[i]['patientCode'] ? dataList[i]['patientCode'] : '';
      data[5] = dataList[i]['patientName'] ? dataList[i]['patientName'] : '';
      data[6] = moment(dataList[i]['prescriptionIssueDate']).format('YYYY/MM/DD');
      if ( dataList[i].prescriptionUpdateReason !== -1) {
        data[7] = dataList[i]['prescriptionUpdateReason'] ?
          this.msgStore['PHARMACY.COMMON'][this.getPrescriptionUpdateReasonKey(dataList[i]['prescriptionUpdateReason'])] : '';
      }else {
        data[7] = dataList[i]['prescriptionUpdateReason'] = '';
      }
      if ( dataList[i]['protocolUsage'] !== -1) {
        data[8] = dataList[i]['protocolUsage'] ? this.msgStore['PH0015'].PROTOCOL_YES :
          this.msgStore['PH0015'].PROTOCOL_NO;
      }else {
        data[8] = dataList[i]['protocolUsage'] = '';
      }
      data[9] = dataList[i]['content'];
      exportList.push(data);
    }
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: false,
      headers: header
    };
    new Angular2Csv(exportList, title, options);
  }

  getTracingCsv(dataList) {
    const exportList = [];
    const title = this.msgStore['PH0010'].TITLE_CSV_10;
    const header = [this.msgStore['PH0004'].UPDATED, this.msgStore['PH0004'].OFFICE_ID,
      this.msgStore['PHARMACY.TRACING_REPORT'].DEPARTMENT_NAME, this.msgStore['PHARMACY.COMMON'].DOCTOR_NAME,
      this.msgStore['PHARMACY.TRACING_REPORT'].PATIENT_CODE, this.msgStore['PHARMACY.TRACING_REPORT'].PATIENT_NAME,
      this.msgStore['PHARMACY.TRACING_REPORT'].PATIENT_DATE_OF_BIRTH, this.msgStore['PHARMACY.TRACING_REPORT'].PATIENT_SEX,
      this.msgStore['PH0015'].UPDATED, this.msgStore['PHARMACY.TRACING_REPORT'].COMPOUNDING_DATE,
      this.msgStore['PH0010'].CONTENT, this.msgStore['PHARMACY.TRACING_REPORT'].PATIENT_CONSENT,
      this.msgStore['PHARMACY.COMMON'].COMMENT1, this.msgStore['PHARMACY.COMMON'].COMMENT2];
    for (let i = 0; i < dataList.length; i++) {
      const data = [];
      data[0] = moment(dataList[i]['updated']).format('YYYY/MM/DD HH:mm');
      data[1] = dataList[i]['officeName'];
      data[2] = dataList[i]['departmentName']; // TODO
      data[3] = dataList[i]['doctorName'];
      data[4] = dataList[i]['patientCode'] ? dataList[i]['patientCode'] : '';
      data[5] = dataList[i]['patientName'] ? dataList[i]['patientName'] : '';
      data[6] = dataList[i]['patientBirthDate'] ? moment(dataList[i]['patientBirthDate']).format('YYYY/MM/DD') : '';
      data[7] = dataList[i]['patientGender'] === 'MALE' ?
        this.msgStore['PHARMACY.TRACING_REPORT'].GENDER.MALE : this.msgStore['PHARMACY.TRACING_REPORT'].GENDER.FEMALE;
      data[8] = moment(dataList[i]['prescriptionIssueDate']).format('YYYY/MM/DD');
      data[9] = (dataList[i]['compoundingDate']) ?
        moment(dataList[i]['compoundingDate']).format('YYYY/MM/DD') : '';
      data[10] = dataList[i]['content'] ? dataList[i]['content'] : '';
      data[11] = dataList[i]['patientConsent'] ? this.msgStore['PHARMACY.TRACING_REPORT'].PATIENT_CONSENT_YES :
        this.msgStore['PHARMACY.TRACING_REPORT'].PATIENT_CONSENT_NO;
      data[12] = dataList[i]['comments'][0] ? dataList[i]['comments'][0] : '';
      data[13] = dataList[i]['comments'][1] ? dataList[i]['comments'][1] : '';
      exportList.push(data);
    }
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: false,
      headers: header
    };
    if (exportList && exportList.length) {
      new Angular2Csv(exportList, title, options);
    }
  }


  exportCsv() {
    if (this.numTab === 2) {
      this.reCallGetTracingReportListCsv();
    }
    if (this.numTab === 3) {
      this.reCallGetReportListCsv();
    }
  }

  printPage() {
    const css = '@page {size:A4;margin: 50px 0;}';
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.type = 'text/css';
    style.media = 'print';
    this.destroyTooltip();
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);
    window.print();
    $('[data-toggle="tooltip"]').tooltip();
    return false;
  }

  goTo(des) {
    this.destroyTooltip();
    switch (des) {
      case 'drug':
        this.router.navigate(['/ph/ph0016']);
        break;
      case 'protocol':
        this.router.navigate(['/ph/ph0017']);
        break;
      case 'query':
        if (this.numTab === 2) {
          this.router.navigate(['/ph/ph0012']);
        }
        if (this.numTab === 3) {
          this.router.navigate(['/ph/ph0015']);
        }
        break;
    }
  }

  chooseDetail(topicId) {
    if (this.numTab === 2) {
      this.router.navigate(['ph/ph0011'], {queryParams: {reportId: topicId}});
    }
    if (this.numTab === 3) {
      this.router.navigate(['ph/ph0014'], {queryParams: {topicId: topicId}});
    }
  }

  destroyTooltip() {
    $('[data-toggle="tooltip"]').tooltip('dispose');
  }

  ngOnDestroy(): void {
    window.scrollTo(0, 0);
    clearTimeout(this.timeOut);
  }

  updateView() {
    this.timeOut = setTimeout(() => {
      this.callApi(true);
      this.updateView();
    }, 60 * 1000);
  }

}
