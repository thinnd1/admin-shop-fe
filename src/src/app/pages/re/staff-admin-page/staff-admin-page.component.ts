import {Component, OnInit, Output, OnDestroy, EventEmitter, Renderer2} from '@angular/core';
import {RegistrationService} from '../../../services/registration.service';
import {StaffAdminSettings} from '../../../models/re/staff-admin-settings';
import {DepartmentSettings} from '../../../models/re/department-settings';
import {Router} from '@angular/router';
import {HttpError} from '../../../common/error/http.error';
import {Helper} from '../../../common/helper';
import {Location} from '@angular/common';
import {SharedValueService} from '../../../services/shared-value.service';
import {DialogService} from '../../../services/dialog.service';
import {AccountStatus} from "../../../models/ba/user-session";


declare const $: any;

@Component({
    selector: 'app-staff-admin-page',
    templateUrl: './staff-admin-page.component.html',
    styleUrls: ['./staff-admin-page.component.scss']
})
export class StaffAdminPageComponent implements OnInit, OnDestroy {
    // Model Data
    public model = new StaffAdminSettings();
    public modelDepartment = new DepartmentSettings();
    // Data when Scroll
    public dataAll: any[];
    public dataScroll: any[];
    // Data for Department Select
    public departmentData: any;
    public selectedDepartment = '';
    // Constant
    public pageDefault = '0';
    public sortDefault = '-name';
    public isDesc = true;
    // Params
    public department = '';
    public name = '';
    public page = '0';
    public size = '20';
    public sortBy = 'lastName';
    public sortDirection = '-';
    public sort = this.sortDirection + this.sortBy;
    authority = {};
    userSession;
    //scroll
    public flagScroll: boolean;

    constructor(private router: Router,
                private registrationService: RegistrationService,
                private dialogService: DialogService,
                private renderer: Renderer2,
                private location: Location,
                private helper: Helper,
                private shareValue: SharedValueService) {
    }

    ngOnInit() {
        this.flagScroll = true;
        this.userSession = this.shareValue.getUserSession();
        (this.userSession.managementAuthority === 'MP_1') ? this.department = '' : (this.department = this.userSession.deptId);
        this.authority = {
            managementAuthority: this.userSession.managementAuthority,
            deptId: this.userSession.deptId,
            deptName: this.userSession.deptName,
            objAll: {
                displayName: 'すべて',
                id: this.department,
                level: 1,
                name: 'すべて',
                save: true,
                text: 'すべて',
            },
            obj: null
        };
        this.loadDataStaffAdmin();
    }

    onScrollDown() {
        if(this.flagScroll === true && this.dataAll){
            this.page = String(+this.page + 1);
            this.loadDataStaffAdmin();
            console.log('------------PAGE------------', this.page);
        }
    };

    displayTooltip(event) {
      $('[data-toggle="tooltip"]').tooltip({animation: false});
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
    orderBy(property) {
        this.flagScroll = true;
        this.page = this.pageDefault;
        this.isDesc = !this.isDesc;
        this.sortBy = property;
        this.sortDirection = this.isDesc ? '-' : '+';
        this.sort = this.sortDirection + this.sortBy;
        this.loadDataStaffAdmin();
    };


    // Detail Staff
    detailStaff(event: any, id: string) {
        if (event.target.parentElement.className === 'sort-arrow') {
          return false;
        }
        this.router.navigate(['re/staff-edit', id]);
    }

    // Load All Data
    loadDataStaffAdmin() {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(true);
        });
        this.registrationService.getStaffAdminSettings(this.department, this.name, this.sort, this.page, this.size)
            .subscribe((settings: StaffAdminSettings) => {
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

    convertLevelDepartment(departmentText: string, object: any) {
        let path, result;
        path = object.path;
        result = path.slice(1, -1).replace(/\//g, ' | ');
        if(result === ''){
            result = object.displayName;
        }
        return result;
    }

    ngOnDestroy() {
        // this.dataAll = [];
    }

}
