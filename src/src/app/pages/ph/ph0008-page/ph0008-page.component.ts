import { Component, OnInit, AfterViewInit } from '@angular/core';
import {DialogService} from '../../../services/dialog.service';
import {PharmacyService} from '../../../services/pharmacy.service';
import {TracingParamForm} from '../../../models/ph/tracing-param-form';
import {Router} from '@angular/router';
import {Angular2Csv} from 'angular2-csv';
import {TranslateService} from '@ngx-translate/core';

declare const $: any;
declare var moment: any;

@Component({
  selector: 'app-ph0008-page',
  templateUrl: './ph0008-page.component.html',
  styleUrls: ['./ph0008-page.component.scss']
})
export class Ph0008PageComponent implements OnInit, AfterViewInit {
  numTab: any;
  page: number;
  const: any = {};
  allPage: any[] = [];
  sumAll: any = {};
  dateNow: any;
  latestPage: any[] = [];
  msgStore: any;
  isCurrentMonth: true;

  constructor(private router: Router,
              private dialogService: DialogService,
              private pharmacyService: PharmacyService,
              private translate: TranslateService
              ) {
    this.setConstant();
    this.translate.get(['PHARMACY.TRACING_REPORT', 'PHARMACY.PH0018', 'PHARMACY.PH0008' ]).subscribe(
      (res) => {
        this.msgStore = res;
      }
    );
  }

  ngOnInit() {
    this.numTab = 2;
    this.dateNow = moment().format();
    this.page = this.const.page;
    this.setCurrentMonth(0);
  }

  resetSum() {
    return {
      'remainingAdjustment': 0,
      'brandChange': 0,
      'dosageFormChange': 0,
      'standardChange': 0,
      'packaging': 0,
      'applicationDaysChange': 0,
      'genericDrugChange': 0,
      'otherReason': 0,
      'rowSum': 0,
      'protocolUsage': 0,
      'noProtocolUsage': 0,
      'reasonUnknown': 0
    };
  }
  resetSum1() {
    return {
      'patientConsentCount': 0,
      'patientNotConsentCount': 0,
      'rowSum': 0,
    };
  }

  ngAfterViewInit() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  setConstant() {
    this.const = {
      pageSize: 20,
      page: 0
    };
  }

  changeTab(number) {
    this.numTab = number;
    this.page = this.const.page;
    this.dateNow = moment().format();
    this.setCurrentMonth(0);
  }

  scrollPaging() {
    if (this.latestPage.length >= this.const.pageSize) {
      this.page = this.page + 1;
      this.callApi();
    }
  }

  setCurrentMonth(param) {
    if (param === 0) {
      this.dateNow = moment().format('YYYY-MM-DDTHH:mm:ssZZ');
    } else {
      this.dateNow = moment(this.dateNow).add(param, 'months').format('YYYY-MM-DDTHH:mm:ssZZ');
    }
    this.page = this.const.page;
    this.isCurrentMonth = moment(this.dateNow).isSame(moment(), 'months');
    this.callApi();
  }

  callApi() {
    switch (this.numTab) {
      case 1:
        break;
      case 2:
        this.getTracingReportStatics();
        break;
      case 3:
        this.getChangesInPrescriptionList();
        break;
    }
  }
  getTracingReportStatics() {
    const date = moment(this.dateNow);
    if (this.page === this.const.page) {
      this.allPage = [];
      this.sumAll = this.resetSum1();
    }
    const tracingReport = new TracingParamForm();
    tracingReport.start =  date.format('YYYY-MM-DDTHH:mm:ssZZ');
    tracingReport.page = this.page;
    tracingReport.pageSize = this.const.pageSize;
    this.dialogService.setLoaderVisible(true);
    this.pharmacyService.getTracingReportStatics(tracingReport)
      .subscribe((latestPage) => {
          this.dialogService.setLoaderVisible(false);
          for (let i = 0; i < latestPage.length; i++) {
            latestPage[i]['rowSum'] = this.getRowSum(latestPage[i], this.sumAll);
            this.sumAll['rowSum'] += latestPage[i]['rowSum'];
          }
          this.latestPage = latestPage;
          this.allPage = this.allPage.concat(latestPage);
        },
        (error) => {
          this.dialogService.setLoaderVisible(false);
          this.latestPage = [];
          this.allPage = [];
          this.sumAll = this.resetSum1();
        });
  }

  getChangesInPrescriptionList() {
    const date = moment(this.dateNow);
    if (this.page === this.const.page) {
      this.allPage = [];
      this.sumAll = this.resetSum();
    }
    const tracingReport = new TracingParamForm();
    tracingReport.start =  date.format('YYYY-MM-DDTHH:mm:ssZZ');
    tracingReport.page = this.page;
    tracingReport.pageSize = this.const.pageSize;
    this.dialogService.setLoaderVisible(true);
    this.pharmacyService.getChangesInPrescriptionList(tracingReport)
      .subscribe((latestPage) => {
          this.dialogService.setLoaderVisible(false);
          for (let i = 0; i < latestPage.length; i++) {
            latestPage[i]['rowSum'] = this.getRowSum(latestPage[i], this.sumAll);
            this.sumAll['rowSum'] += latestPage[i]['rowSum'];
          }
          this.latestPage = latestPage;
          this.allPage = this.allPage.concat(latestPage);
        },
        (error) => {
          this.dialogService.setLoaderVisible(false);
          this.latestPage = [];
          this.allPage = [];
          this.sumAll = this.resetSum();
        });
  }

