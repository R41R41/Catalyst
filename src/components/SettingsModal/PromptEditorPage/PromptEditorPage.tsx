import React, { useRef, useEffect, useCallback } from "react";
import styles from "./PromptEditorPage.module.scss";
import { ToggleItemType } from "@/types/CommonTypes.js";

interface PromptEditorPageProps {
	toggleItems: ToggleItemType[];
	handleUpdatePrompt: (promptId: string, content: string) => void;
	handleSavePrompt: (promptId: string) => void;
	handleReset: (promptId: string) => void;
}

export const PromptEditorPage: React.FC<PromptEditorPageProps> = ({
	toggleItems,
	handleUpdatePrompt,
	handleSavePrompt,
	handleReset,
}) => {
	const prompt = toggleItems.find((item) => item.isContentOpen);
	const MAX_HISTORY = 100;
	const editorRef = useRef<HTMLDivElement>(null);
	const historyRef = useRef<string[]>([]);
	const historyIndexRef = useRef<number>(-1);
	const tempContentRef = useRef<string>("");
	console.log("%c toggleItems", "color: blue", toggleItems);
	console.log("%c prompt", "color: red", prompt);

	const saveCaretPosition = () => {
		const selection = window.getSelection();
		if (selection && selection.rangeCount > 0) {
			return selection.getRangeAt(0);
		}
		return null;
	};

	const restoreCaretPosition = (range: Range | null) => {
		if (range) {
			const selection = window.getSelection();
			selection?.removeAllRanges();
			selection?.addRange(range);
		}
	};

	useEffect(() => {
		if (
			editorRef.current &&
			editorRef.current.textContent !== prompt?.content
		) {
			const savedRange = saveCaretPosition();
			editorRef.current.textContent = prompt?.content;
			restoreCaretPosition(savedRange);
		}
	}, [prompt?.content]);

	const handleInput = useCallback(async () => {
		const newContent = editorRef.current?.textContent || "";
		await handleUpdatePrompt(prompt?.id, newContent);
		tempContentRef.current = newContent;
	}, [prompt?.id, handleUpdatePrompt]);

	return (
		<div className={styles.promptEditor}>
			<div
				ref={editorRef}
				contentEditable
				className={styles.contentEditable}
				onInput={handleInput}
			/>
			<button
				className={`${styles.saveButton} ${styles.button}`}
				onClick={() => handleSavePrompt(prompt?.id)}
			>
				保存
			</button>
			<button
				className={`${styles.resetButton} ${styles.button}`}
				onClick={() => handleReset(prompt?.id)}
			>
				初期値に戻す
			</button>
		</div>
	);
};
