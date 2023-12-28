import { Component, OnInit, AfterViewInit, Renderer2, ViewChild } from '@angular/core';
import { RegistrationService } from '../../../services/registration.service';
import { PrGrantAuthSettings } from '../../../models/re/pr-grant-auth-settings';
import { Router } from '@angular/router';
import { PrGrantAuthSendApiSettings } from '../../../models/re/pr-grant-auth-send-api-settings';
import { SharedValueService } from '../../../services/shared-value.service';
import { Location } from '@angular/common';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';
import {AccountStatus} from '../../../models/ba/user-session';
import { Helper } from '../../../common/helper';
import {DepartmentSelectComponent} from '../../../components/department-select/department-select.component';
declare const $: any;
@Component({
  selector: 'app-re0030-page',
  templateUrl: './re0030-page.component.html',
  styleUrls: ['./re0030-page.component.scss']
})
export class Re0030PageComponent implements OnInit, AfterViewInit {
  @ViewChild('department')
  protected DepartmentSelectComponent: DepartmentSelectComponent;
  public model = new PrGrantAuthSettings();
  // Data when Scroll
  public dataAll: any;
  public dataScroll: any;
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
  modelDetail: any;
  listAuthority = [];
  listAuthoritya = [];
  // fake Login Authority
  flagAuthority = 'MP_1';
  userSession: any;
  authority: any;
  disable = false;
  //scroll
  public flagScroll: boolean;

  constructor(
    private registrationService: RegistrationService,
    private dialogService: DialogService,
    private render: Renderer2,
    private router: Router,
    private helper: Helper,
    private sharedValueService: SharedValueService,
    private location: Location,
  ) {
  }

  ngOnInit() {
    this.flagScroll = true;
    this.userSession = this.sharedValueService.getUserSession();
    this.userSession.managementAuthority === 'MP_1' ? (this.department = '') : (this.department = this.userSession.deptId);
    this.loadPrGrantAuthSettings();
    this.sharedValueService.fetchUserSession();
    this.flagAuthority = this.userSession.managementAuthority;
    this.authority = {
      managementAuthority: this.userSession.managementAuthority,
      deptId: this.userSession.deptId,
      deptName: this.userSession.deptName,
      objAll: {
        displayName: 'すべて',
        id: this.department,
        level: 1,
        name: '',
        save: true,
        text: 'すべて',
      },
      obj: null
    };
  }

  ngAfterViewInit() {
    $('[data-toggle="tooltip"]').tooltip({animation: false});
    $('[data-toggle="popover"]').popover();
  }

  loadPrGrantAuthSettings() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });

    this.registrationService.getPrGrantAuthSettings(this.department, this.name, this.group, this.sort, this.page, this.size).subscribe((
      settings: PrGrantAuthSettings) => {
      this.model = settings;
      for(let i= 0; i< this.model.user.length; i++) {
        this.model.user[i].accountStatus = new AccountStatus(this.model.user[i].accountStatus);
      }
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dataScroll = this.model.user;

      if(this.dataScroll.length < parseInt(this.size)){
        this.flagScroll = false;
      }
      if (this.page === this.pageDefault) {
        this.dataAll = this.model.user;
      } else {
        this.dataAll = this.dataAll.concat(this.dataScroll);
      }

      if (this.flagAuthority === 'MP_1') {
        this.listAuthority = ['MP_1', 'MP_2', 'MP_3'];
      } else if (this.flagAuthority === 'MP_2') {
        this.dataAll.filter(item => {
          if (item.managementAuthority === 'MP_1') {
            this.disable = true;
            this.listAuthoritya = ['MP_1'];
          } else if (item.managementAuthority !== 'MP_1') {
            this.listAuthority = ['MP_2', 'MP_3'];
            this.disable = true;
          }
        });
      }

    }, error => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  displayTooltip(event) {
    $('[data-toggle="tooltip"]').tooltip({animation: false});
  }

  searchDepartment(event) {
    this.flagScroll = true;
    this.page = this.pageDefault;
    this.sort = this.sortDefault;
    this.department = event.departmentId;
    this.loadPrGrantAuthSettings();
  }

  detailStaff(id: string) {
    this.router.navigate(['/re/re0031', id]);
  }

  showTextDepartment(index) {
    return this.convertLevelDepartment('', this.dataAll[index].department);
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

  showInformation() {
    // this.dialogService.showSuccess('To do...');
  }

  gotoHelp1() {
    this.router.navigateByUrl('/he/he0001');
  }

  gotoHelp2() {
    this.router.navigateByUrl('/he/he0002');
  }

  searchUser(inputName: string) {
    this.flagScroll = true;
    this.page = this.pageDefault;
    this.sort = this.sortDefault;
    inputName ? (this.name = inputName) : (this.name = '');
    this.loadPrGrantAuthSettings();
  }

  // Sort by Title
  orderBy(property) {
    this.flagScroll = true;
    this.page = this.pageDefault;
    this.isDesc = !this.isDesc;
    this.sortBy = property;
    this.sortDirection = this.isDesc ? '-' : '+';
    this.sort = this.sortDirection + this.sortBy;
    this.loadPrGrantAuthSettings();
  }

  // Scroll Paging
  scrollPaging() {
    if(this.dataAll && this.flagScroll === true){
      this.page = String(+this.page + 1);
      this.loadPrGrantAuthSettings();
    }
  }

  putPrGrantAuthSettings(managementAuthority, staff, index) {
    const loginId = staff.loginId;
    // Edit user-edit with API
    const modelsendAPI = new PrGrantAuthSendApiSettings(managementAuthority, loginId);
    this.dialogService.showMessage('warning', false, null, 'RE0030.CHANGE_PERMISSIONS', null, 'MSG.YES', 'MSG.NO').subscribe(
      (res: DialogResult) => {
        setTimeout(() => {
          if (res.isOk()) {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(true);
            });
            this.registrationService.putPrGrantAuthSettings(modelsendAPI).subscribe(
              (respone: any) => {
                setTimeout(() => {
                  this.dialogService.setLoaderVisible(false);
                });
                this.dialogService.showSuccess('MSG.SAVED').subscribe(
                    (dialog: DialogResult) => {
                      if (dialog.isOk()) {
                        if(managementAuthority === 'MP_3' && this.userSession.userId === staff.userId){
                          this.router.navigate(['']);
                        }
                        if(this.userSession.userId === staff.userId && managementAuthority !== 'MP_3'){
                          this.page = this.pageDefault;
                          this.ngOnInit();
                          this.DepartmentSelectComponent.loadDepartment(this.authority.managementAuthority,
                              this.authority.deptId, this.authority.objAll, this.authority.obj, this.authority.deptName);
                        }else{
                          staff.managementAuthority = managementAuthority;
                        }
                      }
                    }
                );
              },
              error => {
                this.dialogService.showError('RE0030.ERROR_ADMIN');
                setTimeout(() => {
                  this.dialogService.setLoaderVisible(false);
                });
                $('.authority' + '_' + index).val(staff.managementAuthority);

              }
            );
          } else if (res.isCancel()) {
            $('.authority' + '_' + index).val(staff.managementAuthority);
          }
        }, 500);
      }
    );
  }
}
