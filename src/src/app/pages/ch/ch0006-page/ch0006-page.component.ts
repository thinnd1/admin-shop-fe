import {Component, OnInit, OnDestroy, NgZone} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ChatService} from '../../../services/chat.service';
import {Helper} from '../../../common/helper';
import {ActivatedRoute, Router} from '@angular/router';
import {CreateHospitalRoomSettingsSendApi} from '../../../models/ch/create-hospital-room-settings-send-api';
import {SharedValueService} from '../../../services/shared-value.service';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';
import {WsService} from '../../../services/stomp/ws.service';
import {Ch0003PageComponent} from '../ch0003-page/ch0003-page.component';
import {Message} from '@stomp/stompjs';
import {AccountStatus} from '../../../models/ba/user-session';
import {FirRoom} from '../../../models/ch/firebase/fir.room';
import {PrepareCreateOutsideRoomSetting} from '../../../models/ch/prepare-create-outside-room-settings';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-ch0006-page',
  templateUrl: './ch0006-page.component.html',
  styleUrls: ['./ch0006-page.component.scss']
})
export class Ch0006PageComponent implements OnInit, OnDestroy {

  model = new PrepareCreateOutsideRoomSetting();
  suggestedList = [];
  invitedList = [];
  roomId: string;

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
  listSavedMembers = [];
  requestId: string;
  users: any;
  dataSubscription: Subscription;
  deletedMembersList = [];
  invalidMembers = [];

  constructor(private chatService: ChatService,
              private wsService: WsService,
              private translate: TranslateService,
              private dialogService: DialogService,
              public helper: Helper,
              private route: Router,
              public sharedValueService: SharedValueService,
              public activatedRoute: ActivatedRoute,
              private ngZone: NgZone) {
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
    this.onListen();
    this.callApiInit();
  }

