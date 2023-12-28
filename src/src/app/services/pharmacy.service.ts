import {Injectable} from '@angular/core';
import {Http, Response, RequestOptions, URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {CreatePharmacyGroupPrepare} from '../models/ph/create-pharmacy-group-prepare';
import {User} from '../models/ph/user';
import {CreatePharmacyGroupSettingsSendApi} from '../models/ph/create-pharmacy-group-settings-send-api';
import {CreatePharmacyGroupSaveResult} from '../models/ph/create-pharmacy-group-save-result';
import {HttpStatusCode} from '../common/http_status_code';
import {ReportUpdateSetting} from '../models/ph/report-update-setting';
import {ReportUpdateSettingsResult} from '../models/ph/report-update-settings-result';
import {TracingReport} from '../models/ph/tracing-report';
import {CustomQueryEncoder} from '../common/custom_query_encoder';
import {UpdateProtocol} from '../models/ph/update-protocol';
import {CreateTemplate} from '../models/ph/create-template';

@Injectable()
export class PharmacyService {

  constructor(private http: Http) {
  }

  getCreatePharmacyGroupPrepare(): Observable<CreatePharmacyGroupPrepare> {
    return new Observable(observer => {
      this.http.get('/api/dr/ph/group/collaboration/save/prepare').subscribe((response: Response) => {
        observer.next(Object.assign(new CreatePharmacyGroupPrepare(), response.json()));
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  searchPharmacyMember(email: string): Observable<User> {
    return new Observable(observer => {
      const apiUrl = '/api/dr/ph/member/search?mail=' + email;
      this.http.get(apiUrl).subscribe((response: Response) => {
        if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
          if (response.text()) {
            observer.next(Object.assign(new User(), response.json()));
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

  postCreatePharmacyGroup(settings: CreatePharmacyGroupSettingsSendApi) {
    return new Observable(observer => {
      this.http.post('/api/dr/ph/group/collaboration/save', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
            observer.next(Object.assign(new CreatePharmacyGroupSaveResult(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  // ph0002 + ph0010
  getTracingReportList(searchParam): Observable<any> {
    let params;
    params = params = new URLSearchParams('', new CustomQueryEncoder());
    params.append('text', searchParam.text);
    params.append('start', searchParam.start);
    params.append('end', searchParam.end);
    params.append('officeId', searchParam.officeId);
    params.append('isRead', searchParam.isRead);
    params.append('hasComment', searchParam.hasComment);
    params.append('page', searchParam.page);
    params.append('pageSize', searchParam.pageSize);
    return new Observable(observer => {
      this.http.get('/api/ph/drugs-usage', {params: params})
        .subscribe((response: Response) => {
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

// ph0013 + ph0004
  getUpdateReportStatistic(searchParam): Observable<any> {
    let params;
    params = new URLSearchParams('', new CustomQueryEncoder());
    params.append('patientCodeOrName', searchParam.patientCodeOrName);
    params.append('prescriptionUpdateReason', searchParam.prescriptionUpdateReason);
    params.append('dateFrom', searchParam.dateFrom);
    params.append('dateTo', searchParam.dateTo);
    params.append('officeId', searchParam.officeId);
    params.append('pageNumber', searchParam.page);
    params.append('pageLimit', searchParam.pageSize);
    return new Observable(observer => {
      this.http.get('/api/ph/prescription/update-report', {params: params})
        .subscribe((response: Response) => {
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

  // ph0003 + ph0011
  getTracingReport(id): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/ph/drug-usage?topicId=' + id)
        .subscribe((response: Response) => {
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

  // ph0003 + ph0011
  postCreateComment(requestBody): Observable<any> {
    return new Observable(observer => {
      this.http.post('/api/ph/comment', requestBody)
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_PUT_SUCCESS) {
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

  // ph0015
  postReportUpdate(settings: ReportUpdateSetting): Observable<ReportUpdateSettingsResult> {
    return new Observable(observer => {
      this.http.post('/api/ph/prescription/create/report_update', JSON.stringify(settings))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_POST_SUCCESS) {
            observer.next(Object.assign(new ReportUpdateSettingsResult(), response.json()));

            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getMostRecentReportInfo(): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/ph/collaboration/most-recent-report-info')
        .subscribe((response: Response) => {
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

  // ph0006 + ph0020
  getListHanleDrug(searchParam): Observable<any> {
    let params;
    params = new URLSearchParams();
    params.append('officeId', searchParam.officeId);
    params.append('keyword', searchParam.productName);
    params.append('companyName', searchParam.companyName);
    params.append('nameInitial', searchParam.nameInitial);
    params.append('isAdoptedOnly', searchParam.isAdoptedOnly);
    params.append('page', searchParam.page);
    params.append('pageSize', searchParam.pageSize);
    return new Observable(observer => {
      this.http.get('/api/ph/adopted-drug', {params: params})
        .subscribe((response: Response) => {
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
  getShareByOffice(): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/ph/shared-by/offices')
        .subscribe((response: Response) => {
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
  // ph0008 + ph0019
  getTracingReportStatics(searchParam): Observable<any> {
    let params;
    params = new URLSearchParams('', new CustomQueryEncoder());
    params.append('start', searchParam.start);
    params.append('page', searchParam.page);
    params.append('pageSize', searchParam.pageSize);
    return new Observable(observer => {
      this.http.get('/api/ph/tracing-report/statistics', {params: params})
        .subscribe((response: Response) => {
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

  // ph0009+ ph0018
  getChangesInPrescriptionList(searchParam): Observable<any> {
    let params;
    params = new URLSearchParams('', new CustomQueryEncoder());
    params.append('start', searchParam.start);
    params.append('page', searchParam.page);
    params.append('pageSize', searchParam.pageSize);
    return new Observable(observer => {
      this.http.get('/api/ph/prescription/update-report/statistics', {params: params})
        .subscribe((response: Response) => {
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

  // ph0007 + ph0017
  getProtocol(officeId): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/ph/protocol?officeId=' + officeId)
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
            observer.next(response['_body'] ? response.json() : '');
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  // ph0012
  postCreateTracingReport(report: TracingReport) {
    return new Observable(observer => {
      this.http.post('/api/ph/tracing-report/create', JSON.stringify(report))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_POST_SUCCESS) {
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

// ph0014
  getUpdateReport(topicId): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/ph/prescription/update-report/' + topicId)
        .subscribe((response: Response) => {
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

  getListHospital(searchParam?): Observable<any> {
    let params;
    params = new URLSearchParams();
    if (searchParam) {
      params.append('officeUserId', searchParam.officeUserId);
      params.append('drugStoreOfficeId', searchParam.drugStoreOfficeId);
    }
    return new Observable(observer => {
      this.http.get('/api/ph/group/collaboration/hospitals', {params: params})
        .subscribe((response: Response) => {
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

  getListCurrentHospital(): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/ph/group/collaborating/hospitals')
        .subscribe((response: Response) => {
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

  getListDrugStore(medicalOfficeId): Observable<any> {
    let params;
    params = new URLSearchParams();
    params.append('medicalOfficeId', medicalOfficeId);
    return new Observable(observer => {
      this.http.get('/api/ph/group/collaboration/drug-stores', {params: params})
        .subscribe((response: Response) => {
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

  getListDoctor(medicalOfficeId): Observable<any> {
    let params;
    params = new URLSearchParams();
    params.append('medicalOfficeId', medicalOfficeId);
    return new Observable(observer => {
      this.http.get('/api/ph/collaboration/doctors', {params: params})
        .subscribe((response: Response) => {
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

// ph0012 + ph0015
  putSaveFile(requestBody) {
    return new Observable(observer => {
      this.http.put('/api/ph/collaboration/save-files', JSON.stringify(requestBody))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_POST_SUCCESS) {
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

  // ph0026
  getTemplate(): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/ph/template')
        .subscribe((response: Response) => {
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


  // ph0007
  putUpdateProtocol(report: UpdateProtocol) {
    return new Observable(observer => {
      this.http.put('/api/ph/protocol', JSON.stringify(report))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_PUT_SUCCESS) {
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

  // ph0024
  getSharingOffice(): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/ph/sharing/office')
        .subscribe((response: Response) => {
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

  // ph0021 + ph0023
  putRegisterDrugForHospital(requestBody) {
    return new Observable(observer => {
      this.http.put('/api/ph/adopted-drug', JSON.stringify(requestBody))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_POST_SUCCESS) {
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

  // ph0024
  putSharingAdoptedDrug(data) {
    return new Observable(observer => {
      this.http.put('/api/ph/sharing/office/adopted-drug', JSON.stringify(data))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_PUT_SUCCESS) {
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
  // ph0026
  postCreateTemplate(report: CreateTemplate) {
    return new Observable(observer => {
      this.http.post('/api/ph/template', JSON.stringify(report))
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_POST_SUCCESS) {
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
  // ph0026
  getDetailTemplate(templateId): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/ph/template/' + templateId)
        .subscribe((response: Response) => {
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
  // ph0026
  deleteTemplate(templateId): Observable<any> {
    return new Observable(observer => {
      this.http.delete('/api/ph/template/' + templateId)
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_DELETE_SUCCESS) {
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
