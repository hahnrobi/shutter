import { ReplaySubject } from 'rxjs';
import { ISelfDataProvider } from './../iself-data-provider';
export class SelfDataLocalStorageProvider implements ISelfDataProvider {
	public isLocal = true;
	
	private _name = "";
	private getLocalStorageData() {
		let userData = localStorage.getItem('userData');
		let lsData = null;
		if(!(userData == undefined || userData == null)) {
		  try {
			let data = JSON.parse(userData);
			lsData = data;
			return data;
		  }
		  catch(e) {
			console.error(e);
		  }
		};
		return null;
	}
	constructor() {
		this.nameUpdated = new ReplaySubject<string>();
	}
	public nameUpdated:ReplaySubject<string>;
	public getName() {
		let data = this.getLocalStorageData();
		if(data != null) {
			this._name = data.name;	
		}
		return this._name;
	}
	public setName(name:string) {
		let data = this.getLocalStorageData();
		if(data == null) {
			data = {};
		}
		data.name = name;
		localStorage.setItem("userData", JSON.stringify(data));
		this.nameUpdated.next(name);
		return true;
	}
}
