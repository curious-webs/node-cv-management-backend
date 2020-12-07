const {baseUrl} = require("../common/common");

function verify_html(userName,token) {
  return `<p>Hi ${userName},</p><p>Please click below link to verify your email.</p>
    <a href="http://localhost:3001/verify-email/?token=${token}">${baseUrl}api/users/verify/:${token}</a>. Kindly ignore this email 
    if you didn't signup.`;
}   
 
module.exports.verify_html = verify_html;
