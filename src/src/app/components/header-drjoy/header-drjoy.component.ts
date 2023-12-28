import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedValueService } from '../../services/shared-value.service';
import { AuthenticationService } from '../../services/authentication.service';
import { InformationService } from '../../services/information.service';

declare const $: any;

@Component({
  selector: 'app-header-drjoy',
  templateUrl: './header-drjoy.component.html',
  styleUrls: ['./header-drjoy.component.scss']
})
export class HeaderDrjoyComponent implements OnInit {

  // メニュー設定
  public categories;
  userSession;

  constructor(
    private router: Router,
    private sharedValueService: SharedValueService,
    private _authenticationService: AuthenticationService,
    private information: InformationService
  ) {
  }

  // お知らせバッジ更新
  // ======================================
  unseenCount(): string {
    const unseen = this.information.unseenCount();
    this.sharedValueService.informationBadge = unseen;
    return 0 < unseen ? 99 < unseen ? '<span class="d-inline-block">+</span>99' : unseen.toString(10) : '';
  }
  // ======================================

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();

    const $win = $(window),
      $body = $('body'),
      $contentWrap = $('.content-wrap'),
      $sideMenu = $('.side-menu'),
      $settingsPanel = $('.settings-panel'),
      $infoPanel = $('.info-panel'),
      $settingsPanelItemNavLink = $('.settings-panel-item .nav-link'),
      $infoPanelItemNavLink = $('.info-panel-item .nav-link'),
      $navContent = $('#nav-content'),
      $navbarNav = $navContent.children('.navbar-nav'),
      $navbarCollapse = $('.navbar-collapse'),
      $navbarBtnSideMenuToggle = $('.navbar-btn-side-menu-toggle'),
      $navbarBtnSideMenuToggleFa = $navbarBtnSideMenuToggle.find('.fa'),
      $navbarBtnInfoPanelToggle = $('.navbar-btn-info-panel-toggle'),
      hash = location.hash
    ;

    if (hash === '#setting') {
      $settingsPanelItemNavLink.click().css('color', 'rgba(255,255,255,.75)');
    }

    $navContent.on('shown.bs.collapse', function () {
      $navbarNav.css('max-height', $navbarNav.outerHeight() + 'px');
    });
    $win.on('resize', function () {
      if (!window.matchMedia('(max-width:991px)').matches) {
        $navContent.collapse('hide');
      }
      if (window.matchMedia('(max-width:767px)').matches) {
        if ($infoPanel.hasClass('show')) {
          $body.css('overflow-y', 'hidden');
        }
      }
      if (window.matchMedia('(min-width:768px)').matches) {
        $contentWrap.removeClass('pull');
      }
    });

    if (!($('.side-menu').length)) {
      $('.navbar-btn-side-menu-toggle').hide();
      $('.navbar-brand').css('left', '1rem');
    }

    $settingsPanel.on('show.bs.collapse', function () {
      $settingsPanelItemNavLink.css('color', 'rgba(255,255,255,.75)');
      $infoPanel.collapse('hide');
    }).on('hide.bs.collapse', function () {
      $settingsPanelItemNavLink.css('color', '').blur();
    });

    $infoPanel.on('show.bs.collapse', function () {
      $infoPanelItemNavLink.css('color', 'rgba(255,255,255,.75)');
      $settingsPanel.collapse('hide');
      $navbarBtnInfoPanelToggle.css('color', 'rgba(255,255,255,.75)');
      if ($sideMenu.hasClass('side-menu-show')) {
        $navbarCollapse.removeClass('show');
        $navbarBtnSideMenuToggleFa.removeClass('fa-toggle-on').addClass('fa-toggle-off');
      }
    }).on('shown.bs.collapse', function () {
      $('.navbar-collapse').collapse('hide');
    }).on('hide.bs.collapse', function () {
      $infoPanelItemNavLink.css('color', '').blur();
    }).on('hidden.bs.collapse', function () {
      $navbarBtnInfoPanelToggle.css('color', '');
    });
    this.sharedValueService.getSettingMenuDr().subscribe((categories: any) => {
      this.categories = categories;
    });
  }

  logout() {
    // this._authenticationService.clearToken(); call in logout-page
    this.router.navigate(['/logout', {replaceUrl: true}]);
    // 現在、select2 のデストラクタエラーが出た場合は、ログアウトページに遷移できない
  }
}
