import { SharedValueService } from '../../../services/shared-value.service';
import {Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import { RegistrationService } from '../../../services/registration.service';
import {DetailUser, StaffListSettings} from '../../../models/re/staff-list-settings';
import { DepartmentSettings } from '../../../models/re/department-settings';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Helper } from '../../../common/helper';
import { HttpError } from '../../../common/error/http.error';
import {Location} from '@angular/common';
import {DialogService} from '../../../services/dialog.service';
import {AccountStatus} from '../../../models/ba/user-session';
//
declare const $: any;

@Component({
  selector: 'app-staff-list-page',
  templateUrl: './staff-list-page.component.html',
  styleUrls: ['./staff-list-page.component.scss']
})
export class StaffListPageComponent implements OnInit, OnDestroy {

  public model = new StaffListSettings();
  public modelDepartment = new DepartmentSettings();
  // Data when Scroll
  public dataAll: any[];
  public dataScroll: any[];
  // Data for Department Select
  public departmentData: any;
  public selectedDepartment = '';
  // Constant
  public pageDefault = '0';
  public sortDefault = '-lastName';
  public isDesc = true;
  // Params
  public department = '';
  public name = '';
  public page = '0';
  public size = '20';
  public sortBy = 'lastName';
  public sortDirection = '-';
  public sort = this.sortDirection + this.sortBy;
  public group = '0';
  // Detail PR
  public modelDetail;
  officeName: string;
  authority = {};
  userSession;
  //scroll
  public flagScroll: boolean;

  constructor(
    private router: Router,
    private registrationService: RegistrationService,
    private translate: TranslateService,
    private dialogService: DialogService,
    private renderer: Renderer2,
    private helper: Helper,
    private location: Location,
    private shareValue: SharedValueService
  ) { }

  ngOnInit() {
    this.flagScroll = true;
    this.userSession = this.shareValue.getUserSession();
    this.officeName = this.userSession.officeName;
    this.authority = {
      managementAuthority: 'MP_1',
      deptId: '',
      objAll: {
        displayName: 'すべて',
        id: '',
        level: 1,
        name: 'すべて',
        save: true,
        text: 'すべて',
      },
      obj: null
    };
    this.loadDataStaffAdmin();
  }

  // Search by Department
  searchDepartment(department) {
    this.flagScroll = true;
    this.page = this.pageDefault;
    this.sort = this.sortDefault;
    this.department = department.departmentId;
    this.loadDataStaffAdmin();
  }

  showTextDepartment(index) {
    return this.convertLevelDepartment('', this.dataAll[index].department);
  }

  // Search by Name
  searchUser(inputName) {
    this.flagScroll = true;
    this.page = this.pageDefault;
    this.sort = this.sortDefault;
    inputName ? (this.name = inputName) : (this.name = '');
    this.loadDataStaffAdmin();
  };

  // Sort by Title
  orderBy(property: string) {
    this.flagScroll = true;
    this.page = this.pageDefault;
    this.isDesc = !this.isDesc;
    this.sortBy = property;
    this.sortDirection = this.isDesc ? '-' : '+';
    this.sort = this.sortDirection + this.sortBy;
    this.loadDataStaffAdmin();
  };

  // Scroll Paging
  onScrollDown() {
    if(this.dataAll && this.flagScroll === true){
      this.page = String(+this.page + 1);
      this.loadDataStaffAdmin();
    }
  };
  displayTooltip(event) {
    $('[data-toggle="tooltip"]').tooltip({animation: false});
  }

  // Load All Data
  loadDataStaffAdmin() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.registrationService.getStaffListSettings(this.department, this.name, this.group, this.sort, this.page, this.size)
      .subscribe((settings: StaffListSettings) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.model = settings;
        for (let i = 0; i < this.model.user.length; i++) {
          this.model.user[i].accountStatus = new AccountStatus(this.model.user[i].accountStatus);
        }
        this.dataScroll = this.model.user;

        if(this.dataScroll.length < parseInt(this.size)){
          this.flagScroll = false;
        }

        if (this.page === this.pageDefault) {
          this.dataAll = this.model.user;
        } else {
          this.dataAll = this.dataAll.concat(this.dataScroll);
        }
      }, (error: HttpError) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
      });
  }

  // Detail Pr-Staff
  loadDataStaffDetail(event: any, id: string) {
    if (event.target.parentElement.className === 'sort-arrow') {
      return false;
    }
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.registrationService.getStaffListDetail(id).subscribe((settings: DetailUser) => {
		this.modelDetail = settings;
		if(this.userSession.userId === id ){
          this.modelDetail.mailAddressPublishingType = 0;
          this.modelDetail.mobileNoPublishingType = 0;
        }
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showStaffDetailsDialog(null, {data: this.modelDetail, officeUserId: 'dr'});
    }, error => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
    });
  }

  showTextDepartmentDetail() {
    return this.helper.convertLevelDepartment('', this.modelDetail.department);
  }

  convertLevelDepartment(departmentText: string, object: any) {
    let path, result;
    path = object.path;
    result = path.slice(1, -1).replace(/\//g, ' | ');
    if(result === ''){
      result = object.displayName;
    }
    return result;
  }

  convertGraduationDate(date) {
    const d = new Date();
    const n = d.getFullYear();
    return n - date.slice(0, 4);
  }

  ngOnDestroy() {
    this.dataAll = [];
  }
}
