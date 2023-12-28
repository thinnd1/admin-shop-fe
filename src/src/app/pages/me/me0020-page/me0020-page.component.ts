import {Component, OnInit} from '@angular/core';
import {MeetingService} from '../../../services/meeting.service';
import {InterestedDrugsSettings} from '../../../models/me/interested-drugs-settings';
import {InterestedDrugsSettingsSaveResult} from '../../../models/me/interested-drugs-settings-save-rerult';
import {DialogService} from '../../../services/dialog.service';

@Component({
  selector: 'app-me0020-page',
  templateUrl: './me0020-page.component.html',
  styleUrls: ['./me0020-page.component.scss']
})
export class Me0020PageComponent implements OnInit {

  public model = new InterestedDrugsSettings();
  selectedAllItem = false;

  constructor(private meetingService: MeetingService, private dialogService: DialogService) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
  }

  ngOnInit() {
    this.getInterestedDrugs();
  }

  getInterestedDrugs() {
    this.meetingService.getInterestedDrugsSettings().subscribe((settings: InterestedDrugsSettings) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.model = settings;
      this.getCheckAllItem();
    });
  }

  getCheckAllItem() {
    let checkall;
    checkall = true;
    for (let i = 0; i < this.model.drugs.length; i++) {
      if (this.model.drugs[i].allSelected === false) {
        checkall = false;
        break;
      }
    }
    this.selectedAllItem = checkall;
  }
  checkAllSelected() {
    let check;
    if (this.selectedAllItem === true) {
      this.selectedAllItem = false;
      check = false;
    }else {
      this.selectedAllItem = true;
      check = true;
    }
    for (let i = 0; i < this.model.drugs.length; i++) {
      this.model.drugs[i].allSelected = check;
      for (let j = 0; j < this.model.drugs[i].items.length; j++) {
        this.model.drugs[i].items[j].selected = check;
      }
    }
  }

  removeItemDisplay(categoryId: number, itemId: number) {
    this.model.drugs[categoryId].items[itemId].selected = false;
    this.allCategoryDrug(categoryId);
    this.getCheckAllItem();
  }

  putInterestedDrugs() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    console.log(this.model);
    this.meetingService.putInterestedDrugsSettings(this.model).subscribe((response: InterestedDrugsSettingsSaveResult) => {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(false);
      });
      this.dialogService.showSuccess('ME0020.SAVED');
    });
  }

  checkItem( categoryIndex: number, itemIndex: number) {
    if (this.model.drugs[categoryIndex].items[itemIndex].selected === true) {
      this.selectedAllItem = false;
      this.model.drugs[categoryIndex].allSelected = false;
    }else {
      this.model.drugs[categoryIndex].items[itemIndex].selected = true;
      this.allCategoryDrug(categoryIndex);
      this.getCheckAllItem();
    }
  }

  allCategoryDrug(cate: number) {
    let check = true;
    for (let i = 0; i < this.model.drugs[cate].items.length; i++) {
      if (this.model.drugs[cate].items[i].selected === false) {
        check = false;
      }
    }
    this.model.drugs[cate].allSelected = check;
  }

  checkAllCategoryDrug(cate: number) {
    let check;
    check = false;
    if (this.model.drugs[cate].allSelected === true) {
      this.model.drugs[cate].allSelected = false;
      check = false;
    }else {
      this.model.drugs[cate].allSelected = true;
      check = true;
    }
    this.getCheckAllItem();
    for (let j = 0; j < this.model.drugs[cate].items.length; j++) {
      this.model.drugs[cate].items[j].selected = check;
    }
  }
}
