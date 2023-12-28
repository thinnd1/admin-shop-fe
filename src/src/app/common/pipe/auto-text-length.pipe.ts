import {NgZone, Pipe, PipeTransform} from '@angular/core';
import {Observable} from 'rxjs/Observable';

declare const $: any;

@Pipe({
  name: 'autoTextLength',
  pure: false
})

export class AutoTextLengthPipe implements PipeTransform {
  constructor(private ngZone: NgZone) {
  }

  transform(originalText: string, element: any, isDelay?: boolean, numberLine?: number, keyDotsNotShow?: boolean): Observable<string> {
    let timer: number;
    return Observable.create((observer) => {
      let latestText = '';
      let limitTextWidth = 0;
      // Repeatedly set new timeouts for new update checks.
      const registerUpdate = () => {
        limitTextWidth = $('#' + element).parent().width();
        const textOutput = this.autoTextLength(originalText, limitTextWidth, keyDotsNotShow, numberLine);
        if (textOutput !== latestText) {
          latestText = textOutput;
          this.ngZone.run(() => {
            observer.next(latestText);
          });
        }
        timer = window.setTimeout(() => {
          limitTextWidth = Math.round($('#' + element).parent().width());
          registerUpdate();
        }, 0);
      };
      this.ngZone.runOutsideAngular(registerUpdate);

      // Return teardown function
      const teardownFunction = () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
      return teardownFunction;
    });
  }

  autoTextLength(originalText: string, limitTextWidth: number, keyDotsNotShow?: boolean, numberLine?: number) {
    let result = '';
    if (originalText) {
      const span = document.createElement('span');
      span.style.visibility = 'hidden';
      span.style.whiteSpace = 'nowrap';
      span.innerHTML = originalText;
      document.body.appendChild(span);

      if (numberLine) {
        limitTextWidth *= numberLine;
      }
      if (span.offsetWidth > limitTextWidth) {
        const pxPerChar = span.offsetWidth / originalText.length;
        const shortText = Math.round(limitTextWidth / pxPerChar);
        result = keyDotsNotShow ? originalText.substring(0, shortText - 3) : originalText.substring(0, shortText - 3) + '...';
      } else {
        result = originalText;
      }
      span.remove();
    }
    return result;
  }

}
