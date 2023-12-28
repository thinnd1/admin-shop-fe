import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ManagementAuthority, UserSession} from '../models/ba/user-session';
import {SettingType} from './meeting-common';
import {FileType} from 'ng2-file-upload/file-upload/file-type.class';
import {CalendarCommon} from './calendar-common';
declare var moment: any;

declare const $: any;

export enum TypeLogin {
  LOGIN,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
  FORGOT_PASSWORD_SUCCESS,
  RESET_PASSWORD_SUCCESS
}

@Injectable()
export class Helper {

  public static loginIDRegex =  /^[a-zA-Z0-9\@\#\$\%\&\'\*\+\-\/\=\?\^\_\`\{\|\}\~\.]+$/;
  public static emailRegex = /^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9]{1,}[.][a-zA-Z0-9]{1,5}((?:[.]{1}[a-zA-Z0-9]{1,5})?)*$/;
  public static nameKanaRegex = /^[ぁ-ゔゞ゛゜ー]+$/;
  public static passwordRegex = '^[a-zA-Z0-9_]+$';
  public static max_import_staff_invite = 1000;
  public static max_department = 1000;
  public static max_level_department = 5;
  public static regexSpace = '^[a-zA-Z0-9ぁ-んァ-ン\s]+$';
  public static lang = {
    ENGLISH: 'en',
    JAPAN: 'ja'
  };

  public static checkSpace = '.*\\S+.*';
  public static NGKeyword = '副作用,side effect,薬疹,有害事象,adr,adverse drug,Adverse Drug Reaction,ae,adverse event,薬害,副反応,アナフィラキシー,アレルギー,ショック,スティーブンス・ジョンソン症候群,' +
    'sjs,ten,中毒性表皮壊死症,被疑薬';

  public static menu = {
    'CA0002': 'calendar',
    'ME0001': 'building',
    'CH0007': 'envelope-o',
    'CH0005': 'envelope',
    'GR0015': 'user-circle',
    'GR0016': 'user-circle-o'
  };

  public static itemsMenu = [
    {
      'displayOrder': -2,
      'functionId': 'CA0002'
    },
    {
      'displayOrder': -1,
      'functionId': 'ME0001'
    },
    {
      'displayOrder': 1,
      'functionId': 'CH0007'
    },
    {
      'displayOrder': 2,
      'functionId': 'CH0005'
    },
    {
      'displayOrder': 3,
      'functionId': 'GR0015'
    },
    {
      'displayOrder': 4,
      'functionId': 'GR0016'
    }
  ];
  monthYears = [
    {Id: '1', Name: '01'}, {Id: '2', Name: '02'}, {Id: '3', Name: '03'}, {Id: '4', Name: '04'},
    {Id: '5', Name: '05'}, {Id: '6', Name: '06'}, {Id: '7', Name: '07'}, {Id: '8', Name: '08'},
    {Id: '9', Name: '09'}, {Id: '10', Name: '10'}, {Id: '11', Name: '11'}, {Id: '12', Name: '12'}
  ];
  dayOfMonths = [
    {Id: '1', Name: '01'}, {Id: '2', Name: '02'}, {Id: '3', Name: '03'}, {Id: '4', Name: '04'}, {Id: '5', Name: '05'},
    {Id: '6', Name: '06'}, {Id: '7', Name: '07'}, {Id: '8', Name: '08'}, {Id: '9', Name: '09'}, {Id: '10', Name: '10'},
    {Id: '11', Name: '11'}, {Id: '12', Name: '12'}, {Id: '13', Name: '13'}, {Id: '14', Name: '14'}, {
      Id: '15',
      Name: '15'
    },
    {Id: '16', Name: '16'}, {Id: '17', Name: '17'}, {Id: '18', Name: '18'}, {Id: '19', Name: '19'}, {
      Id: '20',
      Name: '20'
    },
    {Id: '21', Name: '21'}, {Id: '22', Name: '22'}, {Id: '23', Name: '23'}, {Id: '24', Name: '24'}, {
      Id: '25',
      Name: '25'
    },
    {Id: '26', Name: '26'}, {Id: '27', Name: '27'}, {Id: '28', Name: '28'}, {Id: '29', Name: '29'}, {
      Id: '30',
      Name: '30'
    },
    {Id: '31', Name: '31'}
  ];
  genders = [
    {Id: '0', Name: '男性'},
    {Id: '1', Name: '女性'}
  ];

  optionsGraduationYear = new Array();
  graduation_year_text = new Array();
  Math: any;

