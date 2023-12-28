import {Injectable} from '@angular/core';
import {EventDetailsSettings} from '../models/ca/event-details-settings';
import {MonthlySettings} from '../models/ca/monthly-settings';
import {EventCreateSettings} from '../models/ca/event-create-settings';
import {SettingsSelfSettings} from '../models/ca/settings-self-settings';
import {SettingsStaffSettings} from '../models/ca/settings-staff-settings';
import { ExternalCalendar } from '../models/ca/settings-external-settings';

import {Headers, Http, RequestOptions, Response, URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {EventDetailsSettingsSaveResult} from '../models/ca/event-details-settings-save-result';
import {MonthlySettingsSaveResult} from '../models/ca/monthly-settings-save-result';
import {EventCreateSettingsSaveResult} from '../models/ca/event-create-settings-save-result';
import {SettingsSelfSettingsSaveResult} from '../models/ca/settings-self-settings-save-result';
import {SettingsStaffSettingsSaveResult} from '../models/ca/settings-staff-settings-save-result';
import { SettingsExternalSettingsSaveResult } from '../models/ca/settings-external-settings-save-result';

import {HttpStatusCode} from '../common/http_status_code';
import {HttpStatus} from '../common/http.status';
import {SettingsReferencedUser} from '../models/ca/settings-referenced-user';
import {EventGetShareStatus} from '../models/ca/event-get-share-status';
import {EventDeleteSettings} from '../models/ca/event-delete-setting';

@Injectable()
export class CalendarService {

  options: any;

  constructor(private http: Http) {
  }

  getEventDetailsSettings(eventId: string): Observable<EventDetailsSettings> {
    let params, options;
    params = new URLSearchParams();
    params.append('eventId', eventId);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/dr/ca/get_event', options).subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(Object.assign(new EventDetailsSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  deleteEventDetailsSettings(settings: EventDeleteSettings): Observable<any> {
    return new Observable(observer => {
      let params, options;
      params = new URLSearchParams();
      params.append('id', settings.id);
      params.append('recursiveOption', settings.recursiveOption);
      options = new RequestOptions({params: params});
      this.http.delete('/api/dr/ca/delete_event', options)
        .subscribe((response: Response) => {
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

  getMonthlySettings(startDate, endDate): Observable<any> {
    let apiUrl;
    return new Observable(observer => {
      apiUrl = '/api/dr/ca/search_events' + '?startDate=' + encodeURIComponent(startDate) + '&endDate=' + encodeURIComponent(endDate);
      this.http.get(apiUrl).subscribe((response: Response) => {
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

  getEventCreateSettings(type: string): Observable<EventCreateSettings> {
    let params, options;
    params = new URLSearchParams();
    params.append('type', type);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/dr/ca/get_calendar_references', options).subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(Object.assign(new EventCreateSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  postEventCreateSettings(settings: EventCreateSettings): Observable<any> {
    return new Observable(observer => {
      this.http.post('/api/dr/ca/save_event', JSON.stringify(settings))
        .subscribe((response: Response) => {
          observer.next();
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getListGroupByUser(): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/dr/gr/list_by_user').subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      });
    });
  }

  // CA0004
  putMeetingFrame(data): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/dr/ca/meeting_frame', JSON.stringify(data))
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

  validateMeetingFrame(data): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/dr/ca/time_meeting_frame', JSON.stringify(data))
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

  getAcceptRequest(officeUserId, officeId: string): Observable<any> {
    let params;
    params = new URLSearchParams();
    params.append('officeUserId', officeUserId);
    params.append('officeId',  officeId);
    return new Observable(observer => {
        this.http.get('/api/dr/ca/get_accept_request', {params: params}).subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(response.json());
            observer.complete();
          } else {
            observer.error(response.json());
          }
        }, (error) => {
          observer.error(error);
        });
      }
    );
  }
  // CA0006-8
  getSettingsSelfSettings(type: string): Observable<SettingsSelfSettings> {
    return new Observable(observer => {
        this.http.get('/api/dr/ca/get_calendar_references?type=' + type).subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(Object.assign(new SettingsSelfSettings(), response.json()));
            observer.complete();
          } else if (response.status === HttpStatus.Forbidden) {
            observer.error(response.json());
          } else {
            observer.error(response.json());
          }
        }, (error) => {
          observer.error(error);
        });
      }
    );
  }

  postSettingsSelfSettings(settings): Observable<SettingsSelfSettingsSaveResult> {
    // degrade ca0006 duplicate header
    // const headers = new Headers({
    //   'Content-Type': 'application/json'
    // });
    return new Observable(observer => {
      this.http.post('/api/dr/ca/save_calendar_references', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(Object.assign(new SettingsSelfSettingsSaveResult(), response));
            observer.complete();
          } else if (response.status === HttpStatus.Forbidden) {
            observer.error();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  // end CA0006-8
  getSettingsExternalSettings(): Observable<ExternalCalendar.Settings> {
    // return new Observable(observer => {
    //   this.http.get('/api/dr/ca/external_calendar_references').subscribe((response: Response) => {
    //     observer.next(new ExternalCalendar.Settings(response.json()));
    //     observer.complete();
    //   });
    // });
    return this.http.get('/api/dr/ca/external_calendar_references').
    map(
      (res: Response) => {
        return  new ExternalCalendar.Settings(res.json());
      }
    );
  }

  /**
   * 各プロバイダの同意画面URLを取得する
   */
  public getConsetUrl = (provider: string, platform: string): Observable<string> => {
    return this.http.get(`/api/dr/ca/authorization_url/${provider}/${platform}`).
    map(
      (res: Response) => {
        return res.json().url;
      }
    )
  }

  deleteSettingsExternalSettings(provider: string, externalCalendarId: string): Observable<SettingsExternalSettingsSaveResult> {
    // return new Observable(observer => {
    //   this.http.delete(`/api/dr/ca/delete_external_authorization/${externalCalendarId}`)
    //     .subscribe((response: Response) => {
    //       observer.next(new SettingsExternalSettingsSaveResult(response.json()));
    //       observer.complete();
    //     }, (error) => {
    //       observer.error(error);
    //     });
    // });
    return  this.http.delete(`/api/dr/ca/external_calendar_links/${provider}/${externalCalendarId}`).
    map(
      (res: Response) => {
        return res as SettingsExternalSettingsSaveResult;
      }
    );
  }

// CA0009
  getSettingsSelfSettingsStaff(type: string): Observable<SettingsSelfSettings> {
    let params, options;
    params = new URLSearchParams();
    params.append('type', type);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/dr/ca/get_calendar_references_staff', options).subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(Object.assign(new SettingsSelfSettings(), response.json()));
          observer.complete();
        } else if (response.status === HttpStatus.Forbidden) {
          observer.error(response.json());
        } else {
          observer.error(response.json());
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  getReferencedUsers(): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/dr/ca/get_referenced_users').subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(Object.assign(new SettingsReferencedUser(), response.json()));
          observer.complete();
        } else if (response.status === HttpStatus.Forbidden) {
          observer.error(response.json());
        } else {
          observer.error(response.json());
        }
      }, (error) => {
        observer.error(error.json());
      });
    });
  }

  getShareStatus(): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/dr/ca/get_share_status').subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(Object.assign(new EventGetShareStatus(), response.json()));
          observer.complete();
        } else if (response.status === HttpStatus.Forbidden) {
          observer.error(response.json());
        } else {
          observer.error(response.json());
        }
      }, (error) => {
        observer.error(error.json());
      });
    });
  }

  saveStaffCalendarSettings(dataStaffCalendarSettings): Observable<SettingsSelfSettingsSaveResult> {
    return new Observable(observer => {
      this.http.post('/api/dr/ca/save_staff_calendar_settings', dataStaffCalendarSettings).subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(Object.assign(new SettingsSelfSettingsSaveResult(), response));
          observer.complete();
        } else if (response.status === HttpStatus.Forbidden) {
          observer.error();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }
// end CA0009

  // CA0017
  getSettingsSelfSettingsPr(type: string): Observable<SettingsSelfSettings> {
    return new Observable(observer => {
        this.http.get('/api/pr/ca/get_calendar_references?type=' + type).subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(Object.assign(new SettingsSelfSettings(), response.json()));
            observer.complete();
          } else if (response.status === HttpStatus.Forbidden) {
            observer.error(response.json());
          } else {
            observer.error(response.json());
          }
        }, (error) => {
          observer.error(error);
        });
      }
    );
  }
  postSettingsSelfSettingsPr(settings): Observable<SettingsSelfSettingsSaveResult> {
    return new Observable(observer => {
      this.http.post('/api/pr/ca/save_calendar_references', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(Object.assign(new SettingsSelfSettingsSaveResult(), response));
            observer.complete();
          } else if (response.status === HttpStatus.Forbidden) {
            observer.error();
          }
        });
    });
  }
  // ca0013
  getEventDetailsSettingsPr(eventId: string): Observable<EventDetailsSettings> {
    let params, options;
    params = new URLSearchParams();
    params.append('eventId', eventId);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/pr/ca/get_event', options).subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(Object.assign(new EventDetailsSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // ca0014
  getMonthlySettingsPr(startDate, endDate): Observable<any> {
    let apiUrl;
    return new Observable(observer => {
      apiUrl = '/api/pr/ca/search_events' + '?startDate=' + encodeURIComponent(startDate) + '&endDate=' + encodeURIComponent(endDate);
      this.http.get(apiUrl).subscribe((response: Response) => {
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

  postEventCreateSettingsPr(settings: EventCreateSettings): Observable<any> {
    return new Observable(observer => {
      this.http.post('/api/pr/ca/save_event', JSON.stringify(settings))
        .subscribe((response: Response) => {
          observer.next();
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  deleteEventDetailsSettingsPr(settings: EventDeleteSettings): Observable<any> {
    return new Observable(observer => {
      let params, options;
      params = new URLSearchParams();
      params.append('id', settings.id);
      params.append('recursiveOption', settings.recursiveOption);
      options = new RequestOptions({params: params});
      this.http.delete('/api/pr/ca/delete_event', options)
        .subscribe((response: Response) => {
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
}
