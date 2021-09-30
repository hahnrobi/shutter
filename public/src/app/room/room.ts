import { User } from "./user/user";

export class Room {
	id:string;
	name:string;
	slug:string;
	auth_type:"password"|"approve";
	owner: User;
}
