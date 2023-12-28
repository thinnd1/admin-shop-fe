/**
 * Created by thaobtb on 10/17/2017.
 */

import {Pipe, PipeTransform} from '@angular/core';
import {Helper} from '../../helper';

@Pipe({
  name: 'filterInfo',
  pure: false
})

export class FilterUserInfoPipe implements PipeTransform {
  constructor(private helper: Helper) {}

  transform( infos: any[], value, isSort?: boolean, isAll?: boolean) {
    if (value.length > 0 && infos) {
        if (isSort) {
          const arr_1 = infos.filter(item => value.indexOf(item.id) !== -1);
          return this.helper.sort('fullNameKana', arr_1);
        } else {
          const arr_2 =  infos.filter(item => value.indexOf(item.id) !== -1);
          return this.mapOrder(arr_2, value, 'id');
        }
    } else if (infos && isAll) {
      return infos;
    } else {
      return;
    }
  }

  mapOrder (array, order, key) {
    array.sort( (a, b) => {
      const A = a[key], B = b[key];

      if (order.indexOf(A) > order.indexOf(B)) {
        return 1;
      } else {
        return -1;
      }
    });
    return array;
  };
}
