import { Component, OnInit,  Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-welcome-dialog',
  templateUrl: './welcome-dialog.component.html',
  styleUrls: ['./welcome-dialog.component.scss']
})
export class WelcomeDialogComponent implements OnInit {
  public inputNameText:string;
  @Output() enteredName = new EventEmitter<string>();
  constructor() { }

  ngOnInit(): void {
  }
  public saveName() {
    this.enteredName.emit(this.inputNameText);
  }

}
