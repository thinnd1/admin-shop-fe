import {Injectable} from '@angular/core';
import {RequestOptions, XHRBackend} from '@angular/http';
import {BackendService} from './backend.service';
import {AuthenticationService} from '../../../services/authentication.service';

@Injectable()
export class BackendStaging extends BackendService {

  // Constructor
  // --------------------------------------------------------------------------
  constructor(backend: XHRBackend, options: RequestOptions, protected auth?: AuthenticationService) {
    super(backend, options);
    console.log('### Staging');
  }
}
