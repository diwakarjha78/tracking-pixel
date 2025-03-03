import express from "express";
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import { PORT } from "./constants/index.js";

const port = PORT;

const app = express();

app.use(cors());
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);
app.use(express.json());
app.use(bodyParser.json());

// Define a route for the root URL
app.get("/", (req, res) => {
  res.send("Hello, Express server!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at PORT: ${port}`);
});
