import {Component, OnInit, OnDestroy, HostListener} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ChatService} from '../../../services/chat.service';
import {PrepareCreateOutsideRoomSetting} from '../../../models/ch/prepare-create-outside-room-settings';
import {Helper} from '../../../common/helper';
import {CreateOutsideRoomSetting} from '../../../models/ch/create-outside-room-settings';
import {HttpError} from '../../../common/error/http.error';
import {SharedValueService} from '../../../services/shared-value.service';
import {Router} from '@angular/router';
import {DialogService} from '../../../services/dialog.service';
import {WsService} from '../../../services/stomp/ws.service';
import {Message} from '@stomp/stompjs';
import {DialogResult} from '../../../models/dialog-param';
import {Ch0003PageComponent} from '../ch0003-page/ch0003-page.component';
import {AccountStatus} from '../../../models/ba/user-session';

@Component({
  selector: 'app-ch0005-page',
  templateUrl: './ch0005-page.component.html',
  styleUrls: ['./ch0005-page.component.scss'],
  preserveWhitespaces: false
})
export class Ch0005PageComponent implements OnInit, OnDestroy {

  model = new PrepareCreateOutsideRoomSetting();
  data = new CreateOutsideRoomSetting();
  suggestedList = [];
  invitedList = [];

  // list inside
  listInside = [];
  originalInsideList = [];
  listDepartment = [];
  // list outside
  listOutSide = [];
  listOffices = [];
  // list member
  listMember = [];
  checkAllUserInside = false;
  checkAllUserOutside = false;
  noneSelectedAdmin = false;
  invitedUsersList = [];

  messError = {roomName: '', member: '', mail: ''};
  userSession: any;
  ch0003;
  roomName = '';
  contentSearch = '';
  checkTab: string;

  constructor(private chatService: ChatService,
              private wsService: WsService,
              private translate: TranslateService,
              private dialogService: DialogService,
              public sharedValueService: SharedValueService,
              private route: Router,
              public helper: Helper) {
    this.ch0003 = new Ch0003PageComponent(this.translate,
      this.chatService,
      this.wsService,
      this.dialogService,
      this.helper,
      this.sharedValueService,
      this.route);
  }

