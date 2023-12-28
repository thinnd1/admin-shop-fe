import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: 'img[thumbnail]'
})
export class ThumbnailDirective {
  @Input() public image: any;

  constructor(private el: ElementRef) { }

  ngOnChanges(changes: SimpleChanges) {
    const el = this.el;
    const windowURL = ((<any>window).URL || (<any>window).webkitURL);
    let url: string;
    if (this.image) {
      url = windowURL.createObjectURL(this.image);
      el.nativeElement.src = url;
      el.nativeElement.onload = () => {
        windowURL.revokeObjectURL(url);
      };
    }
  }
}
