import {ChangeDetectorRef, Directive, HostBinding, Input, OnInit} from '@angular/core';

@Directive({
  selector: '[appImgPreloader]',
})

export class ImgPreloaderDirective implements OnInit {
  @Input() targetSource: string;
  @Input('targetSource')
  set srcData(value) {
    if (value) {
      this.preloadImage(value);
    }
  }
  downloadingImage: any;
  @HostBinding('attr.src') finalImage;
  @HostBinding('style.opacity') isPreload = 0;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {}

  preloadImage(targetSource) {
    this.downloadingImage = new Image();
    this.downloadingImage.onload = () => {
      this.isPreload = 1;
      this.finalImage = targetSource;
      if (!this.changeDetectorRef['destroyed']) {
        this.changeDetectorRef.detectChanges();
      }
    };
    this.downloadingImage.src = targetSource;
  }
}
