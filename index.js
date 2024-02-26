import express from "express";
import "dotenv/config";
import { connectDb } from "./db/client.js";
import usersRouter from "./routes/users.js";
import skillsRouter from "./routes/skills.js";
import cors from "cors";

const app = express();
const port = 8000;

app.use(cors());

app.use(express.json());
app.use("/discover", usersRouter);
app.use("/skills", skillsRouter);


const startServer = async() => {
  await connectDb();
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

startServer().catch((error) => console.log(error, 'failed to start server'));