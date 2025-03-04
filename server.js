import express from "express";
import path from "path";
import axios from "axios";
import { UAParser } from "ua-parser-js";
import { fileURLToPath } from "url";
import { PORT, TELEGRAM_CHAT_ID, TELEGRAM_BOT_TOKEN } from "./constants.js";
import { sendOtp } from "./mailer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
// Trust proxy headers if behind a reverse proxy (e.g., Nginx)
app.set("trust proxy", true);

app.get("/logo.png", async (req, res) => {
  try {
    // Get the client's IP address and remove any IPv6 prefix
    const rawIP = req.ip || req.socket.remoteAddress;
    const userIP = rawIP.replace(/^::ffff:/, "");

    // Parse the User-Agent string for browser and OS details
    const userAgent = req.get("User-Agent") || "Unknown";
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    const browserName = result.browser.name || "Unknown";
    const browserVersion = result.browser.version || "Unknown";
    const osName = result.os.name || "Unknown";
    const osVersion = result.os.version || "Unknown";

    // Fetch geolocation data from ip-api.com
    let city = "Unknown",
      region = "Unknown",
      country = "Unknown",
      isp = "Unknown",
      proxy = "Unknown";
    try {
      const geoResponse = await axios.get(
        `http://ip-api.com/json/${userIP}?fields=status,country,regionName,city,isp,proxy`
      );
      if (geoResponse.data.status === "success") {
        city = geoResponse.data.city || city;
        region = geoResponse.data.regionName || region;
        country = geoResponse.data.country || country;
        isp = geoResponse.data.isp || isp;
        proxy = geoResponse.data.proxy || proxy;
      }
    } catch (geoError) {
      console.error("Error fetching geolocation data:", geoError);
    }

    // Retrieve the referrer header
    const referrer = req.get("Referrer") || req.get("Referer") || "None";

    // Construct the message to be sent to Telegram
    const message = `IPv4: ${userIP}
      User-Agent: ${userAgent}
      Browser: ${browserName}
      Browser version: ${browserVersion}
      OS: ${osName}
      OS version: ${osVersion}
      City: ${city}
      Region: ${region}
      Country: ${country}
      ISP: ${isp}
      Proxy: ${proxy}
      Referrer: ${referrer}`;

    // Send the message to Telegram using the bot API
    try {
      await axios.get(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          params: {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
          },
        }
      );
    } catch (telegramError) {
      console.error("Error sending message to Telegram:", telegramError);
    }

    // Serve the logo image
    const imagePath = path.join(__dirname, "logo.png");
    res.sendFile(imagePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Internal Server Error");
      }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/set-email", async (req, res) => {
  const email = "diwakarjha554@gmail.com";
  const otp = 1234
  const result = await sendOtp(email, otp)
  if (result) {
    console.log("success");
    
  }
  res.json({
    success: true,
    data: { mail: email },
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at PORT: ${PORT}`);
});
