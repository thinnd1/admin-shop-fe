import { Component, OnInit } from '@angular/core';
import { SharedValueService } from '../../../services/shared-value.service';
import {LocalStorage} from '../../../services/local-storage.service';
import {Location} from '@angular/common';

@Component({
  selector: 'app-he0011-page',
  templateUrl: './he0011-page.component.html',
  styleUrls: ['./he0011-page.component.scss']
})
export class He0011PageComponent implements OnInit {

  public lang: string = this.sharedValueService.lang;

  constructor(private sharedValueService: SharedValueService, private location: Location, private localStorage: LocalStorage) { }

  ngOnInit() {
  }

  goToBack() {
    this.localStorage.setObject('calendarSettingTap', {tap: 3});
    this.location.back();
  }
}
