import {Injectable} from '@angular/core';
import {Headers, Http, Request, RequestOptions, RequestOptionsArgs, Response, ResponseOptions, XHRBackend} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {environment} from '../../../../environments/environment';
import {AuthenticationService} from '../../../services/authentication.service';
import {HttpError} from '../../error/http.error';
import {Profile} from '../../profile';

@Injectable()
export class BackendService extends Http {

  // Static methods
  // --------------------------------------------------------------------------
  /**
   * Make Request URL.
   */
  private static makeUrl(url: string): string {
    if (environment.profile === Profile.local && url.startsWith(environment.authApi)) {
      return url;
    }
    return environment.api + url;
  }

  // Error handler
  // --------------------------------------------------------------------------
  /**
   * Response error handler.
   */
  private static handleErrorResponse(options: RequestOptionsArgs, res: Response) {
    return Observable.throw(new HttpError(new ResponseOptions({
      url: res.url,
      status: res.status,
      statusText: res.statusText,
      type: res.type,
      headers: res.headers,
      body: res
    })));
  }

  // Constructor
  // --------------------------------------------------------------------------
  constructor(backend: XHRBackend, options: RequestOptions, protected auth?: AuthenticationService) {
    super(backend, options);
    console.log('# Init Backend Service');
  }

  // Overrided methods
  // --------------------------------------------------------------------------
  // Request
  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    return super.request(url, options).catch((res: Response) => BackendService.handleErrorResponse(options, res));
  }

  // GET
  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return super.get(BackendService.makeUrl(url), this.makeRequestOptionArgs(options));
  }

  // POSt
  post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return super.post(BackendService.makeUrl(url), body, this.makeRequestOptionArgs(options));
  }

  // PUT
  put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return super.put(BackendService.makeUrl(url), body, this.makeRequestOptionArgs(options));
  }

  // DELETE
  delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return super.delete(BackendService.makeUrl(url), this.makeRequestOptionArgs(options));
  }

  // PATCH
  patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return super.patch(BackendService.makeUrl(url), body, this.makeRequestOptionArgs(options));
  }

  // HEAD
  head(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return super.head(BackendService.makeUrl(url), this.makeRequestOptionArgs(options));
  }

  // OPTIONS
  options(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return super.options(BackendService.makeUrl(url), this.makeRequestOptionArgs(options));
  }

  // Private methods
  // --------------------------------------------------------------------------
  /**
   * Make RequestOptionArgs.
   */
  protected makeRequestOptionArgs(options?: RequestOptionsArgs): RequestOptionsArgs {
    if (options == null) {
      options = new RequestOptions();
    }
    if (options.headers == null) {
      options.headers = new Headers();
    }

    if (!this.auth.isEnableExpire()) {
      this.auth.refreshToken();
    }
    options.headers.append('Content-Type', 'application/json; charset=utf-8');
    options.headers.append('Accept', 'application/json');

    const token = this.auth.getCurrentToken();
    if (token) {
      options.headers.append('Authorization', 'Bearer ' + token);
    }
    return options;
  }
}
