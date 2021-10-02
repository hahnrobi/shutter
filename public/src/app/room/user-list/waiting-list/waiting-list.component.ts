import { ConnectionService } from './../../../connection.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-waiting-list',
  templateUrl: './waiting-list.component.html',
  styleUrls: ['./waiting-list.component.scss']
})
export class WaitingListComponent implements OnInit {
  public connectionService:ConnectionService
  constructor(_connectionService:ConnectionService) {
    this.connectionService = _connectionService;
    this.connectionService.usersOnApproval.subscribe(u => console.log(u));
  }

  ngOnInit(): void {
  }

  approveWaitingUser(reply:[boolean, string]) {
    this.connectionService.approveWaitingUser(reply[1], reply[0]);
  }
}
