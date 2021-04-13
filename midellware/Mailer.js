const nodemailer = require("nodemailer");

module.exports = async (To , content)=>{
   // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing


let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.Email,
        pass: process.env.Email_Pwd
    }
});

let mailOptions = {
    from: process.env.Email, // TODO: email sender
    to: To, // TODO: email receiver
    subject: 'Login ',
    text: content
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error.message);
    }
    console.log('success');
});

};
