import { useBlockNoteEditor, useComponentsContext } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import React from "react";
import { FileCategory } from "@/types/File.js";
import { Prompt } from "@/services/promptApi.js";
import { FileData } from "@/types/File.js";
import { getCompletion, findRelatedContents } from "@/services/openai.js";
import { Block } from "@blocknote/core";

interface AiRewriteProps {
	isRAG: boolean;
	category: FileCategory;
	systemPrompts: Prompt[];
	allFiles: FileData[];
	currentFileName: string;
	removeAiCompletion: () => void;
	setIsLoading: (isLoading: boolean) => void;
	originalContentRef: React.MutableRefObject<string>;
}

// Custom Formatting Toolbar Button to toggle blue text & background color.
export function AiRewrite({
	isRAG,
	category,
	systemPrompts,
	allFiles,
	currentFileName,
	removeAiCompletion,
	setIsLoading,
	originalContentRef,
}: AiRewriteProps) {
	const editor = useBlockNoteEditor();

	const Components = useComponentsContext()!;

	async function aiRewrite(inputText: string) {
		if (!editor) return;
		removeAiCompletion();
		setIsLoading(true);
		const entireText = await editor.blocksToMarkdownLossy(editor.document);

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
				(prompt) => prompt.name === `rewrite_${category}`
			);

			if (!systemPrompt) {
				console.error("System prompt not found");
				setIsLoading(false);
				return;
			}

			console.log("%cAI修正 開始", "color: blue");
			const result = await getCompletion(
				currentFileName,
				"書き換える部分:" + inputText + "\n" + "文章全体:" + entireText,
				systemPrompt,
				relatedContents
			);
			console.log("%cAI修正 終了", "color: green");
			return result;
		} catch (error) {
			console.error("Completion error:", error);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Components.FormattingToolbar.Button
			mainTooltip={"自動修正を生成"}
			onClick={async () => {
				const selectedText = editor.getSelectedText();
				const selectedBlock = editor.getSelection()?.blocks[0];
				const contents = selectedBlock?.content;
				let i = 0;
				const result = await aiRewrite(selectedText);
				while (contents[i]) {
					if (contents[i].text.includes(selectedText)) {
						contents[i].text = contents[i].text.replace(selectedText, result);
					}
					i++;
				}
				editor.updateBlock(selectedBlock, { content: contents });
			}}
			isSelected={true}
		>
			自動修正
		</Components.FormattingToolbar.Button>
	);
}
