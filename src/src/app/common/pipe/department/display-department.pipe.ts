import { Pipe, PipeTransform } from '@angular/core';
import {Helper} from "../../helper";

@Pipe({name: 'displayDepartment'})
export class DisplayDepartmentPipe implements PipeTransform {
  constructor(private helper: Helper){}
  transform(value: string): string {
    let displayDepartment = '';
    if(value.indexOf('/') < 0){
      return value;
    }
    if(value !== '') {
      displayDepartment = value.slice(1, -1).replace(/\//g, ' | ');
    } else {
      displayDepartment = '';
    }
    return displayDepartment;
  }
}
