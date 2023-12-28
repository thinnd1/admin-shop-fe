import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {SharedValueService} from '../../services/shared-value.service';
import {environment} from '../../../environments/environment';
import {Product} from '../../common/profile';
import {NavigationEnd, Router} from '@angular/router';

declare const $: any;

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent implements OnInit, OnChanges {
  public sideMenuType: any;
  userSession;

  @Input() sideMenuReload: boolean;
  @Output() reload: EventEmitter<string> = new EventEmitter<string>();
  constructor(
    private sharedValueService: SharedValueService,
    private router: Router
  ) {
    router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        $(function () {
          const $sideMenu = $('.side-menu'),
            $contentWrap = $('.content-wrap'),
            windowWidth = $(window).width() < 991;
          setTimeout( () => {
            if ($sideMenu.hasClass('side-menu-hide')) {
              if (windowWidth) {
                $contentWrap.css({
                  'height': 'auto',
                  'overflow-y': 'auto'
                });
                $('body').css('overflow-y', 'scroll');
              }
            }
          });
        });
      }
    });
  }

  ngOnInit() {
    this.userSession = this.sharedValueService.getUserSession();
    if (! this.userSession) {
      // todo エラー処理必要か
      return;
    }

    this.reload.emit('false');
    // 1:Drjoy, 2:Prjoy
    // this.sideMenuType = this.userSession.product;
    this.sideMenuType = environment.app === Product.Drjoy ? 1 : 2;


    $(function () {
      // Navbar left
      // -------------------------------------------------

      // Variables
      const $sideMenu = $('.side-menu'),
        $navbarBtnSideMenuToggle = $('.navbar-btn-side-menu-toggle'),
        $contentWrap = $('.content-wrap'),
        $infoPanel = $('.info-panel'),
        $navbarToggler = $('.navbar-toggler'),
        $navbarCollapse = $('.navbar-collapse'),
        $navLinkLabel = $('.nav-link-label'),
        contentWrapEffect = $contentWrap.data('effect'),
        windowHeight = $(window).height() - 50,
        windowWidth = $(window).width() < 991;

      // Functions
      function showOverflow() {
        if (windowWidth) {
          $contentWrap.css({
            'height': windowHeight,
            'overflow-y': 'hidden'
          });
          $('body').css('overflow-y', 'hidden');
        }
      }

      function hideOverflow() {
        if (windowWidth) {
          $contentWrap.css({
            'height': 'auto',
            'overflow-y': 'auto'
          });
          $('body').css('overflow-y', 'scroll');
        }
      }

      function sideMenuShow() {
        $sideMenu.addClass('side-menu-show').removeClass('side-menu-hide');
        $contentWrap.addClass(contentWrapEffect);
        showOverflow();
        $navbarBtnSideMenuToggle.find('i').removeClass('fa-toggle-off').addClass('fa-toggle-on');
      }

      function sideMenuHide() {
        $sideMenu.removeClass('side-menu-show').addClass('side-menu-hide');
        $contentWrap.removeClass(contentWrapEffect);
        hideOverflow();
        $navbarBtnSideMenuToggle.find('i').removeClass('fa-toggle-on').addClass('fa-toggle-off');
      }

      // Toggle the edge navbar left
      $sideMenu.addClass('side-menu-hide');
      $navbarBtnSideMenuToggle.click(function () {
        if ($sideMenu.hasClass('side-menu-hide')) {
          sideMenuShow();
        } else {
          sideMenuHide();
        }
        $infoPanel.collapse('hide');
        $navbarToggler.addClass('collapsed');
        $navbarCollapse.removeClass('show');
      });

      // Close left navbar when top navbar opens
      $navbarToggler.click(function () {
        if ($(this).hasClass('collapsed')) {
          sideMenuHide();
        }
        $('.info-panel').collapse('hide');
      });

      function isMobile() {
        try {
          document.createEvent('TouchEvent');
          return true;
        } catch (e) {
          return false;
        }
      }

      // Swipe the navbar
      if (isMobile() === true) {
        $(window).swipe({
          swipeRight: function () {
            sideMenuShow();
            $navbarCollapse.removeClass('show');
            $infoPanel.collapse('hide');
          }, swipeLeft: function () {
            sideMenuHide();
          }, threshold: 75
        });
      }

      // Collapse navbar on content click
      $contentWrap.click(function () {
        sideMenuHide();
      });

      // SideMenu font change
      $.fn.hasScrollBar = function () {
        return this.get(0) ? this.get(0).scrollHeight > this.innerHeight() : false;
      };
      $(window).on('load resize', function () {
        if ($sideMenu.hasScrollBar()) {
          $navLinkLabel.css('font-size', '.9375rem'); // 15px
        } else {
          $navLinkLabel.css('font-size', '');
        }
      });
      $('.nav-sub').on('shown.bs.collapse hidden.bs.collapse', function () {
        if ($sideMenu.hasScrollBar()) {
          $navLinkLabel.css('font-size', '.9375rem'); // 15px
        } else {
          $navLinkLabel.css('font-size', '');
        }
      });
    });
  }

  ngOnChanges() {
    if (this.sideMenuReload) {
      this.ngOnInit();
    }
  }

}
