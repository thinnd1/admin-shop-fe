import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  	$(".list-sticker-chat li").click(function(){
  		$(this).addClass("current").siblings("li").removeClass("current");
  	});
  	$(".tab-list-sticker-content li").hover(function(){
  		var src_attr = $(this).find("img").attr("src");
  		console.log(src_attr);
  		$(".popup-sticker img").attr("src", src_attr);
		});
		
		$("#buttom-sticker").click(function(){
			if($('#content-sticker').hasClass("open-sticker")){
				$(".content-sticker").removeClass("open-sticker");
			}else {
			 	$(".content-sticker").addClass("open-sticker");
			}
		});
		$(".close-pupup-sticker").click(function(){
			if($('#content-sticker').hasClass("open-sticker")){
			 	$(".content-sticker").removeClass("open-sticker");

			}
		})
  }

}
