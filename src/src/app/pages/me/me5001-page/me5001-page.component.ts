import {Component, OnInit, AfterViewInit} from '@angular/core';
import {DialogService} from '../../../services/dialog.service';
import set = Reflect.set;

@Component({
  selector: 'app-me5001-page',
  templateUrl: './me5001-page.component.html',
  styleUrls: ['./me5001-page.component.scss']
})
export class Me5001PageComponent implements OnInit, AfterViewInit {

  constructor(private dialogService: DialogService) {
  }

  ngOnInit() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    setTimeout(() => {
      this.dialogService.setLoaderVisible(false);
    }, 1000);
  }

  receptionPolicy() {
    window.open('/assets/examples/me/reception_policy.pdf', '_blank');
  }

  ngAfterViewInit() {
    $(function () {
      $('.faq-lst .quest-cont').click(function () {
        $(this).find('.fa').toggleClass('fa-angle-up');
        if (!$(this).hasClass('active')) {
          $(this).next('.answer-cont').slideDown();
          setTimeout(() => {
            $(this).addClass('active');
          }, 500);
        } else {
          $(this).removeClass('active');
          $(this).next('.answer-cont').slideUp();
        }
      });
    });
  }

}
