const {baseUrl} = require("../common/common");


function reset_password_html(userName,token) {
    return `<p>Hi ${userName},</p><p>Please click below link to reset your password.</p>
      <a href="http://localhost:3001/reset-password/?token=${token}">http://localhost:3001/api/users/reset-password/?${token}</a>. Kindly ignore this email 
      if you didn't ask for password reset`;
  }   
   
  module.exports.reset_password_html = reset_password_html;
  