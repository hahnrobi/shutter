import { ChatMessage } from './../chat-message';
import { ChatManagerService } from './../chat-manager.service';
import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
@Component({
  selector: 'app-chat-display',
  templateUrl: './chat-display.component.html',
  styleUrls: ['./chat-display.component.scss']
})
export class ChatDisplayComponent implements OnInit {
  messageBoxText:string="";
  messages:ChatMessage[];
  constructor(private _chatManagerService:ChatManagerService, private changeDetection: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this._chatManagerService.getMessages().subscribe(m => {
      this.messages = m;
    }); 
       //this._chatManagerService.addingMessage.subscribe((msg) => {this.messages = ; this.changeDetection.detectChanges();});
  }

  public sendMessage() {
    let msg = new ChatMessage(null, this.messageBoxText);
    this._chatManagerService.sendMessage(msg);
    this.messageBoxText = "";
  }

}
