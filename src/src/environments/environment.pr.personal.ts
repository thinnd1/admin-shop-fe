import {Product, Profile} from '../app/common/profile';

export const environment = {
  app: Product.Prjoy,
  profile: Profile.ominext_gcp,
  production: false,
  api: 'http://27.72.57.38:52936',
  authApi: 'http://27.72.57.38:52936',
  socket: 'mock',
  firebase: {
    apiKey: 'AIzaSyCj7fVgC8iDDa-w-Xg80sqPRrlQ1Gwg6lk',
    authDomain: 'drjoy-personal-dev.firebaseapp.com',
    databaseURL: 'https://drjoy-personal-dev.firebaseio.com',
    projectId: 'drjoy-personal-dev',
    storageBucket: 'drjoy-personal-dev.appspot.com',
    messagingSenderId: '7876866779'
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