  getRowSum(item, propertyList: any) {
    let rowSum = 0;
    const exclude = ['protocolUsage', 'noProtocolUsage'];
    for (const key in propertyList) {
      if (propertyList.hasOwnProperty(key) && item.hasOwnProperty(key) && key !== 'rowSum') {
        if (exclude.indexOf(key) < 0) {
          rowSum += item[key];
        }
        propertyList[key] += item[key];
      }
    }
    return rowSum;
  }
  exportCsv() {
    if (this.numTab === 2) {
      this.reCallGetTracingReportStaticsCsv();
    }
    if (this.numTab === 3) {
      this.reCallGetChangesInPrescriptionCsv();
    }
  }
  reCallGetTracingReportStaticsCsv() {
    const date = moment(this.dateNow);
    this.dialogService.setLoaderVisible(true);
    const tracingReport = new TracingParamForm();
    tracingReport.start = date.format('YYYY-MM-DDTHH:mm:ssZZ');
    tracingReport.page = null;
    tracingReport.pageSize = null;
    this.pharmacyService.getTracingReportStatics(tracingReport)
      .subscribe((latestPage) => {
          this.dialogService.setLoaderVisible(false);
          const sumAll = this.resetSum1();
          for (let i = 0; i < latestPage.length; i++) {
            latestPage[i]['rowSum'] = this.getRowSum(latestPage[i], sumAll);
            sumAll['rowSum'] += latestPage[i]['rowSum'];
          }
          sumAll['officeName'] = this.msgStore['PHARMACY.PH0008'].SUM;
          latestPage.push(sumAll);
          this.getTracingReportStaticsCsv(latestPage);
        },
        (error) => {
          this.dialogService.setLoaderVisible(false);
          this.dialogService.showError('MSG.ERROR');
        });
  }
  reCallGetChangesInPrescriptionCsv() {
    const date = moment(this.dateNow);
    this.dialogService.setLoaderVisible(true);
    const tracingReport = new TracingParamForm();
    tracingReport.start = date.format('YYYY-MM-DDTHH:mm:ssZZ');
    tracingReport.page = null;
    tracingReport.pageSize = null;
    this.pharmacyService.getChangesInPrescriptionList(tracingReport)
      .subscribe((latestPage) => {
          this.dialogService.setLoaderVisible(false);
          const sumAll = this.resetSum();
          for (let i = 0; i < latestPage.length; i++) {
            latestPage[i]['rowSum'] = this.getRowSum(latestPage[i], sumAll);
            sumAll['rowSum'] += latestPage[i]['rowSum'];
          }
          sumAll['officeName'] = this.msgStore['PHARMACY.PH0008'].SUM;
          latestPage.push(sumAll);
          this.getChangesInPrescriptionCsv(latestPage);
        },
        (error) => {
          this.dialogService.setLoaderVisible(false);
          this.dialogService.showError('MSG.ERROR');
        });
  }
  getTracingReportStaticsCsv(dataList) {
    const exportList = [];
    for (let i = 0; i < dataList.length; i++) {
      const data = [];
      data[0] = dataList[i]['officeName'];
      data[1] = dataList[i]['patientConsentCount'];
      data[2] = dataList[i]['patientNotConsentCount'];
      data[3] = dataList[i]['rowSum'];
      exportList.push(data);
    }
    const title = this.msgStore['PHARMACY.PH0018'].TRACING_REPORT_SUMMARY + moment(this.dateNow).format('YYYYMM');
    const header = [this.msgStore['PHARMACY.PH0008'].OFFICE_NAME, this.msgStore['PHARMACY.PH0008'].PATIENT_CONSENT_YES,
      this.msgStore['PHARMACY.PH0008'].PATIENT_CONSENT_NO, this.msgStore['PHARMACY.PH0008'].SUM];
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
  getChangesInPrescriptionCsv(dataList) {
    const exportList = [];
    for (let i = 0; i < dataList.length; i++) {
      const data = [];
      data[0] = dataList[i]['officeName'];
      data[1] = dataList[i]['remainingAdjustment'];
      data[2] = dataList[i]['brandChange'];
      data[3] = dataList[i]['dosageFormChange'];
      data[4] = dataList[i]['standardChange'];
      data[5] = dataList[i]['packaging'];
      data[6] = dataList[i]['applicationDaysChange'];
      data[7] = dataList[i]['genericDrugChange'];
      data[8] = dataList[i]['otherReason'];
      data[9] = dataList[i]['rowSum'];
      data[10] = dataList[i]['protocolUsage'];
      data[11] = dataList[i]['noProtocolUsage'];
      exportList.push(data);
    }
    const title = this.msgStore['PHARMACY.PH0018'].PRESCRIPTION_CHANGE_REPORT + moment(this.dateNow).format('YYYYMM');
    const header = [this.msgStore['PHARMACY.TRACING_REPORT'].DRUG_STORE_NAME, this.msgStore['PHARMACY.PH0008'].RESIDUE_ADJUSTMENT,
      this.msgStore['PHARMACY.PH0008'].CHANGE_COMPONENT, this.msgStore['PHARMACY.PH0008'].CHANGE_OF_DOSAGE,
      this.msgStore['PHARMACY.PH0008'].STANDARD_CHANGE, this.msgStore['PHARMACY.PH0008'].ONE_PACKAGING,
      this.msgStore['PHARMACY.PH0008'].PRESCRIPTION_DAY, this.msgStore['PHARMACY.PH0008'].CHANGE_GENERA_DRUG,
      this.msgStore['PHARMACY.PH0008'].OTHER, this.msgStore['PHARMACY.PH0018'].SUM,
      this.msgStore['PHARMACY.PH0018'].PROTOCOL_AVAILABLE, this.msgStore['PHARMACY.PH0018'].NO_PROTOCOL];
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
    this.showTooltip();
    return false;
  }

  destroyTooltip() {
    $('[data-toggle="tooltip"]').tooltip('dispose');
  }

  showTooltip() {
    $('[data-toggle="tooltip"]').tooltip();
  }
}
