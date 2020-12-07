const nodemailer = require("nodemailer");
// The credentials for the email account you want to send mail from.
const credentials = {
  host: "smtp.hostinger.in",
  port: 587,
  secure: false,
  auth: {
    // These environment variables will be pulled from the .env file
    user: "admin@curiouswebs.in",
    pass: "*********",
  },
  tls: {
    rejectUnauthorized: false,
  },
};

module.exports.mailTransporter = nodemailer.createTransport(credentials);
