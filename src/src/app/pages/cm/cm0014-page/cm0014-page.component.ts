import {Component, HostListener, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {SharedValueService} from '../../../services/shared-value.service';
import {DialogService} from '../../../services/dialog.service';
import {DateConverter} from '../../../common/converter/date.converter';
import {CmsService} from '../../../services/cms.service';
import {KpiInput} from '../../../models/cm/kpi_input';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-cm0014-page',
  templateUrl: './cm0014-page.component.html',
  styleUrls: ['./cm0014-page.component.scss']
})
export class Cm0014PageComponent implements OnInit {
  private cellToggle = [];
  private isErrors = [];
  private fixColors: string[] = ['#538FA3', '#EB8686', '#8ADCD6', '#F5E17A', '#A8E185', '#9087AE'];
  private labelColors = [];
  private monthSelect = [];
  private yearSelect = [];
  private currentDate = [];
  private requestCnt: number = 0;
  private responseCnt: number = 7;
  private responseError: boolean = false;
  private firstRequest: boolean = true;

  public bedUseRate: KpiInput;
  public hospitalStay: KpiInput;
  public reliefClassification: KpiInput;
  public nursingNeed: KpiInput;
  public outpatientNumber: KpiInput;
  public other: KpiInput;
  public settings: any;

  constructor(
    private translate: TranslateService,
    private dateConverter: DateConverter,
    private sharedValueService: SharedValueService,
    private dialogService: DialogService,
    private cmsService: CmsService
  ) {}

  ngOnInit() {
    this.setSettings();
  }

  reloadItem() {
    this.changeCurrentDate('BED_USE_RATE');
    this.changeCurrentDate('HOSPITAL_STAY');
    this.changeCurrentDate('RELIEF_CLASSIFICATION');
    this.changeCurrentDate('NURSING_NEED');
    this.changeCurrentDate('OUTPATIENT_NUMBER');
    this.changeCurrentDate('OTHER');
  }

  // 病床利用率
  setBedUseRate(date: string, lastDay: number) {
    this.showLoading();
    this.cmsService.getBedUseRate(date).subscribe(
      (json: KpiInput) => {
        this.bedUseRate = null;
        if (!this.checkData(json, true)) {
          this.hideLoading(false);
          return;
        }
        this.bedUseRate = (<any>$).extend({}, json);
        this.bedUseRate.data = this.margeDummyData(json, lastDay, date);
        this.labelColors[this.bedUseRate.type] = this.setColors(this.bedUseRate.labels.length);
        this.hideLoading(false);
      },
      (error) => {
        this.hideLoading(true);
      }
    );
  }

  // 平均在院日数
  setHospitalStay(date: string, lastDay: number) {
    this.showLoading();
    this.cmsService.getHospitalStay(date).subscribe(
      (json: KpiInput) => {
        this.hospitalStay = null;
        if (!this.checkData(json, true)) {
          this.hideLoading(false);
          return;
        }
        this.hospitalStay = (<any>$).extend({}, json);
        this.hospitalStay.data = this.margeDummyData(json, lastDay, date);
        this.labelColors[this.hospitalStay.type] = this.setColors(this.hospitalStay.labels.length);
        this.hideLoading(false);
      },
      (error) => {
        this.hideLoading(true);
      }
    );
  }

  // 救護区分
  setReliefClassification(date: string, lastDay: number) {
    this.showLoading();
    this.cmsService.getReliefClass(date).subscribe(
      (json: any) => {
        this.reliefClassification = null;
        if (!this.checkData(json, true, true)) {
          this.hideLoading(false);
          return;
        }
        this.reliefClassification = (<any>$).extend({}, json);
        this.reliefClassification.data = this.margeDummyData(json, lastDay, date, true);
        this.labelColors[this.reliefClassification.type] = this.setColors(this.reliefClassification.labels.length);
        this.hideLoading(false);
      },
      (error) => {
        this.hideLoading(true);
      }
    );
  }

