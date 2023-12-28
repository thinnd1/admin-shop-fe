/**
 * RE0017 部署所属登録
 */
import {Component, OnInit, HostListener} from '@angular/core';
import {RegistrationService} from '../../../services/registration.service';
import {DepartmentSettings} from '../../../models/re/department-settings';
import {DepartmentSettingsSaveResult} from '../../../models/re/department-settings-save-result';
import {TranslateService} from '@ngx-translate/core';
import {Helper} from '../../../common/helper';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';

@Component({
  selector: 'app-node-edit-page',
  templateUrl: './node-edit-page.component.html',
  styleUrls: ['./node-edit-page.component.scss'],
  providers: [RegistrationService, DialogService]
})
export class NodeEditPageComponent implements OnInit {
  private max_length_department = 1000;
  public contentAlertBefore: string;
  public contentAlertAfter: string;
  public savedTxtAlert: string;
  public okTxtAlert: string;
  public cancelTxtAlert: string;

  public oDepartmentSettings = new Array();
  public listDepartment = new Array();
  public arrayErrorForm = new Array;
  public max_level_department = Helper.max_level_department;

  constructor(private registrationService: RegistrationService, private dialogService: DialogService,
              private translateService: TranslateService, private helper: Helper) {
    // get text translate common
    this.translateService.get('MSG').subscribe(res => {
      this.savedTxtAlert = res['SAVED'];
      this.cancelTxtAlert = res['NO'];
      this.okTxtAlert = res['YES'];
    });

    // get text translate DEPARTMENT_SETTING
    this.translateService.get('RE0017').subscribe(res => {
      this.contentAlertBefore = res['CONTENT_ALERT_BEFORE'];
      this.contentAlertAfter = res['CONTENT_ALERT_AFTER'];
    });
  }


  ngOnInit() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.registrationService.getDepartmentSettings().subscribe((departmentSettings: DepartmentSettings[]) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.listDepartment = this.helper.createArrayDepartment(this.listDepartment, departmentSettings, '', 1);
        this.arrayErrorForm = new Array(this.listDepartment.length);
      },
      error => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  addDepartmentChildren(index: number, event) {
    event.preventDefault();
    const newDepartment = {};
    if (this.listDepartment.length < Helper.max_department) {
      if (index !== -1) {
        const numberChildren = this.getCountsChildrenDepartment(index);
        newDepartment['id'] = '';
        newDepartment['name'] = '';
        newDepartment['displayName'] = '';
        newDepartment['level'] = this.listDepartment[index].level + 1;
        newDepartment['save'] = false;
        this.listDepartment.splice(index + numberChildren + 1, 0, newDepartment);
        this.arrayErrorForm.splice(index + numberChildren + 1, 0, '');
      } else {
        newDepartment['id'] = '';
        newDepartment['name'] = '';
        newDepartment['displayName'] = '';
        newDepartment['level'] = 1;
        newDepartment['save'] = false;
        this.listDepartment.push(newDepartment);
        this.arrayErrorForm.push('');
      }
    } else {
      // do nothing
    }
  }

  getCountsChildrenDepartment(index: number) {
    const listChildren = new Array();
    const levelParent = this.listDepartment[index].level;
    for (let i = index + 1; i < this.listDepartment.length; i++) {
      if (this.listDepartment[i].level > levelParent) {
        listChildren.push(i);
      } else {
        break;
      }
    }
    return listChildren.length;
  }

  deleteDepartment(index: number) {
    const nameDepartmentDelete = this.listDepartment[index].name;
    const numberChildren = this.getCountsChildrenDepartment(index);

    const html = this.contentAlertBefore + nameDepartmentDelete + this.contentAlertAfter;

    if (!this.listDepartment[index].save) {
      this.listDepartment.splice(index, numberChildren + 1);
      this.arrayErrorForm.splice(index, numberChildren + 1);
    } else {
      this.dialogService.showMessage('warning', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
        (res: DialogResult) => {
          if (res.isOk()) {
            // remove Department after action submit
            this.listDepartment.splice(index, numberChildren + 1);
            this.arrayErrorForm.splice(index, numberChildren + 1);
          }
        }
      );
    }
  }

