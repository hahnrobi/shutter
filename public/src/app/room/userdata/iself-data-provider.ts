import { ReplaySubject } from 'rxjs';

export interface ISelfDataProvider {
	isLocal:boolean;
	getName():string;
	getProfileImageUrl():string;
	setName(name:string):boolean;
	nameUpdated:ReplaySubject<string>;
}
