import { AuthService } from './../../../auth/auth.service';
import { ReplaySubject } from 'rxjs';
import { ISelfDataProvider } from './../iself-data-provider';
export class ExistingUserDataProvider implements ISelfDataProvider {
	constructor(private authService:AuthService) {
		this.nameUpdated = new ReplaySubject<string>();
		this.authService.$user.subscribe(user => {
			this.setName(user.name);
		})
	}
	private _name = "";
	isLocal = false;
	getName(): string {
		return this._name;
	}
	setName(name: string): boolean {
		this._name = name;
		this.nameUpdated.next(name);
		return true;
	}
	nameUpdated: ReplaySubject<string>;
}
