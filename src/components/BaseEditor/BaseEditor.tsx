import React, { useRef, useEffect, useCallback } from "react";
import styles from "./BaseEditor.module.scss";

interface BaseEditorProps {
	content: string;
	onContentChange: (content: string) => void;
	onSave: () => void;
	onReset: () => void;
	isDirty: boolean;
}

const BaseEditor: React.FC<BaseEditorProps> = ({
	content,
	onContentChange,
	onSave,
	onReset,
	isDirty,
}) => {
	const MAX_HISTORY = 100;
	const editorRef = useRef<HTMLDivElement>(null);
	const historyRef = useRef<string[]>([]);
	const historyIndexRef = useRef<number>(-1);
	const tempContentRef = useRef<string>("");

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
		if (editorRef.current && editorRef.current.textContent !== content) {
			const savedRange = saveCaretPosition();
			editorRef.current.textContent = content;
			restoreCaretPosition(savedRange);
		}
	}, [content]);

	const handleInput = useCallback(async () => {
		const newContent = editorRef.current?.textContent || "";
		await onContentChange(newContent, category as FileCategory);
		tempContentRef.current = newContent;
	}, [category, onContentChange]);

	const handleSave = useCallback(() => {
		// 現在の内容を履歴に追加
		const newHistory = [
			...historyRef.current.slice(0, historyIndexRef.current + 1),
			tempContentRef.current,
		];
		if (newHistory.length > MAX_HISTORY) {
			newHistory.shift();
		}
		historyRef.current = newHistory;
		historyIndexRef.current = Math.min(
			historyRef.current.length - 1,
			MAX_HISTORY - 1
		);

		onSave();
	}, [onSave]);

	const handleReset = useCallback(() => {
		// リセット前の内容を履歴に追加
		const newHistory = [
			...historyRef.current.slice(0, historyIndexRef.current + 1),
			tempContentRef.current,
		];
		if (newHistory.length > MAX_HISTORY) {
			newHistory.shift();
		}
		historyRef.current = newHistory;
		historyIndexRef.current = Math.min(
			historyRef.current.length - 1,
			MAX_HISTORY - 1
		);

		onReset();
	}, [onReset]);

	useEffect(() => {
		const handleKeyDown = async (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "s") {
				e.preventDefault();
				handleSave();
			}

			// Enterキーで履歴を保存
			if (e.key === "Enter") {
				const newHistory = [
					...historyRef.current.slice(0, historyIndexRef.current + 1),
					tempContentRef.current,
				];
				if (newHistory.length > MAX_HISTORY) {
					newHistory.shift();
				}
				historyRef.current = newHistory;
				historyIndexRef.current = Math.min(
					historyRef.current.length - 1,
					MAX_HISTORY - 1
				);
			}

			// Undo
			if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "z") {
				e.preventDefault();
				if (historyIndexRef.current > 0) {
					historyIndexRef.current--;
					const previousContent = historyRef.current[historyIndexRef.current];
					if (editorRef.current && previousContent !== undefined) {
						editorRef.current.textContent = previousContent;
						await onContentChange(previousContent, category as FileCategory);
					}
				}
			}

			// Redo
			if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "z") {
				e.preventDefault();
				if (historyIndexRef.current < historyRef.current.length - 1) {
					historyIndexRef.current++;
					const nextContent = historyRef.current[historyIndexRef.current];
					if (editorRef.current && nextContent !== undefined) {
						editorRef.current.textContent = nextContent;
						await onContentChange(nextContent, category as FileCategory);
					}
				}
			}
		};

		const editor = editorRef.current;
		editor?.addEventListener("keydown", handleKeyDown);

		return () => {
			editor?.removeEventListener("keydown", handleKeyDown);
		};
	}, [category, onContentChange, handleSave]);

	return (
		<div className={styles.editor}>
			<div
				ref={editorRef}
				contentEditable
				className={styles["content-editable"]}
				onInput={handleInput}
			/>
			<button
				className={`${styles.saveButton} ${styles.button}`}
				onClick={handleSave}
			>
				保存
			</button>
			<button
				className={`${styles.resetButton} ${styles.button}`}
				onClick={handleReset}
			>
				初期値に戻す
			</button>
		</div>
	);
};

export default BaseEditor;
