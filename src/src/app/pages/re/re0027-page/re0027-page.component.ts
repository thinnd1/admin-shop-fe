import {Component, OnInit, AfterViewInit, Renderer2, OnDestroy} from '@angular/core';
import { RegistrationService } from '../../../services/registration.service';
import { PrStaffListSettings } from '../../../models/re/pr-staff-list-settings';
import { TranslateService } from '@ngx-translate/core';
import { HttpError } from '../../../common/error/http.error';
import {Location} from '@angular/common';
import {DialogService} from '../../../services/dialog.service';

@Component({
  selector: 'app-re0027-page',
  templateUrl: './re0027-page.component.html',
  styleUrls: ['./re0027-page.component.scss']
})
export class Re0027PageComponent implements OnInit, OnDestroy {

  public modelDetail;

  // Constant
  public pageDefault = 0;
  public sortDefault = '-lastName';
  public isDesc = false;

  // Data when Scroll
  public dataAll: any;
  public dataScroll: any;

  // Params
  public department = '';
  public name = '';
  public page = 0;
  public size = 20;
  public sortBy = 'lastName';
  public sortDirection = '-';
  public sort = this.sortDirection + this.sortBy;

  constructor(
    private registrationService: RegistrationService,
    private translate: TranslateService,
    private dialogService: DialogService,
    private ds: DialogService
  ) {}

  ngOnInit() {
    this.orderBy(this.sortBy);
  }

  // Search by userName
  searchUser(inputName) {
    this.page = this.pageDefault;
    this.sort = this.sortDefault;
    inputName ? (this.name = inputName) : (this.name = '');
    this.loadDataPrStaffAdmin();
  };

  // Sort by Title
  orderBy(property) {
    this.page = this.pageDefault;
    this.isDesc = !this.isDesc;
    this.sortBy = property;
    this.sortDirection = this.isDesc ? '-' : '+';
    this.sort = this.sortDirection + this.sortBy;
    this.loadDataPrStaffAdmin();
  };

  // Scroll Paging
  scrollPaging() {
    if (this.dataScroll.length >= this.size) {
      this.page = this.page + 1;
      this.loadDataPrStaffAdmin();
    }
  }

  // View Pr-Staff List
  loadDataPrStaffAdmin() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.registrationService.getPrStaffListSettings(this.name, this.sort, this.page, this.size)
      .subscribe((settings: PrStaffListSettings) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dataScroll = settings.staffs;
        if (this.page === this.pageDefault) {
          this.dataAll =  this.dataScroll;
        } else {
          this.dataAll = this.dataAll.concat(this.dataScroll);
        }
      }, (error: HttpError) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      });
  }

  // View Detail Pr-Staff
  viewDetailPrStaff(id: string) {
    this.dataAll.forEach((item, index) => {
      if (item.userId === id) {
        this.ds.showStaffDetailsDialog(null, {data: item, officeUserId: 'pr'});
      }
    });
  }
  ngOnDestroy() {
    this.dataAll = [];
  }
}
