import { BehaviorSubject } from 'rxjs';
import { MediaStreamProvider } from './../mediastreamprovider';
import { UserStatus } from './../user-status/user-status';
export class User {
	public clientId:string;
	public isMe:boolean = false;
	public name:string;
	public mediaStreamProvider:MediaStreamProvider;
	public status:UserStatus;
	public spectator:boolean;
	private _locallyMuted:boolean = false;
	public localMuteStateChanged:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	constructor() {
		this.status = new UserStatus();
		this.name = "Connecting...";
		this.spectator = false;
	}
	get locallyMuted():boolean {
		return this._locallyMuted;
	}
	set locallyMuted(value :boolean) {
		this._locallyMuted = value;
		if(value) {
			this.mediaStreamProvider.muteStream();
		}else {
			this.mediaStreamProvider.unMuteStream();
		}
		this.localMuteStateChanged.next(value);
	}

}
