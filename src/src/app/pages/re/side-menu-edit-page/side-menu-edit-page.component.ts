import {Component, OnInit, HostListener
} from '@angular/core';
import {RegistrationService} from '../../../services/registration.service';
import {TranslateService} from '@ngx-translate/core';
import {SideMenuEditSettingsSaveResult} from '../../../models/re/side-menu-edit-settings-save-result';
import {Helper} from '../../../common/helper';
import {FuncAuthoritySet, UserSession} from '../../../models/ba/user-session';
import {SharedValueService} from '../../../services/shared-value.service';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';

declare const $: any;

@Component({
  selector: 'app-side-menu-edit-page',
  templateUrl: './side-menu-edit-page.component.html',
  styleUrls: ['./side-menu-edit-page.component.scss']
})
export class SideMenuEditPageComponent implements OnInit {
  sideMenuReload = false;
  menu = Helper.menu;
  userSession: UserSession;
  showMeeting: boolean;
  indexUp: number;
  indexDown: number;
  max_item_menu = 6;

  public models = Array();
  public items = new SideMenuEditSettingsSaveResult();

  constructor(private registrationService: RegistrationService, private dialogService: DialogService, private translate: TranslateService,
  private sharedValueService: SharedValueService) {
  }

  ngOnInit() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.sharedValueService.fetchUserSession();
    this.registrationService.getSideMenuEditSettings().subscribe(
      (settings: SideMenuEditSettingsSaveResult) => {
        // this.models = settings.items;
        this.checkAuthorityMeeting();
        this.sortData(settings.items);
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
      },
      (error) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  checkAuthorityMeeting() {
    this.showMeeting = false;
    this.userSession = this.sharedValueService.getUserSession();

    if (this.userSession) {
      switch (this.userSession.funcAuthoritySet) {
        case FuncAuthoritySet.FPS_0:
          const funcAuthority = this.userSession.funcAuthority;
          if (funcAuthority.FP_1) {
            this.showMeeting = true;
            break;
          }
          if (funcAuthority.FP_2 &&
            (funcAuthority.FP_3 || funcAuthority.FP_4 || funcAuthority.FP_5 || funcAuthority.FP_6 || funcAuthority.FP_7)) {
            this.showMeeting = true;
            break;
          }
          break;
        case FuncAuthoritySet.FPS_4:
          this.showMeeting = false;
          break;
        default:
          this.showMeeting = true;
      }
    }
  }

  confirmPutSideMenu() {
    this.dialogService.showMessage('warning', false, null, 'RE0001.MENU_MEG', null, 'MSG.YES', 'MSG.NO' ).subscribe(
      (res: DialogResult) => {
        if (res.isOk()) {
          this.putSideMenuSettings();
        } else {
          // do nothing
        }
      }
    );
  }

  putSideMenuSettings() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.items.items = this.models;
    this.registrationService.putSideMenuEditSettings(this.items).subscribe(
      (respone: any) => {
        setTimeout(() => {
          this.reloadSideMenu();
        }, 1000);
      },
      error => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        setTimeout(() => {
          this.dialogService.showError('MSG.ERROR');
        }, 1000);
      }
    );
  }

  reloadSideMenu() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(false);
    });
    this.dialogService.showSuccess('MSG.SAVED').subscribe(
      (dialogResult: DialogResult) => {
        if (dialogResult.isOk()) {
          this.sideMenuReload = true;
        } else {
          // do nothing
        }
      }
    );
  }

  downMenu(index) {
    if (index !== (this.models.length - 1)) {
      this.swap(index, index + 1);
    } else {
      // do nothing
    }
  }

  upMenu(index) {
    if (this.menu[this.models[index - 1].functionId] !== 'calendar' && this.menu[this.models[index - 1].functionId] !== 'building') {
      this.swap(index, index - 1);
    } else {
      // do nothing
    }
  }

  /**
   * Sort order menu side
   */
  sortData(listMenu) {
    if (listMenu.length !== 0) {
      this.indexUp = (listMenu.length === this.max_item_menu) ? 2 : 1;
      this.indexDown = listMenu.length - 1;
      // find index calendar, building
      for (let i = 0; i < listMenu.length; i++) {
        if (this.menu[listMenu[i].functionId]) {
          if (this.menu[listMenu[i].functionId] === 'calendar') {
            listMenu[i].displayOrder = -2;
          } else {
            if (this.menu[listMenu[i].functionId] === 'building') {
              listMenu[i].displayOrder = -1;
            } else {
              // do nothing
            }
          }
          this.models.push(listMenu[i]);
        }
      }

      for (let i = 0; i < this.models.length - 1; i++) {
        for (let j = i + 1; j < this.models.length; j++) {
          if (this.models[i].displayOrder > this.models[j].displayOrder) {
            const tg = this.models[i];
            this.models[i] = this.models[j];
            this.models[j] = tg;
          }  else {
            // do nothing
          }
        }
      }
    } else {
      this.models = Helper.itemsMenu;
    }
  }

  swap (i, j) {
    const tg = this.models[i].functionId;
    this.models[i].functionId = this.models[j].functionId;
    this.models[j].functionId = tg;
  }

  setReloadSideMenu(event) {
    if (event === 'false') {
      this.sideMenuReload = false;
    } else {
      // do notthing
    }
  }

  disableCheck(index, menu) {
    if (index === menu) {
      return true;
    } else {
      return false;
    }
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     this.confirmPutSideMenu();
  //   }
  // }
}
