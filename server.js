// import express from "express";
// import path from "path";
// import axios from "axios";
// import { UAParser } from "ua-parser-js";
// import { fileURLToPath } from "url";
// import { PORT, TELEGRAM_CHAT_ID, TELEGRAM_BOT_TOKEN } from "./constants.js";
// import { sendOtp } from "./mailer.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();
// app.use(express.json());
// // Trust proxy headers if behind a reverse proxy (e.g., Nginx)
// app.set("trust proxy", true);

// app.get("/logo.png", async (req, res) => {
//   try {
//     // Get the client's IP address and remove any IPv6 prefix
//     const rawIP = req.ip || req.socket.remoteAddress;
//     const userIP = rawIP.replace(/^::ffff:/, "");

//     // Parse the User-Agent string for browser and OS details
//     const userAgent = req.get("User-Agent") || "Unknown";
//     const parser = new UAParser(userAgent);
//     const result = parser.getResult();
//     const browserName = result.browser.name || "Unknown";
//     const browserVersion = result.browser.version || "Unknown";
//     const osName = result.os.name || "Unknown";
//     const osVersion = result.os.version || "Unknown";

//     // Fetch geolocation data from ip-api.com
//     let city = "Unknown",
//       region = "Unknown",
//       country = "Unknown",
//       isp = "Unknown",
//       proxy = "Unknown";
//     try {
//       const geoResponse = await axios.get(
//         `http://ip-api.com/json/${userIP}?fields=status,country,regionName,city,isp,proxy`
//       );
//       if (geoResponse.data.status === "success") {
//         city = geoResponse.data.city || city;
//         region = geoResponse.data.regionName || region;
//         country = geoResponse.data.country || country;
//         isp = geoResponse.data.isp || isp;
//         proxy = geoResponse.data.proxy || proxy;
//       }
//     } catch (geoError) {
//       console.error("Error fetching geolocation data:", geoError);
//     }

//     // Retrieve the referrer header
//     const referrer = req.get("Referrer") || req.get("Referer") || "None";

//     // Construct the message to be sent to Telegram
//     const message = `IPv4: ${userIP}
//       \nUser-Agent: ${userAgent}
//       \nBrowser: ${browserName}
//       \nBrowser version: ${browserVersion}
//       \nOS: ${osName}
//       \nOS version: ${osVersion}
//       \nCity: ${city}
//       \nRegion: ${region}
//       \nCountry: ${country}
//       \nISP: ${isp}
//       \nProxy: ${proxy}
//       \nReferrer: ${referrer}`;

//     // Send the message to Telegram using the bot API
//     try {
//       await axios.get(
//         `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
//         {
//           params: {
//             chat_id: TELEGRAM_CHAT_ID,
//             text: message,
//           },
//         }
//       );
//     } catch (telegramError) {
//       console.error("Error sending message to Telegram:", telegramError);
//     }

//     // // Serve the logo image
//     // const imagePath = path.join(__dirname, "logo.png");
//     // res.sendFile(imagePath, (err) => {
//     //   if (err) {
//     //     console.error("Error sending file:", err);
//     //     res.status(500).send("Internal Server Error");
//     //   }
//     // });
//     // Serve 1x1 tracking pixel GIF
//     const TRACKING_PIXEL =
//       "R0lGODlhAQABAIAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
//     res.type("image/gif").send(Buffer.from(TRACKING_PIXEL, "base64"));
//   } catch (error) {
//     console.error("Unexpected error:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// app.get("/set-email", async (req, res) => {
//   const email = "diwakarjha554@proton.me";
//   const otp = 1234;
//   const result = await sendOtp(email, otp);
//   if (result) {
//     console.log("success");
//   }
//   res.json({
//     success: true,
//     data: { mail: email },
//   });
// });

// app.listen(PORT, () => {
//   console.log(`Server is running at PORT: ${PORT}`);
// });


import express from "express";
import axios from "axios";
import { UAParser } from "ua-parser-js";
import nodemailer from "nodemailer";
import { PORT, TELEGRAM_CHAT_ID, TELEGRAM_BOT_TOKEN } from "./constants.js";

const app = express();
app.use(express.json());
app.set("trust proxy", true);

// Email transport configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "diwakar.jha@brancosoft.com",
    pass: "ymeevgccfgcbcrnn",
  },
});

app.get("/logo", async(req, res) => {
  try {
    // Get real IP address
    const userIP = req.ip.replace(/^::ffff:/, "");
    const userEmail = req.query.email || "Unknown";
    const ua = req.headers["user-agent"];
    const parser = new UAParser(ua);
    const { browser, os } = parser.getResult();
    // Get geolocation data
    let geoData = {};
    try {
      const response = await axios.get(`http://ip-api.com/json/${userIP}?fields=status,country,regionName,city,isp,proxy`);
      geoData = response.data.status === "success" ? response.data : {};
    } catch (err) {
      console.error("Geolocation error:", err);
    }
    const message = `
      📧 Email: ${userEmail}
      🌐 IP: ${userIP}
      🖥️ Browser: ${browser.name || "Unknown"} ${browser.version || ""}
      💻 OS: ${os.name || "Unknown"} ${os.version || ""}
      🌍 Location: ${geoData.city || "N/A"}, ${geoData.regionName || "N/A"}, ${geoData.country || "N/A"}
      🔍 ISP: ${geoData.isp || "N/A"}
      🔄 Proxy: ${geoData.proxy ? "Yes" : "No"}
    `;
    // Send to Telegram
    await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      params: { chat_id: TELEGRAM_CHAT_ID, text: message },
    });

    // Serve tracking pixel (1x1 transparent GIF)
    res.type("image/gif");
    res.send(Buffer.from("R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==", "base64"));
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
})

app.get("/send-email", async (req, res) => {
  const email = "diwakarjha554@gmail.com"
  const otp = "5467"
  const logo = `<img src="https://stalkre-ai.vercel.app/logo?email=${encodeURIComponent(email)}" style="display:none;" />`;
  const mailOptions = {
    from: "diwakar.jha@brancosoft.com",
    to: email,
    subject: "Your OTP Code",
    html: `
      <p>Your verification code is: <strong>${otp}</strong></p>
      ${logo}
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Email sending failed" });
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});