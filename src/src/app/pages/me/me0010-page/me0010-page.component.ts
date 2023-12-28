import {Router} from '@angular/router';
import {MeetingService} from '../../../services/meeting.service';
import {Component, OnInit} from '@angular/core';
import {SharedValueService} from '../../../services/shared-value.service';
import {ListMeetingConfig} from '../../../models/me/list-meeting-config';
import {HttpError} from '../../../common/error/http.error';
import {DialogService} from '../../../services/dialog.service';

@Component({
  selector: 'app-me0010-page',
  templateUrl: './me0010-page.component.html',
  styleUrls: ['./me0010-page.component.scss']
})
export class Me0010PageComponent implements OnInit {

  model = new ListMeetingConfig();
  department = '';
  name = '';
  authority = {};
  userSession;

  constructor(private router: Router,
              private dialogService: DialogService,
              private shareValue: SharedValueService,
              private meetingService: MeetingService) {
  }

  ngOnInit() {
    this.shareValue.fetchUserSession();
    this.userSession = this.shareValue.getUserSession();
    (this.userSession.managementAuthority === 'MP_1') ? (this.department = '') : (this.department = this.userSession.deptId);
    this.authority = {
      managementAuthority: this.userSession.managementAuthority,
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
    this.getListMeetingConfig();
  }

  // Search by Department
  searchDepartment(department) {
    this.department = department.departmentId;
    this.getListMeetingConfig();
  }

  searchUser(name) {
    this.name = name;
    this.getListMeetingConfig();
  }

  getListMeetingConfig() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.meetingService.getListMeetingConfigure(this.department, this.name)
      .subscribe((settings: ListMeetingConfig) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.model = settings;
      }, (error: HttpError) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
      });
  }

  goToMe0016(userId, officeId) {
    this.router.navigate(['me/me0016', true, userId, officeId]);
  }

  goToMe0018(officeId, userId) {
    this.router.navigate(['me/me0018']);
  }

  goToMe0021(userId, officeId) {
    this.router.navigate(['me/me0021', true, userId, officeId]);
  }

  convertInfoUser(user: any) {
    return {
      imageUrl: user.avatar,
      firstName: user.firstName,
      lastName: user.lastName,
      deptName: user.department.displayName ? user.department.displayName : user.department.name
    };
  }

}
