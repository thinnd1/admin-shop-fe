import {Product, Profile} from '../app/common/profile';

export const environment = {
  app: Product.Drjoy,
  profile: Profile.ominext_gcp,
  production: false,
  api: 'http://118.70.177.23:8131',
  authApi: 'http://118.70.177.23:8131',
  socket: 'mock',
  firebase: {
    apiKey: 'AIzaSyCj7fVgC8iDDa-w-Xg80sqPRrlQ1Gwg6lk',
    authDomain: 'drjoy-personal-dev.firebaseapp.com',
    databaseURL: 'https://drjoy-personal-dev.firebaseio.com',
    projectId: 'drjoy-personal-dev',
    storageBucket: 'drjoy-personal-dev.appspot.com',
    messagingSenderId: '7876866779'
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
