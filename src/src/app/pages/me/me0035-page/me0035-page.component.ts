import {Component, HostListener, OnInit} from '@angular/core';
import {MeetingService} from '../../../services/meeting.service';
import {TranslateService} from '@ngx-translate/core';
import {SharedValueService} from '../../../services/shared-value.service';
import {FormArray, FormGroup} from '@angular/forms';
import {Me0035PageValidator} from './me0035-page.validator';
import {Validator} from '../../../common/validation/validator';
import {UserSession} from '../../../models/ba/user-session';
import {ChargeDrug} from '../../../models/me/charge-drug';
import {DialogResult} from '../../../models/dialog-param';
import {Location} from '@angular/common';
import {DialogService} from '../../../services/dialog.service';
import {RegistrationService} from '../../../services/registration.service';
import {Helper} from '../../../common/helper';
import {MasterService} from '../../../services/master.service';
import {MedicalOffice} from '../../../models/ma/medical-office';

@Component({
  selector: 'app-me0035-page',
  templateUrl: './me0035-page.component.html',
  styleUrls: ['./me0035-page.component.scss'],
  providers: [Me0035PageValidator, Validator]
})
export class Me0035PageComponent implements OnInit {
  public indexTap: number;
  public flagChargeDrug = false;
  public modelInputDrug: FormGroup;
  public errorInputDrug = {
    isError: false,
    officeName: '',
    firstName: '',
    lastName: '',
    mailAddress: '',
    phoneNumber: '',
    drugs: [
      {'drugName': '', 'drugCode': ''}
    ]
  };
  infiniteScrollOptions: any = {
    page: 0,
    size: 20,
    placeHolder: 'ME0035.INPUT_NAME_PRODUCT',
    allowFreeText: true,
    multiple: false
  };
  keyword = '';

  public selectSearch = [
    {label: '全', value: '', isActive: true},
    {label: 'あ', value: ['あ', 'い', 'う', 'え', 'お'], isActive: false},
    {label: 'か', value: ['か', 'き', 'く', 'け', 'こ'], isActive: false},
    {label: 'さ', value: ['さ', 'し', 'す', 'せ', 'そ'], isActive: false},
    {label: 'た', value: ['た', 'ち', 'つ', 'て', 'と'], isActive: false},
    {label: 'な', value: ['な', 'に', 'ぬ', 'ね', 'の'], isActive: false},
    {label: 'は', value: ['は', 'ひ', 'ふ', 'へ', 'ほ'], isActive: false},
    {label: 'ま', value: ['ま', 'み', 'む', 'め', 'も'], isActive: false},
    {label: 'や', value: ['や', 'ゆ', 'よ'], isActive: false},
    {label: 'ら', value: ['ら', 'り', 'る', 'れ', 'ろ'], isActive: false},
    {label: 'わ', value: ['わ', 'ゐ', 'ゑ', 'を'], isActive: false},
    {label: '他', value: ['他'], isActive: false},
  ];
  public indexSelectSearch = 0;
  public valueSearchOther: any;
  public hospital: string;
  public listChargeDrug = new Array();
  public listAllChargeDrug = new Array();
  public userSession: UserSession;
  public me0035Msg: any;
  public listDrug: any = [];

  constructor(private meetingService: MeetingService, private dialogService: DialogService, private translate: TranslateService,
              private registrationService: RegistrationService, private helper: Helper, private masterService: MasterService,
              private sharedValueService: SharedValueService, private validation: Me0035PageValidator, private location: Location) {
    this.createFormInputDrug();
    this.userSession = this.sharedValueService.getUserSession();
    this.translate.get('ME0035.ME0035').subscribe(
      (res) => {
        this.me0035Msg = res;
      }
    );
  }

  createFormInputDrug() {
    this.modelInputDrug = this.validation.createFormInputDrug();
  }

  ngOnInit() {
    this.indexTap = 1;
    this.getListChargeDrug();
  }

  getListChargeDrug() {
    this.meetingService.getListChargeDrug().subscribe(
      (res) => {
        this.listAllChargeDrug = res.drugs;
        this.filterChargeDrugByFirstNameDrug();
      },
      (error) => {
        this.listAllChargeDrug = new Array;
        this.listChargeDrug = new Array();
      }
    );
  }

  searchChargeDrugOfOffice() {
    this.searchChargeDrug(0);
    this.getListChargeDrug();
  }

  changeTap() {
    this.indexTap = 2;
    this.modelInputDrug = this.validation.createFormInputDrug();
    this.modelInputDrug.get('officeName').setValue(this.userSession.officeName);
    this.modelInputDrug.get('lastName').setValue(this.userSession.lastName);
    this.modelInputDrug.get('firstName').setValue(this.userSession.firstName);
    this.errorInputDrug.drugs = [{'drugName': '', 'drugCode': ''}];
  }