  constructor(private translate: TranslateService, private calendarCommon: CalendarCommon) {
    this.Math = Math;
  }

  graduationYearOptions(max_year: number, flag?) {
    const d = new Date();
    const graduationYearText = [];
    for (let i = 0; i < max_year; i++) {
      const year = d.getFullYear() - i;
      const heisei = year - 1988;
      let wareki = '';
      if (heisei > 1) {
        wareki = '平成' + heisei;
      } else if (heisei === 1) {
        wareki = '平成元';
      } else if (heisei < 1) {
        wareki = '昭和' + (63 + heisei);
      }
      this.optionsGraduationYear[i] = year.toString();
      if(flag){
        this.graduation_year_text[i] = this.optionsGraduationYear[i] + '(' + wareki + ')';
      }else{
        this.graduation_year_text[i] = this.optionsGraduationYear[i] + '(' + wareki + ')年';
      }
      graduationYearText.push(this.optionsGraduationYear[i] + '/' + wareki);
    }
    return [this.optionsGraduationYear, this.graduation_year_text, graduationYearText];
  }

  graduationYearText(selectedYear: any) {
    let graduation_year;
    const date = new Date();
    graduation_year = date.getFullYear() - selectedYear;
    const graduation_year_text = '卒業して' + graduation_year + '年';
    if (selectedYear === '') {
      return null;
    } else {
      return graduation_year_text;
    }
  }

  numbericOnlyPaste(elementId: any) {
    $('#' + elementId).on('focusout', () => {
      const element = $('#' + elementId);
      element.val(element.val().replace(/[^0-9]/g, ''));
    }).on('paste', () => {
      const element = $('#' + elementId);
      setTimeout(() => {
        element.val(element.val().replace(/[^0-9]/g, ''));
      }, 5);
    });
  }

  /**
   * @param event
   */
  numericOnly(event) {
    if ([46, 8, 9, 27, 13].indexOf(event.keyCode) > -1 ||
      // Allow: Ctrl+A
      (event.keyCode === 65 && (event.ctrlKey || event.metaKey)) ||
      // Allow: Ctrl+C
      (event.keyCode === 67 && (event.ctrlKey || event.metaKey)) ||
      // Allow: Ctrl+V
      (event.keyCode === 86 && (event.ctrlKey || event.metaKey)) ||
      // Allow: Ctrl+X
      (event.keyCode === 88 && (event.ctrlKey || event.metaKey)) ||
      // Allow: home, end, left, right
      (event.keyCode >= 35 && event.keyCode <= 39)) {
      // let it happen, don't do anything
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
      event.preventDefault();
    }
  }

  /**
   * @param first id selector
   * @param middle id selector
   * @param last id selector
   * @returns
   */
  combinePhoneNumber(phone_first: string, phone_middle: string, phone_last: string) {
    let combineString = '';
    const first = $('#' + phone_first).val();
    const middle = $('#' + phone_middle).val();
    const last = $('#' + phone_last).val();
    combineString = first + '-' + middle + '-' + last;
    return combineString === '--' ? '' : combineString;
  }

  combineBirthDate(yearId: string, monthId: string, dayId: string) {
    let combineString = '';
    const first = $('#' + yearId).val();
    const middle = $('#' + monthId).val();
    const last = $('#' + dayId).val();
    combineString = first + '-' + middle + '-' + last;
    return combineString;
  }

  /**
   * check validate object in FormGroup
   * @param modelGroupForm
   * @param field
   * @param validationMessages
   * @returns {string}
   */
  validateForm(modelGroupForm: any, field: string, validationMessages: any) {
    let messages = '';
    const control = modelGroupForm.get(field);
    if (control && !control.valid) {
      for (const key in control.errors) {
        if (control.errors.hasOwnProperty(key)) {
          messages = validationMessages[key];
        }
        break;
      }
    }
    return messages;
  }

