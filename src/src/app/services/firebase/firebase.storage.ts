import {Injectable, OnDestroy} from '@angular/core';
import {FirebaseService} from './firebase.service';
import {AuthenticationService} from '../authentication.service';
import * as sha256 from 'sha256';
import * as firebase from 'firebase';
import {NGXLogger} from 'ngx-logger';
import {Observable} from 'rxjs/Observable';
import {isNullOrUndefined} from 'util';
import {ICustomMetadata, Metadata} from '../../models/firebase/firebase.metadata';
import {Subscriber} from 'rxjs/Subscriber';
import {AuthenticationMessage} from '../message.service';
import 'rxjs/add/observable/merge';
import Reference = firebase.storage.Reference;

/**
 * @author k.sumi 2017/09/23
 */
export interface Progress {
  file: { id: string, name: string, size: number, type?: string, customMetadata?: any};
  progress?: number;
  done: boolean;
  url?: string;
}

/**
 * @author k.sumi 2017/09/23
 */
@Injectable()
export class FirebaseStorage implements OnDestroy {

  // Variables
  // --------------------------------------------------------------------------
  // Uploader
  readonly uploader: FirebaseStorage.Uploader;
  private _imageHistory = {};
  // Helper methods
  // --------------------------------------------------------------------------
  static precondition(...args: string[]): Observable<any> {
    for (const arg in args) {
      if (isNullOrUndefined(arg)) {
        return Observable.throw(`illegal arguments: ${args}`);
      }
    }
    return null;
  }

  // Constructor
  // --------------------------------------------------------------------------
  constructor(private fb: FirebaseService,
              private auth: AuthenticationService,
              private authMessage: AuthenticationMessage,
              private logger: NGXLogger) {
    this.logger.debug('*** Initialize firebase storage service');
    // Uploader
    this.uploader = new FirebaseStorage.Uploader(fb, logger);
  }

  // Overrided methods
  // --------------------------------------------------------------------------
  ngOnDestroy(): void {
  }

  ref(path: string): Reference {
    return this.fb.storage().ref(path);
  }

  // Get Download URL
  // --------------------------------------------------------------------------
  faceImageURL(officeId: string, officeUserId: string): Observable<string> {
    const throwable = FirebaseStorage.precondition(officeId, officeUserId);
    if (throwable) {
      return throwable;
    }
    // TODO: 元に戻すこと
    // const path = `/img/staff/face/${officeId}/original_${officeUserId}`;
    const path = `/img/staff/face/${officeId}/${officeUserId}`;
    // this.logger.debug('[URL] face.image=', path);
    return this.downloadURL(path);
  }

  faceImageOriginURL(officeId: string, officeUserId: string, prefix?): Observable<string> {
    const throwable = FirebaseStorage.precondition(officeId, officeUserId);
    if (throwable) {
      return throwable;
    }
    if (!prefix) {
      prefix = 'original';
    }
    const path = `/img/staff/face/${officeId}/` + prefix + `_${officeUserId}`;
    // const path = `/img/staff/face/${officeId}/${officeUserId}`;
    this.logger.debug('[URL] face.image=', path);
    return this.downloadURL(path);
  }

  groupIcon(groupId: string, isReload = false): Observable<string> {
    const throwable = FirebaseStorage.precondition(groupId);
    if (throwable) {
      return throwable;
    }
    return this.downloadURL(`/group/${groupId}/icon.png`, isReload);
  }

  // 事業所からのお知らせ
  officeAttachedFiles(fromOfficeId: string, attachmentFileId: string): Observable<string> {
    const throwable = FirebaseStorage.precondition(fromOfficeId, attachmentFileId);
    if (throwable) {
      return throwable;
    }
    return this.downloadURL(`/office/info/${fromOfficeId}/${attachmentFileId}`);
  }

  downloadURL(ref: string, reload?: boolean): Observable<string> {
    if (!reload && this._imageHistory[ref]) {
      return Observable.create((subscriber) => {
        subscriber.next(this._imageHistory[ref]);
        subscriber.complete();
      });
    }

    return Observable.create((subscriber) => {
      this.fb.storage().ref(ref).getDownloadURL().then((url: string) => {
        this._imageHistory[ref] = url;
        subscriber.next(this._imageHistory[ref]);
        subscriber.complete();

      }).catch((error) => {
        // TODO:k.sumi 仮実装
        subscriber.error(error);
      });
    });
  }

