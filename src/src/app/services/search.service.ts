import { Injectable } from '@angular/core';
import {Http, Response, RequestOptions, URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {HttpStatus} from '../common/http.status';

@Injectable()
export class SearchService {

  constructor(private http: Http) { }

  searchKeyword(keyword: string, target: string, page: number) {
    return new Observable(observer => {
      let params, options, apiUrl;
      params = new URLSearchParams();
      params.append('keyword', keyword);
      params.append('target', target);
      params.append('page', page);
      options = new RequestOptions({ params: params });
      apiUrl = '/api/cm/search/keyword';
      this.http.get(apiUrl, options).subscribe(
        (response: Response) => {
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
}
