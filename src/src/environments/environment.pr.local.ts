import {Product, Profile} from '../app/common/profile';

export const environment = {
  app: Product.Prjoy,
  profile: Profile.local,
  production: false,
  api: 'http://localhost:5101',
  authApi: 'http://localhost:5299',
  socket: 'mock',
  firebase: {
    apiKey: 'AIzaSyCns4BGJEEZQNunvCtr-56c_zZWl03-Cs8',
    authDomain: 'drjoy-rep-dev.firebaseapp.com',
    databaseURL: 'https://drjoy-rep-dev.firebaseio.com',
    projectId: 'drjoy-rep-dev',
    storageBucket: 'drjoy-rep-dev.appspot.com',
    messagingSenderId: '331816168265'
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