  // 看護必要度
  setNursingNeed(date: string, lastDay: number) {
    this.showLoading();
    this.cmsService.getNursingNeed(date).subscribe(
      (json: KpiInput) => {
        this.nursingNeed = null;
        if (!this.checkData(json, true)) {
          this.hideLoading(false);
          return;
        }
        this.nursingNeed = (<any>$).extend({}, json);
        this.nursingNeed.data = this.margeDummyData(json, lastDay, date);
        this.labelColors[this.nursingNeed.type] = this.setColors(this.nursingNeed.labels.length);
        this.hideLoading(false);
      },
      (error) => {
        this.hideLoading(true);
      }
    );
  }

  // 外来患者数
  setOutpatientNumber(date: string, lastDay: number) {
    this.showLoading();
    this.cmsService.getOutpatientNumber(date).subscribe(
      (json: KpiInput) => {
        this.outpatientNumber = null;
        if (!this.checkData(json, true)) {
          this.hideLoading(false);
          return;
        }
        this.outpatientNumber = (<any>$).extend({}, json);
        this.outpatientNumber.data = this.margeDummyData(json, lastDay, date);
        this.labelColors[this.outpatientNumber.type] = this.setColors(this.outpatientNumber.labels.length);
        this.hideLoading(false);
      },
      (error) => {
        this.hideLoading(true);
      }
    );
  }

  // その他
  setOther(date: string, lastDay: number) {
    this.showLoading();
    this.cmsService.getOther(date).subscribe(
      (json: any) => {
        this.other = null;
        if (!this.checkData(json, true)) {
          this.hideLoading(false);
          return;
        }
        this.other = (<any>$).extend({}, json);
        this.other.data = this.margeDummyData(json, lastDay, date);
        this.labelColors[this.other.type] = this.setColors(this.other.labels.length);
        this.hideLoading(false);
      },
      (error) => {
        this.hideLoading(true);
      }
    );
  }

  // 設定
  setSettings() {
    this.showLoading();
    this.cmsService.getSettings().subscribe(
      (json: any) => {
        if (json) {
          this.settings = (<any>$).extend({}, json);
          this.settings.changedHospitalWards = false;
          this.reloadItem();
        }
        this.hideLoading(false);
      },
      (error) => {
        this.hideLoading(true);
      }
    );
  }

  showLoading() {
    if (!this.dialogService.isLoaderVisible()) {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
    }
  }

  hideLoading(error) {
    setTimeout(() => {
      this.requestCnt += 1;
      if (!this.responseError) {
        if (error) {
          this.responseError = true;
          this.dialogService.setLoaderVisible(false);
          this.dialogService.showError('CM0014.MSG.ERROR');
        } else {
          if (this.requestCnt == this.responseCnt) {
            this.dialogService.setLoaderVisible(false);
            this.firstRequest = false;
          }
          if (!this.firstRequest) {
            this.dialogService.setLoaderVisible(false);
          }
        }
      }
    });
  }

  clickOrderBySettingsItems(event: any, index: number, vertical: string) {
    const items = this.settings.items;
    switch (vertical) {
      case 'up':
        items.splice(index - 1, 2, items[index], items[index - 1]);
        break;
      case 'down':
        items.splice(index, 2, items[index + 1], items[index]);
        break;
    }
  }

  clickVisibleSettingsItems(event: any, index: number) {
    const items = this.settings.items;
    items[index].isVisible = !items[index].isVisible;
  }

