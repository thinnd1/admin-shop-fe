import {Component, OnInit, AfterViewInit} from '@angular/core';
import {TracingReportValidator} from '../ph0012-page/ph0012-page.validator';
import {TranslateService} from '@ngx-translate/core';
import {Helper} from '../../../common/helper';
import {MasterService} from '../../../services/master.service';
import {SharedValueService} from '../../../services/shared-value.service';
import {DialogService} from '../../../services/dialog.service';
import {Router} from '@angular/router';
import {PharmacyService} from '../../../services/pharmacy.service';
import {HttpError} from '../../../common/error/http.error';
import {VisitEntrySettings} from '../../../models/me/visit-entry-settings';
import {DialogResult} from '../../../models/dialog-param';
import {HttpStatus} from '../../../common/http.status';

declare const $: any;

@Component({
  selector: 'app-ph0017-page',
  templateUrl: './ph0017-page.component.html',
  styleUrls: ['./ph0017-page.component.scss']
})
export class Ph0017PageComponent implements OnInit, AfterViewInit {
  selectedHospital: any;
  listHospital = [];
  protocol: any = {};
  options: any = {};

  constructor(private dialogService: DialogService,
              private translate: TranslateService,
              private masterService: MasterService,
              private pharmacyService: PharmacyService,
              private shareValue: SharedValueService,
              private helper: Helper,
              private router: Router) {
  }

  ngOnInit() {
    this.pharmacyService.getListHospital({officeUserId: '', drugStoreOfficeId: ''}).subscribe((res) => {
      this.listHospital = [{id: '', text: '', nameKana: ''}];
      const listHospital = res.hospitals;
      for (let i = 0; i < listHospital.length; i++) {
        const fieldElement = {};
        fieldElement['id'] = listHospital[i].id;
        fieldElement['text'] = listHospital[i].name;
        fieldElement['nameKana'] = listHospital[i].nameKana;
        this.listHospital.push(fieldElement);
      }
      if (this.listHospital && this.listHospital.length === 2) {
        this.selectedHospital = this.listHospital[1];
        this.onHospitalChange(this.selectedHospital);
      }
    });
    this.options = {
      multiple: false,
      placeholder: this.translate.instant('PHARMACY.TRACING_REPORT.MEDICAL_OFFICE_PLACE_HOLDER'),
      language: {
        noResults: () => {
          return this.translate.instant('PHARMACY.TRACING_REPORT.SELECT2_NO_RESULT');
        }
      },
      matcher: this.customMatcher,
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
  onHospitalChange($event) {
    this.callApi($event.id);
  }

  callApi(id) {
    this.dialogService.setLoaderVisible(true);
    this.pharmacyService.getProtocol(id).subscribe(
      (protocol) => {
        this.protocol = protocol;
        this.dialogService.setLoaderVisible(false);
      }, (error: HttpError) => {
        this.dialogService.setLoaderVisible(false);
        this.dialogService.showError('MSG.ERROR');
      });
  }
  ngAfterViewInit() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  printPage() {
    const css = '@page {size:A4;margin: 40px 0;}';
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

  destroyTooltip() {
    $('[data-toggle="tooltip"]').tooltip('dispose');
  }

}
