import {Component, OnInit} from '@angular/core';
import {Angular2Csv} from 'angular2-csv';
import {Router} from '@angular/router';
import {PharmacyService} from '../../../services/pharmacy.service';
import {UserSession} from '../../../models/ba/user-session';
import {SharedValueService} from '../../../services/shared-value.service';
import {TranslateService} from '@ngx-translate/core';
import {MasterService} from '../../../services/master.service';
import {DialogService} from '../../../services/dialog.service';
import {PharmaOfficeInfoSettings} from '../../../models/ma/pharma-office-info-settings';
import {HttpError} from '../../../common/error/http.error';
import {DrugQueryForm} from '../../../models/ph/drug-query-form';
import {DialogResult} from '../../../models/dialog-param';
import {Location} from '@angular/common';
import * as XLSX from 'xlsx';

declare const $: any;
declare var moment: any;


@Component({
  selector: 'app-ph0021-page',
  templateUrl: './ph0021-page.component.html',
  styleUrls: ['./ph0021-page.component.scss']
})
export class Ph0021PageComponent implements OnInit {
  userSession: UserSession;
  public selectSearch = [
    {label: 'あ', value: ['あ', 'い', 'う', 'え', 'お'], isActive: false},
    {label: 'か', value: ['か', 'き', 'く', 'け', 'こ'], isActive: false},
    {label: 'さ', value: ['さ', 'し', 'す', 'せ', 'そ'], isActive: false},
    {label: 'た', value: ['た', 'ち', 'つ', 'て', 'と'], isActive: false},
    {label: 'な', value: ['な', 'に', 'ぬ', 'ね', 'の'], isActive: false},
    {label: 'は', value: ['は', 'ひ', 'ふ', 'へ', 'ほ'], isActive: false},
    {label: 'ま', value: ['ま', 'み', 'む', 'め', 'も'], isActive: false},
    {label: 'や', value: ['や', 'ゆ', 'よ'], isActive: false},
    {label: 'ら', value: ['ら', 'り', 'る', 'れ', 'ろ'], isActive: false},
    {label: 'わ', value: ['わ', 'ゐ', 'ゑ', 'を'], isActive: false},
    {label: '他', value: '', isActive: false},
  ];
  model: any;
  checked: boolean;
  officeId: any[];
  officeIds = [];
  isDrugstore;
  formSearch = new DrugQueryForm();
  page: number;
  const: any = {};
  latestPage: any = [];
  allPage = [];
  isHospital;
  listDrug = [];
  msgStore: any;
  msgStorePH0021: any;
  pharmacyOffices = [];
  pharmacyOfficesResult = [];
  oldData: any = [];
  previousQuery: any;
  numTab: number;
  infiniteScrollOptions: any = {
    page: 0,
    size: 20,
    placeHolder: 'BTN.SEARCH',
    allowFreeText: true,
    multiple: false,
    showSearchButton: true
  };
  selectedDrug: any = {};
  selectedPharmacy: any = {};

  constructor(private router: Router,
              private translate: TranslateService,
              private shareValue: SharedValueService,
              private masterService: MasterService,
              private dialogService: DialogService,
              private location: Location,
              private pharmacyService: PharmacyService) {
    this.setConstant();
    this.translate.get('PHARMACY.DRUG').subscribe(
      (res) => {
        this.msgStore = res;
      }
    );
    this.translate.get('PHARMACY.PH0021').subscribe(
      (res) => {
        this.msgStorePH0021 = res;
      }
    );
    this.isHospital = this.router.url.indexOf('ph0021') > -1;
    this.getPharmaOffice();
  }

  ngOnInit() {
    this.numTab = 2;
    this.resetPage();
    this.userSession = this.shareValue.getUserSession();
    this.getSearchData();
    this.callApiOfficeSharing();
  }

