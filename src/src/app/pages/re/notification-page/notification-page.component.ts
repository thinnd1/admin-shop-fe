import {Component, HostListener, OnInit} from '@angular/core';
import {RegistrationService} from '../../../services/registration.service';
import {NotificationSettings} from '../../../models/re/notification-settings';
import {NotificationSettingsSaveResult} from '../../../models/re/notification-settings-save-result';
import {DialogService} from '../../../services/dialog.service';
import {SharedValueService} from '../../../services/shared-value.service';

declare const $: any;

@Component({
  selector: 'app-notification-page',
  templateUrl: './notification-page.component.html',
  styleUrls: ['./notification-page.component.scss']
})
export class NotificationPageComponent implements OnInit {

  public model = new NotificationSettings();
  userSession: any;

  constructor(private registrationService: RegistrationService, private dialogService: DialogService,
              private sharedValueService: SharedValueService) {
  }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.registrationService.getNotificationSettings().subscribe(
      (settings: NotificationSettings) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.model = settings;
      },
      (error) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  putNotificationSettings(settings: NotificationSettings) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    // Save notification with API
    this.registrationService.putNotificationSettings(settings).subscribe(
      (result: NotificationSettingsSaveResult) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showSuccess('MSG.SAVED');
      },
      (error) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     this.putNotificationSettings(this.model);
  //   }
  // }
}
