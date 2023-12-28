import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {RegistrationService} from '../../../services/registration.service';
import {PrHandlingHospitalsSettings} from '../../../models/re/pr-handling-hospitals-settings';
import {ActivatedRoute} from '@angular/router';
import {HanlingHospitalSendApi} from '../../../models/re/hanling-hospital-send-api';
import {HttpStatus} from '../../../common/http.status';
import {HttpError} from '../../../common/error/http.error';
import {MasterService} from '../../../services/master.service';
import {MedicalOffice} from '../../../models/ma/medical-office';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';

declare const $: any;

@Component({
  selector: 'app-re0012-page',
  templateUrl: './re0012-page.component.html',
  styleUrls: ['./re0012-page.component.scss'],
})

export class Re0012PageComponent implements OnInit {
  model = new PrHandlingHospitalsSettings();
  handlingHospitals: any[];
  handlingOtherHospital: any[];
  keyCode: string;
  errorResponse: string;
  errorResponseOther: string;
  contentAlertDelete: string;
  listOtherHospital = [];
  listHospital = [];
  translate = {};
  accessToken: string;
  outsideHospital: any;
  options: any;
  noHospital: boolean;
  noOtherHospital: boolean;
  infiniteScrollOptions: any;
  keyword = '';

  constructor(private registrationService: RegistrationService, private dialogService: DialogService,
              private translateService: TranslateService, private activatedRoute: ActivatedRoute,
              private masterService: MasterService) {
  }

  ngOnInit() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.translateService.get('MSG').subscribe((res) => {
      this.translate = res;
      this.infiniteScrollOptions ={
        page: 0,
        size: 20,
        allowFreeText: false,
        multiple: false,
        placeHolder: this.translate['RE0012']['SEARCH']
      };
    });
    this.activatedRoute.params.subscribe((param: any) => {
      this.accessToken = param['access_token'];
    });
    if (this.accessToken !== undefined && this.accessToken !== '') {
      this.createHandlingHospitalAuto(this.accessToken);
    } else {
      this.reload();
    }
  }

  reload() {
    this.keyCode = '';
    this.outsideHospital = '';
    this.errorResponse = '';
    this.errorResponseOther = '';
    this.getPrHandlingHospitals();
  }

  getPrHandlingHospitals() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.registrationService.getPrHandlingHospitalsSettings().subscribe((settings: PrHandlingHospitalsSettings) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.model = settings;
        this.listHospital = Object.keys(this.model).map(key => this.model[key]);
        this.handlingHospitals = this.listHospital.filter(hospital => hospital.otherHandling === false);
        (this.handlingHospitals.length > 0) ? (this.noHospital = false) : (this.noHospital = true);
        this.handlingOtherHospital = this.listHospital.filter(hospital => hospital.otherHandling === true);
        (this.handlingOtherHospital.length > 0) ? (this.noOtherHospital = false) : (this.noOtherHospital = true);
      },
      error => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
        });
  }

  alertDeleteHospital(handlingHospital: any, index: number) {
    (handlingHospital.otherHandling === false) ?
      (this.contentAlertDelete = this.translate['RE0012']['E001_1']) : (this.contentAlertDelete = this.translate['RE0012']['E003_1']);
    const contentDialog = this.contentAlertDelete.replace('hospitalName', handlingHospital.officeName);
    this.dialogService.showMessage('warning', false, null, null, contentDialog, 'MSG.YES', 'MSG.NO').subscribe(
      (result: DialogResult) => {
        if (result.isOk()) {
          this.deleteHospital(handlingHospital.officeId, handlingHospital.otherHandling, index);
        }
      });
  }

  deleteHospital(officeId: string, otherHandling: boolean, index: number) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.registrationService.deleteHandlingOtherHospitals(officeId).subscribe((response) => {
        if (response === HttpStatus.NotContent) {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          setTimeout(() => {
            this.dialogService.showMessage('success', false, null, 'MSG.DELETED', null, 'MSG.OK', null);
            if (otherHandling) {
              this.handlingOtherHospital.splice(index, 1);
              (this.handlingOtherHospital.length > 0) ? (this.noOtherHospital = false) : (this.noOtherHospital = true);
            } else {
              this.handlingHospitals.splice(index, 1);
              (this.handlingHospitals.length > 0) ? (this.noHospital = false) : (this.noHospital = true);
            }
            this.errorResponseOther = '';
            this.errorResponse = '';
          }, 200);
        }
      },
      error => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      });
  }

  createHandlingHospitalAuto(access_token: string) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    const handlingHospitalSendApi = new HanlingHospitalSendApi(access_token, '', '', '');
    this.registrationService.createHandlingHospitals(handlingHospitalSendApi).subscribe(
      response => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
          this.dialogService.showMessage('success', false, null, 'MSG.ADDED', null, 'OK', null);
          this.reload();
        }, 200);
      },
      error => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
          this.reload();
        }, 200);
      });
  }

  createHandlingHospitalByKeyCode(keyCode: string) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    const handlingHospitalSendApi = new HanlingHospitalSendApi('', keyCode, '', '');
    this.registrationService.createHandlingHospitals(handlingHospitalSendApi).subscribe(
      response => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        setTimeout(() => {
          this.dialogService.showMessage('success', false, null, 'MSG.ADDED', null, 'OK', null);
        }, 200);
        this.reload();
      },
      (error: HttpError) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
          switch (error.error_codes[0]) {
            case 'COMMON.SAVE_FAILED':
              this.errorResponse = this.translate['RE0012']['E002_1'];
              break;
            case 'R0012.E002_1':
              this.errorResponse = this.translate['RE0012']['E002_1'];
              break;
            case 'R0012.E002_2':
              this.errorResponse = this.translate['RE0012']['E002_2'];
              break;
          }
          this.reloadWhenError();
        }, 200);
      });
  }

  createHandlingOtherHospitals() {
    if (!this.outsideHospital || !this.outsideHospital.id) {
      this.errorResponseOther = this.translate['RE0012']['SEARCH_MEDICAL_ERROR'];
    } else {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      const handlingHospitalSendApi = new HanlingHospitalSendApi('', '', this.outsideHospital.id, this.outsideHospital.name);
      this.registrationService.createHandlingHospitals(handlingHospitalSendApi).subscribe(
        respone => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showMessage('success', false, null, 'MSG.SAVED', null, 'MSG.YES', null);
          this.reload();
        },
        error => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          if (error.error_codes[0] === 'R0012.E005_1') {
            this.errorResponseOther = this.translate['RE0012']['E005_1'];
          }
        });
    }
  }

  reloadWhenError() {
    this.outsideHospital = null;
    this.errorResponseOther = '';
    this.getPrHandlingHospitals();
  }

  reloadListMedical() {
    this.masterService.getMedicalOffices(this.keyword, this.infiniteScrollOptions.page, this.infiniteScrollOptions.size)
      .subscribe((settings: MedicalOffice) => {
          this.listOtherHospital = this.infiniteScrollOptions.page === 0 ? settings.medicalOffices :
            this.listOtherHospital.concat(settings.medicalOffices);
        },
        (error) => {
          this.listOtherHospital = [];
        });
  }

  searchMedicalOffices(keyword: any) {
    this.infiniteScrollOptions.page = 0;
    this.keyword = keyword;
    this.reloadListMedical();
  }

  scrollDown(page) {
    this.infiniteScrollOptions.page += 1;
    this.reloadListMedical();
  }
}
