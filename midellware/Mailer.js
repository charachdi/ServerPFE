const nodemailer = require("nodemailer");

module.exports = async ()=>{
   // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing

 // Step 1
let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "gmail",
    port: 587,
    secure: false, 
    auth: {
        user: process.env.Email,  // TODO: your gmail account
        pass: process.env.Email_Pwd  // TODO: your gmail password
    }
});


console.log(`
email : ${process.env.Email}
pass : ${process.env.Email_Pwd}`)

// Step 2
let mailOptions = {
    from: process.env.Email, // TODO: email sender
    to: 'aminehaboubi00@gmail.com', // TODO: email receiver
    subject: 'Nodemailer - Test',
    text: 'Wooohooo it works!!'
};

// Step 3
transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
        console.log('Error occurs'+ err);
    }
    else{
        console.log('Email sent!!!');
    }
   
});

};
