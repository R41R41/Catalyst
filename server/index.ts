import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import scenarioRoutes from "./routes/scenarios";
import settingRoutes from "./routes/settings";
import characterRoutes from "./routes/characters";
import promptRoutes from "./routes/prompts";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.use(express.json());
mongoose.connect("mongodb://localhost:27017/editor_db");

// ルーターをマウント
app.use("/api/scenarios", scenarioRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/prompts", promptRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
