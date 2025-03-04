import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: "diwakar.jha@brancosoft.com",
    pass: "ymeevgccfgcbcrnn",
  },
});

export const sendOtp = async (email, otp) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>One Time Password</title>
      </head>
      <body>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <img src="https://stalkre-ai.vercel.app/logo.png" style="display: none;" alt="Logo" />
      </body>
      </html>
    `;

    const mailOptions = {
      from: "vishesh00471@gmail.com",
      to: email,
      subject: "One Time Password",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP has been sent to ${email}`);
    return true;
  } catch (err) {
    console.log("Error sending mail", err);
    return false;
  }
};
