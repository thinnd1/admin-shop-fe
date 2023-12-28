import { Component, OnInit, AfterViewInit, HostListener, ElementRef } from '@angular/core';
import { MeetingService } from '../../../services/meeting.service';
import {Helper} from '../../../common/helper';
import { PicSettings } from '../../../models/me/pic-settings';
import { DialogService } from '../../../services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { DialogResult } from '../../../models/dialog-param';
import { MeetingRestriction } from '../../../models/me/meeting-restriction-settings';
import { MeetingIdentifyStatus } from '../../../models/me/metting-identify-status-settings';
import { Location } from '@angular/common';
import { SharedValueService } from '../../../services/shared-value.service';
import { HttpError } from '../../../common/error/http.error';
import {FirebaseStorage} from '../../../services/firebase/firebase.storage';

declare const $: any;
@Component({
  selector: 'app-me0014-page',
  templateUrl: './me0014-page.component.html',
  styleUrls: ['./me0014-page.component.scss']
})
export class Me0014PageComponent implements OnInit, AfterViewInit {
  public model = new PicSettings();
  office: any;
  offices: any;
  // Params
  public keyWord = '';
  public check = false;
  public next = '';
  public prev = '';
  public pageSize = '20';

  // Data when Scroll
  public dataScroll: any;
  public pageDefault = '';
  public totalRecord;
  public nextScroll;
  dataLength = [];
  default = 0;
  public lastId;
  userSession;
  _defaultPath = '/assets/img/user-no-image.png';
  //scroll
  public flagScroll: boolean;
  public currentPage = '';

  constructor(
    private meetingService: MeetingService,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private location: Location,
    private helper: Helper,
    private firebaseStorage: FirebaseStorage,
    private eref: ElementRef,
    private sharedValueService: SharedValueService) { }