  deleteImageUrl(name: any) {
    this.ref(name).delete();
  }

  // Get metadata
  // --------------------------------------------------------------------------
  metadataGroup(groupId: string, fileId: string): Observable<Metadata> {
    const throwable = FirebaseStorage.precondition(groupId, fileId);
    if (throwable) {
      return throwable;
    }
    return this.metadata(`/group/${groupId}/${fileId}`);
  }

  metadataChat(roomId: string, fileId: string): Observable<Metadata> {
    const throwable = FirebaseStorage.precondition(roomId, fileId);
    if (throwable) {
      return throwable;
    }
    return this.metadata(`/chat/${roomId}/${fileId}`);
  }

  metadataMeeting(officeId: string, fileId: string): Observable<Metadata> {
    const throwable = FirebaseStorage.precondition(officeId, fileId);
    if (throwable) {
      return throwable;
    }
    return this.metadata(`/meeting/rules/${officeId}/${fileId}`);
  }

  metadataPharmacy(path, entityId, fileId): Observable<Metadata> {
    const throwable = FirebaseStorage.precondition(path, entityId, fileId);
    if (throwable) {
      return throwable;
    }
    return this.metadata(`/pharmacy/${path}/${entityId}/${fileId}`);
  }

  metadataStamp(path: string): Observable<Metadata> {
    const throwable = FirebaseStorage.precondition(path);
    if (throwable) {
      return throwable;
    }
    return this.metadata(`${path}`);
  }

  // 事業所からのお知らせ
  metadataOfficeAttachedFiles(fromOfficeId: string, attachmentFileId: string): Observable<Metadata> {
    const throwable = FirebaseStorage.precondition(fromOfficeId, attachmentFileId);
    if (throwable) {
      return throwable;
    }
    return this.metadata(`/office/info/${fromOfficeId}/${attachmentFileId}`);
  }

  metadata(ref: string): Observable<Metadata> {
    return Observable.create((subscriber) => {
      this.fb.storage().ref(ref).getMetadata().then((data: any) => {
        subscriber.next(new Metadata(data));
        subscriber.complete();

      }).catch((error) => {
        // TODO:k.sumi 仮実装
        subscriber.error(error);
      });
    });
  }
}

/**
 * Firebase Storage inner class.
 *
 * @author k.sumi
 */
export namespace FirebaseStorage {

  import TaskEvent = firebase.storage.TaskEvent;
  import UploadTaskSnapshot = firebase.storage.UploadTaskSnapshot;
  import TaskState = firebase.storage.TaskState;

  /**
   * Firebase Storage Uploader.
   */
  export class Uploader {

    // Constructor
    // ------------------------------------------------------------------------
    constructor(private fb: FirebaseService, private logger: NGXLogger) {
    }

    // Public methods
    // ------------------------------------------------------------------------
    faceImage(file: File): Observable<Progress> {
      const uid = '111';
      const officeId = 1; // TODO: 正しいオフィスIDを設定する
      return this.upload(file, `/img/staff/face/${officeId}/${sha256(uid)}`, file.name, {
        // owner: uid,
        name: file.name,
      });
    }

    meRule(officeId: string, officeUserId: string, fileId: string, file: File) {
      return this.upload(file, `/meeting/rules/${officeId}`, fileId, {
        owner: officeUserId,
        name: file.name,
      });
    }

    groupIcon(groupId: string, officeUserId: string, file: File): Observable<Progress> {
      return this.upload(file, `/group/${groupId}`, 'icon.png', {
        owner: officeUserId,
        name: file.name,
        gid: groupId,
      });
    }

    group(groupId: string, officeUserId: string, files): Observable<Observable<Progress>> {
      let unixtime = new Date().getTime();
      const observables: Observable<Progress>[] = files.map((file) => {
        return Observable.create(observe => {
          const id = sha256(`${groupId}${unixtime}`);
          unixtime += 1;
          this.upload(file, `/group/${groupId}`, id, {
            owner: officeUserId,
            name: file.name,
            gid: groupId
          }).subscribe(data => {
            observe.next(data);
          }, error => {
            observe.error(error);
          });
        });
      });
      return Observable.merge(observables);
    }

