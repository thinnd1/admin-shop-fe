import {Injectable, OnDestroy, OnInit} from '@angular/core';
import { Http, Response, RequestOptions, URLSearchParams } from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {CreateHospitalRoomSettings} from '../models/ch/create-hospital-room-settings';
import {CreateHospitalRoomSettingsSendApi} from '../models/ch/create-hospital-room-settings-send-api';
import {PrepareCreateOutsideRoomSetting} from '../models/ch/prepare-create-outside-room-settings';
import {CreateOutsideRoomSettingSaveResult} from '../models/ch/create-outside-room-settings-save-result';
import {RoomOutsideSaveResult} from '../models/ch/room-outside-save-result';
import {RoomOutsidePrepareJoinSetting} from '../models/ch/room-outside-prepare-join-settings';
import {CreateOutsideRoomSetting} from '../models/ch/create-outside-room-settings';
import {CreateHospitalRoomSettingsSaveResults} from '../models/ch/create-hospital-room-settings-save-results';
import {EditHospitalRoomSettings} from '../models/ch/edit-hospital-room-settings';
import {EditHospitalRoomSettingsSaveResults} from '../models/ch/edit-hospital-room-settings-save-results';

import {NGXLogger} from 'ngx-logger';
import {SharedValueService} from './shared-value.service';
import {OfficeOutsideUser} from '../models/ch/office-outside-user';
import {FirRoom} from '../models/ch/firebase/fir.room';
import {FirebaseDatabase} from './firebase/firebase.database';
import {FirAttachments} from '../models/gr/firebase/fir.attachments';
import {FirebaseStorage} from './firebase/firebase.storage';
import {FirStampCategory} from '../models/ch/firebase/fir.stamp.category';
import {RestrictUser} from '../models/ch/restrict-user';

/**
 * グループに関わる機能を提供するクラス.
 */
@Injectable()
export class ChatService implements OnInit, OnDestroy {

  // Static helper methods.
  // --------------------------------------------------------------------------
  static orderByCreatedAt(array: any[]): any[] {
    if (array.length > 0) {
      return array.sort((a, b) =>  b.createdAt - a.createdAt);
    }
  }

  // Constructor.
  // --------------------------------------------------------------------------
  constructor(private http: Http,
              private shared: SharedValueService,
              private logger: NGXLogger,
              private fireBaseDatabase: FirebaseDatabase,
              private fireBaseStorage: FirebaseStorage) { }


  // Init.
  // --------------------------------------------------------------------------
  ngOnInit(): void {
  }


  // Destroy.
  // --------------------------------------------------------------------------
  ngOnDestroy(): void {
  }

  private convertAttachedFile(originalId: string, file: any): any {
    return {
      fileId: file.name,
      type: file.contentType,
      original_file_id: originalId,
      url: file.downloadURL,
    };
  }


