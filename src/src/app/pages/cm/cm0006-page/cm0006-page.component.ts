import { Component, OnInit, ElementRef } from '@angular/core';
import { DateConverter } from '../../../common/converter/date.converter';
import { SharedValueService } from '../../../services/shared-value.service';
import { UserSession } from '../../../models/ba/user-session';
import { DialogService } from '../../../services/dialog.service';
import { Observable } from 'rxjs/Observable';
import { CmsService } from '../../../services/cms.service';
import { FavoriteSns } from '../../../models/cm/favorite-sns';
import {Router} from '@angular/router';
import {GroupService} from '../../../services/group.service';
import {FirAttachments} from '../../../models/gr/firebase/fir.attachments';
import {Helper} from '../../../common/helper';

@Component({
  selector: 'app-cm0006-page',
  templateUrl: './cm0006-page.component.html',
  styleUrls: ['./cm0006-page.component.scss']
})
export class Cm0006PageComponent implements OnInit {

  public dataList: any[];
  private userSession: UserSession;
  private wait = 2000;

  constructor(
    private dateConverter: DateConverter,
    private sharedValueService: SharedValueService,
    private dialogService: DialogService,
    private elementRef: ElementRef,
    private cmsService: CmsService,
    private router: Router,
    private groupService: GroupService,
    private helper: Helper
  ) { }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    this.getDataList();
  }

  dateConvert(data) {
    return this.dateConverter.moment(data, 'lll');
  }

  getDataList() {
    Observable
      .create((observer) => {
        this.showLoading(true);
        observer.next();
      })
      .delay(this.wait)
      .mergeMap(() => {
        return this.cmsService.getFavoriteSns();
      })
      .mergeMap((res: FavoriteSns[]) => {
        return Observable.create((observer) => {
          if (!res || !res.length) {
            observer.next();
          } else {
            this.dataList = res;
            this.dataList.forEach((val, index) => {
              val.readMoreOver = false;
              this.checkReadMore(index);
            });
            this.getAttachmentList().subscribe(() => {
              observer.next();
            });
          }
        });
      })
      .subscribe(() => {
        this.showLoading(false);
      }, () => {
        this.showLoading(false);
        this.dialogService.showError('MSG.ERROR');
      });
  }

  getAttachmentList(): Observable<void> {
    return Observable.create((observer) => {
      this.dataList.forEach((val, index, array) => {
        let path = '';
        if (val.contents.fileIds && val.contents.fileIds.length) {
          if (val.contents.commentId) {
            path = `comment/${val.contents.articleId}/${val.contents.commentId}/attachments`;
          } else {
            path = `article/${val.contents.containerId}/${val.contents.articleId}/attachments`;
          }
          this.groupService.getAttachmentsList(val.contents.containerId, path).subscribe((list: FirAttachments[]) => {
            val.listAttachments = list;
            if (array.length - 1 <= index) {
              observer.next();
              observer.complete();
            }
          });
        } else {
          if (array.length - 1 <= index) {
            observer.next();
            observer.complete();
          }
        }
      });
    });
  }

  checkAttachmentImg(listAttachment) {
    if (listAttachment.type && this.helper.checkFileOrImage(listAttachment)) {
      return true;
    }
    return false;
  }

  checkAttachmentsImg(listAttachments) {
    let count = 0;
    listAttachments.forEach((val) => {
      if (val.type && this.helper.checkFileOrImage(val)) {
        count++;
      }
    });
    return count > 0;
  }

  checkAttachmentsEtc(listAttachments) {
    let count = 0;
    listAttachments.forEach((val) => {
      if (val.type && !this.helper.checkFileOrImage(val)) {
        count++;
      }
    });
    return count > 0;
  }

  delete(id, index) {
    this.dialogService
    .showMessage('warning', false, 'CM0006.MSG.DELETE.TITLE', 'CM0006.MSG.DELETE.TEXT', null, 'MSG.YES', 'MSG.NO')
    .mergeMap((res) => {
      return Observable.create((observer) => {
        if (res.isOk()) {
          this.showLoading(true);
          this.cmsService.deleteFavoriteSns(id).subscribe(() => {
            this.showLoading(false);
            this.dataList.splice(index, 1);
            observer.next();
          }, (r) => {
            this.showLoading(false);
            this.dialogService.showError('MSG.ERROR');
            observer.error();
          });
        }
      });
    }).mergeMap((res) => {
      return this.dialogService.showMessage('success', false, null, 'MSG.DELETED', null, 'MSG.OK', null, null);
    }).subscribe();
  }

  checkReadMore(index) {
    setTimeout(() => {
      const parentHeight = this.elementRef.nativeElement.querySelectorAll('.body-content')[index].offsetHeight;
      const mainHeight = this.elementRef.nativeElement.querySelectorAll('.body-text')[index].offsetHeight;
      if (parentHeight >= mainHeight) {
        this.dataList[index].isReadMoreBtn = false;
      } else {
        this.dataList[index].isReadMoreBtn = true;
      }
    });
  }

  readMore(index) {
    this.dataList[index].isReadMoreBtn = false;
    this.dataList[index].readMoreOver = true;
  }

  isAllLoading(): boolean {
    return this.dialogService.isLoaderVisible();
  }

  showLoading(flag: boolean) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(flag);
    });
  }

  gotoArticle(contents) {
    if (contents.messageId) {
      this.router.navigate(['/ch/ch0007', contents.containerId, contents.messageId]);
    }else if (contents.commentId) {
      this.router.navigate(['/gr/detail', contents.containerId, contents.articleId, contents.commentId]);
    } else {
      this.router.navigate(['/gr/detail', contents.containerId, contents.articleId]);
    }
  }

}
