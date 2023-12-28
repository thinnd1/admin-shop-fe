import {Component, OnInit} from '@angular/core';
import {Angular2Csv} from 'angular2-csv';
import {Router} from '@angular/router';
import {PharmacyService} from '../../../services/pharmacy.service';
import {UserSession} from '../../../models/ba/user-session';
import {SharedValueService} from '../../../services/shared-value.service';
import {TranslateService} from '@ngx-translate/core';
import {MasterService} from '../../../services/master.service';
import {DialogService} from '../../../services/dialog.service';

declare const $: any;
declare var moment: any;

@Component({
  selector: 'app-ph0006-page',
  templateUrl: './ph0006-page.component.html',
  styleUrls: ['./ph0006-page.component.scss']
})
export class Ph0006PageComponent implements OnInit {
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
  formSearch: any = {};
  page: number;
  const: any = {};
  latestPage: any = [];
  allPage = [];
  isHospital;
  listOffice = [];
  options: any = {};
  selectedOffice: any;
  listDrug = [];
  msgStore: any;
  drugSearch: any = {};
  userRole: any = {};
  infiniteScrollOptions: any = {
    page: 0,
    size: 20,
    placeHolder: 'PHARMACY.PH0006.DRUG',
    allowFreeText: true,
    multiple: false,
    showSearchButton: true
  };

  constructor(private router: Router,
              private translate: TranslateService,
              private shareValue: SharedValueService,
              private masterService: MasterService,
              private dialogService: DialogService,
              private pharmacyService: PharmacyService) {
    this.setConstant();
    this.translate.get('PHARMACY.DRUG').subscribe(
      (res) => {
        this.msgStore = res;
      }
    );
    this.userRole = this.router.url.indexOf('ph0006') >= 0 ? this.const.userRole.HOSPITAL : this.const.userRole.DRUG_STORE;
    this.isHospital = this.userRole === this.const.userRole.HOSPITAL;
  }

  ngOnInit() {
    this.formSearch.pageSize = this.const.pageSize;
    this.formSearch.alphabetIndex = '';
    this.userSession = this.shareValue.getUserSession();
    this.getListOffice();
    this.options = {
      multiple: false,
      containerCss: {height: '32px'},
      placeholder: this.translate.instant('PHARMACY.PH0006.OFFICE_PLACE_HOLDER') ,
      language: {
        noResults: () => {
          return this.translate.instant('PHARMACY.TRACING_REPORT.SELECT2_NO_RESULT');
        }
      },
      matcher: this.customMatcher
    };

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

  setConstant() {
    this.const = {
      pageSize: 50,
      maxTextLength: 11,
      userRole: {
        'HOSPITAL': 1,
        'DRUG_STORE': -1
      },
      drugCategory: {
        1: 'IN_HOSPITAL',
        2: 'OUT_HOSPITAL',
        3: 'IN_OUT_HOSPITAL'
      }
    };
  }

  getListOffice() {
      this.pharmacyService.getShareByOffice().subscribe((res) => {
        this.listOffice = [{id: '', text: '', nameKana: ''}];
        this.listOffice.push({id: res.currentOffice.officeId, text: res.currentOffice.officeName, nameKana: res.currentOffice.officeNameKana});
        const listOffice = res.officesSharingForCurrent;
        for (let i = 0; i < listOffice.length; i++) {
          const fieldElement = {};
          fieldElement['id'] = listOffice[i].officeId;
          fieldElement['text'] = listOffice[i].officeName;
          fieldElement['nameKana'] = listOffice[i].officeNameKana;
          fieldElement['officeType'] = listOffice[i].officeType;
          this.listOffice.push(fieldElement);
        }
      }, (error) => {
        this.dialogService.showError('MSG.ERROR');
      });
  }

  getListDrug() {
    this.masterService.getListDrug().subscribe(
      (res) => {
        this.listDrug = res.drugs;
      }
    );
  }

  searchProduct(i) {
    if (this.formSearch.alphabetIndex !== i) {
      this.formSearch.alphabetIndex = i;
      this.formSearch.productName = '';
      this.reloadSearch();
    }
  }

  reloadSearch() {
    this.page = 0;
    this.callApi();
  }

  productNameOnChange($event?) {
    if ($event) {
      this.formSearch.productName = $event.name;
      this.formSearch.alphabetIndex = '';
      this.reloadSearch();
    }
  }

  productNameOnEnter() {
    this.formSearch.alphabetIndex = '';
    this.reloadSearch();
  }

  scrollPaging() {
    if (this.latestPage.length >= this.const.pageSize) {
      this.page = this.page + 1;
      this.callApi();
    }
  }

  onOfficeChange($event) {
    if ( this.userSession.funcAuthority.FP_8 && this.selectedOffice.id === this.userSession.officeId) {
      if (this.userSession.officeType.MEDICAL) {
        this.router.navigate(['/ph/ph0021']);
      }else {
        this.router.navigate(['/ph/ph0023']);
      }
    } else {
      this.formSearch.officeId = this.selectedOffice.id;
      this.isHospital = $event.officeType === 'MEDICAL';
      this.reloadSearch();
    }
  }

  callApi() {
    if (this.selectedOffice) {
      this.formSearch.nameInitial = this.formSearch.alphabetIndex !== '' ? this.selectSearch[this.formSearch.alphabetIndex].label : null;
      this.formSearch.page = this.page;
      this.formSearch.isAdoptedOnly = true;
      this.dialogService.setLoaderVisible(true);
      this.pharmacyService.getListHanleDrug(this.formSearch)
        .subscribe((latestPage) => {
            latestPage = latestPage.items;
            this.dialogService.setLoaderVisible(false);
            this.allPage = this.page === 0 ? latestPage : this.allPage.concat(latestPage);
            this.latestPage = latestPage;
          },
          (error) => {
            this.dialogService.setLoaderVisible(false);
            this.dialogService.showError('MSG.ERROR');
            this.allPage = [];
          });
    }
  }

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
    let title = '';
    if (this.selectedOffice) {
      title += this.selectedOffice.text + '_';
    }
    if (this.isHospital) {
      title += this.msgStore['LIST_HOSPITAL_DRUG'];
    } else {
      title += this.msgStore['LIST_DRUG_STORE_DRUG'];
    }
    const exportList = [];
    const header = [this.msgStore['DRUG_NAME'], this.msgStore['COMPANY_NAME'], this.msgStore['DRUG_CODE']];
    if (this.isHospital) {
      header.push(this.msgStore['DRUG_CATEGORY']);
    }
    for (let i = 0; i < dataList.length; i++) {
      const data = [];
      data[0] = dataList[i]['drugName'];
      data[1] = dataList[i]['companyName'];
      data[2] = dataList[i]['drugCode'];
      if (this.isHospital) {
        data[3] = this.getCategory(dataList[i]['drugCategory']);
      }
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
    if (this.selectedOffice) {
      this.reCallListHanleDrugCsv();
    }
  }
  printPage() {
    const css = '@page {size:A4;margin:50px 0;}';
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

  myValueFormatter(data: any): string {
    return `${data['productName']}`;
  }

  autocompleListFormatter(data: any) {
    return `<span class='hover-result-search d-block py-1 px-2 bg-white'>&nbsp;${data['productName']} </span>`;
  }

  getCategory(categoryCode) {
    return this.const.drugCategory[categoryCode] ? this.msgStore[this.const.drugCategory[categoryCode]] : '';
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

  textChanged(keyword: any, name) {
    this.formSearch[name] = keyword;
    this.reloadListDrug(keyword, 0);
  }

  scrollDown($event) {
    this.reloadListDrug($event.keyword, $event.page);
  }


}
