import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SharedValueService } from '../../services/shared-value.service';
import { Location } from '@angular/common';

declare const $: any;

@Component({
  selector: 'app-page-head',
  templateUrl: './page-head.component.html',
  styleUrls: ['./page-head.component.scss']
})
export class PageHeadComponent implements OnInit {
  @Input() title: any;
  @Input() groupId: string;
  @Input() typePopup: string;
  @Input() showSetting = true;
  @Input() showNotificationIcon = false;
  @Input() isChatPage = false;
  @Input() pageHeadOptions: any = {
    already: {
      isShow : false,
      isDisabled: false
    },
    attachedFiles: {
      isShow : false
    },
    groupEdit: {
      isShow : false
    },
    csvDownload: {
      isShow : false
    },
    notificationSound: {
      isShow : false,
      status: false
    },
    notificationMail: {
      isShow : false,
      status: false
    },
    logout: {
      isShow : false
    },
    roomEdit: {
      isShow: false
    },
    listMembers: {
      isShow: false
    },
    leaveRoom: {
      isShow: false
    }
  };
  @Input() backEvent: boolean;
  @Input() showBackButton = true;
  @Output() clickAlready = new EventEmitter<any>();
  @Output() clickAttachedFiles = new EventEmitter<any>();
  @Output() clickGroupEdit = new EventEmitter<any>();
  @Output() clickCsvDownload = new EventEmitter<any>();
  @Output() clickNotificationSound = new EventEmitter<boolean>();
  @Output() clickNotificationMail = new EventEmitter<boolean>();
  @Output() clickLogout = new EventEmitter<any>();
  @Output() clickBackEvent = new EventEmitter<any>();
  @Output() _clickRoomName = new EventEmitter<any>();
  @Output() clickEditRoom = new EventEmitter<any>();
  @Output() clickLeaveRoom = new EventEmitter<any>();

  optionsCount: number = 0;
  userSession;

  constructor(private sharedValueService: SharedValueService,private location: Location) {
    this.location = location;
    this.userSession = this.sharedValueService.getUserSession();
  }

  ngOnInit() {
    const self = this;
    Object.keys(this.pageHeadOptions).forEach(function(i){
      if(self.pageHeadOptions[i].isShow){
        self.optionsCount++;
      }
    });
  }

  goBack(event: any) {
    if (this.backEvent) {
      this.clickBackEvent.emit(event);
    } else {
      this.location.back();
    }
  }

  already(event:any) {
    this.clickAlready.emit(event);
  }

  attachedFiles(event:any) {
    this.clickAttachedFiles.emit(event);
  }

  groupEdit(event:any) {
    this.clickGroupEdit.emit(event);
  }

  csvDownload(event:any) {
    this.clickCsvDownload.emit(event);
  }

  notificationSound(event:any,flag:boolean) {
    event.stopPropagation();
    // this.pageHeadOptions.notificationSound.status = !flag;
    this.clickNotificationSound.emit(!flag);
  }

  notificationMail(event:any,flag:boolean) {
    event.stopPropagation();
    // this.pageHeadOptions.notificationMail.status = !flag;
    this.clickNotificationMail.emit(!flag);
  }

  logout(event:any) {
    this.clickLogout.emit(event);
  }

  displayTooltip(event) {
    $('[data-toggle="tooltip"]').tooltip({animation: false});
  }

  onClickRoomName() {
    this._clickRoomName.emit(this.typePopup);
  }
  editRoom(event: any) {
    this.clickEditRoom.emit(event);
  }

  leaveRoom(event) {
    this.clickLeaveRoom.emit(event);
  }
}
