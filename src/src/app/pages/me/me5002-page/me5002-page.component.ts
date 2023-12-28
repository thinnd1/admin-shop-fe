import {Component, OnInit} from '@angular/core';
import {MeetingService} from '../../../services/meeting.service';
import {ActivatedRoute, Router} from '@angular/router';
import {VisitCardPayments} from '../../../models/me/visit-card-payments';
import {DateConverter} from '../../../common/converter/date.converter';
import {DialogService} from '../../../services/dialog.service';
import {SharedValueService} from '../../../services/shared-value.service';
import {UserSession} from '../../../models/ba/user-session';
import {DialogResult} from '../../../models/dialog-param';
import {LocalStorage} from '../../../services/local-storage.service';

@Component({
  selector: 'app-me5002-page',
  templateUrl: './me5002-page.component.html',
  styleUrls: ['./me5002-page.component.scss']
})
export class Me5002PageComponent implements OnInit {

  userSession: UserSession;
  const: any = {};
  paymentStatus: any;
  type: string;
  path: string;
  public userId: string;
  public officeId: string;
  public getUserResult: any;
  public paymentNewest: any;
  public paymentPrice: any;
  public paymentHistoryList: any;
  checkPayment = false;
  paymentName: string;
  company: string;

  constructor(private meetingService: MeetingService,
              private activatedRoute: ActivatedRoute,
              private dateConverter: DateConverter,
              private dialogService: DialogService,
              private localStorage: LocalStorage,
              private sharedValueService: SharedValueService,
              private router: Router) {
  }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    this.getCardPayments();
  }

  getCardPayments() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getVisitCardPayments(this.userSession.officeUserId).subscribe((response: VisitCardPayments) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.getUserResult = response;
      if (!this.getUserResult && this.getUserResult.histories.length > 0) {
        this.router.navigate(['/me/me5008']);
      } else {
        if (this.getUserResult.status) {
          this.paymentStatus = this.getUserResult.status.toUpperCase();
        }

        if (this.getUserResult.histories.length > 0) {
          this.paymentHistoryList = this.getUserResult.histories;

          if (this.paymentStatus === 'UNREGISTERED_WITHOUT_CARD') {
            this.paymentHistoryList = this.paymentHistoryList.filter((e) => {
              return e.receiptDate !== '';
            });
          }

          for (let i = 0; i < this.paymentHistoryList.length; i++) {
            this.paymentHistoryList[i].realTax = Math.round(this.paymentHistoryList[i].price / 100 * this.paymentHistoryList[i].tax);

            // check payment time
            if (this.paymentHistoryList[i].receiptDate) {
              this.checkPayment = true;
            }
          }
          // console.log(this.paymentHistoryList);
          this.paymentNewest = this.paymentHistoryList[0];
          this.paymentPrice = this.paymentNewest.price + Math.round(this.paymentNewest.price / 100 * this.paymentNewest.tax) +
            this.paymentNewest.postage;
        }
      }
    }, () => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  changePaymentName() {
    const param = {
      theInput: this.paymentNewest.paymentName,
      hiddenInput: this.paymentNewest.paymentNo,
      placeholder: 'MSG.ME5002.PLACEHOLDER',
      type: 'text',
      autocomplete: 'off',
      minlength: 1,
      maxlength: 64,
      isConfirm: true,
      isCheckValidate: false,
      checkCallValidate: true,
    };
    this.dialogService.showInputPaymentnameDialog('MSG.ME5002.E001_1', param).subscribe(
      (res: DialogResult) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(true);
        });
        if (res.isOk()) {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          const inputData = {'paymentNo': this.paymentNewest.paymentNo, 'paymentName': res.payload.input};
          this.meetingService.putChangePaymentName(inputData).subscribe(() => {
              this.dialogService.setLoaderVisible(false);
              this.dialogService.showSuccess('MSG.SAVED');
              this.paymentNewest.paymentName = res.payload.input;
            },
            () => {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(false);
              });
              this.dialogService.showError('MSG.ERROR');
            });
        } else if (res.isCancel()) {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
        }
      }, () => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      });
  }

  redirectReceipt(paymentNewest) {
    this.type = 'receipt';
    this.localStorage.remove('payment');
    this.localStorage.set('payment', JSON.stringify(paymentNewest));
    this.redirectPage(this.type);
  }

  redirectInvoice(payment) {
    this.type = 'invoice';
    this.localStorage.remove('payment');
    this.localStorage.set('payment', JSON.stringify(payment));
    this.redirectPage(this.type);
  }

  redirectPage(type) {
    window.open('/me/me5002/' + type, '_blank');
  }
}
