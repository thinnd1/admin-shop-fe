import {Component, HostListener, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Helper} from '../../../common/helper';
import {ChatService} from '../../../services/chat.service';
import {WsService} from '../../../services/stomp/ws.service';
import {SharedValueService} from '../../../services/shared-value.service';
import {DialogResult} from '../../../models/dialog-param';
import {Router} from '@angular/router';
import {CreateHospitalRoomSettings} from '../../../models/ch/create-hospital-room-settings';
import {DialogService} from '../../../services/dialog.service';
import {Message} from '@stomp/stompjs';
import {AccountStatus} from '../../../models/ba/user-session';

@Component({
  selector: 'app-ch0003-page',
  templateUrl: './ch0003-page.component.html',
  styleUrls: ['./ch0003-page.component.scss'],
  preserveWhitespaces: false
})
export class Ch0003PageComponent implements OnInit {

  public model = new CreateHospitalRoomSettings();
  roomName = '';
  deptId = '';
  messError = {roomName: '', member: ''};
  listUser = [];
  listDepartment = [];
  checkAllUser = false;
  listMember = [];
  userSession;
  membersName = '';

  constructor(private translate: TranslateService,
              private chatService: ChatService,
              private wsService: WsService,
              private dialogService: DialogService,
              private helper: Helper,
              private sharedValueService: SharedValueService,
              private route: Router) {
    if (!this.wsService.isConnected()) {
      console.log('-------------INIT CONNECTION------------');
      this.wsService.initConnection();
    }
  }

  ngOnInit() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.userSession = this.sharedValueService.getUserSession();
    this.chatService.getCreateChatRoomInside().subscribe(
      (settings: CreateHospitalRoomSettings) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.model = settings;
        this.createForm();
      },
      error => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  createForm() {
    let users = [];
    this.listDepartment = this.helper.createArrayDepartment(this.listDepartment, this.model.departments, '', 1);
    users = this.helper.convertUserName(users, this.model.departmentUsers);
    this.listUser = users.filter(item => (item.officeUserId !== this.userSession.officeUserId) &&
      this.getValidUserStatus(item));
    this.listUser.sort(this.helper.orderByComparator('fullNameKana'));
    this.listMember = users.filter(u => u.officeUserId === this.userSession.officeUserId);
    this.listMember.forEach(item => {
      if (item.officeUserId === this.userSession.officeUserId) {
        item.authority = 'ADMIN';
        item.isSelected = false;
      }
    });
  }

  getValidUserStatus(user) {
    const accountStatus = new AccountStatus(user.accountStatus);
    return (accountStatus.isValid || accountStatus.isProvisional) && !accountStatus.isLocking;
  }

  /**
   * @param deptId
   * @param userInfoModel
   * @param departmentListModel
   * @param listMember
   * @returns {Array}
   */
  getDepartmentUserInChatRoom(deptId, userInfoModel, departmentListModel, listMember) {
    // get the department id list & its children id
    const departmentIdList = this.helper.getDepartmentIdList([], departmentListModel);
    let listUser: any[];
    let listConvertedUser = [];
    if (deptId === '') {
      listConvertedUser = this.helper.convertUserName(listConvertedUser, userInfoModel);
    } else {
      const deptIdList = departmentIdList.find(value => value.id === deptId);
      listUser = this.getUserList(userInfoModel, deptIdList);
      listConvertedUser = this.helper.convertUserName(listConvertedUser, listUser);
    }
    // filter selected users
    for (let i = 0; i < listMember.length; i++) {
      listConvertedUser = listConvertedUser.filter((item) => item.officeUserId !== listMember[i].officeUserId &&
        this.getValidUserStatus(item));
    }
    return listConvertedUser;
  }

  /**
   * Retrieving the userList of selected department and userList of its child departments
   * @param {any[]} listUser
   * @param departId
   */
  getUserList(listUser: any[], departId: any): any[] {
    let users = [];
    if (departId && listUser) {
      for (let i = 0; i < listUser.length; i++) {
        if (listUser[i].deptId === departId.id) {
          users.push(listUser[i]);
        }
      }
      if (departId.childIds.length > 0) {
        departId.childIds.forEach(child => {
          const arr = listUser.filter(user => user.deptId === child);
          users = users.concat(arr);
        });
      }
    }
    return this.helper.arrayUnique(users);
  }

  chChangeDepartment(dept) {
    this.checkAllUser = false;
    const result = this.getDepartmentUserInChatRoom(dept, this.model.departmentUsers, this.model.departments, this.listMember);
    this.listUser = result.sort(this.helper.orderByComparator('fullNameKana'));
  }

  selectedUser(user) {
    if (user) {
      user.isSelected = !user.isSelected;
    }
  }

  selectedMember(member) {
    if (member) {
      member.isSelected = !member.isSelected;
    }
  }

  /**
   * @param event
   * @param member
   */
  selectedAdmin(event, member) {
    if (member.officeUserId !== this.userSession.officeUserId) {
      member.authority = member.authority === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    } else {
      event.target.checked = true;
    }
  }

  changeCheckAllCommon(checkAllUser, listUser) {
    checkAllUser = !checkAllUser;
    for (let i = 0; i < listUser.length; i++) {
      listUser[i].isSelected = !!(checkAllUser && listUser[i].isShow);
    }
    return {
      checkAllUser: checkAllUser,
      listUser: listUser,
    };
  }

  changeCheckAll(checkAllUser) {
    const result = this.changeCheckAllCommon(checkAllUser, this.listUser);
    this.checkAllUser = result.checkAllUser;
    this.listUser = result.listUser;
  };

  addMember() {
    for (let i = 0; i < this.listUser.length; i++) {
      if (this.listUser[i].isSelected) {
        this.listUser[i].isSelected = false;
        this.listMember.push(this.listUser[i]);
        this.listUser.splice(i, 1);
        i--;
      }
    }
    this.checkAllUser = false;
  }

  removeMember() {
    for (let i = 0; i < this.listMember.length; i++) {
      if (this.listMember[i].isSelected && this.listMember[i].officeUserId !== this.userSession.officeUserId) {
        this.listMember[i].isSelected = false;
        this.listMember[i].authority = 'MEMBER';
        this.listUser.push(this.listMember[i]);
        this.listMember.splice(i, 1);
        i--;
      }
    }
  }

  checkValidate(listMember, roomName) {
    let noneSelectedAdmin = true;
    let checkValid = true;
    const messError = {roomName: '', member: ''};
    if (roomName && roomName.length > 20) {
      messError.roomName = this.translate.instant('VAL.ROOM_NAME_WRONG_FORMAT');
      checkValid = false;
    }
    if (listMember.length < 2) {
      messError.member = this.translate.instant('CH0005.VAL_MEMBERS');
      checkValid = false;
    } else {
      for (let i = 0; i < listMember.length; i++) {
        if (listMember[i].authority === 'ADMIN') {
          noneSelectedAdmin = false;
          break;
        }
      }
      if (noneSelectedAdmin) {
        checkValid = false;
        this.dialogService.showError('MSG.CH.E001');
      }
    }
    return {messError: messError, noneSelectedAdmin: noneSelectedAdmin, checkValid: checkValid};
  }

  postCreateRoomChat() {
    this.roomName = this.roomName.replace(/\s/g, '').length ? this.roomName : '';
    const resultCheckValidation = this.checkValidate(this.listMember, this.roomName);
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
        request_id: requestId,
        user: this.userSession.officeUserId,
        room: {
          type: '0',
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
            }
          );
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
  //     this.postCreateRoomChat();
  //   }
  // }
}
