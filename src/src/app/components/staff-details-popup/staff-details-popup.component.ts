import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {DialogAdapter, DialogParams} from '../../models/dialog-param';
import { SharedValueService } from '../../services/shared-value.service';
import {RegistrationService} from '../../services/registration.service';
import {HttpError} from '../../common/error/http.error';
import {Helper} from '../../common/helper';
declare var moment: any;

@Component({
  selector: 'app-staff-details-popup',
  templateUrl: './staff-details-popup.component.html',
  styleUrls: ['./staff-details-popup.component.scss']
})
export class StaffDetailsPopupComponent implements DialogAdapter {
  public params: DialogParams;
  public prop: any;
  public dataItems: any[];
  public dataIn;
  public year: number;

  public profileOptionsIsContentRightContent: string;
  public profileOptionsIsContentRightClass: string;

  public mockDataIn: any = {

    'firstName': '真由子',
    'lastName': '佐々木',
    'firstNameKana': 'まゆこ',
    'lastNameKana': 'ささき',
    'officeName': '横浜内科総合病院',
    'managementAuthority': 'MP_1',

    'email_address': 'sample@sample.com',
    'phone_number' : '000-0000-0000',
    'phs': '000-0000-0000',
    'gender': '1',
    'job': 'J0001',
    'year_grade': '17',
    'department': ['リハビリテーション科', 'リハビリテーション科', 'リハビリテーション科'],
    'specialized_department': [
      {'department': '内科', 'section': '一般内科'},
      {'department': '内科', 'section': '一般内科'},
      {'department': '内科', 'section': '一般内科'},
      {'department': '内科', 'section': '一般内科'}
    ],
    'position': 'この文章はダミー',
    'brief_history' : 'この文章はダミー',
    'qualification': 'この文章はダミー',
    'place_born_in': 'この文章はダミー',
    'hobby': 'この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです。文字の大きさ、',
  };

  public mockDataOut: any = {

    'firstName': '修三',
    'lastName': '松本',
    'firstNameKana': 'しゅうぞう',
    'lastNameKana': 'まつもと',
    'officeName': 'ABC製薬／製薬企業(MR)',

    'emergency_contact': '000-0000-0000',
    'office_phone' : '000-0000-0000',
    'office_name' : '渋谷第一営業所',
    'department_section' : '営業部',
    'office_address' : '東京都渋谷区渋谷1-1-1',
    'gender': '0',
    'grade_pharma': '0',
    'year_exp': '4',
    'department_charge': ['テキスト', 'テキスト', 'テキスト'],
    'hospital_charge': ['テキスト', 'テキスト', 'テキスト'],
    'drug_charge': ['テキスト', 'テキスト', 'テキスト'],
    'place_born_in': 'この文章はダミー',
    'hobby': 'この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです。文字の大きさ、',
  };

  public mockData: any;

  constructor(private shareValue: SharedValueService,
              private registrationService: RegistrationService,
              private helper: Helper) { }

  onModalInit() {
    this.prop = this.params.extraParams.initialValue;
    this.year = new Date().getFullYear();
    /* dummy start
    --------------------------------------------------------- */
    if (this.prop.officeUserId === 'dr'){
      this.dataItems = this.insideItemMap(this.prop.data);
      this.mockData = this.prop.data;
    }else{
      this.dataItems = this.outsideItemMap(this.prop.data);
      this.mockData = this.prop.data;
    }
    if (this.mockData.managementAuthority && this.mockData.managementAuthority === 'MP_1'){
      this.profileOptionsIsContentRightContent = 'STAFF_AUTHORITY.' + this.mockData.managementAuthority;
      this.profileOptionsIsContentRightClass = 'text-danger fs14';
    }
    /* dummy end
    --------------------------------------------------------- */
  }

