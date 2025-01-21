import WebSocket from "ws";
import dotenv from "dotenv";
import { Buffer } from "buffer";
import { buffer } from "stream/consumers";

dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

export class OpenAIService {
	public ws: WebSocket | null = null;
	public initialized: boolean;
	public onTextResponse: ((text: string) => void) | null;
	public onTextDoneResponse: (() => void) | null;
	public onAudioResponse: ((audio: Uint8Array) => void) | null;
	public onAudioDoneResponse: (() => void) | null;
	private callbackTextQueue: string[] = [];
	private callbackAudioQueue: Uint8Array[] = [];
	private isProcessingTextQueue: boolean = false;
	private isProcessingAudioQueue: boolean = false;
	private responseAudioBuffer: Uint8Array = new Uint8Array(0);
	private isTextResponseComplete: boolean = false;

	constructor() {
		this.initialized = false; // 初期化状態を追跡
		this.onTextResponse = null; // テキストレスポンス用コールバック
		this.onTextDoneResponse = null; // テキスト完了用コールバック
		this.onAudioResponse = null; // 音声レスポンス用コールバック
		this.onAudioDoneResponse = null; // 音声完了用コールバック
		this.responseAudioBuffer = new Uint8Array(0);
		this.initialize();
	}

	setTextCallback(callback: (text: string) => void) {
		this.onTextResponse = (text: string) => {
			this.callbackTextQueue.push(text);
			this.processTextQueue(callback);
		};
	}

	setAudioCallback(callback: (audio: Uint8Array) => void) {
		this.onAudioResponse = (audio: Uint8Array) => {
			this.callbackAudioQueue.push(audio);
			this.processAudioQueue(callback);
		};
	}

	private processTextQueue(callback: (text: string) => void) {
		if (this.isProcessingTextQueue) return;
		this.isProcessingTextQueue = true;

		const processNext = () => {
			if (this.callbackTextQueue.length > 0) {
				const text = this.callbackTextQueue.shift();
				if (text) {
					callback(text);
				}
				setTimeout(processNext, 50);
			} else {
				this.isProcessingTextQueue = false;
				if (this.isTextResponseComplete && this.onTextDoneResponse) {
					this.onTextDoneResponse();
					this.isTextResponseComplete = false;
				}
			}
		};

		processNext();
	}

	private processAudioQueue(callback: (audio: Uint8Array) => void) {
		if (this.isProcessingAudioQueue) return;
		this.isProcessingAudioQueue = true;

		const processNext = () => {
			if (this.callbackAudioQueue.length > 0) {
				const audio = this.callbackAudioQueue.shift();
				if (audio) {
					callback(audio);
				}
				setTimeout(processNext, 10); // 0.05秒ごとに次のコールバックを実行
			} else {
				this.isProcessingAudioQueue = false;
			}
		};

		processNext();
	}

	setTextDoneCallback(callback: () => void) {
		this.onTextDoneResponse = callback;
	}

	setAudioDoneCallback(callback: () => void) {
		this.onAudioDoneResponse = callback;
	}

