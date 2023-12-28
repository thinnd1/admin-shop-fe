import {Product, Profile} from '../app/common/profile';

export const environment = {
  app: Product.Drjoy,
  profile: Profile.local,
  production: false,
  api: 'https://ominext.drjoy.famishare.jp',
  authApi: 'https://ominext.drjoy.famishare.jp',
  socket: 'mock',
  firebase: {
    apiKey: 'AIzaSyBZ1RTPhbg1EbAQMikjfX2yuWekR2O5gEc',
    authDomain: 'ominext-rep-storage-dev.firebaseapp.com',
    databaseURL: 'https://ominext-rep-storage-dev.firebaseio.com',
    projectId: 'ominext-rep-storage-dev',
    storageBucket: 'ominext-rep-storage-dev.appspot.com',
    messagingSenderId: '643053281169'
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
