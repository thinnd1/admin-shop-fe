import { Injectable } from '@angular/core';
import { NotificationSettings } from '../models/re/notification-settings';
import { DepartmentSettings } from '../models/re/department-settings';
import { StaffEditSettings } from '../models/re/staff-edit-settings';
import { StaffAdminSettings } from '../models/re/staff-admin-settings';
import { StaffListSettings, DetailUser } from '../models/re/staff-list-settings';
import { FirstEntrySettings } from '../models/re/first-entry-settings';
import { FirstEntryConfirmSettings } from '../models/re/first-entry-confirm-settings';
import { UserEditSettings } from '../models/re/user-edit-settings';
import { StaffInviteSettings } from '../models/re/staff-invite-settings';
import { PrFirstEntrySettings } from '../models/re/pr-first-entry-settings';
import { PrUserEditSettings } from '../models/re/pr-user-edit-settings';
import { PrNotificationSettings } from '../models/re/pr-notification-settings';
import { PrHandlingHospitalsSettings } from '../models/re/pr-handling-hospitals-settings';
import { PrStaffInviteSettings } from '../models/re/pr-staff-invite-settings';
import { PrStaffListSettings } from '../models/re/pr-staff-list-settings';
import { Http, Response, ResponseContentType, RequestOptions, Headers, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { NotificationSettingsSaveResult } from '../models/re/notification-settings-save-result';
import { PasswordSettingsChangeResult } from '../models/re/password-settings-change-result';
import { PasswordSettingsSendApi } from '../models/re/password-setting-send-api';
import { SideMenuEditSettingsSaveResult } from '../models/re/side-menu-edit-settings-save-result';
import { StaffEditSettingsSaveResult } from '../models/re/staff-edit-settings-save-result';
import { FirstEntryConfirmSettingsSaveResult } from '../models/re/first-entry-confirm-settings-save-result';
import { UserEditSettingsSaveResult } from '../models/re/user-edit-settings-save-result';
import { PrFirstEntrySettingsSaveResult } from '../models/re/pr-first-entry-settings-save-result';
import { PrUserEditSettingsSaveResult } from '../models/re/pr-user-edit-settings-save-result';
import { PrNotificationSettingsSaveResult } from '../models/re/pr-notification-settings-save-result';
import { PrHandlingHospitalsSettingsSaveResult } from '../models/re/pr-handling-hospitals-settings-save-result';
import { PrStaffInviteSettingsSaveResult } from '../models/re/pr-staff-invite-settings-save-result';
import { HttpStatusCode } from '../common/http_status_code';
import { PrKeycodeSettings } from '../models/re/pr-keycode-settings';
import { PrKeycodeSettingsSaveResult } from '../models/re/pr-keycode-settings-save-result';
import { PrPasswordSettingsSaveResult } from '../models/re/pr-password-settings-save-result';
import { Re0010UpdateMailSendApi } from '../models/re/re0010-update-mail-send-api';
import { Re0010UpdateAdditionalMailSendApi } from '../models/re/re0010-update-additional-mail-send-api';
import { Re0020UpdateMailSendApi } from '../models/re/re0020-update-mail-send-api';
import { Re0020UpdateAdditionalMailSendApi } from '../models/re/re0020-update-additional-mail-send-api';
import { GrantUserAuthSettings } from '../models/re/grant-user-auth-settings';
import { GrantUserAuthSettingsSaveResult } from '../models/re/grant-user-auth-settings-save-result';
import { HanlingHospitalSendApi } from '../models/re/hanling-hospital-send-api';
import { PrGrantAuthSendApiSettings } from '../models/re/pr-grant-auth-send-api-settings';
import { PrGrantAuthSettingsSaveResult } from '../models/re/pr-grant-auth-settings.save-result';
import { PrGrantAuthSettings } from '../models/re/pr-grant-auth-settings';
import { HttpStatus } from '../common/http.status';
import {IndividualVerificationRequestSettings} from '../models/re/re0034-individual-verification-request-settings';
import {PrPublicSettingPersonal} from '../models/re/pr-public-setting-personal';
import {DetailMrUser} from '../models/re/detail-mr-user';
import {UserUpdateMailSave} from '../models/re/user-update-mail-save';

@Injectable()
export class RegistrationService {

  // options: any;

  private _detailUsersCash = {};

  constructor(private http: Http) {
  }

  getNotificationSettings(): Observable<NotificationSettings> {
    return new Observable(observer => {
      this.http.get('/api/dr/re/notification')
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
            observer.next(Object.assign(new NotificationSettings(), response.json()));
            observer.complete();
          } else if (response.status === HttpStatusCode.HTTP_ACCESS_DENIED) {
            observer.error();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  putNotificationSettings(settings: NotificationSettings): Observable<NotificationSettingsSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/dr/re/notification', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_PUT_SUCCESS) {
            observer.next(Object.assign(new NotificationSettingsSaveResult(), response.json()));
            observer.complete();
          } else if (response.status === HttpStatusCode.HTTP_ACCESS_DENIED) {
            observer.error();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  putPasswordSettings(settings: PasswordSettingsSendApi): Observable<PasswordSettingsChangeResult> {
    return new Observable(observer => {
      this.http.put('/api/dr/re/password', JSON.stringify(settings))
        .subscribe((response: Response) => {
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

  getSideMenuEditSettings(): Observable<SideMenuEditSettingsSaveResult> {
    return new Observable(observer => {
      this.http.get('/api/dr/re/side_menu').subscribe(
        (response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(Object.assign(new SideMenuEditSettingsSaveResult(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        },
        (error) => {
          observer.error(error);
        }
      );
    });
  }

  putSideMenuEditSettings(settings: SideMenuEditSettingsSaveResult): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/dr/re/side_menu', JSON.stringify(settings))
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

  updateIdentifyStatus(): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/pr/re/update/identify-status', {})
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

  getDepartmentSettings(): Observable<DepartmentSettings[]> {
    return new Observable(observer => {
      this.http.get('/api/dr/re/department_settings').subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(Object.assign([new DepartmentSettings()], response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  putDepartmentSettings(settings: DepartmentSettings[]): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/dr/re/department_settings', JSON.stringify(settings))
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

  getStaffEditSettings(userId: string): Observable<StaffEditSettings> {
    let params, options, apiUrl;
    // Authorization
    // headers = new Headers();
    // headers.append('Content-Type', 'application/json');
    // headers.append('Accept', 'application/json');
    // headers.append('Authorization', 'Bearer ' + Api.TOKEN);
    // Search Params
    params = new URLSearchParams();
    params.append('userId', userId);
    options = new RequestOptions({ params: params });
    return new Observable(observer => {
      apiUrl = '/api/dr/re/staff_edit/staff';
      this.http.get(apiUrl, options).subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(Object.assign(new StaffEditSettings(), response.json()));
          observer.complete();
        } else if (response.status === HttpStatus.Forbidden) {
          observer.error();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error.json());
      });
    });
  }

  putStaffEditSettings(settings: StaffEditSettings): Observable<StaffEditSettingsSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/dr/re/staff_edit/staff', JSON.stringify(settings)).subscribe((response: Response) => {
        if (response.status === HttpStatus.NotContent) {
          observer.next(Object.assign(new StaffEditSettingsSaveResult(), response));
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

  putAccountLock(id: string): Observable<StaffEditSettingsSaveResult> {
    let apiUrl;
    // Authorization
    // headers = new Headers();
    // headers.append('Content-Type', 'application/json');
    // headers.append('Accept', 'application/json');
    // headers.append('Authorization', 'Bearer ' + Api.TOKEN);
    return new Observable(observer => {
      apiUrl = '/api/dr/re/staff_edit/staff/lock?userId=' + id;
      this.http.put(apiUrl, '').subscribe((response: Response) => {
        if (response.status === HttpStatus.NotContent) {
          observer.next(Object.assign(new StaffEditSettingsSaveResult(), response));
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

  putAccountUnlock(id: string): Observable<StaffEditSettingsSaveResult> {
    let apiUrl;
    // Authorization
    // headers = new Headers();
    // headers.append('Content-Type', 'application/json');
    // headers.append('Accept', 'application/json');
    // headers.append('Authorization', 'Bearer ' + Api.TOKEN);
    return new Observable(observer => {
      apiUrl = '/api/dr/re/staff_edit/staff/unlock?userId=' + id;
      this.http.put(apiUrl, '').subscribe((response: Response) => {
        if (response.status === HttpStatus.NotContent) {
          observer.next(Object.assign(new StaffEditSettingsSaveResult(), response));
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

  putDeleteAccount(id: string): Observable<StaffEditSettingsSaveResult> {
    let apiUrl;
    // Authorization
    // headers = new Headers();
    // headers.append('Content-Type', 'application/json');
    // headers.append('Accept', 'application/json');
    // headers.append('Authorization', 'Bearer ' + Api.TOKEN);
    return new Observable(observer => {
      apiUrl = '/api/dr/re/staff_edit/staff?userId=' + id;
      this.http.delete(apiUrl).subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(Object.assign(new StaffEditSettingsSaveResult(), response));
          observer.complete();
        } else if (response.status === HttpStatus.Forbidden) {
          observer.error();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error.json());
      });
    });
  }

  getStaffAdminSettings(department: string, name: string, sort: any, page: any, size: any): Observable<StaffAdminSettings> {
    let params, options, apiUrl;
    // Search Params
    params = new URLSearchParams();
    params.append('departmentId', department);
    params.append('name', name);
    params.append('group', '0');
    params.append('sort', sort);
    params.append('page', page);
    params.append('size', size);
    options = new RequestOptions({ params: params });
    return new Observable(observer => {
      apiUrl = '/api/dr/re/staff_admin/users';
      this.http.get(apiUrl, options).subscribe((response: Response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          observer.next(Object.assign(new StaffAdminSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error.json());
      });
    });
  }
  // RE0015 Front
  getStaffInviteSettings(department: string, name: string, sort: any, page: any, size: any): Observable<StaffInviteSettings> {
    let headers, params, options, apiUrl;
    // Authorization
    headers = new Headers();
    // Search Params
    params = new URLSearchParams();
    params.append('departmentId', department);
    params.append('keyword', name);
    params.append('sort', sort);
    params.append('page', page);
    params.append('size', size);
    options = new RequestOptions({ headers: headers, params: params });
    return new Observable(observer => {
      apiUrl = '/api/dr/re/staff_invite/provisional_users';
      this.http.get(apiUrl, options).subscribe((response: Response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          observer.next(Object.assign(new StaffInviteSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // RE0018 Front
  getStaffListSettings(department: string, name: string, group: string, sort: any, page: any, size: any): Observable<StaffListSettings> {
    let params, options, apiUrl;
    params = new URLSearchParams();
    params.append('departmentId', department);
    params.append('name', name);
    params.append('group', group);
    params.append('sort', sort);
    params.append('page', page);
    params.append('size', size);
    options = new RequestOptions({ params: params });
    return new Observable(observer => {
      apiUrl = '/api/dr/re/staff_list/users';
      this.http.get(apiUrl, options).subscribe((response: Response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          observer.next(Object.assign(new StaffListSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  /**
   * RE0018 ユーザ情報
   * @param id
   * @param reload
   */
  getStaffListDetail(id: string, reload?: boolean): Observable<DetailUser> {
    if (!reload && this._detailUsersCash[id]) {
      return new Observable(
        (observer) => {
          observer.next(this._detailUsersCash[id]);
          observer.complete();
        }
      );
    }

    return this.http.get(`/api/dr/re/detail_user/user?userId=${id}`).
    map(
      (response: Response) => {
        this._detailUsersCash[id] =  Object.assign(new DetailUser(), response.json());
        return this._detailUsersCash[id];
      }
    );
  }
  getDetailMR(id: string, reload?: boolean): Observable<DetailMrUser> {
    if (!reload && this._detailUsersCash[id]) {
      return new Observable(
        (observer) => {
          observer.next(this._detailUsersCash[id]);
          observer.complete();
        }
      );
    }

    return this.http.get(`/api/pr/re/detail_staff?officeUserId=${id}`).
    map(
      (response: Response) => {
        this._detailUsersCash[id] =  Object.assign(new DetailMrUser(), response.json());
        return this._detailUsersCash[id];
      }
    );
  }

  getFirstEntrySettings(): Observable<FirstEntrySettings> {
    return new Observable(observer => {
      this.http.get('/api/dr/re/first_entry/user').subscribe((response: Response) => {
        observer.next(Object.assign(new FirstEntrySettings('', '', '', '',
          '', '', '', '', false, '',
          false, '', '', '',
          '', '', '', '', ''),
          response.json()));
        observer.complete();
      }, (error) => {
        observer.error(error.json());
      });
    });
  }

  putFirstEntryConfirmSettings(settings: FirstEntryConfirmSettings): Observable<FirstEntryConfirmSettingsSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/dr/re/first_entry/user', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_PUT_SUCCESS) {
            observer.next(Object.assign(new FirstEntryConfirmSettingsSaveResult(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getUserEditSettings(): Observable<UserEditSettings> {
    return new Observable(observer => {
      this.http.get('/api/dr/re/user_edit/get_user').subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(Object.assign(new UserEditSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  putUserEditSettings(settings: UserEditSettings): Observable<UserEditSettingsSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/dr/re/user_edit/user', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.NotContent) {
            observer.next(Object.assign(new UserEditSettingsSaveResult(), response));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  putDeleteUser(userId: any): Observable<any> {
    return new Observable(observer => {
      this.http.delete('/api/dr/re/user_edit/delete_user/' + userId).subscribe((response: Response) => {
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

  getDrMailAddressChangeReservation(reservationToken: any): Observable<any> {
    let apiUrl;
    apiUrl = '/api/dr/re/user_edit/mail_address_change_reservation/' + reservationToken;
    return new Observable(observer => {
      this.http.get(apiUrl).subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(Object.assign(new UserEditSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  updateDrMailAddress(settings: Re0020UpdateMailSendApi): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/dr/re/user_edit/update_mail_address', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(Object.assign(new UserUpdateMailSave(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getDrAdditionalMailAddressChangeReservation(reservationToken: any): Observable<any> {
    let apiUrl;
    apiUrl = '/api/dr/re/user_edit/additional_mail_address_change_reservation/' + reservationToken;
    return new Observable(observer => {
      this.http.get(apiUrl).subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(Object.assign(new UserEditSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  updateDrAdditionalMailAddress(settings: Re0020UpdateAdditionalMailSendApi): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/dr/re/user_edit/additional_update_mail_address', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(Object.assign(new UserUpdateMailSave(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  /**
   * RE-0006 GET OFFICE DATA
   */
  getPrFirstEntrySettings(token: string): Observable<PrFirstEntrySettings> {
    return new Observable(observer => {
      this.http.get('/api/pr/re/first_entry/get_user_entry?entryToken=' + token).subscribe((response: Response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          observer.next(Object.assign([new PrFirstEntrySettingsSaveResult()], response.json()));
          observer.complete();
        } else if (response.status === HttpStatusCode.HTTP_ACCESS_DENIED) {
          observer.error();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  /**
   * RE-0006 POST DATA
   */

  postUploadImage(settings): Observable<any> {
    return new Observable(observer => {
      this.http.post('/api/pr/re/update_image_profile', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_POST_SUCCESS) {
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
  postPrFirstEntrySettings(settings: PrFirstEntrySettings): Observable<PrFirstEntrySettingsSaveResult> {
    return new Observable(observer => {
      this.http.post('/api/pr/re/first_entry/create_user', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_POST_SUCCESS) {
            observer.next(Object.assign(new PrFirstEntrySettingsSaveResult(), response));
            observer.complete();
          } else if (response.status === HttpStatusCode.HTTP_ACCESS_DENIED) {
            observer.error();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error.json());
        });
    });
  }

  getPrUserEditSettings(): Observable<PrUserEditSettings> {
    return new Observable(observer => {
      this.http.get('/api/pr/re/user_edit/get_user').subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(Object.assign(new PrUserEditSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  putPrUserEditSettings(settings: PrUserEditSettings): Observable<PrUserEditSettingsSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/pr/re/user_edit/user', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.NotContent) {
            observer.next(Object.assign(new PrUserEditSettingsSaveResult(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getPrMailAddressChangeReservation(reservationToken: any): Observable<any> {
    let apiUrl;
    apiUrl = '/api/pr/re/user_edit/mail_address_change_reservation/' + reservationToken;
    return new Observable(observer => {
      this.http.get(apiUrl).subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(Object.assign(new UserEditSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  updatePrMailAddress(settings: Re0010UpdateMailSendApi): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/pr/re/user_edit/update_mail_address', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(Object.assign(new UserUpdateMailSave(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getPrAdditionalMailAddressChangeReservation(reservationToken: any): Observable<any> {
    let apiUrl;
    apiUrl = '/api/pr/re/user_edit/additional_mail_address_change_reservation/' + reservationToken;
    return new Observable(observer => {
      this.http.get(apiUrl).subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(Object.assign(new UserEditSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  updatePrAdditionalMailAddress(settings: Re0010UpdateAdditionalMailSendApi): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/pr/re/user_edit/additional_update_mail_address', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(Object.assign(new UserUpdateMailSave(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  deletePrUser(userId: any): Observable<any> {
    return new Observable(observer => {
      this.http.delete('/api/pr/re/user_edit/delete_user/' + userId).subscribe((response: Response) => {
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

  getPrNotificationSettings(): Observable<PrNotificationSettings> {
    return new Observable(observer => {
      this.http.get('/api/pr/re/notification')
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
            observer.next(Object.assign(new PrNotificationSettings(), response.json()));
            observer.complete();
          } else if (response.status === HttpStatusCode.HTTP_ACCESS_DENIED) {
            observer.error();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  putPrNotificationSettings(settings: PrNotificationSettings): Observable<PrNotificationSettingsSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/pr/re/notification', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_PUT_SUCCESS) {
            observer.next(Object.assign(new PrNotificationSettingsSaveResult(), response.json()));
            observer.complete();
          } else if (response.status === HttpStatusCode.HTTP_ACCESS_DENIED) {
            observer.error();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getPrHandlingHospitalsSettings(): Observable<PrHandlingHospitalsSettings> {
    return new Observable(observer => {
      this.http.get('/api/pr/re/handling_hospitals').subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(Object.assign(new PrHandlingHospitalsSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  postPrHandlingOtherHospitalsSettings(officeId: string): Observable<PrHandlingHospitalsSettingsSaveResult> {
    return new Observable(observer => {
      this.http.post('/api/pr/re/handling_other_hospitals', JSON.stringify(officeId))
        .subscribe((response: Response) => {
          observer.next(Object.assign(new PrHandlingHospitalsSettingsSaveResult(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  searchMedicalOffices(): Observable<PrHandlingHospitalsSettingsSaveResult[]> {
    const headers = new Headers();
    const options = new RequestOptions({ headers: headers });
    return new Observable(observer => {
      this.http.get('/api/ma/search/medical_offices').subscribe((response: Response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          observer.next(Object.assign([new PrHandlingHospitalsSettings()], response.json()));
          observer.complete();
        } else if (response.status === HttpStatusCode.HTTP_ACCESS_DENIED) {
          observer.error();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }


  postPrHandlingHospitalsSettings(settings: PrHandlingHospitalsSettings): Observable<PrHandlingHospitalsSettingsSaveResult> {
    return new Observable(observer => {
      this.http.post('/api/pr/re/handling_hospitals', JSON.stringify(settings))
        .subscribe((response: Response) => {
          observer.next(Object.assign(new PrHandlingHospitalsSettingsSaveResult(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  deleteHandlingOtherHospitals(officeId: string): Observable<any> {
    return new Observable(observer => {
      this.http.delete('/api/pr/re/handling_hospitals/' + officeId)
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.NotContent) {
            observer.next(response.status);
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getPrStaffInviteSettings(): Observable<PrStaffInviteSettings[]> {
    return new Observable(observer => {
      this.http.get('/api/pr/re/staff_invite/handle_offices').subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(Object.assign([new PrStaffInviteSettings()], response.json()));
          observer.complete();
        } else if (response.status === HttpStatus.Forbidden) {
          observer.error();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error.json());
      });
    });
  }

  postPrStaffInviteSettings(settings: PrStaffInviteSettings): Observable<PrStaffInviteSettingsSaveResult> {
    return new Observable(observer => {
      this.http.post('/api/pr/re/staff_invite/invite_user', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(Object.assign(new PrStaffInviteSettingsSaveResult(), response.json()));
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

  getPrStaffListSettings(name: string, sort: any, page: any, size: any): Observable<PrStaffListSettings> {
    let params, options, apiUrl;
    params = new URLSearchParams();
    params.append('keyword', name);
    params.append('sort', sort);
    params.append('page', page);
    params.append('size', size);
    options = new RequestOptions({ params: params });
    return new Observable(observer => {
      apiUrl = '/api/pr/re/staff_list';
      this.http.get(apiUrl, options).subscribe((
        response: Response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          observer.next(Object.assign(new PrStaffListSettings(), response.json()));
          observer.complete();
        } else if (response.status === HttpStatusCode.HTTP_ACCESS_DENIED) {
          observer.error();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  postPrKeycodeSettings(settings: PrKeycodeSettings): Observable<PrKeycodeSettingsSaveResult> {
    return new Observable(observer => {
      this.http.post('/api/pr/re/keycode', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
            observer.next(Object.assign(new PrKeycodeSettingsSaveResult(), response));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  putPrPasswordSettings(settings: PasswordSettingsSendApi): Observable<PrPasswordSettingsSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/pr/re/password', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.NotContent) {
            observer.next(Object.assign(new PrPasswordSettingsSaveResult(), response.json()));
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

  downloadCSV(): Observable<any> {
    const download_url = '../../assets/examples/RE0015.xlsx';
    const options = { responseType: ResponseContentType.ArrayBuffer };
    return new Observable(observer => {
      this.http.get(download_url, options).subscribe((response: Response) => {
        observer.next(response);
        observer.complete();
      });
    });
  }

  staffInviteSendEmail(listStaff): Observable<any> {
    return new Observable(observer => {
      this.http.post('/api/dr/re/staff_invite/send_invitation_mail', JSON.stringify(listStaff)).subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      });
    });
  }

  staffInviteTempRegist(listStaff): Observable<any> {
    return new Observable(observer => {
      this.http.post('/api/dr/re/staff_invite/invite_users', JSON.stringify({ 'usersRequestRequestList': listStaff }))
        .subscribe((response: Response) => {
          observer.next(response.json());
          observer.complete();
        },(error) => {
          observer.error(error);
        });
    });
  }
  deleteHandlingHospitals(officeId: string): Observable<PrHandlingHospitalsSettingsSaveResult> {
    const params = new URLSearchParams();
    params.append('officeId', officeId);
    const options = new RequestOptions({ params: params });
    return new Observable(observer => {
      this.http.post('/api/pr/re/handling_hospitals', options)
        .subscribe((response: Response) => {
          observer.next(Object.assign(new PrHandlingHospitalsSettingsSaveResult(), response.json()));
          observer.complete();
        }, (error) => {
          observer.error(error);
        });
    });
  }

  createHandlingHospitals(settings: HanlingHospitalSendApi): Observable<PrHandlingHospitalsSettingsSaveResult> {
    return new Observable(observer => {
      this.http.post('/api/pr/re/handling_hospitals', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.NotContent) {
            observer.next(Object.assign(new PrHandlingHospitalsSettingsSaveResult(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getSearchMedicalOffices(keyword: any): Observable<PrHandlingHospitalsSettings> {
    let headers, params, options, apiUrl;
    // Authorization
    headers = new Headers();
    // Search Params
    params = new URLSearchParams();
    params.append('keyword', keyword);
    apiUrl = '/api/medical_offices';
    options = new RequestOptions({ headers: headers, params: params });
    return new Observable(observer => {
      this.http.get(apiUrl, options).subscribe((response: Response) => {
        if (response.status === HttpStatus.OK) {
          observer.next(Object.assign(new PrHandlingHospitalsSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  getPrGrantAuthSettings(department: string, name: string, group: string, sort: any, page: any, size: any): Observable<PrGrantAuthSettings> {
    let headers, params, options, apiUrl;
    // Authorization
    headers = new Headers();
    // Search Params
    params = new URLSearchParams();
    params.append('departmentId', department);
    params.append('name', name);
    params.append('group', group);
    params.append('sort', sort);
    params.append('page', page);
    params.append('size', size);
    options = new RequestOptions({ headers: headers, params: params });
    return new Observable(observer => {
      apiUrl = '/api/dr/re/grant_auth/users';
      this.http.get(apiUrl, options).subscribe((response: Response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          observer.next(Object.assign(new PrGrantAuthSettings(), response.json()));
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error(error);
      });
    });
  }

  putPrGrantAuthSettings(settings: PrGrantAuthSendApiSettings): Observable<PrGrantAuthSettingsSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/dr/re/grant_auth/user', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_PUT_SUCCESS) {
            observer.next(Object.assign(new PrGrantAuthSettingsSaveResult(), response));
            observer.complete();
          } else {
            observer.error(response.json());
          }
        }, (error) => {
          observer.error(error.json());
        });
    });
  }

  putGrantAuthUser(settings: GrantUserAuthSettings): Observable<GrantUserAuthSettingsSaveResult> {
    return new Observable(observer => {
      this.http.put('/api/dr/re/grant_auth/user', JSON.stringify(settings)).subscribe((response: Response) => {
        if (response.status === HttpStatusCode.HTTP_PUT_SUCCESS) {
          observer.next(Object.assign(new GrantUserAuthSettingsSaveResult(), response));
          observer.complete();
        } else {
          observer.error(response.json());
        }
        // observer.next(Object.assign(new GrantUserAuthSettingsSaveResult(), response.json()));
        // observer.complete();
      }, (error) => {
        observer.error(error.json());
      });
    });
  }

  checkPassword(userId: string, password: string): Observable<boolean> {
    return Observable.create(observer => {
      let params, options;
      params = new URLSearchParams();
      params.append('userId', userId);
      params.append('password', password);
      options = new RequestOptions({params: params});
      this.http.get('/api/dr/re/user_edit/check_password', options).subscribe(response => {
        if (response.status === HttpStatus.OK) {
          observer.next(response.json());
          observer.complete();
        } else {
          observer.error();
        }
      }, error => {
        observer.error();
      });
    });
  }

  // OF0001
  postRegisterPersonalAccount(data: any): Observable<any> {
    return new Observable(observer => {
      return this.http.post('/api/ba/ba0014/register-personal-account', JSON.stringify(data)).subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      }, error => {
        observer.error(error);
      });
    });
  }
  // re0013
  forgotPasswordPr(email: string): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/pr/re/password/forget-password?email=' + encodeURIComponent(email)).subscribe((response: Response) => {
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

  getPersonalReg(): Observable<IndividualVerificationRequestSettings> {
    return Observable.create(observer => {
      this.http.get('/api/dr/re/detail_user/personal').subscribe(response => {
        if (response.status === HttpStatus.OK) {
          observer.next(response.json());
          observer.complete();
        } else {
          observer.error();
        }
      }, (error) => {
        observer.error();
      });
    });
  }
  resetPasswordPr(model: any): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/pr/re/password/reset-password', JSON.stringify(model)).subscribe((response: Response) => {
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

  putPersonalReg(settings: IndividualVerificationRequestSettings): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/dr/re/put_user/personal', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.OK) {
            observer.next(Object.assign(response));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }
  // re0022
  forgotPasswordDr(email: string): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/dr/re/password/forget-password?email=' + encodeURIComponent(email)).subscribe((response: Response) => {
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

  resetPasswordDr(model: any): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/dr/re/password/reset-password', JSON.stringify(model)).subscribe((response: Response) => {
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


  // RE0036
  getPrPublicSetting(): Observable<PrPublicSettingPersonal> {
    return Observable.create(observer => {
      this.http.get('/api/pr/re/option_setting').subscribe(response => {
        if (response.status === HttpStatus.OK) {
          observer.next(response.json());
          observer.complete();
        } else {
          observer.error();
        }
      }, error => {
        observer.error();
      });
    });
  }

  putPrPublicSetting(settings: PrPublicSettingPersonal): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/pr/re/option_setting', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatus.NotContent) {
            observer.next(Object.assign(response));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }
  postUploadImageAvatar(settings): Observable<any> {
    return new Observable(observer => {
      this.http.post('/api/pr/re/update_image_profile_only', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_POST_SUCCESS) {
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
}
