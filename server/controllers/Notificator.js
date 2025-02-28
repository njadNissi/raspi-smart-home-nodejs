// Importing packages
const cron = require("node-cron");
const nodemailer = require("nodemailer");

// Calling sendEmail() function every 1 minute
// cron.schedule("*/1 * * * *", function() {
// sendMail();
// });

// Send Mail function using Nodemailer
function sendMail() {
	let mailTransporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
		user: "<your-email>@gmail.com",
		pass: "**********"
		}
	});
	
	// Setting credentials
	let mailDetails = {
		from: "<your-email>@gmail.com",
		to: "<user-email>@gmail.com",
		subject: "Test mail using Cron job",
		text: "Node.js cron job email"
		+ " testing for GeeksforGeeks"
	};
	
	
	// Sending Email
	mailTransporter.sendMail(mailDetails,
					function(err, data) {
		if (err) {
			console.log("Error Occurs", err);
		} else {
			console.log("Email sent successfully");
		}
	});
}

app.listen(3000);
