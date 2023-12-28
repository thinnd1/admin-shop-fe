import { Component, OnInit } from '@angular/core';
import {SharedValueService} from '../../services/shared-value.service';
import {ActivatedRoute, Router} from '@angular/router';

declare const $: any;

@Component({
  selector: 'app-settings-panel-pr',
  templateUrl: './settings-panel-pr.component.html',
  styleUrls: ['./settings-panel-pr.component.scss']
})
export class SettingsPanelPrComponent implements OnInit {

  // メニュー設定
  public categories;

  constructor(
    private sharedValue: SharedValueService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    const $settingsPanel = $('.settings-panel'),
      $contentWrap = $('.content-wrap');

    $contentWrap.click(function () {
      $settingsPanel.collapse('hide');
    });

    this.sharedValue.getSettingMenuPr().subscribe((categories: any) => {
      this.categories = categories;
    });
  }

  // routerLinkActiveをhashに対応
  public isLinkActive(url: string): boolean {
    const fragment = (this.activatedRoute.snapshot.fragment) ? '#' + this.activatedRoute.snapshot.fragment : '';
    const current = '/' + this.activatedRoute.snapshot.url.join('/') + fragment;
    return (current === url);
  }
}
