import { DialogService } from '../../../services/dialog.service';
import { Component, OnInit } from '@angular/core';
import { MeetingService } from '../../../services/meeting.service';
import { VenderBlockSettings } from '../../../models/me/vender-block-settings';
import { DialogResult } from '../../../models/dialog-param';
import { VenderBlockSettingsSaveResult } from '../../../models/me/vender-block-settings-save-result';
import { SharedValueService } from '../../../services/shared-value.service';
import { VenderPersonListSettings } from '../../../models/me/vender-person-list-settings';
import { VenderPersonListSettingsSaveResult } from '../../../models/me/vender-person-list-settings-save-result';
import { HttpError } from '../../../common/error/http.error';
import {Observable} from 'rxjs/Observable';

declare var moment: any;
@Component({
  selector: 'app-me0013-page',
  templateUrl: './me0013-page.component.html',
  styleUrls: ['./me0013-page.component.scss']
})
export class Me0013PageComponent implements OnInit {

  public model = new VenderBlockSettings();
  public modelPIC = new VenderPersonListSettings();
  firstLoad = true;
  keyword = '';
  userSession;
  public officesData = [];

  constructor(
    private meetingService: MeetingService,
    private dialogService: DialogService,
    private shareValueData: SharedValueService,
  ) { }

  ngOnInit() {
    this.shareValueData.fetchUserSession();
    this.userSession = this.shareValueData.getUserSession();

    this.meetingService.getListAllHandling().subscribe(
      (res) => {
        this.officesData = res;
      }
    );
  }

  // auto-complete
  searchDoctorAuto(keyword: any) {
    if (this.officesData) {
      const regex = new RegExp(keyword, 'i');
      const data = this.officesData.filter((item) => (
        regex.test(item.officeName) || (keyword && !keyword.trim()))
      );
      return Observable.of(data);
    } else {
      return Observable.of([]);
    }
  }

  autoCompleteListFormatter(data: any) {
    $('.ngui-auto-complete').css({
      'height': '200px',
      'overflow-y': 'auto',
    });
    $('.ngui-auto-complete ul li').css({
      cursor: 'default'
    });
    $('.ngui-auto-complete ul li').hover(function() {
      if (!$(this).hasClass('selected')) {
        $('.ngui-auto-complete ul li.selected').removeClass('selected');
        $(this).toggleClass( 'selected');
      }
    });
    const html = `<span class='hover-result-search d-block px-2 py-1'>${data['officeName']}</span>`;
    return html;
  }

  valueFormatterSearch(data: any) {
    return `${data['officeName']}`;
  }

  changeValueSearch(keyword: string) {
    this.keyword = keyword;
  }

  searchUser(office) {
    if (typeof office !== 'string') {
      this.keyword = office.officeName;
      if (office.officeName) {
        this.firstLoad = false;
        this.getListPIC(office.officeName);
      } else {
        this.firstLoad = true;
      }
    }
  }

  /**
   * Action UnBlock User
   */
  unBlockUser(blockedUser) {
    this.dialogService.showMessage('warning', false, null, 'ME0012.MESSAGE_UNLOCK', null, 'MSG.YES', 'MSG.NO')
      .subscribe((res: DialogResult) => {
        if (res.isOk()) {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(true);
          });
          this.meetingService.putUnblockUserSettings(this.userSession.userId,
            this.userSession.officeId, blockedUser.userId, blockedUser.officeId)
            .subscribe((response: VenderBlockSettingsSaveResult) => {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
              blockedUser.blocked = false;
              setTimeout(() => {
                this.dialogService.showSuccess('ME0012.UNLOCK_SUCCESS');
              }, 500);
            });
        }
      });
  }

  /**
   * Action Block User
   * Param: userId
   */
  blockUser(blockedUser: any) {
    this.dialogService.showMessage('warning', false, 'ME0013.MESSAGE_TITLE_BLOCK', 'ME0013.MESSAGE_BLOCK',
      null, 'MSG.YES', 'MSG.NO')
      .subscribe((res: DialogResult) => {
        if (res.isOk()) {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(true);
          });
          this.meetingService.postBlockUserSettings(this.userSession.userId, this.userSession.officeId, blockedUser.userId, blockedUser.officeId)
            .subscribe((response: VenderPersonListSettingsSaveResult) => {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
              blockedUser.blocked = true;
              setTimeout(() => {
                this.dialogService.showSuccess('ME0013.BLOCK_SUCCESS');
              }, 500);
            });
        }
      });
  }

  /**
   * ME0013
   * GET List PIC
   */
  getListPIC(keyword: string) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getPicSettings(keyword).subscribe((settings: VenderPersonListSettings) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
        this.modelPIC = settings;
    }, (error: HttpError) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
    });
  }

  convertDateTime(datetime) {
    const data = datetime.split('UTC')[0].trim();
    if (datetime !== '') {
      return moment(data).format('YYYY年MM月DD日');
    } else {
      return 'ー';
    }
  }
}
