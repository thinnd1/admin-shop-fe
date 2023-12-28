import { Component, OnInit } from '@angular/core';
import { SharedValueService } from '../../../services/shared-value.service';

@Component({
  selector: 'app-he0008-page',
  templateUrl: './he0008-page.component.html',
  styleUrls: ['./he0008-page.component.scss']
})
export class He0008PageComponent implements OnInit {

  public lang: string = this.sharedValueService.lang;

  constructor(private sharedValueService: SharedValueService) { }

  ngOnInit() {
  }

}
