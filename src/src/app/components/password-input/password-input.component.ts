import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {DialogParams, DialogResult} from '../../models/dialog-param';
import {SharedValueService} from '../../services/shared-value.service';
import {RegistrationService} from '../../services/registration.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-password-input',
  templateUrl: './password-input.component.html',
  styleUrls: ['./password-input.component.scss']
})
export class PasswordInputComponent implements OnInit {
  params: DialogParams;
  passError: boolean;
  isConfirm: boolean;
  isCallApi: boolean;
  checkCallApi: boolean;
  checkPlaceHolder: boolean;
  userSession: any;
  placeHolder: any;
  passErrorText: any;
  @Input() password: string;
  @Input() passwordInputOptions: any = {
    name: null,
    id: null,
    toggle: false,
    minimumInputLength: 0,
    maximumInputLength: 256,
    error: null
  };
  @Output() passwordInputChanged = new EventEmitter<any>();

  constructor(private sharedValueService: SharedValueService,
              private translate: TranslateService,
              private registrationService: RegistrationService) {
  }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    if(this.checkPlaceHolder === true){
      this.placeHolder = '';
    }else{
      this.translate.get(['PASSWORD_PLACEHOLDER']).subscribe(
          res => {
            this.placeHolder = res.PASSWORD_PLACEHOLDER;
          });
    }
  }


  onModalInit() {
    this.isConfirm = this.params.extraParams.initialValue.isConfirm;
    this.isCallApi = this.params.extraParams.initialValue.isCallApi;
    this.checkCallApi = this.params.extraParams.initialValue.checkCallApi;
    this.checkPlaceHolder = this.params.extraParams.initialValue.checkPlaceHolder;
    if(this.checkPlaceHolder === true){
      this.placeHolder = '';
    }else{
      this.translate.get(['PASSWORD_PLACEHOLDER']).subscribe(
          res => {
            this.placeHolder = res.PASSWORD_PLACEHOLDER;
          });
    }

    if (this.isCallApi) {
      if(this.password){
        this.registrationService.checkPassword(this.userSession.userId, this.password).subscribe(response => {
              this.passError = !response;
              if (response) {
                this.checkCallApi = false;
                this.params.subject.next(new DialogResult('ok', this.getPayload()));
                this.params.subject.complete();
                (<any>$('#theModal')).modal('hide');
              }
            },
            error=>{
              this.passError = true;
            }
        );
        this.translate.get(['PASSWORD_ERROR']).subscribe(
            res => {
              this.passErrorText = res.PASSWORD_ERROR;
            });

      }else{
        this.translate.get(['INPUT_PASSWORD_PLACEHOLDER']).subscribe(
            res => {
              this.passError = true;
              this.passErrorText = res.INPUT_PASSWORD_PLACEHOLDER;
            });
      }
    }
  }

  getPayload(): any {
    return {isConfirm: this.isConfirm, checkCallApi: this.checkCallApi};
  }

  changeFields(event: any) {
    this.passwordInputChanged.emit(this.password);
  }

}
