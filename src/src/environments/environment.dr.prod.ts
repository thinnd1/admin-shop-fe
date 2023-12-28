import {Product, Profile} from '../app/common/profile';

export const environment = {
  app: Product.Drjoy,
  profile: Profile.release,
  production: true,
  api: 'https://master.drjoy.famishare.jp',
  authApi: 'https://master-oauth.famishare.jp',
  socket: 'https://master-rtm.famishare.jp/event',
  firebase: {
    apiKey: 'AIzaSyAHXqf9-iQtxfbo0nw7ptDQhday5jF5ut0',
    authDomain: 'drjoy-master.firebaseapp.com',
    databaseURL: 'https://drjoy-master.firebaseio.com',
    projectId: 'drjoy-master',
    storageBucket: 'drjoy-master.appspot.com',
    messagingSenderId: '477859189652'
  },
  clientId: 'dr0e3BYb',
  clientSecret: 'hMLaJr1KVnV13sdH',
  quickClientId: 'qpW9IEHg',
  quickClientSecret: 'QA3k9HzUjxstJqPT',
  nologinChatClientId: 'qcdr9As9',
  nologinChatClientSecret: 'isZvMYc6GeUka1R0',
  nologinMeetingClientId: 'qm1IdFSe',
  nologinMeetingClientSecret: 'AcKF4HXZyScFAtlh',
};
