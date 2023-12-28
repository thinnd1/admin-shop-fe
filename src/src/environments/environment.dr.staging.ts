import {Product, Profile} from '../app/common/profile';

export const environment = {
  app: Product.Drjoy,
  profile: Profile.staging,
  production: true,
  api: 'https://drjoy.staging.famishare.jp',
  authApi: 'https://drjoy.staging.famishare.jp',
  socket: 'mock',
  firebase: {
    apiKey: 'AIzaSyCns4BGJEEZQNunvCtr-56c_zZWl03-Cs8',
    authDomain: 'drjoy-rep-dev.firebaseapp.com',
    databaseURL: 'https://drjoy-rep-dev.firebaseio.com',
    projectId: 'drjoy-rep-dev',
    storageBucket: 'drjoy-rep-dev.appspot.com',
    messagingSenderId: '331816168265'
  },
  clientId: 'drjoy',
  clientSecret: 'drjoy',
  quickClientId: 'personal',
  quickClientSecret: 'personal',
  nologinChatClientId: 'chat',
  nologinChatClientSecret: 'chat',
  nologinMeetingClientId: 'meeting',
  nologinMeetingClientSecret: 'meeting',
};
