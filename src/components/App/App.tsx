import React, { useState, useEffect, useCallback } from "react";
import ChatSidebar from "@/components/ChatSidebar/ChatSidebar.js";
import OpenAIService from "@/services/openai.js";
import Editor from "@/components/Editor/Editor.js";
import Sidebar from "@/components/Sidebar/Sidebar.js";
import styles from "./App.module.scss";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import {
	createFile,
	deleteFile,
	fetchFiles,
	updateFileName,
	updateFileContent,
	updateAllFiles,
	deleteAllFiles,
} from "@/services/api.js";
import {
	TreeItem,
	PromptType,
	FlattenedItem,
	TreeItems,
} from "@/types/CommonTypes.js";
import {
	fetchDefaultPrompts,
	fetchPrompts,
	updatePrompt,
} from "@/services/prompts.js";
import SettingsModal from "@/components/SettingsModal/SettingsModal/SettingsModal.js";
import { v4 as uuidv4 } from "uuid";
import { Header } from "@/components/Header/Header.js";
import { ContextMenu } from "@/components/common/ContextMenu.js";

const App: React.FC = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [loadingErrors, setLoadingErrors] = useState<string[]>([]);
	// 修正：複数エディタウィンドウに対応
	const [treeItems, setTreeItems] = useState<TreeItem[]>([]);
	const [files, setFiles] = useState<FlattenedItem[]>([]);
	const [prompts, setPrompts] = useState<PromptType[]>([]);
	const [defaultPrompts, setDefaultPrompts] = useState<PromptType[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isAutoCompletionEnabled, setIsAutoCompletionEnabled] = useState(false);
	const [contextMenuPosition, setContextMenuPosition] = useState<{
		x: number;
		y: number;
	} | null>(null);
	const [contextMenuItems, setContextMenuItems] = useState<
		{
			label: string;
			onClick: () => void;
		}[]
	>([]);
	const [chatMessages, setChatMessages] = useState<
		{ content: string; sender: string }[]
	>([]);
	const [processingChatMessageIndex, setProcessingChatMessageIndex] =
		useState<number>(0);
	const [openaiService, setOpenaiService] = useState<OpenAIService | null>(
		null
	);

	useEffect(() => {
		if (!openaiService) {
			setOpenaiService(new OpenAIService());
		}
	}, []);

	if (openaiService) {
		openaiService.textCallback = (text: string) => {
			console.log("textCallback", text, processingChatMessageIndex);
			if (processingChatMessageIndex > chatMessages.length) {
				setChatMessages((prev) => {
					return [...prev, { content: text, sender: "AI" }];
				});
			} else {
				setChatMessages((prev) => {
					const lastMessage = prev[prev.length - 1];
					if (lastMessage && lastMessage.sender === "AI") {
						return [
							...prev.slice(0, -1),
							{ content: lastMessage.content + text, sender: "AI" },
						];
					} else {
						return [...prev, { content: text, sender: "AI" }];
					}
				});
			}
		};
		openaiService.textDoneCallback = () => {
			console.log("textDoneCallback");
			setProcessingChatMessageIndex(chatMessages.length + 1);
		};
	}

	const handleSendMessage = async (message: string) => {
		try {
			setChatMessages((prev) => [
				...prev,
				{ content: message, sender: "User" },
			]);
			console.log("handleSendMessage", message);
			await openaiService.sendMessage(message);
		} catch (error) {
			console.error("メッセージの送信に失敗しました:", error);
		}
	};

	useEffect(() => {
		const loadPrompts = async () => {
			try {
				const prompts = await fetchPrompts();
				setPrompts(prompts);
			} catch (error) {
				console.error("プロンプトの読み込みに失敗しました:", error);
				setLoadingErrors((prev) => [
					...prev,
					"プロンプトの読み込みに失敗しました",
				]);
			}
		};
		const loadDefaultPrompts = async () => {
			try {
				const defaultPrompts = await fetchDefaultPrompts();
				setDefaultPrompts(defaultPrompts);
			} catch (error) {
				console.error("デフォルトプロンプトの読み込みに失敗しました:", error);
				setLoadingErrors((prev) => [
					...prev,
					"デフォルトプロンプトの読み込みに失敗しました",
				]);
			}
		};
		const loadFiles = async () => {
			try {
				const files = await fetchFiles();
				setFiles(files);
			} catch (error) {
				console.error("ファイルの読み込みに失敗しました:", error);
				setLoadingErrors((prev) => [
					...prev,
					"ファイルの読み込みに失敗しました",
				]);
			}
		};
		const loadAll = async () => {
			setIsLoading(true);
			await loadPrompts();
			await loadDefaultPrompts();
			await loadFiles();
			setIsLoading(false);
		};
		loadAll();
	}, []);

	const updateDirtyFiles = (fileId: string, isDirty: boolean) => {
		let file = files.find((file) => file.id === fileId);
		if (!file) return;
		setFiles(
			files.map((file) => {
				if (file.id === fileId) {
					return { ...file, isDirty };
				}
				return file;
			})
		);
		const hasChildrenDirty = (file: FlattenedItem): boolean => {
			const childrenIds = files
				.filter((f) => f.parentId === file.id)
				.map((f) => f.id);
			if (childrenIds.length === 0) return file.isDirty;
			return childrenIds.some((childId) => {
				const child = files.find((file) => file.id === childId);
				if (!child) return file.isDirty;
				return hasChildrenDirty(child);
			});
		};
		while (file.parentId) {
			const parentId = file.parentId;
			file = files.find((file) => file.id === parentId);
			if (!file) return;
			setFiles(
				files.map((file) => {
					if (file.id === fileId) {
						return { ...file, isDirty: hasChildrenDirty(file) };
					}
					return file;
				})
			);
		}
	};

	const handleFileToggle = (fileId: string) => {
		setFiles(
			files.map((file) =>
				file.id === fileId
					? {
							...file,
							isToggleOpen: !file.isToggleOpen,
					  }
					: file
			)
		);
	};

	const handleContentOpen = (fileId: string) => {
		console.log("handleContentOpen", fileId);
		setFiles(
			files.map((file) =>
				file.id === fileId
					? {
							...file,
							isContentOpen: true,
					  }
					: {
							...file,
							isContentOpen: false,
					  }
			)
		);
	};

	useEffect(() => {
		const rootItems = files.filter((file) => file.parentId === null);
		const childrenItems = (file: FlattenedItem): TreeItems => {
			if (!file.childrenIds || file.childrenIds.length === 0) return [];
			const children = files.filter((f) => file.childrenIds.includes(f.id));
			return children.map((child) => ({
				...child,
				children: childrenItems(child),
			}));
		};
		const treeItems = rootItems.map((file) => {
			return {
				...file,
				children: childrenItems(file),
			};
		});
		setTreeItems(treeItems);
	}, [files]);

	const handleCreateFile = async (parentId: string, isFolder: boolean) => {
		console.log("createFile", parentId, isFolder);
		const existingFileNames = files.map((file) => file.name);
		let newFileName = "新規ファイル";
		let counter = 1;
		while (existingFileNames.includes(newFileName)) {
			newFileName = `新規ファイル(${counter})`;
			counter++;
		}
		const newFile = {
			id: uuidv4(),
			name: newFileName,
			parentId: parentId,
			childrenIds: [],
			content: "",
			isDirty: false,
			isToggleOpen: false,
			isContentOpen: false,
			depth: 0,
			index: 0,
		};
		setFiles(
			files.map((file) => {
				if (file.id === parentId) {
					return { ...file, childrenIds: [...file.childrenIds, newFile.id] };
				}
				return file;
			})
		);
		setFiles([...files, newFile]);
	};

	const handleUpdateFile = async (id: string, content: string) => {
		console.log("%cupdateFile " + id + " " + content, "color: green;");
		setFiles(
			files.map((f) => {
				if (f.id === id) {
					console.log("updateFile", f.id, content);
					return { ...f, content, isDirty: true };
				}
				return f;
			})
		);
		console.log(files);
		// updateDirtyFiles(id, true);
	};

	const handleUpdatePrompt = async (id: string, content: string) => {
		console.log("updatePrompt", id, content);
		const updatedPrompt = prompts.find((prompt) => prompt.id === id);
		if (!updatedPrompt) return;
		setPrompts(
			prompts.map((prompt) =>
				prompt.id === id ? { ...prompt, content } : prompt
			)
		);
	};

	const handleSaveFile = async (id: string) => {
		console.log("%csaveFile " + id, "color: green;");
		const file = files.find((f) => f.id === id);
		if (!file) return;
		await updateFileContent(id, file.content);
	};

	const handleSavePrompt = async (id: string) => {
		console.log("savePrompt", id);
		const prompt = prompts.find((p) => p.id === id);
		if (!prompt) return;
		await updatePrompt(id, prompt.content);
	};

	const handleInitiate = async () => {
		setFiles([]);
		await deleteAllFiles();
	};

	const handleContextMenu = (event: React.MouseEvent) => {
		event.preventDefault();
		setContextMenuPosition({ x: event.clientX, y: event.clientY });
	};

	const handleCloseContextMenu = () => {
		setContextMenuPosition(null);
	};

	const openedFile = files.find((file) => file.isContentOpen);

	return (
		<div className={styles.container}>
			<Header setIsModalOpen={setIsModalOpen} />
			{isLoading && <div className={styles.loading}>Loading...</div>}
			{loadingErrors.length > 0 && (
				<div className={styles.error}>{loadingErrors.join("\n")}</div>
			)}
			<div className={styles.mainSection}>
				<Sidebar
					treeItems={treeItems}
					// activeFileId={openedFile?.id.toString()}
					// handleFileToggle={handleFileToggle}
					handleContentOpen={handleContentOpen}
					handleCreateFile={handleCreateFile}
					// handleRenameFile={handleRenameFile}
					// handleDeleteFile={handleDeleteFile}
					setTreeItems={setTreeItems}
					setContextMenuItems={setContextMenuItems}
					handleContextMenu={handleContextMenu}
					handleCloseContextMenu={handleCloseContextMenu}
				/>
				<Editor
					content={openedFile?.content ?? ""}
					onContentChange={(content) =>
						handleUpdateFile(openedFile?.id.toString() ?? "", content)
					}
					systemPrompts={prompts}
					files={files}
					currentFileName={openedFile?.name ?? ""}
					onSave={() => handleSaveFile(openedFile?.id.toString() ?? "")}
					isDirty={openedFile?.isDirty ?? false}
					isAutoCompletionEnabled={isAutoCompletionEnabled}
					setIsAutoCompletionEnabled={setIsAutoCompletionEnabled}
				/>
				<ChatSidebar
					messages={chatMessages}
					onSendMessage={handleSendMessage}
					openaiService={openaiService}
				/>
			</div>
			{isModalOpen && (
				<SettingsModal
					onClose={() => setIsModalOpen(false)}
					prompts={prompts}
					defaultPrompts={defaultPrompts}
					handleUpdatePrompt={handleUpdatePrompt}
					handleSavePrompt={handleSavePrompt}
					handleInitiate={handleInitiate}
				/>
			)}
			{contextMenuPosition && (
				<ContextMenu
					items={contextMenuItems}
					position={contextMenuPosition}
					onClose={handleCloseContextMenu}
				/>
			)}
		</div>
	);
};

export default App;
