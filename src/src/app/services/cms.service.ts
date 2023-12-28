import { Injectable } from '@angular/core';
import { Http, Response, ResponseContentType, RequestOptions, Headers, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { InfoInput } from '../models/cm/info-input';
import { Contactus } from '../models/cm/contactus';
import { OfficeInfo } from '../models/cm/office_info';
import {HttpStatus} from '../common/http.status';

@Injectable()
export class CmsService {

  constructor(private http: Http) {
  }

  // CM0012
  getPrepare(): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/cm/0012/prepare').subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      },(error) => {
        observer.error(error);
      });
    });
  }

  // CM0014 病床利用率取得
  getBedUseRate(date: string): Observable<any> {
    let params, options;
    params = new URLSearchParams();
    params.append('date', date);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/cm/kpi/bed_use_rate', options).subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      },(error) => {
        observer.error(error);
      });
    });
  }

  // CM0014 平均在院日数取得
  getHospitalStay(date: string): Observable<any> {
    let params, options;
    params = new URLSearchParams();
    params.append('date', date);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/cm/kpi/hospital_stay', options).subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      },(error) => {
        observer.error(error);
      });
    });
  }

  // CM0014 救護区分取得
  getReliefClass(date: string): Observable<any> {
    let params, options;
    params = new URLSearchParams();
    params.append('date', date);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/cm/kpi/relief_class', options).subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      },(error) => {
        observer.error(error);
      });
    });
  }

  // CM0014 看護必要度取得
  getNursingNeed(date: string): Observable<any> {
    let params, options;
    params = new URLSearchParams();
    params.append('date', date);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/cm/kpi/nursing_need', options).subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      },(error) => {
        observer.error(error);
      });
    });
  }

  // CM0014 外来患者数取得
  getOutpatientNumber(date: string): Observable<any> {
    let params, options;
    params = new URLSearchParams();
    params.append('date', date);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/cm/kpi/outpatient_number', options).subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      },(error) => {
        observer.error(error);
      });
    });
  }

  // CM0014 その他取得
  getOther(date: string): Observable<any> {
    let params, options;
    params = new URLSearchParams();
    params.append('date', date);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/cm/kpi/other', options).subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      },(error) => {
        observer.error(error);
      });
    });
  }

  // CM0014 KPI設定取得
  getSettings(): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/cm/kpi/settings').subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      },(error) => {
        observer.error(error);
      });
    });
  }

  // CM0014 KPI設定保存
  putSettings(data): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/cm/kpi/settings', JSON.stringify(data))
        .subscribe((response: Response) => {
          observer.next();
          observer.complete();
        }, (error) => {
          observer.error(error.json());
        });
    });
  }

  // CM0014 1次元グラフデータ保存
  putD1GraphData(data): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/cm/kpi/d1_graph_data', JSON.stringify(data))
        .subscribe((response: Response) => {
          observer.next();
          observer.complete();
        }, (error) => {
          observer.error(error.json());
        });
    });
  }

  // CM0014 2次元グラフデータ保存
  putD2GraphData(data): Observable<any> {
    return new Observable(observer => {
      this.http.put('/api/cm/kpi/d2_graph_data', JSON.stringify(data))
        .subscribe((response: Response) => {
          observer.next();
          observer.complete();
        }, (error) => {
          observer.error(error.json());
        });
    });
  }

 // CM0001
  getDrjoyInfo(infoInput: InfoInput): Observable<any> {
    let params, options;
    params = new URLSearchParams();
    params.append('keyword', infoInput.keyword);
    params.append('pageNo', infoInput.pageNo);
    params.append('pageSize', infoInput.pageSize);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/cm/drjoy_info', options).subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // CM0002
  postContactus(contactus: Contactus): Observable<any> {
    return new Observable(observer => {
      this.http.post('/api/cm/contactus', JSON.stringify(contactus)).subscribe((response: Response) => {
        observer.next();
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // CM0005 一覧
  getSentOfficeInfo(infoInput: InfoInput): Observable<any> {
    let params, options;
    params = new URLSearchParams();
    params.append('keyword', infoInput.keyword);
    params.append('pageNo', infoInput.pageNo);
    params.append('pageSize', infoInput.pageSize);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/cm/sent_office_info', options).subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // CM0005 詳細
  getSentOfficeInfoDetail(infoId: string): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/cm/sent_office_info/' + infoId).subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // CM0005 office
  getOffice(industryIds: string[]): Observable<any> {
    let params, options;
    params = new URLSearchParams();
    params.append('industryIds', industryIds);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/cm/office', options).subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // CM0005 お知らせ送信
  postOfficeInfo(officeInfo: OfficeInfo): Observable<any> {
    console.log(JSON.stringify(officeInfo, null, 4));
    return new Observable(observer => {
      this.http.post('/api/cm/office_info', JSON.stringify(officeInfo)).subscribe((response: Response) => {
        observer.next();
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // CM0005 お知らせ削除
  deleteOfficeInfo(infoId: string): Observable<any> {
    return new Observable(observer => {
      this.http.delete('/api/cm/office_info/' + infoId).subscribe((response: Response) => {
        observer.next();
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // CM0006 お気に入り一覧
  getFavoriteSns(): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/cm/favorite/sns').subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // CM0006 お気に入り削除
  deleteFavoriteSns(favoriteId: string): Observable<any> {
    return new Observable(observer => {
      this.http.delete('/api/cm/favorite/sns/' + favoriteId).subscribe((response: Response) => {
        observer.next();
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // CM0008 一覧
  getRecievedOfficeInfo(infoInput: InfoInput): Observable<any> {
    let params, options;
    params = new URLSearchParams();
    params.append('keyword', infoInput.keyword);
    params.append('pageNo', infoInput.pageNo);
    params.append('pageSize', infoInput.pageSize);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/cm/recieved_office_info', options).subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // CM0008 詳細
  getRecievedOfficeInfoDetail(infoId: string): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/cm/recieved_office_info/' + infoId).subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // CM0016
  getCuration(infoInput: InfoInput): Observable<any> {
    let params, options;
    params = new URLSearchParams();
    params.append('pageNo', infoInput.pageNo);
    params.append('pageSize', infoInput.pageSize);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/cm/curation', options).subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // CM0001とCM0007のPOPUP
  getDrInfoPopup(): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/cm/drjoy_info/news').subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // CM0001とCM0007の既読
  putDrInfoRead(infoIds: string[]): Observable<any> {
    const body = {'infoIds' : infoIds};
    return new Observable(observer => {
      this.http.put('/api/cm/drjoy_info/read', body).subscribe(() => {
        observer.next();
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // CM0005とCM0008のPOPUP
  getOfficeInfoPopup(): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/cm/office_info/news').subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // CM0005とCM0008の既読
  putOfficeInfoRead(infoIds: string[]): Observable<any> {
    const body = {'infoIds' : infoIds};
    return new Observable(observer => {
      this.http.put('/api/cm/office_info/read', body).subscribe(() => {
        observer.next();
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // CM0000 approve
  putTermOfUseApprove(version: number): Observable<any> {
    const body = {'version': version};
    return new Observable(observer => {
      this.http.put('/api/cm/term_of_use/approve', body).subscribe(() => {
        observer.next();
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // CM0000 one
  getTermOfUseOne(product?: string): Observable<any> {
    let params, options;
    params = new URLSearchParams();
    params.append('product', product);
    options = new RequestOptions({params: params});
    return new Observable(observer => {
      this.http.get('/api/cm/term_of_use/one', options).subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  // CM0000 check
  getTermOfUseCheck(): Observable<any> {
    return new Observable(observer => {
      this.http.get('/api/cm/term_of_use/check').subscribe((response: Response) => {
        observer.next(response.json());
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

}
