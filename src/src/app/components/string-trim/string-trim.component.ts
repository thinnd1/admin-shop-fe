import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-string-trim',
  templateUrl: './string-trim.component.html',
  styleUrls: ['./string-trim.component.scss']
})
export class StringTrimComponent implements OnInit {
  @Input() str: string = null;
  @Input() len: number = 0;
  public stringTrimText;
  public stringTrimEllipsis;

  constructor() { }

  ngOnInit() {
    if(this.str){
      // this.str = this.str.replace(/\s+/g,'');
      this.stringTrimEllipsis = (this.str.length > +this.len);
      this.stringTrimText = (this.len != 0) ? this.str.slice(0,this.len) : this.str;
    }
  }
}
