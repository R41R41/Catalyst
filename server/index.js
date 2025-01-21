import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import mongoose from "mongoose";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Prompt, DefaultPrompt } from "./models/Prompt.js";
import fileRoutes from "./routes/files.js";
import promptRoutes from "./routes/prompts.js";
import defaultPromptRoutes from "./routes/defaultPrompts.js";
import { OpenAIService } from "./services/openaiService.js";
import dotenv from "dotenv";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.SERVER_PORT || 5000;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;
const openaiService = new OpenAIService();
app.use(cors({
    origin: `http://localhost:${FRONTEND_PORT}`,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
}));
app.use(express.json());
// WebSocketのセットアップ
wss.on("connection", (clientWs) => {
    clientWs.on("open", () => {
        console.log("\x1b[34mClient connected\x1b[0m");
    });
    clientWs.on("message", async (message) => {
        try {
            const parsedMessage = await JSON.parse(message.toString());
            if (parsedMessage.type === "text") {
                console.log("\x1b[32mReceived text message:\x1b[0m", parsedMessage.content);
                // テキストメッセージの処理
                await openaiService.processTextInput(parsedMessage.content);
            }
            else if (parsedMessage.type === "audio_append") {
                console.log("\x1b[32mReceived audio_append message:\x1b[0m");
                // 音声データの処理
                await openaiService.processVoiceInput(parsedMessage.content);
            }
            else if (parsedMessage.type === "audio_commit") {
                console.log("\x1b[34mReceived audio_commit message:\x1b[0m");
                await openaiService.commitAudioBuffer();
            }
        }
        catch (error) {
            console.error("\x1b[31mError processing message:\x1b[0m", error);
        }
    });
    // OpenAIからの応答をクライアントに送信
    openaiService.setTextCallback((text) => {
        console.log("\x1b[32mSending response to client:\x1b[0m", text);
        clientWs.send(JSON.stringify({ type: "text", content: text }));
    });
    openaiService.setTextDoneCallback(() => {
        console.log("\x1b[34mSending text_done to client\x1b[0m");
        clientWs.send(JSON.stringify({ type: "text_done" }));
    });
    openaiService.setAudioCallback((audio) => {
        console.log("\x1b[32mSending audio to client\x1b[0m", audio.length);
        clientWs.send(JSON.stringify({ type: "audio", content: audio }));
    });
    openaiService.setAudioDoneCallback(() => {
        console.log("\x1b[34mSending audio_done to client\x1b[0m");
        clientWs.send(JSON.stringify({ type: "audio_done" }));
    });
    clientWs.on("close", () => {
        console.log("\x1b[31mClient disconnected\x1b[0m");
        openaiService.cleanup();
    });
});
// 初期プロンプトの読み込みと保存
const initializePrompts = async () => {
    try {
        const existingPrompts = await Prompt.find();
        const promptsDir = path.join(__dirname, "defaultPrompts");
        const files = fs.readdirSync(promptsDir);
        const existingPromptNames = existingPrompts.map((prompt) => prompt.name);
        // 重複するプロンプトを削除
        await Prompt.deleteMany({ name: { $in: existingPromptNames } });
        const existingPrompts2 = await Prompt.find();
        const existingPromptNames2 = existingPrompts2.map((prompt) => prompt.name);
        let index = 0;
        for (const file of files) {
            if (file.endsWith(".txt")) {
                const name = path.basename(file, ".txt");
                // 既存のプロンプトに存在しない場合のみ追加
                if (!existingPromptNames2.includes(name)) {
                    const content = fs.readFileSync(path.join(promptsDir, file), "utf-8");
                    await Prompt.create({
                        id: new mongoose.Types.ObjectId().toString(),
                        name,
                        content,
                        isFolder: false,
                        isToggleOpen: false,
                        isContentOpen: false,
                        parentId: "prompts",
                        index: index,
                    });
                    index++;
                }
            }
        }
        console.log("\x1b[32mプロンプトを初期化しました\x1b[0m");
    }
    catch (error) {
        console.error("\x1b[31mプロンプトの初期化に失敗しました:\x1b[0m", error);
    }
};
// 初期プロンプトの読み込みと保存
const initializeDefaultPrompts = async () => {
    try {
        const existingPrompts = await DefaultPrompt.find();
        const promptsDir = path.join(__dirname, "defaultPrompts");
        const files = fs.readdirSync(promptsDir);
        const existingPromptNames = existingPrompts.map((prompt) => prompt.name);
        // 重複するプロンプトを削除
        await DefaultPrompt.deleteMany({ name: { $in: existingPromptNames } });
        let index = 0;
        for (const file of files) {
            if (file.endsWith(".txt")) {
                const content = fs.readFileSync(path.join(promptsDir, file), "utf-8");
                const name = path.basename(file, ".txt");
                await DefaultPrompt.create({
                    id: new mongoose.Types.ObjectId().toString(),
                    name,
                    content,
                    isFolder: false,
                    isToggleOpen: false,
                    isContentOpen: false,
                    parentId: "prompts",
                    index: index,
                });
                index++;
            }
        }
        console.log("\x1b[32mデフォルトプロンプトを初期化しました\x1b[0m");
    }
    catch (error) {
        console.error("\x1b[31mデフォルトプロンプトの初期化に失敗しました:\x1b[0m", error);
    }
};
// MongoDBに接続後、初期プロンプトを設定
mongoose.connect("mongodb://localhost:27017/editor_db").then(() => {
    initializePrompts();
    initializeDefaultPrompts();
});
// ルーターをマウント
app.use("/api/files", fileRoutes);
app.use("/api/prompts", promptRoutes);
app.use("/api/defaultPrompts", defaultPromptRoutes);
server.listen(PORT, () => {
    console.log(`\x1b[32mサーバーが起動しました\x1b[0m`);
});
