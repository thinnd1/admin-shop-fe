import {Component, OnInit} from '@angular/core';
import {Product} from '../../common/profile';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';

@Component({
  selector: 'app-col-sub',
  templateUrl: './col-sub.component.html',
  styleUrls: ['./col-sub.component.scss']
})
export class ColSubComponent implements OnInit {

  public colSubType: any;

  constructor(private _router: Router) {
    // routing 変更時にcolSubTypeを決め直す
    this._router.events.subscribe(
      ev => {
        this._decideType();
      }
    );
  }

  ngOnInit() {
    this._decideType();
  }

  _decideType() {
    this.colSubType = environment.app === Product.Drjoy ? 'drjoy' : 'prjoy';
  }

}
