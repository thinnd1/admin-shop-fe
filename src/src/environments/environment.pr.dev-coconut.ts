import {Product, Profile} from '../app/common/profile';

export const environment = {
  app: Product.Prjoy,
  profile: Profile.develop,
  production: false,
  api: 'https://coconut.drjoy.famishare.jp',
  authApi: 'https://coconut.drjoy.famishare.jp',
  socket: 'https://coconut-rtm.famishare.jp/event',
  firebase: {
    apiKey: 'AIzaSyAJOgVPneqp56EwqyujzXqCrfDNx8AatGk',
    authDomain: 'drfir-dev-coconut.firebaseapp.com',
    databaseURL: 'https://drfir-dev-coconut.firebaseio.com',
    projectId: 'drfir-dev-coconut',
    storageBucket: 'drfir-dev-coconut.appspot.com',
    messagingSenderId: '1038959214873'
  },
  clientId: 'drjoy',
  clientSecret: 'drjoy',
  quickClientId: 'personal',
  quickClientSecret: 'personal',
  nologinChatClientId: 'chat',
  nologinChatClientSecret: 'chat',
  nologinMeetingClientId: 'meeting',
  nologinMeetingClientSecret: 'meeting'
};
