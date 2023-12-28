import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../../../services/search.service';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '../../../services/dialog.service';
import { DateConverter } from '../../../common/converter/date.converter';
import { Title } from '@angular/platform-browser';
import { RegistrationService } from '../../../services/registration.service';
import { DetailUser } from '../../../models/re/staff-list-settings';
import { SharedValueService } from '../../../services/shared-value.service';
import { UserSession } from '../../../models/ba/user-session';

@Component({
  selector: 'app-cm0013-page',
  templateUrl: './cm0013-page.component.html',
  styleUrls: ['./cm0013-page.component.scss']
})
export class Cm0013PageComponent implements OnInit {
  @ViewChild('ulData') ulData: ElementRef;
  public keyword: string;
  public searchKeyword: string;
  public userInfo: DetailUser;
  userSession: UserSession;

  searchResult: string;
  public searchResultData: any;
  public searchTarget: string;
  public resultCounts: number[] = [];
  public page: number;
  public maxPage: number;
  public isLoading = true;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private dateConverter: DateConverter,
              private translate: TranslateService,
              private dialogService: DialogService,
              private titleService: Title,
              private registrationService: RegistrationService,
              private searchService: SearchService,
              private sharedValueService: SharedValueService,
  ) {
    this.userSession = this.sharedValueService.getUserSession();
  }

  ngOnInit() {
    const title = this.titleService.getTitle();
    this.route.queryParams.subscribe(params => {
      this.keyword = params['keyword'] || '';

      this.gotoPageTop();
      if (this.keyword) {
        setTimeout(() => {
            this.titleService.setTitle(title + ':' + this.keyword);
        });
      }

      this.searchTarget = 'ALL';
      this.setSearchResult();
    });
  }

  setSearchResult($event?: any) {
    const self = this;
    this.searchKeyword = this.keyword;

    if (!this.searchKeyword) {
      this.searchResultData = [];
      this.searchResultData.results = [];
      return false;
    }

    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.searchService.searchKeyword(this.keyword, this.searchTarget, this.page).subscribe((result) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      console.log('***searchResult***', result);

      result['results'].forEach((item: any) => {
        item.title = item.title.replace(/(^\/+|\/+$)/g, '');
        this.registrationService.getStaffListDetail(item.userId).subscribe((settings: DetailUser) => {
          item.mobileNo = settings.mobileNo;
          item.phsNo = settings.phsNo;
        });
      });

      if (this.page === 1) {
        this.resultCounts = result['resultCounts'];
        this.searchResultData = result;
      }else if (this.page > 1) {
        setTimeout(() => {
          result['results'].forEach((item: any) => {
            this.searchResultData['results'].push(item);
          });
        });
      }

      const matchedTarget = this.searchResultData.resultCounts.filter(function(obj) {
        return obj.searchTarget.includes(self.searchTarget);
      });

      if (matchedTarget.length) {
        const count = matchedTarget[0].count;
        this.maxPage = Math.ceil(count / this.searchResultData.resultsPerPage);
        if (this.maxPage > this.page) {
          if (this.getUlElementBottom() < (<any>window).innerHeight) {
            setTimeout(() => {
              this.page = ++this.searchResultData.page;
            });
          }
        }
      }
    }, (error) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  onScroll($event) {
    if (this.getUlElementBottom() <= $event.currentScrollPosition) {
      if (this.maxPage > this.page) {
        setTimeout(() => {
          this.page++;
          this.setSearchResult($event);
        });
      }
    }
  }

  getUlElementBottom(): number {
    if (!this.ulData) {
      return 0;
    }
    const rect = this.ulData.nativeElement.getBoundingClientRect();
    const bottom = rect.bottom + <any>window.pageYOffset;
    return bottom;
  }

  searchAll() {
    this.router.navigate(['cm/cm0013'], {queryParams: {keyword: this.searchKeyword}});
  }

  dataConvert(date: string) {
    return this.dateConverter.moment(date, 'LL');
  }

  clickSearchResultsCategory($event: any, category: string) {
    this.searchTarget = category;
    this.gotoPageTop();
    this.setSearchResult();
  }

  clickSearchResultsList(item: any) {
    console.log(item);

    // グループボード
    if (item.indexType === 'group_message') {
      const path = (item.contentsType === 'ARTICLE') ? `gr/detail/${item.contentsId}/${item.contentsSubId}` : `gr/detail/${item.contentsId}/${item.contentsParentId}/${item.contentsSubId}`;
      this.router.navigate([path]);
    // チャット
    } else if (item.indexType === 'chat_message') {
      const path = (!item.contentsSubId) ? `ch/ch0007/${item.contentsId}` : `ch/ch0007/${item.contentsId}/${item.contentsSubId}`;
      this.router.navigate([path]);
    // プロフィール
    } else if (item.indexType === 'user_profile') {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      this.registrationService.getStaffListDetail(item.userId).subscribe((settings: DetailUser) => {
        this.userInfo = settings;
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        const isSelf = (this.userSession.officeUserId === item.officeUserId);
        this.dialogService.showStaffDetailsDialog(isSelf, {data: this.userInfo, officeUserId: 'dr'});
      }, error => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
      });
    }
  }

  getCategoryName(category: string): string {
    let categoryName = '';
    this.translate.get('CM0013.CATEGORY.' + category).subscribe((response) => {
      categoryName = response;
    });
    return categoryName;
  }

  getTitle(target: string, title: string): string {
    const type = target === 'group_message' ? 'CM0013.GROUP' : 'CM0013.MESSAGE';
    return '[' + this.translate.instant(type) + ' : ' + title + ']';
  }

  gotoPageTop() {
    this.page = 1;
    setTimeout(() => {
      (<any>window).scrollTo(0, 0);
    });
  }
}
