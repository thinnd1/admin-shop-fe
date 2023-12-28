import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {RegistrationService} from '../../../services/registration.service';
import {AuthenticationService} from '../../../services/authentication.service';
import {environment} from '../../../../environments/environment';
import {NGXLogger} from 'ngx-logger';
import {DialogService} from '../../../services/dialog.service';

@Component({
  selector: 'app-re0035-page',
  templateUrl: './re0035-page.component.html',
  styleUrls: ['./re0035-page.component.scss']
})
export class RE0035PageComponent implements OnInit {

  constructor(private router: Router,
              private dialogService: DialogService,
              private authService: AuthenticationService,
              private registrationService: RegistrationService,
              private activatedRoute: ActivatedRoute,
              private logger: NGXLogger) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((param: any) => {

      const parameters = {
        grant_type: 'password',
        username: param.officeUserId,
        password: param.token,
        client_id: environment.quickClientId,
        client_secret: environment.quickClientSecret,
      };

      this.dialogService.setLoaderVisible(true);

      this.authService.getToken(parameters.grant_type, parameters).take(1).subscribe(() => {
        this.router.navigate(['/'], {replaceUrl: true}).then(() => {
          this.dialogService.setLoaderVisible(false);
        });

      }, error => {
        this.logger.error(error);
        this.router.navigate(['/'], {replaceUrl: true}).then(() => {
          this.dialogService.setLoaderVisible(false);
        });
      });
    });
  }
}
