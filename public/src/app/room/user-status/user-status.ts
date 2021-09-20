import { ReplaySubject } from "rxjs";

export class UserStatus {
	public clientId:string;
	public isMuted:boolean;
	public isVideoOff:boolean;
	public isSpeaking:boolean;

	constructor() {
		this.isMuted = false;
		this.isVideoOff = false;
		this.isSpeaking = false;
	}
}
