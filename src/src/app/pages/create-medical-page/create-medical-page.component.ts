import { Component, OnInit } from '@angular/core';
import {SharedValueService} from '../../services/shared-value.service';
import {DialogService} from '../../services/dialog.service';
declare var moment: any;

@Component({
  selector: 'app-create-medical-page',
  templateUrl: './create-medical-page.component.html',
  styleUrls: ['./create-medical-page.component.scss']
})
export class CreateMedicalPageComponent implements OnInit {
  model: any = {};
  officeType: any;
  eventHoliday: any = {};

  constructor(private shared: SharedValueService, private dialog: DialogService) {
    this.officeType = [
      { Id: 'MEDICAL', Name: 'Medical' },
      { Id: 'PHARMACY', Name: 'Pharmacy' }
    ];
  }

  ngOnInit() {
    this.model.officeType = 'MEDICAL';
  }

  createMedical() {
    console.log(this.model);
    this.shared.postMedical(this.model).subscribe(
      (res) => {
        this.dialog.showSuccess('success');
      },
      (error) => {
        this.dialog.showError('error');
      }
    );
  }
  initData() {
    this.shared.initData().subscribe(
      (res) => {
        this.dialog.showSuccess('success');
      },
      (error) => {
        this.dialog.showError('error');
      }
    );
  }
  cancelMeeting() {
    this.shared.cancelMeeting().subscribe(
      (res) => {
        this.dialog.showSuccess('success');
      },
      (error) => {
        this.dialog.showError('error');
      }
    );
  }
  dateChanged(date: any) {
    date = moment(date).format('YYYY-MM-DD');
    this.eventHoliday.start = date + 'T12:00:00+0000';
  }

  createHolidayEvent() {
    this.shared.createHoliday(this.eventHoliday).subscribe(
      (res) => {
        this.dialog.showSuccess('success');
      },
      (error) => {
        this.dialog.showError('error');
      }
    );
  }
}
