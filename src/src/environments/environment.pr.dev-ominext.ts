import {Product, Profile} from '../app/common/profile';

export const environment = {
  app: Product.Prjoy,
  profile: Profile.develop,
  production: false,
  api: 'https://ominext.drjoy.famishare.jp',
  authApi: 'https://ominext.drjoy.famishare.jp',
  socket: 'mock',
  firebase: {
    apiKey: 'AIzaSyBj5HTfqS8u4GjbdqS5FxnFKOaIh2gbuxU',
    authDomain: 'drfir-dev-ominext.firebaseapp.com',
    databaseURL: 'https://drfir-dev-ominext.firebaseio.com',
    projectId: 'drfir-dev-ominext',
    storageBucket: 'drfir-dev-ominext.appspot.com',
    messagingSenderId: '879186958042'
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