  private _unsubscription(subscription) {
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
    }
  }

  ngOnDestroy() {
    this._unsubscription(this.dataSubscription);
  }

  callApiInit() {
    this.activatedRoute.params.subscribe(params => {
      this.roomId = params['roomId'];
    });
    if (this.roomId) {
      this.chatService.getRoomInfo(this.userSession.officeUserId, this.roomId).subscribe((room: FirRoom) => {
        this.roomName = room.name;
        this.chatService.getEditRoomOutside().subscribe((settings: PrepareCreateOutsideRoomSetting) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.model = settings;
          this.getInit();
        }, (error) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showError('MSG.ERROR');
        });
      }, (error) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      });
    }
  }

  getInit() {
    this.listDepartment = this.helper.createArrayDepartment([], this.model.departments, '', 1);
    this.listOffices = this.model.offices.filter(office => office.id !== this.userSession.officeId);
    const users = this.helper.convertUserNameGroupOutSide([], this.model.officeUsers);
    this.users = this.changeIndexToOfficeUserId(users);
    // filter listInside & listOutside
    this.originalInsideList = this.model.officeUsers.filter(user => user.officeId === this.userSession.officeId);
    this.listInside = users.filter(u => (u.officeId === this.userSession.officeId && u.officeUserid !== this.userSession.officeUserId
      && this.getValidUserStatus(u)));
    this.listOutSide = users.filter(u => (u.officeId !== this.userSession.officeId) && this.getValidUserStatus(u));
    this.listInside.sort(this.helper.orderByComparator('fullNameKana'));
    this.listOutSide.sort(this.helper.orderByComparator('fullNameKana'));
    for (let j = 0; j < this.listOutSide.length; j++) {
      this.listOutSide[j].inviteFlg = this.listOutSide[j].officeId !== this.userSession.officeId;
    }
    this._unsubscription(this.dataSubscription);
    this.ngZone.runOutsideAngular(() => {
      this.dataSubscription = Observable.timer(0, 1000)
        .subscribe((i) => {
          if (this.wsService.isConnected()) {
            this.onListMembers();
            this.dataSubscription.unsubscribe();
          }
        });
    });
  }

  getValidUserStatus(user) {
    const accountStatus = new AccountStatus(user.accountStatus);
    return (accountStatus.isValid || accountStatus.isProvisional) && !accountStatus.isLocking;
  }

  changeIndexToOfficeUserId(array) {
    const userObj = {};
    array.map((item) => {
      userObj[item.officeUserId] = item;
    });
    return userObj;
  }

  onListMembers() {
    this.requestId = this.userSession.userId + Date.now();
    const data = {
      type: 'list_member',
      request_id: this.requestId,
      room: this.roomId,
      user: this.userSession.officeUserId
    };
    this.dialogService.setLoaderVisible(true);
    this.wsService.onPublish('list_member', data);
  }

  changeDeptId(deptId) {
    this.checkAllUserInside = false;
    const result = this.ch0003.getDepartmentUserInChatRoom(deptId, this.originalInsideList,
      this.model.departments, this.listMember);
    this.listInside = result.listUser.sort(this.helper.orderByComparator('fullNameKana'));
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
      for (let m = 0; m < this.model.officeUsers.length; m++) {
        if (this.model.officeUsers[m].officeId !== this.userSession.officeId &&
          this.listOutSide.findIndex(item => item.officeUserId === this.model.officeUsers[m].officeUserId) < 0) {
          this.listOutSide.push(this.model.officeUsers[m]);
        }
      }
    } else {
      for (let i = 0; i < this.model.officeUsers.length; i++) {
        if (this.model.officeUsers[i].officeId === value &&
          this.listOutSide.findIndex(item => item.officeUserId === this.model.officeUsers[i].officeUserId) < 0) {
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
      for (let j = 0; j < this.listInside.length; j++) {
        if (this.listInside[j].isSelected) {
          this.listInside[j].isSelected = false;
          const index = this.deletedMembersList.findIndex(item => item.officeUserId === this.listInside[j].officeUserId);
          if (index > -1) {
            this.deletedMembersList.splice(index, 1);
          }
          this.listMember.push(this.listInside[j]);
          this.listInside.splice(j, 1);
          j--;
        }
      }
      this.checkAllUserInside = false;
    } else if (isOutside) {
      for (let j = 0; j < this.listOutSide.length; j++) {
        if (this.listOutSide[j].isSelected) {
          this.listOutSide[j].isSelected = false;
          const index = this.deletedMembersList.findIndex(item => item.officeUserId === this.listOutSide[j].officeUserId);
          if (index > -1) {
            this.deletedMembersList.splice(index, 1);
          }
          this.listMember.push(this.listOutSide[j]);
          this.listOutSide.splice(j, 1);
          j--;
        }
      }
      this.checkAllUserOutside = false;
    }
  }

  removeMember() {
    for (let j = 0; j < this.listMember.length; j++) {
      if (this.listMember[j].isSelected) {
        this.listMember[j].isSelected = false;
        this.listMember[j].authority = 'MEMBER';
        const index = this.deletedMembersList.findIndex(item => item.officeUserId === this.listMember[j].officeUserId);
        if (index < 0 && this.listMember[j].memberId !== '') {
          this.deletedMembersList.push(this.listMember[j]);
        }
        if (this.userSession.personalFlag) {
          this.listOutSide.push(this.listMember[j]);
        } else {
          if (this.listMember[j].officeId !== this.userSession.officeId) {
            this.listOutSide.push(this.listMember[j]);
          } else if (this.listMember[j].officeId === this.userSession.officeId) {
            this.listInside.push(this.listMember[j]);
          }
        }
        this.listMember.splice(j, 1);
        j--;
      }
    }
  }

  selectedRoomAdmin(member) {
    if (member) {
      member.authority = member.authority === 'ADMIN' ? 'MEMBER' : 'ADMIN';
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
    if (this.invitedList.findIndex(item => item.officeUserId === user.officeUserId) < 0) {
      this.invitedList.push(user);
    }
    this.contentSearch = '';
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

  putEditOutsideRoom() {
    this.roomName = this.roomName.replace(/\s/g, '').length ? this.roomName : '';
    const resultCheckValidation = this.ch0003.checkValidate(this.listMember, this.roomName);
    this.messError.roomName = resultCheckValidation.messError.roomName;
    this.messError.member = resultCheckValidation.messError.member;
    let html = '';
    this.translate.get('MSG.CH').subscribe((res) => {
      html = '<p>' + res.E002_1 + '</p>' + res.E002_2;
    });
    if (resultCheckValidation.checkValid) {
      const dataSend = new CreateHospitalRoomSettingsSendApi();
      dataSend.roomName = this.roomName;
      dataSend.id = this.roomId;
      const userLoginIsMember = this.listMember.findIndex(user => user.officeUserId === this.userSession.officeUserId) > -1;
      this.dialogService.showMessage('warning', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
        (res: DialogResult) => {
          setTimeout(() => {
            if (res.isOk()) {
              const members = this.listMember.map(member => {
                return {
                  user: member.officeUserId,
                  op: member.memberId ? '2' : '0',
                  role: member.authority === 'ADMIN' ? 1 : 0
                };
              });
              const deletedMembers = this.deletedMembersList.map(member => {
                return {
                  user: member.officeUserId,
                  op: '1',
                  role: 0
                };
              });
              this.requestId = this.userSession.userId + Date.now();
              const data = {
                type: 'edit_room',
                user: this.userSession.officeUserId,
                request_id: this.requestId,
                room: {
                  id: this.roomId,
                  type: '1',
                  name: this.roomName,
                  members: members.concat(deletedMembers).concat(this.invalidMembers)
                }
              };
              this.wsService.onPublish('edit_room', data);
            }
          }, 400);
        }
      );
    }
  }

  putDeleteOutsideRoom() {
    let html = '';
    this.translate.get('MSG.CH').subscribe((res) => {
      html = '<p>' + res.E003_1 + '</p>' + res.E003_2;
    });
    this.dialogService.showMessage('warning', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
      (res: DialogResult) => {
        setTimeout(() => {
          if (res.isOk()) {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(true);
            });
            this.requestId = this.userSession.userId + Date.now();
            const data = {
              type: 'delete_room',
              user: this.userSession.officeUserId,
              request_id: this.requestId,
              room: this.roomId
            };
            this.wsService.onPublish('delete_room', data);
          }
        }, 400);
      }
    );
  }

  onListen() {
    this.wsService.messages.map((message: Message) => {
      return message.body;
    }).subscribe((msg_body: string) => {
      const json = JSON.parse(msg_body);
      if (this.requestId === json.request_id) {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        switch (json.type) {
          case 'member_listed':
            this.listSavedMembers = json.members.filter((item) => item.join_status !== 1);
            // filter users who have not been added to the member list
            for (let j = 0; j < this.listSavedMembers.length; j++) {
              this.listInside = this.listInside.filter((item) => item.officeUserId !== this.listSavedMembers[j].user);
              this.listOutSide = this.listOutSide.filter((item) => item.officeUserId !== this.listSavedMembers[j].user);
            }
            // filter userList
            for (let m = 0; m < this.listSavedMembers.length; m++) {
              /*for (let n = 0; n < this.users.length; n++) {
                if (this.listSavedMembers[m].user === this.users[n].officeUserId) {*/
              const accStatus = new AccountStatus(this.listSavedMembers[m].account_status);
              if ((accStatus.isValid || accStatus.isProvisional) && !accStatus.isLocking) {
                const mem = {};
                mem['accountStatus'] = this.listSavedMembers[m].account_status;
                mem['officeUserId'] = this.listSavedMembers[m].user;
                mem['officeId'] = this.listSavedMembers[m].office_id;
                mem['deptId'] = this.listSavedMembers[m].department_id;
                mem['fullName'] = this.listSavedMembers[m].last_name + '　' + this.listSavedMembers[m].first_name;
                mem['fullNameKana'] = this.users[mem['officeUserId']] ? this.users[mem['officeUserId']].fullNameKana : '';
                mem['officeName'] = this.listSavedMembers[m].office ?
                  ((this.listSavedMembers[m].office.length > 20) ?
                    (this.listSavedMembers[m].office.substr(0, 20) + '...') : this.listSavedMembers[m].office) : '';
                mem['inviteFlg'] = !this.listSavedMembers[m].joined;
                mem['imageUrl'] = 'img/staff/face/' + this.listSavedMembers[m].office_id + '/' + this.listSavedMembers[m].user;
                mem['isShow'] = true;
                mem['isSelected'] = false;
                mem['memberId'] = this.listSavedMembers[m].user;
                mem['authority'] = this.listSavedMembers[m].role === 1 ? 'ADMIN' : 'MEMBER';
                this.listMember.push(mem);
              } else {
                this.invalidMembers.push({
                  user: this.listSavedMembers[m].officeUserId,
                  op: '1',
                  role: this.listSavedMembers[m].role
                });
              }
            }
            break;
          case 'room_deleted':
            this.dialogService.showMessage('success', false, null, 'MSG.CH.E004', null, 'MSG.YES', null).subscribe(
              (result: DialogResult) => {
                if (result.isOk()) {
                  // redirect to ch0007
                  this.route.navigate(['/']);
                }
              });
            break;
          case 'room_edited':
            this.dialogService.showMessage('success', false, null, 'MSG.CH.M002', null, 'MSG.YES', null).subscribe(
              (result: DialogResult) => {
                if (result.isOk()) {
                  // redirect to ch0007
                  this.route.navigate(['ch/ch0007', JSON.parse(msg_body).room.id]);
                }
              });
            break;
        }
      }
    });
    this.wsService.errors.map((message: Message) => {
      return message.body;
    }).subscribe((msg_body: string) => {
      if (this.requestId === JSON.parse(msg_body).request_id) {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError(JSON.parse(msg_body).error.msg);
      }
    });
  }

}
