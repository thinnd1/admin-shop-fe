/**
 * Created by Anh Quang on 2017/09/10.
 */
import {Product, Profile} from '../app/common/profile';

export const environment = {
  app: Product.Drjoy,
  profile: Profile.develop,
  production: false,
  api: 'http://27.72.57.38:8031',
  authApi: 'http://27.72.57.38:8031',
  socket: 'mock',
  firebase: {
    // apiKey: 'AIzaSyBGkWl3QnjdN3NfHpr5X666NG_-8yAdzsk',
    // authDomain: 'drjoy-dev-08022018.firebaseapp.com',
    // databaseURL: 'https://drjoy-dev-08022018.firebaseio.com',
    // projectId: 'drjoy-dev-08022018',
    // storageBucket: 'drjoy-dev-08022018.appspot.com',
    // messagingSenderId: '1025667628114'
    apiKey: 'AIzaSyBuZbDIj754p4VFSrq8N-WD-vKQdU32GEE',
    authDomain: 'drjoy-rep-test.firebaseapp.com',
    databaseURL: 'https://drjoy-rep-test.firebaseio.com',
    projectId: 'drjoy-rep-test',
    storageBucket: 'drjoy-rep-test.appspot.com',
    messagingSenderId: '559479227908'
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
