import { User } from "./user/user";

export class Room {
	id:string;
	name:string;
	slug:string;
	auth_type:"passwword"|"approve";
	owner: User;
}
