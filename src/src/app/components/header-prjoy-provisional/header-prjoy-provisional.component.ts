import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header-prjoy-provisional',
  templateUrl: './header-prjoy-provisional.component.html',
  styleUrls: ['./header-prjoy-provisional.component.scss']
})
export class HeaderPrjoyProvisionalComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  logout() {
    this.router.navigate(['/logout', 'prjoy']);
  }

}

