import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {Product} from '../../common/profile';
import {MasterService} from '../../services/master.service';
import {MeetingService} from '../../services/meeting.service';
import {SharedValueService} from '../../services/shared-value.service';
import {Subscription} from 'rxjs/Subscription';
import { RegistrationService } from '../../services/registration.service';
import { PrUserEditSettings } from '../../models/re/pr-user-edit-settings';

@Component({
  selector: 'app-drug-regist-alert',
  templateUrl: './drug-regist-alert.component.html',
  styleUrls: ['./drug-regist-alert.component.scss']
})
export class DrugRegistAlertComponent implements OnInit {

  public show = false;
  private subscription: Subscription;
  public model = new PrUserEditSettings();

  constructor(
    private registrationService: RegistrationService,
    private router: Router,
    private masterService: MasterService,
    private meetingService: MeetingService,
    private sharedValueService: SharedValueService
  ) {
    if (environment.app === Product.Drjoy) {
      this.show = false;
      return;
    }
    this.subscription = this.router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe((event: any) => {
        this.checkDisplay(event.url);
    });
  }

  ngOnInit() {
  }

  lineConvert(word: string): string {
    return word.replace(/\r?\n/g, '<br class="hidden-xs-down">');
  }

  checkDisplay(url: string) {
    if (this.checkFlag(url)) {
      this.show = false;
      return;
    }

    this.registrationService.getPrUserEditSettings().subscribe((settings: PrUserEditSettings) => {
      if (this.checkFlag(url)) {
        this.show = false;
        return;
      }
      this.model = settings;
      if (this.model && this.model.industryType !== 'I0001') {
        this.show = false;
        return;
      } else {
        this.meetingService.getListChargeDrug()
          .subscribe((res: any) => {
            if (this.checkFlag(url)) {
              this.show = false;
              return;
            }
            if (res && res.drugs) {
              this.show = res.drugs.every((val) => val.mrInChargeFlag === false);
            } else {
              this.show = false;
            }
          });
      }
    });

  }

  checkFlag(url: string): boolean {
    if (
      url === '/me/me0035' ||
      url === '/me/me5002/invoice' ||
      url === '/me/me5002/receipt' ||
      url.match(/^\/re\/re0006(.*?)\//) ||
      url === '/re/re0032' ||
      url === '/cm/cm0000dr' ||
      url === '/cm/cm0000pr'
    ) {
      return true;
    }
    if (!this.sharedValueService.isLoggedIn()) {
      return true;
    }
  }

}
