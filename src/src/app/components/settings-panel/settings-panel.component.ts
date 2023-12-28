import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {Product} from '../../common/profile';

declare const $: any;

@Component({
  selector: 'app-settings-panel',
  templateUrl: './settings-panel.component.html',
  styleUrls: ['./settings-panel.component.scss']
})
export class SettingsPanelComponent implements OnInit {

  public settingType: any;

  constructor(private _router: Router) {
    // routing 変更時にsettingTypeを決め直す
    this._router.events.subscribe(
      ev => {
        this._decideType();
      }
    );
  }

  ngOnInit() {
    this._decideType();
  }

  /**
   * ログイン状態とpr,drからヘッダータイプを決める
   */
  private _decideType() {
    this.settingType = environment.app === Product.Drjoy ? 'drjoy' : 'prjoy';
  }


}