  createArrayDepartment(listDepartment, listChildren: any, parent: any, level: number, deptName?) {
    for (let i = 0; i < listChildren.length; i++) {
      level = (listChildren[i].path !== '/') ? level : 0;
      const department = {};
      department['id'] = listChildren[i].id;
      department['name'] = listChildren[i].name;
      department['displayName'] = listChildren[i].displayName;
      department['level'] = level;
      department['save'] = true;
      department['path'] = listChildren[i].path;
      if (parent === '' || parent.path === '/') {
        department['text'] = listChildren[i].displayName ? listChildren[i].displayName : listChildren[i].name;
      } else {
        const name = listChildren[i].displayName ? listChildren[i].displayName : listChildren[i].name;
        department['text'] = parent.text + '｜' + name;
      }
      department['option'] =
        (department['text'] && department['text'].length > 100) ? department['text'].substring(0, 100) + '...' : department['text'];

      listDepartment.push(department);
      if (listChildren[i].children && (deptName !== '/' || !deptName)) {
        if (listChildren[i].children.length) {
          this.createArrayDepartment(listDepartment, listChildren[i].children, department, level + 1);
        } else {
          // do nothing
        }
      } else {
        // do nothing
      }
    }
    return listDepartment;
  }

  // convert object department to string department follow level
  convertLevelDepartment(departmentText: string, object: any) {
    if (object) {
      if (object.displayName) {
        departmentText = object.displayName;
      } else {
        departmentText = object.name;
      }
      if (object.children) {
        if (object.children.length > 0) {
          departmentText += '｜' + this.convertLevelDepartment(departmentText, object.children[0]);
        }
      }
      return departmentText;
    }
  }

  parseBirthDate(m: any) {
    let arrayBirthDate = [];
    if (m) {
      const date = new Date(m);
      arrayBirthDate[0] = date.getFullYear().toString();
      arrayBirthDate[1] = ('0' + (date.getMonth() + 1)).slice(-2);
      arrayBirthDate[2] = ('0' + date.getDate()).slice(-2);
    } else {
      arrayBirthDate = [];
    }
    const months = this.getMonths(arrayBirthDate[0]);
    const days = this.getDays(arrayBirthDate[1], arrayBirthDate[0]);
    return {'arrayBirthDate': arrayBirthDate, 'months': months, 'days': days};
  }

  getMonths(year: any) {
    const months = [];
    let month = 12;
    if (year === (new Date().getFullYear()).toString()) {
      month = new Date().getMonth() + 1;
    }
    for (let i = 1; i <= month; i++) {
      const m = (i < 10 ? '0' : '') + i;
      months.push(m);
    }
    return months;
  }

  getDays(month: any, year: any) {
    const days = [];
    let day = new Date(year, month, 0).getDate();
    if (year === (new Date().getFullYear()).toString() && month === ('0' + (new Date().getMonth() + 1)).slice(-2)) {
      day = new Date().getDate();
    }
    for (let i = 1; i <= day; i++) {
      const d = (i < 10 ? '0' : '') + i;
      days.push(d);
    }
    return days;
  }

  changeDate(yearId: any, monthId: any) {
    const year = $('#' + yearId).val();
    const month = $('#' + monthId).val();
    const months = this.getMonths(year);
    const days = this.getDays(month, year);
    return {'months': months, 'days': days};
  }

  // Group
  selectedAdmin(value, index, listAdmin) {
    if (value) {
      listAdmin[index] = true;
    } else {
      listAdmin[index] = false;
    }
    return listAdmin;
  }

  convertUserName(listConvertedUser, userInfo) {
    let arrTemp = [];
    if (userInfo) {
      if (!Array.isArray(userInfo)) {
        arrTemp.push(userInfo);
      } else {
        arrTemp = userInfo;
      }
      for (let i = 0; i < arrTemp.length; i++) {
        const user = {};
        user['accountStatus'] = arrTemp[i].accountStatus;
        user['adminFlag'] =  arrTemp[i].adminFlag;
        user['officeUserId'] = arrTemp[i].officeUserId;
        user['deptId'] = arrTemp[i].deptId ? arrTemp[i].deptId : '';
        user['memberId'] = arrTemp[i].memberId ? arrTemp[i].memberId : '';
        user['authority'] = arrTemp[i].authority ? 'ADMIN' : 'MEMBER';
        user['fullName'] = arrTemp[i].lastName + '　' + arrTemp[i].firstName;
        user['fullNameKana'] = arrTemp[i].lastNameKana + '　' + arrTemp[i].firstNameKana;
        user['imageUrl'] = arrTemp[i].imageUrl ? arrTemp[i].imageUrl : '';
        user['isShow'] = true;
        user['isSelected'] = false;
        listConvertedUser.push(user);
      }
      return listConvertedUser;
    } else {
      return [];
    }
  }

