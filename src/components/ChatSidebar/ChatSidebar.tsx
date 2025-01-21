import React, { useState, useEffect, useRef } from "react";
import {
	MainContainer,
	ChatContainer,
	MessageList,
	Message,
	MessageInput,
	TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./ChatSidebar.css";
import { OpenAIService } from "@/services/openai.js";
import { makeAutoObservable } from "mobx";

class AudioQueueManager {
	audioQueue: Int16Array[] = [];
	isPlaying = false;
	pitchFactor = 0.6;

	constructor() {
		makeAutoObservable(this);
	}

	setPitchFactor(factor: number) {
		this.pitchFactor = factor;
	}

	addAudioToQueue(audioData: Int16Array) {
		this.audioQueue.push(audioData);
		this.playNext();
	}

	async playNext() {
		if (this.isPlaying || this.audioQueue.length === 0) return;

		this.isPlaying = true;
		const audioData = this.audioQueue.shift();
		if (audioData) {
			await this.playAudio(audioData);
		}
		this.isPlaying = false;
		this.playNext();
	}

	playAudio(audioBuffer: Int16Array): Promise<void> {
		return new Promise((resolve) => {
			const audioContext = new AudioContext();
			const float32Array = new Float32Array(audioBuffer.length);

			for (let i = 0; i < audioBuffer.length; i++) {
				float32Array[i] = audioBuffer[i] / 0x7fff;
			}

			const audioBufferObj = audioContext.createBuffer(
				1,
				float32Array.length,
				audioContext.sampleRate
			);
			audioBufferObj.copyToChannel(float32Array, 0);

			const source = audioContext.createBufferSource();
			source.buffer = audioBufferObj;
			source.playbackRate.value = this.pitchFactor;
			source.connect(audioContext.destination);

			source.onended = () => {
				resolve();
			};

			source.start(0);
		});
	}
}

interface ChatSidebarProps {
	messages: { content: string; sender: string; audio?: Int16Array }[];
	onSendMessage: (message: string) => void;
	openaiService?: OpenAIService;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
	messages,
	onSendMessage,
	openaiService,
}) => {
	const [isTyping, setIsTyping] = useState(false);
	const [isRecording, setIsRecording] = useState(false);
	const processorRef = useRef<ScriptProcessorNode | null>(null);
	const audioQueueManager = useRef(new AudioQueueManager());
	const [isVadMode, setIsVadMode] = useState(false);

	useEffect(() => {
		const latestMessage = messages[messages.length - 1];
		if (latestMessage?.audio) {
			audioQueueManager.current.addAudioToQueue(latestMessage.audio);
		}
	}, [messages]);

	useEffect(() => {
		if (openaiService) {
			openaiService.audioCallback = (base64Data: string) => {
				console.log("audioCallback", base64Data.length);
				// Base64文字列をInt16Arrayに変換
				const binaryString = atob(base64Data);
				const len = binaryString.length;
				const bytes = new Uint8Array(len);
				for (let i = 0; i < len; i++) {
					bytes[i] = binaryString.charCodeAt(i);
				}
				const int16Array = new Int16Array(bytes.buffer);

				// AudioQueueManagerに追加
				audioQueueManager.current.addAudioToQueue(int16Array);
			};
		}

		return () => {
			if (openaiService) {
				openaiService.audioCallback = null;
			}
		};
	}, [openaiService]);

	const startRecording = async () => {
		try {
			setIsRecording(true);
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					sampleRate: 16000,
					channelCount: 1,
					echoCancellation: true,
				},
			});

			const audioContext = new AudioContext({ sampleRate: 16000 });
			const source = audioContext.createMediaStreamSource(stream);
			const processor = audioContext.createScriptProcessor(4096, 1, 1);

			processor.onaudioprocess = (event) => {
				const audioData = event.inputBuffer.getChannelData(0);
				const int16Buffer = convertFloat32ToInt16(audioData);
				openaiService?.sendVoiceData(
					new Blob([int16Buffer], { type: "audio/pcm" })
				);
			};

			source.connect(processor);
			processor.connect(audioContext.destination);
			processorRef.current = processor; // Store processor to stop later
		} catch (error) {
			console.error("録音開始時にエラーが発生しました:", error);
			setIsRecording(false);
		}
	};

	const stopRecording = () => {
		setIsRecording(false);
		if (processorRef.current) {
			openaiService?.commitAudioBuffer();
			processorRef.current.disconnect();
			processorRef.current = null;
		}
	};

	const stopRecordingWithoutCommit = () => {
		setIsRecording(false);
		if (processorRef.current) {
			processorRef.current.disconnect();
			processorRef.current = null;
		}
	};

	const convertFloat32ToInt16 = (buffer: Float32Array): ArrayBuffer => {
		let l = buffer.length;
		const buf = new Int16Array(l);
		while (l--) {
			buf[l] = Math.min(1, buffer[l]) * 0x7fff;
		}
		return buf.buffer;
	};

	const handlePushToTalkToggle = () => {
		if (isRecording) {
			stopRecording();
		} else {
			startRecording();
		}
	};

	const handleVadModeChange = () => {
		openaiService?.vadModeChange(!isVadMode);
		setIsVadMode(!isVadMode);
		if (isRecording) {
			stopRecordingWithoutCommit();
		} else {
			startRecording();
		}
	};

	return (
		<div className="chat-sidebar">
			<MainContainer>
				<ChatContainer>
					<MessageList
						typingIndicator={
							isTyping ? (
								<TypingIndicator
									content={`${messages[messages.length - 1].sender}が入力中...`}
								/>
							) : null
						}
					>
						{messages.map((msg, index) => (
							<Message
								key={index}
								model={{
									message: msg.content,
									sentTime: "just now",
									sender: msg.sender,
									direction: msg.sender === "User" ? "outgoing" : "incoming",
									position: "single",
								}}
							/>
						))}
					</MessageList>
					<MessageInput
						placeholder="メッセージを入力..."
						onSend={onSendMessage}
						sendButton={true}
						attachButton={false}
					/>
				</ChatContainer>
			</MainContainer>
			<div className="push-to-talk-button-container">
				<button
					onMouseDown={isVadMode ? null : handlePushToTalkToggle}
					onMouseUp={isVadMode ? null : handlePushToTalkToggle}
					className="push-to-talk-button"
					style={{
						backgroundColor: isRecording || isVadMode ? "#666" : "#444",
					}}
				>
					{isRecording || isVadMode ? "音声認識中..." : "押下で音声入力"}
				</button>
				<div
					className={`recording-indicator ${isVadMode ? "active" : ""}`}
					onClick={handleVadModeChange}
				/>
			</div>
		</div>
	);
};

export default ChatSidebar;
