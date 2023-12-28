import * as SockJS from 'sockjs-client';
import {environment} from '../../../environments/environment';

export function socketProvider() {
    return new SockJS(environment.socket);
}

