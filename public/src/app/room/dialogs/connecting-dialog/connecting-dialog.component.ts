import { Component, Input, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { ConnectionInitReply } from '../../connection-init-reply';

@Component({
  selector: 'app-connecting-dialog',
  templateUrl: './connecting-dialog.component.html',
  styleUrls: ['./connecting-dialog.component.scss']
})
export class ConnectingDialogComponent implements OnInit {
  @Input() reply:ReplaySubject<ConnectionInitReply>;
  constructor() { }

  ngOnInit(): void {
  }

}
