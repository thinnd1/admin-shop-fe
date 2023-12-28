import { Injectable } from '@angular/core';
import { Http, Response, ResponseContentType, RequestOptions, Headers, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpStatus } from '../common/http.status';
import { Company } from "../models/ba/company";

namespace URL {
  export const COMPANIES = "/api/ba/partner_companies";
}

@Injectable()
export class BaseService {
  private static _counter = 0;

  private _companiesCash = {};

  constructor(private http: Http) {
    if (0 < BaseService._counter) {
      throw new Error("Double inject");
    }
    BaseService._counter ++;
  }

  /**
   * BA0011_017 取引先会社一覧を取得する
   * @param officeId 
   * @param reload 
   */
  public getCompanies(officeId: string, reload?: boolean): Observable<Company[]> {
    if (!reload && this._companiesCash[officeId]) {
      return new Observable(
        (observer) => {
          observer.next(this._companiesCash[officeId]);
          observer.complete();
        }
      );
    }

    return this.http.get(`${URL.COMPANIES}?officeId=${officeId}`).
    map(
      (response: Response) => {
        this._companiesCash[officeId] =  response.json();
        return this._companiesCash[officeId];
      }
    );
  }


}
