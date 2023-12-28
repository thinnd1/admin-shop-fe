import {Component, HostListener, OnInit} from '@angular/core';
import { RegistrationService } from '../../../services/registration.service';
import { PrNotificationSettings } from '../../../models/re/pr-notification-settings';
import {PrNotificationSettingsSaveResult} from '../../../models/re/pr-notification-settings-save-result';
import {DialogService} from '../../../services/dialog.service';

@Component({
  selector: 'app-re0011-page',
  templateUrl: './re0011-page.component.html',
  styleUrls: ['./re0011-page.component.scss']
})
export class Re0011PageComponent implements OnInit {

  public model = new PrNotificationSettings();

  constructor(private registrationService: RegistrationService, private dialogService: DialogService) { }

  ngOnInit() {
    this.registrationService.getPrNotificationSettings().subscribe((settings: PrNotificationSettings) => {
      this.model = settings;
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
    }, (error) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }
  putPrNotificationSettings(settings: PrNotificationSettings) {
    // Edit notification with API
    this.registrationService.putPrNotificationSettings(settings).subscribe((response: PrNotificationSettingsSaveResult) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showSuccess('MSG.SAVED');
      }, (error) => {
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
  //     this.putPrNotificationSettings(this.model);
  //   }
  // }

}
