import { User } from './../user/user';
export class ChatMessage {
	public sender:User;
	public message:string;
	constructor(sender:User, message:string) {
		this.sender = sender;
		this.message = message;
	}
}