  ngOnInit() {
    this.flagScroll = true;
    this.userSession = this.sharedValueService.getUserSession();
    this.loadListPic();
  }
  loadListPic() {
    if($('.custom-checkbox .custom-control-input').is(':checked')){
      this.check = true;
    }
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getPicsSettings(this.keyWord, this.check, this.next, this.prev, this.pageSize).subscribe(
      (settings: PicSettings) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        if (!$.isEmptyObject(settings)) {
          this.model = settings['pics'];
          this.dataLength = settings['pics'];
          this.lastId = settings['next'];
          this.totalRecord = settings['totalRecord'];
          this.dataScroll = this.model;
          for(let i = 0; i < this.dataScroll.length; i++){
            if(this.dataScroll[i].image_identification ){
              this.firebaseStorage.downloadURL(this.dataScroll[i].image_identification).subscribe(
                  (url) => {
                    this.dataScroll[i]['image_identification_url'] =  url;
                  });
            }
          }
          this.currentPage = this.next;
          if(this.dataScroll.length < 20){
            this.flagScroll = false;
          }
          if (this.next === this.pageDefault) {
            this.offices = this.model;
            this.nextScroll = settings['pics'].length;
          } else {
            this.offices = this.offices.concat(this.dataScroll);
            this.nextScroll = settings['pics'].length + this.nextScroll;
          }
          if (settings['pics'].length <= 0) {
            this.default = 0;
          } else {
            this.default = 1;
          }
        }
      },
      (error: HttpError ) => {
        this.currentPage = this.next;
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      }
      );

  }


  // Scroll Paging
  scrollPaging() {
    if(this.offices && this.flagScroll === true && this.location.path() === '/me/me0014' && this.next === this.currentPage){
      this.next = this.lastId;
      this.loadListPic();
    }
  }

  ngAfterViewInit() {
    $('[data-toggle="tooltip"]').tooltip({animation: false});
    $('[data-toggle="popover"]').popover({
      html: true
    });
    $('body').on('click', function (e) {
      $('[data-toggle="popover"]').each(function () {
        if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
          $(this).popover('hide');
        }
      });
    });
  }

  searchOffice(name: string) {
    this.flagScroll = true;
    name ? (this.keyWord = name) : (this.keyWord = '');
    this.next = '';
    this.currentPage = '';
    this.check = false;
    this.loadListPic();
  }
  resetLoad() {
    this.flagScroll = true;
    this.keyWord = '';
    this.check = false;
    this.next = '';
    this.currentPage = '';
    this.prev = '';
    this.pageSize = '20';
    this.loadListPic();
  }
  putMeetingRestriction(meetingRestriction, office, index) {
    const officeId = office.officeId;
    const userId = office.userId;
    const setting = new MeetingRestriction(meetingRestriction, officeId, userId);
    this.translateService.get('MSG.ME0014').subscribe((res) => {
      switch (meetingRestriction) {
        case '0':
          const nameStaffReplace = office.lastName + ' ' + office.firstName;
          const officeName = res['E003_2'].replace('nameOffice', nameStaffReplace);
          this.dialogService.showMessage('warning', false,  null, officeName, null, 'MSG.YES', 'MSG.NO').subscribe(
            (resp: DialogResult) => {
              setTimeout(() => {
                if (resp.isOk()) {
                  setTimeout(() => {
                    this.dialogService.setLoaderVisible(true);
                  });
                  this.meetingService.putMeetingRestrictionSettings(setting).subscribe(response => {
                    this.resetLoad();
                    this.dialogService.showSuccess('MSG.ME0014.SAVED_E1');
                  }, (error: HttpError ) => {
                    setTimeout(() => {
                      this.dialogService.setLoaderVisible(false);
                    });
                    this.dialogService.showError('MSG.ERROR');
                  });
                } else if (resp.isCancel()) {
                  $('.authority' + '_' + index).val(office.restrictionStatus);
                }
              }, 500);
            });
          break;
        case '1':
          const nameReplace = office.lastName + ' ' + office.firstName;;
          const officeName1 = res['E003_8'].replace('nameOffice', nameReplace);
          this.dialogService.showMessage('warning', false,  null, officeName1, null, 'MSG.YES', 'MSG.NO').subscribe(
            (resp: DialogResult) => {
              setTimeout(() => {
                if (resp.isOk()) {
                  setTimeout(() => {
                    this.dialogService.setLoaderVisible(true);
                  });
                  this.meetingService.putMeetingRestrictionSettings(setting).subscribe(response => {
                    this.resetLoad();
                    this.dialogService.showSuccess('MSG.ME0014.SAVED_E2');
                  }, (error: HttpError ) => {
                    setTimeout(() => {
                      this.dialogService.setLoaderVisible(false);
                    });
                    this.dialogService.showError('MSG.ERROR');
                  });
                } else if (resp.isCancel()) {
                  $('.authority' + '_' + index).val(office.restrictionStatus);
                }
              }, 500);
            });
          break;
        case '2':
          const nameStaff = office.lastName + ' ' + office.firstName;
          const officeName2 = res['E003_4'].replace('nameOffice', nameStaff);
          const title = res['E003_3'] + '<br>' + officeName2;
          this.dialogService.showMessageSize('warning', false, null, null, title, 'MSG.YES', 'MSG.NO', null, 'modal-lg')
            .subscribe((resp: DialogResult) => {
              setTimeout(() => {
                if (resp.isOk()) {
                  setTimeout(() => {
                    this.dialogService.setLoaderVisible(true);
                  });
                  this.meetingService.putMeetingRestrictionSettings(setting).subscribe(response => {
                    this.resetLoad();
                    this.dialogService.showSuccess('MSG.ME0014.SAVED_E3');
                  }, (error: HttpError ) => {
                    setTimeout(() => {
                      this.dialogService.setLoaderVisible(false);
                    });
                    this.dialogService.showError('MSG.ERROR');
                  });
                } else if (resp.isCancel()) {
                  $('.authority' + '_' + index).val(office.restrictionStatus);
                }
              }, 500);
            });
          break;
      }
    });
  }

  lastPopoverRef: any;

  @HostListener('document:click', ['$event'])
  clickOutside(event) {
    if(this.lastPopoverRef !== undefined && this.eref.nativeElement.querySelector('ngb-popover-window')
        && !this.eref.nativeElement.querySelector('ngb-popover-window').contains(event.target)){
      // If there's a last element-reference AND the click-event target is outside this element
      if (this.lastPopoverRef && !this.lastPopoverRef._elementRef.nativeElement.contains(event.target)) {
        this.lastPopoverRef.close();
        this.lastPopoverRef = null;
      }
    }
  }
  setCurrentPopoverOpen(popReference) {
    // If there's a last element-reference AND the new reference is different
    if (this.lastPopoverRef && this.lastPopoverRef !== popReference) {
      this.lastPopoverRef.close();
    }
    // Registering new popover ref
    this.lastPopoverRef = popReference;
  }

  putIdentifyrestrictionStatus(office, identifyStatus) {
    const officeId = office.officeId;
    const userId = office.userId;
    const settings = new MeetingIdentifyStatus(identifyStatus, officeId, userId);
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.putIdentifyStatusSettings(settings).subscribe(response => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.resetLoad();
      switch (identifyStatus) {
        case 0:
          office.identifyStatus = '1';
          break;
        case 1:
          office.identifyStatus = '0';
          break;
      }
    }, (error: HttpError ) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showError('MSG.ERROR');
    });
  }

  putIdentifyStatusCancel(office, identifyStatus) {
    const userId = office.userId;
    const officeId = office.officeId;
    const settings = new MeetingIdentifyStatus(identifyStatus, officeId, userId);
    const nameStaffReplace = office.lastName + ' ' + office.firstName;
    this.translateService.get('MSG.ME0014').subscribe((res) => {
      const nameStaff = res['E003_1'].replace('nameOffice', nameStaffReplace);
      this.dialogService.showMessage('warning', false,  null, nameStaff, null, 'MSG.YES', 'MSG.NO').subscribe(
        (resp: DialogResult) => {
          setTimeout(() => {
            if (resp.isOk()) {
              setTimeout(() => {
                this.dialogService.setLoaderVisible(true);
              });
              this.meetingService.putIdentifyStatusSettings(settings).subscribe(response => {
                setTimeout(() => {
                  this.dialogService.setLoaderVisible(false);
                });
                office.identifyStatus = '2';
                this.resetLoad();
                this.dialogService.showSuccess('MSG.SENT');
              }, (error: HttpError ) => {
                setTimeout(() => {
                  this.dialogService.setLoaderVisible(false);
                });
                this.dialogService.showError('MSG.ERROR');
              });
            }
          }, 500);
        });

    });
  }

  toggleOffice(event) {
    this.flagScroll = true;
    if (!event.target.checked) {
      this.check = false;
      this.next = '';
      this.currentPage = '';
      this.loadListPic();
    } else {
      this.check = true;
      this.next = '';
      this.currentPage = '';
      this.loadListPic();
    }
  }
}