    pharmacyComment(path, entityId, officeUserId, files): Observable<any> {
      let unixtime = new Date().getTime();
      const listReq = files.map(file => {
        const id = sha256(`${entityId}${officeUserId}${unixtime}`);
        unixtime += 1;
        return this.upload(file, `/pharmacy/${path}/${entityId}`, id, {
          owner: officeUserId,
          name: file.name,
        });
      });
      return Observable.forkJoin(listReq);
    }

    pharmacy(path, entityId, officeUserId, files): Observable<any> {
      let unixtime = new Date().getTime();
      const listReq = files.map(file => {
        const id = sha256(`${entityId}${officeUserId}${unixtime}`);
        unixtime += 1;
        return this.upload(file, `/pharmacy/${path}/${entityId}`, id, {
          owner: officeUserId,
          name: file.name,
        });
      });
      return Observable.forkJoin(listReq);
    }

    re(officeId: string, officeUserId: string, registOfficeUserId: string, file) {
      return this.upload(file, `/img/staff/face/${officeId}`,  officeUserId, {
        owner: registOfficeUserId,
        name: file.name,
      });
    }

    re_personal(officeId: string, officeUserId: string, registOfficeUserId: string, prefix: string, file) {
      if (!prefix) {
        prefix = 'personal';
      } else if (prefix === 'firstImage1') {
        prefix = '1_front';
      } else if (prefix === 'lastImage1') {
        prefix = '1_back';
      } else if (prefix === 'firstImage2') {
        prefix = '2_front';
      } else if (prefix === 'lastImage2') {
        prefix = '2_back';
      }
      return this.upload(file, `/img/staff/identification/${officeId}/${officeUserId}`, prefix, {
        owner: registOfficeUserId,
        name: file.name,
      });
    }

    re_identification(officeId: string, officeUserId: string, registOfficeUserId: string, file) {
      return this.upload(file, `/img/staff/identifier/pr/${officeId}`, officeUserId, {
        owner: registOfficeUserId,
        name: file.name,
      });
    }

    chat(roomId: string, officeUserId: string, file: File): Observable<Progress> {
      const unixtime = new Date().getTime();
      const id = sha256(`${roomId}${unixtime}`);
      return this.upload(file, `/chat/${roomId}`, id, {
        owner: officeUserId,
        name: file.name,
        cid: roomId,
      });
    }

    officeInfo(officeUserId: string, fromOfficeId: string, files): Observable<Observable<Progress>> {
      let unixtime = new Date().getTime();
      let count = 0;
      const observables: Observable<Progress>[] = files.map((file) => {
        return Observable.create(observe => {
          const id = sha256(`${file.file.name}${unixtime}`);
          unixtime += 1;
          this.upload(file.file, `/office/info/${fromOfficeId}`, id, {
            owner: officeUserId,
            name: file.file.name,
            width: file.width,
            height: file.height
          }).subscribe(data => {
            if (data.done) {
              observe.next(data);
              count++;
            }
            if (files.length === count) {
              observe.complete();
            }
          });
        });
      });
      return Observable.merge(observables);
    }

    upload(file: File, ref: string, id: string, customMetadata: ICustomMetadata): Observable<Progress> {
      return Observable.create((subscriber: Subscriber<Progress>) => {
        if (file.type.startsWith('image')) {
          this.obtainImageSize(file, (width: number, height: number) => {
            customMetadata.width = width;
            customMetadata.height = height;
            // upload task
            if (file['_thumb']) {
              const thumbMetadata = this.getThumbnailMetadata(customMetadata, file['_thumb'], 'image');
              this.uploadTask(file['_thumb'], ref, 'thumb_' + id, thumbMetadata, new Subscriber());
            }
            this.uploadTask(file, ref, id, customMetadata, subscriber);
          });
        } else if (file.type.startsWith('video')) {
          this.obtainVideoSize(file, (width: number, height: number) => {
            customMetadata.width = width;
            customMetadata.height = height;
            // upload task
            if (customMetadata.gid || customMetadata.cid) {
              this.extractFrameVideo(file, ref, 'thumb_' + id, customMetadata, new Subscriber());
            }
            this.uploadTask(file, ref, id, customMetadata, subscriber);
          });
        } else {
          // upload task
          this.uploadTask(file, ref, id, customMetadata, subscriber);
        }
      });
    }

