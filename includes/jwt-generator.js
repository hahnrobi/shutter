module.exports.generate = (payload, exp = 0) => {
  let token = {};
  let current_time = ~~(Date.now() / 1000);
  if (exp <= current_time) {
    exp = current_time + 7200;
  }
  if(typeof payload === 'object') {
    token = {...token, ...payload};
  }else {
    token.payload = payload;
  }
  token.exp = exp;
  token.iat = current_time;
  return token;
}