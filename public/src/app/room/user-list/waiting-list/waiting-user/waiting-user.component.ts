import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from 'src/app/room/user/user';

@Component({
  selector: 'app-waiting-user',
  templateUrl: './waiting-user.component.html',
  styleUrls: ['./waiting-user.component.scss']
})
export class WaitingUserComponent implements OnInit {
  @Input() entry:[string, User, boolean];
  @Output() approveEvent: EventEmitter<[boolean, string, boolean]> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  approveWaitingUser() {
    this.approveEvent.emit([true, this.entry[0], false]);
  }
  approveWaitingUserPermanent() {
    this.approveEvent.emit([true, this.entry[0], true]);
  }
  denyWaitingUser() {
    this.approveEvent.emit([false, this.entry[0], false]);
  }

}
