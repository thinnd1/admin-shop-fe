import { Component, OnInit } from '@angular/core';
import { MeetingService } from '../../../services/meeting.service';
import { VenderBlockSettings } from '../../../models/me/vender-block-settings';
import { VenderBlockSettingsSaveResult } from '../../../models/me/vender-block-settings-save-result';
import { SharedValueService } from '../../../services/shared-value.service';
import { TranslateService } from '@ngx-translate/core';
import { DialogResult } from '../../../models/dialog-param';
import {DialogService} from '../../../services/dialog.service';
import {Router} from "@angular/router";

declare var moment: any;
@Component({
  selector: 'app-me0012-page',
  templateUrl: './me0012-page.component.html',
  styleUrls: ['./me0012-page.component.scss']
})
export class Me0012PageComponent implements OnInit {
  public blockedUserList = new VenderBlockSettings();
  userSession;
  keyword = '';

  constructor(
    private meetingService: MeetingService,
    private dialogService: DialogService,
    private shareValueData: SharedValueService,
    private router: Router
  ) { }

  ngOnInit() {
    this.shareValueData.fetchUserSession();
    this.userSession = this.shareValueData.getUserSession();
    this.getBlockUser();
  }

  /**
   * GET List Block User
   */
  getBlockUser() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getBlockUsersSettings().subscribe((settings: VenderBlockSettings) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.blockedUserList = settings;
    });
  }

  /**
   * Action UnBlock User
   */
  unBlockUser(event, blockedUser) {
    event.stopPropagation();
    this.dialogService.showMessage('warning', false, null, 'ME0012.MESSAGE_UNLOCK', null, 'MSG.YES', 'MSG.NO')
      .subscribe((res: DialogResult) => {
        if (res.isOk()) {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(true);
          });
          this.meetingService.putUnblockUserSettings(this.userSession.userId, this.userSession.officeId, blockedUser.userId, blockedUser.officeId)
            .subscribe((response: VenderBlockSettingsSaveResult) => {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
              setTimeout(() => {
                this.dialogService.showSuccess('ME0012.UNLOCK_SUCCESS').subscribe((button: DialogResult) => {
                  this.blockedUserList.users = this.blockedUserList.users.filter(user => user.userId !== blockedUser.userId);
                });
              }, 500);
            });
        }
      });
  }

  showInfoDetailMr(userId: string, officeId: string) {
    this.router.navigate(['me/me0004', userId, officeId]);
  }

}
