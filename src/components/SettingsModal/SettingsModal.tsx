import React, { useState, useCallback, useEffect } from "react";
import styles from "@/components/SettingsModal/SettingsModal.module.scss";
import { Prompt } from "@/services/promptApi.js";
import { PromptsMenu } from "@/components/SettingsModal/PromptsMenu.js";
import { ThemeSettings } from "./ThemeSettings.js";
import PromptEditor from "./PromptEditor/PromptEditor.js";

type SettingsTab = "prompts" | "theme" | "openai";
type SettingsSubTab = string | null;

interface SettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	prompts: Prompt[];
	defaultPrompts: Prompt[];
	onSavePrompts: (prompts: Prompt[]) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
	isOpen,
	onClose,
	prompts,
	defaultPrompts,
	onSavePrompts,
}) => {
	const [activeTab, setActiveTab] = useState<SettingsTab>("prompts");
	const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>(null);
	const [expandedTabs, setExpandedTabs] = useState<string[]>(["prompts"]);
	const [localPrompts, setLocalPrompts] = useState<Prompt[]>(prompts);
	const [dirtyPrompts, setDirtyPrompts] = useState<Set<string>>(new Set());

	useEffect(() => {
		if (prompts.length > 0 && !activeSubTab) {
			setActiveSubTab(prompts[0].name);
			setLocalPrompts(prompts);
		}
	}, [prompts, activeSubTab]);

	const isCurrentPromptModified = useCallback(() => {
		const currentPrompt = localPrompts.find((p) => p.name === activeSubTab);
		const originalPrompt = prompts.find((p) => p.name === activeSubTab);
		return currentPrompt?.content !== originalPrompt?.content;
	}, [localPrompts, prompts, activeSubTab]);

	const handlePromptChange = (content: string) => {
		const newPrompts = localPrompts.map((prompt) =>
			prompt.name === activeSubTab ? { ...prompt, content } : prompt
		);
		setLocalPrompts(newPrompts);
		if (activeSubTab) {
			setDirtyPrompts((prev) => new Set(prev).add(activeSubTab));
		}
	};

	const handleSave = useCallback(() => {
		onSavePrompts(localPrompts);
		setDirtyPrompts(new Set());
	}, [localPrompts, onSavePrompts]);

	const handleReset = useCallback(() => {
		setLocalPrompts(defaultPrompts);
		setDirtyPrompts(new Set());
	}, [defaultPrompts]);

	const toggleTab = (tabId: string) => {
		setExpandedTabs((prev) =>
			prev.includes(tabId) ? prev.filter((t) => t !== tabId) : [...prev, tabId]
		);
	};

	if (!isOpen) return null;

	const handleOverlayClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	const renderContent = () => {
		switch (activeTab) {
			case "prompts":
				const currentPrompt = localPrompts.find((p) => p.name === activeSubTab);
				return currentPrompt ? (
					<PromptEditor
						content={currentPrompt.content}
						onContentChange={(content) => handlePromptChange(content)}
						onSave={handleSave}
						onReset={handleReset}
						isDirty={isCurrentPromptModified()}
					/>
				) : null;
			case "theme":
				return <ThemeSettings />;
			case "openai":
				return <div>OpenAI API設定（準備中）</div>;
			default:
				return null;
		}
	};

	return (
		<div className={styles.overlay} onClick={handleOverlayClick}>
			<div className={styles.modal}>
				<div className={styles.header}>
					<span>設定</span>
					<button className={styles.closeButton} onClick={onClose}>
						×
					</button>
				</div>
				<div className={styles.container}>
					<div className={styles.sidebar}>
						<PromptsMenu
							activeTab={activeTab}
							activeSubTab={activeSubTab}
							expandedTabs={expandedTabs}
							prompts={prompts}
							onTabToggle={(tabId) => {
								toggleTab(tabId);
								if (tabId === "prompts") setActiveTab("prompts");
							}}
							onPromptSelect={(promptId) => {
								setActiveSubTab(promptId);
								setActiveTab("prompts");
							}}
							dirtyPrompts={dirtyPrompts}
						/>
						<div
							className={`${styles.menuItem} ${
								activeTab === "theme" ? styles.active : ""
							}`}
							onClick={() => setActiveTab("theme")}
						>
							Theme
						</div>
						<div
							className={`${styles.menuItem} ${
								activeTab === "openai" ? styles.active : ""
							}`}
							onClick={() => setActiveTab("openai")}
						>
							OpenAI API
						</div>
					</div>
					<div className={styles.content}>{renderContent()}</div>
				</div>
			</div>
		</div>
	);
};

export default SettingsModal;