  backMainScreenMe0035(isBack: boolean) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(false);
    });
    const html = '<span>' + this.me0035Msg.CHANGE_PAGE2 + '</span>';
    this.dialogService.showMessage('warning', false, 'ME0035.ME0035.CHANGE_PAGE1', null, html, 'MSG.OK', 'MSG.CANCEL').subscribe(
      (dialogResult: DialogResult) => {
        if (dialogResult.isOk()) {
          if (isBack) {
            this.indexTap = 1;
          } else {
            this.location.back();
          }

        }
      }
    );
  }

  changeChargeDrug() {
    for (let i = 0; i < this.listAllChargeDrug.length; i++) {
      this.listAllChargeDrug[i].mrInChargeFlag = this.flagChargeDrug;
    }
  }

  searchChargeDrug(index: number) {
    this.selectSearch[this.indexSelectSearch].isActive = false;
    this.selectSearch[index].isActive = true;
    this.indexSelectSearch = index;
    this.filterChargeDrugByFirstNameDrug();
  }

  filterChargeDrugByFirstNameDrug() {
    this.listChargeDrug = new Array();
    let value = this.selectSearch[this.indexSelectSearch].value;
    if (value) {
      for (let i = 0; i < this.listAllChargeDrug.length; i++) {
        const firstLetter = this.listAllChargeDrug[i].firstLetter;
        const index = value.indexOf(firstLetter);
        if (index >= 0) {
          this.listChargeDrug.push(this.listAllChargeDrug[i]);
        }
      }
    } else {
      this.listChargeDrug = this.listAllChargeDrug;
    }
  }

  get modelDrug() {
    return <FormArray>this.modelInputDrug.get('drugs');
  }

  putChargeDrugs() {
    const listDrug = new Array();
    for (let i = 0; i < this.listAllChargeDrug.length; i++) {
      const drug = {
        drugId: this.listAllChargeDrug[i].drugId,
        mrInChargeFlag: this.listAllChargeDrug[i].mrInChargeFlag,
        officeInChargeFlag: this.listAllChargeDrug[i].officeInChargeFlag,
      };
      listDrug.push(drug);
    }
    const data = new ChargeDrug(this.userSession.userId, this.userSession.officeId, this.hospital, listDrug);
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.putChargeDrugs(data).subscribe(
      (res) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showSuccess('MSG.MSG_SEND_MAIL.MSG_1');
      },
      (error) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  mobileChange(value: any) {
    const combinePhoneNo = this.helper.combinePhoneNumber('phone-first', 'phone-middle', 'phone-last');
    this.modelInputDrug.get('phoneNumber').setValue(combinePhoneNo);
  }

  addDrug(e) {
    e.preventDefault();
    const arrayStaff = <FormArray>this.modelInputDrug.get('drugs');
    const newStaff = this.validation.addDrug();
    arrayStaff.push(newStaff);
    this.errorInputDrug.drugs.push({'drugName': '', 'drugCode': ''});
  }

  checkValidateFormInputDrug() {
    this.removeEmptyDrug();
    this.errorInputDrug = this.validation.checkValidate(this.errorInputDrug, this.modelInputDrug);
    this.helper.gotoError();
    if (this.modelInputDrug.valid && !this.errorInputDrug.isError) {
      const data = this.modelInputDrug.value;
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      this.meetingService.addDrugsRequest(data).subscribe(
        (res) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          const html = '<span>' + this.me0035Msg.MSG1 + '</span>'
            + '<br><span>' + this.me0035Msg.MSG2 + '</span>';
          this.dialogService.showMessage('success', false, 'MSG.SENT', null, html, 'MSG.OK', null).subscribe(
            (dialogResult: DialogResult) => {
              if (dialogResult.isOk()) {
                this.indexTap = 1;
              }
            }
          );
        },
        (error) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showError('MSG.ERROR');
        }
      );
    }
  }

  removeEmptyDrug() {
    const listDrug = this.modelInputDrug.get('drugs').value;
    for (let index = 0; index < listDrug.length; index++) {
      if (listDrug[index].drugCode === listDrug[index].drugName && listDrug[index].drugCode === '' && listDrug.length > 1) {
        const drugsControl = <FormArray>this.modelInputDrug.get('drugs');
        drugsControl.removeAt(index);
        // this.errorInputDrug.drugs[index] = '';
      }
    }
  }

  reloadListDrug(keyword) {
    this.masterService.getListDrugWithPaging(keyword, this.infiniteScrollOptions.page, this.infiniteScrollOptions.size, '')
      .subscribe((settings: any) => {
          const loop = settings.drugs;
          for (let i = 0; i < loop.length; i++) {
            loop[i].name = loop[i].productName;
          }
          this.listDrug = this.infiniteScrollOptions.page === 0 ? loop : this.listDrug.concat(loop);
        },
        (error) => {
          this.listDrug = [];
        });
  }

  textChanged(keyword: any, obj) {
    // get and update text
    obj.get('drugName').setValue(keyword);
    // then reload search
    this.infiniteScrollOptions.page = 0;
    this.keyword = keyword;
    this.reloadListDrug(keyword);
  }

  scrollDown(page) {
    this.infiniteScrollOptions.page += 1;
    this.reloadListDrug(this.keyword);
  }

  changeDrug($event, obj) {
    if ($event) {
      obj.get('drugCode').setValue($event.drugCode || '');
      obj.get('drugName').setValue($event.name);
    }
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     if (this.indexTap === 2) {
  //       this.checkValidateFormInputDrug();
  //     }
  //   }
  // }
}
