import { Component, OnInit } from '@angular/core';
import {SharedValueService} from '../../services/shared-value.service';

@Component({
  selector: 'app-col-sub-pr',
  templateUrl: './col-sub-pr.component.html',
  styleUrls: ['./col-sub-pr.component.scss']
})
export class ColSubPrComponent implements OnInit {
  public lang: string;

  constructor(private sharedValueService: SharedValueService) { }

  ngOnInit() {
    this.lang = this.sharedValueService.lang;
  }

}
