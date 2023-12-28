import {Component, OnInit, OnDestroy, NgZone} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Ch0003PageComponent} from '../ch0003-page/ch0003-page.component';
import {Helper} from '../../../common/helper';
import {ChatService} from '../../../services/chat.service';
import {WsService} from '../../../services/stomp/ws.service';
import {DialogResult} from '../../../models/dialog-param';
import {SharedValueService} from '../../../services/shared-value.service';
import {DialogService} from '../../../services/dialog.service';
import {Message} from '@stomp/stompjs';
import {FirRoom} from '../../../models/ch/firebase/fir.room';
import {CreateHospitalRoomSettings} from '../../../models/ch/create-hospital-room-settings';
import {AccountStatus} from '../../../models/ba/user-session';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-ch0004-page',
  templateUrl: './ch0004-page.component.html',
  styleUrls: ['./ch0004-page.component.scss']
})
export class Ch0004PageComponent implements OnInit, OnDestroy {
  public createModel = new CreateHospitalRoomSettings();
  roomId;
  userSession;
  roomName = '';
  deptId = '';
  ch0003;
  listMember = [];
  listUserCH = [];
  listDepartment = [];
  checkAllUser = false;
  listSavedMembers = [];
  requestId: string;
  messError = {roomName: '', member: ''};
  dataSubscription: Subscription;
  deletedMembersList = [];
  invalidMembers = [];

  constructor(private translate: TranslateService,
              private chatService: ChatService,
              private wsService: WsService,
              private dialogService: DialogService,
              private helper: Helper,
              private sharedValueService: SharedValueService,
              private activatedRoute: ActivatedRoute,
              private route: Router,
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
    this.activatedRoute.params.subscribe((params: Params) => {
      this.roomId = params['roomId'];
    });
    if (this.roomId) {
      this.chatService.getRoomInfo(this.userSession.officeUserId, this.roomId).subscribe((room: FirRoom) => {
        this.roomName = room.name;
        this.chatService.getCreateChatRoomInside().subscribe((settings: CreateHospitalRoomSettings) => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.createModel = settings;
          this.getInitData();
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

    this.onListen();
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

  getInitData() {
    this.listDepartment = this.helper.createArrayDepartment(this.listDepartment, this.createModel.departments, '', 1);
    this.listUserCH = this.helper.convertUserName(this.listUserCH, this.createModel.departmentUsers);
    this.listUserCH = this.listUserCH.filter(item => this.getValidUserStatus(item));
    this.listUserCH.sort(this.helper.orderByComparator('fullNameKana'));
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

  editSelectedAdmin(member) {
    if (member) {
      member.authority = member.authority === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    }
  }

  /**
   * select department
   * @param deptId
   */
  changeSelectedDepartment(deptId) {
    this.checkAllUser = false;
    const result = this.ch0003.getDepartmentUserInChatRoom(deptId, this.createModel.departmentUsers,
      this.createModel.departments, this.listMember);
    this.listUserCH = result.sort(this.helper.orderByComparator('fullNameKana'));
  }

  /**
   * select user from user list
   * @param user
   * @param index
   */
  editSelectedUser(user) {
    if (user) {
      user.isSelected = !user.isSelected;
    }
  }

  /**
   * select member form member list
   * @param user
   * @param index
   */
  editSelectedMember(member) {
    if (member) {
      member.isSelected = !member.isSelected;
    }
  }

  /**
   * @param checkAllUser
   */
  changeCheckAllUser(checkAllUser) {
    const result = this.ch0003.changeCheckAllCommon(checkAllUser, this.listUserCH);
    this.checkAllUser = result.checkAllUser;
    this.listUserCH = result.listUser;
  };

  /**
   * move users from user list to member list
   */
  editAddMember() {
    for (let i = 0; i < this.listUserCH.length; i++) {
      if (this.listUserCH[i].isSelected) {
        const index = this.deletedMembersList.findIndex(item => item.officeUserId === this.listUserCH[i].officeUserId);
        if (index > -1) {
          this.deletedMembersList.splice(index, 1);
        }
        this.listUserCH[i].isSelected = false;
        this.listMember.push(this.listUserCH[i]);
        this.listUserCH.splice(i, 1);
        i--;
      }
    }
    this.checkAllUser = false;
  }

  /**
   * remove member from memberList to user list
   */
  editRemoveMember() {
    for (let i = 0; i < this.listMember.length; i++) {
      if (this.listMember[i].isSelected) {
        this.listUserCH.push(this.listMember[i]);
        const index = this.deletedMembersList.findIndex(item => item.officeUserId === this.listMember[i].officeUserId);
        if (index < 0 && this.listMember[i].memberId !== '') {
          this.deletedMembersList.push(this.listMember[i]);
        }
        this.listMember[i].isSelected = false;
        this.listMember[i].authority = 'MEMBER';
        this.listMember.splice(i, 1);
        i--;
      }
    }
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

  /**
   * delete room chat
   */
  deleteRoomChat() {
    let html = '';
    this.translate.get('MSG.CH').subscribe((msg) => {
      html = '<div>' + msg.E003_1 + '</div><div>' + msg.E003_2 + '</div>';
    });
    this.dialogService.showMessage('warning', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
      (res: DialogResult) => {
        if (res.isOk()) {
          this.requestId = this.userSession.userId + Date.now();
          const data = {
            type: 'delete_room',
            user: this.userSession.officeUserId,
            request_id: this.requestId,
            room: this.roomId
          };
          this.wsService.onPublish('delete_room', data);
        }
      });
  }

  putEditRoomChat() {
    this.roomName = this.roomName.replace(/\s/g, '').length ? this.roomName : '';
    const resultCheckValidation = this.ch0003.checkValidate(this.listMember, this.roomName);
    this.messError.roomName = resultCheckValidation.messError.roomName;
    this.messError.member = resultCheckValidation.messError.member;
    if (resultCheckValidation.checkValid) {
      let html = '';
      this.translate.get('MSG.CH').subscribe(msg => {
        html = '<div>' + msg.E002_1 + '</div><div>' + msg.E002_2 + '</div>';
      });
      this.dialogService.showMessage('warning', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
        (res: DialogResult) => {
          if (res.isOk()) {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(true);
            });
            setTimeout(() => {
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
                  type: '0',
                  name: this.roomName,
                  members: members.concat(deletedMembers).concat(this.invalidMembers)
                }
              };
              this.wsService.onPublish('edit_room', data);
            }, 500);
          }
        });
    }
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
            // filter userList
            for (let m = 0; m < this.listSavedMembers.length; m++) {
              for (let n = 0; n < this.listUserCH.length; n++) {
                if (this.listSavedMembers[m].user === this.listUserCH[n].officeUserId) {
                  if (this.getValidUserStatus(this.listUserCH[n])) {
                    let mem = {};
                    mem = this.listUserCH[n];
                    mem['memberId'] = this.listSavedMembers[m].user;
                    mem['authority'] = this.listSavedMembers[m].role === 1 ? 'ADMIN' : 'MEMBER';
                    this.listMember.push(mem);
                    this.listUserCH.splice(n, 1);
                  } else {
                    this.invalidMembers.push({
                      user: this.listSavedMembers[m].officeUserId,
                      op: '1',
                      role: this.listSavedMembers[m].role
                    });
                  }
                }
              }
            }
            console.log('---------------------', this.listMember);
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