  saveD1GraphData(event: any, changeData: any, i: number) {
    const type = changeData.type;
    const id = changeData.id;
    if (this.isErrors[type][i].indexOf(false) >= 0) {
      this.dialogService.showError('MSG.ERROR');
      return false;
    }
    const date = changeData.data[i].date;
    const data = changeData.data[i].data.map(function (element) {
      return Number(element);
    });
    const sendData = {
      'kpiItemId': id,
      'data': [{
        'date': date,
        'data': data
      }]
    };
    console.log(sendData);

    this.showLoading();
    this.cmsService.putD1GraphData(sendData).subscribe(
      (res) => {
        this.hideLoading(false);
        console.log(res);
      },
      (error) => {
        this.hideLoading(true);
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  saveD2GraphData(event: any, changeData: any, i: number, j: number) {
    const type = changeData.type;
    const id = changeData.id;
    let errorArray = [];
    this.isErrors[type][i].forEach((data, i) => {
      errorArray = errorArray.concat(data);
    });
    if (errorArray.indexOf(false) >= 0) {
      this.dialogService.showError('MSG.ERROR');
      return false;
    }
    const date = changeData.data[i].date;
    const data = [];
    changeData.data[i].data.forEach((datas, i) => {
      data.push(datas.map(function (element) {
        return Number(element);
      }));
    });
    const sendData = {
      'kpiItemId': id,
      'data': [{
        'date': date,
        'data': data
      }]
    };
    console.log(sendData);

    this.showLoading();
    this.cmsService.putD2GraphData(sendData).subscribe(
      (res) => {
        this.hideLoading(false);
        console.log(res);
      },
      (error) => {
        this.hideLoading(true);
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  saveSettings(event: any) {
    const sendData = this.settings;

    // TODO: 病棟数が変更された場合、グラフデータの整合が崩れるため、データを初期化する必要がある
    // 病棟数を変更してsaveしようとした場合、警告を表示して本項目をtrueで送信し、グラフデータを全削除させる

    Observable.create((observer) => {
      if (sendData.changedHospitalWards) {
        this.dialogService
          .showMessage('warning', false, null, 'CM0014.MSG.CHANGED_HOSPITAL_WARDS', null, 'MSG.YES', 'MSG.NO')
          .filter((res) => res.isOk())
          .mergeMap(() => {
            this.showLoading();
            return this.cmsService.putSettings(sendData);
          })
          .subscribe(() => {
            observer.next();
            observer.complete();
          }, (error) => {
            observer.error(error);
          });
      } else {
        this.showLoading();
        this.cmsService.putSettings(sendData)
          .subscribe(() => {
            observer.next();
            observer.complete();
          }, (error) => {
            observer.error(error);
          });
      }
    }).subscribe(
      () => {
        this.dialogService.showSuccess('MSG.SAVED');
        this.setSettings();
      },
      (error) => {
        this.hideLoading(true);
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  margeDummyData(originalData: any, lastDay: number, selectDate: string, labels2?: boolean) {

    const mergeData = [];
    const year = this.yearSelect[originalData.type];
    const month = this.zeroPadding('00', this.monthSelect[originalData.type]);

    this.cellToggle[originalData.type] = [];
    this.isErrors[originalData.type] = [];

    for (let i = 0; i < lastDay; i++) {

      const day = this.zeroPadding('00', Number(i + 1));
      const len2 = originalData.labels.length;

      this.cellToggle[originalData.type][i] = [];
      this.isErrors[originalData.type][i] = [];

      mergeData[i] = {
        date: [year, month, day].join('-'),
        data: []
      };

      if (!labels2) {
        for (let k = 0; k < len2; k++) {
          mergeData[i]['data'].push(0);
        }
      } else {
        const len = originalData.labels2.length;
        for (let m = 0; m < len; m++) {
          mergeData[i]['data'][m] = [];
          this.cellToggle[originalData.type][i][m] = [];
          this.isErrors[originalData.type][i][m] = [];
          for (let n = 0; n < len2; n++) {
            mergeData[i]['data'][m].push(0);
            this.cellToggle[originalData.type][i][m][n] = [];
            this.isErrors[originalData.type][i][m][n] = true;
          }
        }
      }

      if (originalData.data && originalData.data.length) {
        originalData.data.forEach((orgData, j) => {
          const originalDay = this.dataConvert(orgData.date, 'DD');
          if (day === originalDay && orgData.date.indexOf(selectDate) !== -1) {
            mergeData[i] = orgData;
          }
        });
      }

    }
    return mergeData;
  }

  setColors(len: number) {
    Array.prototype.fill = function (val) {
      const l = this.length;
      if (l < val) {
        for (let i = val - 1 - l; i >= 0; i--) {
          this[i + l] = this[i % l];
        }
      }
      return this;
    };
    return this.fixColors.fill(len.toString());
  }

  zeroPadding(zero: string, date: number) {
    return (zero + date).slice(-zero.length);
  }

  dataConvert(date: string, format: string) {
    return this.dateConverter.moment(date, format);
  }

  showInput(event: any, type: string, i: number, j: number, k: number) {
    if (k === void 0) {
      this.cellToggle[type][i][j] = true;
    } else {
      this.cellToggle[type][i][j][k] = true;
    }
    setTimeout(() => {
      const elm = event.target.children[0];
      if (elm) {
        const val = elm.value;
        elm.value = '';
        elm.focus();
        elm.value = val;
      }
    }, 300);
  }

  hideInput(event: any, type: string, i: number, j: number, k: number) {
    if (k === void 0) {
      this.cellToggle[type][i][j] = false;
    } else {
      this.cellToggle[type][i][j][k] = false;
    }
  }

  changeInput(event: any, type: string, i: number, j: number, k: number) {
    // if(event.which == 13) return false;
    if (event.target.value.length) {
      if (k === void 0) {
        this.isErrors[type][i][j] = this.isNumber(event.target.value);
      } else {
        this.isErrors[type][i][j][k] = this.isNumber(event.target.value);
      }
    } else {
      if (k === void 0) {
        this.isErrors[type][i][j] = false;
      } else {
        this.isErrors[type][i][j][k] = false;
      }
    }
    // this.checkError(type,k);
  }

  isNumber(value: string) {
    const pattern = /^([1-9]\d*|0)(\.\d+)?$/;
    return pattern.test(value);
  }

  getCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return {'year': year, 'month': month};
  }

  setYear() {
    const currentDate = this.getCurrentDate();
    const yearArray = [];
    const minYear = 1931;
    const yearLen = currentDate.year - minYear;
    for (let i = 0; i <= yearLen; i++) {
      yearArray.push(currentDate.year - i);
    }
    return yearArray;
  }

  setMonth() {
    const monthArray = [];
    for (let i = 1; i <= 12; i++) {
      monthArray.push(i);
    }
    return monthArray;
  }

  changeCurrentDate(type: string) {
    const date = this.getCurrentDate();
    this.yearSelect[type] = date.year;
    this.monthSelect[type] = date.month;
    const lastDay = this.getLastDay(date.year, date.month);
    this.getData(lastDay, type);
    this.currentDate[type] = true;
  }

  changeDate(event: any, type: string) {
    const year = this.yearSelect[type];
    const month = this.monthSelect[type];
    const lastDay = this.getLastDay(year, month);
    this.getData(lastDay, type);
    const currentDate = this.getCurrentDate();
    this.currentDate[type] = (currentDate.year == year && currentDate.month == month) ? true : false;
  }

  getData(lastDay: number, type: string) {
    const year = this.yearSelect[type];
    const month = this.zeroPadding('00', this.monthSelect[type]);
    const date = [year, month].join('-');

    switch (type) {
      case 'BED_USE_RATE':
        this.setBedUseRate(date, lastDay);
        break;
      case 'HOSPITAL_STAY':
        this.setHospitalStay(date, lastDay);
        break;
      case 'RELIEF_CLASSIFICATION':
        this.setReliefClassification(date, lastDay);
        break;
      case 'NURSING_NEED':
        this.setNursingNeed(date, lastDay);
        break;
      case 'OUTPATIENT_NUMBER':
        this.setOutpatientNumber(date, lastDay);
        break;
      case 'OTHER':
        this.setOther(date, lastDay);
        break;
    }
  }

  addHospitalWards(event: any) {
    this.settings.changedHospitalWards = true;
    this.settings.hospitalWards.push('');
  }

  deleteHospitalWards(event: any, index: number) {
    this.settings.changedHospitalWards = true;
    this.settings.hospitalWards.splice(index, 1);
    console.log(this.settings.hospitalWards);
  }

  getLastDay(year: number, month: number) {
    return new Date(year, month, 0).getDate();
  }

  customTrackBy(index: number, obj: any): any {
    return index;
  }

  checkData(data: KpiInput, api?: boolean, label2?: boolean): boolean {
    if (!data) {
      return false;
    }
    if (!data.labels || !data.labels.length) {
      return false;
    }
    if (label2) {
      if (!data.labels2 || !data.labels2.length) {
        return false;
      }
    }
    if (!api && (!data.data || !data.data.length)) {
      return false;
    }
    return true;
  }

}
