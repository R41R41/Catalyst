import "@blocknote/core/fonts/inter.css";
import {
	useBlockNote,
	useCreateBlockNote,
	BasicTextStyleButton,
	BlockTypeSelect,
	ColorStyleButton,
	CreateLinkButton,
	FileCaptionButton,
	FileReplaceButton,
	FormattingToolbar,
	FormattingToolbarController,
	NestBlockButton,
	TextAlignButton,
	UnnestBlockButton,
} from "@blocknote/react";
import {
	BlockNoteSchema,
	defaultInlineContentSpecs,
	Block,
} from "@blocknote/core";
import "@blocknote/mantine/style.css";
import { BlockNoteView } from "@blocknote/mantine";
import "./Editor.css";
import React, { useEffect, useRef, useCallback, useState } from "react";
import { getCompletion, findRelatedContents } from "@/services/openai.js";
import { Prompt } from "@/services/promptApi.js";
import { FileCategory, FileData } from "@/types/File.js";
import completionTextSpec from "./AiCompletion.js";
import { Checkbox } from "@mui/material";
import { AiRewrite } from "./AiRewrite.js";

interface EditorProps {
	content: string;
	category: FileCategory;
	onContentChange: (content: string) => void;
	systemPrompts: Prompt[];
	allFiles: FileData[];
	currentFileName: string;
	onSave: () => void;
	isDirty: boolean;
	isAutoCompletionEnabled: boolean;
	setIsAutoCompletionEnabled: (isAutoCompletionEnabled: boolean) => void;
}
const Editor: React.FC<EditorProps> = ({
	content,
	category,
	onContentChange,
	systemPrompts,
	allFiles,
	currentFileName,
	onSave,
	isAutoCompletionEnabled,
	setIsAutoCompletionEnabled,
}) => {
	const schema = BlockNoteSchema.create({
		inlineContentSpecs: {
			// Adds all default inline content.
			...defaultInlineContentSpecs,
			// Adds the mention tag.
			aiCompletion: completionTextSpec,
		},
	});

	const editor = useCreateBlockNote({ schema });
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const originalContentRef = useRef<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [isRAG, setIsRAG] = useState(false);

	useEffect(() => {
		console.log("isAutoCompletionEnabled", isAutoCompletionEnabled);
		if (!isAutoCompletionEnabled) {
			setIsLoading(false);
		}
	}, [isAutoCompletionEnabled]);

	useEffect(() => {
		const loadContent = async () => {
			if (!editor || !currentFileName) return;
			const blocks = await editor.tryParseMarkdownToBlocks(content);
			editor.replaceBlocks(editor.document, blocks);
		};
		loadContent();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editor, currentFileName]);

	async function aiCompletion(readCursor: boolean, isSetTimeout: boolean) {
		if (!editor) return;
		const document = editor.document;
		const aiCompletionInlineContent = document.find((block) => {
			const content = block.content;
			let i = 0;
			let isAiCompletion = false;
			while (content[i] && !isAiCompletion) {
				if (content[i].type === "aiCompletion") {
					isAiCompletion = true;
				}
				i++;
			}
			return isAiCompletion;
		});
		if (aiCompletionInlineContent) return;
		setIsLoading(true);

		let inputText = "";
		let referenceBlock: Block;
		let Timeout = 0;
		if (isSetTimeout) {
			Timeout = 3000;
		}
		if (readCursor) {
			const cursorPosition = editor.getTextCursorPosition();
			inputText = cursorPosition.block.content[0]?.text;
			referenceBlock = cursorPosition.block as Block;
		} else {
			inputText = await editor.blocksToMarkdownLossy(editor.document);
			referenceBlock = editor.document[editor.document.length - 1] as Block;
		}
		console.log("inputText", inputText);
		console.log("referenceBlockContentText", referenceBlock.content[0]?.text);

		// 既存のタイマーをクリア
		if (timeoutRef.current) clearTimeout(timeoutRef.current);

		// 新しいタイマーをセット
		timeoutRef.current = setTimeout(async () => {
			try {
				if (!inputText) {
					setIsLoading(false);
					return;
				}
				originalContentRef.current = inputText;
				let relatedContents: string[] = [];
				if (isRAG) {
					console.log("%cRAG 開始", "color: blue");
					relatedContents = await findRelatedContents(
						currentFileName,
						inputText,
						allFiles
					);
					console.log("%cRAG 終了", "color: green");
				}

				const systemPrompt = systemPrompts.find(
					(prompt) => prompt.name === `predict_${category}`
				);

				if (!systemPrompt) {
					console.error("System prompt not found");
					setIsLoading(false);
					return;
				}

				console.log("%c補完生成 開始", "color: blue");
				const result = await getCompletion(
					currentFileName,
					inputText,
					systemPrompt,
					relatedContents
				);

				if (result && inputText === originalContentRef.current) {
					editor.focus();
					editor.insertBlocks(
						[
							{
								type: "paragraph",
								content: [
									{
										type: "aiCompletion",
										props: {
											text: result,
										},
									},
								],
							},
						],
						referenceBlock,
						"after"
					);
				}
				console.log("%c補完生成 終了", "color: green");
			} catch (error) {
				console.error("Completion error:", error);
			} finally {
				setIsLoading(false);
			}
		}, Timeout);
	}

	async function adoptAiCompletion(event: React.KeyboardEvent<HTMLDivElement>) {
		if (!editor) return;
		const document = editor.document;
		const aiCompletionBlock = document.find((block) => {
			const content = block.content;
			let i = 0;
			let isAiCompletion = false;
			while (content[i] && !isAiCompletion) {
				if (content[i].type === "aiCompletion") {
					isAiCompletion = true;
				}
				i++;
			}
			return isAiCompletion;
		});
		if (!aiCompletionBlock) return;
		event.preventDefault();
		const aiCompletionText = aiCompletionBlock.content[0].props.text;
		editor.updateBlock(aiCompletionBlock, {
			type: "paragraph",
			content: aiCompletionText,
		});
		const markdown = await editor.blocksToMarkdownLossy(editor.document);
		onContentChange(markdown);
	}

	async function removeAiCompletion() {
		if (!editor) return;
		const document = editor.document;
		const aiCompletionBlock = document.find((block) => {
			const content = block.content;
			let i = 0;
			let isAiCompletion = false;
			while (content[i] && !isAiCompletion) {
				if (content[i].type === "aiCompletion") {
					isAiCompletion = true;
				}
				i++;
			}
			return isAiCompletion;
		});
		if (!aiCompletionBlock) return;
		editor.removeBlocks([aiCompletionBlock]);
	}

	return (
		<div className="editor">
			<BlockNoteView
				editor={editor}
				formattingToolbar={false}
				onCompositionEnd={async (event) => {
					console.log("Composition End");
					const markdown = await editor.blocksToMarkdownLossy(editor.document);
					onContentChange(markdown);
				}}
				onKeyDown={(event) => {
					if ((event.ctrlKey || event.metaKey) && event.key === "s") {
						event.preventDefault();
						onSave();
						return true;
					}

					// Enterキーが押されたときの処理
					if (event.key === "Enter") {
						adoptAiCompletion(event);
					} else {
						removeAiCompletion();
					}
				}}
				onChange={async () => {
					if (isAutoCompletionEnabled) {
						await aiCompletion(true, true);
					}
				}}
			>
				<FormattingToolbarController
					formattingToolbar={() => (
						<FormattingToolbar>
							<BlockTypeSelect key={"blockTypeSelect"} />

							{/* Extra button to toggle blue text & background */}
							<AiRewrite
								key={"customButton"}
								category={category}
								systemPrompts={systemPrompts}
								allFiles={allFiles}
								currentFileName={currentFileName}
								isRAG={isRAG}
								removeAiCompletion={removeAiCompletion}
								setIsLoading={setIsLoading}
								originalContentRef={originalContentRef}
							/>

							<FileCaptionButton key={"fileCaptionButton"} />
							<FileReplaceButton key={"replaceFileButton"} />

							<BasicTextStyleButton
								basicTextStyle={"bold"}
								key={"boldStyleButton"}
							/>
							<BasicTextStyleButton
								basicTextStyle={"italic"}
								key={"italicStyleButton"}
							/>
							<BasicTextStyleButton
								basicTextStyle={"underline"}
								key={"underlineStyleButton"}
							/>
							<BasicTextStyleButton
								basicTextStyle={"strike"}
								key={"strikeStyleButton"}
							/>
							{/* Extra button to toggle code styles */}
							<BasicTextStyleButton
								key={"codeStyleButton"}
								basicTextStyle={"code"}
							/>

							<TextAlignButton
								textAlignment={"left"}
								key={"textAlignLeftButton"}
							/>
							<TextAlignButton
								textAlignment={"center"}
								key={"textAlignCenterButton"}
							/>
							<TextAlignButton
								textAlignment={"right"}
								key={"textAlignRightButton"}
							/>

							<ColorStyleButton key={"colorStyleButton"} />

							<NestBlockButton key={"nestBlockButton"} />
							<UnnestBlockButton key={"unnestBlockButton"} />

							<CreateLinkButton key={"createLinkButton"} />
						</FormattingToolbar>
					)}
				/>
			</BlockNoteView>
			<button
				className="completion-button"
				onClick={() => {
					removeAiCompletion();
					aiCompletion(false, false);
				}}
			>
				補完生成
				{isLoading && <div className="spinner"></div>}
			</button>
			<div className="button-container">
				<div className="RAG-Icon">
					<Checkbox
						checked={isRAG}
						onChange={() => setIsRAG(!isRAG)}
						style={{ margin: "0 4px 0 0", fontSize: "16px", color: "white" }}
					/>
					他ファイル参照
				</div>
				<div className="auto-completion-button">
					<Checkbox
						checked={isAutoCompletionEnabled}
						onChange={() =>
							setIsAutoCompletionEnabled(!isAutoCompletionEnabled)
						}
						style={{ margin: "0 4px 0 0", fontSize: "16px", color: "white" }}
					/>
					自動補完
				</div>
			</div>
		</div>
	);
};

export default Editor;
