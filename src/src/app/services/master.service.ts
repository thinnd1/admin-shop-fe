import { Injectable } from '@angular/core';
import {Http, RequestMethod, RequestOptions, Response, URLSearchParams} from '@angular/http';
import {PharmaOfficeInfoSettings} from '../models/ma/pharma-office-info-settings';
import {Observable} from 'rxjs/Observable';
import {HttpStatusCode} from '../common/http_status_code';
import {HandleField} from '../models/ma/handle-field';
import {IndustryType} from '../models/ma/industry-type';
import {Prefecture} from '../models/ma/prefecture';
import {SpecialityArea} from '../models/ma/speciality-area';
import {JobType} from '../models/ma/job-type';
import {MedicalOffice} from '../models/ma/medical-office';
import {SpecialityType} from '../models/ma/speciality-type';
import {CustomQueryEncoder} from '../common/custom_query_encoder';
@Injectable()
export class MasterService {

  constructor( private http: Http) { }

  getPharmaOfficeInfo(): Observable<PharmaOfficeInfoSettings> {
    return new Observable(observer => {
      this.http.get('/api/ma/get/pharmacy_offices')
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
            observer.next(Object.assign(new PharmaOfficeInfoSettings(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }
  getHandleField(): Observable<HandleField> {
    return new Observable(observer => {
      this.http.get('/api/ma/get/mr_field_types?keyword=')
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
            observer.next(Object.assign(new HandleField(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }
  getIndustryType(): Observable<IndustryType> {
    return new Observable(observer => {
      this.http.get('/api/ma/get/industry_types')
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
            observer.next(Object.assign(new IndustryType(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }
  getPrefecture(): Observable<Prefecture> {
    return new Observable(observer => {
      this.http.get('/api/ma/get/prefectures')
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
            observer.next(Object.assign(new Prefecture(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }
  getSpecialityAreas(): Observable<SpecialityArea> {
    return new Observable(observer => {
      this.http.get('/api/ma/get/specialty_areas?keyword=')
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
            observer.next(Object.assign(new SpecialityArea(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }
  getSpecialityTypes(): Observable<SpecialityType> {
    return new Observable(observer => {
      this.http.get('/api/ma/get/specialty_types?keyword=')
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
            observer.next(Object.assign(new SpecialityType(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }
  getJobType(): Observable<JobType> {
    return new Observable(observer => {
      this.http.get('/api/ma/get/job_types')
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
            observer.next(Object.assign(new JobType(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }
  getMedicalOffices(keyword: string, page: number, size: number): Observable<MedicalOffice> {
    let params, options;
    params = new URLSearchParams();
    params.append('keyword', keyword);
    params.append('page', page);
    params.append('size', size);
    options = new RequestOptions({ params: params });
    return new Observable(observer => {
      this.http.get('/api/ma/get/medical_offices_with_page', options)
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
            observer.next(Object.assign(new MedicalOffice(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getMedicals(keyword: string, page: number, size: number): Observable<MedicalOffice> {
    let params, options;
    params = new URLSearchParams();
    params.append('keyword', keyword);
    params.append('page', page);
    params.append('size', size);
    options = new RequestOptions({ params: params });
    return new Observable(observer => {
      this.http.get('/api/ba/ba0014/search-medical-offices', options)
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
            observer.next(Object.assign(new MedicalOffice(), response.json()));
            observer.complete();
          } else {
            observer.error();
          }
        }, (error) => {
          observer.error(error);
        });
    });
  }

  getListDrug(): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/ma/get/drugs')
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
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

  getListIndustry(id: string): Observable<any> {
    let params, options;
    params = new URLSearchParams();
    params.append('medicalOfficeId', id);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/ba/ba0014/available-prs', options)
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
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
  getListDrugWithPaging(keyword: string, page: number, size: number, productNameInitial: string): Observable<any> {
    let params;
    params = new URLSearchParams('', new CustomQueryEncoder());
    params.append('keyword', keyword);
    params.append('productNameInitial', productNameInitial);
    params.append('page', page);
    params.append('size', size);
    return new Observable(observer => {
      this.http.get('/api/ma/get/drugs_with_page', {params: params})
        .subscribe((response: Response) => {
          if (response.status === HttpStatusCode.HTTP_GET_SUCCESS) {
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
}
