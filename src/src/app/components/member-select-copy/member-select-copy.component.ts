import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { SharedValueService } from '../../services/shared-value.service';
import { SimpleChanges, OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'app-member-select-copy',
  templateUrl: './member-select-copy.component.html',
  styleUrls: ['./member-select-copy.component.scss']
})
export class MemberSelectCopyComponent implements OnInit, OnChanges {
  userSession;
  authority = {};
  statusButton = true;
  public addMemberSelect = [];
  public removeMemberSelect = [];
  public addMemberAllSelectVal: boolean;
  public addMemberList = [];
  public removeMemberList = [];

  public addMemberListSearchVal: string;
  public addMemberListSearchMatch = [false];
  public removeMemberListSearchVal: string;
  public removeMemberListSearchMatch = [false];

  @Input() options: any = {
    displayDepartment: false,
    isAdmin: true
  };
  @Input() memberList = new Array();
  @Input() memberListSelected = new Array();
  @Output() memberSelected = new EventEmitter<any>();
  @Output() eventClick: EventEmitter<any> = new EventEmitter<any>();

  constructor(private shareValue: SharedValueService) { }

  ngOnChanges(changes: SimpleChanges) {
    this.removeMemberList = changes['memberListSelected'].currentValue;
    this.addMemberList = this.filterUserSelected(changes['memberList'].currentValue, this.removeMemberList);
  }

  ngOnInit() {
    this.userSession = this.shareValue.getUserSession();
    this.authority = {
      managementAuthority: 'MP_1',
      deptId: this.userSession.deptId,
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
  }

  searchDepartment(data) {
    const arrResult = [];
    const otherarrResult = [];
    if (this.options.displayDepartment === true) {
      const id = data.departmentId;
      const childrenList =  data.department.children;
      if (id !== '') {
        for (let i = 0; i < this.memberList.length; i++) {
          if (this.memberList[i].department.id === id || (childrenList && childrenList.indexOf(this.memberList[i].department.id) > -1)) {
            arrResult.push(this.memberList[i]);
          } else {
            otherarrResult.push(this.memberList[i]);
          }
        }
        this.addMemberList = this.filterUserSelected(arrResult, this.removeMemberList);
      } else {
        this.addMemberList = this.filterUserSelected(this.memberList, this.removeMemberList);
      }
    }
  }

  memberListSearch(word: string, match: boolean[], members: string[]) {
    if (word) {
      word = word.toLowerCase();
      // const reg = new RegExp(word, 'g');
      for (let i = 0; i < members.length; i++) {
        const name = members[i].toLowerCase();
        match[i] = name.indexOf(word) === -1;
      }
    } else {
      Object.keys(members).forEach(i => {
        match[i] = false;
      });
    }
  }

  addMemberListSearch(event: any) {
    const word = this.addMemberListSearchVal;
    const match = this.addMemberListSearchMatch;
    const members = [];
    this.addMemberList.forEach(function (member, i, array) {
      members.push(member.lastName + ' ' + member.firstName + member.lastNameKana + ' ' + member.firstNameKana);
    });
    this.memberListSearch(word, match, members);
  }

  removeMemberListSearch(event: any) {
    const word = this.removeMemberListSearchVal;
    const match = this.removeMemberListSearchMatch;
    const members = [];
    this.removeMemberList.forEach(function (member, i, array) {
      members.push(member.lastName + ' ' + member.firstName + member.lastNameKana + ' ' + member.firstNameKana);
    });
    this.memberListSearch(word, match, members);
  }

  addMemberAllSelect(event: any) {
    this.addMemberList.forEach(function (member, i, array) {
      this.addMemberSelect[i] = this.addMemberAllSelectVal;
    }.bind(this));
  }

  addMember(event: any) {
    this.statusButton = false;
    const newAddMemberList = [];
    this.addMemberList.forEach(function (member, i, array) {
      if (this.addMemberSelect[i]) {
        member.isSelected = true;
        this.removeMemberList.push(member);
      } else {
        member.isSelected = false;
        newAddMemberList.push(member);
      }
    }.bind(this));
    this.addMemberSelect = [];
    this.addMemberList = newAddMemberList;
    if (!this.addMemberList.length) {
      this.addMemberAllSelectVal = false;
    }
    this.memberSelected.emit(this.removeMemberList);
  }

  removeMember(event: any) {
    this.statusButton = false;
    const newRemoveMemberList = [];
    this.removeMemberList.forEach(function (member, i, array) {
      if (this.removeMemberSelect[i]) {
        member.isAdmin = false;
        member.isSelected = false;
        this.addMemberList.push(member);
      } else {
        member.isSelected = true;
        newRemoveMemberList.push(member);
      }
    }.bind(this));
    this.removeMemberSelect = [];
    this.removeMemberList = newRemoveMemberList;
    this.addMemberAllSelectVal = false;
    this.memberSelected.emit(this.removeMemberList);
  }

  addMemberSelectClick(member: string, event: any, i: number) {
    this.addMemberSelect[i] = !this.addMemberSelect[i];
    this.addMemberAllSelectVal = false;
  }

  removeMemberSelectClick(member: string, event: any, i: number) {
    this.removeMemberSelect[i] = !this.removeMemberSelect[i];
  }

  isAdminChecked(member: string, event: any, i: number) {
    this.removeMemberList[i].isAdmin = !this.removeMemberList[i].isAdmin;
  }

  filterUserSelected(arrayParent, handleArray) {
    const newUsers = [];
    for (const item of arrayParent) {
      let check = false;
      for (const itemHandle of handleArray) {
        if (item.userId === itemHandle.userId) {
          check = true;
          break;
        }
      }
      if (check === false) {
        newUsers.push(item);
      }
    }
    return newUsers;
  }

  saveMemberSelectClick() {
    this.eventClick.emit();
  }
}
