import {Injectable} from '@angular/core';
import {BackendService} from './backend.service';
import {RequestOptions, RequestOptionsArgs, XHRBackend} from '@angular/http';
import {AuthenticationService} from '../../../services/authentication.service';
import {LocalStorage} from '../../../services/local-storage.service';
import {JwtHelper} from 'angular2-jwt';

@Injectable()
export class BackendLocal extends BackendService {
  private localStorage = new LocalStorage();
  private jwtHelper = new JwtHelper();

  // Constructor
  // --------------------------------------------------------------------------
  constructor(backend: XHRBackend, options: RequestOptions, protected auth?: AuthenticationService) {
    super(backend, options);
    console.log('### Local');
  }

  // Overrided methods
  // --------------------------------------------------------------------------
  // protected makeRequestOptionArgs(options?: RequestOptionsArgs): RequestOptionsArgs {
  //   options =  super.makeRequestOptionArgs(options);
  //   options.headers.append('UserId', 'user0001');
  //   options.headers.append('OfficeId', '1000b841650c470ef4770001');
  //   options.headers.append('ManagementAuthority', 'MP_1');
  //   options.headers.append('FuncAuthoritySet', 'FPS_0');
  //   return options;
  // }
}