  ngOnInit() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.userSession = this.sharedValueService.getUserSession();
    this.callApiInit();
  }

  ngOnDestroy() {
  }

  callApiInit() {
    this.chatService.getOutsideRoom().subscribe((settings: PrepareCreateOutsideRoomSetting) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.model = settings;
      this.listDepartment = this.helper.createArrayDepartment(this.listDepartment, this.model.departments, '', 1);
      this.listOffices = this.model.offices.filter(office => office.id !== this.userSession.officeId);
      const users = this.helper.convertUserNameGroupOutSide([], this.model.officeUsers);
      // inside list
      this.originalInsideList = this.model.officeUsers.filter(user => user.officeId === this.userSession.officeId);
      this.listInside = users.filter(u => (u.officeId === this.userSession.officeId && u.officeUserId !== this.userSession.officeUserId &&
        this.getValidUserStatus(u)));
      this.listInside.sort(this.helper.orderByComparator('fullNameKana'));
      // outside list
      this.listOutSide = users.filter(u => u.officeId !== this.userSession.officeId && this.getValidUserStatus(u));
      this.listOutSide.sort(this.helper.orderByComparator('fullNameKana'));
      // member list
      this.listMember = users.filter(u => u.officeUserId === this.userSession.officeUserId && this.getValidUserStatus(u));
      this.listMember.forEach(item => {
        if (item.officeUserId === this.userSession.officeUserId) {
          item.authority = 'ADMIN';
          item.isSelected = false;
        }
      });
      for (let j = 0; j < this.listOutSide.length; j++) {
        this.listOutSide[j].inviteFlg = this.userSession.officeId !== this.listOutSide[j].officeId;
      }
    }, (error: HttpError) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  getValidUserStatus(user) {
    const accountStatus = new AccountStatus(user.accountStatus);
    return (accountStatus.isValid || accountStatus.isProvisional) && !accountStatus.isLocking;
  }

  changeDepId(deptId) {
    this.checkAllUserInside = false;
    const result = this.ch0003.getDepartmentUserInChatRoom(deptId, this.originalInsideList, this.model.departments, this.listMember);
    this.listInside = result.sort(this.helper.orderByComparator('fullNameKana'));
    this.listInside.forEach(u => {
      u.inviteFlg = false;
      u.officeId = this.userSession.officeId;
    });
  }


  /**
   * @param value
   * @return outside list
   */
  changeOfficeId(value) {
    this.listOutSide = [];
    this.checkAllUserOutside = false;
    if (value === '') {
      for (let k = 0; k < this.model.officeUsers.length; k++) {
        if (this.model.officeUsers[k].officeId !== this.userSession.officeId) {
          this.listOutSide.push(this.model.officeUsers[k]);
        }
      }
    } else {
      for (let i = 0; i < this.model.officeUsers.length; i++) {
        if (this.model.officeUsers[i].officeId === value) {
          this.listOutSide.push(this.model.officeUsers[i]);
        }
      }
    }
    // filter users who have not been added to the member list
    this.listOutSide = this.listOutSide.filter((item) => this.listMember.findIndex(mem => mem.officeUserId === item.officeUserId) < 0);
    this.listOutSide = this.helper.convertUserNameGroupOutSide([], this.listOutSide);
    this.listOutSide.sort(this.helper.orderByComparator('fullNameKana'));
    if (value === '') {
      // add the list of invited users via mail to the display list
      if (this.invitedUsersList.length > 0) {
        for (let p = 0; p < this.invitedUsersList.length; p++) {
          if (this.listOutSide.findIndex(item => item.officeUserId === this.invitedUsersList[p].officeUserId) < 0 &&
            this.listMember.findIndex(mem => mem.officeUserId === this.invitedUsersList[p].officeUserId) < 0) {
            this.listOutSide.push(this.invitedUsersList[p]);
          }
        }
      }
    }
    for (let i = 0; i < this.listOutSide.length; i++) {
      this.listOutSide[i].inviteFlg = this.userSession.officeId !== this.listOutSide[i].officeId;
    }
  }

  selectedUser(user: any) {
    if (user) {
      user.isSelected = !user.isSelected;
    }
  }

  selectedMember(member: any) {
    if (member) {
      member.isSelected = !member.isSelected;
    }
  }

  /**
   * select all user in list inside or outside
   * @return lists user selected
   */
  changeCheckAll(checkAllUser, isOutside) {
    if (!isOutside) {
      const result = this.ch0003.changeCheckAllCommon(checkAllUser, this.listInside);
      this.checkAllUserInside = result.checkAllUser;
      this.listInside = result.listUser;
    } else if (isOutside) {
      const result = this.ch0003.changeCheckAllCommon(checkAllUser, this.listOutSide);
      this.checkAllUserOutside = result.checkAllUser;
      this.listOutSide = result.listUser;
    }
  };

  addMember(isOutside) {
    if (!isOutside) {
      for (let i = 0; i < this.listInside.length; i++) {
        if (this.listInside[i].isSelected) {
          this.listInside[i].isSelected = false;
          this.listMember.push(this.listInside[i]);
          this.listInside.splice(i, 1);
          i--;
        }
      }
      this.checkAllUserInside = false;
    } else if (isOutside) {
      for (let n = 0; n < this.listOutSide.length; n++) {
        if (this.listOutSide[n].isSelected) {
          this.listOutSide[n].isSelected = false;
          this.listMember.push(this.listOutSide[n]);
          this.listOutSide.splice(n, 1);
          n--;
        }
      }
      this.checkAllUserOutside = false;
    }
  }

  removeMember() {
    for (let i = 0; i < this.listMember.length; i++) {
      if (this.listMember[i].isSelected && this.listMember[i].officeUserId !== this.userSession.officeUserId) {
        this.listMember[i].isSelected = false;
        this.listMember[i].authority = 'MEMBER';
        if (!this.userSession.personalFlag) {
          if (this.listMember[i].inviteFlg) {
            this.listOutSide.push(this.listMember[i]);
          } else if (!this.listMember[i].inviteFlg) {
            this.listInside.push(this.listMember[i]);
          }
        } else {
          this.listOutSide.push(this.listMember[i]);
        }
        this.listMember.splice(i, 1);
        i--;
      }
    }
  }

  selectedRoomAdmin(event, member) {
    if (member.officeUserId !== this.userSession.officeUserId) {
      member.authority = member.authority === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    } else {
      event.target.checked = true;
    }
  }


  searchOfficeUser(event) {
    if (event.keyCode === 13) {
      this.checkContentSearch();
    }
  }

  onClickSearchOfficeUser(event) {
    this.checkContentSearch();
  }

  checkContentSearch() {
    this.messError.mail = '';
    this.suggestedList = [];
    if (this.contentSearch.trim() === '') {
      this.messError.mail = this.translate.instant('GR0006.PLACEHOLDER_MAIL_INPUT');
    } else {
      this.chatService.getUserFromMail(this.contentSearch).subscribe((officeUser: any) => {
        this.suggestedList = officeUser.outsideOfficeUsers;
      });
    }
  }

  /**
   * add to the list of invited users via mail
   * @return invitedList
   */
  addInvitedMail(user: any) {
    this.contentSearch = '';
    if (this.invitedList.findIndex(item => item.officeUserId === user.officeUserId) < 0) {
      this.invitedList.push(user);
    }
    this.suggestedList = [];
  }

  /**
   * remove user in invited users
   * @param user
   */
  removeDoctor(user: any) {
    if (user) {
      const index = this.invitedList.findIndex(item => item.officeUserId === user.officeUserId);
      if (index > -1) {
        this.invitedList.splice(index, 1);
      }
    }
  }

  /**
   * add users invited via mail to the group's member list
   */
  addInvitedMember() {
    let listInvitedUser = [];
    listInvitedUser = this.helper.convertUserNameGroupOutSide(listInvitedUser, this.invitedList);
    for (let i = 0; i < listInvitedUser.length; i++) {
      listInvitedUser[i].inviteFlg = true;
      const checkInMemberList = this.listMember.findIndex(item => item.officeUserId === listInvitedUser[i].officeUserId) > -1;
      const checkInTemporaryList = this.invitedUsersList.findIndex(item => item.officeUserId === listInvitedUser[i].officeUserId) > -1;
      const checkInListOutside = this.listOutSide.findIndex(item => item.officeUserId === listInvitedUser[i].officeUserId) > -1;
      if (!checkInMemberList && !checkInTemporaryList && !checkInListOutside) {
        this.listMember.push(listInvitedUser[i]);
        this.invitedUsersList.push(listInvitedUser[i]);
      }
    }
    this.contentSearch = '';
    this.invitedList = [];
    this.messError.mail = '';
  }

  resetSearchMail() {
    this.contentSearch = '';
    this.invitedList = [];
    this.suggestedList = [];
    this.messError.mail = '';
  }

  putCreateOutsideRoom() {
    this.roomName = this.roomName.replace(/\s/g, '').length ? this.roomName : '';
    const resultCheckValidation = this.ch0003.checkValidate(this.listMember, this.roomName);
    this.messError.roomName = resultCheckValidation.messError.roomName;
    this.messError.member = resultCheckValidation.messError.member;
    if (resultCheckValidation.checkValid) {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      const members = this.listMember.map(member => {
        return {
          user: member.officeUserId,
          role: member.authority === 'ADMIN' ? 1 : 0
        };
      });
      const requestId = this.userSession.userId + Date.now();
      const data = {
        type: 'create_room',
        user: this.userSession.officeUserId,
        request_id: requestId,
        room: {
          type: '1',
          name: this.roomName,
          members: members
        }
      };
      this.wsService.onPublish('create_room', data);
      this.wsService.messages.map((message: Message) => {
        return message.body;
      }).subscribe((msg_body: string) => {
        if (requestId === JSON.parse(msg_body).request_id) {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showMessage('success', false, null, 'MSG.CH.M001', null, 'MSG.YES', null).subscribe(
            (res: DialogResult) => {
              if (res.isOk()) {
                // redirect to ch0007
                this.route.navigate(['ch/ch0007', JSON.parse(msg_body).room.id]);
              }
            });
        }
      });
      this.wsService.errors.map((message: Message) => {
        return message.body;
      }).subscribe((msg_body: string) => {
        if (requestId === JSON.parse(msg_body).request_id) {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showError(JSON.parse(msg_body).error.msg);
        }
      });
    }
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     this.putCreateOutsideRoom();
  //   }
  // }
}