  insideItemMap(data: any){
    const dataItems = [];
    dataItems.push(
      {label: 'STAFF_DETAILS_POPUP.EMAIL_ADDRESS', value: data.mailAddressPublishingType != "2"?data.mailAddress :''},
      [
        {label: 'STAFF_DETAILS_POPUP.PHONE_NUMBER', value: data.mobileNoPublishingType !="2"?data.mobileNo :''},
        {label: 'STAFF_DETAILS_POPUP.PHS', value: data.phsNo},
      ],
      [
        {label: 'STAFF_DETAILS_POPUP.GENDER', value: this.getGender(data.gender)},
        {label: 'STAFF_DETAILS_POPUP.JOB', value: data.jobName},
      ],
      {label: 'STAFF_DETAILS_POPUP.YEAR_GRADE', value: data.graduationDate ? (this.year - new Date(moment(data.graduationDate).valueOf()).getFullYear()) : 0},
      {label: 'STAFF_DETAILS_POPUP.DEPARTMENT', value: data.department.path !== '/' ? data.department.path : data.department.displayName },
    );
    Object.keys(data).forEach((key) => {
      if (key === 'specializedDepartment'){
        data[key].forEach((val, idx) => {
          dataItems.push({label: 'STAFF_DETAILS_POPUP.SPECIALIZED_DEPARTMENT_NUMBER' + (idx + 1), value: val});
        });
      }
    });
    dataItems.push(
     {label: 'STAFF_DETAILS_POPUP.POSITION', value: data.position},
     {label: 'STAFF_DETAILS_POPUP.BRIEF_HISTORY', value: data.briefHistory},
     {label: 'STAFF_DETAILS_POPUP.QUALIFICATION', value: data.qualification},
     {label: 'STAFF_DETAILS_POPUP.PLACE_BORN_IN', value: data.placeBornIn},
     {label: 'STAFF_DETAILS_POPUP.HOBBY', value: data.hobby},
    );
    return dataItems;
  }

  outsideItemMap(data: any){
    const dataItems = [
      [
        {label: 'STAFF_DETAILS_POPUP.EMERGENCY_CONTACT', value: data.branch.mobileNo},
        {label: 'STAFF_DETAILS_POPUP.OFFICE_PHONE', value: data.branch.phoneNo}
      ],
      // {label: 'STAFF_DETAILS_POPUP.OFFICE_NAME', value: data.officeName},
      // {label: 'STAFF_DETAILS_POPUP.DEPARTMENT_SECTION', value: data.branch.department},
      // {label: 'STAFF_DETAILS_POPUP.OFFICE_ADDRESS', value: data.branch.address},
      [
        {label: 'STAFF_DETAILS_POPUP.GENDER', value: this.getGender(data.gender)},
        {label: 'STAFF_DETAILS_POPUP.GRADE_PHARMA', value: this.getGradePharma(data.graduatedPharmacy)},
      ],
      {label: 'STAFF_DETAILS_POPUP.YEAR_EXP', value: data.experiences},
      {label: 'STAFF_DETAILS_POPUP.DEPARTMENT_CHARGE', value: data.handleFieldList.map((val) => val.handleFieldName)},
      {label: 'STAFF_DETAILS_POPUP.HOSPITAL_CHARGE', value: data.handleOffices.map((val) => val.name)},
      {label: 'STAFF_DETAILS_POPUP.DRUG_CHARGE', value: data.handleDrugs},
      {label: 'STAFF_DETAILS_POPUP.PLACE_BORN_IN', value: data.placeBornIn},
      {label: 'STAFF_DETAILS_POPUP.HOBBY', value: data.hobby},
    ];
    return dataItems;
  }

  getGender(val): string {
    if (parseInt(val, 0) === 0) {
      return 'STAFF_DETAILS_POPUP.MALE';
    } else if (parseInt(val, 0) === 1) {
      return 'STAFF_DETAILS_POPUP.FEMALE';
    }
    return '';
  }

  getGradePharma(val): string {
    if (val) {
      return 'STAFF_DETAILS_POPUP.YES';
    } else {
      // if val is null, 0, '0', false, undefined ...
      return 'STAFF_DETAILS_POPUP.NO';
    }
  }

  getPayload(): any {
    return {};
  }

}
