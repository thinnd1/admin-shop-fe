import {Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, NgZone} from '@angular/core';
import {DialogService} from '../../../services/dialog.service';
import {FileUploader} from 'ng2-file-upload';
import {DialogResult} from '../../../models/dialog-param';
import {FormatSizeConverter} from '../../../common/converter/format.size.converter';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';
import {Observable} from 'rxjs/Observable';
import {Message} from '@stomp/stompjs';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {SharedValueService} from '../../../services/shared-value.service';
import {MessageSettings} from '../../../models/ch/message-settings';
import {MessageType} from '../../../models/ch/message.type';
import {Helper} from '../../../common/helper';
import {TranslateService} from '@ngx-translate/core';
import {AccountStatus} from '../../../models/ba/user-session';
import {FirRoom, RoomType} from '../../../models/ch/firebase/fir.room';
import {ChatService} from '../../../services/chat.service';
import {WsService} from '../../../services/stomp/ws.service';
import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to';
import {FirStampCategory} from '../../../models/ch/firebase/fir.stamp.category';
import {Subscription} from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';
import {Title} from '@angular/platform-browser';
import {GroupService} from '../../../services/group.service';
import {DetailMrUser} from '../../../models/re/detail-mr-user';
import {RegistrationService} from '../../../services/registration.service';
import {Product} from '../../../common/profile';
import {environment} from '../../../../environments/environment';
import {RestrictUser} from '../../../models/ch/restrict-user';
import * as loadImage from 'blueimp-load-image';
declare const moment: any;
declare const $: any;

const URL = 'apiUrl';
const MAX_SIZE = 128 * 1024 * 1024;
// display size
const IMG_MAX_WIDTH = 130;
const IMG_MAX_HEIGHT = 260;
// thumbnail image/video
const MAX_WIDTH = 500;
const MAX_HEIGHT = 500;

