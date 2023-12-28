import {AfterContentChecked, Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
  selector: 'textarea[appAutoSize]'
})
export class AutoSizeTextareaDirective implements AfterContentChecked {
  contentCached: string;

  constructor(public element: ElementRef) {}

  @HostListener('input', ['$event.target'])
  public onInput(element) {
    this.resize(element);
  }

  public ngAfterContentChecked() {
    if (this.contentCached !== this.element.nativeElement.value) {
      this.resize(this.element.nativeElement);
    }
  }

  public resize(element) {
    this.contentCached = element.value;
    if (element.value.length > 0) {
      element.style.height = `${element.scrollHeight}px`;
    } else {
      element.style.height = 'auto';
    }
  }

}
