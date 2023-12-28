import { Component, OnInit } from '@angular/core';
import { SharedValueService } from '../../../services/shared-value.service';

@Component({
  selector: 'app-he0010-page',
  templateUrl: './he0010-page.component.html',
  styleUrls: ['./he0010-page.component.scss']
})
export class He0010PageComponent implements OnInit {

  public lang: string = this.sharedValueService.lang;

  constructor(private sharedValueService: SharedValueService) { }

  ngOnInit() {
  }

}