  callApiOfficeSharing() {
    this.dialogService.setLoaderVisible(true);
    this.pharmacyService.getSharingOffice().subscribe((res) => {
      this.dialogService.setLoaderVisible(false);
      this.model = res.officesSharing;
      for (let i = 0; i < this.model.length; i++) {
        if (this.model[i].sharing === true) {
          this.officeId = this.model[i].officeId;
          this.officeIds.push(this.officeId);
        }
      }
    });
  }

  saveSharingAdoptedDrug() {
    const officeIds = this.model.filter((e) => {
      return e.sharing;
    }).map((item) => {
      return item.officeId;
    });
    this.dialogService.setLoaderVisible(true);
    this.pharmacyService.putSharingAdoptedDrug({officeIds: officeIds}).subscribe(
      (response) => {
        this.dialogService.setLoaderVisible(false);
        const msg = this.isHospital ? 'PHARMACY.PH0024.MSG_SAVE' : 'PHARMACY.PH0025.MSG_SAVE';
        this.dialogService.showMessage('success', false, null, msg, null,
          'MSG.OK', null);
      },
      (error) => {
        this.dialogService.setLoaderVisible(false);
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  resetPage() {
    this.formSearch = new DrugQueryForm();
    this.formSearch.pageSize = this.const.pageSize;
    this.formSearch.alphabetIndex = '';
    this.oldData = [];
    this.allPage = [];
    this.page = 0;
  }

  changeNumTab(numTab) {
    if (this.numTab === 2) {
      this.advanceConfirmDialog(() => {
        if (numTab === 2) {
          this.resetSearch();
        } else {
          this.resetPage();
          this.callApiOfficeSharing();
        }
        this.numTab = numTab;
      });

    }
    if (this.numTab === 3) {
      this.resetPage();
      if (numTab === 2) {
        this.resetSearch();
      } else {
        this.callApiOfficeSharing();
      }
      this.numTab = numTab;
    }
  }

  setConstant() {
    this.const = {
      pageSize: 50,
      maxTextLength: 11,
      drugCategory: [
        {key: 1, text: 'IN_HOSPITAL'},
        {key: 2, text: 'OUT_HOSPITAL'},
        {key: 3, text: 'IN_OUT_HOSPITAL'}
      ]
    };
  }

  getPharmaOffice() {
    this.masterService.getPharmaOfficeInfo().subscribe(
      (pharmacyOffice: PharmaOfficeInfoSettings) => {
        this.pharmacyOffices = [];
        const tempData = pharmacyOffice.pharmacyOfficeInfoList;
        for (const child of tempData) {
          const optionItem = {};
          optionItem['name'] = child.officeName;
          optionItem['nameKana'] = child.officeNameKana;
          this.pharmacyOffices.push(optionItem);
        }
      }, (error: HttpError) => {
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  searchProductByAlphabet(i) {
    if (this.formSearch.alphabetIndex !== i) {
      // if choose an Alphabet character then remove all search conditions
      this.formSearch = new DrugQueryForm();
      this.formSearch.alphabetIndex = i;
      this.reloadSearch();
    }
  }

  productNameOnChange($event, key) {
    if ($event) {
      this.formSearch[key] = $event.name;
      this.getSearchData();
    }
  }

  getSearchData() {
    // if search conditions change then remove chosen character
    this.formSearch.alphabetIndex = '';
    this.reloadSearch();
  }

  reloadSearch() {
    // if search conditions change or character change then both call this function
    this.advanceConfirmDialog(() => {
      this.resetSearch();
    });
  }

  advanceConfirmDialog(callBack) {
    if (this.oldData.length > 0) {
      const html = this.msgStorePH0021.MSG.RELOAD_SEARCH;
      this.dialogService.showMessage('warning', false, null, null, html, 'MSG.OK', 'MSG.CANCEL').subscribe(
        (dialogResult: DialogResult) => {
          if (dialogResult.isOk()) {
            callBack();
          } else {
            this.formSearch = $.extend({}, this.previousQuery);
          }
        });
    } else {
      callBack();
    }
  }

  resetSearch() {
    // empty list and search Query
    this.oldData = [];
    this.page = 0;
    this.callApi();
  }

  scrollPaging() {
    if (this.latestPage.length >= this.const.pageSize && this.numTab === 2) {
      this.page = this.page + 1;
      this.callApi();
    }
  }

  getData(list) {
    // get applied Data from usageStartDate and usageEndDate
    const timeNow = moment();
    for (let i = 0; i < list.length; i++) {
      const record = list[i];
      record.applied = (moment(record.usageStartDate).isSameOrBefore(timeNow, 'day') && !record.usageEndDate)
        || (moment(record.usageEndDate).isAfter(timeNow, 'day') && !moment(record.usageStartDate).isAfter(timeNow, 'day'));
    }
  }

  callApi() {
    this.formSearch.nameInitial = this.formSearch.alphabetIndex !== '' ? this.selectSearch[this.formSearch.alphabetIndex].label : null;
    this.formSearch.page = this.page;
    this.dialogService.setLoaderVisible(true);
    this.pharmacyService.getListHanleDrug(this.formSearch)
      .subscribe((latestPage) => {
          this.dialogService.setLoaderVisible(false);
          latestPage = latestPage.items;
          this.getData(latestPage);
          this.allPage = this.page === 0 ? latestPage : this.allPage.concat(latestPage);
          this.latestPage = latestPage;
          if (this.page === 0) {
            this.previousQuery = $.extend({}, this.formSearch);
          }
        },
        (error) => {
          this.allPage = [];
          this.dialogService.setLoaderVisible(false);
          this.dialogService.showError('MSG.ERROR');
        });
  }

  /*** after form touched **/
  editDrug(index) {
    this.updateDataList(index);
    const record = this.allPage[index];
    const today = moment().format('YYYY-MM-DDTHH:mm:ssZZ');
    if (record.applied) {
      record.usageEndDate = '';
      record.usageStartDate = today;
    } else {
      record.usageEndDate = today;
    }
  }

  updateDataList(index) {
    const res = this.oldData.filter((item) => {
      return item.updatedIndex === index;
    });
    if (res.length === 0) {
      const newObj = $.extend({}, this.allPage[index]);
      newObj.updatedIndex = index;
      this.oldData.push(newObj);
    }
  }

  registerDrug() {
    const newDrug = [];
    for (let i = 0; i < this.oldData.length; i++) {
      newDrug.push(this.allPage[this.oldData[i].updatedIndex]);
    }
    const msg = this.isHospital ? 'PHARMACY.PH0021.MSG.SUCCESS_SAVE' : 'PHARMACY.PH0021.MSG.SUCCESS_SAVE_DRUG_STORE';
    this.callApiRegisterDrug(newDrug, msg);
  }

  callApiRegisterDrug(drugList, html) {
    this.dialogService.setLoaderVisible(true);
    this.pharmacyService.putRegisterDrugForHospital(drugList).subscribe(
      (result: any) => {
        this.dialogService.setLoaderVisible(false);
        if (result.success) {
          this.oldData = [];
          this.dialogService.showMessage('success', false, null, html, null, 'MSG.OK', null);
        } else {
          const msg = this.showMessage(result);
          this.dialogService.showMessage('error', false, null, null, msg, 'MSG.OK', null);
        }
      }, (error: HttpError) => {
        this.dialogService.setLoaderVisible(false);
        this.dialogService.showError('MSG.ERROR');
      });
  }

  showMessage(list) {
    let msg = '';
    if (list.wrongFormatDates && list.wrongFormatDates.length > 0) {
      msg += this.msgStorePH0021.ERROR.DATE.INVALID + '<br/>';
      msg += this.printList(list.wrongFormatDates);
    }
    if (list.invalidStartEndDates.length > 0) {
      msg += this.msgStorePH0021.ERROR.DATE.AFTER + '<br/>';
      for (let i = 0; i < list.invalidStartEndDates.length; i++) {
        list.invalidStartEndDates[i] = list.invalidStartEndDates[i].split(',')
          .map((item) => {
            return moment(item).format('YYYY/MM/DD');
          }).join(', ');
      }
      msg += this.printList(list.invalidStartEndDates);
    }
    if (list.missingDrugCode) {
      msg += this.msgStorePH0021.ERROR.YJ_CODE.REQUIRED + '<br/>';
    }
    if (list.notExistDrugCodes.length > 0) {
      msg += this.msgStorePH0021.ERROR.YJ_CODE.NOT_EXISTED + '<br/>';
      msg += this.printList(list.notExistDrugCodes);
    }
    if (list.invalidDrugCategory.length > 0) {
      msg += this.msgStorePH0021.ERROR.DRUG_CATEGORY.WRONG_CODE + '<br/>';
      msg += this.printList(list.invalidDrugCategory);
    }
    return msg;
  }

  printList(list) {
    let msg = '';
    for (let i = 0; i < list.length && i < 3; i++) {
      msg += list[i] + '<br/>';
    }
    return msg;
  }

  importCsv(evt: any) {
    const maxfilesize = 1024 * 1024 * 10;
    const fileUpload = evt.target.files[0];
    evt.target.value = '';
    if (!fileUpload) {
      return;
    }
    const isCsv = (/.+(\.csv)$/).test(fileUpload.name);
    if (fileUpload.size > maxfilesize) {
      this.dialogService.showMessage('error', false, null, 'PHARMACY.PH0021.MAX_FILE_SIZE', null, 'MSG.OK', null);
    } else {
      const importList = [];
      const reader: FileReader = new FileReader();
      if (!(fileUpload.name.match(/.+(\.xlsx|\.csv|\.xls)$/))) {
        this.dialogService.showMessage('error', false, null, 'PHARMACY.PH0021.MSG.INVALID_CSV_FORMAT', null, 'MSG.OK', null);
        return false;
      }
      reader.onload = (e: any) => {
        const bstr = isCsv ? e.target.result : new Uint8Array(e.target.result);
        const wb = XLSX.read(bstr, {type: isCsv ? 'binary' : 'buffer', raw: true});
        const utils = XLSX.utils;
        const sheet1 = wb.Sheets[wb.SheetNames[0]];
        const opt: any = {header: '1'};
        const data = utils.sheet_to_json(sheet1, opt);
        for (let i = 0; i < data.length; i++) {
          if (data[i]['YJコード'] || data[i]['採用区分'] || data[i]['採用日'] || data[i]['在庫日'] || data[i]['終了日'] || data[i]['製品名']) {
            importList.push(this.convertDataForCsv(data[i]));
          }
        }
        if (importList.length === 0) {
          this.dialogService.showMessage('error', false, null, 'PHARMACY.PH0021.CSV_FAIL', null, 'MSG.OK', null);
          return false;
        } else {
          this.callApiRegisterDrug(importList, 'PHARMACY.PH0021.MSG.SUCCESS_IMPORT');
        }
      };
      reader.onerror = (e: any) => {
        this.dialogService.showError('MSG.ERROR');
      };
      if (isCsv) {
        reader.readAsText(fileUpload);
      } else {
        reader.readAsArrayBuffer(fileUpload);
      }
    }
  }

  convertDataForCsv(item) {
    const temp = {};
    temp['drugCategory'] = item['採用区分'];
    temp['usageEndDate'] = this.convertDateForCsv(item['終了日']);
    temp['drugCode'] = item['YJコード'];
    if (this.isHospital) {
      temp['usageStartDate'] = this.convertDateForCsv(item['採用日']);
    } else {
      temp['usageStartDate'] = this.convertDateForCsv(item['在庫日']);
    }
    return temp;
  }

  convertDateForCsv(date) {
    const format = ['YYYY/MM/DD', 'YYYY/M/D'];
    return moment(date, format, true).isValid() ?
      moment(date, format).format('YYYY-MM-DDTHH:mm:ssZZ') : date;
  }

  /*** export CSV & Print & etc **/
  reCallListHanleDrugCsv() {
    this.dialogService.setLoaderVisible(true);
    const csvParams = $.extend({}, this.formSearch);
    csvParams.page = null;
    this.pharmacyService.getListHanleDrug(csvParams)
      .subscribe((res) => {
          this.dialogService.setLoaderVisible(false);
          this.getCsv(res.items);
        },
        (error) => {
          this.dialogService.setLoaderVisible(false);
          this.dialogService.showError('MSG.ERROR');
        });
  }

  getCsv(dataList) {
    let title = this.userSession.officeName + '_';
    if (this.isHospital) {
      title += this.msgStore['LIST_HOSPITAL_DRUG'];
    } else {
      title += this.msgStore['LIST_DRUG_STORE_DRUG'];
    }
    const exportList = [];
    const header = [this.msgStore['DRUG_NAME'], this.msgStore['COMPANY_NAME'], this.msgStore['DRUG_CODE']];
    if (this.isHospital) {
      header.push(this.msgStore['DRUG_CATEGORY']);
      header.push(this.msgStore['USAGE_START_DATE']);
    } else {
      header.push(this.msgStore.DRUG_STORE['USAGE_START_DATE']);
    }
    header.push(this.msgStore['USAGE_END_DATE']);
    for (let i = 0; i < dataList.length; i++) {
      const data = [];
      data[0] = dataList[i]['drugName'];
      data[1] = dataList[i]['companyName'];
      data[2] = dataList[i]['drugCode'];
      if (this.isHospital) {
        data[3] = dataList[i]['drugCategory'];
      }
      data['usageStartDate'] = dataList[i]['usageStartDate'] ? moment(dataList[i]['usageStartDate']).format('YYYY/MM/DD') : '';
      data['usageEndDate'] = dataList[i]['usageEndDate'] ? moment(dataList[i]['usageEndDate']).format('YYYY/MM/DD') : '';
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

  exportCsv() {
    this.reCallListHanleDrugCsv();
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

  getCategory(categoryCode) {
    const code = this.const.drugCategory.filter((item) => {
      return item.key === parseInt(categoryCode, 0);
    });
    return code.length > 0 ? this.msgStore[code[0].text] : '';
  }

  changeTab(tab) {
    if (tab === 2) {
      if (this.isHospital) {
        this.router.navigate(['/ph/ph0024']);
      } else {
        this.router.navigate(['/ph/ph0025']);
      }
    } else {
      this.callApi();
    }
  }

  backScreen() {
    this.advanceConfirmDialog(() => {
      this.location.back();
    });
  }

  beforeImportCsv(event) {
    if (this.oldData.length > 0) {
      this.advanceConfirmDialog(() => {
        this.resetSearch();
        event.click();
      });
    } else {
      event.click();
    }
  }

  reloadListDrug(keyword, page) {
    this.masterService.getListDrugWithPaging(keyword, page, this.infiniteScrollOptions.size, '')
      .subscribe((settings: any) => {
          const loop = settings.drugs;
          for (let i = 0; i < loop.length; i++) {
            loop[i].name = loop[i].productName;
          }
          this.listDrug = page === 0 ? loop : this.listDrug.concat(loop);
        },
        (error) => {
          this.listDrug = [];
        });
  }

  reloadListPharmacy(keyword, page) {
    const term = keyword.toLowerCase();
    this.pharmacyOfficesResult = this.pharmacyOffices.filter((data) => {
      return data.nameKana && data.nameKana.toLowerCase().indexOf(term) > -1 || data.name.toLowerCase().indexOf(term) > -1;
    });
  }

  textChanged(keyword: any, name) {
    this.formSearch[name] = keyword;
    if (name === 'productName') {
      this.reloadListDrug(keyword, 0);
    }
    if (name === 'companyName') {
      this.reloadListPharmacy(keyword, 0);
    }
  }

  scrollDown($event, name) {
    if (name === 'productName') {
      this.reloadListDrug($event.keyword, $event.page);
    }
  }

}
