import { Component, OnInit } from '@angular/core';
import { SharedValueService } from '../../../services/shared-value.service';

@Component({
  selector: 'app-he0014-page',
  templateUrl: './he0014-page.component.html',
  styleUrls: ['./he0014-page.component.scss']
})
export class He0014PageComponent implements OnInit {

  public lang: string = this.sharedValueService.lang;

  constructor(private sharedValueService: SharedValueService) { }

  ngOnInit() {
  }

}
