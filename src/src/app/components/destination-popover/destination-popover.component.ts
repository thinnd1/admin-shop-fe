import {
  Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {DialogService} from '../../services/dialog.service';
import {GroupService} from '../../services/group.service';

@Component({
  selector: 'app-destination-popover',
  templateUrl: './destination-popover.component.html',
  styleUrls: ['./destination-popover.component.scss']
})

export class DestinationPopoverComponent implements OnInit, OnChanges {
  memberList = [];
  buildArrMemberList = [];
  narrowDownButtons;
  memberListSearchVal;
  viewPortItems: any[];
  public activeButton: any = null;
  @Input('isResetToUserList') isResetToUserList = false;
  @Input('destinationPopoverData') destinationPopoverData: any[] = [];
  @Input('isGroupOutside') isGroupOutside: boolean;
  @Output() destinationPopoverSelected = new EventEmitter<any>();

  constructor(private translate: TranslateService,
              private dialogService: DialogService,
              private groupService: GroupService) {}

  setNarrowDownButtons(lang: string) {
    const I18N_VALUES = {
      ja: [
        {label: '全', value: '', isActive: true},
        {label: 'あ', value: ['あ', 'い', 'う', 'え', 'お'], isActive: false},
        {label: 'か', value: ['か', 'き', 'く', 'け', 'こ', 'が', 'ぎ', 'ぐ', 'げ', 'ご'], isActive: false},
        {label: 'さ', value: ['さ', 'し', 'す', 'せ', 'そ', 'ざ', 'じ', 'ず', 'ぜ', 'ぞ'], isActive: false},
        {label: 'た', value: ['た', 'ち', 'つ', 'て', 'と', 'だ', 'ぢ', 'づ', 'で', 'ど'], isActive: false},
        {label: 'な', value: ['な', 'に', 'ぬ', 'ね', 'の'], isActive: false},
        {label: 'は', value: ['は', 'ひ', 'ふ', 'へ', 'ほ', 'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'], isActive: false},
        {label: 'ま', value: ['ま', 'み', 'む', 'め', 'も'], isActive: false},
        {label: 'や', value: ['や', 'ゆ', 'よ'], isActive: false},
        {label: 'ら', value: ['ら', 'り', 'る', 'れ', 'ろ'], isActive: false},
        {label: 'わ', value: ['わ', 'ゐ', 'ゑ', 'を'], isActive: false}
      ],
      en: [
        {label: 'ALL', value: '', isActive: true},
        {label: 'A', value: ['A', 'a'], isActive: false},
        {label: 'B', value: ['B', 'b'], isActive: false},
        {label: 'C', value: ['C', 'c'], isActive: false},
        {label: 'D', value: ['D', 'd'], isActive: false},
        {label: 'E', value: ['E', 'e'], isActive: false},
        {label: 'F', value: ['F', 'f'], isActive: false},
        {label: 'G', value: ['G', 'g'], isActive: false},
        {label: 'H', value: ['H', 'h'], isActive: false},
        {label: 'I', value: ['I', 'i'], isActive: false},
        {label: 'J', value: ['J', 'j'], isActive: false},
        {label: 'K', value: ['K', 'k'], isActive: false},
        {label: 'L', value: ['L', 'l'], isActive: false},
        {label: 'M', value: ['M', 'm'], isActive: false},
        {label: 'N', value: ['N', 'n'], isActive: false},
        {label: 'O', value: ['O', 'o'], isActive: false},
        {label: 'P', value: ['P', 'p'], isActive: false},
        {label: 'Q', value: ['Q', 'q'], isActive: false},
        {label: 'R', value: ['R', 'r'], isActive: false},
        {label: 'S', value: ['S', 's'], isActive: false},
        {label: 'T', value: ['T', 't'], isActive: false},
        {label: 'U', value: ['U', 'u'], isActive: false},
        {label: 'V', value: ['V', 'v'], isActive: false},
        {label: 'W', value: ['W', 'w'], isActive: false},
        {label: 'X', value: ['X', 'x'], isActive: false},
        {label: 'Y', value: ['Y', 'y'], isActive: false},
        {label: 'Z', value: ['Z', 'z'], isActive: false}
      ]
    };
    return I18N_VALUES[lang];
  }

  // use filter in the memberList, not build newArray when search, Select/Deselect All users
  // issueID: #10973 redmine-ominext
  buildArr(theArr: any[]): any[][] {
    if (theArr && theArr.length) {
      const arrOfarr = [];
      for (let i = 0; i < theArr.length; i += 2) {
        const row = [];
        for (let x = 0; x < 2; x++) {
          const value = theArr[i + x];
          if (!(value && value.isShow)) {
            break;
          } else {
            row.push(value);
          }
        }
        if (row.length) {
          arrOfarr.push(row);
        }
      }
      return arrOfarr;
    }
  }

  ngOnInit() {
    this._init();
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['destinationPopoverData'] ) {
      this.memberListSearchVal = '';
      this.memberList = this.destinationPopoverData;
      this.buildArrMemberList = this.memberList.filter(item => item.isShow === true);
    }
    if ((simpleChanges['isResetToUserList'] && this.isResetToUserList)) {
      this._init();
    }
  }

  private _init = () => {
    this.memberListSearchVal = '';
    const language = this.translate.currentLang;
    this.narrowDownButtons = this.setNarrowDownButtons(language);
  };

  memberAll(flag: boolean) {
    this.memberList.forEach((member, i, array) => {
      if (member.isShow) {
        member.isSelected = flag;
        this.destinationPopoverSelected.emit(member);
      }
    });
    this.buildArrMemberList = this.memberList.filter(item => item.isShow === true);
  }

  memberAllToggle() {
    this.memberList.forEach((member, i, array) => {
      if (member.isShow) {
        member.isSelected = !member.isSelected;
        this.destinationPopoverSelected.emit(member);
      }
    });
    this.buildArrMemberList = this.memberList.filter(item => item.isShow === true);
  }

  memberListSearch(event: any) {
    const word = this.memberListSearchVal;
    this.narrowDown(this.activeButton);
    if (word) {
      this.memberList.forEach((member, i, array) => {
        if (member.isShow) {
          const keyWord = word.toUpperCase();
          member.isShow = !!(member.fullName.toUpperCase().indexOf(keyWord) > -1 || member.fullNameKana.toUpperCase().indexOf(keyWord) > -1);
        }
      });
    }
    if (event.type === 'keydown' && event.keyCode === 13) {
      this.memberAllToggle();
    }
    // this.buildArrMemberList = this.buildArr(this.memberList);
    this.buildArrMemberList = this.memberList.filter(item => item.isShow);
  }

  narrowDown(val: string) {
    const word = this.memberListSearchVal;
    this.memberList.forEach((member, i, array) => {
      const initial = member.fullNameKana.charAt(0);
      const reg = new RegExp(word, 'gi');
      const isShow = ((val == null || !val || val.indexOf(initial) >= 0) &&
        (member.fullName.match(reg) || member.fullNameKana.match(reg)));
      member.isShow = !!isShow;
    });
    // this.buildArrMemberList = this.buildArr(this.memberList);
    this.buildArrMemberList  = this.memberList.filter(item => item.isShow);
  }

  narrowDownButtonClick(event: any, btn: any) {
    this.narrowDownButtons.forEach((button, i, array) => {
      button.isActive = false;
    });
    btn.isActive = true;
    this.activeButton = btn.value;
    this.narrowDown(this.activeButton);
  }

  toggleDestinationPopover(event: any) {
    setTimeout(() => {
      const elm = (event.target.nodeName === 'SPAN') ? event.target.parentElement.nextSibling : event.target.nextSibling;
      (<any>$(elm)).find('.search-input').focus();
    });
  }

  toggleMember(member: any) {
    member.isSelected = !member.isSelected;
    this.destinationPopoverSelected.emit(member);
  }

}
