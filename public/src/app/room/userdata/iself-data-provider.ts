import { ReplaySubject } from 'rxjs';

export interface ISelfDataProvider {
	isLocal:boolean;
	getName():string;
	setName(name:string):boolean;
	nameUpdated:ReplaySubject<string>;
}