	async initialize() {
		if (this.initialized) return;
		console.log("\x1b[34minitialize\x1b[0m");

		const url =
			"wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17";

		return new Promise((resolve, reject) => {
			this.ws = new WebSocket(url, {
				headers: {
					Authorization: `Bearer ${OPENAI_API_KEY}`,
					"OpenAI-Beta": "realtime=v1",
				},
			});

			this.ws.on("open", () => {
				console.log("\x1b[32mConnected to OpenAI Realtime API\x1b[0m");
				// セッション設定を送信
				const sessionConfig = {
					type: "session.update",
					session: {
						turn_detection: null,
						modalities: ["text", "audio"],
						input_audio_format: "pcm16",
						output_audio_format: "pcm16",
						input_audio_transcription: { model: "whisper-1" },
						instructions:
							"あなたは優秀なアシスタントです。敬語を使って日本語で丁寧に答えてください。",
						tool_choice: "none", // オプション：function callingを使用する場合に必要
						voice: "alloy", // 利用可能なオプション: alloy, ash, ballad, coral, echo, sage, shimmer, verse
						temperature: 0.8, // 0.6 から 1.2 の間
						tools: [],
					},
				};
				if (this.ws) {
					this.ws.send(JSON.stringify(sessionConfig));
				}
				this.initialized = true;
				resolve(true);
			});

			this.ws.on("message", (message: WebSocket.Data) => {
				const data = JSON.parse(message.toString());

				switch (data.type) {
					case "session.created":
						console.log("\x1b[32mSession created\x1b[0m");
						break;

					case "response.created":
						console.log("\x1b[32mResponse creation started\x1b[0m");
						break;

					case "response.text.delta":
						if (this.onTextResponse) {
							this.onTextResponse(data.delta);
						}
						break;

					case "response.text.done":
						console.log("\x1b[34mText done\x1b[0m");
						this.isTextResponseComplete = true;
						if (!this.isProcessingTextQueue && this.onTextDoneResponse) {
							this.onTextDoneResponse();
							this.isTextResponseComplete = false;
						}
						break;

					case "input_audio_buffer.append":
						console.log(
							"\x1b[32minput_audio_buffer.append\x1b[0m",
							data.audio.length
						);
						break;

					case "input_audio_buffer.debug":
						console.log(
							`\x1b[32mCurrent OpenAI buffer state: ${JSON.stringify(
								data,
								null,
								2
							)}\x1b[0m`
						);
						break;

					case "response.audio.delta":
						console.log(
							`\x1b[32mAudio delta received: ${data.delta.length} bytes\x1b[0m`
						);
						// const audioChunk = Buffer.from(data.delta, "base64");
						this.responseAudioBuffer = Buffer.concat([
							this.responseAudioBuffer,
							data.delta,
						]);
						break;

					case "response.audio.done":
						console.log(
							`\x1b[32mResponse Audio completed: ${this.responseAudioBuffer.length} bytes\x1b[0m`
						);
						// 完了時にバッファ全体を送信
						if (this.onAudioResponse && this.responseAudioBuffer.length > 0) {
							this.onAudioResponse(this.responseAudioBuffer);
							this.responseAudioBuffer = new Uint8Array(0);
						}
						break;

					case "error":
						console.error(
							`\x1b[31mServer error: ${JSON.stringify(data)}\x1b[0m`
						);
						break;

					default:
						console.info(`\x1b[33mUnhandled event type: ${data.type}\x1b[0m`);
				}
			});

			this.ws.on("error", (error) => {
				console.error(`\x1b[31mWebSocket error: ${error}\x1b[0m`);
				reject(error);
			});

			this.ws.on("close", () => {
				console.log("\x1b[31mWebSocket connection closed\x1b[0m");
				this.initialized = false;
			});
		});
	}

	async processTextInput(text: string) {
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
			if (this.ws) {
				this.ws.send(JSON.stringify(textMessage));
			}

			const responseRequest = {
				type: "response.create",
				response: {
					modalities: ["text"],
				},
			};
			if (this.ws) {
				this.ws.send(JSON.stringify(responseRequest));
			}
		} catch (error) {
			console.error(`\x1b[31mError processing text input: ${error}\x1b[0m`);
			throw error;
		}
	}

	async processVoiceInput(data: string) {
		try {
			console.log("\x1b[32mprocessVoiceInput\x1b[0m", data.length);
			if (this.ws) {
				const audioMessage = {
					type: "input_audio_buffer.append",
					audio: data,
				};
				this.ws.send(JSON.stringify(audioMessage));
			}
		} catch (error) {
			console.error(`\x1b[31mError processing voice input: ${error}\x1b[0m`);
			throw error;
		}
	}

	async commitAudioBuffer() {
		if (this.ws) {
			const commitMessage = {
				type: "input_audio_buffer.commit",
			};
			this.ws.send(JSON.stringify(commitMessage));

			const responseRequest = {
				type: "response.create",
				response: {
					modalities: ["text"], // テキストモダリティを指定
				},
			};
			this.ws.send(JSON.stringify(responseRequest));
		}
	}

	cleanup() {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
			console.log("\x1b[31mWebSocket connection closed\x1b[0m");
		}
	}
}

export default OpenAIService;
