import { Component, forwardRef, Injector, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { RegistrationService } from '../../services/registration.service';
import { DepartmentSettings } from '../../models/re/department-settings';
import { Helper } from '../../common/helper';
import {DialogService} from '../../services/dialog.service';

/**
 * 所属選択
 */
@Component({
  selector: 'app-department-select',
  templateUrl: './department-select.component.html',
  styleUrls: ['./department-select.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DepartmentSelectComponent), multi: true }
  ]
})
export class DepartmentSelectComponent implements OnInit, ControlValueAccessor {
  @Input() index: number;
  @Input() authority: any;
  @Input() limitNumChars = 12;
  @Output() departmentSelect: EventEmitter<any> = new EventEmitter<any>();
  @Input() departmentList: any[];
  getResult = [];
  childrenList = [];
  public innerValue: any = '';
  public departmentSettings: any;

  // private ngControl: NgControl;
  private onChangeCallback = (_: any) => { };
  private onTouchedCallback = (_: any) => { };

  constructor(private injector: Injector, private dialogService: DialogService, private registrationService: RegistrationService,
    private helper: Helper) { }

  ngOnInit() {
    if (!this.departmentList) {
      this.registrationService.getDepartmentSettings().subscribe((departmentSettings: DepartmentSettings[]) => {
        this.departmentSettings = departmentSettings;
        if (this.authority) {
          this.getResult = departmentSettings;
          this.departmentList = this.helper.createArrayDepartmentAuthority(new Array(), departmentSettings, '', 1, this.authority.managementAuthority,
            this.authority.deptId, this.authority.objAll, this.authority.obj, this.authority.deptName);
        }
      });
    }
  }

  loadDepartment(managementAuthority, deptId, objAll, obj, deptName) {
    this.dialogService.setLoaderVisible(false);
    this.departmentList = this.helper.createArrayDepartmentAuthority(new Array(), this.departmentSettings, '', 1, managementAuthority,
        deptId, objAll, obj, deptName);
  }

  get value(): any {
    return this.innerValue;
  }
  @Input('value')
  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v ? v : '';
      this.onChangeCallback(v);
    }
  }

  writeValue(value: any): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // throw new Error('Method not implemented.');
  }

  changeDepartmentSelect(value, index) {
    const department = this.departmentList.filter((item => item.id === value));
    if (department.length > 0) {
      const parent = [];
      this.helper.findDepartment(parent, this.getResult, value);
      this.childrenList = [];
      if ((department.length > 0) && department[0].path !== '/') {
        // if department is not 所属未分類 department then get children list
        this.getAllChildernId(parent, this.childrenList);
      }
      const dep = {
        'id': (department.length > 0) ? department[0].id : '',
        'name': (department.length > 0) ? department[0].name : '',
        'displayName': (department.length > 0) ? department[0].displayName : '',
        'children': this.childrenList
      };
      this.departmentSelect.emit({'departmentId': value, 'index': index, 'department': dep});
    }
  }

  getAllChildernId(children, list) {
    if (children && children.length > 0) {
      for (let i = 0; i < children.length; i++) {
        list.push(children[i].id);
        this.getAllChildernId(children[i].children, list);
      }
    }
  }
}
