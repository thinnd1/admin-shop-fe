import { Subscription } from 'rxjs/Rx';
import {environment} from '../../../environments/environment';
import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {Product} from '../../common/profile';

@Component({
  selector: 'app-top-page',
  templateUrl: './top-page.component.html',
  styleUrls: ['./top-page.component.scss']
})
export class TopPageComponent implements OnInit, OnDestroy {

  public type: string;

  private _subscription: Subscription = null;

  constructor(private router: Router) {
    if (this.router && this.router.events) {
      this._subscription = this.router.events.subscribe(
        () => {
          this._decideType();
        }
      );
    }
  }

  ngOnInit() {
    this._decideType();
  }

  ngOnDestroy() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }

  private _decideType() {
    this.type = environment.app === Product.Drjoy ? 'drjoy' : 'prjoy';
  }

}
