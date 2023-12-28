import {PinCustomerSettingsSaveResult} from '../models/me/pin-customer-settings-save-result';
import {ListMediatorSendAPISettingsSaveResult} from '../models/me/list-mediator-send-api-settings-save-result';
import {ListHandleUsersSettings} from '../models/me/list-handle-users-settings';
import {ListMeetingConfig} from '../models/me/list-meeting-config';
import {Injectable} from '@angular/core';

import {VisitEntrySettings} from '../models/me/visit-entry-settings';
import {VenderBlockSettings} from '../models/me/vender-block-settings';
import {VenderPersonListSettings} from '../models/me/vender-person-list-settings';
import {MeetingRuleSettings} from '../models/me/meeting-rule-settings';

import {Http, RequestOptions, Response, URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';

import {VisitEntrySettingsSaveResult} from '../models/me/visit-entry-settings-save-result';
import {VenderBlockSettingsSaveResult} from '../models/me/vender-block-settings-save-result';
import {VenderPersonListSettingsSaveResult} from '../models/me/vender-person-list-settings-save-result';
import {MeetingRuleSettingsSaveResult} from '../models/me/meeting-rule-settings-save-result';

import {HttpStatusCode} from '../common/http_status_code';
import {InterestedDrugsSettingsSaveResult} from '../models/me/interested-drugs-settings-save-rerult';
import {InterestedDrugsSettings} from '../models/me/interested-drugs-settings';
import {MeetingsDemandsSettings} from '../models/me/meeting-demands-settings';
import {MeetingsDemandsSettingsSaveResult} from '../models/me/meeting-demands-settings-save-result';
import {MeetingDemandsInputSettings} from '../models/me/meeting-demands-input-settings';
import {PicSettings} from '../models/me/pic-settings';
import {PicSettingsSaveResult} from '../models/me/pic-settings-save-result';
import {ListCustomerSettings} from '../models/me/list-customer-settings';
import {ListMediatorsSettings} from '../models/me/get-list-mediators-settings';
import {DataMeetingSettings} from '../models/me/data-meeting-settings';
import {ListMediatorSendAPISettings} from '../models/me/list-mediator-send-api-settings';
import {HttpStatus} from '../common/http.status';
import {ListAggregationDetailSettings} from '../models/me/aggregation_detail_setting';
import {ListAggregationSettings} from '../models/me/aggregation-metting-settings';
import {ListVisitorHistoriesSettings} from '../models/me/status-meeting-settings';
import {ListDownloadCSVLog} from '../models/me/download-csv-log-settings';
import {AcceptMeetingsSendApiSaveResult} from '../models/me/accept-meetings-send-api-save-result';
import {CancelMeetingsSendApi} from '../models/me/cancel-meeting-settings';
import {DelayMeetingSettings} from '../models/me/delay-meeting-settings';
import {AcceptMeetingsSendApi} from '../models/me/accept-meetings-send-api';
import {MeetingRestriction} from '../models/me/meeting-restriction-settings';
import {MeetingRuleSettingsSendApi} from '../models/me/meeting-rule-settings-send-api';
import {MeetingIdentifyStatus} from '../models/me/metting-identify-status-settings';
import {MeetingFrameRequestResult} from '../models/me/meeting-frame-request-result';

import {ListInitScreen} from '../models/me/get-init-screen';
import {PinCustomerSettings} from 'app/models/me/pin-customer-settings';
import {MrInfoSearch} from '../models/me/mr-info-search';
import {InfoUserRequest} from '../models/me/info-user-request';
import {MeetingProfileAssignee} from '../models/me/meeting-profile-assignee';
import {MessageListSetting} from '../models/me/message-list-setting';
import {GetRoomSetting} from '../models/me/get-room-setting';
import {SendMessageSetting} from '../models/me/send-message-setting';
import {ListMettingDetailSettingsPr} from '../models/me/list-metting-detail-settings-pr';
import {AcceptMeetingCallApiPr} from '../models/me/accept-meeting-call-api-pr';
import {AcceptMeetingsSendApiSaveResultPr} from '../models/me/accept-meetings-send-api-save-result-pr';
import {ConditionMeetingStatus} from '../models/me/condition-meeting-staus';
import {AspirationMeeting} from '../models/me/aspiration-meeting';
import {ChargeDrug} from '../models/me/charge-drug';
import {DrugsRequest} from '../models/me/drugs-request';
import {RejectMeetingsRequest} from '../models/me/reject-meeting-request';
import {FirAttachments} from '../models/gr/firebase/fir.attachments';
import {VisitCardPayments} from '../models/me/visit-card-payments';
import {FirebaseStorage} from './firebase/firebase.storage';
import {PinStaff} from '../models/me/pinStaff';
import {CustomQueryEncoder} from '../common/custom_query_encoder';
import {MeetingProfileDoctor} from '../models/me/meeting-profile-doctor';

@Injectable()
export class MeetingService {

  options: any;

  constructor(private http: Http, private storage: FirebaseStorage) {
  }

  // ME0001
  getDataMeeting(userId: string, conditionSearch: ConditionMeetingStatus): Observable<DataMeetingSettings> {
    let params, options;
    params = new URLSearchParams();
    params.append('userId', userId);
    params.append('sourceRequest', conditionSearch.sourceRequest);
    params.append('meetingStatus', conditionSearch.meetingStatus);
    params.append('page', conditionSearch.page);
    params.append('size', conditionSearch.pageSize);
    params.append('order', conditionSearch.order);
    params.append('type', 0);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/dr/me/get_data_meeting', options).subscribe((response: Response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          observer.next(Object.assign(new DataMeetingSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // ME0003
  getVisitableUsersSettings(userId: string, officeId: string, flag: number): Observable<VisitEntrySettings> {
    let params;
    params = new URLSearchParams();
    params.append('userId', userId);
    params.append('officeId', officeId);
    params.append('flag', flag);
    return new Observable(observer => {
      this.http.get('/api/dr/me/get_visitable_users', {params: params}).subscribe((response: Response) => {
        observer.next(Object.assign(new VisitEntrySettings(), response.json()));
        observer.complete();
      });
    });
  }

  getVisitDetail(visitId: string): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/dr/me/get_visitor_record?id=' + visitId).subscribe((response: Response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          observer.next(response.json());
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  deleteVisit(visitId: string): Observable<any> {
    return new Observable(observer => {
      this.http.delete('/api/dr/me/delete_visitor_record?id=' + visitId).subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next();
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }
  // ME0005 - Master Data
  getInitScreen(): Observable<ListInitScreen> {
    return new Observable(observer => {
      this.http.get('/api/dr/me/get_master_init_screen').subscribe((response: Response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          observer.next(Object.assign(new ListInitScreen(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // ME0005
  getListCustomerSettings(searchConditions: MrInfoSearch): Observable<ListCustomerSettings> {
    let params, options;
    // Search Params
    params = new URLSearchParams();
    params.append('keyword', searchConditions.keyword);
    params.append('genderMale', searchConditions.checkedMale);
    params.append('genderFemale', searchConditions.checkedFeMale);
    params.append('industryType', searchConditions.selectedIndustry);
    params.append('officeId', searchConditions.selectedOffice);
    params.append('fieldType', searchConditions.selectedField);
    params.append('next', searchConditions.next);
    params.append('prev', searchConditions.prev);
    params.append('pageSize', searchConditions.size);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/dr/me/get_list_customer', options).subscribe((response: Response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          observer.next(Object.assign(new ListCustomerSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // ME0005 - Pin Customer
  postPinCustomer(settings: PinCustomerSettings): Observable<PinCustomerSettingsSaveResult> {
    return new Observable(observer => {
      this.http.post('/api/dr/me/pin_customer', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_POST_SUCCESS) {
            observer.next(Object.assign(new PinCustomerSettingsSaveResult(), response));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  postAddVisitorRecordSettings(settings: VisitEntrySettings): Observable<VisitEntrySettingsSaveResult> {
    return new Observable(observer => {
      this.http.post('/api/dr/me/add_visitor_record', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_POST_SUCCESS) {
            console.log(settings);
            observer.next(Object.assign(new VisitEntrySettingsSaveResult(), response));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getMeetingReport(requestId: string, detailFlag: boolean): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/me/get/meeting-report?meetingRequestId=' + requestId + '&detailFlag=' + detailFlag)
          .subscribe((response: Response) => {
            if (response.status === HttpStatus.OK) {
              observer.next(response.json());
              observer.complete();
            } else {
              observer.error();
            }
          }, (error) => {
            observer.error(error.json());
          });
    });
  }

  putMeetingReport(meetingReport: any): Observable<any> {
    return new Observable(observer => {
      this.http.post('/api/me/put/meeting-report', JSON.stringify(meetingReport))
          .subscribe((response: Response) => {
            if (response.status === HttpStatus.OK) {
              observer.next();
              observer.complete();
            } else {
              observer.error();
            }
          }, (error) => {
            observer.error(error.json());
          });
    });
  }

  getScreenMeetingRequest(userIdReceiveRequest: string, officeIdReceiveRequest: string, requestId: string): Observable<any> {
    const params = new URLSearchParams();
    params.append('mr', userIdReceiveRequest);
    params.append('mrOfficeId', officeIdReceiveRequest);
    params.append('requestId', requestId);
    const options = new RequestOptions({params: params});
    console.log(options);
    return new Observable(observer => {
      this.http.get('/api/dr/me/get_direct_meeting_request_screen', options)
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(response.json());
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error.json());
        });
    });
  }

  getMeetingPurpose(userType, isPharmacy): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/dr/me/get_meeting_purpose/' + userType + '/' + isPharmacy)
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(response.json());
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error.json());
        });
    });
  }

  getListEvent(start: string, end: string, senderRequest: InfoUserRequest, receiveRequest: InfoUserRequest,
               userRequest: string): Observable<any> {
    const url = '/' + start + '/' + end
      + '/' + receiveRequest.userId + '/' + receiveRequest.officeId
      + '/' + senderRequest.userId + '/' + senderRequest.officeId
      + '/' + userRequest;
    return new Observable(observer => {
      this.http.get('/api/dr/me/get_list_event' + url)
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(response.json());
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error.json());
        });
    });
  }

  putMeeting(data): Observable<any> {
    return new Observable(observer => {
      this.http.post('/api/dr/me/put_meeting', JSON.stringify(data))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next();
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error.json());
        });
    });
  }

  // ME0007
  // http://27.72.58.31:9880/api/dr/me/get_meeting?typeId=0&requestId=5a2635e103a2872bc8f7696f&see=true
  // http://27.72.58.31:9880/api/dr/me/get_meeting?typeId=0&requestId=5a3371f203a28717a4d0ff39&seen=true
  getMeetingsSettings(typeId, requestId, see): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/dr/me/get_meeting?typeId=' + typeId + '&requestId=' + requestId + '&seen=' + see).subscribe(
        (response: Response) => {
          if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
            observer.next(response.json());
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  // check accept meeting
  checkAcceptMeeting(settings: AcceptMeetingsSendApi): Observable<any> {
    return new Observable(observer => {
      this.http.post('/api/dr/me/check_accept_meeting', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(response.json());
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  // put accept meeting
  putAcceptMeetingSettings(settings: AcceptMeetingsSendApi): Observable<AcceptMeetingsSendApiSaveResult> {
    return new Observable(observer => {
      this.http.post('/api/dr/me/accept_meeting_request', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(response.json());
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  putRejectMeetingSettings(settings: RejectMeetingsRequest): Observable<AcceptMeetingsSendApiSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/dr/me/reject_meeting', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.NotContent) {
            observer.next();
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  putDelayMeetingSettings(settings: DelayMeetingSettings): Observable<AcceptMeetingsSendApiSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/dr/me/delay_meeting_request', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.NotContent) {
            observer.next();
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  putCancelMeetingSettings(settings: CancelMeetingsSendApi): Observable<AcceptMeetingsSendApiSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/dr/me/cancel_meeting', JSON.stringify(settings))
        .subscribe((response: Response) => {
          observer.next(Object.assign(new AcceptMeetingsSendApiSaveResult(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  // ME0014
  getPicsSettings(keyWord: string, onlyUnconfirmed: boolean, next: any, prev: any, pageSize: any): Observable<PicSettings> {
    let params, options, apiUrl;
    params = new URLSearchParams();
    params.append('keyWord', keyWord);
    params.append('onlyUnconfirmed', onlyUnconfirmed);
    params.append('next', next);
    params.append('prev', prev);
    params.append('pageSize', pageSize);
    apiUrl = '/api/dr/me/list_pic';
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get(apiUrl, options).subscribe((response: Response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          observer.next(Object.assign(new PicSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  putIdentifyStatusSettings(settings: MeetingIdentifyStatus): Observable<PicSettingsSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/dr/me/put_identify_status', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_PUT_SUCCESS) {
            observer.next(Object.assign(new PicSettingsSaveResult(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  putMeetingRestrictionSettings(settings: MeetingRestriction): Observable<PicSettingsSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/dr/me/put_meeting_restriction', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_PUT_SUCCESS) {
            observer.next(Object.assign(new PicSettingsSaveResult(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  // me0023
  getMeetingRuleSettings(): Observable<MeetingRuleSettings> {
    return new Observable(observer => {
      this.http.get('/api/dr/me/get_meeting_rule').subscribe((response: Response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          observer.next(Object.assign(new MeetingRuleSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  putMeetingRuleSettings(settings: MeetingRuleSettingsSendApi): Observable<MeetingRuleSettingsSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/dr/me/put_meeting_rule', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_PUT_SUCCESS) {
            observer.next(response);
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  // curl -X GET 'http://27.72.58.31:9880/api/dr/me/get_download_csv_log'
  // Me0024
  getListDownloadLogSettings(): Observable<ListDownloadCSVLog> {
    return new Observable(observer => {
      this.http.get('/api/dr/me/get_download_csv_log')
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
            observer.next(Object.assign(new ListDownloadCSVLog(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  // http://27.72.58.31:9880/api/dr/me/get_download_csv?start=2017-10-06T00:00:00+07:00&end=2017-10-13T00:00:00+07:00
  // http://27.72.58.31:9880/api/dr/me/get_download_csv/2017-01-10T00:00:00+07:00/2017-12-12T00:00:00+07:00'
  getListDownloadCSVSettings(startdate, enddate): Observable<ListDownloadCSVLog> {
    return new Observable(observer => {
      this.http.get('/api/dr/me/get_download_csv/' + startdate + '/' + enddate)
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
            observer.next(Object.assign(new ListDownloadCSVLog(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getCSVMeetingCustomer(): Observable<ListDownloadCSVLog> {
    return new Observable(observer => {
      this.http.get('/api/dr/me/get_csv_customers')
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
            observer.next(Object.assign(new ListDownloadCSVLog(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  // curl -X GET "http://27.72.58.31:9880/api/dr/me/get_status_meeting/2017-11-01T00:00:00+0700/2017-11-01T23:59:59+0700"

  // Me0025
  getListVisitorHistoriesSettings(date, endDate): Observable<ListVisitorHistoriesSettings> {
    return new Observable(observer => {
      this.http.get('/api/dr/me/get_status_meeting/' + date + '/' + endDate).subscribe((response: Response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          observer.next(Object.assign(new ListVisitorHistoriesSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // ME0026
  getAggregationSettings(type: number, time: string, sort: string): Observable<ListAggregationSettings> {
    return new Observable(observable => {
      this.http.get('/api/dr/me/get_aggregation/' + type + '/' + time + '/' + sort).subscribe((response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          observable.next(Object.assign(new ListAggregationSettings(), response.json()));
          observable.complete();
        } else {
          observable.error();
        }
      }, (error) => {
        observable.error(error);
      });
    });
  }

  getAggregationDetailSettings(type: number, time: string, model: any, sort: string): Observable<ListAggregationDetailSettings> {let params, options, apiUrl;
    params = new URLSearchParams('', new CustomQueryEncoder());
    params.append('type', type);
    params.append('date', time);
    params.append('sort', sort);
    params.append('userName', model.userName);
    params.append('officeUserId', model.officeUserId);
    params.append('departmentId', model.departmentId);
    params.append('id', model.id);
    return new Observable(observable => {
      this.http.get('/api/dr/me/get_aggregation_detail',{params: params}).subscribe((response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          observable.next(Object.assign(new ListAggregationDetailSettings(), response.json()));
          observable.complete();
        } else {
          observable.error();
        }
      }, (error) => {
        observable.error(error);
      });
    });
  }

  // ME0010
  getListMeetingConfigure(department, name): Observable<ListMeetingConfig> {
    return new Observable(observer => {
      let params, options;
      // Search Params
      params = new URLSearchParams();
      params.append('departmentId', department);
      params.append('userName', name);
      options = new RequestOptions({params: params});
      this.http.get('/api/dr/me/get_staff_list', options).subscribe((response: Response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          observer.next(Object.assign(new ListMeetingConfig(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // ME0012
  getBlockUsersSettings(): Observable<VenderBlockSettings> {
    return new Observable(observer => {
      this.http.get('/api/dr/me/get_block_users').subscribe((response: Response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          observer.next(Object.assign(new VenderBlockSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // ME0015
  getListMediators(): Observable<ListMediatorsSettings> {
    return new Observable(observer => {
      this.http.get('/api/dr/me/get_list_mediators').subscribe((response: Response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          observer.next(Object.assign(new ListMediatorsSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // ME0015
  getListHandleUsers(userId): Observable<any> {
    return new Observable(observer => {
      // /api/dr/me/get_list_handle_users?officeUserId
      this.http.get('/api/dr/me/get_list_handle_users?userId=' + userId).subscribe((response: Response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          observer.next(Object.assign(new ListHandleUsersSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // ME0015
  putMediatorSettings(settings: ListMediatorSendAPISettings): Observable<ListMediatorSendAPISettingsSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/dr/me/put_list_mediator_setting', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_PUT_SUCCESS) {
            observer.next(Object.assign(new ListMediatorSendAPISettingsSaveResult(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  // ME0012 + ME0013 - PUT Unblock User
  putUnblockUserSettings(userId, officeId, blockedUserId, blockedOfficeId): Observable<VenderBlockSettingsSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/dr/me/unblock_user/' + userId + '/' + officeId + '/' + blockedUserId + '/' + blockedOfficeId + '/', '')
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_PUT_SUCCESS) {
            observer.next(Object.assign(new VenderBlockSettingsSaveResult(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error.json());
        });
    });
  }

  // ME0013 - GET List PIC
  getPicSettings(keyword): Observable<VenderPersonListSettings> {
    const path = encodeURI('/api/dr/me/get_pic?keyWord=' + keyword);
    return new Observable(observer => {

      this.http.get(path).subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(Object.assign(new VenderPersonListSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error.json());
      });
    });
  }

  // ME0013 - POST Block User
  postBlockUserSettings(userId, officeId, blockedUserId, blockedOfficeId): Observable<VenderPersonListSettingsSaveResult> {
    return new Observable(observer => {
      this.http.post('/api/dr/me/block_user/' + userId + '/' + officeId + '/' + blockedUserId + '/' + blockedOfficeId + '/true', '')
        .subscribe((response: Response) => {
          // if (response.status === HttpStatusCode.HTTP_PUT_SUCCESS) {
          observer.next(Object.assign(new VenderPersonListSettingsSaveResult(), response.json()));
          observer.complete();
          // } else {
          observer.error();
          // }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  // me0013 get_list_all_handling
  getListAllHandling(): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/dr/me/get_list_all_handling').subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(response.json());
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // me0016
  putMeetingSetting(obj): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/dr/me/put_meeting_setting', JSON.stringify(obj))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.NotContent) {
            observer.next();
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  putUpdateHolidaySettings(obj): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/dr/me/update_holiday_settings', JSON.stringify(obj))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.NotContent) {
            observer.next();
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  // me0017 & me0016
  getMeetingSetting(jobType: string, officeId: string, type: number): Observable<any> {
    let params, options;
    params = new URLSearchParams();
    // params.append('option', jobType);
    // params.append('officeId', officeId);
    // params.append('type', type);
    params.append('type', type);
    params.append('officeId', officeId);
    params.append('option', jobType);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/dr/me/get_meeting_setting', options)
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(Object.assign(response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  // me0020
  getInterestedDrugsSettings(): Observable<InterestedDrugsSettings> {
    return new Observable(observer => {
      this.http.put('/api/dr/me/put_meeting_setting', JSON.stringify(''))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.NotContent) {
            observer.next();
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  putInterestedDrugsSettings(settings: InterestedDrugsSettings): Observable<InterestedDrugsSettingsSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/dr/me/put_interested_drugs', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_PUT_SUCCESS) {
            observer.next(response);
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  // me0021
  getMeetingDemandsSettings(userId: string, officeId: string): Observable<MeetingsDemandsSettings> {
    return new Observable(observer => {
      this.http.get('/api/dr/me/get_meeting_demands?userId=' + userId + '&officeId=' + officeId).subscribe((response: Response) => {
        observer.next(Object.assign(new MeetingsDemandsSettings(), response.json()));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  putMeetingDemandsSettings(settings: MeetingDemandsInputSettings): Observable<MeetingsDemandsSettingsSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/dr/me/put_meeting_demands', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_PUT_SUCCESS) {
            observer.next(response);
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  // ME0029
  getScreenMeetingRequestOfMR(userIdReceiveRequest: string, officeIdReceiveRequest: string, requestId: string): Observable<any> {
    const params = new URLSearchParams();
    params.append('dr', userIdReceiveRequest);
    params.append('drOfficeId', officeIdReceiveRequest);
    params.append('requestId', requestId);
    const options = new RequestOptions({params: params});
    console.log(options);
    return new Observable(observer => {
      this.http.get('/api/pr/me/get_direct_meeting_request_screen', options)
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(response.json());
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error.json());
        });
    });
  }

  getListEventMR(start: string, end: string, senderRequest: InfoUserRequest, receiveRequest: InfoUserRequest,
                 userRequest: string): Observable<any> {
    const url = '/' + start + '/' + end
      + '/' + receiveRequest.userId + '/' + receiveRequest.officeId
      + '/' + senderRequest.userId + '/' + senderRequest.officeId
      + '/' + userRequest;
    return new Observable(observer => {
      this.http.get('/api/pr/me/get_list_event' + url)
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(response.json());
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error.json());
        });
    });
  }

  putMeetingMR(data): Observable<any> {
    return new Observable(observer => {
      this.http.post('/api/pr/me/put_meeting', JSON.stringify(data))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next();
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error.json());
        });
    });
  }

  // ME0004
  getAssignee(userId: string, officeId: string): Observable<MeetingProfileAssignee> {
    return new Observable(observer => {
      this.http.get('/api/dr/me/get_assignee?userId=' + userId + '&officeId=' + officeId).subscribe((response: Response) => {
        observer.next(Object.assign(new MeetingProfileAssignee(), response.json()));
        observer.complete();
      }, error => {
        observer.error(error);
      });
    });
  }

  blockUser(userId: string, officeId: string, blockedUserId: string, blockedOfficeId: string): Observable<any> {
    return new Observable(observer => {
      this.http.post('/api/dr/me/block_user/' + userId + '/' + officeId + '/' + blockedUserId + '/' + blockedOfficeId + '/true', '')
        .subscribe((response: Response) => {
          observer.next(response);
          observer.complete();
          if (response.status === HttpStatus.NotContent) {
            observer.next(response);
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  unBlockUser(userId: string, officeId: string, blockedUserId: string, blockedOfficeId: string): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/dr/me/unblock_user/' + userId + '/' + officeId + '/' + blockedUserId + '/' + blockedOfficeId, '')
        .subscribe((response: Response) => {
          observer.next(response);
          observer.complete();
          if (response.status === HttpStatus.NotContent) {
            observer.next(response);
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  // ME0008
  getRoom(): Observable<GetRoomSetting> {
    return new Observable(observer => {
      return this.http.get('/api/dr/me/get_room').subscribe((response: Response) => {
        observer.next(Object.assign(new GetRoomSetting(), response.json()));
        observer.complete();
      }, error => {
        observer.error(error);
      });
    });
  }

  listMessages(): Observable<MessageListSetting> {
    return new Observable(observer => {
      return this.http.get('/api/dr/me/get_list_message').subscribe((response: Response) => {
        observer.next(Object.assign(new MessageListSetting(), response.json()));
        observer.complete();
      }, error => {
        observer.error(error);
      });
    });
  }

  sendMessage(setting: SendMessageSetting): Observable<any> {
    return new Observable(observer => {
      return this.http.post('/api/dr/me/send_message', JSON.stringify(setting)).subscribe((response: Response) => {
        observer.next(response);
        observer.complete();
      }, error => {
        observer.error(error);
      });
    });
  }

  // ME00031
  getMeetingDetailPrMe0031(typeId: string, requestId: string): Observable<ListMettingDetailSettingsPr> {
    return new Observable(observer => {
      this.http.get('/api/dr/me/get_meeting?typeId=' + typeId + '&requestId=' + requestId + '&seen=true').subscribe(
        (response) => {
          if (response.status = HttpStatus.OK) {
            observer.next(Object.assign(new ListMettingDetailSettingsPr(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, error => {
          observer.error(error);
        });
    });
  }

  checkAcceptMeetingPr(settings: AcceptMeetingsSendApi): Observable<any> {
    return new Observable(observer => {
      this.http.post('/api/pr/me/check_accept_meeting', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(response.json());
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  putAcceptMeetingSettingsPr(settings: AcceptMeetingCallApiPr): Observable<AcceptMeetingsSendApiSaveResultPr> {
    return new Observable(observer => {
      this.http.put('/api/pr/me/accept_meeting_request', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.NotContent) {
            observer.next(Object.assign(new AcceptMeetingsSendApiSaveResultPr(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  putRejectMeetingSettingsPr(settings): Observable<AcceptMeetingsSendApiSaveResultPr> {
    return new Observable(observer => {
      this.http.put('/api/pr/me/reject_meeting', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.NotContent) {
            observer.next();
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  putCancelMeetingPr(settings): Observable<AcceptMeetingsSendApiSaveResultPr> {
    return new Observable(observer => {
      this.http.put('/api/pr/me/cancel_meeting', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.NotContent) {
            observer.next();
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  putDelayMeetingSettingsPr(settings: DelayMeetingSettings): Observable<AcceptMeetingsSendApiSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/pr/me/delay_meeting_request', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.NotContent) {
            observer.next();
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  // ME0030
  getDataMeetingPr(conditionSearch: ConditionMeetingStatus): Observable<DataMeetingSettings> {
    let params, options;
    params = new URLSearchParams();
    params.append('sourceRequest', conditionSearch.sourceRequest);
    params.append('meetingStatus', conditionSearch.meetingStatus);
    params.append('page', conditionSearch.page);
    params.append('pageSize', conditionSearch.pageSize);
    params.append('order', conditionSearch.order);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/pr/me/get_data_meeting', options).subscribe(
        (response: Response) => {
          observer.next(Object.assign(new DataMeetingSettings(), response.json()));
          observer.complete();
        },
        (error) => {
          observer.error(error);
        });
    });
  }

  // ME0032
  getListHandlingHospitals(): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/pr/get_list_handling_hospitals').subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(response.json());
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  getListDoctorRequest(searchConditions): Observable<any> {
    let params, options;
    params = new URLSearchParams();
    params.append('keyword', searchConditions.keyword);
    params.append('flagDoctor', searchConditions.flagDoctor);
    params.append('flagPharmacy', searchConditions.flagPharmacy);
    params.append('flagOther', searchConditions.flagOther);
    params.append('officeIds', searchConditions.officeIds);
    params.append('fieldIds', searchConditions.fieldIds);
    params.append('page', searchConditions.page);
    params.append('pageSize', searchConditions.pageSize);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/pr/get_list_staffs', options).subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          if (response.text()) {
            observer.next(Object.assign(new ListCustomerSettings(), response.json()));
          } else {
            observer.next(Object.assign({}));
          }
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  postPinCustomerMR(settings: PinStaff): Observable<PinCustomerSettingsSaveResult> {
    return new Observable(observer => {
      this.http.post('/api/pr/me/pin_staff', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(Object.assign(new PinCustomerSettingsSaveResult(), response));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  // ME0033 get
  getMeetingFrame(frameId: string): Observable<any> {
    return new Observable(observer => {
      const request = {
        frameId: frameId
      };
      this.http.get('/api/pr/me/get_meeting_frame?' + $.param(request)).subscribe((response: Response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          observer.next(response.json());
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // me0033 put
  putRequestMeetingFrame(data): Observable<MeetingFrameRequestResult> {
    return new Observable(observer => {
      this.http.post('/api/pr/me/apply_meeting_frame', JSON.stringify(data))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.NotContent) {
            observer.next(response.json());
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error.json());
        });
    });
  }

  // me0035
  getListChargeDrug(): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/pr/me/get_drugs_in_charge')
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(response.json());
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error.json());
        });
    });
  }

  putChargeDrugs(listChargeDrug: ChargeDrug): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/pr/me/put_drugs_in_charge', JSON.stringify(listChargeDrug))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.NotContent) {
            observer.next();
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error.json());
        });
    });
  }

  addDrugsRequest(data: DrugsRequest): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/pr/me/add_drugs_request', JSON.stringify(data))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.NotContent) {
            observer.next();
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error.json());
        });
    });
  }

  // ME0036
  getDataMeetingDr(userId: string, officeId: string): Observable<MeetingProfileDoctor> {
    return new Observable(observer => {
      this.http.get('/api/pr/me/get_dr_profile?userId=' + userId + '&officeId=' + officeId).subscribe((response: Response) => {
        observer.next(Object.assign(new MeetingProfileDoctor(), response.json()));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // ME0028
  getAspirationMeeting(userId: string, officeId: string): Observable<AspirationMeeting> {
    return new Observable(observer => {
      this.http.get('/api/dr/me/aspiration_meeting?userId=' + userId + '&officeId=' + officeId).subscribe((response: Response) => {
        observer.next(Object.assign(new AspirationMeeting(), response.json()));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  getAttachmentsMeeting(officeId: string, listFileId): Observable<FirAttachments[]> {
    return Observable.create(subscribe => {
      const listReq = listFileId.map(item => {
        return this.storage.metadataMeeting(officeId, item.fileId);
      });
      Observable.forkJoin(listReq).subscribe((fileList: any[]) => {
        const arrAttachments: FirAttachments[] = [];
        fileList.forEach(file => {
          const attachmentObj = new FirAttachments;
          attachmentObj.url = file.downloadURL;
          attachmentObj.fileId = file.name;
          attachmentObj.name = file.customMetadata.name;
          attachmentObj.size = file.size;
          attachmentObj.type = file.contentType;
          attachmentObj.createdAt = file.timeCreated;
          attachmentObj.owner = file.customMetadata.owner;
          arrAttachments.push(attachmentObj);
        });
        subscribe.next(arrAttachments);
        subscribe.complete();
      }, err => {
        subscribe.error(err);
      });
    });
  }

  // ME0038
  getListHospitalStaffs(): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/me/list_handling_hospital_meeting_staff').subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(response.json());
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  getListMonthMeetings(year, month, officeId, officeUserId): Observable<any> {
    return new Observable(observer => {
      const params = new URLSearchParams();
      params.append('meetingYear', year);
      params.append('meetingMonth', month);
      params.append('userId', officeUserId);
      params.append('officeId', officeId);
      this.http.get('/api/me/list_month_meetings', {params: params}).subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(response.json());
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }


  // ME5008 add CardContractor
  addCardContractor(data: any): Observable<any> {
    return new Observable(observer => {
      return this.http.post('/api/pr/me/meeting_contract', JSON.stringify(data)).subscribe((response: Response) => {
        observer.next(response);
        observer.complete();
      }, error => {
        observer.error(error);
      });
    });
  }


  // ME5008 GET office user
  getOfficeUser(id: string): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/offices/' + id).subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(response.json());
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // ME5002
  getVisitCardPayments(officeUserId: string): Observable<VisitCardPayments> {
    return new Observable(observer => {
      this.http.get('/api/pr/me/meeting_contract?officeUserId=' + officeUserId).subscribe((response: Response) => {
        observer.next(Object.assign(new VisitCardPayments(), response.json()));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  putChangePaymentName(data): Observable<VisitCardPayments> {
    return new Observable(observer => {
      this.http.put('/api/pr/me/edit_payment_name?paymentNo=' + data.paymentNo + '&paymentName=' + data.paymentName, '')
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.NotContent) {
            observer.next();
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }
}
