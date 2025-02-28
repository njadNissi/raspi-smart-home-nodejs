const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "username@gmail.com",
        pass: "encrypted pwd"
    }

    /**service: "qq",
    auth: {
        user: "user-number@qq.com",
        pass: "encrypted pwd"
    }*/
});

module.exports.sendEmail = async (message) => {
    const mailOptions = {
        from: "NJAD SMART-HOME-OFFICE SMART",
        to: "receiver-email@qq.com",
        subject: "NJAD SMART-HOME-OFFICE SMART",
        html: "<h1 style='color:Tomato;'>" + message + "</h1>" + 
            "<h3>" + Date() + "</h3>" +
        "<a href='http://localhost:3000/'>OPEN SMART-HOMEOFFICE</a>"
    };

    console.log("Sending an Email now..");

    transporter.sendMail(mailOptions,
        function (error, info) {
            if (error) { console.log(error); }
            else { console.log("Message sent: " + info.response); }
        });
};