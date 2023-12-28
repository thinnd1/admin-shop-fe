import {Product, Profile} from '../app/common/profile';

export const environment = {
  app: Product.Prjoy,
  profile: Profile.develop,
  production: false,
  api: 'https://develop.prjoy.famishare.jp',
  authApi: 'https://develop.prjoy.famishare.jp',
  socket: 'https://develop-rtm.famishare.jp/event',
  firebase: {
    apiKey: 'AIzaSyBZzxLMJnm7rlctgxLnft1nte1GoceQ5Zg',
    authDomain: 'drfir-develop.firebaseapp.com',
    databaseURL: 'https://drfir-develop.firebaseio.com',
    projectId: 'drfir-develop',
    storageBucket: 'drfir-develop.appspot.com',
    messagingSenderId: '500425104758'
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
