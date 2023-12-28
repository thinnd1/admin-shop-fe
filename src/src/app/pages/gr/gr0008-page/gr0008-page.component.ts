import { Component, OnInit } from '@angular/core';
import { GroupService } from '../../../services/group.service';
import { Subscription } from 'rxjs/Rx';
import {ActivatedRoute, Router} from '@angular/router';
import {GroupOutsidePrepareJoinSetting} from '../../../models/gr/group-outside-prepare-join-settings';
import {GroupOutsideSaveResult} from '../../../models/gr/group-outside-save-result';
import {HttpError} from '../../../common/error/http.error';
import {DialogService} from '../../../services/dialog.service';
import {DialogResult} from '../../../models/dialog-param';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-gr0008-page',
  templateUrl: './gr0008-page.component.html',
  styleUrls: ['./gr0008-page.component.scss'],
  preserveWhitespaces: false
})
export class Gr0008PageComponent implements OnInit {

  subscription: Subscription;
  groupId: string;
  infoPrepare = new GroupOutsidePrepareJoinSetting();

  constructor(private groupService: GroupService,
              private dialogService: DialogService,
              private route: Router,
              public activatedRoute: ActivatedRoute,
              private titleService: Title) {
    this.activatedRoute.params.subscribe(params => {
      this.ngOnInit();
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.subscription = this.activatedRoute.params.subscribe(params => {
      this.groupId = params['groupId'];
      this.groupService.getMemberPrepare(this.groupId).subscribe((res: GroupOutsidePrepareJoinSetting) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.infoPrepare = res;
        this.titleService.setTitle(this.infoPrepare.name);
      }, (error: HttpError) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR').subscribe((res: DialogResult) => {
          if (res.isOk()) {
            this.route.navigate(['/']);
          }
        });
      });
    });
  }

  agreeJoinGroup() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    this.groupService.putJoinAgreeGroup(this.groupId).subscribe((res: GroupOutsideSaveResult) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showMessage('success', false, null, 'MSG.GR.M010', null, 'MSG.YES', null).subscribe(
        (respose: DialogResult) => {
          setTimeout(() => {
            if (respose.isOk()) {
              this.route.navigate(['gr/gr0011/', this.groupId]);
            }
          }, 400);
        }
      );
    }, (error: HttpError) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      if (error.contains('GR.M015')) {
        this.route.navigate(['gr/gr0011/', this.groupId]);
      } else {
        this.dialogService.showError('MSG.ERROR').subscribe((res: DialogResult) => {
          if (res.isOk()) {
            this.route.navigate(['/']);
          }
        });
      }
    });
  }

  disagreeJoinGroup() {
    this.dialogService.showMessage('warning', false, null, 'GR0008.CONFIRM_DIS_AGREE', null, 'MSG.YES', 'MSG.NO').subscribe(
    (res: DialogResult) => {
      setTimeout(() => {
        if (res.isOk()) {
          setTimeout(() => {
            this.dialogService.setLoaderVisible(true);
          });
          this.groupService.putJoinDisagreeGroup(this.groupId).subscribe((response: GroupOutsideSaveResult) => {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(false);
            });
            this.dialogService.showMessage('success', false, null, 'MSG.GR.M011', null, 'MSG.YES', null).subscribe(
              (re: DialogResult) => {
                setTimeout(() => {
                  if (re.isOk()) {
                    this.route.navigate(['/']);
                  }
                }, 400);
              }
            );
          }, (error) => {
            setTimeout(() => {
              this.dialogService.setLoaderVisible(false);
            });
            this.dialogService.showError('MSG.ERROR').subscribe((response: DialogResult) => {
              if (response.isOk()) {
                this.route.navigate(['/']);
              }
            });
          });
        }
      });
    });
  }
}
