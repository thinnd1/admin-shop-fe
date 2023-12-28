import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'convertUserInfo',
  pure: true
})

export class ConvertUserInfoPipe implements PipeTransform {
  constructor() {}

  transform(userInfoList: any[]) {
    if (userInfoList && userInfoList.length > 0) {
      return userInfoList.filter(user => {
        user.imageUrl = user.invalid ? '' : user.image;
        user.firstName = user.invalid ? '' : user.firstName;
        user.lastName = user.invalid ? 'アカウント削除' : user.lastName;
        return user;
      });
    } else {
      return;
    }
  }
}
