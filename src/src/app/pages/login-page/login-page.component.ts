import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../../services/authentication.service';
import {NgxOAuthResponse} from 'ngx-oauth-client';
import {DialogService} from '../../services/dialog.service';
import {HttpStatusCode} from '../../common/http_status_code';
import {JwtHelper} from 'angular2-jwt';
import {SharedValueService} from '../../services/shared-value.service';
import {Product} from '../../common/profile';

/**
 * LoginPageComponent.
 */
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
  model: any = {};
  loading = false;
  returnUrl: string;
  message: string;

  // Variables
  // --------------------------------------------------------------------------
  private jwt: JwtHelper;


  // Constructor
  // --------------------------------------------------------------------------
  constructor(private route: ActivatedRoute,
              private router: Router,
              private auth: AuthenticationService,
              private dialog: DialogService,
              private shared: SharedValueService) {
    this.jwt = new JwtHelper();
  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  /**
   * Login.
   */
  // TODO:k.sumi 仮実装
  login() {
  this.message = '';
  this.loading = true;

  const params = {
    grant_type: 'password',
    username: encodeURIComponent(this.model.username),
    password: this.model.password,
    product: Product.Drjoy, // TODO: 固定にしているが可変になる Pr.JOYのログイン画面を作成すれば固定でOK
  };

  this.auth.getToken(params.grant_type, params).subscribe((res: NgxOAuthResponse) => {
    // User session
    this.shared.fetchUserSession().subscribe(() => {
      this.loading = false;
      const userSession = this.shared.getUserSession();
          if (userSession.accountStatus.isProvisional) {
            this.router.navigate(['/re/first-entry']);
          } else if (userSession.accountStatus.isValid) {
            this.router.navigate(['/']);
          }
    }, () => {
      this.auth.clearToken();
      this.loading = false;
      this.dialog.showError('MSG.ERROR');
    });
  }, error => {
    this.loading = false;

    if (error.status === HttpStatusCode.UNAUTHORIZED) {
      this.message = 'Invalid username or password';
    } else {
      this.dialog.showError('MSG.ERROR');
    }
  });
}
}
