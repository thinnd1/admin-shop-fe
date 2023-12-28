import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-infinite-scroll',
  templateUrl: './infinite-scroll.component.html',
  styleUrls: ['./infinite-scroll.component.scss']
})
export class InfiniteScrollComponent implements OnInit {
  @Input() infiniteScrollItems: any[];
  @Input() infiniteScrollOptions: any = {
    start: 100,
    limit: 5,
    page: 1,
    height: 0
  };
  @Output() getItems: EventEmitter<any> = new EventEmitter<any>();
  public items = [];
  public isLoading: boolean = true;
  public infiniteScrollHeight: string;

  constructor() {
  }

  ngOnInit() {
    this.infiniteScrollHeight = (this.infiniteScrollOptions.height) ? this.infiniteScrollOptions.height + 'px' : 'auto';
    this.items = this.infiniteScrollItems;
    this.infiniteScrollItems = [];
  }

  onScrollDown () {
    console.log('scrolled!!');
    this.infiniteScrollOptions.page += 1;
    this.infiniteScrollOptions.start += this.infiniteScrollItems.length;

    this.getItems.emit({
      'start':this.infiniteScrollOptions.start,
      'page':this.infiniteScrollOptions.page,
      'limit':this.infiniteScrollOptions.limit
    });

    this.infiniteScrollItems.forEach(function(item, i, array) {
      this.items.push(item);
      this.isLoading = (i === array.length - 1);
    }.bind(this));

  }
}