import {Component, OnInit, Input} from '@angular/core';
import {LocalStorage} from '../../services/local-storage.service';

declare const $: any;

@Component({
  selector: 'app-option-color',
  templateUrl: './option-color.component.html',
  styleUrls: ['./option-color.component.scss']
})

export class OptionColorComponent implements OnInit {
  @Input() calendarReferent: any;
  @Input() optionEventColor: any;
  listColors = new Array(24);
  listColorRandoms = new Array(30);
  showPopupSetColor = false;

  constructor(private localStorage: LocalStorage) {
    this.listColors = [
      {'colorString': '#d576e5', 'colorInt': '13989605'},
      {'colorString': '#ff76bb', 'colorInt': '16742075'},
      {'colorString': '#db4678', 'colorInt': '14370424'},
      {'colorString': '#ef4b4b', 'colorInt': '15682379'},
      {'colorString': '#ff7537', 'colorInt': '16741687'},
      {'colorString': '#ffa412', 'colorInt': '16753682'},
      {'colorString': '#14af65', 'colorInt': '1355621'},
      {'colorString': '#7bd148', 'colorInt': '8114504'},
      {'colorString': '#42ce88', 'colorInt': '4378248'},
      {'colorString': '#2bc1a4', 'colorInt': '2867620'},
      {'colorString': '#4CC5E5', 'colorInt': '5031397'},
      {'colorString': '#3C96EF', 'colorInt': '3970799'},
      {'colorString': '#938BD1', 'colorInt': '9669585'},
      {'colorString': '#EF8E8E', 'colorInt': '15699598'},
      {'colorString': '#DDB50E', 'colorInt': '14529806'},
      {'colorString': '#AFA168', 'colorInt': '11510120'},
      {'colorString': '#AF9380', 'colorInt': '11506560'},
      {'colorString': '#B77777', 'colorInt': '12023671'},
      {'colorString': '#BA8590', 'colorInt': '12223888'},
      {'colorString': '#C997BA', 'colorInt': '13211578'},
      {'colorString': '#8793AA', 'colorInt': '8885162'},
      {'colorString': '#809E8C', 'colorInt': '8429196'},
      {'colorString': '#A0A0A0', 'colorInt': '10526880'},
      {'colorString': '#BCBCBC', 'colorInt': '12369084'}
    ];
    this.listColorRandoms = [
      {'colorString': '#ed88ce'},
      {'colorString': '#dd3aa3'},
      {'colorString': '#b5304f'},
      {'colorString': '#d81919'},
      {'colorString': '#f46d08'},
      {'colorString': '#ffa412'},
      {'colorString': '#edbf00'},
      {'colorString': '#bfe27d'},
      {'colorString': '#8fc31f'},
      {'colorString': '#22ac38'},
      {'colorString': '#006934'},
      {'colorString': '#00a29a'},
      {'colorString': '#5bbbdd'},
      {'colorString': '#4a94d8'},
      {'colorString': '#036eb8'},
      {'colorString': '#0037ff'},
      {'colorString': '#834bbf'},
      {'colorString': '#a78fcc'},
      {'colorString': '#a40b5d'},
      {'colorString': '#915050'},
      {'colorString': '#a48b78'},
      {'colorString': '#956134'},
      {'colorString': '#6d5a49'},
      {'colorString': '#898989'},
      {'colorString': '#867491'},
      {'colorString': '#c997ba'},
      {'colorString': '#afa168'},
      {'colorString': '#708e7e'},
      {'colorString': '#69738c'},
      {'colorString': '#323232'}
    ];
  }

  ngOnInit() {
    $('.color-option-calendar').hide();
  }

  colorRandomToInt() {
    this.listColorRandoms.forEach((value) => {
      value['colorInt'] = value['colorString'].slice(1);
      value['colorInt'] = parseInt(value['colorInt'], 16);
    });
    return this.listColorRandoms;
  }

  convertOptionColorToString(listCalendarReferent) {
    listCalendarReferent.items.forEach((value: string) => {
      let colorHex = value['color'].toString(16);
      if (colorHex.length < 6) {
        let string = '';
        for (let i = 0; i < 6 - colorHex.length; i++) {
          string += '0';
        }
        colorHex = string + colorHex;
      }
      value['colorString'] = '#' + colorHex;
    });
    return listCalendarReferent;
  }

  @Input('optionEventColor')
  set value(event: any) {
    $('.color-option-calendar').hide();
    if (event) {
      setTimeout(() => {
        this.getPosition(event);
      });
    }
  }

  getPosition(event: any) {
    $('.color-option-calendar').show();
    const mouseLeft = event.pageX;
    const mouseTop = event.pageY;

    let leftPopup = mouseLeft - event.offsetX + event.target.clientWidth / 2;
    let topPopup = mouseTop - event.offsetY + event.target.clientHeight;

    const top = $('.content-wrap').offset().top + 20;
    const left = $('.content-wrap').offset().left + 10;

    const widthPopup = 204;

    leftPopup = leftPopup - widthPopup / 2 - left;
    topPopup -= top;

    $('.color-option-calendar').css({
      top: topPopup,
      left: leftPopup,
      position: 'absolute',
      'z-index': 1000,
    });
    this.showPopupSetColor = true;
  }

  changeColor(colorInt, colorString) {
    this.calendarReferent.color = parseInt(colorInt, 0);
    this.calendarReferent.colorString = colorString;
    this.hidePopupSetColor();
    this.localStorage.setObject('activeConfirmDialog', true);
  }

  hidePopupSetColor() {
    if (this.showPopupSetColor) {
      this.showPopupSetColor = false;
      $('.color-option-calendar').hide();
    }
  }

  checkColorActive(listColor: any, calendarReferent: any) {
    if (listColor && calendarReferent && calendarReferent.color === parseInt(listColor.colorInt, 10)) {
      return true;
    }
    return false;
  }
}
