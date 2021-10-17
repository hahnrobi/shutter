import { AuthService } from './../auth.service';
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
  $user:ReplaySubject<User>;
  $isLoggedIn:ReplaySubject<boolean>;
  constructor(private authService:AuthService) {
    this.$user = authService.$user;
    this.$isLoggedIn = authService.$isLoggedIn;
  }

  ngOnInit(): void {
  }

}
