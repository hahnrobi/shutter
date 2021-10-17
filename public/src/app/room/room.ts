
export class Room {
	id:string;
	name:string;
	slug:string;
	auth_type:"password"|"approve"|"none" = "none";
	auth_password:string;
	owner: {};
	public:boolean;
}
