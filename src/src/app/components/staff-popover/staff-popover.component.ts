import {Component, OnInit, EventEmitter, Input, Output, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-staff-popover',
  templateUrl: './staff-popover.component.html',
  styleUrls: ['./staff-popover.component.scss'],
  preserveWhitespaces: false
})
export class StaffPopoverComponent implements OnInit, OnChanges {
  @Input('userIds') userIds: any[];
  @Input('listUserInfo') listUserInfo: any[];
  @Input() isGroupOutside = false;
  @Input() startIndex: number;
  /** isSortKana = true : Sort by nameKana
   * isSortKana = false: default sort
   */
  @Input() isSortKana = true;
  @Input() staffPopoverOptions: any = {
    text: '',
    fontWeight: 'bold',
    color: ''
  };
  @Output() clickStaffPopoverLink = new EventEmitter<any>();

  public limit = 10;
  public otherStaff = 0;
  public displayList = [];
  param;

  constructor() {}

  ngOnInit() {
    // this.setUsers();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['listUserInfo'] && this.listUserInfo.length > 0 || changes['userIds'] && this.userIds.length > 0) {
      this.setUsers();
    }
  }

  setUsers() {
    let tempArr = [];
    if (this.userIds) {
      if (this.startIndex > 0) {
        const arr = this.listUserInfo.filter(item => this.userIds.indexOf(item.id) !== -1);
        tempArr =  arr.slice(this.startIndex, this.userIds.length);
        for (let i = 0; i < tempArr.length; i++) {
          if (this.displayList.indexOf(tempArr[i].id) === -1) {
            this.displayList.push(tempArr[i].id);
          }
        }
      } else if (this.startIndex === 0) {
        this.displayList  = this.userIds.slice(0, -1);
      } else {
        this.displayList = this.userIds;
      }
    }


    if (this.displayList.length > this.limit) {
      this.otherStaff = this.displayList.length - this.limit;
      this.param = {value: this.otherStaff};
    }
  }

  clickLink(event: any) {
    this.clickStaffPopoverLink.emit(this.userIds);
  }

}
