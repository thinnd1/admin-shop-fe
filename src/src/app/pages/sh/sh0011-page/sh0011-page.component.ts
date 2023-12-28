import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-sh0011-page',
  templateUrl: './sh0011-page.component.html',
  styleUrls: ['./sh0011-page.component.scss']
})
export class Sh0011PageComponent implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit() {
  }
  ngAfterViewInit() {
    var a = true;
    $(".color-wrap span.color-box").click(function(){
    	if(a){
    		$(this).next(".modal-color").show();
    		a = false;
    	}
    	else{
    		$(this).next(".modal-color").hide();
    		a = true;
    	}
    });
    $(".lst-color li").click(function(){
    	$(".modal-color").hide();
    		a = true;
    });
  }

}
