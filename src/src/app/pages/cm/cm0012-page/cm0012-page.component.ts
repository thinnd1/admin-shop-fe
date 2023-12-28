import { Component, OnInit } from '@angular/core';
import { DateConverter } from '../../../common/converter/date.converter';
import { DialogService } from '../../../services/dialog.service';
import { CmsService } from '../../../services/cms.service';
import { TranslateService } from '@ngx-translate/core';
import {SharedValueService} from '../../../services/shared-value.service';
import {Curation} from '../../../models/cm/curation';
import {LoginUserInfoMessage} from '../../../services/message.service';
import { Subscription } from 'rxjs/Subscription';

declare const Chart: any;

@Component({
  selector: 'app-cm0012-page',
  templateUrl: './cm0012-page.component.html',
  styleUrls: ['./cm0012-page.component.scss']
})
export class Cm0012PageComponent implements OnInit {
  userSession;
  loginUserInfoMessageSubscription: Subscription;
  managementAuthority: boolean = null;
  dataArray: any[] = [];
  manualCuration1 = {
    'id': '1',
    'title': '医薬品・医療機器等安全性情報　No.352',
    'body': '<ol>' +
    '<li>' +
    '<a target="_blank" href="https://www.pmda.go.jp/files/000223875.pdf#page=3">相互接続防止コネクタに係る国際規格（ISO（IEC） 80369シリーズ）の導入について' +
    '<br>－神経麻酔分野の小口径コネクタ製品の切替えについて－' +
    '</a>' +
    '</li>' +
    '<li>重要な副作用等に関する情報' +
    '<br>' +
    '<a target="_blank" href="https://www.pmda.go.jp/files/000223875.pdf#page=7">【1】トルバプタン</a>' +
    '<br>' +
    '<a target="_blank" href="https://www.pmda.go.jp/files/000223875.pdf#page=11">【2】アナグリプチン，リナグリプチン，テネリグリプチン臭化水素酸塩水和物' +
    '<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;テネリグリプチン臭化水素酸塩水和物・カナグリフロジン水和物' +
    '</a>' +
    '<br>' +
    '<a target="_blank" href="https://www.pmda.go.jp/files/000223875.pdf#page=14">【3】アナグリプチン</a>' +
    '<br>' +
    '<a target="_blank" href="https://www.pmda.go.jp/files/000223875.pdf#page=15">【4】滅菌調整タルク</a>' +
    '</li>' +
    '<li>使用上の注意の改訂について（その293）' +
    '<br>' +
    '<a target="_blank" href="https://www.pmda.go.jp/files/000223875.pdf#page=17">トルバプタン 他（5件）</a>' +
    '</li>' +
    '<li>' +
    '<a target="_blank" href="https://www.pmda.go.jp/files/000223875.pdf#page=19">市販直後調査の対象品目一覧</a>' +
    '</li>' +
    '</ol>',
    'date': '平成30年4月17日',
    'read': false
  };

  curations: Curation[] = [];
  fixColors: string[] = ['#538FA3', '#EB8686', '#8ADCD6', '#F5E17A', '#A8E185', '#9087AE'];
  labelColors = [];
  firstLoad = true;

  bedUseRateChartType: any = 'all';
  bedUseRateChartData: any[] = [];
  hospitalStayChartType: any = 'all';
  hospitalStayChartData: any[] = [];

  constructor(
    private dateConverter: DateConverter,
    private dialogService: DialogService,
    private cmsService: CmsService,
    private loginUserInfoMessage: LoginUserInfoMessage,
    private translate: TranslateService,
    private sharedValueService: SharedValueService
  ) { }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    this.setChart();
    this.getData();

