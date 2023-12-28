/**
 * Created by Anh Quang on 2017/09/10.
 */
import {Product, Profile} from '../app/common/profile';

export const environment = {
  app: Product.Prjoy,
  profile: Profile.develop,
  production: false,
  api: 'http://27.72.57.38:8031',
  authApi: 'http://27.72.57.38:8031',
  socket: 'mock',
  firebase: {
    apiKey: 'AIzaSyDQqYSYdpGeMcw7e6frz4rxIfzX1GiZsPg',
    authDomain: 'dr-joy-9b9ad.firebaseapp.com',
    databaseURL: 'https://dr-joy-9b9ad.firebaseio.com',
    projectId: 'dr-joy-9b9ad',
    storageBucket: 'dr-joy-9b9ad.appspot.com',
    messagingSenderId: '251353528667'
    // apiKey: 'AIzaSyCns4BGJEEZQNunvCtr-56c_zZWl03-Cs8',
    // authDomain: 'drjoy-rep-dev.firebaseapp.com',
    // databaseURL: 'https://drjoy-rep-dev.firebaseio.com',
    // projectId: 'drjoy-rep-dev',
    // storageBucket: 'drjoy-rep-dev.appspot.com',
    // messagingSenderId: '331816168265'
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
