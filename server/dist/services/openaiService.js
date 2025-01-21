import WebSocket from "ws";
import logger from "../utils/logger.js";
import dotenv from "dotenv";
dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
class OpenAIService {
    ws;
    initialized;
    onTextResponse;
    constructor() {
        this.ws = null;
        this.initialized = false; // 初期化状態を追跡
        this.onTextResponse = null; // テキストレスポンス用コールバック
    }
    // コールバック設定メソッドを追加
    setTextCallback(callback) {
        this.onTextResponse = callback;
    }
    async initialize() {
        if (this.initialized)
            return; // 重複初期化を防ぐ
        const url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17";
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(url, {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    "OpenAI-Beta": "realtime=v1",
                },
            });
            this.ws.on("open", () => {
                logger.info("Connected to OpenAI Realtime API");
                // セッション設定を送信
                const sessionConfig = {
                    type: "session.update",
                    session: {
                        turn_detection: { type: "server_vad" },
                        modalities: ["text", "audio"],
                        input_audio_format: "pcm16",
                        output_audio_format: "pcm16",
                        input_audio_transcription: { model: "whisper-1" },
                        instructions: "あなたは優秀なアシスタントです。敬語を使って日本語で丁寧に答えてください。",
                        tool_choice: "none", // オプション：function callingを使用する場合に必要
                        voice: "alloy", // 利用可能なオプション: alloy, ash, ballad, coral, echo, sage, shimmer, verse
                        temperature: 0.8, // 0.6 から 1.2 の間
                        tools: [],
                    },
                };
                if (this.ws) {
                    this.ws.send(JSON.stringify(sessionConfig));
                }
                logger.info(`Sent session config: ${JSON.stringify(sessionConfig, null, 2)}`);
                this.initialized = true;
                resolve(true);
            });
            this.ws.on("message", (message) => {
                const data = JSON.parse(message.toString());
                switch (data.type) {
                    case "session.created":
                        logger.info("Session created");
                        break;
                    case "response.created":
                        logger.info(`\x1b[32mResponse creation started\x1b[0m`);
                        logger.info(JSON.stringify(data, null, 4));
                        break;
                    case "response.text.delta":
                        logger.info(`\x1b[32mText delta\x1b[0m`);
                        logger.info(JSON.stringify(data, null, 4));
                        if (this.onTextResponse) {
                            this.onTextResponse(data.delta);
                        }
                        break;
                    case "response.text.done":
                        logger.info(`\x1b[32mText done\x1b[0m`);
                        logger.info(JSON.stringify(data, null, 4));
                        break;
                    case "error":
                        logger.error(`Server error: ${JSON.stringify(data)}`);
                        break;
                    default:
                        logger.info(`Unhandled event type: ${data.type}`);
                }
            });
            this.ws.on("error", (error) => {
                logger.error(`WebSocket error: ${error}`);
                reject(error);
            });
            this.ws.on("close", () => {
                logger.info("WebSocket connection closed");
                this.initialized = false;
            });
        });
    }
    async processTextInput(text) {
        try {
            const textMessage = {
                type: "conversation.item.create",
                item: {
                    type: "message",
                    role: "user",
                    content: [
                        {
                            type: "input_text",
                            text: text,
                        },
                    ],
                },
            };
            console.log("\x1b[32mtextMessage\x1b[0m", textMessage);
            console.log("\x1b[32mthis.ws\x1b[0m", this.ws);
            if (this.ws) {
                this.ws.send(JSON.stringify(textMessage));
            }
            // テキストのみのレスポンスを要求
            const responseRequest = {
                type: "response.create",
                response: {
                    modalities: ["text"], // ここでテキストのみを指定
                },
            };
            if (this.ws) {
                this.ws.send(JSON.stringify(responseRequest));
            }
        }
        catch (error) {
            logger.error(`Error processing text input: ${error}`);
            throw error;
        }
    }
    cleanup() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            logger.info("WebSocket connection closed");
        }
    }
}
export default OpenAIService;
