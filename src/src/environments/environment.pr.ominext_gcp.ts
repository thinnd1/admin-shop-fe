import {Product, Profile} from '../app/common/profile';

export const environment = {
  app: Product.Prjoy,
  profile: Profile.ominext_gcp,
  production: false,
  api: 'https://ominext.prjoy.famishare.jp',
  authApi: 'https://ominext.prjoy.famishare.jp',
  socket: 'mock',
  firebase: {
    apiKey: 'AIzaSyBEI1azgfkWYY_mIc2fvinsTfGiXIaqitk',
    authDomain: 'ominext-rep-dev.firebaseapp.com',
    databaseURL: 'https://ominext-rep-dev.firebaseio.com',
    projectId: 'ominext-rep-dev',
    storageBucket: 'ominext-rep-dev.appspot.com',
    messagingSenderId: '250661948851'
  },
  clientId: 'prjoy',
  clientSecret: 'prjoy',
  quickClientId: '',
  quickClientSecret: '',
  nologinChatClientId: '',
  nologinChatClientSecret: '',
  nologinMeetingClientId: '',
  nologinMeetingClientSecret: '',
};
