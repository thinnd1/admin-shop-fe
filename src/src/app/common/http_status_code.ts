/**
 * Created by QuangHA on 8/15/2017.
 */
import {Injectable} from '@angular/core';

// TODO: Remove 'HTTP_'

@Injectable()
export class HttpStatusCode {
  public static HTTP_GET_SUCCESS = 200;
  public static HTTP_POST_SUCCESS = 200;
  public static HTTP_PUT_SUCCESS = 204;
  public static HTTP_DELETE_SUCCESS = 200;
  public static HTTP_ACCESS_DENIED = 403;
  public static HTTP_NOT_FOUND = 404; // TODO: NOT_FOUND


  public static UNAUTHORIZED = 401;
}
