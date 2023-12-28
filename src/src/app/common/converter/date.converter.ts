import { Injectable } from '@angular/core';
import { SharedValueService } from '../../services/shared-value.service';
import * as moment from 'moment';

@Injectable()
export class DateConverter {
  constructor(private sharedValueService: SharedValueService) {
  }
  public lang;
  moment(date:string,format:string){
    this.lang = this.sharedValueService.lang;
    return moment(date).locale(this.lang).format(format);
  }

  isSame(baseDate:string,compareDate:string,format:string){
    switch (format){
      case 'year':
        return moment(baseDate).isSame(compareDate,'year');
      case 'month':
        return moment(baseDate).isSame(compareDate,'month');
      case 'week':
        return moment(baseDate).isSame(compareDate,'week');
      case 'day':
        return moment(baseDate).isSame(compareDate,'day');
      case 'hour':
        return moment(baseDate).isSame(compareDate,'hour');
      case 'minute':
        return moment(baseDate).isSame(compareDate,'minute');
      case 'second':
        return moment(baseDate).isSame(compareDate,'hour');
      default:
        return moment(baseDate).isSame(compareDate,'second');
    }
  }

  isBefore(baseDate:string,compareDate:string){
    return moment(baseDate).isBefore(compareDate);
  }

  isAfter(baseDate:string,compareDate:string){
    return moment(baseDate).isAfter(compareDate);
  }

}
