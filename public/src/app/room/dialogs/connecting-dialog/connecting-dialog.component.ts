import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import { ReplaySubject } from 'rxjs';
import { ConnectionInitReply } from '../../connection-init-reply';

@Component({
  selector: 'app-connecting-dialog',
  templateUrl: './connecting-dialog.component.html',
  styleUrls: ['./connecting-dialog.component.scss']
})
export class ConnectingDialogComponent implements OnInit {
  @Input() reply$:ReplaySubject<ConnectionInitReply>;
  @Input() askToPassword:boolean;
  @Output() passwordSubmitted: EventEmitter<string> = new EventEmitter();

  connecting = true;

  submittedPassword:string;
  isPasswordSubmitted = false;

  constructor() {}

  ngOnInit(): void {
    console.log(this.reply$);
    this.reply$.subscribe(r => {
      this.connecting = false;
      if(r.result == "failed" && r.reason == "wrong_password") {
        this.submittedPassword = "";
        this.isPasswordSubmitted = false;
      }
    })
  }

  public authorizeWithPassword() {
    this.isPasswordSubmitted = true;
    this.passwordSubmitted.next(this.submittedPassword);
  }
  faKey = faKey;
  showPassword = false;

  getPasswordInputType() {
    if (this.showPassword) {
      return 'text';
    }
    return 'password';
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

}
