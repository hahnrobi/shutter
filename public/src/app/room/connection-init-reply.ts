export class ConnectionInitReply {
	result:"successful"|"failed"
	reason:undefined|"wrong_password"|"waiting_approval"|"approval_denied"|"no_auth_user"
}
