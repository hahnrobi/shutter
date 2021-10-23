
export class Room {
	id:string;
	_id:string;
	name:string;
	slug:string;
	auth_type:"password"|"approve"|"none" = "none";
	auth_password:string;
	owner: {};
	public:boolean;
	last_active:number;
	created_at:number;
}
