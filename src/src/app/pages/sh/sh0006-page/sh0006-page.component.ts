import { Component, OnInit, AfterViewInit } from '@angular/core';
declare const $: any;
@Component({
  selector: 'app-sh0006-page',
  templateUrl: './sh0006-page.component.html',
  styleUrls: ['./sh0006-page.component.scss']
})
export class Sh0006PageComponent implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
	$('[data-toggle="tooltip"]').tooltip();
	$(".menu-sub a").click(function(e){
		e.preventDefault()
	});
  }
}
