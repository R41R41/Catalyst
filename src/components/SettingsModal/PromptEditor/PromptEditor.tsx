import React from "react";
import BaseEditor from "../../BaseEditor/BaseEditor.js";
import styles from "./PromptEditor.module.scss";

interface PromptEditorProps {
	content: string;
	onContentChange: (content: string) => void;
	onSave: () => void;
	onReset: () => void;
	isDirty: boolean;
}

const PromptEditor: React.FC<PromptEditorProps> = ({
	content,
	onContentChange,
	onSave,
	onReset,
	isDirty,
}) => {
	const handleContentChange = (newContent: string) => {
		onContentChange(newContent);
	};

	return (
		<div className={styles.promptEditor}>
			<BaseEditor
				content={content}
				category="prompt"
				onContentChange={(content) => handleContentChange(content)}
				onSave={onSave}
				onReset={onReset}
				isDirty={isDirty}
			/>
		</div>
	);
};

export default PromptEditor;
