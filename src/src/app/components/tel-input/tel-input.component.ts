
import {Component, OnInit, Input, Output, EventEmitter, AfterViewInit, SimpleChanges, OnChanges} from '@angular/core';
import {Helper} from '../../common/helper';

@Component({
  selector: 'app-tel-input',
  templateUrl: './tel-input.component.html',
  styleUrls: ['./tel-input.component.scss']
})

export class TelInputComponent implements OnInit, AfterViewInit, OnChanges {
  public telFirst: any = null;
  public telMiddle: any = null;
  public telLast: any = null;
  public telLength = {
    first: {
      min: 0,
      max: 0
    },
    middle: {
      min: 0,
      max: 0
    },
    last: {
      min: 0,
      max: 0
    }};

  @Input() tel: string;
  @Input() telInputOptions: any = {
    name: null,
    id: null,
    error: null,
    isMobile: false,
    isShowText: true
  };
  @Output() telChanged = new EventEmitter<any>();

  constructor(private helper: Helper) {
  }

  checkMobile(val: string) {
    return (!val.match(/^\d{3}-\d{4}-\d{4}$/)) ? true : false;
  }

  checkTel(val: string) {
    return (!val.match(/^\d{2,5}-\d{1,4}-\d{4}$/)) ? true : false;
  }

  splitTel() {

    if (this.telInputOptions.isMobile) {
      if (this.checkMobile(this.tel)) return false;
    } else {
      if (this.checkTel(this.tel)) return false;
    }
    let telArray = this.tel.split('-');
    this.telFirst = telArray[0];
    this.telMiddle = telArray[1];
    this.telLast = telArray[2];
  }

  joinTel() {
    return this.telFirst + '-' + this.telMiddle + '-' + this.telLast;
  }

  setLength() {

    if (this.telInputOptions.isMobile) {
      this.telLength = {
        first: {
          min: 3,
          max: 3
        },
        middle: {
          min: 4,
          max: 4
        },
        last: {
          min: 4,
          max: 4
        }
      };
    } else {
      this.telLength = {
        first: {
          min: 2,
          max: 5
        },
        middle: {
          min: 1,
          max: 4
        },
        last: {
          min: 4,
          max: 4
        }
      };
    }
  }

  ngOnInit() {
    this.setLength();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tel'] &&  changes['tel'].previousValue !== changes['tel'].currentValue) {
      this.tel = changes['tel'].currentValue;
      this.splitTel();
    }
  }

  ngAfterViewInit() {
    $('#' + this.telInputOptions.id + '-first').on('keydown', this.helper.numericOnly);
    $('#' + this.telInputOptions.id + '-middle').on('keydown', this.helper.numericOnly);
    $('#' + this.telInputOptions.id + '-last').on('keydown', this.helper.numericOnly);
    this.helper.numbericOnlyPaste(this.telInputOptions.id + '-first');
    this.helper.numbericOnlyPaste(this.telInputOptions.id + '-middle');
    this.helper.numbericOnlyPaste(this.telInputOptions.id + '-last');
  }

  changeFields(event: any) {
    const checkError = (this.telInputOptions.isMobile) ? this.checkMobile(this.joinTel()) : this.checkTel(this.joinTel());
    this.telChanged.emit({isError: checkError, val: this.joinTel()});
  }

}
