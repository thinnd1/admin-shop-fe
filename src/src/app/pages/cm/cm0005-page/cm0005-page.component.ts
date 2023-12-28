import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationExtras, Params, Router} from '@angular/router';
import {DialogService} from '../../../services/dialog.service';
import {DateConverter} from '../../../common/converter/date.converter';
import {Observable} from 'rxjs/Observable';
import {SharedValueService} from '../../../services/shared-value.service';
import {TranslateService} from '@ngx-translate/core';
import {FormGroup} from '@angular/forms';
import {Cm0005PageValidator} from '../../cm/cm0005-page/cm0005-page.validator';
import {LSelect2Component} from 'ngx-select2';
import {DomSanitizer} from '@angular/platform-browser';
import {Helper} from '../../../common/helper';
import {PageStatus} from '../../../models/cm/page.status';
import {CmsService} from '../../../services/cms.service';
import {InfoInput} from '../../../models/cm/info-input';
import {SentOfficeInfo} from '../../../models/cm/sent-office-info';
import {SentOfficeInfoDetail} from '../../../models/cm/sent-office-info-detail';
import {Office} from '../../../models/cm/office';
import {UserSession} from '../../../models/ba/user-session';
import {CanComponentDeactivate} from '../../../guards/beforeunload.guard';
import {DialogResult} from '../../../models/dialog-param';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';
import {Metadata} from '../../../models/firebase/firebase.metadata';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-cm0005-page',
  templateUrl: './cm0005-page.component.html',
  styleUrls: ['./cm0005-page.component.scss'],
  providers: [Cm0005PageValidator]
})
export class Cm0005PageComponent implements OnInit, CanComponentDeactivate {

  @ViewChild('tableData') tableData: ElementRef;
  @ViewChild('select2') select2: LSelect2Component;

  private dataList: SentOfficeInfo[];
  public detailData: SentOfficeInfoDetail;
  public pageStatus = PageStatus;
  public currentPage = PageStatus.Top;
  private infoId: string;
  private isLoading = true;
  private select2Options: any;
  private searchOptions: InfoInput;
  private industryTypes: string[];
  private officesData = [];
  private translate: any;
  private newInfoForm: FormGroup;

  private attachments = [];
  private windowURL = ((<any>window).URL || (<any>window).webkitURL);
  private checkStatusEdit = false;
  private userSession: UserSession;

  public detailAttachments: { path?: string; meta?: Metadata; }[] = [];
  public detailAttachmentsImageFlag = false;

