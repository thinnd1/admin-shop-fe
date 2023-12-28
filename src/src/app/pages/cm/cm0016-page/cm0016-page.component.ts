import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SharedValueService } from '../../../services/shared-value.service';
import { DialogService } from '../../../services/dialog.service';
import { DateConverter } from '../../../common/converter/date.converter';
import { InfoInput } from '../../../models/cm/info-input';
import { Curation } from '../../../models/cm/curation';
import { CmsService } from '../../../services/cms.service';

@Component({
  selector: 'app-cm0016-page',
  templateUrl: './cm0016-page.component.html',
  styleUrls: ['./cm0016-page.component.scss']
})
export class Cm0016PageComponent implements OnInit {

  @ViewChild('tableData') tableData: ElementRef;

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
  public dataList: Curation[];
  public isLoading = true;
  private options: InfoInput;

  constructor(
    private translate: TranslateService,
    private dateConverter: DateConverter,
    private dialogService: DialogService,
    private sharedValueService: SharedValueService,
    private cmsService: CmsService
  ) {}

  ngOnInit() {
    this.options = new InfoInput(0, 10);
    this.dataList = [];
    this.dataList.push(this.manualCuration1);
    // this.getItems();
  }

  onScroll($event) {
    if (this.getTableElementBottom() <= $event.currentScrollPosition) {
      // this.getItems();
    }
  }

  getTableElementBottom(): number {
    if (!this.tableData) {
      return 0;
    }
    const rect = this.tableData.nativeElement.getBoundingClientRect();
    const bottom = rect.bottom + <any>window.pageYOffset;
    return bottom;
  }

  getItems() {
    if (this.isAllLoading()) {
      return;
    }
    this.showLoading(true);
    this.cmsService.getCuration(this.options).subscribe((res: Curation[]) => {
      if (!res || !res.length) {
        this.showLoading(false);
        return;
      }
      res.forEach((data, idx) => {
        this.dataList.push(data);
      });
      this.showLoading(false);
      this.options.pageNo++;
      if (this.getTableElementBottom() < (<any>window).innerHeight) {
        setTimeout(() => {
          this.getItems();
        });
      }
    }, (res) => {
      this.showLoading(false);
      this.dialogService.showError('MSG.ERROR');
    });
  }

  isAllLoading(): boolean {
    return !this.isLoading || this.dialogService.isLoaderVisible();
  }

  showLoading(flag: boolean) {
    setTimeout(() => {
      if (this.options.pageNo <= 0) {
        this.dialogService.setLoaderVisible(flag);
        this.isLoading = true;
      } else {
        this.dialogService.setLoaderVisible(false);
        this.isLoading = !flag;
      }
    });
  }

  dataConvert(date: string) {
    return this.dateConverter.moment(date, 'LL');
  }

  gotoCurationArticle(href: string) {
    (<any>window).open(href, '_blank');
  }

}
