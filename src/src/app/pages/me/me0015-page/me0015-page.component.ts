import { ListMediatorSendAPISettings } from '../../../models/me/list-mediator-send-api-settings';
import { Component, HostListener, OnInit } from '@angular/core';
import { MeetingService } from '../../../services/meeting.service';
import { ListMediatorsSettings } from '../../../models/me/get-list-mediators-settings';
import { HttpError } from '../../../common/error/http.error';
import { DialogService } from '../../../services/dialog.service';
import { ListHandleUsersSettings } from '../../../models/me/list-handle-users-settings';
import { DialogResult } from '../../../models/dialog-param';
import {TranslateService} from '@ngx-translate/core';
import {Location} from '@angular/common';

declare const $: any;

@Component({
  selector: 'app-me0015-page',
  templateUrl: './me0015-page.component.html',
  styleUrls: ['./me0015-page.component.scss']
})
export class Me0015PageComponent implements OnInit {
  listMediators = [];
  memberList = [];
  listHandleUsers = [];
  displayDoctorList = false;
  authority = {};
  userSession;
  checkStatusEdit = false;
  // Output Data Handle Users
  dataHandleUsers = [];
  mediatorId: string;

  constructor(
    private meetingService: MeetingService,
    private translate: TranslateService,
    private location: Location,
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getListMediators().subscribe((settings: ListMediatorsSettings) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      if (!$.isEmptyObject(settings)) {
        this.listMediators = this.convertDataForMiniProfile(settings.mediatorsList, 'avatar', 'imageUrl');
      } else {
        this.listMediators = [];
        this.memberList = [];
      }
    }, (error: HttpError) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  convertDataForMiniProfile(list, from, to) {
    for (let i = 0; i < list.length; i++) {
      list[i][to] = list[i][from];
    }
    return list;
  }
  // Select Mediator
  selectMediatorClick(member, event, i) {
    $('.member-select').removeClass('member-select');
    $('#mediator-' + i).addClass('member-select');
    // Call API get list Handle Users
    this.mediatorId = member.userId;
    this.loadListHandleUsers();
  }

  loadListHandleUsers() {
    this.displayDoctorList = false;
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getListHandleUsers(this.mediatorId).subscribe((settings) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.displayDoctorList = true;
      this.checkStatusEdit = false;
      if (!$.isEmptyObject(settings)) {
        this.listHandleUsers = this.convertDataForMiniProfile(settings.userList, 'image', 'imageUrl');
        this.memberList = this.convertDataForMiniProfile(settings.userHandleList, 'image', 'imageUrl');
      }
    }, (error: HttpError) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  memberSelected(data) {
    this.checkStatusEdit = true;
    this.dataHandleUsers = [];
    for (const item of data) {
      this.dataHandleUsers.push(item.userId);
    }
  }

  // PUT Data
  saveHandleUsers() {
    const data = new ListMediatorSendAPISettings(this.dataHandleUsers, this.mediatorId);
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.putMediatorSettings(data).subscribe(
      (response: any) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showMessage('success', false, null, 'MSG.SAVED', null, 'MSG.OK', null).subscribe(
          (res: DialogResult) => {
            if (res.isOk()) {
              this.checkStatusEdit = false;
              this.loadListHandleUsers();
            }
          }
        );
      },
      (error) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      }
    );
  }

  backPreviousPage() {
    const html = '<span>' + this.translate.instant('CA0004_PAGE.CHANGE_PAGE_WARNING') + '</span>';
    this.dialogService.showMessage('warning', false, null, null, html, 'MSG.OK', 'MSG.CANCEL').subscribe(
      (dialogResult: DialogResult) => {
        if (dialogResult.isOk()) {
          this.location.back();
        }
      }
    );
  }

  // Event check reload page
  @HostListener('window:beforeunload', ['$event']) checkLoadPage(event) {
    if (this.checkStatusEdit) {
      const message = 'Are you sure you want leave?';
      event.returnValue = message;
    }
  }
}
