import { Component, OnInit } from '@angular/core';
import { SharedValueService } from '../../../services/shared-value.service';

@Component({
  selector: 'app-he0009-page',
  templateUrl: './he0009-page.component.html',
  styleUrls: ['./he0009-page.component.scss']
})
export class He0009PageComponent implements OnInit {

  public lang: string = this.sharedValueService.lang;

  constructor(private sharedValueService: SharedValueService) { }

  ngOnInit() {
  }

}
