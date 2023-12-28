import {Component, OnInit} from '@angular/core';
import {DialogService} from '../../../services/dialog.service';
import {RegistrationService} from '../../../services/registration.service';
import {PrPublicSettingPersonal} from '../../../models/re/pr-public-setting-personal';
import {SharedValueService} from '../../../services/shared-value.service';

@Component({
  selector: 'app-re0036-page',
  templateUrl: './re0036-page.component.html',
  styleUrls: ['./re0036-page.component.scss']
})
export class Re0036PageComponent implements OnInit {

  public model = new PrPublicSettingPersonal();
  userSession: any;

  constructor(private dialogService: DialogService,
              private registrationService: RegistrationService,
              private sharedValueService: SharedValueService) {
    this.userSession = this.sharedValueService.getUserSession();
  }

  ngOnInit() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.registrationService.getPrPublicSetting().subscribe((settings: PrPublicSettingPersonal) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.model = settings;
      }, () => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  /**
   * Put setting allow dr tracking pr
   *
   */

  putMrSettingPublic() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.model.officeUserId = this.userSession.officeUserId;
    this.registrationService.putPrPublicSetting(this.model).subscribe(
      () => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showSuccess('MSG.SAVED');
      },
      () => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

}
