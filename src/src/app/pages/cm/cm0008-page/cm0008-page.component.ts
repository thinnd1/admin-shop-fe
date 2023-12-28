import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import {ActivatedRoute, Router, Params, NavigationExtras} from '@angular/router';
import { DialogService } from '../../../services/dialog.service';
import { DateConverter } from '../../../common/converter/date.converter';
import { PageStatus } from '../../../models/cm/page.status';
import { CmsService } from '../../../services/cms.service';
import { InfoInput } from '../../../models/cm/info-input';
import { RecievedOfficeInfo } from '../../../models/cm/recieved-office-info';
import { RecievedOfficeInfoDetail } from '../../../models/cm/recieved-office-info-detail';
import {DialogResult} from '../../../models/dialog-param';
import {Metadata} from '../../../models/firebase/firebase.metadata';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';
import {UserSession} from '../../../models/ba/user-session';
import {SharedValueService} from '../../../services/shared-value.service';
import {Observable} from 'rxjs/Observable';
import {Helper} from '../../../common/helper';

@Component({
  selector: 'app-cm0008-page',
  templateUrl: './cm0008-page.component.html',
  styleUrls: ['./cm0008-page.component.scss']
})
export class Cm0008PageComponent implements OnInit {

  @ViewChild('tableData') tableData: ElementRef;

  private dataList: RecievedOfficeInfo[];
  public detailData: RecievedOfficeInfoDetail;
  public pageStatus = PageStatus;
  public currentPage = PageStatus.Top;
  private infoId: string;
  private isLoading = true;
  private searchOptions: InfoInput;

  private userSession: UserSession;

  public detailAttachments: { path?: string; meta?: Metadata; }[] = [];
  public detailAttachmentsImageFlag = false;

  constructor(
    private dateConverter: DateConverter,
    private router: Router,
    private dialogService: DialogService,
    private activatedRoute: ActivatedRoute,
    private sharedValueService: SharedValueService,
    private cmsService: CmsService,
    private firebaseStorage: FirebaseStorage,
    private helper: Helper
    ) {
  }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    this.activatedRoute.params.subscribe((params: Params) => {
      this.searchOptions = new InfoInput();
      this.infoId = params['infoId'];
      if (this.infoId) {
        this.currentPage = PageStatus.Detail;
        this.showDetailPage();
      } else {
        this.activatedRoute.queryParams
          .subscribe(queryParams => {
            this.currentPage = PageStatus.Top;
            this.searchOptions.keyword = queryParams.searchKeyword;
            this.showTopPage();
          });
      }
    });
  }

  dateConvert(data) {
    return this.dateConverter.moment(data, 'lll');
  }

  resetTopItem() {
    if (this.currentPage === PageStatus.Top) {
      this.dataList = [];
      this.searchOptions.pageNo = 0;
      this.getTopItems();
    }
  }

  onScroll($event) {
    if (this.currentPage === PageStatus.Top) {
      if (this.getTableElementBottom() <= $event.currentScrollPosition) {
        this.getTopItems();
      }
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

  async getTopItems() {
    if (this.currentPage !== PageStatus.Top) {
      return;
    }

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
    this.cmsService.getRecievedOfficeInfo(this.searchOptions).subscribe((res: RecievedOfficeInfo[]) => {
      if (!res || !res.length) {
        this.showLoading(false);
        return;
      }
      res.forEach((val, idx) => {
        this.dataList.push(val);
      });
      this.showLoading(false);
      this.searchOptions.pageNo++;
      if (this.getTableElementBottom() < (<any>window).innerHeight) {
        setTimeout(() => {
          this.getTopItems();
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
      if (this.currentPage === PageStatus.Top) {
        if (this.searchOptions.pageNo <= 0) {
          this.dialogService.setLoaderVisible(flag);
          this.isLoading = true;
        } else {
          this.dialogService.setLoaderVisible(false);
          this.isLoading = !flag;
        }
      } else {
        this.dialogService.setLoaderVisible(flag);
      }
    });
  }

  onSearch() {
    const extras: NavigationExtras = {
      queryParams: {},
      replaceUrl: true
    };
    if (this.searchOptions.keyword) {
      extras.queryParams = {searchKeyword: this.searchOptions.keyword};
    }
    this.router.navigate(['/cm/cm0008'], extras);
  }

  getDetailItem() {
    this.showLoading(true);
    this.cmsService.getRecievedOfficeInfoDetail(this.infoId)
      .subscribe((res: RecievedOfficeInfoDetail) => {
        if (res) {
          this.detailData = res;
          Observable.merge(
            this.cmsService.putOfficeInfoRead([this.infoId]),
            this.getOfficeAttachedFiles(res.fromOfficeId, res.attachmentFileIds)
          ).subscribe(() => {}, () => {},
            () => {
              this.showLoading(false);
            }
          );
        } else {
          this.dialogService
            .showMessage('error', false, null, 'MSG.ERROR', null, 'MSG.OK', null)
            .subscribe((r: DialogResult) => {
                if (r.isOk()) {
                  this.router.navigate(['/']);
                }
              }
            );
        }
      }, (res) => {
        this.showLoading(false);
        this.dialogService.showError('MSG.ERROR');
      });
  }

  getOfficeAttachedFiles(fromOfficeId: string, attachmentFileIds: string[]): Observable<void> {
    return Observable.create((observer) => {
      this.detailAttachmentsImageFlag = false;
      if (attachmentFileIds.length) {
        attachmentFileIds.forEach((attachmentFileId, index) => {
          this.firebaseStorage
            .officeAttachedFiles(fromOfficeId, attachmentFileId)
            .subscribe((res) => {

              this.firebaseStorage.metadataOfficeAttachedFiles(fromOfficeId, attachmentFileId)
                .subscribe((r) => {
                  this.detailAttachments[index] = {
                    path: res,
                    meta: r
                  };
                  this.detailAttachmentsImageFlag = true;
                  if ((attachmentFileIds.length - 1) === index) {
                    observer.next();
                    observer.complete();
                  }
                });
            });
        });
      } else {
        observer.next();
        observer.complete();
      }
    });
  }

  checkDetailImage(file): boolean {
    if (!file || !file.meta || !file.meta.contentType) {
      return false;
    }
    const fileObj = {type: file.meta.contentType};
    if (!this.helper.checkFileOrImage(fileObj)) {
      return false;
    }
    return true;
  }

  checkDetailEtc(file): boolean {
    if (!file || !file.meta || !file.meta.contentType) {
      return false;
    }
    const fileObj = {type: file.meta.contentType};

    if (this.helper.checkFileOrImage(fileObj)) {
      return false;
    }
    return true;
  }

  checkDetailEtcCount(): number {
    let count = 0;
    if (this.detailAttachments && this.detailAttachments.length) {
      this.detailAttachments.forEach((val) => {
        if (val && val.meta) {
          const fileObj = {type: val.meta.contentType};
          if (!this.helper.checkFileOrImage(fileObj)) {
            count++;
          }
        }
      });
    }
    return count;
  }

  downloadDetailImage(name: string, api: string) {
    this.dialogService.showDownloadDialog(name, api);
  }

  showDetailPage() {
    this.getDetailItem();
  }

  showTopPage() {
    this.resetTopItem();
  }

  gotoDetail(id) {
    this.router.navigate(['cm/cm0008', id]);
  }

  gotoTop() {
    this.router.navigate(['cm/cm0008']);
  }

}
