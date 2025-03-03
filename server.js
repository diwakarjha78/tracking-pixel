import path from "path";
import axios from "axios";
import express from "express";
import { UAParser } from "ua-parser-js";
import { fileURLToPath } from "url";
import { PORT, TELEGRAM_CHAT_ID, TELEGRAM_BOT_TOKEN } from "./constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = PORT;

app.use(express.json());
app.set("trust proxy", true);

app.get("/logo.png", async (req, res) => {
  const rawIP = req.ip || req.socket.remoteAddress;
  const userIP = rawIP.replace(/^::ffff:/, "");
  const userAgent = req.get("User-Agent");
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  const browserName = result.browser.name || "Unknown";
  const browserVersion = result.browser.version || "Unknown";
  const osName = result.os.name || "Unknown";
  const osVersion = result.os.version || "Unknown";
  const referrer = req.get("Referrer") || req.get("Referer") || "None";

  const message = `IP: ${userIP}\nUser-Agent: ${userAgent}\nBrowser: ${browserName}\nBrowser version: ${browserVersion}\nOS: ${osName} \nOS version: ${osVersion}\nReferrer: ${referrer}`;

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
  } catch (error) {
    console.error("Error sending message to Telegram:", error);
  }

  const imagePath = path.join(__dirname, "logo.png");
  res.sendFile(imagePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running at PORT: ${port}`);
});
