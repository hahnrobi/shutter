import { MediaStreamProvider } from './../mediastreamprovider';
import { UserStatus } from './../user-status/user-status';
export class User {
	public clientId:string;
	public isMe:boolean = false;
	public name:string;
	public mediaStreamProvider:MediaStreamProvider;
	public status:UserStatus;
	constructor() {
		this.status = new UserStatus();
		this.name = "Connecting...";
	}
}
