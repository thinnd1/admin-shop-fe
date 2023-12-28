import {Directive, ElementRef, Input} from '@angular/core';

@Directive({
  selector: 'textarea[appAutofocus]'
})
export class AutoFocusTextboxDirective {
  private _autofocus;
  @Input() conditionFocus: boolean;
  constructor(private el: ElementRef) {  }

  @Input('conditionFocus')
  set autofocus(condition: boolean) {
    if (this._autofocus !== condition) {
      this._autofocus = condition;
      if (condition) {
        setTimeout(() => {
          this.el.nativeElement.focus();
        });
      } else {
        this.el.nativeElement.blur();
      }
    }
  }
}
