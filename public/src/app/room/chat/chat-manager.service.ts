import { ChatMessage } from './chat-message';
import { Injectable } from '@angular/core';
import { of, ReplaySubject, BehaviorSubject, Observable } from 'rxjs';
import { User } from '../user/user';

@Injectable({
  providedIn: 'root'
})
export class ChatManagerService {
  public tryToSendMessage:ReplaySubject<ChatMessage> = new ReplaySubject<ChatMessage>(1);
  public addingMessage:ReplaySubject<ChatMessage> = new ReplaySubject<ChatMessage>(1);

  constructor() { }
  private messages:ChatMessage[] = [];

  private cloneMessageArray() {
    return JSON.parse(JSON.stringify(this.messages));
  }

  public addMessage(msg:ChatMessage):Observable<ChatMessage[]> {
    console.log("[CHAT-MANAGER] Adding message: " + msg.message);
    this.messages.push(msg);
    this.addingMessage.next(msg);
    return of(this.cloneMessageArray());
  }
  public sendMessage(msg:ChatMessage) {
    console.log("[CHAT-MANAGER] Sending message: " + msg.message);
    this.tryToSendMessage.next(msg);
  }
  public getMessages() {
    return of(this.cloneMessageArray());
  }
  public getMessagesDirect() {
    return this.cloneMessageArray();
  }
  public broadcastMessage(msg:string) {
    let u = new User();
    u.name = "System";

    let m = new ChatMessage(u, msg);
    this.addMessage(m);
  }
}
