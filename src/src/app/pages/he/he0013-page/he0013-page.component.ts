import { Component, OnInit } from '@angular/core';
import { SharedValueService } from '../../../services/shared-value.service';

@Component({
  selector: 'app-he0013-page',
  templateUrl: './he0013-page.component.html',
  styleUrls: ['./he0013-page.component.scss']
})
export class He0013PageComponent implements OnInit {

  public lang: string = this.sharedValueService.lang;

  constructor(private sharedValueService: SharedValueService) { }

  ngOnInit() {
  }

}
