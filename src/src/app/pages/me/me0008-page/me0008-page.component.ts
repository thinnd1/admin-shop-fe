import {Component, OnInit, AfterViewInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {HttpStatus} from '../../../common/http.status';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogResult} from '../../../models/dialog-param';
import {MeetingService} from '../../../services/meeting.service';
import {MessageListSetting} from '../../../models/me/message-list-setting';
import {GetRoomSetting} from '../../../models/me/get-room-setting';
import {SendMessageSetting} from '../../../models/me/send-message-setting';
import {AuthenticationService} from '../../../services/authentication.service';
import {NgxOAuthResponse} from 'ngx-oauth-client';
import {JwtHelper} from 'angular2-jwt';
import {SharedValueService} from '../../../services/shared-value.service';
import {DialogService} from '../../../services/dialog.service';
import {Product} from '../../../common/profile';

declare const $: any;

@Component({
  selector: 'app-me0008-page',
  templateUrl: './me0008-page.component.html',
  styleUrls: ['./me0008-page.component.scss']
})
export class Me0008PageComponent implements OnInit {
  modelMessageListSetting = new MessageListSetting();
  modelGetRoomSetting = new GetRoomSetting();
  status: any = [{'VALID': 0}, {'EXPIRED': 1}, {'DONE': 2}];
  acticeChatRoomScreen: boolean;
  notMessage: boolean;
  messageContent: string;

  model: any = {};
  loading = false;
  returnUrl: string;
  message: string;
  session_token: string;
  private jwt: JwtHelper;

  constructor(private dialogService: DialogService, private translateService: TranslateService, private router: Router,
              private meetingService: MeetingService, private route: ActivatedRoute, private auth: AuthenticationService,
              private shared: SharedValueService) {
    this.messageContent = '';
    this.jwt = new JwtHelper();
  }

  async ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    // get one time session token
    this.route.params.subscribe((param: any) => {
      this.session_token = param['session_token'];
      console.log(this.session_token);
    });
    await this.getRoom();
    this.acticeChatRoomScreen = false;
    if (this.modelGetRoomSetting.status === this.status[0].VALID) {
      await this.getListMessage();
    } else {
      this.acticeChatRoomScreen = true;
    }
  }

  getRoom() {
    return new Promise((resolve, reject) => {
      this.meetingService.getRoom().subscribe((response: GetRoomSetting) => {
        this.modelGetRoomSetting = response;
        resolve();
      }, error => {
        console.log(error);
        this.dialogService.showError('MSG.ERROR');
        reject();
      });
    });
  }

  async getListMessage() {
    return new Promise((resolve, reject) => {
      this.meetingService.listMessages().subscribe((response: MessageListSetting) => {
        this.modelMessageListSetting = response;
        (this.modelMessageListSetting.messageList.length > 0) ? (this.notMessage = false) : (this.notMessage = true);
        resolve();
      }, error => {
        console.log(error);
        reject();
      });
    });

  }

  routeLogin() {
    this.router.navigate(['/login']);
  }

  sendMessage() {
    // input One time session token && message
    if (this.messageContent.trim() === '') {
      console.log('validate');
    } else {
      const modelSenMessage = new SendMessageSetting(this.session_token, this.messageContent.trim());
      console.log(this.messageContent);
      this.meetingService.sendMessage(modelSenMessage).subscribe((response: Response) => {
        console.log(response);
        if (response.status === HttpStatus.OK) {
          console.log(response.status);
          this.dialogService.showMessage('success', false, null, 'MSG.SENT', null, 'MSG.YES', null).subscribe(
            (resp: DialogResult) => {
              if (resp.isOk()) {
                this.router.navigate(['/login']);
              }
            });
        }
      }, error => {
        console.log(error);
        this.dialogService.showError('MSG.ME0008.E_SEND_MESSAGE');
      });
    }
  }

  login() {
    this.message = '';
    this.loading = true;
    const params = {
      grant_type: 'password',
      username: this.model.username,
      password: this.model.password,
      product: Product.Drjoy
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
        this.dialogService.showError('MSG.ERROR');
      });
    }, error => {
      this.loading = false;

      // if (error.status === HttpStatusCode.UNAUTHORIZED) {
      //   this.message = 'Invalid username or password';
      // } else {
      //   this.dialogService.showError('MSG.ERROR');
      // }
    });
  }

}

