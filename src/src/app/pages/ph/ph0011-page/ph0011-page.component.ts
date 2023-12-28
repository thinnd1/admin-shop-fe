import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MasterService} from '../../../services/master.service';
import {DialogService} from '../../../services/dialog.service';
import {TranslateService} from '@ngx-translate/core';
import {HttpStatus} from '../../../common/http.status';
import {PharmacyService} from '../../../services/pharmacy.service';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';
import {SharedValueService} from '../../../services/shared-value.service';
import {UserSession} from '../../../models/ba/user-session';
import {Observable} from 'rxjs/Observable';

declare const $: any;
declare var moment: any;

@Component({
  selector: 'app-ph0011-page',
  templateUrl: './ph0011-page.component.html',
  styleUrls: ['./ph0011-page.component.scss']
})
export class Ph0011PageComponent implements OnInit, AfterViewInit {
  reportId: string;
  reportInfo: any = {};
  const: any = {};
  listAttachments: any[] = [];
  progress = 0;
  userSession: UserSession;
  isHospital: boolean;

  constructor(private pharmacyService: PharmacyService,
              private dialogService: DialogService,
              private router: Router,
              private shareValue: SharedValueService,
              private activatedRoute: ActivatedRoute,
              private translate: TranslateService,
              private firebaseStorage: FirebaseStorage) {
    this.setConstant();
    this.isHospital = this.router.url.indexOf('ph0003') >= 0;
  }

  ngOnInit() {
    this.userSession = this.shareValue.getUserSession();
    this.activatedRoute
      .queryParams
      .subscribe(params => {
        this.reportId = params['reportId'];
      });
    this.getTracingReport();
  }

  ngAfterViewInit() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  setConstant() {
    this.const = {
      attachmentPath: '/pharmacy/tracingReport',
    };
  }

  getTracingReport() {
    this.dialogService.setLoaderVisible(true);
    this.pharmacyService.getTracingReport(this.reportId).subscribe((report) => {
      this.dialogService.setLoaderVisible(false);
      this.reportInfo = report;
      this.progress = 0;
    }, (error: HttpStatus) => {
      this.dialogService.setLoaderVisible(false);
      this.dialogService.showError('MSG.ERROR');
    });
  }

  createComment($event) {
    this.uploadCommentAttachments($event.attachments).subscribe((list) => {
      const fileIds = list.map(file => file.file.id);
      this.callPostApi({content: $event.content, fileIds: fileIds});
    });
  }

  getProgress(files) {
    let progress = 0;
    for (let i = 0; i < files.length; i++) {
      progress += files[i].progress;
    }
    if (files.length === 0 || progress / files.length === 100) {
      progress = 99;
    }
    this.progress = progress;
  }

  uploadCommentAttachments(attachments): Observable<any> {
    return Observable.create(subscribe => {
      if (attachments.length === 0) {
        this.progress = 99;
        subscribe.next([]);
      }
      this.dialogService.setLoaderVisible(true);
      this.firebaseStorage.uploader.pharmacyComment(`tracingReport`, this.reportInfo.firebaseStorageTopicPath, this.userSession.officeUserId, attachments)
        .subscribe((files) => {
          this.dialogService.setLoaderVisible(false);
          this.getProgress(files);
          if (this.progress === 99) {
            subscribe.next(files);
          }
        }, (err) => {
          this.dialogService.setLoaderVisible(false);
          this.dialogService.showError('MSG.ERROR');
          subscribe.error(err);
        });
    });
  }

  callPostApi($event) {
    this.dialogService.setLoaderVisible(true);
    this.pharmacyService.postCreateComment({content: $event.content, topicId: this.reportId, fileIds: $event.fileIds})
      .subscribe((res) => {
        this.dialogService.setLoaderVisible(false);
        this.progress = 100;
        this.getTracingReport();
      }, (error: HttpStatus) => {
        this.dialogService.setLoaderVisible(false);
        this.dialogService.showError('MSG.ERROR');
      });
  }

  printPage() {
    const css = '@page {size:A4;margin: 50px 0;}';
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
