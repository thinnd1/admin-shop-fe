import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-count-up-input',
  templateUrl: './count-up-input.component.html',
  styleUrls: ['./count-up-input.component.scss']
})
export class CountUpInputComponent implements OnInit {
  public conter: number = 0;
  public isError: boolean;
  @Input() countUpInput: string;
  @Input() countUpInputOptions: any = {
    name: null,
    id: null,
    type: 'text',
    placeholder: null,
    maximumInputLength: 100,
    error: null
  };
  @Output() countUpInputChanged = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit() {
    this.countUp();
  }

  countUp(){
    const maxLength = this.countUpInputOptions.maximumInputLength;
    this.conter = this.countUpInput.length;
    this.isError = (this.conter > maxLength);
  }

  changeFields(event: any) {
    this.countUp();
    this.countUpInputChanged.emit({isError:this.isError,val:this.countUpInput});
  }
}
