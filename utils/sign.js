
const MD5 = require('md5.js')

const appid = "60313"
const nonce = "aDwQZGXgI"
const version = "1.0"
const app_secret = "2B8590308CD33D76F7B624B4C7098247"
var openid = ""

function getSign(jsonObj) {
  if (Object.keys(jsonObj).length == 0) {
    console.error('Sign error');
    return null;
  }

  let signObj = JSON.parse(JSON.stringify(jsonObj));
  signObj.app_secret = app_secret;
  return sign(signObj);
}

function sign(jsonObj) {
  let sortedKeys = Object.keys(jsonObj).sort();
  var str = "";
  let app_secret = jsonObj.app_secret;
  for (var i = 0; i < sortedKeys.length; ++i) {
    if (sortedKeys[i] !== "app_secret")
      str += (sortedKeys[i] + "" + jsonObj[sortedKeys[i]]);
    else
      continue;
  }
  str += ("" + app_secret);
  console.log(str)

  return MD5.hexMD5(str);
}

module.exports = {
  getSign: getSign,
  appid: appid,
  nonce: nonce,
  version: version,
  app_secret: app_secret,
  openid: openid,
}