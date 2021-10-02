import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from 'src/app/room/user/user';

@Component({
  selector: 'app-waiting-user',
  templateUrl: './waiting-user.component.html',
  styleUrls: ['./waiting-user.component.scss']
})
export class WaitingUserComponent implements OnInit {
  @Input() entry:[string, User];
  @Output() approveEvent: EventEmitter<[boolean, string]> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  approveWaitingUser() {
    this.approveEvent.emit([true, this.entry[0]]);
  }
  denyWaitingUser() {
    this.approveEvent.emit([false, this.entry[0]]);
  }

}
