import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {SharedValueService} from '../../services/shared-value.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogService} from '../../services/dialog.service';
import {AuthenticationMessage} from '../../services/message.service';
import {environment} from '../../../environments/environment';
import {Product} from '../../common/profile';
import { WsService } from '../../services/stomp/ws.service';

@Component({
  selector: 'app-logout-page',
  templateUrl: './logout-page.component.html',
  styleUrls: ['./logout-page.component.scss']
})
export class LogoutPageComponent implements OnInit {

  type: string;

  // Constructor
  // --------------------------------------------------------------------------
  constructor(private authentication: AuthenticationService,
              private shared: SharedValueService,
              private dialog: DialogService,
              private authenticationMessage: AuthenticationMessage,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private wsService: WsService) {
  }

  // OnInit
  // --------------------------------------------------------------------------
  ngOnInit() {
    // ログアウト通知
    this.authenticationMessage.send(AuthenticationMessage.Type.Logout);

    this.activatedRoute.params.subscribe(params => {
      this.type = params['type'];
    });
    setTimeout(() => {
      this.dialog.setLoaderVisible(true);
    });

    // favicon reset
    if (this.shared.userAgent.indexOf('Trident') === -1) {
      this.shared.favicon.reset();
    }

    if (this.wsService.isConnected) {
      this.wsService.onDisconnect();
    }

    // clear session info
    this.authentication.clearToken();
    this.shared.clearUserSession();
    localStorage.removeItem('first_entry');
    localStorage.removeItem('personal_reg');
    delete (<any>window).currentUserImage;
    setTimeout(() => {
      this.dialog.setLoaderVisible(false);
    });
    switch (environment.app) {
      case Product.Drjoy:
        this.router.navigate(['/re/re0022'], {replaceUrl: true});
        return false;
      case Product.Prjoy:
        this.router.navigate(['/re/re0013'], {replaceUrl: true});
        return false;
      default:
        this.router.navigate(['/login'], {replaceUrl: true});
        return false;
    }
  }
}
