// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.
import {Product, Profile} from '../app/common/profile';

export const environment = {
  app: Product.Prjoy,
  profile: Profile.mock,
  production: false,
  api: 'mock',
  authApi: 'mock',
  socket: 'mock',
  firebase: {
    apiKey: 'AIzaSyBuZbDIj754p4VFSrq8N-WD-vKQdU32GEE',
    authDomain: 'drjoy-rep-test.firebaseapp.com',
    databaseURL: 'https://drjoy-rep-test.firebaseio.com',
    projectId: 'drjoy-rep-test',
    storageBucket: 'drjoy-rep-test.appspot.com',
    messagingSenderId: '559479227908'
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
