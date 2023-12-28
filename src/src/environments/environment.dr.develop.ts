import {Product, Profile} from '../app/common/profile';

export const environment = {
  app: Product.Drjoy,
  profile: Profile.develop,
  production: false,
  api: 'https://develop.drjoy.famishare.jp',
  authApi: 'https://develop.drjoy.famishare.jp',
  socket: 'https://develop-rtm.famishare.jp/event',
  firebase: {
    apiKey: 'AIzaSyBZzxLMJnm7rlctgxLnft1nte1GoceQ5Zg',
    authDomain: 'drfir-develop.firebaseapp.com',
    databaseURL: 'https://drfir-develop.firebaseio.com',
    projectId: 'drfir-develop',
    storageBucket: 'drfir-develop.appspot.com',
    messagingSenderId: '500425104758'
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
