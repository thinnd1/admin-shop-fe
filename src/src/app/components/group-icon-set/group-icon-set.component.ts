import {
  Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import {SharedValueService} from '../../services/shared-value.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-group-icon-set',
  templateUrl: './group-icon-set.component.html',
  styleUrls: ['./group-icon-set.component.scss'],
  preserveWhitespaces: false
})
export class GroupIconSetComponent implements OnInit, OnChanges {

  @Input('groupIconSetOptions') groupIconSetOptions: any;
  @Input('imageUrl') imageUrl: string;
  @Output() iconImageChanged = new EventEmitter<any>();
  public lang: string;
  public windowURL: any = (<any>window).URL || (<any>window).webkitURL;
  public groupAvatar: string;

  constructor(
    private sharedValueService: SharedValueService,
    private dialogService: DialogService
  ) {
  }

  ngOnInit() {
    this.lang = this.sharedValueService.lang;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['groupIconSetOptions']) {
      this.isAdminCheck();
      this.groupIconClassOptions();
    }
    if (changes['imageUrl']) {
      this.groupAvatar = this.imageUrl;
    }
  }

  isAdminCheck() {
    if (this.groupIconSetOptions.admin) {
      return true;
    }
    return false;
  }

  groupIconClassOptions() {
    const classArr = [];
    if (this.isAdminCheck()) {
      classArr.push('group-icon-set-admin');
    }
    classArr.push('group-icon-set-' + this.groupIconSetOptions.iconSize);
    return classArr;
  }

  onMouseClick($event) {
    if (!this.isAdminCheck()) {
      return;
    };
    this.dialogService
      .showCropperDialog(true, null, 'MSG.SAVE', {
        id: this.groupIconSetOptions.groupId,
        type: 'group' ,
        imageUrl: this.groupAvatar,
        isConfirm: true,
        checkCallValidate: true,
        isCheckValidate: false
      })
      .subscribe((res) => {
        if (res.buttonName === 'ok' && res.payload) {
          res.payload.subscribe(result => {
            this.iconImageChanged.emit(result.value);
            if (result.value) {
              this.groupAvatar = this.windowURL.createObjectURL(result.value);
            } else {
              this.groupAvatar = null;
            }
          });
        }
      });
  }

}