  convertUserNameGroupOutSide(listConvertedUser, userInfo) {
    let arrTemp = [];
    if (userInfo) {
      if (!Array.isArray(userInfo)) {
        arrTemp.push(userInfo);
      } else {
        arrTemp = userInfo;
      }
      for (let i = 0; i < arrTemp.length; i++) {
        const user = {};
        user['accountStatus'] = arrTemp[i].accountStatus;
        user['officeUserId'] = arrTemp[i].officeUserId;
        user['officeId'] = arrTemp[i].officeId;
        user['deptId'] = arrTemp[i].deptId ? arrTemp[i].deptId : '';
        user['memberId'] = arrTemp[i].memberId ? arrTemp[i].memberId : '';
        user['authority'] = arrTemp[i].authority ? 'ADMIN' : 'MEMBER';
        user['fullName'] = arrTemp[i].lastName + '　' + arrTemp[i].firstName;
        user['fullNameKana'] = arrTemp[i].lastNameKana + '　' + arrTemp[i].firstNameKana;
        user['officeName'] = arrTemp[i].officeName ?
          ((arrTemp[i].officeName.length > 20) ? (arrTemp[i].officeName.substr(0, 20) + '...') : arrTemp[i].officeName) : '';
        user['inviteFlg'] = arrTemp[i].inviteFlg ? arrTemp[i].inviteFlg : false;
        user['imageUrl'] = arrTemp[i].imageUrl ? arrTemp[i].imageUrl : '';
        user['isShow'] = true;
        user['isSelected'] = false;
        listConvertedUser.push(user);
      }
      return listConvertedUser;
    } else {
      return [];
    }
  }

  findDepartment(listDepartment, listChildren: any[], departmentId: string) {
    if (listDepartment.length > 0) {
      return listDepartment;
    }

    for (let i = 0; i < listChildren.length; i++) {
      if (listChildren[i].id === departmentId) {
        listDepartment.push(listChildren[i]);
      } else {
        if (listChildren[i].children) {
          if (listChildren[i].children.length) {
            this.findDepartment(listDepartment, listChildren[i].children, departmentId);
          } else {
            // do nothing
          }
        } else {
          // do nothing
        }
      }
    }
    return listDepartment;
  }

  /**
   * get list department of managementAuthority
   * @param listDepartment: list all department
   * @param listChildren
   * @param parent
   * @param level
   * @param managementAuthority; authority user login
   * @param departmentId: department user login
   * @param objAll
   * @param obj
   * @returns {any[]}
   */
  createArrayDepartmentAuthority(listDepartment, listChildren: any[], parent: any, level: number, managementAuthority: any,
                                 departmentId: string, objAll: any, obj: any, deptName?) {
    let res = new Array();
    if (managementAuthority === ManagementAuthority.MP_1) {
      res = this.createArrayDepartment(listDepartment, listChildren, parent, level);
      res.splice(0, 0, objAll);
    } else {
      const listDepartmentAuthoritySet = this.findDepartment(new Array(), listChildren, departmentId);
      res = this.createArrayDepartment(listDepartment, listDepartmentAuthoritySet, parent, level, deptName);
      if (obj) {
        res.splice(0, 0, obj);
      }
    }

    return res;
  }

  /**
   * check no good keyword
   * @param NGKeyword
   * @param {string} string
   * @returns {boolean}
   */
  checkNGKeyword(string: string) {
    let count = 0;
    const pattern = Helper.NGKeyword.split(',').filter(item => {
      if (string.replace(/\s+/g, ' ').toUpperCase().indexOf(item.toUpperCase()) > -1) {
        count++;
      }
    });
    return count > 0;
  }

  convertTimeIso(time: any) {
    const Time = time.split(':');
    const hour = parseInt(Time[0], 0);
    const minutes = parseInt(Time[1], 0);
    const timeUTC = hour * 60 + minutes;
    return timeUTC;
  }

  /**
   * @param {string} property
   * @returns {(a: any, b: any) => number}
   */
  orderByComparator(property: string) {
    return ((a: any, b: any) => {
      if ((isNaN(parseFloat(a[property])) || !isFinite(a[property])) || (isNaN(parseFloat(b[property])) || !isFinite(b[property]))) {
        if (a[property].toLowerCase() < b[property].toLowerCase()) {
          return -1;
        }
        if (a[property].toLowerCase() > b[property].toLowerCase()) {
          return 1;
        }
      } else {
        if (parseFloat(a[property]) < parseFloat(b[property])) {
          return -1;
        }
        if (parseFloat(a[property]) > parseFloat(b[property])) {
          return 1;
        }
      }
      return 0;
    });
  }

