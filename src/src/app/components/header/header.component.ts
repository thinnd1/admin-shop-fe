import {environment} from '../../../environments/environment';
import {Component, Input, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {Router} from '@angular/router';
import 'rxjs/Rx';
import {Product} from '../../common/profile';
import {SharedValueService} from '../../services/shared-value.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public headerType: any;
  @Input() type: string;

  constructor(
    private _router: Router,
    private _authenticationService: AuthenticationService,
    private sharedValueService: SharedValueService
  ) {
    // routing 変更時にヘッダータイプを決め直す
    this._router.events.subscribe(
      ev => {
        this._decideType();
      }
    );
  }

  ngOnInit() {
    this._decideType();
  }

  /**
   * ログイン状態とpr,drからヘッダータイプを決める
   */
  private _decideType() {
    this.headerType = environment.app === Product.Drjoy ? 'drjoy' : 'prjoy';

    if (environment.app === Product.Drjoy) {
      const userSession = this.sharedValueService.getUserSession();
      if (userSession && userSession.accountStatus && userSession.accountStatus.isProvisional) {
        this.headerType += '-provisional';
        return;
      }
    } else if (environment.app === Product.Prjoy) {
      if (this._router.url.indexOf('/re/re0006') !== -1) {
        this.headerType += '-visitor';
        return;
      }
    }

    if (
      this._router.url.indexOf('/cm/cm0000') !== -1 ||
      this._router.url.indexOf('/re/re0032') !== -1 ||
      this._router.url.indexOf('/file/download') !== -1
    ) {
      this.headerType += '-provisional';
      return;
    }

    this.headerType += this._authenticationService.isLogin() ? '' : '-visitor';

  }
}
