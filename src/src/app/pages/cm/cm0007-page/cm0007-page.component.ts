import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DialogService } from '../../../services/dialog.service';
import { DateConverter } from '../../../common/converter/date.converter';
import { CmsService } from '../../../services/cms.service';
import { DrjoyInfo } from '../../../models/cm/drjoy-info';
import { InfoInput } from '../../../models/cm/info-input';
import { PageStatus } from '../../../models/cm/page.status';

@Component({
  selector: 'app-cm0007-page',
  templateUrl: './cm0007-page.component.html',
  styleUrls: ['./cm0007-page.component.scss']
})
export class Cm0007PageComponent implements OnInit {

  @ViewChild('tableData') tableData: ElementRef;

  public dataList: DrjoyInfo[];
  public detailData: DrjoyInfo;
  public pageStatus = PageStatus;
  public currentPage = PageStatus.Top;
  private isLoading = true;
  private backScrollPosY = 0;
  private options: InfoInput;

  constructor(
    private dateConverter: DateConverter,
    private dialogService: DialogService,
    private cmsService: CmsService
    ) {}

  ngOnInit() {
    this.options = new InfoInput();
    this.getResetItem();
  }

  dateConvert(data) {
    return this.dateConverter.moment(data, 'lll');
  }

  getResetItem() {
    this.dataList = [];
    this.options.pageNo = 0;
    this.getItems();
  }

  onScroll($event) {
    if (this.getTableElementBottom() <= $event.currentScrollPosition) {
      this.getItems();
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

  async getItems() {
    // ローダーが居ると↓の isAllLoading() で弾かれてしまうので待ち合わせる
    for(let i = 0; i < 300; i++) {
      if (! this.dialogService.isLoaderVisible()) {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 100)); // sleep(100)
    }

    if (this.isAllLoading()) {
      return;
    }
    this.showLoading(true);
    this.cmsService.getDrjoyInfo(this.options).subscribe((res: DrjoyInfo[]) => {
      if (!res || !res.length) {
        this.showLoading(false);
        return;
      }
      res.forEach((val, idx) => {
        this.dataList.push(val);
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

  onSubmit(searchForm) {
    this.options.keyword = searchForm.value.keyword;
    this.getResetItem();
  }

  showArticle(data) {
    this.detailData = data;
    if (!this.detailData.read) {
      this.drInfoRead([this.detailData.id]);
      this.detailData.read = true;
    }
  }

  drInfoRead(infoIds: string[]) {
    this.cmsService.putDrInfoRead(infoIds).subscribe();
  }

  gotoDetail(data) {
    if (this.isAllLoading()) {
      return;
    }
    this.showArticle(data);
    this.currentPage = PageStatus.Detail;
    this.backScrollPosY = (<any>window).pageYOffset;
    setTimeout(() => {
      (<any>window).scrollTo(0, 0);
    });
  }

  gotoTop() {
    this.currentPage = PageStatus.Top;
    setTimeout(() => {
      (<any>window).scrollTo(0, this.backScrollPosY);
    });
  }

  gotoBack() {
    this.gotoTop();
  }

}
