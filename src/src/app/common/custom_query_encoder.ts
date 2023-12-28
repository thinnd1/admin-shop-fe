import {URLSearchParams, QueryEncoder} from '@angular/http';

export class CustomQueryEncoder extends QueryEncoder {
  encodeKey(k: string): string {
    return k;
  }

  encodeValue(v: string): string {
    return this.standardEncoding(v);
  }

  standardEncoding(v: string): string {
    return encodeURIComponent(v);
      // .replace(/%2F/gi, '/');
  }

}
