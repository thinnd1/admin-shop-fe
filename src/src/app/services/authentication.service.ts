import {environment} from '../../environments/environment';
import {Configuration, DefaultHeaders, NgxOAuthClient, NgxOAuthResponse} from 'ngx-oauth-client';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/throw';
import {HttpClient, HttpHeaders, HttpParameterCodec, HttpParams} from '@angular/common/http';
import {JwtHelper} from 'angular2-jwt';
import {Product, Profile} from '../common/profile';
import {NGXLogger} from 'ngx-logger';

/**
 * Supported +|- Encoder.
 */
class AuthorityEncoder implements HttpParameterCodec {

  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }

  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }

  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }

  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}

/**
 * 認証モデル.
 */
export interface Authentication {
  readonly product: Product;
  readonly user_id: string;
  readonly office_user_id: string;
  readonly office_id: string;
  readonly expire: number;
  readonly nonlocked: boolean;
  readonly enabled: boolean;
  readonly personal: boolean;
}

/**
 * AuthenticationService.
 */
@Configuration({
  host: environment.authApi,
  token: 'uaa/oauth/token',
  storage_prefix: environment.app === Product.Drjoy ? 'dr_' : 'pr_',
})
@DefaultHeaders({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
})
export class AuthenticationService extends NgxOAuthClient {

  // Instance variables
  // --------------------------------------------------------------------------
  private data: Authentication;
  private canRefresh = true;
  private jwtHelper = new JwtHelper();

  // リダイレクトURL
  redirectUrl: string;

  /**
   * アクセストークンを保存する.
   */
  private static saveToken(res: NgxOAuthResponse) {
    // persistence
    localStorage.setItem('auth_token', JSON.stringify(res));
  }

  /**
   * プロダクトを取得する.
   */
  private static getProduct(decoded: any): Product {
    if (decoded.product === 'DRJOY') {
      return Product.Drjoy;
    } else if (decoded.product === 'PRJOY') {
      return Product.Prjoy;
    } else if (decoded.product === 'QUICK') {
      return Product.Quick;
    } else if (decoded.product === 'NOLOGIN_MEETING') {
      return Product.NologinMeeting;
    } else {
      return Product.NologinChat;
    }
  }

  // Constructor
  // --------------------------------------------------------------------------
  constructor(http: HttpClient, private logger: NGXLogger) {
    super(http);
  }

  // Public methods
  // --------------------------------------------------------------------------
  public authentication(): Authentication {
    return this.data;
  }

  // Overrided
  // --------------------------------------------------------------------------
  /**
   * ログイン済みかチェックする.
   */
  isLogin(): boolean {
    try {
      const accessToken = this.fetchToken('access_token');
      let expire = true;
      if (!this.data && accessToken) {
        this.data = this.toAuthenticationModel(accessToken);
        expire = this.isEnableExpire();
        // @Logger
        this.logger.debug('*** expire: ', expire);
      }
      const judge = accessToken && 0 < accessToken.length && expire;
      if (!judge) {
        this.clearToken();
        return false;
      }
      this.data = this.toAuthenticationModel(accessToken);

      return judge;

    } catch (e) {
      // ignore
    }
    return false;
  }

  /**
   * 現在のアクセストークンを取得する.
   */
  public getCurrentToken(): string {
    return this.fetchToken('access_token');
  }

  /**
   * 現在のリフレッシュトークンを取得する.
   */
  public getCurrentRefreshToken(): string {
    return this.fetchToken('refresh_token');
  }

  /**
   * アクセストークンの有効期限をチェックする.
   */
  public isEnableExpire(): boolean {
    return this.data && new Date().getTime() < this.data.expire;
  }

