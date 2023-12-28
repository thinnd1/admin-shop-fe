import {Injectable} from '@angular/core';
import {RequestOptions, XHRBackend} from '@angular/http';
import {AuthenticationService} from '../../../services/authentication.service';
import {BackendService} from './backend.service';

@Injectable()
export class BackendDemo extends BackendService {

  // Constructor
  // --------------------------------------------------------------------------
  constructor(backend: XHRBackend, options: RequestOptions, protected auth?: AuthenticationService) {
    super(backend, options);
    console.log('### Demo');
  }
}
