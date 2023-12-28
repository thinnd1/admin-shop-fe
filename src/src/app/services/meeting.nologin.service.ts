import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions, RequestOptionsArgs, Response} from '@angular/http';
import {MeetingInfoWhenUnAuth} from '../models/me/meeting-when-un-auth';
import {RejectMeetingsRequest} from '../models/me/reject-meeting-request';
import {AcceptMeetingsSendApi} from '../models/me/accept-meetings-send-api';
import {Observable} from 'rxjs/Observable';
import {RejectMeetingSettingSaveResult} from '../models/me/reject-meeting-setting-save-result';
import {AcceptMeetingSettingSaveResult} from '../models/me/accept-meeting-setting-save-result';

/**
 * 未ログイン面会承認.
 */
@Injectable()
export class MeetingNologinService {

  // Variables
  // --------------------------------------------------------------------------

  // Helper
  // --------------------------------------------------------------------------
  private static headerOptions(accessToken: string): RequestOptionsArgs {
    const options = new RequestOptions();
    options.headers = new Headers();
    options.headers.append('Content-Type', 'application/json; charset=utf-8');
    options.headers.append('Accept', 'application/json');
    options.headers.append('Authorization', 'Bearer ' + accessToken);
    return options;
  }

  // Constructor
  // --------------------------------------------------------------------------
  constructor(private http: Http) {
  }

  // Methods
  // --------------------------------------------------------------------------
  getMeetingWhenUnauth(requestsId: string, requestNonceId: string, token: string): Observable<any> {
    return new Observable(observer => {
      const url = `/api/dr/me/get_meeting?typeId=0&requestId=${requestsId}&requestNonceId=${requestNonceId}`;
      return this.http.get(url, MeetingNologinService.headerOptions(token)).subscribe((response: Response) => {
        observer.next(Object.assign(new MeetingInfoWhenUnAuth(), response.json()));
        observer.complete();
      }, error => {
        if (error.error_codes &&
          (error.error_codes[0] === 'ME.E010' || error.error_codes[0] === 'ME.E011')) {
          const meetingInfo = new MeetingInfoWhenUnAuth();
          meetingInfo.errorCode = error.error_codes[0];
          observer.next(meetingInfo);
          observer.complete();
        }
        observer.error(error);
      });
    });
  }

  putAcceptMeeting(settings: AcceptMeetingsSendApi, token: string): Observable<any> {
    return new Observable(observer => {
      const path = '/api/dr/me/accept_meeting_request';
      const options = MeetingNologinService.headerOptions(token);

      return this.http.post(path, JSON.stringify(settings), options).subscribe((response: Response) => {
        observer.next(Object.assign(new AcceptMeetingSettingSaveResult(), response.json()));
        observer.complete();
      }, error => {
        observer.error(error);
      });
    });
  }

  putRejectMeeting(settings: RejectMeetingsRequest, token: string): Observable<RejectMeetingSettingSaveResult> {
    return new Observable(observer => {
      const path = '/api/dr/me/reject_meeting';
      const options = MeetingNologinService.headerOptions(token);

      return this.http.put(path, JSON.stringify(settings), options).subscribe((response: Response) => {
        observer.next(Object.assign(new RejectMeetingSettingSaveResult(), response.json()));
        observer.complete();
      }, error => {
        observer.error(error);
      });
    });
  }
}