  /**
   * sort an array of objects by nested object property
   * @param prop
   * @param arr
   * @returns {any}
   */
  sort(prop, arr) {
    prop = prop.split('.');
    const len = prop.length;

    arr.sort(function (a, b) {
      let i = 0;
      while (i < len) {
        a = a[prop[i]];
        b = b[prop[i]];
        i++;
      }
      if (!a) {
        return 1;
      } else if (!b) {
        return -1;
      } else if (a === b) {
        return 0;
      } else {
        return a < b ? -1 : 1;
      }
    });
    return arr;
  };

  /**
   * get the children id list of a department
   * @param {any[]} listDepartment
   */
  getChildrenIdArr(idChildArr: string[], department: any) {
    if (department && department.children && department.children.length > 0) {
      department.children.forEach(child => {
        if (idChildArr.indexOf(child.id) === -1) {
          idChildArr.push(child.id);
        }
        if (child.children && child.children.length > 0) {
          this.getChildrenIdArr(idChildArr, child);
        }
      });
    }
    return idChildArr;
  }

  /**
   * get the department id list & its children id
   * [{id: string, childIds: [string, string,...]}]
   * @param {any[]} arrIdList
   * @param {any[]} listDepartment
   * @returns {any[]}
   */
  getDepartmentIdList(arrIdList: any[], listDepartment: any[]) {
    if (listDepartment && listDepartment.length > 0) {
      listDepartment.forEach(depart => {
        // deparment default
        if (depart.path === '/') {
          arrIdList.push({id: depart.id, childIds: []});
        } else {
          arrIdList.push({id: depart.id, childIds: this.getChildrenIdArr(new Array(), depart)});
        }
        if (depart.children && depart.children.length > 0) {
          this.getDepartmentIdList(arrIdList, depart.children);
        }
      });
    }
    return arrIdList;
  }

  arrayUnique(array) {
    const a = array.concat();
    for (let i = 0; i < a.length; ++i) {
      for (let j = i + 1; j < a.length; ++j) {
        if (a[i] === a[j]) {
          a.splice(j--, 1);
        }
      }
    }
    return a;
  }

  checkDataEmpty(record, except?: Array<any> ) {
    for (const key in record) {
      if (record.hasOwnProperty(key)) {
        if (!except || except.indexOf(key) === -1) {
          record[key] = record[key] === '' ? '―' : record[key];
        }
      }
    }
  }

  /**
   * @param records
   * @param args
   * 1 for asc and -1 for desc order
   *  ### Example
   * args = [{key: lastName, direction: -1}]
   * @returns sorted array
   */
  sortByMulti(records: Array<any>, args: Array<any>): any {
    if (records) {
      return records.sort(function (a, b) {
        for (let i = 0; i < args.length; i++) {
          const key = args[i].key;
          const direction  = args[i].direction;
          if (a.hasOwnProperty(key) && b.hasOwnProperty(key)) {
            const result = compare(a[key], b[key]);
            if (result !== 0) {
              return direction * result;
            }
          }
        }
        return 0;
      });
    }

    function compare(a, b) {
      if (typeof a === 'number') {
        if (a === b) {
          return 0;
        }
        return a < b ? -1 : 1;
      }
      if (typeof a === 'string') {
        return a.localeCompare(b);
      }
    }
  };

  /**
   * @param element
   * @param viewPortData
   * @returns {boolean}
   */
  inViewport(element, viewPortData: any) {
    if (element && element.offset()) {
      const elementTop = element.offset().top;
      const elementBottom = elementTop + element.outerHeight();
      const viewportTop = $(window).scrollTop();
      const viewportBottom = viewportTop + $(window).height();
      if (elementTop >= viewportTop) {
        viewPortData.topInView = true;
      }
      if (elementBottom <= viewportBottom) {
        viewPortData.bottomInView = true;
      }
      return viewPortData.topInView && viewPortData.bottomInView;
    }
  }

  /**
   * @param list
   * @param key
   * @param value
   * * @returns matched object
   */
  findByField(list, key, value): any {
    for (let i = 0; i < list.length; i++) {
      // double equals
      if (list[i][key] == value) {
        return list[i];
      }
    }
    return null;
  }

  detectScrollBottom() {
    let windowHeight = "innerHeight" in window ? window.innerHeight
      : document.documentElement.offsetHeight;
    let body = document.body, html = document.documentElement;
    let docHeight = Math.max(body.scrollHeight,
      body.offsetHeight, html.clientHeight,
      html.scrollHeight, html.offsetHeight);
    let windowBottom = windowHeight + window.pageYOffset;
    if (windowBottom >= docHeight) {
      return true;
    }
    return false;
  }

