import {Product, Profile} from '../app/common/profile';

export const environment = {
  app: Product.Drjoy,
  profile: Profile.develop,
  production: false,
  api: 'https://blueberry.drjoy.famishare.jp',
  authApi: 'https://blueberry.drjoy.famishare.jp',
  socket: 'mock',
  firebase: {
    apiKey: 'AIzaSyC9PJyx54DipkqYIsxrYl8f-zBaGzlOpVc',
    authDomain: 'drfir-dev-blueberry.firebaseapp.com',
    databaseURL: 'https://drfir-dev-blueberry.firebaseio.com',
    projectId: 'drfir-dev-blueberry',
    storageBucket: 'drfir-dev-blueberry.appspot.com',
    messagingSenderId: '508234558852'
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
