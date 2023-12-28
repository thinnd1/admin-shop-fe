import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AppModule } from './app/app.module';
import { Product } from './app/common/profile';

declare const $: any;
declare const $zopim: any;

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);

const productType = environment.app === Product.Drjoy ? 'drjoy' : 'prjoy';

// Set Favicon
window.document.getElementById('favicon').setAttribute('href', '/assets/img/favicon-' + productType + '.ico');

// Set Mask-icon
const maskIconColor = (productType === 'drjoy') ? '#F18D00' : '#3FA9F5';
const maskIcon = window.document.getElementById('mask-icon');
maskIcon.setAttribute('href', '/assets/img/mask-icon-' + productType + '.svg');
maskIcon.setAttribute('color', maskIconColor);

// Set Apple-touch-icon
window.document.getElementById('apple-touch-icon').setAttribute('href', '/assets/img/apple-touch-icon-precomposed-' + productType + '.png');

// zendesk Chat
const zendesk = document.createElement('script');
zendesk.setAttribute('src', '//v2.zopim.com/?4MdwY6BqkFw8wnWORHiGR9K8cmH3bAmc');
zendesk.setAttribute('type', 'text/javascript');
zendesk.setAttribute('charset', 'utf-8');
zendesk.setAttribute('async', 'async');
document.getElementsByTagName('head')[0].appendChild(zendesk);

// Reponsive Bootstrap Tabs
$(document).on('show.bs.tab', '.nav-tabs-responsive [data-toggle="tab"]', function(e){
  const $target = $(e.target);
  const $tabs = $target.closest('.nav-tabs-responsive');
  let $current = $target.closest('li');
  const $parent = $current.closest('li.dropdown');
  $current = $parent.length > 0 ? $parent : $current;
  const $next = $current.next();
  const $prev = $current.prev();
  const updateDropdownMenu = function($el, position){
    $el
      .find('.dropdown-menu')
      .removeClass('pull-left pull-center pull-right')
      .addClass('pull-' + position);
  };
  $tabs.find('>li').removeClass('active next prev');
  $prev.addClass('prev');
  $next.addClass('next');
  updateDropdownMenu($prev, 'left');
  updateDropdownMenu($current, 'center');
  updateDropdownMenu($next, 'right');
}).on('shown.bs.tab', '.nav-tabs-responsive [data-toggle="tab"]', function(e){
  const $target = $(e.target);
  const $current = $target.closest('li');
  $current.addClass('active');
});
