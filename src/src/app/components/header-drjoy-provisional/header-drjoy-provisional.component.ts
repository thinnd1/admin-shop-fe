import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header-drjoy-provisional',
  templateUrl: './header-drjoy-provisional.component.html',
  styleUrls: ['./header-drjoy-provisional.component.scss']
})
export class HeaderDrjoyProvisionalComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  logout() {
    this.router.navigate(['/logout', {replaceUrl: true}]);
  }

}
