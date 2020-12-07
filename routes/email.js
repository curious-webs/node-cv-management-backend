const nodemailer = require("nodemailer");
const { verify_html } = require("../email-templates/verify");
const { reset_password_html } = require("../email-templates/reset_password");
const { mailTransporter } = require("../mail-server/server");

async function sendEmail(user, token,subject,template) {
  if(template=="reset_password") html_template = reset_password_html(user.userName, token);
  if(template=="verify_email") html_template = verify_html(user.userName, token);

  let mailDetails = { 
    from: "jaspreet@curiouswebs.in",
    to: user.email,
    subject: subject,
    html: html_template,
  };
  try {
    const ismailSent = await mailTransporter.sendMail(mailDetails);
    return true;
  } catch (e) {
    console.log("Email sent Failed due to");
    console.log(e);
    return false;
  }
}

module.exports.sendEmail = sendEmail;
