import {Component, OnInit} from '@angular/core';
import {SharedValueService} from '../../services/shared-value.service';
import {PopupHover, PopupHoverResult} from '../../models/popup-hover';
import {Subject} from 'rxjs/Subject';

declare const $: any;

@Component({
  selector: 'app-popup-hover',
  templateUrl: './popup-hover.component.html',
  styleUrls: ['./popup-hover.component.scss']
})
export class PopupHoverComponent implements OnInit {
  public popup = new PopupHover(null, null, null, null, null, null, false, false, new Subject(), null);
  public showPopup = true;
  public top = 0;
  public left = 0;
  public showTop = true;
  public maxHeight: number;
  public leftPopup = 0;
  public topPopup = 0;
  public position: any;
  public showLeft = false;
  public showRight = false;

  constructor(private sharedService: SharedValueService) {
  }

  ngOnInit() {
    this.maxHeight = this.get_calendar_height();
    this.sharedService.showPopupHover.subscribe(popup => {
      this.popup = popup;
      const target = $(this.popup.jsEvent.target);
      let top = target.offset().top + target.height();
      let left = target.offset().left;

      if (this.popup.defaultView === 'month') {
        const position = new Array();
        $('.fc-day-header').each(function( index ) {
          const positionClass = {};
          positionClass['left'] = $(this).offset().left;
          position.push(positionClass);
        });

        const widthDayCalendar = $('.fc-day-header').width();

        for (let i = 0; i < position.length; i++) {
          if (position[i].left <= left && left <= (position[i].left + widthDayCalendar)) {
            left = position[i].left + widthDayCalendar / 2;
            break;
          }
        }
      } else {
        left += target.width() / 2;
        top -= target.height();
      }

      const widthPopup = 260;
      // set position let of popupHover
      const limitLeft = $('.fc-day-header').offset().left;
      if ((left - widthPopup / 2) < limitLeft) {
        this.showLeft = true;
        this.showRight = false;
        this.leftPopup = left - widthPopup * 20 / 100;
      } else {
        if ((left + widthPopup / 2) < $(window).width()) {
          this.leftPopup = left - widthPopup / 2;
          this.showLeft = false;
          this.showRight = false;
        } else {
          this.showLeft = false;
          this.showRight = true;
          this.leftPopup = left - widthPopup * 80 / 100;
        }
      }

      $('#popupHover').show();
      this.showPopup = false;

      // setTimeout(() => {
        const heightPopup = $('.contentPopupHover').height();

        // set position top of popupHover
        if ((heightPopup + top + 10) < this.maxHeight) {
          this.showTop = true;
          this.leftPopup = left - widthPopup / 2;
          this.topPopup = (top < $('.fc-body').offset().top && this.popup.defaultView !== 'month') ?
            ($('.fc-time-grid-container').offset().top  + 5) : top;
        } else {
          this.showTop = false;
          this.leftPopup = left - widthPopup / 2;
          this.topPopup = (this.popup.defaultView === 'month') ? (top - target.height() - heightPopup - 5) : (top - heightPopup + 5);
          if (this.topPopup < 60) {
            this.showTop = true;
            this.topPopup = top;
          }
        }

        $('#popupHover').css({
          'position': 'absolute',
          'z-index': 1000,
          'left': this.leftPopup,
          'top': this.topPopup,
        });
      // });
    });

    $(window).resize(() => {
      this.maxHeight = this.get_calendar_height();
    });
  }

  close() {
    this.popup = new PopupHover(null, null, null, null, null, null, false, false, new Subject(), null);
    this.showPopup = true;
    $('#popupHover').hide();
  }

  onClickButton(nameBtn) {
    this.popup.subject.next(new PopupHoverResult(nameBtn));
    this.popup.subject.complete();
    this.close();
  }

  get_calendar_height() {
    return $(window).height();
  }
}
