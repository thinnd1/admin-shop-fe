import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-me0054-page',
  templateUrl: './me0054-page.component.html',
  styleUrls: ['./me0054-page.component.scss']
})
export class Me0054PageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  	$('.check-box .btn').on('click', function () {
      $(this).addClass('btn-primary-active').siblings().removeClass('btn-primary-active');
    });
  }

}
