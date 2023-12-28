import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {SharedValueService} from '../../services/shared-value.service';
import {UserSession} from '../../models/ba/user-session';

@Component({
  selector: 'app-col-sub-dr',
  templateUrl: './col-sub-dr.component.html',
  styleUrls: ['./col-sub-dr.component.scss']
})
export class ColSubDrComponent implements OnInit {

  public userSession;
  public lang: string;
  public colSubStatus = ColSubStatus;
  public colSubCurrent: ColSubStatus;
  public mailCorp: { address?: string; subject?: string; body?: string; } = {};

  constructor(
    private router: Router,
    private translate: TranslateService,
    private sharedValueService: SharedValueService,
  ) {}

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    this.lang = this.sharedValueService.lang;
    this.translate.get('COL_SUB').subscribe((res) => {
      this.mailCorp.address = res['MAIL_CORP']['ADDRESS'];
      this.mailCorp.subject = res['MAIL_CORP']['SUBJECT'];
      this.mailCorp.body = this.userSession.officeName + res['MAIL_CORP']['BODY'];
    });
    this.checkStatus();
  }

  private checkStatus() {

    // コンテンツに依存するパターン
    switch (this.router.url) {
      // 法人登録バナー
      // todo: 仮条件
      case '/':
        this.colSubCurrent = ColSubStatus.CorporateRegistration;
        break;
    }

    // 共通パターン 本人確認
    if (!this.colSubCurrent) {
      // todo: 仮条件
      if (this.userSession.verificationStatus !== 'ST3' && this.userSession.personalFlag) {
        this.colSubCurrent = ColSubStatus.Identification;
      } else {
        this.colSubCurrent = ColSubStatus.None;
      }
    }

  }
}

export enum ColSubStatus {
  None,
  Identification,
  CorporateRegistration
}
