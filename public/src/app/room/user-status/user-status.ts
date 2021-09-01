
export class UserStatus {
	public clientId:string;
	public isMuted:boolean;
	public isVideoOff:boolean;
	public isSpeaking:boolean;
	constructor() {
		this.isMuted = true;
		this.isVideoOff = true;
		this.isSpeaking = false;
	}
}
