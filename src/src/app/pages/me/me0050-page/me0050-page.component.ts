import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-me0050-page',
  templateUrl: './me0050-page.component.html',
  styleUrls: ['./me0050-page.component.scss']
})
export class Me0050PageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  	$('.check-box .btn').on('click', function () {
      $(this).addClass('btn-primary-active').siblings().removeClass('btn-primary-active');
    });
    $(".select-popup").click(function(){
    	$(".select-wrap").slideToggle();
	});
  }

}
