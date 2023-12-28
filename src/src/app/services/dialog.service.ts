import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {SharedValueService} from './shared-value.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {Subject} from 'rxjs/Subject';
import {DialogParams, DialogResult} from '../models/dialog-param';
import {ModalSimpleComponent} from '../components/modal-simple/modal-simple.component';
import {ModalInputComponent} from '../components/modal-input/modal-input-component';
import {ModalCropperComponent} from '../components/modal-cropper/modal-cropper.component';
import {StaffDetailsPopupComponent} from '../components/staff-details-popup/staff-details-popup.component';
import {ModalAttachedComponent} from '../components/modal-attached/modal-attached.component';
import {ModalInputCustomComponent} from '../components/modal-input-custom/modal-input-custom.component';
import {ModalInputValidateComponent} from '../components/modal-input-validate/modal-input-validate.component';
import {ModalMemberListComponent} from '../components/modal-member-list/modal-member-list.component';
import {ModalFilePreviewComponent} from '../components/modal-file-preview/modal-file-preview.component';
import { saveAs } from 'file-saver/FileSaver';
import { FormatSizeConverter } from '../common/converter/format.size.converter';
import { HttpClient } from '@angular/common/http';
import {FirAttachments} from '../models/gr/firebase/fir.attachments';
import {PasswordInputComponent} from '../components/password-input/password-input.component';
import {ModalCheckboxComponent} from "../components/modal-checkbox/modal-checkbox.component";
import {ModalTextAreaComponent} from "../components/modal-input/modal-text-area-component";
import {PopupHover, PopupHoverResult} from "../models/popup-hover";
import { ModalInvitePharmacyStaffComponent } from "../components/modal-invite-pharmacy-staff/modal-invite-pharmacy-staff.component";
import {GroupService} from './group.service';
import {FileTransfer} from '../models/gr/fileTransfer';

declare var swal: any;

@Injectable()
export class DialogService {
  BUTTON_COLOR = '#EF8B00';
  private showLoader: boolean;

  private delaySec = 0;

  constructor(
    private translate: TranslateService,
    private sharedService: SharedValueService,
    private formatSizeConverter: FormatSizeConverter,
    private http: HttpClient,
    private groupService: GroupService) {
  }

  setLoaderVisible(flag: boolean) {
    this.showLoader = flag;
  }

  isLoaderVisible() {
    return this.showLoader;
  }

  showSimpleMessage(message: string) {
    return this.showMessage('info', false, null, message, null, 'MSG.OK', null);
  }

  showMessage(icon: string, closeButton: boolean, title: string, message: string, html: string, positiveButton: string, negativeButton: string, size?: string) {
    return this.showModal(icon, closeButton, title, message, html, positiveButton, negativeButton, ModalSimpleComponent, {}, null, size);
  }

  private showModal(icon: string, closeButton: boolean, title: string, message: string, html: string, positiveButton: string, negativeButton: string,
                    component: any, extraParams: any, type: string, size: string) {
    const blank = new Subject<string>();
    const subject = new Subject<DialogResult>();

    Observable.forkJoin(
      title ? this.translate.get(title).map(res => res) : blank,
      message ? this.translate.get(message).map(res => res) : blank,
      positiveButton ? this.translate.get(positiveButton).map(res => res) : blank,
      negativeButton ? this.translate.get(negativeButton).map(res => res) : blank
    ).subscribe(msgs => {
      // console.log(JSON.stringify(msgs));
      const dialog = new DialogParams(
        component,
        icon,
        closeButton,
        msgs[0],
        msgs[1],
        html,
        msgs[2],
        msgs[3],
        subject,
        extraParams,
        type,
        size
      );
      this.sharedService.showModal.next(dialog);
    });
    blank.next('');
    blank.complete();
    return subject;
  }

  showSuccess(message: string) {
    return this.showMessage('success', false, null, message, null, 'MSG.OK', null);
  }

  showError(message: string) {
    return this.showMessage('error', false, null, message, null, 'MSG.OK', null);
  }

  showInputDialog(message: string, initialValue: string) {
    return this.showModal(null, false, null, message, null, 'MSG.OK', 'MSG.CANCEL', ModalInputComponent, {initialValue: initialValue}, null, null);
  }

  showMessageSize(icon: string, closeButton: boolean, title: string, message: string, html: string, positiveButton: string,
                  negativeButton: string, type: string, size: string) {
    return this.showModal(icon, closeButton, title, message, html, positiveButton, negativeButton, ModalSimpleComponent, {}, type, size);
  }

  showInputPasswordDialog(html: string, object: any, type: string, size: string) {
    return this.showModal('warning', false, null, null, html, 'MSG.OK', 'MSG.CANCEL', PasswordInputComponent, {initialValue: object}, type, size);
  }

  showInputPaymentnameDialog(message: string, object: {theInput: string; placeholder: string; type: string, autocomplete: string}) {
    return this.showModal(null, false, null, message, null, 'MSG.OK', 'MSG.CANCEL', ModalInputValidateComponent, {initialValue: object}, null, null);
  }