  /**
   * putDepartmentSettings():Send Data to API url:"/api/dr/re/department_settings"
   * param: oDepartmentSettings
   */
  putDepartmentSettings() {
    if (this.validateForm()) {
      this.oDepartmentSettings.splice(0);
      this.convertDepartmentSettings(0, 0, '');
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      this.registrationService.putDepartmentSettings(this.oDepartmentSettings).subscribe(
        (res: DepartmentSettingsSaveResult[]) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showSuccess('MSG.SAVED').subscribe(
            (dialogResult: DialogResult) => {
              if (dialogResult.isOk()) {
                this.listDepartment = new Array();
                this.ngOnInit();
              }
            }
          );
        },
        error => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showError('MSG.ERROR');
        }
      );
    } else {
      this.helper.gotoError();
      // do nothing
    }
  }

  checkShowBntDeleteDepartment() {
    let count = 0;
    for (let i = 0; i < this.listDepartment.length; i++) {
      if (this.listDepartment[i].level === 1) {
        count ++;
        if (count > 1) {
          return true;
        }
      }
    }
    return false;
  }

  validateForm() {
    let checkForm = true;
    let regex;
    let number: number;
    let listDepartmentTmp = [];
    this.translateService.get('RE0017').subscribe(res => {
      for (let i = 0; i < this.listDepartment.length; i++) {
        if (!this.listDepartment[i].name) {
          this.arrayErrorForm[i] = res['VALIDATION_REQUIRED'];
          checkForm = false;
        } else {
          number = this.listDepartment[i].name.length;
          regex = new RegExp('^([ ]{' + number + '})$');
          if (regex.test(this.listDepartment[i].name)) {
            this.arrayErrorForm[i] = res['VALIDATION_REQUIRED'];
            checkForm = false;
          } else {
            this.arrayErrorForm[i] = '';
          }

          if(listDepartmentTmp.length > 0){
            if(listDepartmentTmp.filter(item => item.name === this.listDepartment[i].name && item.level === 1 && this.listDepartment[i].level === 1 ).length > 0){
              this.arrayErrorForm[i] = res['VALIDATION_DUPLICATE'];
              checkForm = false;
            }
          }
          listDepartmentTmp.push(this.listDepartment[i]);
        }
      }
    });

    return checkForm;
  }

  /**
   * return array DepartmentSettings
   * @param startIndex: start index of element in array listDepartment
   * @param levelParent
   * @param parent
   */
  convertDepartmentSettings(startIndex: number, levelParent: number, parent: any) {
    let rootDepartment;
    if (levelParent === 0) {
      for (let i = startIndex; i < this.listDepartment.length; i++) {
        if (this.listDepartment[i].level === 1) {
          const department = new DepartmentSettings();
          department.id = this.listDepartment[i].id;
          department.name = this.listDepartment[i].name;
          department.displayName = this.listDepartment[i].displayName;
          department.children = new Array();

          this.oDepartmentSettings.push(department);
          this.convertDepartmentSettings(i + 1, levelParent + 1, this.oDepartmentSettings[this.oDepartmentSettings.length - 1]);
        } else {
          // check root department
          if (this.listDepartment[i].level === 0) {
            rootDepartment = new DepartmentSettings();
            rootDepartment.id = this.listDepartment[i].id;
            rootDepartment.name = this.listDepartment[i].name;
            rootDepartment.displayName = this.listDepartment[i].displayName;
            rootDepartment.children = new Array();
          }
        }
      }
    } else {
      for (let i = startIndex; i < this.listDepartment.length; i++) {
        if (this.listDepartment[i].level === (levelParent + 1)) {
          const department = new DepartmentSettings();
          department.id = this.listDepartment[i].id;
          department.name = this.listDepartment[i].name;
          department.displayName = this.listDepartment[i].displayName;
          department.children = new Array();
          parent.children.push(department);
          this.convertDepartmentSettings(i + 1, levelParent + 1, parent.children[parent.children.length - 1]);
        } else {
          if (this.listDepartment[i].level === levelParent) {
            break;
          } else {
            // do nothing
          }
        }
      }
    }

    if (rootDepartment) {
      rootDepartment.children = this.oDepartmentSettings;
      this.oDepartmentSettings = [rootDepartment];
    }
  }

  checkMaxLength(field, i, event) {
    if (event.target.value.length > this.max_length_department) {
      this.listDepartment[i][field] = event.target.value.slice(0, this.max_length_department);
    }
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     this.putDepartmentSettings();
  //   }
  // }
}


