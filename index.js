import express from "express";
import "dotenv/config";
import { connectDb } from "./db/client.js";

const app = express();
const port = 8000;

const startServer = async() => {
  await connectDb();
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

startServer().catch((error) => console.log(error, 'failed to start server'));