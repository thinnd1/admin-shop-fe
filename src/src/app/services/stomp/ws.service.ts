import {Injectable} from '@angular/core';
import {StompConfig, StompRService} from '@stomp/ng2-stompjs';
import { Observable } from 'rxjs/Observable';
import {Message} from '@stomp/stompjs';
import {socketProvider} from './stomp.config';

import { Subscription } from 'rxjs/Subscription';
import {AuthenticationService} from '../authentication.service';
import {DialogService} from '../dialog.service';

/**
 * WsService.
 */
@Injectable()
export class WsService {

    // Stream of messages
    private subscription: Subscription;
    public messages: Observable<Message>;
    public errors: Observable<Message>;
    private errorSubscription: Subscription;

    // Subscription status
    public subscribed: boolean;

    // Array of historic message (bodies)
    public mq: Array<string> = [];

    // A count of messages received
    public count = 0;

    private _counter = 1;
    public isResponse: boolean;

    /** Constructor */
    constructor(
      private authService: AuthenticationService,
      private _stompService: StompRService,
      private dialogService: DialogService) {

    }

    public initConnection() {
      this._stompService.config = this.initStompConfig();
      this._stompService.initAndConnect();
      this.subscribe();
    }
    public subscribe() {
        if (this.subscribed) {
            return;
        }

        // Stream of messages
        // this.messages = this._stompService.subscribe('/user/exchange/amq.direct/messages');
        this.messages = this._stompService.subscribe('/user/queue/amq.direct/messages');

        // Stream of messages
        // this.errors = this._stompService.subscribe('/user/exchange/amq.direct/errors');
        this.errors = this._stompService.subscribe('/user/queue/amq.direct/errors');

        // Subscribe a function to be run on_next message
        this.subscription = this.messages.subscribe(this.on_next);
        this.errorSubscription = this.errors.subscribe(this.on_next_error);

        this.subscribed = true;
    }

    public unsubscribe() {
        if (!this.subscribed) {
            return;
        }

        // This will internally unsubscribe from Stomp Broker
        // There are two subscriptions - one created explicitly, the other created in the template by use of 'async'
        this.subscription.unsubscribe();
        this.subscription = null;
        this.errorSubscription.unsubscribe();
        this.errorSubscription = null;
        this.messages = null;
        this.errors = null;

        this.subscribed = false;
    }
    private initStompConfig() {
      const stompConfig: StompConfig = {
        // Which server?
        url: socketProvider,

        // Headers
        // Typical keys: login, passcode, host
        headers: {
          'Auth-Token': this.authService.getCurrentToken()
        },

        // How often to heartbeat?
        // Interval in milliseconds, set to 0 to disable
        heartbeat_in: 0, // Typical value 0 - disabled
        heartbeat_out: 20000, // Typical value 20000 - every 20 seconds

        // Wait in milliseconds before attempting auto reconnect
        // Set to 0 to disable
        // Typical value 5000 (5 seconds)
        reconnect_delay: 5000,

        // Will log diagnostics on console
        debug: true
      };
      return stompConfig;
    }

    /** Consume a message from the _stompService */
    public on_next = (message: Message) => {
      try {
        // Store message in "historic messages" queue
        this.mq.push(message.body + '\n');

        // Count it
        this.count++;
        // response
        this.isResponse = true;

      } catch (e) {
        // Handle it properly
        console.log('--------------------STOMP EXCEPTION-------------------');
        console.error(e);
      }
    }

  /** Consume a message from the _stompService */
  public on_next_error = (message: Message) => {
    try {
      // Store message in "historic messages" queue
      this.mq.push(message.body + '\n');

      // Count it
      this.count++;
      // response
      this.isResponse = true;

      // Log it to the console
      console.log(message);
    } catch (e) {
      // Handle it properly
      console.log('--------------------STOMP EXCEPTION-------------------');
      console.error(e);
    }
  }

  public isConnected() {
    return this._stompService.connected();
  }

  get isDialogVisible() {
    return (<any>$('#theModal')).is(':visible');
  }

  /**
     * publish a message
     * @param path
     * @param data
     */
    public onPublish(path, data) {
      if (navigator.onLine) {
        this.isResponse = false;
        const currentCount = this.count;
        this._stompService.publish('/app/' + path, JSON.stringify(data));
        setTimeout(() => {
          if (!this.isResponse && this.count === currentCount && !this.isDialogVisible) {
            this.dialogService.setLoaderVisible(false);
            setTimeout(() => {
              this.dialogService.showMessage('error',
                false,
                null,
                'エラーが発生しました。サーバーからの応答がありません。',
                null,
                'MSG.YES',
                null
              );
            });
          }
        }, 10000);
      } else {
        this.dialogService.setLoaderVisible(false);
        setTimeout(() => {
          this.dialogService.showMessage('error',
            false,
            null,
            'ブロック中のため、メッセージが送ることができません。\n' +
            'メッセージを送る場合はブロックを解除してください。',
            null,
            'MSG.YES',
            null
          );
        }, 100);
        this.onDisconnect();
        setTimeout(() => {
          if (!this.isConnected) {
            this.initConnection();
          }
        }, 500);
      }
    }

    public onDisconnect() {
      this._stompService.disconnect();
    }
}