@Component({
  selector: 'app-ch0007',
  templateUrl: './ch0007-page.component.html',
  styleUrls: ['./ch0007-page.component.scss']
})
export class Ch0007PageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('typingSpace') typingSpace: ElementRef;

  public roomId;
  public messageId = '';
  public roomType;
  public listMessages;
  public listMembers;
  public userSession;
  public allowNotify: boolean;
  public sound: number;
  public notJoined: boolean;
  public roomName = '';
  public uploader: FileUploader = new FileUploader({url: URL});
  public messageSetting = new MessageSettings();
  public listDates: string[];
  public requestIds: string[];
  public typingUsers: any[];
  public sentTypingMessage: boolean;
  public countAdmins: number;
  public countMembers: number;
  public currentMember: string;
  public listFilePreview: any[];
  public firstUnseenMessage: string;
  public oldestPage: any[];
  public up = false;
  public listStampsCategories: FirStampCategory[];
  listUnseenMessages: any[];
  listSeenMessages: any[];
  public openStamp = false;
  isAdmin: boolean;
  public newestMessage: any;
  public timer;
  public isMaxScrollPos: boolean;
  public checkMaxScrollPosSubscription: Subscription;
  public heightSubscription: Subscription;
  public scrollToSubscription: Subscription;
  changedText: Subject<string> = new Subject<string>();
  sendMessageDebounce: any;
  public latestMessage: any;
  public dataSubscription: Subscription;
  public checkSeenSubscription: Subscription;
  public progressbar = 0;
  public requestAnimationId: any;
  public publishMarkMessageSubscription: Subscription;
  isLoaded = false;
  isActive = true;
  isPrApp = false;
  inactiveMessage: string;
  isDrCustomerRoom: boolean;
  attachmentId: string;
  scrollDone =  false;
  options = {
    canvas: true,
    pixelRatio: window.devicePixelRatio,
    downsamplingRatio: 0.6,
    orientation: true,
    maxWidth: 500,
    maxHeight: 500
  };
  public removeAttachmentSubscription: Subscription;

  constructor(private formatSize: FormatSizeConverter,
              private dialogService: DialogService,
              private translate: TranslateService,
              private helper: Helper,
              private fireBaseStorage: FirebaseStorage,
              private activatedRoute: ActivatedRoute,
              private sharedValueService: SharedValueService,
              private route: Router,
              private chatService: ChatService,
              private wsService: WsService,
              private _scrollToService: ScrollToService,
              private _elementRef: ElementRef,
              private ngZone: NgZone,
              private titleService: Title,
              private groupService: GroupService,
              private registrationService: RegistrationService
              ) {
    if (!this.wsService.isConnected()) {
      this.wsService.initConnection();
    }
  }

  ngOnInit() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.userSession = this.sharedValueService.getUserSession();
    this.onListen();
    this.getListStampCategories();
    this.isPrApp = environment.app === Product.Prjoy;
    this.activatedRoute.params.subscribe((params: Params) => {
      this.roomId = params['roomId'];
      if ( params['messageId'] ) {
        this.messageId = params['messageId'];
      }
      this.reInit();
      this.chatService.getRoomInfo(this.userSession.officeUserId, this.roomId).subscribe(( room: FirRoom) => {
        if (room) {
          this.roomName = room.displayName;
          this.roomType = room.type;
          this.titleService.setTitle(this.roomName);
          this._unsubscription(this.dataSubscription);
          this.ngZone.runOutsideAngular(() => {
            this.dataSubscription = Observable.timer(0, 1000)
              .subscribe((i) => {
                if (this.wsService.isConnected()) {
                  this.onListMembers();
                  this.onGetNotify();
                  this.onGetTmpText();
                  this.dataSubscription.unsubscribe();
                }
              });
          });
        } else {
          // The specified room could not be found
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showError('MSG.ERROR').subscribe((res: DialogResult) => {
            if (res.isOk()) {
              this.route.navigate(['/']);
            }
          });
        }
      }, (error) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      });
    });
    this.sendTemporaryTextAndTypingMessage();
    this.sendMessageDebounce = this.helper.debounce(this.onSendMessage, 300, true);
  }

  private _unsubscription(subscription) {
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
    }
  }

  ngOnDestroy() {
    this._unsubscription(this.checkMaxScrollPosSubscription);
    this._unsubscription(this.heightSubscription);
    this._unsubscription(this.dataSubscription);
    this._unsubscription(this.checkSeenSubscription);
    this._unsubscription(this.publishMarkMessageSubscription);
    this._unsubscription(this.removeAttachmentSubscription);
  }

  ngAfterViewInit() {
    this._unsubscription(this.heightSubscription);
    this.ngZone.runOutsideAngular(() => {
      this.heightSubscription = Observable.timer(0, 100)
        .subscribe(i => {
          if ($('.infinite-scroll') && $('.infinite-scroll').offset()) {
            const offset_chat = $('.infinite-scroll').offset().top;
            const h_chatFt = $('.chat-fotter').height();
            const h_window = $(window).height();
            $('#infinite-scroll').css('height', h_window - (offset_chat + h_chatFt + 5));
          }
        });
    });

    if (this.typingSpace) {
      Observable.fromEvent(
        this.typingSpace.nativeElement, 'input')
        .map((event: Event) => (<HTMLInputElement>event.target).value)
        .debounceTime(3000)
        .distinctUntilChanged()
        .subscribe(data => {
          if (this.sentTypingMessage) {
            this.onTypingMessage(false);
            this.sentTypingMessage = false;
          }
        });
    }
    this.checkDisplayNewMess();

    this.removeAttachmentSubscription = this.sharedValueService.getRemoveAttachment().subscribe( (fileId) => {
      if (fileId && fileId !== this.attachmentId) {
        this.attachmentId = fileId;
        this.onDeleteAttachment(fileId);
      }
    });
  }

  // Check the display conditions for new message notifications
  checkDisplayNewMess() {
    this._unsubscription(this.checkMaxScrollPosSubscription);
    let timer = 0;
    const $chatContentElement = $('#infinite-scroll');
    this.ngZone.runOutsideAngular(() => {
      this.checkMaxScrollPosSubscription = Observable.timer(0, 200).subscribe(i => {
        const charContentHeight = $chatContentElement.height();
        const charContentScrollTop = $chatContentElement.scrollTop();
        if (charContentScrollTop === 0) {
          timer++;
          if (timer > 4) {
            this.onScrollUp();
            timer = 0;
          }
        }
        const scrollPosition = charContentHeight + charContentScrollTop;
        if (this.listMessages.length > 0) {
          const lastElement = this.listMessages[this.listMessages.length - 1];
          const el = this._elementRef.nativeElement.querySelector('#' + lastElement.id);
          if (el && $(el).position()) {
            // If 50% of the content of the last message displayed in the viewport => notification of new message not showing on screen
            const lastElementPosition = $(el).height() * 50 / 100 + $(el).position().top;
            this.isMaxScrollPos = lastElementPosition <= scrollPosition;
            if (this.isMaxScrollPos) {
              this.newestMessage = null;
            }
          }
        }
      });
    });
  }

  checkReadEvent() {
    this._unsubscription(this.publishMarkMessageSubscription);
    this._unsubscription(this.checkSeenSubscription);
    const chatContentElement = this._elementRef.nativeElement.querySelector('#infinite-scroll');
    this.ngZone.runOutsideAngular(() => {
      if (!document.hidden && navigator.onLine) {
        this.checkSeenSubscription = Observable.timer(0, 200).subscribe(event => {
          const viewportTop = $(chatContentElement).scrollTop();
          const viewportBottom = viewportTop + $(chatContentElement).height();
          if (this.listUnseenMessages.length > 0) {
            for (let i = 0; i < this.listUnseenMessages.length; i++) {
              if (this.listSeenMessages.findIndex(item => item.id === this.listUnseenMessages[i].id) < 0) {
                const element = $('#' + this.listUnseenMessages[i].id);
                if (element) {
                  if (this.isInsideScrolledContainer(element, this.listUnseenMessages[i].inView,
                      {viewportTop: viewportTop, viewportBottom: viewportBottom})) {
                    let count = i;
                    while (count >= 0) {
                      if (this.listSeenMessages.findIndex(item => item.id === this.listUnseenMessages[count].id) < 0) {
                        this.listSeenMessages.push({id: this.listUnseenMessages[count].id});
                      }
                      count--;
                    }
                  }
                }
              }
            }
          }
        });

        this.publishMarkMessageSubscription = Observable.timer(0, 3000).subscribe(i => {
          if (this.listSeenMessages.length > 0) {
            this.onMarkMessage(this.listSeenMessages);
          }
        });
      }
    });
  }

  // check if an element inside a scrolled container
  isInsideScrolledContainer(element, elementData, viewportData) {
    if (element && element.position()) {
      const elementTop = element.position().top;
      const elementBottom = elementTop + element.outerHeight();
      if (elementTop >= viewportData.viewportTop) {
        elementData.topInView = true;
      }
      if (elementBottom <= viewportData.viewportBottom) {
        elementData.bottomInView = true;
      }
      return elementData.topInView && elementData.bottomInView;
    }

  }

  public reInit() {
    this.listMessages = [];
    this.listDates = [];
    this.typingUsers = [];
    this.sentTypingMessage = false;
    this.countAdmins = 0;
    this.countMembers = 0;
    this.listFilePreview = [];
    this.firstUnseenMessage = '';
    this.oldestPage = [];
    this.listUnseenMessages = [];
    this.isAdmin = false;
    this.requestIds = [];
    this.messageSetting = new MessageSettings();
    this.currentMember = '';
    this.listSeenMessages = [];
    this.sentTypingMessage = false;
    this.newestMessage = null;
    this.helper.setScrollTop();
    this.isActive = true;
    this.inactiveMessage = '';
    this.isDrCustomerRoom = false;
    this.attachmentId = '';
    this.scrollDone = false;
  }

  changeMessageText(text: string) {
    this.changedText.next(text);
  }

  public onListen() {
    // Stream of messages
    this.wsService.messages.map((message: Message) => {
      return message.body;
    }).subscribe((msg_body: string) => {
      const json = JSON.parse(msg_body);
      const i = this.requestIds.indexOf(json.request_id);
      // restrict to check room id temporary
      if (i > -1) {
        switch (json.type) {
          case 'message_marked':
            this.listSeenMessages = [];
            this.listMessages = this.listMessages.map((message) => {
              json.marked.every((mark) => {
                if (mark.id === message.id) {
                  const index = this.listUnseenMessages.findIndex(item => item.id === mark.id);
                  if (index > -1) {
                    this.listUnseenMessages.splice(index, 1);
                  }
                  message.seen_cnt = mark.seen_cnt;
                  return false;
                }
                return true;
              });
              return message;
            });
            /*if (this.listUnseenMessages.length === 0) {
              this._unsubscription(this.publishMarkMessageSubscription);
              this._unsubscription(this.checkSeenSubscription);
            }*/
            break;
          case 'notify_edited':
            this.allowNotify = json.notify.allow;
            this.sound = json.notify.sound;
            break;
          case 'attachment_listed':
            this.showAttachedFilesPopup(json.attachments);
            break;
          case 'room_deleted':
            this.dialogService.showMessage('success', false, null, 'MSG.GR.M003',
              null, 'MSG.OK', null).subscribe((res: DialogResult) => {
              if (res.isOk()) {
                this.route.navigate(['/']);
              }
            });
            break;
          case 'attachment_deleted':
            if (json.message) {
              this.removeAttachmentMessageAfterDeleting(json.message);
            }
            this.onListAttachment();
            break;
          default:
            break;
        }
      } else if (json.type === 'message_marked' && this.roomId === json.room) {
        this.listMessages = this.listMessages.map( (message) => {
          json.marked.every((mark) => {
            if (mark.id === message.id) {
              message.seen_cnt = mark.seen_cnt;
              return false;
            }
            return true;
          });
          return message;
        });
      }

      if (this.roomId === json.room || (json.room && json.room.id && this.roomId === json.room.id)) {

        if (json.type === 'message_sent') {
          if (!this.notJoined) {
            const newMessage = this.buildMessage(json.event, false);
            json.event.newOwnMessage = json.event.user === this.userSession.officeUserId;
            if (json.event.user === this.userSession.officeUserId) {
              if (json.event.type === 0) {
                this.messageSetting.text = '';
              }
              if (this.listUnseenMessages.length > 0) {
                this.listSeenMessages = this.listUnseenMessages.map( (mes) => {
                  return {id: mes.id};
                });
                this.onMarkMessage(this.listSeenMessages);
              }
            }
            this.listMessages.push(newMessage);
            if (json.event.newOwnMessage) {
              this.scrollToElementBottom(newMessage);
            } else {
              this.displayNewestMessage(newMessage);
            }
            console.log('------------------------', newMessage);
          }
          const index = this.requestIds.indexOf(json.request_id);
          this.requestIds.splice(index, 1);
        } else if (json.type === 'user_typing') {
          if (json.user !== this.userSession.officeUserId) {
            const userObj = this.listMembers.find(m => {
              if (m.user === json.user) {
                return m;
              }
            });
            const index = this.typingUsers.findIndex(item => item.user === userObj.user);
            if (json.typing) {
              if (index === -1) {
                this.typingUsers.splice(0, 0, userObj);
                setTimeout(() => {
                  if (this.typingUsers.length > 5) {
                    this.typingUsers.splice(5, this.typingUsers.length - 5);
                  }
                }, 100);
              }
            } else {
              if (index > -1) {
                this.typingUsers.splice(index, 1);
              }
            }
          }
        } else if (json.type === 'starred') {
          if (json.user === this.userSession.officeUserId) {
            this.listMessages.map(m => {
              if (m.id === json.event) {
                m.starred = json.starred;
              }
              return m;
            });
          }
        } else if (i > -1) {
          switch (json.type) {
            case 'member_listed':
              this.isLoaded = true;
              this.countMembers = json.members.length;
              let count = 0;
              let inactiveCount = 0;
              let drOfficeUser: any;
              let mrOfficeUser: any;
              this.listMembers = json.members.map(mem => {
                const accStatus = new AccountStatus(mem.account_status);
                mem.accStatus = accStatus;
                if (accStatus.isInvalid || accStatus.isLocking || mem.join_status === 1 || mem.join_status === 2) {
                  count++;
                } else {
                  if (mem.role === 1) {
                    if (mem.user === this.userSession.officeUserId) {
                      this.isAdmin = true;
                    }
                    this.countAdmins++;
                  }
                }
                if (accStatus.isInvalid || accStatus.isLocking) {
                  inactiveCount++;
                }
                if (mem.user === this.userSession.officeUserId) {
                  this.notJoined = !mem.joined;
                }

                if (this.roomType === RoomType.Customer) {
                  if (!mem.is_mediator) {
                    if (environment.app === Product.Drjoy) {
                      if (this.userSession.officeId === mem.office_id) {
                        this.isDrCustomerRoom = true;
                        drOfficeUser = mem;
                      } else {
                        mrOfficeUser = mem;
                      }
                    } else {
                      if (this.userSession.officeUserId === mem.user) {
                        mrOfficeUser = mem;
                      } else {
                        drOfficeUser = mem;
                      }
                    }
                  }
                }
                return {
                  id: mem.user,
                  user: mem.user,
                  fullName: accStatus.isInvalid ? 'アカウント削除' : mem.last_name + ' ' + mem.first_name,
                  officeName: mem.office,
                  deptId: mem.department_id,
                  deptName: mem.department,
                  imageUrl: accStatus.isInvalid ? '/assets/img/deleted_account.png' : 'img/staff/face/' + mem.office_id + '/' + mem.user,
                  accountStatus: mem.account_status,
                  isAdmin: mem.role === 1 && this.roomType !== RoomType.Customer,
                  isLocking: accStatus.isLocking,
                  isValid: accStatus.isValid,
                  invalid: accStatus.isInvalid,
                  officeId: mem.office_id,
                  role: mem.role,
                  joined: mem.joined,
                  isMediator: mem.is_mediator,
                  isBlocked: false,
                  isRestricted: false,
                  joinStatus: mem.join_status
                };
              });
              if (this.roomType === RoomType.Customer) {
                if (drOfficeUser && mrOfficeUser) {
                  this.chatService.getRestrictedStatus(drOfficeUser.user, mrOfficeUser.user).subscribe(( status: RestrictUser) => {
                    if (mrOfficeUser.accStatus.isInvalid
                      || drOfficeUser.accStatus.isInvalid
                      || mrOfficeUser.accStatus.isLocking
                      || drOfficeUser.accStatus.isLocking
                      || status.block
                      || status.restrictedHospital
                      || mrOfficeUser.join_status === 1) {
                      if (this.isActive) {
                        this.isActive = false;
                      }
                      this.inactiveMessage = 'メッセージを送信できません。詳細はメンバー一覧を御覧ください';
                    }
                    if (status.block || status.restrictedHospital) {
                      this.listMembers = this.listMembers.map( (mem) => {
                        if (mem.user === mrOfficeUser.user) {
                          mem.isBlocked = status.block;
                          mem.isRestricted = status.restrictedHospital;
                        }
                        return mem;
                      });
                    }
                  }, (error) => {
                    console.log(error.toString());
                    // this.dialogService.showError('MSG.ERROR');
                  });

                  if (mrOfficeUser.accStatus.isInvalid || drOfficeUser.accStatus.isInvalid) {
                    if (this.isActive) {
                      this.isActive = false;
                    }
                    this.inactiveMessage = 'メッセージを送信できません。詳細はメンバー一覧を御覧ください';
                  }
                }
              }
              if (this.notJoined) {
                this.onListMessages(null, 1, 0);
              } else {
                if (this.messageId) {
                  this.onListMessages(this.messageId, 10, 1);
                } else {
                  this.onListMessages(null, 10, 1);
                }
              }
              if (this.isActive) {
                this.isActive = ++count !== this.countMembers;
              }
              if (++inactiveCount === this.countMembers && this.roomType !== RoomType.Customer) {
                this.inactiveMessage = 'こちらのアカウントは削除されています。メッセージの操作は出来ません。';
              }
              break;
            case 'room_joined':
              if (!json.is_join) {
                this.route.navigate(['/']);
              } else {
                this.reInit();
                this.onListMembers();
              }
              break;
            case 'unread_refreshed':
              break;
            /*case 'starred':
              this.listMessages.map(m => {
                if (m.id === json.event) {
                  m.starred = json.starred;
                }
                return m;
              });
              break;*/
            case 'message_id_listed':
              json.messages.map((message) => {
                this.onGetMessage(message.id);
              });
              break;
            /*case 'message_marked':
              this.listMessages = this.listMessages.map( (message) => {
                json.marked.every((mark) => {
                  if (mark.id === message.id) {
                    const index = this.listUnseenMessages.indexOf({id: mark.id});
                    if (index) {
                      this.listUnseenMessages.splice(index, 1);
                    }
                    message.seen_cnt = mark.seen_cnt;
                    return false;
                  }
                  return true;
                });
                return message;
              });
              break;*/
            case 'message_listed':
              this.oldestPage = json.messages;
              if (json.messages.length > 0) {
                this.listDates = [];
                json.messages = json.messages.filter(mes => !mes.deleted);
                this.listMessages = this.listMessages.concat(json.messages);
                if (!this.notJoined) {
                  this.listMessages.sort(function (a, b) {
                    return (a.ts > b.ts) ? 1 : ((b.ts > a.ts) ? -1 : 0);
                  });
                  if (!this.scrollDone) {
                    if (this.messageId) {
                      const index = this.listMessages.findIndex(item => item.id === this.messageId);
                      const paging = 100;
                      if (this.oldestPage.length < paging && index > -1) {
                        setTimeout(() => {
                          this.triggerScrollTo(this.messageId);
                        }, 500);
                        if (json.unseen) {
                          this.firstUnseenMessage = this.listMessages[this.listMessages.length - json.unseen].id;
                        }
                      } else {
                        this.onListMessages(this.listMessages[this.listMessages.length - 1].id, paging, 0);
                      }
                    } else {
                      if (this.listMessages.length < json.unseen) {
                        this.onListMessages(this.listMessages[0].id, json.unseen, 1);
                        break;
                      } else {
                        if (json.unseen && !this.firstUnseenMessage) {
                          this.firstUnseenMessage = this.listMessages[this.listMessages.length - json.unseen].id;
                        }
                        this.latestMessage = this.listMessages[this.listMessages.length - 1];
                        if (this.firstUnseenMessage) {
                          // scroll to message before unread
                          let indexToScroll = this.listMessages.length - json.unseen - 1;
                          indexToScroll = indexToScroll >= 0 ? indexToScroll : 0;
                          this.scrollToElementBottom(this.listMessages[indexToScroll], true);
                        } else {
                          this.scrollToElementBottom(this.latestMessage, true);
                        }
                      }
                    }
                  } else {
                    this.transitionPageScroll(
                      json.messages[0].id,
                      json.messages[json.messages.length - 1].id);
                  }
                  this.listMessages.map(m => {
                    return this.buildMessage(m, true);
                  });
                } else {
                  this.dialogService.setLoaderVisible(false);
                }
                this.checkReadEvent();
              }
              break;
            case 'message_got':
              this.listMessages.push(this.buildMessage(json.message, false));
              break;
            case 'notify_edited':
              this.allowNotify = json.notify.allow;
              this.sound = json.notify.sound;
              break;
            case 'notify_got':
              this.allowNotify = json.notify.allow;
              this.sound = json.notify.sound;
              break;
            case 'attachment_listed':
              this.showAttachedFilesPopup(json.attachments);
              break;
            case 'attachment_forwarded':
              break;
            case 'attachment_deleted':
              if (json.message) {
                this.removeAttachmentMessageAfterDeleting(json.message);
              }
              this.onListAttachment();
              break;
            case 'modified_listed':
              break;
            case 'text_sent':
              break;
            case 'stamp_sent':
              break;
            case 'attachment_sent':
              break;
            case 'room_left':
              if (json.user === this.userSession.officeUserId) {
                this.dialogService.showMessage('success', false, null, 'MSG.GR.M003',
                  null, 'MSG.OK', null).subscribe((res: DialogResult) => {
                  if (res.isOk()) {
                    this.route.navigate(['/']);
                  }
                });
              }
              break;
            case 'tmp_text_got':
              if (json.text) {
                this.messageSetting.text = json.text;
              }
              break;
            case 'room_deleted':
              this.dialogService.showMessage('success', false, null, 'MSG.GR.M003',
                null, 'MSG.OK', null).subscribe((res: DialogResult) => {
                if (res.isOk()) {
                  this.route.navigate(['/']);
                }
              });
              break;
            default:
              break;
          }
        }
        if (i > -1) {
          setTimeout(() => {
            const index = this.requestIds.indexOf(json.request_id);
            if (index > -1) {
              this.requestIds.splice(index, 1);
            }
          }, 5000);
        } else {
          switch (json.type) {
            case 'room_left':
              json.left_users.forEach((lu) => {
                if (lu.user === this.userSession.officeUserId) {
                  this.dialogService.showMessage('success', false, null, 'MSG.GR.M003',
                    null, 'MSG.OK', null).subscribe((res: DialogResult) => {
                    if (res.isOk()) {
                      this.route.navigate(['/']);
                    }
                  });
                }
              });
              this.listMembers = this.listMembers.map((mem) => {
                json.left_users.forEach((lu) => {
                  if (mem.id === lu.user) {
                    mem.joinStatus = 1;
                    if (mem.role === 1) {
                      this.countAdmins--;
                    }
                  }
                });
                return mem;
              });
              break;
            case 'room_joined':
              this.listMembers.map( (mem) => {
                if (mem.id === json.user) {
                  mem.joinStatus = json.is_join? 0: 1;
                }
                return mem;
              });
              break;
            case 'room_deleted':
              // TODO: Update message
              this.dialogService.showMessage('warning', false, null, 'このメッセージルームが削除されました。', null, 'MSG.YES', null)
                .subscribe((res: DialogResult) => {
                  if (res.isOk()) {
                    this.route.navigate(['/']);
                  }
                });
              break;
            case 'room_edited':
              // TODO: Update list members
              break;
            case 'attachment_deleted':
              if (json.message) {
                this.removeAttachmentMessageAfterDeleting(json.message);
              }
              break;
          }
        }
      }
    });
    // Stream of messages
    this.wsService.errors.map((message: Message) => {
      return message.body;
    }).subscribe((msg_body: string) => {
      this.dialogService.setLoaderVisible(false);
      setTimeout(() => {
        this.dialogService.showError(JSON.parse(msg_body).error.msg ? JSON.parse(msg_body).error.msg : 'MSG.ERROR');
      });
    });
  }

  /**
   * display the newest message for 5 seconds then hide
   * @param newMessage
   */
  displayNewestMessage(newMessage: any) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    if (!this.isMaxScrollPos) {
      this.newestMessage = newMessage;
      this.timer = setTimeout(() => {
        this.newestMessage = null;
      }, 5000);
    } else {
      this.scrollToElementBottom(newMessage);
    }
  }

  /**
   * scroll to the newest message when click on the new message notification
   * @param event
   */
  onClickNewestMsg(event) {
    if (event && this.newestMessage) {
      this.scrollToElementBottom(this.newestMessage);
      if (this.timer) {
        this.newestMessage = null;
        clearTimeout(this.timer);
      }
    }
  }

  /**
   * scroll to the element's bottom
   * @param {any} mess
   */
  scrollToElementBottom(mess: any, isFocus?: boolean) {
    this._unsubscription(this.scrollToSubscription);
    this.ngZone.runOutsideAngular(() => {
      this.scrollToSubscription = Observable.timer(0, 100).subscribe(i => {
        const element = $('#' + mess.id);
        if (element && element.position() && !document.hidden) {
          const elementTop = element.position().top;
          const newestMessageHeight = element.outerHeight();
          const bottom = elementTop + newestMessageHeight;
          if (isFocus) {
            $('#infinite-scroll').get(0).scrollTop = bottom;
            this.finishScroll();
            this._unsubscription(this.scrollToSubscription);
          } else {
            if (newestMessageHeight > 0) {
              $('#infinite-scroll').animate({scrollTop: bottom + 'px'}, 300);
              this._unsubscription(this.scrollToSubscription);
            }
          }
        }
      });
    });
  }

  finishScroll() {
    const id = setTimeout(() => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.scrollDone = true;
    }, 800);
  }

  onListMessages(message, limit, direction) {
    const reqId = this.renewRequestId();
    const data = {
      type: 'list_message',
      request_id: reqId,
      room: this.roomId,
      user: this.userSession.officeUserId,
      limit: limit ? limit : 10,
      message: message ? message : null,
      direction: direction
    };
    this.wsService.onPublish('list_message', data);
    return reqId;
  }

  onGetMessage(messageId) {
    const data = {
      type: 'get_message',
      request_id: this.renewRequestId(),
      room: this.roomId,
      user: this.userSession.officeUserId,
      message: messageId
    };
    this.wsService.onPublish('get_message', data);
  }

  onListMembers() {
    const data = {
      type: 'list_member',
      request_id: this.renewRequestId(),
      room: this.roomId,
      user: this.userSession.officeUserId
    };
    this.wsService.onPublish('list_member', data);
  }

  onSendMessage(message) {
    const data = {
      type: 'send_message',
      request_id: this.renewRequestId(),
      room: this.roomId,
      user: this.userSession.officeUserId,
      event: message
    };
    this.wsService.onPublish('send_message', data);
  }

  onEditNotify(allow) {
    const data = {
      type: 'edit_notify',
      request_id: this.renewRequestId(),
      room: this.roomId,
      user: this.userSession.officeUserId,
      notify: {
        allow: allow,
        sound: this.sound
      }
    };
    this.wsService.onPublish('edit_notify', data);
  }

  onGetNotify() {
    const data = {
      type: 'get_notify',
      request_id: this.renewRequestId(),
      room: this.roomId,
      user: this.userSession.officeUserId
    };
    this.wsService.onPublish('get_notify', data);
  }

  onLeaveRoom() {
    const data = {
      type: 'leave_room',
      request_id: this.renewRequestId(),
      room: this.roomId,
      user: this.userSession.officeUserId
    };
    this.wsService.onPublish('leave_room', data);
  }

  onJoinRoom(joined) {
    const data = {
      type: 'join_room',
      request_id: this.renewRequestId(),
      room: this.roomId,
      user: this.userSession.officeUserId,
      is_join: joined
    };
    this.wsService.onPublish('join_room', data);
  }

  onStarMessage(message) {
    const data = {
      type: 'star',
      request_id: this.renewRequestId(),
      room: this.roomId,
      user: this.userSession.officeUserId,
      event: message.id,
      starred: !message.starred
    };
    this.wsService.onPublish('star', data);
  }

  onMarkMessage(listSeenMessages) {
    const data = {
      type: 'mark_message',
      request_id: this.renewRequestId(),
      room: this.roomId,
      user: this.userSession.officeUserId,
      marked: listSeenMessages
    };
    this.wsService.onPublish('mark_message', data);
  }

  onTypingMessage(typing) {
    const data = {
      type: 'typing_message',
      request_id: this.renewRequestId(),
      room: this.roomId,
      user: this.userSession.officeUserId,
      typing: typing
    };
    this.wsService.onPublish('typing_message', data);
  }

  onListAttachment() {
    const data = {
      type: 'list_attachment',
      request_id: this.renewRequestId(),
      room: this.roomId,
      user: this.userSession.officeUserId
    };
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.wsService.onPublish('list_attachment', data);
  };

  onGetTmpText() {
    const data = {
      type: 'get_tmp_text',
      request_id: this.renewRequestId(),
      room: this.roomId,
      user: this.userSession.officeUserId
    };
    this.wsService.onPublish('get_tmp_text', data);
  }

  onSendTmpText() {
    const data = {
      type: 'send_tmp_text',
      request_id: this.renewRequestId(),
      room: this.roomId,
      user: this.userSession.officeUserId,
      text: this.messageSetting.text
    };
    this.wsService.onPublish('send_tmp_text', data);
  }

  onDeleteAttachment(fileId) {
    const data = {
      type: 'delete_attachment',
      request_id: this.renewRequestId(),
      room: this.roomId,
      user: this.userSession.officeUserId,
      attachment: fileId
    };
    this.wsService.onPublish('delete_attachment', data);
  }

  onShowListMembers() {
    const isShowOfficeName = this.roomType !== RoomType.Inside;
    const members = this.listMembers.filter(u => u.joinStatus === 0 && !u.invalid);

    this.dialogService
      .showMemberListDialog(true, 'MSG.MEMBER_LIST.ROOM_TITLE', '', 'MSG.CLOSE',
        {groupId: '', userIds: [], userInfo: members, isShowOfficeName: isShowOfficeName, mode: 'all', roomType: this.roomType})
      .subscribe((res: DialogResult) => {
        if (res.isOk()) {
          console.log('go to group edit');
        }
      });
  }

  sendTemporaryTextAndTypingMessage() {
    this.changedText
      .debounceTime(100) // wait 10% sec after the last event before emitting last event
      .distinctUntilChanged()
      .subscribe(() => {
        if (navigator.onLine) {
          this.onSendTmpText();
          this.onTypingMessage(true);
          this.sentTypingMessage = true;
        }
      });
  }

  showPopupOnChat(type_popup) {
    switch (type_popup) {
      case 'list_members':
        this.onShowListMembers();
        break;
      case 'staff_info':

    }
  }

  redirectEditRoom(event) {
    if (this.roomType === 'OUTSIDE') {
      this.route.navigate(['ch/ch0006', this.roomId]);
    } else {
      this.route.navigate(['ch/ch0004', this.roomId]);
    }
  }

  attachedFilesChatRoom(event) {
    this.onListAttachment();
  }

  leaveRoomChat(event) {
    this.dialogService.showMessage('warning', false, null, '本当にこのルームから退出しますか？', null, 'MSG.YES', 'MSG.NO')
      .subscribe((res: DialogResult) => {
        if (res.isOk()) {
          if (this.isDrCustomerRoom) {
            const data = {
              type: 'delete_room',
              user: this.userSession.officeUserId,
              request_id: this.renewRequestId(),
              room: this.roomId
            };
            this.wsService.onPublish('delete_room', data);
          } else {
            if (this.countAdmins > 1 || !this.isAdmin) {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(true);
              });
              this.onLeaveRoom();
            } else {
              if (this.isAdmin && this.listMembers.length === 1) {
                const data = {
                  type: 'delete_room',
                  user: this.userSession.officeUserId,
                  request_id: this.renewRequestId(),
                  room: this.roomId
                };
                this.wsService.onPublish('delete_room', data);
              } else {
                setTimeout(() => {
                  this.dialogService.showError('管理者が一人のため退出できません。他のメンバーを管理者に設定してください。');
                }, 400);
              }
            }
          }
        }
      });
  }

  notificationSound(event) {
    this.onEditNotify(!this.allowNotify);
  }

  onFileSelected(event: any) {
    event.target.value = null;
    if (this.uploader.queue.length > 0) {
      this.progressbar = 0;
      $('#progress-bar-upload').css('width', '0%').attr('aria-valuenow', 0);
      $('#upload-file-popup').modal('hide');
      const fileName = this.uploader.queue[0]._file.name;
      let html = '';
      this.translate.get('MSG.CH.UPLOAD_CONFIRMATION_MSG').subscribe(msg => {
        html = '<div>' + msg + '</div>' + '<div>' + fileName + '</div>';
      });
      if (this.uploader.queue[0]._file.size > MAX_SIZE) {
        this.dialogService.showMessage('error', false, null, 'MSG.GR.MAX_SIZE_ERROR', null, 'MSG.OK', null).subscribe(
          (res: DialogResult) => {
            if (res.isOk()) {
              this.uploader.clearQueue();
            }
          });
      } else {
        this.dialogService.showMessage('warning', false, null, null, html, 'MSG.YES', 'MSG.NO').subscribe(
          (res: DialogResult) => {
            if (res.isOk()) {
              this.uploadFile();
            } else {
              this.uploader.clearQueue();
            }
          });
      }
    }
  }

  uploadFile() {
    $('#upload-file-popup').modal('show');
    if (this.checkOrientedImage(this.uploader.queue[0]._file)) {
      const img = loadImage(this.uploader.queue[0]._file, (canvas) => {
        if (canvas.type === 'error') {
          this.uploadStorage(this.uploader.queue[0]._file);
        } else {
          canvas.toBlob(blob => {
            const newFile: any = blob;
            newFile['name'] = this.uploader.queue[0]._file.name;
            newFile['width'] = canvas.width;
            newFile['height'] = canvas.height;
            if (img.naturalWidth >= MAX_WIDTH || img.naturalHeight > MAX_HEIGHT) {
              this.uploader.queue[0]._file['_thumb'] = newFile;
            }
            const originalAspectRatio = img.naturalWidth  / img.naturalHeight;
            const thumbnailRatio = canvas.width / canvas.height;
            const orientationChanged = !((originalAspectRatio > 1 && thumbnailRatio > 1) || (originalAspectRatio <= 1 && thumbnailRatio <= 1));
            this.uploader.queue[0]._file['width'] = orientationChanged ? img.naturalHeight : img.naturalWidth;
            this.uploader.queue[0]._file['height'] = orientationChanged ? img.naturalWidth : img.naturalHeight;
            this.uploadStorage( this.uploader.queue[0]._file);
          });
        }
      }, this.options);
    } else {
      this.uploadStorage(this.uploader.queue[0]._file);
    }
  }

  /*upload files to firebase*/
  uploadStorage(file: any) {
    this.fireBaseStorage.uploader.chat(this.roomId, this.userSession.officeUserId, file).subscribe((data) => {
      this.progressbar = data.progress;
      $('#progress-bar-upload').css('width', this.progressbar + '%')
        .attr('aria-valuenow', this.progressbar);
      if (data.done) {
        this.progressbar = 0;
        $('#upload-file-popup').modal('hide');
        const text = this.messageSetting.text;
        this.messageSetting.text = '';
        this.messageSetting.type = MessageType.File;
        this.messageSetting.attachment.file_id = data.file.id;
        this.messageSetting.attachment.size = data.file.size;
        this.messageSetting.attachment.name = data.file.name;
        this.messageSetting.attachment['mime-type'] = this.getFileType(data.file);
        this.messageSetting.attachment.width = data.file.customMetadata.width;
        this.messageSetting.attachment.height = data.file.customMetadata.height;
        this.onSendMessage(this.messageSetting);
        this.messageSetting = new MessageSettings();
        this.messageSetting.text = text;
        this.uploader.clearQueue();
      }
    }, (error) => {
      this.uploader.clearQueue();
      $('#upload-file-popup').modal('hide');
      this.dialogService.showError('MSG.ERROR');
    });
  }

  /**
   * scale image/video
   * @param data
   */
  getScale(data: any) {
    let ratio = 0;
    if (data && data.width > 0 && data.height > 0) {
      if (IMG_MAX_WIDTH > data.width  && IMG_MAX_HEIGHT > data.height) {
        return;
      }
      const scale_width = IMG_MAX_WIDTH / data.width;
      const scale_height = IMG_MAX_HEIGHT / data.height;

      ratio = Math.min(scale_width, scale_height);

      data.width = data.width * ratio;
      data.height = data.height * ratio;
    }
  }

  checkOrientedImage(file: File) {
    return (file.type.startsWith('image') && file.type !== 'image/gif');
  }

  changeFields(event: KeyboardEvent) {
    if (event.keyCode === 13 && event.shiftKey) {
      if (this.sentTypingMessage) {
        this.onTypingMessage(false);
        this.sentTypingMessage = false;
      }
      this.onApplyMessage(event);
    }
  }

  public onApplyMessage(event) {
    event.stopPropagation();
    event.preventDefault();
    if (this.messageSetting.text.trim() !== '') {
      if (this.messageSetting.text.length > 3000) {
        this.dialogService.showMessage('warning', false, null, 'MSG.CH.MESSAGE_MAX_LENGTH',
          null, 'MSG.OK', null).subscribe((res: DialogResult) => {
          if (res.isOk()) {
            return;
          }
        });
      } else {
        /* validate text for each keyword */
        if (this.helper.checkNGKeyword(this.messageSetting.text) && this.roomType === RoomType.Customer) {
          let html = '';
          let obj = {};
          this.translate.get('GR0013').subscribe(msg => {
            html = '<div> ' + msg.CONTENT_NG_KEYWORD_CHECKBOX + '</div>';
            obj = {
              checked: false,
              confirmText: msg.NG_KEYWORD_CHECKBOX_LBL,
              isConfirm: true,
              disablePositive: true
            };
          });
          this.dialogService.showCheckboxDialog('warning', false, 'GR0013.TITLE_NG_KEYWORD_CHECKBOX',
            null, html, 'MSG.OK', 'MSG.CANCEL', obj, null, null).subscribe(
            (res: DialogResult) => {
              if (res.isOk()) {
                this.sendMessageDebounce(this.messageSetting);
              }
            });
        } else {
          this.sendMessageDebounce(this.messageSetting);
        }
      }
    } else {
      this.dialogService.showError('MSG.CH.EMPTY_MESSAGE');
    }
  }

  onSelectStamp(id: string) {
    const text = this.messageSetting.text;
    this.messageSetting.text = '';
    this.messageSetting.type = MessageType.Stamp;
    this.messageSetting.stamp = id;
    this.onSendMessage(this.messageSetting);
    this.messageSetting = new MessageSettings();
    this.messageSetting.text = text;
    this.closeStampPreview();
  }

  private renewRequestId() {
    const requestId = this.userSession.userId + Date.now();
    this.requestIds.push(requestId);
    return requestId;
  }

  private buildMessage(m, isList) {
    if (m.attachment) {
      this.getScale(m.attachment);
    }
    m.owner = m.user === this.userSession.officeUserId;
    m.firstUnseen = m.id === this.firstUnseenMessage;
    if (isList) {
      if (m.firstUnseen || this.listUnseenMessages.length > 0) {
        this.listUnseenMessages.push({id: m.id, inView: {topInView: false, bottomInView: false}});
      }
    } else {
      if (!m.owner) {
        this.listUnseenMessages.push({id: m.id, inView: {topInView: false, bottomInView: false}});
      }
    }
    if (!m.owner) {
      this.listMembers.map(mem => {
        if (m.user === mem.user) {
          m.fullName = mem.fullName;
          m.officeId = mem.officeId;
          m.office = this.roomType === RoomType.Inside ? mem.deptName : mem.officeName;
          m.officeUserId = mem.id;
          m.invalid = mem.invalid;
          m.isLocking = mem.isLocking;
        }
      });
    }

    const date = moment(m.ts).format('YYYY/MM/DD');
    if (this.listDates.indexOf(date) > -1) {
      m.firstOfDay = false;
    } else {
      const day = new Date();
      day.setTime(m.ts);
      m.firstOfDay = true;
      m.dateToString = this.getDateToString(day);
      this.listDates.push(date);
    }

    m.firstOfBlock = false;
    m.chatMessage = false;
    if (m.type !== 3 && m.type !== 4 && m.type !== 5) {
      m.chatMessage = true;
      if (this.currentMember !== m.officeUserId || m.firstOfDay) {
        m.firstOfBlock = true;
        this.currentMember = m.officeUserId;
      }
    }

    if (!m.loaded) {
      m['isImageOrVideo'] = false;
      if (m.type === 2) {
        m['fileType'] = m.attachment['mime-type'];
        m['isImageOrVideo'] = m['fileType'] === 'image' || m['fileType'] === 'video';
        this.chatService.getAttachment(this.roomId, m.attachment.file_id, m['isImageOrVideo']).subscribe(data => {
          m.attachment['fileId'] = data.fileId;
          m.attachment['original_file_id'] = data.original_file_id;
          // re calculate file type
          m['fileType'] = m['isImageOrVideo'] ? m['fileType'] : this.helper.getFileClass(data);
          m.attachment['type'] = m['fileType'] ? m['fileType'] : this.helper.getFileClass(data);
          // Failed to get thumbnail video
          if (data.type.startsWith('video')) {
            m.attachment.height = IMG_MAX_WIDTH;
            // m.attachment['url'] = 'assets/img/default_video_thumb.svg';
            m.attachment['original_url'] = data.url;
          } else {
            m.attachment.url = data.url;
          }
          this.listFilePreview.push(m.attachment);
        }, (error) => {
          console.log(error.toString());
        });
        m.size = this.formatSize.formatSizeUnits(m.attachment.size);
      } else if (m.type === 1) {
        this.fireBaseStorage.downloadURL( 'stamp/small/' + m.stamp).subscribe(
          (resultUrl) => {
            m.stampUrl = resultUrl;
          }, (error) => {
            console.log(error);
          });
      }
      m.showSeenCount = this.countMembers > 2;
      m.loaded = true;
    }
    m.isNotMessageNext = m.firstOfBlock || m.owner || m.isImageOrVideo || m.type === 1;
    if (m.firstOfBlock) {
      if (m.invalid) {
        m.imageUrl = '/assets/img/deleted_account.png';
        m.displayName = 'アカウント削除';
      } else {
        m.imageUrl = 'img/staff/face/' + m.officeId + '/' + m.officeUserId;
        m.displayName = m.fullName + ' (' + m.office + ')';
      }
    }
    // m.loadMessage = (m.type === 2 && m.fileType) || m.type === 1 || m.type === 0;
    return m;
  }

  getFileType(file) {
    return this.helper.getFileClass(file);
  }

  downloadFile(event, file: any) {
    event.stopPropagation();
    event.preventDefault();
    this.dialogService.showDownloadDialog(file.name, file.url);
  }

  filePreviewOpen(event, file: any) {
    this.dialogService
      .showFilePreviewDialog(true, 'MSG.DOWNLOAD', 'MSG.FORWARD', {
        groupId: null,
        roomId: this.roomId,
        officeUserId: this.userSession.officeUserId,
        contentsId: 'contentsId',
        articleContentsId: 'articleContentsId',
        fileId: file.fileId,
        fileList: this.listFilePreview
      })
      .subscribe((res) => {
        if (res.buttonName === 'ok') {
          const url = res.payload.value.original_url ? res.payload.value.original_url : res.payload.value.url;
          this.dialogService.showDownloadDialog(res.payload.value.name, url);
        } else if (res.buttonName === 'cancel') {
          const path = `group/${this.roomId}/${file.fileId}`;
          this.dialogService.showForwardFileDialog(res.payload.value.name, res.payload.value.size, path, null, null);
        }
      });
  }

  public triggerScrollTo(target: string) {
    const config: ScrollToConfigOptions = {
      target: target
    };

    this._scrollToService.scrollTo(config);
    this.finishScroll();
  }

  onScrollUp() {
    if (!this.notJoined) {
      if (this.listMessages.length > 0) {
        this.onListMessages(this.listMessages[0].id, 10, 1);
      }
    }
  }

  transitionPageScroll(id, oldest) {
    const $first = $('#' + id);
    window.cancelAnimationFrame(this.requestAnimationId);
    if ($('#' + oldest).length === 0) {
      this.requestAnimationId = window.requestAnimationFrame(() => {
        this.transitionPageScroll(id, oldest);
      });
    } else {
      if ($('#infinite-scroll').scrollTop() === 0) {
        if (id) {
          $('#infinite-scroll').animate({scrollTop: $first.position().top + $first.outerHeight(true)}, 100, 'linear');
        }
      }
    }
  }

  showAttachedFilesPopup(attachedFiles) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(false);
    });
    this.dialogService
      .showAttachedFilesDialog({
        officeUserId: this.userSession.officeUserId,
        groupId: null,
        roomId: this.roomId,
        memberList: this.listMembers,
        listAttachments: attachedFiles
      })
      .subscribe();
  }

  getListStampCategories() {
    this.chatService.getListStampCategories().subscribe((data: FirStampCategory[]) => {
      this.listStampsCategories = data;
    }, (error) => {
      this.dialogService.setLoaderVisible(false);
      this.dialogService.showError('MSG.ERROR');
    });
  }

  openStampPreview() {
    this.openStamp = true;
  }

  closeStampPreview() {
    this.openStamp = false;
  }

  private getDateToString(day) {
    const dayNames = [
      '日',
      '月',
      '火',
      '水',
      '木',
      '金',
      '土'
    ];
    const today = moment().endOf('day');
    let formatedDay = '';
    const moment_day = moment(day);
    const diff = today.diff(moment_day, 'day');
    switch (diff) {
      case 0:
        formatedDay = '今日';
        break;
      case 1:
        formatedDay = '昨日';
        break;
      default:
        if (diff < 7) {
          // same week
          formatedDay = dayNames[moment_day.day()] + '曜日';
        } else if (moment_day.isSame(today, 'year')) {
          // same year
          formatedDay = moment_day.format('MM月DD日(' + dayNames[moment_day.day()] + ')');
        } else {
          formatedDay = moment_day.format('YYYY年MM月DD日(' + dayNames[moment_day.day()] + ')');
        }
        break;
    }
    return formatedDay;
  }

  showUserDetailPopup(event, officeUserId: string) {
    if (event && officeUserId) {
      const user = this.listMembers.find(mem => mem.id === officeUserId);
      if (user.isValid && !user.isLocking) {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(true);
        });
        if ((this.roomType === RoomType.Customer && user.officeId !== this.userSession.officeId && environment.app === Product.Drjoy) ||
          user.officeId === this.userSession.officeId && environment.app === Product.Prjoy) {
          this.registrationService.getDetailMR(user.user).subscribe((settings: DetailMrUser) => {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(false);
            });
            this.dialogService.showStaffDetailsDialog('', {data: settings, officeUserId: 'pr'});
          }, error => {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(false);
            });
          });
        } else {
        this.groupService.getDetailUser(officeUserId).subscribe(modelDetail => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showStaffDetailsDialog(null, {data: modelDetail, officeUserId: 'dr'});
        }, error => {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(false);
          });
          this.dialogService.showError('MSG.ERROR');
        });
        }
      } else if (user.isLocking && user.isValid) {
        let html = '';
        this.translate.get('MSG.GR.LOCKED_ACCOUNT_PROFILE_POPUP').subscribe(msg => {
          html = '<div><h1 class="font-weight-bold">'
            + msg.MSG_1 + '<br>'
            + msg.MSG_2 + '</h1></div><br><div>'
            + msg.MSG_3 + '</div><div>'
            + msg.MSG_4 + '</div>';
        });
        this.dialogService.showMessage('error', false, null, null, html, 'MSG.OK', null).subscribe();
      }
    }
  }

  /**
   * removeAttachmentMessageAfterDeleting
   * @param message
   */
  removeAttachmentMessageAfterDeleting(message) {
    const index = this.listMessages.findIndex(item => item.id === message);
    if (index !== -1) {
      if (this.listMessages[index + 1]) {
        this.listMessages[index + 1].firstOfBlock = this.listMessages[index].firstOfBlock;
        this.listMessages[index + 1].firstOfDay = this.listMessages[index].firstOfDay;
      }
      this.listMessages.splice(index, 1);
    }
  }
}
