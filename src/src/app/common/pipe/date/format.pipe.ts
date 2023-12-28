import {Pipe, PipeTransform} from '@angular/core';


@Pipe({name: 'wrapText'})
export class WrapTextPipe implements PipeTransform {
  transform(value: string, position: number): string {
    if (value) {
      const regex = new RegExp('.{1,' + position + '}', 'g');
      const arr = value.match(regex);
      return arr.join('\n');
    }
  }
}

@Pipe({name: 'formatNumber'})
export class FormatNumber implements PipeTransform {
  transform(value: number): string {
    if (value) {
      return Number(value).toLocaleString('ja');
    }
    return '0';
  }
}
