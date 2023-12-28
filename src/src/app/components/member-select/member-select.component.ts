import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-member-select',
  templateUrl: './member-select.component.html',
  styleUrls: ['./member-select.component.scss']
})
export class MemberSelectComponent implements OnInit {
  public addMemberSelect = [];
  public removeMemberSelect = [];
  public addMemberAllSelectVal: boolean;
  public addMemberList = [];
  public removeMemberList = [];

  public addMemberListSearchVal: string;
  public addMemberListSearchMatch = [false];
  public removeMemberListSearchVal: string;
  public removeMemberListSearchMatch = [false];

  @Input() officeId: string;
  @Input() memberSelectOptions: any = {};
  @Output() memberSelected = new EventEmitter<any>();

  // TODO mock
  private mockData = {
    list: [
      {officeId: '1', officeUserId: '1', firstName: '太郎', lastName: '山田', isSelected: false, isAdmin: false},
      {officeId: '1', officeUserId: '2', firstName: '太郎', lastName: '山田', isSelected: false, isAdmin: false},
      {officeId: '1', officeUserId: '3', firstName: '太郎', lastName: '山田', isSelected: false, isAdmin: false},
      {officeId: '1', officeUserId: '4', firstName: '太郎', lastName: '山田', isSelected: false, isAdmin: false},
      {officeId: '1', officeUserId: '5', firstName: '太郎', lastName: '山田', isSelected: false, isAdmin: false},
      {officeId: '1', officeUserId: '6', firstName: '太郎', lastName: '山田', isSelected: false, isAdmin: false},
      {officeId: '1', officeUserId: '7', firstName: '太郎', lastName: '山田', isSelected: false, isAdmin: false},
      {officeId: '1', officeUserId: '8', firstName: '太郎', lastName: '山田', isSelected: false, isAdmin: false},
      {officeId: '1', officeUserId: '9', firstName: '太郎', lastName: '山田', isSelected: false, isAdmin: false},
      {officeId: '1', officeUserId: '10', firstName: '太郎', lastName: '山田', isSelected: false, isAdmin: false},
      {officeId: '1', officeUserId: '11', firstName: '太郎', lastName: '山田', isSelected: false, isAdmin: false},
      {officeId: '1', officeUserId: '12', firstName: '太郎', lastName: '山田', isSelected: false, isAdmin: false},
      {officeId: '1', officeUserId: '13', firstName: '太郎', lastName: '山田', isSelected: false, isAdmin: false},
      {officeId: '1', officeUserId: '14', firstName: '太郎', lastName: '山田', isSelected: false, isAdmin: false},
      {officeId: '1', officeUserId: '15', firstName: '太郎', lastName: '山田', isSelected: false, isAdmin: false},
      {officeId: '1', officeUserId: '16', firstName: '太郎', lastName: '山田', isSelected: false, isAdmin: false},
      {officeId: '1', officeUserId: '17', firstName: '太郎', lastName: '山田', isSelected: false, isAdmin: false},
      {officeId: '1', officeUserId: '18', firstName: '太郎', lastName: '山田', isSelected: false, isAdmin: false},
      {officeId: '1', officeUserId: '19', firstName: '太郎', lastName: '山田', isSelected: false, isAdmin: false},
      {officeId: '1', officeUserId: '20', firstName: '太郎', lastName: '山田', isSelected: false, isAdmin: false},
      {officeId: '1', officeUserId: '21', firstName: '太郎', lastName: '山田', isSelected: false, isAdmin: false},

      {officeId: '1', officeUserId: '22', firstName: '太郎', lastName: '山田', isSelected: true, isAdmin: false},
      {officeId: '1', officeUserId: '23', firstName: '太郎', lastName: '山田', isSelected: true, isAdmin: true},
      {officeId: '1', officeUserId: '24', firstName: '太郎', lastName: '山田', isSelected: true, isAdmin: false}
    ]
  };
  memberList = this.mockData.list;

  constructor() {}

  ngOnInit() {
    this.memberList.forEach(function(member,i,array){
      if(member.isSelected){
        this.removeMemberList.push(member);
      }else{
        this.addMemberList.push(member);
      }
    }.bind(this));
  }

  memberListSearch(word:string,match:boolean[],members:string[]){
    if(word){
      let reg = new RegExp(word,'g');
      for(let i = 0; i < members.length; i++){
        let name = members[i];
        match[i] = (!name.match(reg));
      }
    }else{
      Object.keys(members).forEach(i => {
        match[i] = false;
      });
    }
  }

  addMemberListSearch(event:any){
    const word = this.addMemberListSearchVal;
    const match = this.addMemberListSearchMatch;
    const members = [];
    this.addMemberList.forEach(function(member,i,array){
      members.push(member.lastName + member.firstName);
    });
    this.memberListSearch(word,match,members);
  }

  removeMemberListSearch(event:any){
    const word = this.removeMemberListSearchVal;
    const match = this.removeMemberListSearchMatch;
    const members = [];
    this.removeMemberList.forEach(function(member,i,array){
      members.push(member.lastName + member.firstName);
    });
    this.memberListSearch(word,match,members);
  }

  addMemberAllSelect(event:any){
    this.addMemberList.forEach(function(member,i,array){
      this.addMemberSelect[i] = this.addMemberAllSelectVal;
    }.bind(this));
  }

  addMember(event:any){
    let newAddMemberList = [];
    this.addMemberList.forEach(function(member,i,array){
      if(this.addMemberSelect[i]){
        member.isSelected = true;
        this.removeMemberList.push(member);
      }else{
        member.isSelected = false;
        newAddMemberList.push(member);
      }
    }.bind(this));
    this.addMemberSelect = [];
    this.addMemberList = newAddMemberList;
    if(!this.addMemberList.length){
      this.addMemberAllSelectVal = false;
    }
  }

  removeMember(event:any){
    let newRemoveMemberList = [];
    this.removeMemberList.forEach(function(member,i,array){
      if(this.removeMemberSelect[i]){
        member.isAdmin = false;
        member.isSelected = false;
        this.addMemberList.push(member);
      }else{
        member.isSelected = true;
        newRemoveMemberList.push(member);
      }
    }.bind(this));
    this.removeMemberSelect = [];
    this.removeMemberList = newRemoveMemberList;
  }

  addMemberSelectClick(member:string, event:any, i:number){
    this.addMemberSelect[i] =! this.addMemberSelect[i];
  }

  removeMemberSelectClick(member:string, event:any, i:number){
    this.removeMemberSelect[i] =! this.removeMemberSelect[i];
  }

  isAdminChecked(member:string, event:any, i:number){
    this.removeMemberList[i].isAdmin =! this.removeMemberList[i].isAdmin;
  }

  saveMemberSelectClick(event:any){
    let saveMemberList = this.addMemberList.concat(this.removeMemberList);
    this.memberSelected.emit(saveMemberList);
  }

}