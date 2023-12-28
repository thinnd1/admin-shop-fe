import { Component, OnInit } from '@angular/core';
import {LocalStorage} from '../../../services/local-storage.service';
import {Router} from '@angular/router';
declare var moment: any;

@Component({
  selector: 'app-me0018-page',
  templateUrl: './me0018-page.component.html',
  styleUrls: ['./me0018-page.component.scss']
})
export class Me0018PageComponent implements OnInit {

  constructor(private localStorage: LocalStorage, private router: Router) { }

  ngOnInit() {
  }

  goToCalendar() {
    const start = moment().add(7, 'days').format('YYYY-MM-DDTHH:00');
    const end = moment(start).add(0.5, 'hours').format('YYYY-MM-DDTHH:mm');
    const date = moment(start).format('YYYY-MM-DD');
    const time = moment(start).format('HH:mm:ss');
    const number = (parseInt(moment(start).format('H'), 10) + 1 ) * 2;
    this.localStorage.setObject('createFrameMeting', {start: start, end: end, date : date, time: time, number: number});
    this.router.navigate(['/ca/ca0002']);
  }

}