  showCheckboxDialog(icon: string, closeButton: boolean, title: string, message: string, html: string, positiveButton: string,
                     negativeButton: string, object: any, type: string, size: string) {
    return this.showModal(icon, closeButton, title, message, html, positiveButton, negativeButton, ModalCheckboxComponent,
      {initialValue: object}, type, size);
  }

  showTextAreaMessageDialog(icon: string, closeButton: boolean, title: string, message: string, html: string, positiveButton: string,
                            negativeButton: string, initialValue: string, type: string, size: string) {
    return this.showModal(icon, closeButton, title, message, html, positiveButton, negativeButton, ModalTextAreaComponent,
      {initialValue: initialValue}, type, size);
  }

  showCropperDialog(closeButton: boolean, title: string, positiveButton: string, object: any) {
    return this.showModal(null, closeButton, title, null, null, positiveButton, 'MSG.CANCEL', ModalCropperComponent, { initialValue: object }, null, null);
  }

  showStaffDetailsDialog(isSelf, object) {
    const positiveButton = isSelf ? 'MSG.EDIT' : null;
    return this.showModal(null, true, null, null, null, positiveButton, 'MSG.CLOSE', StaffDetailsPopupComponent, { initialValue: object }, null, 'modal-lg');
  }

  showAttachedFilesDialog(object: {officeUserId: string; groupId: string, roomId: string, memberList: any[], listAttachments?: any[]}) {
    return this.showModal(null, true, 'ATTACHED_FILES.TITLE', null, null, null, 'MSG.CLOSE', ModalAttachedComponent, { initialValue: object }, 'bootstrap', 'modal-lg');
  }

  showInputCustomDialog(message: string, object: {theInput: string; placeholder: string; type: string, autocomplete: string, isConfirm: boolean, isCallApi: boolean, checkCallApi: boolean }) {
    return this.showModal(null, false, null, message, null, 'MSG.OK', 'MSG.CANCEL', ModalInputCustomComponent, {initialValue: object}, null, null);
  }

  showMemberListDialog(closeButton: boolean, title: string, positiveButton: string, negativeButton: string,
                       object: {groupId: string, userIds: string[], userInfo: any[], isShowOfficeName?: boolean,  mode?: string, roomType?: string}) {
    return this.showModal(null, closeButton, title, null, null, positiveButton, negativeButton, ModalMemberListComponent, {initialValue: object}, 'bootstrap', 'modal-lg');
  }
  showFilePreviewDialog(closeButton: boolean, positiveButton: string, negativeButton: string,
                        object: { groupId: string; roomId: string; officeUserId: string; contentsId: string; articleContentsId: string; fileId: string, fileList?: any[]}) {
    return this.showModal(null, true, null, null, null, positiveButton, negativeButton, ModalFilePreviewComponent, {initialValue: object}, 'bootstrap', 'modal-lg');
  }

  showPopupHoverDialog(title: string, time: string, user: string, note: string, place: string, jsEvent: any,
                       holiday: boolean, bntShow: boolean, defaultView: string) {
    const subject = new Subject<PopupHoverResult>();
    const blank = new Subject<string>();

    Observable.forkJoin(
      title ? this.translate.get(title).map(res => res) : blank,
    ).subscribe(msgs => {
      const popupHover = new PopupHover(msgs[0], time, user, note, place, jsEvent, holiday, bntShow, subject, defaultView);

      this.sharedService.showPopupHover.next(popupHover);
    });
    blank.next('');
    blank.complete();
    return subject;
  }

  showHolidayPopupHoverDialog(title: string, time: string, jsEvent: any, defaultView: string) {
    return this.showPopupHoverDialog(title, time, null, null, null, jsEvent, true, false, defaultView);
  }

  showEditPopupHoverDialog(title: string, time: string, user: string, note: string, place: string, jsEvent: any, bntShow, defaultView: string) {
    return this.showPopupHoverDialog(title, time, user, note, place, jsEvent, false, bntShow, defaultView);
  }

  // 擬似close
  hideDialog(reOpenDialogName: string) {
    return Observable.create(observer => {
      if (reOpenDialogName) {
        (<any>$('#theModal')).modal('hide');
      }
      setTimeout(() => {
        observer.next();
        observer.complete();
      }, this.delaySec);
    });
  }