  constructor(
    private dateConverter: DateConverter,
    private router: Router,
    private dialogService: DialogService,
    private activatedRoute: ActivatedRoute,
    private sharedValueService: SharedValueService,
    private translateService: TranslateService,
    private cm0005PageValidator: Cm0005PageValidator,
    private domSanitizer: DomSanitizer,
    private helper: Helper,
    private cmsService: CmsService,
    private firebaseStorage: FirebaseStorage,
    private titleService: Title
  ) {
  }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    this.translateService.get('CM0005').mergeMap((res) => {
      this.translate = res;
      this.select2Options = {
        multiple: true,
        closeOnSelect: false,
        placeholder: this.translate['CM0005-2']['TOP']['SECTION2']['PLACEHOLDER1'],
        language: {
          noResults: () => {
            return this.translate['CM0005-2']['TOP']['SECTION2']['NORESULT'];
          }
        }
      };
      return this.activatedRoute.params;
    }).subscribe((params: Params) => {

      this.searchOptions = new InfoInput();
      this.infoId = params['infoId'];
      this.industryTypes = this.sharedValueService.getIndustryTypes();
      this.newInfoForm = this.cm0005PageValidator.setNewInfoForm(this.industryTypes);

      this.newInfoForm.valueChanges.subscribe((value) => {
        if (this.newInfoForm.dirty) {
          this.checkStatusEdit = true;
        }
      });

      this.newInfoForm.get('offices').valueChanges.subscribe((value) => {
        this.selectOffice();
      });

      if (this.infoId) {
        this.titleService.setTitle(this.translateService.instant('DOC_TITLE.CM0005_DETAIL'));
        this.currentPage = PageStatus.Detail;
        this.showDetailPage();
      } else if (this.router.url === '/cm/cm0005/new') {
        this.titleService.setTitle(this.translateService.instant('DOC_TITLE.CM0005_NEW'));
        this.currentPage = PageStatus.New;
        this.showNewPage();
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

  onNewInfoSubmit() {
    if (this.newInfoForm.invalid) {
      Object.keys(this.newInfoForm.controls).forEach((val, idx) => {
        this.newInfoForm.get(val).markAsDirty();
      });
      return false;
    }
    this.gotoConfirm();
  }

  onNewInfoSend() {
    const attachmentFileIds = [];
    this.showLoading(true);
    if (this.attachments && this.attachments.length) {
      this.firebaseStorage.uploader
        .officeInfo(this.userSession.officeUserId, this.userSession.officeId, this.attachments)
        .subscribe((res) => {
          res.subscribe((r) => {
              if (r.done) {
                attachmentFileIds.push(r.file.id);
              }
            },
            err => {},
            () => {
              this.completeInfoSend(attachmentFileIds);
            }
          );
        });
    } else {
      this.completeInfoSend(attachmentFileIds);
    }
  }

  completeInfoSend(attachmentFileIds) {
    const model = this.cm0005PageValidator.mapModel(this.newInfoForm.value, this.officesData, attachmentFileIds);
    this.cmsService.postOfficeInfo(model)
      .subscribe((r) => {
      }, () => {
        this.showLoading(false);
        this.dialogService.showError('MSG.ERROR');
      }, () => {
        this.showLoading(false);
        this.attachments.forEach((val) => {
          if (val.imgURL) {
            this.windowURL.revokeObjectURL(val.imgURL);
          }
        });
        this.dialogService.showMessage('success', false, null, 'MSG.SENT', null, 'MSG.OK', null, null)
          .subscribe((r) => {
            this.checkStatusEdit = false;
            this.gotoTop();
          });
      });
  }

  isError(formControl): boolean {
    return formControl.invalid && (formControl.dirty || formControl.touched);
  }

  isErrorIndustries(): boolean {
    return this.newInfoForm.get('industries').invalid;
  }

  onFileChange(event: any) {
    const files = event.target.files;
    if (!(files && files.length > 0)) {
      return;
    }
    this.checkStatusEdit = true;
    for (let i = 0; i < files.length; i++) {
      let imgURL = null;
      if (this.helper.checkFileOrImage(files[i])) {
        imgURL = this.domSanitizer.bypassSecurityTrustUrl(this.windowURL.createObjectURL(files[i]));
      }
      this.attachments.push({file: files[i], imgURL: imgURL});
    }
    this.newInfoForm.get('files').setValue(this.attachments);
    this.newInfoForm.get('files').markAsDirty();
  }

  loadAttachmentsImage($event, attachment) {
    if (attachment.imgURL) {
      attachment.width = $event.currentTarget.width;
      attachment.height = $event.currentTarget.height;
    }
  }

  checkAttachmentsImage(): boolean {
    return this.attachments.some((val) => {
      return val.imgURL;
    });
  }

  checkAttachmentsFile(): boolean {
    return this.attachments.some((val) => {
      return !val.imgURL;
    });
  }

  removeAttachment(index) {
    this.windowURL.revokeObjectURL(this.attachments[index].imgURL);
    this.attachments.splice(index, 1);
    this.newInfoForm.get('files').setValue(this.attachments);
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
    console.log(this.searchOptions);
    this.cmsService.getSentOfficeInfo(this.searchOptions).subscribe((res: SentOfficeInfo[]) => {
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
    this.router.navigate(['/cm/cm0005'], extras);
  }

  getDetailItem() {
    this.showLoading(true);
    this.cmsService.getSentOfficeInfoDetail(this.infoId)
      .subscribe((res: SentOfficeInfoDetail) => {
      if (res) {
        this.detailData = res;
        Observable.merge(
          this.cmsService.putOfficeInfoRead([this.infoId]),
          this.getOfficeAttachedFiles(this.userSession.officeId, res.attachmentFileIds)
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

  getOfficesData() {
    const industries = this.cm0005PageValidator.getIndustries(this.newInfoForm.get('industries').value);
    this.cmsService.getOffice(industries).subscribe((res: Office[]) => {
      this.officesData = [];
      this.officesData.push({ id: '', text: '' });
      this.officesData.push({ id: 'ALL', text: this.translate['LABEL']['ALL'] });
      res.forEach((val, idx) => {
        this.officesData.push({id: val.id, text: val.name});
      });
      const selectedOffice = this.newInfoForm.get('offices').value;
      if (selectedOffice) {
        const newSelectedOffice = [];
        selectedOffice.forEach((val, idx) => {
          this.officesData.forEach((v, i) => {
            if (val.id === v.id) {
              newSelectedOffice.push(val);
            }
          });
        });
        this.newInfoForm.get('offices').setValue(newSelectedOffice);
      }
    }, (res) => {
      this.dialogService.showError('MSG.ERROR');
    });
  }

  countedOffice() {
    const count = this.officesData.filter(val => {
      return (val.id && val.id !== 'ALL');
    }).length;
    return count;
  }

  clearAllSelectedOffices() {
    this.newInfoForm.get('offices').setValue([]);
  }

  clearSelectedOffice(index) {
    const value = this.newInfoForm.get('offices').value;
    value.splice(index, 1);
    this.newInfoForm.get('offices').setValue(value);
  }

  selectOffice() {
    const selectOffices = this.newInfoForm.get('offices').value;
    const allFlag = selectOffices.some(val => val.id === 'ALL');
    if (allFlag) {
      const offices = this.officesData.filter((val, idx) => {
        return (val.id && val.id !== 'ALL');
      });
      this.newInfoForm.get('offices').setValue(offices);
      (<any>$(this.select2.selectControll.nativeElement)).select2('close');
    }
  }

  showDetailPage() {
    this.getDetailItem();
  }

  showNewPage() {
    this.getOfficesData();
  }

  showTopPage() {
    this.resetTopItem();
  }

  changeAllIndustry(checked: boolean) {
    this.newInfoForm.get('industries').setValue(
      this.newInfoForm.get('industries').value.map(x => checked)
    );
    this.getOfficesData();
  }

  changeIndustry() {
    const falseChecked = this.newInfoForm.get('industries').value.some(val => val === false );
    if (falseChecked) {
      this.newInfoForm.get('industryAll').setValue(false);
    } else {
      this.newInfoForm.get('industryAll').setValue(true);
    }
    this.getOfficesData();
  }

  onRemove(infoId: string) {
    this.dialogService
      .showMessage('warning', false, 'CM0005.MSG.DELETE_ARTICLE.TITLE', 'CM0005.MSG.DELETE_ARTICLE.TEXT', null, 'MSG.YES', 'MSG.NO')
      .mergeMap((res) => {
        return Observable.create(observer => {
          if (res.isOk()) {
            this.showLoading(true);
            this.cmsService.deleteOfficeInfo(infoId).subscribe((r) => {
              this.showLoading(false);
              observer.next();
              observer.complete();
            }, (r) => {
              this.showLoading(false);
              this.dialogService.showError('MSG.ERROR');
              observer.error();
            });
          }
        });
      })
      .mergeMap(() => {
        return this.dialogService.showMessage('success', false, null, 'MSG.DELETED', null, 'MSG.OK', null);
      })
      .subscribe(() => {
        this.gotoTop();
      });
  }

  gotoDetail(id) {
    this.router.navigate(['cm/cm0005', id]);
  }

  gotoTop() {
    this.router.navigate(['cm/cm0005']);
  }

  gotoNew() {
    this.router.navigate(['cm/cm0005/new']);
  }

  gotoConfirm() {
    this.currentPage = PageStatus.Confirm;
  }

  gotoBack() {
    this.currentPage = PageStatus.New;
  }

  gotoHelp() {
    this.router.navigate(['he/he0009']);
  }

  // Event check reload page
  @HostListener('window:beforeunload', ['$event']) checkLoadPage(event) {
    if (this.checkStatusEdit) {
      const message = 'Are you sure you want leave?';
      event.returnValue = message;
      return message;
    }
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.checkStatusEdit) {
      return Observable.create((observer) => {
        this.dialogService
          .showMessage('warning', false, 'CM0005.MSG.CLOSE_EDIT.TITLE', 'CM0005.MSG.CLOSE_EDIT.TEXT', null, 'MSG.OK', 'MSG.CANCEL')
          .subscribe((res) => {
            if (res.isOk()) {
              observer.next(true);
            } else {
              (<any>window).history.pushState({}, '', this.activatedRoute.snapshot.url);
              observer.next(false);
            }
          });
      });
    } else {
      return true;
    }
  }



}
