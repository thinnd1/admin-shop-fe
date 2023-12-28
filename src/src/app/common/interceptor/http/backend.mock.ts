import {MockBackend, MockConnection} from '@angular/http/testing';
import {Http, Request, RequestMethod, RequestOptions, Response, ResponseOptions, XHRBackend} from '@angular/http';
import {setTimeout} from 'timers';
import {Injectable} from '@angular/core';
import {HttpStatus} from '../../http.status';
import {HttpError} from '../../error/http.error';

import { AuthenticationService } from "../../../services/authentication.service";

@Injectable()
export class BackendMock extends Http {

  // Instance variables
  // --------------------------------------------------------------------------
  private mockBackend: MockBackend;
  private reqestOptions: RequestOptions;


  // Append test code methods
  // --------------------------------------------------------------------------
  private static getResponseStatus(req: Request): {code: number, msgs?: string[]} {
    // change password
    if (req.url.endsWith('/dr/re/password')) {
      return BackendMock.dr_re_password(req);
    }
    // global
    if (req.method === RequestMethod.Put) {
      return {code: HttpStatus.NotContent};
    }
    return {code: HttpStatus.OK};
  }

  // change password
  private static dr_re_password(req: Request): {code: number, msgs?: string[]} {
    // request data
    const data = JSON.parse(req.getBody());
    // statuc code
    if (data.currentPassword === 'error') {
      return {code: HttpStatus.BadRequest, msgs: ['COMMON.SAVE_FAILED']};
    }
    return {code: HttpStatus.NotContent};
  }


  // Json path
  // --------------------------------------------------------------------------
  private static jsonPath(req: Request): string {
    const array = req.url.split('?');

    // /api/dr/re/user_edit/delete_user
    if (array[0].startsWith('/api/dr/re/user_edit/delete_user')) {
      return this.json_dr_re_user_edit_delete_user(req);
    }
    // /api/pr/re/user_edit/delete_user
    if (array[0].startsWith('/api/pr/re/user_edit/delete_user')) {
      return this.json_pr_re_user_edit_delete_user(req);
    }



    switch(array[0]) {
      case "/api/dr/re/detail_user/user": // ユーザ詳細
      case "/api/ba/partner_companies":
      case "/api/group/recipients":    // グループ一覧
        return `${array[0]}/${array[1]}.json`;
    }

    return null;
  }

  // /api/dr/re/user_edit/delete_user
  private static json_dr_re_user_edit_delete_user(req: Request): string {
    return '/api/dr/re/user_edit/delete_user.json';
  }

  // /api/pr/re/user_edit/delete_user
  private static json_pr_re_user_edit_delete_user(req: Request): string {
    return '/api/pr/re/user_edit/delete_user.json';
  }

  // Helper methods
  // --------------------------------------------------------------------------
  private static parseQuery(query: string): {} {
    const array = query.split('&');
    const ret = {};
    array.forEach((s: string) => {
      const pair = s.split('=');
      ret[pair[0]] = pair[1];
    });
    return ret;
  }


  // Constructor
  // --------------------------------------------------------------------------
  constructor(private realHttp: XHRBackend, backend: MockBackend, options: RequestOptions) {
    super(backend, options);
    // variables
    this.mockBackend = backend;
    this.reqestOptions = options;
    // initilizer
    this.initialize(backend, options);
  }


  // Helper
  // --------------------------------------------------------------------------
  private newRealMockResponse(conn: MockConnection) {
    const req = conn.request;
    const options = new RequestOptions({
      method: req.method,
      body: req.getBody(),
      url: req.url,
      headers: req.headers,
      withCredentials: req.withCredentials,
      responseType: req.responseType,
    });
    new Http(this.realHttp, this.reqestOptions).request(req.url, options).subscribe((res: Response) => {
      conn.mockRespond(res);
    }, (error: any) => {
      if (error.status === 404) {
        return conn.mockRespond(new Response(new ResponseOptions()));
      }
      if (error instanceof Response) {
        const res = error as Response;
        conn.mockError(new HttpError(new ResponseOptions({
          url: res.url,
          status: res.status,
          statusText: res.statusText,
          type: res.type,
          headers: res.headers,
          body: res
        })));
      } else {
        conn.mockError(error);
      }
    });
  }


  // Initializer
  // --------------------------------------------------------------------------
  initialize(backend: MockBackend, options: RequestOptions) {
    console.log('# Init Mock backend');

    // start connection
    backend.connections.subscribe((conn: MockConnection) => {
      if (!conn.request.url.startsWith('/api')) {
        return this.newRealMockResponse(conn);
      }

      setTimeout(() => {
        // path
        const arr = conn.request.url.split('?');
        // uri
        let path = BackendMock.jsonPath(conn.request);
        if (!path) {
          path = `assets/mock/json${arr[0]}`;
          path += (1 < arr.length ? `/${arr[1]}` : '') + '.json';

        } else {
          path = `assets/mock/json${path}`;
        }
        console.log('url => %s, filepath => %s', conn.request.url, path);

        // http status code
        const status = BackendMock.getResponseStatus(conn.request);

        if (400 <= status.code) {
          const res = new HttpError(new ResponseOptions({
            status: status.code,
            body: JSON.stringify({error_codes: status.msgs})
          }));
          return conn.mockError(res);
        }

        new Http(backend, options).get(path).map(res => res.json()).subscribe(data => {
          conn.mockRespond(new Response(new ResponseOptions({
            status: status.code,
            body: data
          })));
        });
      }, 500);

    });
  }
}
