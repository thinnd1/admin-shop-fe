
import {Injectable} from '@angular/core';
import {Response, ResponseOptions} from '@angular/http';
import {isArray} from 'rxjs/util/isArray';
import {isUndefined} from 'util';

@Injectable()
export class HttpError extends Response implements Error {

  // Instance variables
  // --------------------------------------------------------------------------
  name: string;
  message: string;
  error_codes: string[] = [];


  // Constructor
  // --------------------------------------------------------------------------
  constructor(options: ResponseOptions) {
    super(options);
    this.initialize(options.body);
  }


  // Methods
  // --------------------------------------------------------------------------
  contains(key: string): boolean {
    return !isUndefined(this.error_codes.find((code: string) => code === key));
  }

  private initialize(body: any) {
    console.log('### Response body: ', body);
    if (body == null) {
      return;
    }
    try {
      const json = body.json();
      if (json) {
        this.message = json.message;
        if (json.error_codes && isArray(json.error_codes) && 0 < json.error_codes.length) {
          this.error_codes = json.error_codes;
        }
      }
    } catch (ex) {
      // ignore
    }
  }
}
