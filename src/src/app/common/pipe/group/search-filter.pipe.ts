/**
 * Created by thaobtb on 9/25/2017.
 */

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'searchFilter',
  pure: false
})

export class SearchFilter implements PipeTransform {
  transform(datas: any[], value: any): any[] {
    if (value && datas && datas.length > 0) {
      const filterKey = this.getKeys(value);
      return datas.filter(item => {
          return filterKey.some((keyName) => {
            const word = value[keyName].toUpperCase();
            const isShow = item[keyName].toUpperCase().indexOf(word) > -1;
            item.isShow = (isShow || value[keyName] === '');
            return isShow || value[keyName] === '';
          });
      });
    } else {
      return datas;
    }
  }

  getKeys(obj) {
    let keys = Object.keys(obj);
    keys.forEach((val) => {
      if (obj[val] instanceof Object) {
        keys = keys.concat(this.getKeys(obj[val]));
      }
    });
    return keys;
  }
}