  // 添付ファイル転送 複数モーダル
  showForwardFileDialog(name: string, size: number, path?: string, reOpenDialogName?: string, params?: any[]) {
    const subject = new Subject();
    const fileNameSize = name + '(' + this.formatSizeConverter.formatSizeUnits(size) + ')';
    let forwardingAddress: string;
    let email: string;

    this.translate.get('MSG.ATTACHED_FILES.FORWARDING_ADDRESS')
    .mergeMap((res) => {
      forwardingAddress = res;
      return this.hideDialog(reOpenDialogName);
    })
    .mergeMap((res) => {
      const param = {
        theInput: '',
        placeholder: 'MSG.ATTACHED_FILES.PLACEHOLDER',
        type: 'email',
        autocomplete: 'on',
        isConfirm: true,
        isCallApi: false,
        checkCallApi: true
      };
      return this.showInputCustomDialog('MSG.ATTACHED_FILES.CONFIRM_EMAIL', param);
    })
    .delay(this.delaySec)
    .mergeMap((res) => {
      return Observable.create(observer => {
        if (res.buttonName === 'ok') {
          if (res.payload && res.payload.input && res.payload.error === false) {
            email = res.payload.input;
            observer.next(res.payload.input);
          } else {
            this.showMessage('error', false,  null, 'MSG.ATTACHED_FILES.CANCELED', null, 'MSG.OK', null)
            .delay(this.delaySec)
            .subscribe((r) => {
              if (reOpenDialogName) {
                this[reOpenDialogName].apply(this, params);
              }
              observer.complete();
            });
          }
        } else {
          if (reOpenDialogName) {
            this[reOpenDialogName].apply(this, params);
          }
          observer.complete();
        }
      });
    })
    .mergeMap((res) => {
      const message = forwardingAddress + res + '\n' + fileNameSize;
      return this.showMessage('warning', false, 'MSG.ATTACHED_FILES.CONFIRM_SEND', message, null, 'MSG.YES', 'MSG.NO');
    })
    .delay(this.delaySec)
    .mergeMap((res) => {
      return Observable.create(observer => {
        if (res.buttonName === 'ok') {
          observer.next();
        } else {
          if (reOpenDialogName) {
            this[reOpenDialogName].apply(this, params);
          }
          observer.complete();
        }
      });
    })
    .mergeMap((res) => {
      const filetransfer: FileTransfer = {
        email: email,
        path: path
      };
      setTimeout(() => {
        this.setLoaderVisible(true);
      });
      return this.groupService.postFileTransfer(filetransfer);
    })
    .mergeMap((res) => {
      setTimeout(() => {
        this.setLoaderVisible(false);
      });
      return this.showMessage('success', false, 'MSG.SENT', null, null, 'MSG.OK', null);
    })
    .delay(this.delaySec)
    .subscribe((res) => {
      if (reOpenDialogName) {
        this[reOpenDialogName].apply(this, params);
      }
      subject.next();
      subject.complete();
    });
    return subject;
  }

  // ダウンロード どこかのserviceに移動させたい
  showDownloadDialog(name: string, api: string) {
    const subject = new Subject();
    this.http.get(api, { observe: 'response', responseType: 'blob' }).subscribe(res => {
      saveAs(res.body, name);
      subject.next();
      subject.complete();
    });
    return subject;
  }

  // 添付ファイル削除 複数モーダル
  showDeleteDialog(file: FirAttachments, reOpenDialogName?: string, params?: any[]) {
    const self = this;
    const subject = new Subject();
    const fileNameSize = file.name + '(' + this.formatSizeConverter.formatSizeUnits(file.size) + ')';

    this.hideDialog(reOpenDialogName)
    .mergeMap((res) => {
      return this.showMessage('warning', false, 'MSG.ATTACHED_FILES.CONFIRM_DELETE', fileNameSize, null, 'MSG.YES', 'MSG.NO');
    })
    .delay(this.delaySec)
    .mergeMap((res) => {
      return Observable.create(observer => {
        if (res.buttonName === 'ok') {
          if (params && params[0].groupId) {
            this.setLoaderVisible(true);
            this.groupService.deleteAttachedFile(file.fileId, params[0].groupId).subscribe(response => {
              this.setLoaderVisible(false);
              observer.next();
            }, error => {
              this.setLoaderVisible(false);
              this.showMessage('error', false, 'MSG.ERROR', null, null, 'MSG.OK', null)
                .delay(this.delaySec)
                .subscribe((r) => {
                  if (reOpenDialogName) {
                    this[reOpenDialogName].apply(this, params);
                  }
                  observer.complete();
                });
            });
          } else if (params && params[0].roomId) {
            this.sharedService.setRemoveAttachment(file.fileId);
          }
        } else {
          if (reOpenDialogName) {
            this[reOpenDialogName].apply(this, params);
          }
          observer.complete();
        }
      });
    })
    .mergeMap((res) => {
      return this.showMessage('success', false, 'MSG.DELETED', null, null, 'MSG.OK', null);
    })
    .delay(this.delaySec)
    .subscribe((res) => {
      if (reOpenDialogName) {
        this[reOpenDialogName].apply(this, params);
      }
      subject.next();
      subject.complete();
    });
    return subject;
  }

  showInvitePharmacyStaffDialog(closeButton: boolean, title: string, positiveButton: string, object: any) {
    return this.showModal(null, closeButton, title, null, null, positiveButton, null, ModalInvitePharmacyStaffComponent, { initialValue: object }, 'bootstrap', 'modal-lg');
  }

}
