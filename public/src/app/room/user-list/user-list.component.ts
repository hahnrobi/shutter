import { UserManagerService } from './../user-manager.service';
import { Component, OnInit } from '@angular/core';
import { User } from '../user/user';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  animations: [
    trigger('modalState', [
      state('true', style({
        opacity: '1'
      })),
      state('false', style({
        opacity: '0'
      })),
      transition('* => *', animate('200ms ease'))
    ])
  ]
})
export class UserListComponent implements OnInit {
  private _userManagerService:UserManagerService;
  users = [];

  constructor(_userManagerService:UserManagerService) {
    this._userManagerService = _userManagerService;
  }

  ngOnInit(): void {
    this._userManagerService.getUsers().subscribe(v => {
      this.users = v;
    })
  }

}
