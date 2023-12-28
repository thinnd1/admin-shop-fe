import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Product } from '../../common/profile';
import { Title } from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-not-found-page',
  templateUrl: './not-found-page.component.html',
  styleUrls: ['./not-found-page.component.scss']
})
export class NotFoundPageComponent implements OnInit {
  public headerType: any;
  constructor(
    private router: Router,
    private titleService: Title,
    private translate: TranslateService
  ) {
    this.router.events.subscribe(
      ev => {
        this.headerType = environment.app === Product.Drjoy ? 'drjoy' : 'prjoy';
      }
    );
  }

  ngOnInit() {
    this.translate.get('PAGE_NOT_FOUND').subscribe((response) => {
      this.titleService.setTitle(response);
    }, (error) => {
      this.titleService.setTitle('404 Not Found');
    });
  }

}
