import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-count-up-textarea',
  templateUrl: './count-up-textarea.component.html',
  styleUrls: ['./count-up-textarea.component.scss']
})
export class CountUpTextareaComponent implements OnInit {
  public conter: number = 0;
  public isError: boolean;
  @Input() countUpTextarea: string;
  @Input() countUpTextareaOptions: any = {
    name: null,
    id: null,
    placeholder: null,
    maximumInputLength: 100,
    error: null
  };
  @Output() countUpTextareaChanged = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    this.countUp();
  }

  countUp(){
    const maxLength = this.countUpTextareaOptions.maximumInputLength;
    this.conter = this.countUpTextarea.length;
    this.isError = (this.conter > maxLength);
  }

  changeFields(event: any) {
    this.countUp();
    this.countUpTextareaChanged.emit({isError:this.isError,val:this.countUpTextarea});
  }

}
