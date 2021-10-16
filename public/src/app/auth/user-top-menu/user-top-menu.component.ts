import { LoggedInUserService } from './../logged-in-user.service';
import { Component, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { User } from '../user';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'auth-user-top-menu',
  templateUrl: './user-top-menu.component.html',
  styleUrls: ['./user-top-menu.component.scss']
})
export class UserTopMenuComponent implements OnInit {
  private loggedInUserService:LoggedInUserService;
  $user:ReplaySubject<User>;
  $isLoggedIn:ReplaySubject<boolean>;
  constructor(loggedInUserSerivce:LoggedInUserService) {
    this.loggedInUserService = loggedInUserSerivce;
    this.$user = loggedInUserSerivce.$user;
    this.$isLoggedIn = loggedInUserSerivce.$isLoggedIn;
  }

  ngOnInit(): void {
  }

}