  // API.
  // --------------------------------------------------------------------------
  deleteChatRoom(roomId: string): Observable<any> {
    let params, options, apiUrl;
    params = new URLSearchParams();
    params.append('roomId', roomId);
    options = new RequestOptions({ params: params });
    apiUrl = '/api/dr/ch/delete';
    return new Observable(observer => {
      this.http.delete(apiUrl, options).subscribe((response: RoomOutsideSaveResult) => {
        observer.next(Object.assign(new RoomOutsideSaveResult(), response));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  getCreateChatRoomInside(): Observable<CreateHospitalRoomSettings> {
    return new Observable(observer => {
      this.http.get('/api/dr/ch/inside/prepare').subscribe((response: Response) => {
        observer.next(Object.assign(new CreateHospitalRoomSettings(), response.json()));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  getRestrictedStatus(drOfficeUserId: string, mrOfficeUserId: string): Observable<RestrictUser> {
    let params, options, apiUrl;
    params = new URLSearchParams();
    params.append('drOfficeUserId', drOfficeUserId);
    params.append('mrOfficeUserId', mrOfficeUserId);
    options = new RequestOptions({ params: params });
    apiUrl = '/api/pr/re/restricted_of_user';
    return new Observable(observer => {
      this.http.get(apiUrl, options).subscribe((response: Response) => {
        observer.next(Object.assign(new RestrictUser(), response.json()));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  postCreateChatRoomInside(settings: CreateHospitalRoomSettingsSendApi): Observable<CreateHospitalRoomSettingsSaveResults> {
    return new Observable(observer => {
      this.http.post('/api/dr/ch/inside/create/save', JSON.stringify(settings))
        .subscribe((response: Response) => {
          observer.next(Object.assign(new CreateHospitalRoomSettingsSaveResults(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getEditRoomChatInside(roomId: string): Observable<EditHospitalRoomSettings> {
    let params, options, apiUrl;
    params = new URLSearchParams();
    params.append('roomId', roomId);
    options = new RequestOptions({ params: params });
    apiUrl = '/api/dr/ch/inside_edit/prepare';
    return new Observable(observer => {
      this.http.get(apiUrl, options).subscribe((response: Response) => {
        observer.next(Object.assign(new EditHospitalRoomSettings(), response.json()));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  getRoomInfo(officeUserId: string, roomId: string): Observable<FirRoom> {
    return new Observable(observer => {
      this.fireBaseDatabase.fetchOne(FirRoom, 'user/' + officeUserId + '/chats/' + roomId).subscribe(
        data => {
          observer.next(data);
          observer.complete();
        }, error => {
          observer.error(error);
        }
      );
    });
  }

  getListStampCategories(): Observable<any[]> {
    return Observable.create(subscriber => {
      this.fireBaseDatabase.fetch(FirStampCategory, `stamp`).subscribe(categories => {
        subscriber.next(categories);
        subscriber.complete();
      }, error => {
        subscriber.error(error);
        subscriber.complete();
      });
    });
  }

  getAttachment(roomId: string, attachmentKey: string, isThumbnail: boolean): Observable<FirAttachments> {
    return Observable.create(subscriber => {
      if (!isThumbnail) {
        this.fireBaseStorage.metadataChat(roomId, attachmentKey).subscribe(file => {
          subscriber.next(this.convertAttachedFile(null, file));
          subscriber.complete();
        }, err => {
          subscriber.error(err);
        });
      } else {
        // get image/video thumbnail
        this.fireBaseStorage.metadataChat(roomId, 'thumb_' + attachmentKey).subscribe(file => {
          subscriber.next(this.convertAttachedFile(attachmentKey, file));
          subscriber.complete();
        }, error => {
          // failed to get thumbnail
          this.fireBaseStorage.metadataChat(roomId, attachmentKey).subscribe(file => {
            subscriber.next(this.convertAttachedFile(null, file));
            subscriber.complete();
          }, err => {
            subscriber.error(err);
          });
        });
      }
    });
  }

  getAttachmentsRoom(roomId: string, attachments): Observable<FirAttachments[]> {
    return Observable.create(observer => {
      const listAttachments: Observable<FirAttachments>[] = attachments.map(attachment => {
        return Observable.create(ob => {
          const attachmentObj = new FirAttachments();
          this.fireBaseStorage.metadataChat(roomId, attachment.file_id).subscribe(file => {
            attachmentObj.fileId = file.name;
            attachmentObj.name = file.customMetadata.name;
            attachmentObj.size = file.size;
            attachmentObj.type = file.contentType;
            attachmentObj.createdAt = file.timeCreated;
            attachmentObj.owner = file.customMetadata.owner;
            attachmentObj.url = file.downloadURL;
            ob.next(attachmentObj);
            ob.complete();
          });
        });
      });
      Observable.forkJoin(listAttachments).subscribe(array => {
        const arr = ChatService.orderByCreatedAt(array);
        observer.next(arr);
        observer.complete();
      }, error => {
        observer.error(error);
      });
    });
  }

  putEditHospitalRoom(settings: CreateHospitalRoomSettingsSendApi): Observable<EditHospitalRoomSettingsSaveResults> {
    return new Observable(observer => {
      this.http.put('/api/dr/ch/inside/edit/save', JSON.stringify(settings))
        .subscribe((response: Response) => {
          observer.next(Object.assign(new EditHospitalRoomSettingsSaveResults(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getOutsideRoom(): Observable<PrepareCreateOutsideRoomSetting> {
    return new Observable(observer => {
      this.http.get('/api/dr/ch/outside/prepare').subscribe((response: Response) => {
        observer.next(Object.assign(new PrepareCreateOutsideRoomSetting(), response.json()));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  getUserFromMail(input: string): Observable<any> {
    let apiUrl;
    return new Observable(observer => {
      apiUrl = '/api/dr/gr/outside/user/from/email?input=' + encodeURIComponent(input);
      this.http.get(apiUrl).subscribe((response: Response) => {
        observer.next(Object.assign([new OfficeOutsideUser()], response.json()));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  putOutsideRoom(settings: CreateHospitalRoomSettingsSendApi): Observable<CreateOutsideRoomSettingSaveResult> {
    return new Observable(observer => {
      this.http.post('/api/dr/ch/outside/create/save', JSON.stringify(settings))
        .subscribe((response: Response) => {
          observer.next(Object.assign(new CreateOutsideRoomSettingSaveResult(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getEditRoomOutside(): Observable<PrepareCreateOutsideRoomSetting> {
    return new Observable(observer => {
      this.http.get('/api/dr/ch/outside/prepare').subscribe((response: Response) => {
        observer.next(Object.assign(new PrepareCreateOutsideRoomSetting(), response.json()));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  putOutsideEditRoom(settings: CreateOutsideRoomSetting): Observable<RoomOutsideSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/dr/ch/outside/edit/save', JSON.stringify(settings))
        .subscribe((response: Response) => {
          observer.next(Object.assign(new RoomOutsideSaveResult(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getMemberPrepare(roomId: string): Observable<RoomOutsidePrepareJoinSetting> {
    let apiUrl;
    return new Observable(observer => {
      apiUrl = '/api/dr/ch/member/join/prepare?roomId=' + roomId;
      this.http.get(apiUrl).subscribe((response: Response) => {
        // if (response.status === HttpStatus.OK) {
        //   observer.next(Object.assign(new RoomOutsidePrepareJoinSetting(), response.json()));
        //   observer.complete();
        // } else if (response.status === HttpStatus.BadRequest) {
        //   observer.error();
        // } else {
        //   observer.error();
        // }
        observer.next(Object.assign(new RoomOutsidePrepareJoinSetting(), response.json()));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  putJoinAgreeRoom(roomId: string): Observable<RoomOutsideSaveResult> {
    let apiUrl;
    return new Observable(observer => {
      apiUrl = '/api/dr/ch/member/join/agree?roomId=' + roomId;
      this.http.put(apiUrl, JSON.stringify(roomId))
        .subscribe((response: Response) => {
          // if (response.status === HttpStatus.OK) {
          //   observer.next(Object.assign(new RoomOutsidePrepareJoinSetting(), response.json()));
          //   observer.complete();
          // } else if (response.status === HttpStatus.BadRequest) {
          //   observer.error();
          // } else {
          //   observer.error();
          // }
          observer.next(Object.assign(new RoomOutsideSaveResult(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  putJoinDisagreeRoom(roomId: string): Observable<RoomOutsideSaveResult> {
    let apiUrl;
    return new Observable(observer => {
      apiUrl = '/api/dr/ch/member/join/disagree?roomId=' + roomId;
      this.http.put(apiUrl, JSON.stringify(roomId))
        .subscribe((response: Response) => {
          // if (response.status === HttpStatus.OK) {
          //   observer.next(Object.assign(new RoomOutsidePrepareJoinSetting(), response.json()));
          //   observer.complete();
          // } else if (response.status === HttpStatus.BadRequest) {
          //   observer.error();
          // } else {
          //   observer.error();
          // }
          observer.next(Object.assign(new RoomOutsideSaveResult(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }
}
