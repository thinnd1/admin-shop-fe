import {Component, HostListener, OnInit} from '@angular/core';
import {DialogService} from '../../../services/dialog.service';
import {AttendanceService} from '../../../services/attendance.service';
import {Router} from '@angular/router';
import {DialogResult} from '../../../models/dialog-param';
import {Datamock} from '../data-mock';
import {DATA} from '../Data';

@Component({
  selector: 'app-at0006',
  templateUrl: './at0006.component.html',
  styleUrls: ['./at0006.component.scss']
})
export class At0006Component implements OnInit {
  datamocks = DATA;

  // params
  public page = '0';
  public size = '20';

  public x = DATA.length;

  constructor(private dialogService: DialogService,
              private attendance: AttendanceService,
              private router: Router
  ) {}

  ngOnInit() {

    this.loadStaff();
  }
  loadStaff(){
    // setTimeout(() => {
    //   this.dialogService.setLoaderVisible(true);
    // });

  }

  onScrollDown(){
    console.log('-------datamock--------', this.datamocks);

  }

  // button search show dialog save and yes/no
  showDialog(){
    const title = '保存しますか ？';
    const click_dialog = this.dialogService.showMessage('warning', false, title, null, null, 'はい', 'いいえ');
    click_dialog.subscribe(
      resultArray => {
        if (resultArray.buttonName === 'ok') {
          this.router.navigate(['at/at0006']);
        }
      },
      error => console.log(error)
    );
  }

  // this.showMessage('success', false, 'MSG.DELETED', null, null, 'MSG.OK', null);
  // dialog OK da luu

  @HostListener('window:beforeunload', ['$event'])

  checkLoadPage() {
    this.dialogService.showMessage('warning', false, 'ME0023.MSG_TITLE', 'ME0023.MSG_RELOAD', null, 'MSG.STAY_ON', 'MSG.LEAVE').subscribe(
      (res: DialogResult) => {
        if (res.buttonName === 'ok') {
          setTimeout(() => {
            this.router.navigate(['']);
          }, 300);
        }
      }
    );
    return false;
  }


}
