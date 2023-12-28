import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {SharedValueService} from '../../services/shared-value.service';
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-group-icon',
  templateUrl: './group-icon.component.html',
  styleUrls: ['./group-icon.component.scss'],
  preserveWhitespaces: false
})
export class GroupIconComponent implements OnInit, OnChanges {
  @Input('groupId') groupId: string;
  @Input('groupAvatar') groupAvatar: string;
  @Input() iconSize = 30;
  public lang: string;
  // iconSize: 30 or 40 or 55 or 76 or 94
  public iconPath: any;
  public groupName: string;

  constructor(private sharedValueService: SharedValueService,private domSanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.lang = this.sharedValueService.lang;
    // const iconPath = '/assets/img/user.png';
    this.iconPath = '/assets/img/group-icon-no-image-' + this.lang + '.png';
    // TODO mock
    this.groupName = 'グループ名';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['groupAvatar']) {
      this.iconPath = this.groupAvatar ? this.domSanitizer.bypassSecurityTrustUrl(this.groupAvatar) :
        '/assets/img/group-icon-no-image-' + this.lang + '.png';
    }
  }

}