    // Private
    // ------------------------------------------------------------------------
    private uploadTask(file: File, ref: string, id: string, customMetadata: {}, subscriber: Subscriber<Progress>) {
      // create upload task
      const task = this.fb.storage().ref(`${ref}/${id}`).put(file, {
        customMetadata: customMetadata,
      });
      // manage upload event
      task.on(TaskEvent.STATE_CHANGED, (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        switch (snapshot.state) {
          case TaskState.PAUSED:
            this.logger.info('Upload is paused'); // TODO 動作確認が必要
            break;
          case TaskState.RUNNING:
            subscriber.next({
              file: {id: id, name: file.name, size: file.size},
              progress: Math.floor(progress),
              done: false,
            });
            break;
        }

      }, (error) => {
        // error
        subscriber.error(error); // TODO エラー判定を行う

      }, () => {
        // complete
        subscriber.next({
          file: {id: id, name: file.name, size: file.size, type: file.type, customMetadata: customMetadata},
          progress: 100,
          done: true,
          url: task.snapshot.downloadURL
        });
        subscriber.complete();
      });
    }

    // Helper
    // ------------------------------------------------------------------------
    private obtainImageSize(file: File, complete: (width: number, height: number) => void) {
      const u = URL.createObjectURL(file);
      const img = new Image;
      img.onload = function () {
        const width = file['width'] ?  file['width'] : img.naturalWidth;
        const height = file['height'] ?  file['height'] : img.naturalHeight;
        complete(width, height);
      };

      img.src = u;
    }

    private obtainVideoSize(file: File, complete: (width: number, height: number) => void) {
      const videoElement = document.createElement('video');
      const url = URL.createObjectURL(file);
      videoElement.onloadedmetadata = () => {
        complete(videoElement.videoWidth, videoElement.videoHeight);
      };
      videoElement.onerror = () => {
        complete(0, 0);
      };
      videoElement.src = url;
    }

    private extractFrameVideo(file: File, ref: string, id: string, customMetadata: ICustomMetadata, subscriber) {
      const elementVideo = document.createElement('video');
      elementVideo.src = URL.createObjectURL(file);
      elementVideo.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = elementVideo.videoWidth;
        canvas.height = elementVideo.videoHeight;
        setTimeout(() => {
          canvas.getContext('2d')
            .drawImage(elementVideo, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob: Blob) => {
            const newFile: any = blob;
            newFile['name'] = file.name;
            newFile['lastModifiedDate'] = new Date();
            newFile['width'] = canvas.width;
            newFile['height'] = canvas.height;
            const thumbMetadata = this.getThumbnailMetadata(customMetadata, newFile, 'video');
            this.uploadTask(newFile, ref, id, thumbMetadata, subscriber);
          });
        }, 180);
      };
    }

    private getThumbnailMetadata(customMetadata: ICustomMetadata, file: any, originalFileType: string): ICustomMetadata {
      return {
        owner: customMetadata.owner,
        name:  file.name,
        gid: customMetadata.gid || null,
        cid: customMetadata.cid || null,
        width: file.width,
        height: file.height,
        mime_type: originalFileType
      };
    }
  }


  /**
   * Firebase Storage Error Code.
   */
  export enum ErrorCode {
    Unknown = 'storage/unknown',
    ObjectNotFound = 'storage/object_not_found',
    BucketNotFound = 'storage/bucket_not_found',
    ProjectNotFound = 'storage/project_not_found',
    QuotaExceeded = 'storage/quota_exceeded',
    Unauthenticated = 'storage/unauthenticated',
    Unauthorized = 'storage/unauthorized',
    RetryLimitExceeded = 'storage/retry_limit_exceeded',
    InvalidChecksum = 'storage/invalid_checksum',
    Canceled = 'storage/canceled',
    InvalidEventName = 'storage/invalid_event_name',
    InvalidUrl = 'storage/invalid_url',
    InvalidArgument = 'storage/invalid-argument',
    NoDefaultBucket = 'storage/no_default_bucket',
    CannotSliceBlob = 'storage/cannot_slice_blob',
    ServerWrongFileSize = 'storage/server_wrong_file_size',
  }
}