    this.cheackManagementAuthority(this.userSession.managementAuthority);
    this.loginUserInfoMessageSubscription = this.loginUserInfoMessage.get().subscribe(res => {
      if (res) {
        this.cheackManagementAuthority(res.managementAuthority);
      }
    });
  }

  cheackManagementAuthority(authority: string) {
    this.managementAuthority = (authority === 'MP_1' || authority === 'MP_2');
  }

  setChart() {
    Chart.pluginService.register({
      afterDraw: function (chart) {
        if (typeof chart.config.options.lineAt !== 'undefined') {
          let lineAt = chart.config.options.lineAt;
          const ctxPlugin = chart.chart.ctx;
          const xAxe = chart.scales[chart.config.options.scales.xAxes[0].id];
          const yAxe = chart.scales[chart.config.options.scales.yAxes[0].id];
          if (yAxe.min !== 0) {
            return;
          }
          ctxPlugin.strokeStyle = '#F18D00';
          ctxPlugin.beginPath();
          lineAt = (lineAt - yAxe.min) * (100 / yAxe.max);
          lineAt = (100 - lineAt) / 100 * (yAxe.height) + yAxe.top;
          ctxPlugin.moveTo(xAxe.left, lineAt);
          ctxPlugin.lineTo(xAxe.right, lineAt);
          ctxPlugin.lineWidth = 1;
          ctxPlugin.stroke();
        }
      }
    });
  }

  getData() {
    this.showLoading(true);
    this.dataArray = [];
    this.curations = [];
    this.cmsService.getPrepare().subscribe(
      (prepare: any) => {
        if (!prepare) {
          return;
        }

        // this.curations = prepare.curations;
        this.curations.push(this.manualCuration1);

        if (!prepare.kpiItems || !prepare.kpiItems.length) {
          return;
        }
        prepare.kpiItems.forEach((data, i) => {
          this.dataArray[i] = {};
          this.dataArray[i][data.type] = data;

          if (!data.labels || !data.labels.length) {
            data.labels = [];
          }
          if (!data.labels2 || !data.labels2.length) {
            data.labels2 = [];
          }
          if (!data.data || !data.data.length) {
            data.data = [];
          }

          if (data.data.length) {
            data.data.sort((a, b) => {
              if (a.date && b.date) {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
              }
            });
          }

          switch (data.type) {
            case 'BED_USE_RATE':
              this.setBedUseRate(data, i);
              break;
            case 'HOSPITAL_STAY':
              this.setHospitalStay(data, i);
              break;
            case 'RELIEF_CLASSIFICATION':
              this.setReliefClassification(data, i);
              break;
            case 'NURSING_NEED':
              this.setNursingNeed(data, i);
              break;
            case 'OUTPATIENT_NUMBER':
              this.setOutpatientNumber(data, i);
              break;
            case 'OTHER':
              this.setOther(data, i);
              break;
            case 'FREE_TEXT':
              this.setFreeText(data, i);
              break;
          }
        });
      },
      (error) => {
        this.showLoading(false);
        this.dialogService.showError('CM0012.MSG.ERROR');
      },
      () => {
        this.showLoading(false);
        this.firstLoad = false;
      }
    );
  }

  // 病床利用率
  setBedUseRate(json: any, index: number) {
    this.labelColors[json.type] = this.setColors(json.labels.length);
    this.setBedUseRateChartAll(json, index);
    json.labels.forEach((data, i) => {
      this.setBedUseRateChartSingle(json, i);
    });
  }

  setBedUseRateChartAll(json: any, index: number) {
    this.bedUseRateChartData['all'] = [];
    json.data.forEach((data, i) => {
      if (data.date === this.getCurrentDate()) {
        this.bedUseRateChartData['all'] = data.data;
        return false;
      }
    });

    setTimeout(() => {
      const canvas = <HTMLCanvasElement>document.getElementById('bed-use-rate-chart-all');
      if (!canvas) { return false; }
      const ctx = canvas.getContext('2d');
      const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: json.labels,
          datasets: [{
            data: this.bedUseRateChartData['all'],
            backgroundColor: this.setColors(json.labels.length),
            borderColor: this.setColors(json.labels.length),
            borderWidth: 1
          }]
        },
        options: {
          lineAt: json.threshold,
          scales: {
            xAxes: [{
              display: true,
              stacked: false,
              gridLines: {
                display: false
              }
            }],
            yAxes: [{
              gridLines: {
                drawBorder: false
              },
              ticks: {
                min: 0
              }
            }]
          },
          legend: {
            display: false
          },
          layout: {
            padding: {
              left: 10,
              right: 0,
              top: 0,
              bottom: 0
            }
          }
        }
      });
    });
  }

  setBedUseRateChartSingle(json: any, index: number) {
    const labels = [];
    this.bedUseRateChartData[index] = [];
    json.data.forEach((datas, i) => {
      labels.push(this.dataConvert(datas.date, 'Do'));
      datas.data.forEach((data, j) => {
        if (j === index) {
          this.bedUseRateChartData[index].push(data);
          return false;
        }
      });
    });

    setTimeout(() => {
      const canvas = <HTMLCanvasElement>document.getElementById('bed-use-rate-chart-' + index);
      if (!canvas) { return false; }
      const ctx = canvas.getContext('2d');
      const myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            data: this.bedUseRateChartData[index],
            pointBackgroundColor: '#004580',
            borderColor: '#004580',
            borderWidth: 3,
            fill: false,
            lineTension: 0
          }]
        },
        options: {
          lineAt: json.threshold,
          scales: {
            yAxes: [{
              ticks: {
                min: 0
              }
            }]
          },
          legend: {
            display: false
          },
          layout: {
            padding: {
              left: 10,
              right: 0,
              top: 0,
              bottom: 0
            }
          }
        }
      });
    });
  }

  // 平均在院日数
  setHospitalStay(json: any, index: number) {
    this.labelColors[json.type] = this.setColors(json.labels.length);
    this.setHospitalStayChartAll(json, index);
    json.labels.forEach((data, i) => {
      this.setHospitalStayChartSingle(json, i);
    });
  }

  setHospitalStayChartAll(json: any, index: number) {
    this.hospitalStayChartData['all'] = [];
    json.data.forEach((data, i) => {
      if (data.date === this.getCurrentDate()) {
        this.hospitalStayChartData['all'] = data.data;
        return false;
      }
    });

    setTimeout(() => {
      const canvas = <HTMLCanvasElement>document.getElementById('hospital-stay-chart-all');
      if (!canvas) { return false; }
      const ctx = canvas.getContext('2d');
      const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: json.labels,
          datasets: [{
            data: this.hospitalStayChartData['all'],
            backgroundColor: this.setColors(json.labels.length),
            borderColor: this.setColors(json.labels.length),
            borderWidth: 1
          }]
        },
        options: {
          lineAt: json.threshold,
          scales: {
            xAxes: [{
              display: true,
              stacked: false,
              gridLines: {
                display: false
              }
            }],
            yAxes: [{
              gridLines: {
                drawBorder: false
              },
              ticks: {
                min: 0
              }
            }]
          },
          legend: {
            display: false
          },
          layout: {
            padding: {
              left: 10,
              right: 0,
              top: 0,
              bottom: 0
            }
          }
        }
      });
    });
  }

  setHospitalStayChartSingle(json: any, index: number) {
    const labels = [];
    this.hospitalStayChartData[index] = [];
    json.data.forEach((datas, i) => {
      labels.push(this.dataConvert(datas.date, 'Do'));
      datas.data.forEach((data, j) => {
        if (j === index) {
          this.hospitalStayChartData[index].push(data);
          return false;
        }
      });
    });

    setTimeout(() => {
      const canvas = <HTMLCanvasElement>document.getElementById('hospital-stay-chart-' + index);
      if (!canvas) { return false; }
      const ctx = canvas.getContext('2d');
      const myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            data: this.hospitalStayChartData[index],
            pointBackgroundColor: '#004580',
            borderColor: '#004580',
            borderWidth: 3,
            fill: false,
            lineTension: 0
          }]
        },
        options: {
          lineAt: json.threshold,
          scales: {
            yAxes: [{
              ticks: {
                min: 0
              }
            }]
          },
          legend: {
            display: false
          },
          layout: {
            padding: {
              left: 10,
              right: 0,
              top: 0,
              bottom: 0
            }
          }
        }
      });
    });
  }

  // 救護区分
  setReliefClassification(json: any, index: number) {
    this.labelColors[json.type] = this.setColors(json.labels.length);
  }

  // 介護必要度
  setNursingNeed(json: any, index: number) {
    const labels = [];
    const values = [];
    json.data.forEach((data, i) => {
      labels.push(this.dataConvert(data.date, 'Do'));
      values.push(data.data[0]);
    });

    setTimeout(() => {
      const canvas = <HTMLCanvasElement>document.getElementById('nursing-need-chart');
      if (!canvas) { return false; }
      const ctx = canvas.getContext('2d');
      const myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            pointBackgroundColor: '#004580',
            borderColor: '#004580',
            borderWidth: 3,
            fill: false,
            lineTension: 0
          }]
        },
        options: {
          lineAt: json.threshold,
          scales: {
            yAxes: [{
              ticks: {
                min: 0
              }
            }]
          },
          legend: {
            display: false
          },
          layout: {
            padding: {
              left: 10,
              right: 0,
              top: 0,
              bottom: 0
            }
          }
        }
      });
    });
  }

  // 外来患者数
  setOutpatientNumber(json: any, index: number) {
    const labels = [];
    const values1 = [];
    const values2 = [];
    json.data.forEach((data, i) => {
      labels.push(this.dataConvert(data.date, 'Do'));
      values1.push(data.data[0]);
      values2.push(data.data[1]);
    });

    setTimeout(() => {
      const canvas = <HTMLCanvasElement>document.getElementById('outpatient-number-chart');
      if (!canvas) { return false; }
      const ctx = canvas.getContext('2d');
      const myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: json.labels[0],
              pointBackgroundColor: '#004580',
              borderColor: '#004580',
              borderWidth: 3,
              fill: false,
              lineTension: 0,
              data: values1
            },
            {
              label: json.labels[1],
              pointBackgroundColor: '#80002D',
              borderColor: '#80002D',
              borderWidth: 3,
              fill: false,
              lineTension: 0,
              data: values2
            }
          ]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                min: 0
              }
            }]
          },
          legend: {
            display: true,
            position: 'bottom'
          },
          layout: {
            padding: {
              left: 10,
              right: 0,
              top: 0,
              bottom: 0
            }
          }
        }
      });
    });
  }

  // その他
  setOther(json: any, index: number) {
    const labels = [];
    const values1 = [];
    const values2 = [];
    const values3 = [];
    json.data.forEach((data, i) => {
      labels.push(this.dataConvert(data.date, 'Do'));
      values1.push(data.data[0]);
      values2.push(data.data[1]);
      values3.push(data.data[2]);
    });

    setTimeout(() => {
      const canvas = <HTMLCanvasElement>document.getElementById('other-chart');
      if (!canvas) { return false; }
      const ctx = canvas.getContext('2d');
      const myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: json.labels[0],
              pointBackgroundColor: '#004580',
              borderColor: '#004580',
              borderWidth: 3,
              fill: false,
              lineTension: 0,
              data: values1
            },
            {
              label: json.labels[1],
              pointBackgroundColor: '#80002D',
              borderColor: '#80002D',
              borderWidth: 3,
              fill: false,
              lineTension: 0,
              data: values2
            },
            {
              label: json.labels[2],
              pointBackgroundColor: '#777',
              borderColor: '#777',
              borderWidth: 3,
              fill: false,
              lineTension: 0,
              data: values3
            }
          ]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                min: 0
              }
            }]
          },
          legend: {
            display: true,
            position: 'bottom'
          },
          layout: {
            padding: {
              left: 10,
              right: 0,
              top: 0,
              bottom: 0
            }
          }
        }
      });
    });
  }

  setFreeText(json: any, index: number) {

  }

  zeroPadding(zero: string, date: number) {
    return (zero + date).slice(-zero.length);
  }

  getCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = this.zeroPadding('00', date.getMonth() + 1);
    const day = this.zeroPadding('00', date.getDate());
    return [year, month, day].join('-');
  }

  getDays(date: string) {
    const dObj = new Date(date);
    const wDay = dObj.getDay();
    return wDay;
  }

  setColors(len: number) {
    Array.prototype.fill = function(val) {
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

  dataConvert(date: string, format: string) {
    return this.dateConverter.moment(date, format);
  }

  showLoading(flag: boolean) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(flag);
    });
  }

  isAllLoading(): boolean {
    return this.dialogService.isLoaderVisible();
  }

  checkNoData() {
    if (this.firstLoad) {
      return false;
    }

    if (this.isAllLoading()) {
      return false;
    }

    if ((this.curations && this.curations.length)) {
      return false;
    }

    if (this.dataArray && this.dataArray.length) {
      return false;
    }

    return true;
  }

  gotoCurationArticle(href: string) {
    (<any>window).open(href, '_blank');
  }

}