  /**
   * アクセストークンを取得する.
   */
  public getToken(grant_type?: string, data?: any, saveToken = true): Observable<NgxOAuthResponse> {
    if (environment.profile === Profile.mock) {
      // モックの時
      return this.http.get('/assets/mock/uaa/oauth/token.json').map((res: NgxOAuthResponse) => {
        AuthenticationService.saveToken(res);
        return res;
      });
    }
    if (grant_type && ['password', 'refresh_token'].indexOf(grant_type) === -1) {
      throw new Error(`Grant type ${grant_type} is not supported`);
    }
    const config = this.getConfig();
    const defaults: any = {
      grant_type: grant_type || 'password'
    };
    // URL
    const url = config.host + '/' + config.token;

    // Header
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');

    // FormData
    const payload = Object.assign(defaults, data);
    let params = new HttpParams({encoder: new AuthorityEncoder()});
    for (const key in payload) {
      if (payload.hasOwnProperty(key)) {
        params = params.append(key, payload[key]);
      }
    }

    return this.http.post(url, params, {headers}).map((res: NgxOAuthResponse) => {
      if (saveToken) {
        // トークンの保存
        this.setToken(res);
        // トークンの取得
        const accessToken = this.fetchToken('access_token');
        // トークンをデコード
        this.data = this.toAuthenticationModel(accessToken);
        // @Logger
        this.logger.debug('*** access token data: ', this.data);
      }
      // レスポンス返却
      return res;
    });
  }

  /**
   * アクセストークンを再取得する.
   */
   refreshToken(callback = null) {
    if (!this.data || !this.canRefresh) {
      return callback ? callback('Busy refresh token request') : null;
    }
    this.canRefresh = false;
    this.logger.debug('*** RefreshToken');

    const refreshToken = this.getCurrentRefreshToken();
    if (!refreshToken) {
      const reason = 'Unsupported refresh token';

      this.logger.warn(reason);
      return callback ? callback(reason) : null;
    }

    const data = {
      refresh_token: refreshToken,
      client_id: environment.clientId,
      client_secret: environment.clientSecret,
      expire: this.data.expire,
    };

    this.getToken('refresh_token', data).take(1).subscribe(() => {
      this.canRefresh = true;
      return callback ? callback(null) : null;

    }, reason => {
      this.logger.warn('*** error refresh token: ', reason);
      this.canRefresh = true;
      return callback ? callback(reason) : null;
    });
  }

  // @Override
  clearToken(): void {
    super.clearToken();
    this.data = null;
    // localStorage.clear();
    localStorage.removeItem('auth_token');
  }

  // Helper
  // --------------------------------------------------------------------------
  /**
   * 認証モデルに変換する.
   */
  public toAuthenticationModel(accessToken: any): Authentication {
    // トークンをデコード
    const decoded = this.jwtHelper.decodeToken(accessToken);
    return {
      product: AuthenticationService.getProduct(decoded),
      user_id: decoded.user_id,
      office_id: decoded.office_id,
      office_user_id: decoded.office_user_id,
      expire: decoded.expire,
      nonlocked: decoded.nonlocked,
      enabled: decoded.enabled,
      personal: decoded.personalFlag,
    };
  }

  // ここからのメソッドは使用されていない
  // --------------------------------------------------------------------------
  // @override
  requestInterceptor(request: any): any {
    this.logger.debug('*** http request interceptor');

    const token = this.fetchToken('access_token');
    if (token) {
      return request.setHeaders({
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      });
    }
    return request;
  }

  // @override
  errorInterceptor(request: any, error: any): any {
    this.logger.debug('*** http error interceptor');
    this.logger.error(error);

    if (error.status === 401) {
      const refreshToken = this.fetchToken('refresh_token');
      if (!refreshToken) {
        return Observable.throw(error);
      }
      return this.getToken('refresh_token', {refreshToken}).switchMap(token => {
        return this.getClient().request(request.method,
          request.url,
          this.requestInterceptor(request.setHeaders({Authorization: 'Bearer ' + token})));
      });
    }
    return Observable.throw(error);
  }
}
