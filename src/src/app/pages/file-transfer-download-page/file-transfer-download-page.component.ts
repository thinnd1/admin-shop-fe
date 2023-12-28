import { Component, OnInit } from '@angular/core';
import {DialogService} from '../../services/dialog.service';
import {ActivatedRoute} from '@angular/router';
import {FirebaseStorage} from '../../services/firebase/firebase.storage';
import {Observable} from 'rxjs/Observable';
import {GroupService} from '../../services/group.service';
import { saveAs } from 'file-saver/FileSaver';
import {TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-file-transfer-download-page',
  templateUrl: './file-transfer-download-page.component.html',
  styleUrls: ['./file-transfer-download-page.component.scss']
})
export class FileTransferDownloadPageComponent implements OnInit {

  fileApi: string;
  fileName: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private firebaseStorage: FirebaseStorage,
    private groupService: GroupService,
    private dialogService: DialogService,
    private titleService: Title,
    private translate: TranslateService
  ) {}


  ngOnInit() {
    this.translate.get('DOC_TITLE').subscribe((response) => {
      this.titleService.setTitle(response['FILE_DOWNLOAD']);
    });

    this.activatedRoute.params
      .mergeMap((param: any) => {
        return Observable.create((observer) => {
          const fileApi = param['fileApi'];
          const fileName = param['fileName'];
          if (fileApi && fileName) {
            this.fileApi = fileApi;
            this.fileName = decodeURI(fileName);
            observer.next();
          } else {
            observer.error();
          }
        });
      })
      .mergeMap(() => {
        return this.groupService.getDownloadFile(this.fileApi);
      })
      .subscribe((res: any) => {
        saveAs(res, this.fileName);
      }, () => {
        this.dialogService.showError('MSG.ERROR');
      });
  }

}
