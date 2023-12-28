import {Product, Profile} from '../app/common/profile';

export const environment = {
  app: Product.Prjoy,
  profile: Profile.release,
  production: true,
  api: 'https://master.prjoy.famishare.jp',
  authApi: 'https://master-oauth.famishare.jp',
  socket: 'mock',
  firebase: {
    apiKey: 'AIzaSyAHXqf9-iQtxfbo0nw7ptDQhday5jF5ut0',
    authDomain: 'drjoy-master.firebaseapp.com',
    databaseURL: 'https://drjoy-master.firebaseio.com',
    projectId: 'drjoy-master',
    storageBucket: 'drjoy-master.appspot.com',
    messagingSenderId: '477859189652'
  },
  clientId: 'pryk8FXu',
  clientSecret: 'nxBPvHt6KYNZgWTP',
  quickClientId: '',
  quickClientSecret: '',
  nologinChatClientId: '',
  nologinChatClientSecret: '',
  nologinMeetingClientId: '',
  nologinMeetingClientSecret: '',
};