  /**
   * @param file
   * @returns {boolean} true: file is an image
   */
  checkFileOrImage(file): boolean {
    const imageType = /^image\/(png|jpg|jpeg|pjpeg|gif|x-png)/;
    if (imageType.test(file.type) || imageType.test(file.mimeType)) {
      return true;
    }
    return false;
  }

  /**
   * Returns a function, that, as long as it continues to be invoked, will not
   * be triggered. The function will be called after it stops being called for
   * N milliseconds. If `immediate` is passed, trigger the function on the
   * leading edge, instead of the trailing.
   */
  debounce(func, wait, immediate?) {
    let timeout;
    return function () {
      const context = this, args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) {
          func.apply(context, args);
        }
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        func.apply(context, args);
      }
    };
  };

  getFileClass(file) {
    if (file && file.type) {
      let fileClass = FileType.getMimeClass(file);
      const fa = ['archive', 'audio', 'excel', 'image', 'video', 'pdf', 'powerpoint', 'text', 'word', 'zip'];
      if (fileClass === 'doc') {
        fileClass = 'text';
      }
      if (fileClass === 'xls') {
        fileClass = 'excel';
      }
      if (fileClass === 'ppt') {
        fileClass = 'powerpoint';
      }
      if (fileClass === 'compress') {
        fileClass = 'zip';
      }
      return fa.indexOf(fileClass) > -1 ? fileClass : '';
    }
    return '';
  }

  gotoError() {
    setTimeout(() => {
      const $firstError = $('.has-danger').first();
      if ($firstError.length > 0) {
        $('html, body').animate({
          scrollTop: $firstError.offset().top - $(window).height() / 3
        }, 70);
        // exclude date-picker because date-picker does not behave very well when being focused
        const $firstInput = $firstError.find('input').not('.form-control-date').first();
        const $firstTextarea = $firstError.find('textarea').first();
        if ($firstInput.length > 0 || $firstTextarea.length) {
          $firstInput.focus();
          $firstTextarea.focus();
        }
        return true;
      }
      return false;
    }, 200);
  }

  convertDateTime(value: string, format: string) {
    let time = '';
    if (moment(value).isValid()) {
      switch (format) {
        case 'MM月DD日(date)':
          time = moment(value).format('MM月DD日') + this.calendarCommon.getWeekdayJapanese(value);
          break;
        case 'M月D日(date)':
          time = moment(value).format('M月D日') + this.calendarCommon.getWeekdayJapanese(value);
          break;
        case 'YYYY年MM月DD日(date)':
          time = moment(value).format('YYYY年MM月DD日') + this.calendarCommon.getWeekdayJapanese(value);
          break;
        case 'YYYY年M月D日(date)':
          time = moment(value).format('YYYY年M月D日') + this.calendarCommon.getWeekdayJapanese(value);
          break;
        case 'YYYY年MM月DD日':
          time = moment(value).format('YYYY年MM月DD日');
          break;
        case 'YYYY年M月D日':
          time = moment(value).format('YYYY年MM月DD日');
          break;
        case 'YYYY/MM/DD':
          time = moment(value).format('YYYY/MM/DD');
          break;
        case 'HH:mm:ss':
          time = moment(value).format('HH:mm:ss');
          break;
        case 'HH:mm':
          time = moment(value).format('HH:mm');
          break;
        case 'HH:mm ~':
          time = moment(value).format('HH:mm') + ' 〜 ' + moment(value).add( moment.duration(30, 'm')).format('HH:mm');
          break;
        default:
          time = moment(value).format(format);
      }
    }
    return time
  }


  // --------------------------- GROUP ----------------------------- //
  mapOrder (array, order, key) {
    array.sort( (a, b) => {
      const A = a[key], B = b[key];

      if (order.indexOf(A) > order.indexOf(B)) {
        return 1;
      } else {
        return -1;
      }
    });
    return array;
  };

  placeholder() {
    $(function ($) {
      $.fn.replaceIEHolder = function () {
        this.each(function () {
          var $input = $(this);
          var text = $input.attr('placeholder');
          var handler = function () {
            if (text && text.length > 0) {
              $input.attr('placeholder', text);
            }
          };
          $input.on('blur', handler);
        });
      }
      $('input').replaceIEHolder();
    });
  }

  setScrollTop() {
    window.scroll(window.scrollX, 0);
  }
}
