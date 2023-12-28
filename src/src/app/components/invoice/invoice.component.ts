import {Component, HostListener, OnInit} from '@angular/core';
import {VisitCardPayments} from '../../models/me/visit-card-payments';
import {MeetingService} from '../../services/meeting.service';
import {Router, ActivatedRoute} from '@angular/router';
import {SharedValueService} from '../../services/shared-value.service';
import {DateConverter} from '../../common/converter/date.converter';
import {LocalStorage} from '../../services/local-storage.service';
import {Listener} from 'selenium-webdriver';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {
  paymentNewest: any;
  paymentTotal: number;
  type: string;
  tax: number;
  arrPaymentName = [];
  paymentName: string;
  companyArr: any;
  company: string;

  constructor(private meetingService: MeetingService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private dateConverter: DateConverter,
              private localStorage: LocalStorage) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((param: any) => {
      this.type = param['type'].toLowerCase();
      if (this.type !== 'invoice' && this.type !== 'receipt') {
        this.router.navigate(['me/me5002']);
      }
    });
    this.getCardPayments();
  }

  getCardPayments() {
    this.paymentNewest = JSON.parse(this.localStorage.get('payment'));
    if (Object.keys(this.paymentNewest).length !== 0) {
      this.tax = Math.round(this.paymentNewest.price / 100 * this.paymentNewest.tax);
      this.paymentTotal = this.paymentNewest.price + this.tax + this.paymentNewest.postage;
    } else {
      // window.close();
      this.router.navigate(['/me/me5002']);
    }
  }

  // Event check reload page
  @HostListener('window:unload', ['$event'])
  checkLoadPage(event) {
    this.localStorage.remove('payment');
    this.router.navigate(['me/me5002']);
  }
}
